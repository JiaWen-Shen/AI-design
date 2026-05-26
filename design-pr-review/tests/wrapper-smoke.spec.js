// wrapper-smoke.spec.js — Layer-2 Playwright smoke against a live wrapper.
//
// Catches the UI-level bug classes that static checks in verify-wrapper.sh
// can't reach: anchor click flow, copy-to-clipboard behaviour, hover state
// contrast. Run via run-smoke.sh which builds + serves + invokes us.

const { test, expect } = require('@playwright/test');

const PORT = process.env.SMOKE_PORT || '8768';
const CLUSTER = process.env.SMOKE_CLUSTER || 'sso-views-mixed';
const URL = `http://127.0.0.1:${PORT}/compare-${CLUSTER}.html`;

test.describe('wrapper smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    // Wait for the IIFE to wire up and at least one toc card to be present.
    await page.waitForSelector('.toc-card', { timeout: 10_000 });
  });

  // Categorical: every anchor in the panel should be wired to SOMETHING.
  // The "no resolvable target" toast is the regression signal we want to
  // catch — historically it fired for null-line CSS anchors. After L1+L3
  // fixes it should never appear on a clean build.
  test('every panel anchor click has a resolvable target', async ({ page }) => {
    const anchors = await page.locator('.panel section.active .anchor').all();
    expect(anchors.length).toBeGreaterThan(0);
    const failures = [];
    for (let i = 0; i < anchors.length; i++) {
      const a = anchors[i];
      // Skip anchors that are inside collapsed <details> — clicking them
      // requires opening the parent first which is its own UX flow; the
      // important regression check is on visible anchors.
      const visible = await a.isVisible().catch(() => false);
      if (!visible) continue;
      const label = (await a.textContent().catch(() => '?')).trim().slice(0, 40);
      await a.click({ trial: false }).catch(() => {});
      const toastText = await page.locator('#toast').textContent().catch(() => '');
      if (/沒有可解析/.test(toastText) || /no resolvable/i.test(toastText)) {
        failures.push(`anchor "${label}" → "${toastText}"`);
      }
    }
    if (failures.length) {
      throw new Error('anchors with unresolvable target:\n  ' + failures.join('\n  '));
    }
  });

  // Hover state colour swap regression: when .anchor:hover flips bg to
  // var(--primary) (deep purple), the inner .css-rm/.css-add/.css-chg must
  // recolour to high-contrast container variants. If the override CSS is
  // dropped, the colour stays as the dark base and disappears against the
  // hover bg. Read computed colour against the swapped-on background.
  test('anchor hover keeps css-rm / css-add readable', async ({ page }) => {
    const target = page.locator('.panel section.active .anchor .css-rm, .panel section.active .anchor .css-add, .panel section.active .anchor .css-chg').first();
    if (await target.count() === 0) {
      test.skip(true, 'cluster has no CSS-summary anchors to test');
    }
    const anchor = target.locator('xpath=ancestor::button[contains(@class,"anchor")]').first();
    await anchor.hover();
    const { color, bg } = await target.evaluate((el) => {
      const cs = getComputedStyle(el);
      const anch = el.closest('.anchor');
      const ab = getComputedStyle(anch);
      return { color: cs.color, bg: ab.backgroundColor };
    });
    // Trivially assert the colours differ (caught the previous bug where
    // .css-rm dark-red on dark-purple bg was nearly identical). A proper
    // WCAG ratio check would be stricter; for smoke this catches the
    // collapsed-to-same-hue regression.
    expect(color).not.toBe(bg);
  });

  // 📋 ask-Claude button: click should populate the clipboard with a
  // markdown blob that has the expected shape. Catches regressions in
  // the prompt builder (e.g. missing PR header, dropped file path).
  test('📋 ask-Claude copies a well-formed context blob', async ({ page, context }) => {
    const btn = page.locator('.panel section.active .ask-claude').first();
    await expect(btn).toBeVisible();
    await btn.click();
    // Clipboard read needs the permission granted in playwright.config.
    const text = await page.evaluate(() => navigator.clipboard.readText());
    // Expect at least: a PR identifier line, a file/line/selector line.
    expect(text).toMatch(/^\[?(?:trendlife|PR\b)/);
    expect(text.length).toBeGreaterThan(20);
    // Toast confirms success.
    const toast = await page.locator('#toast').textContent();
    expect(toast).toContain('copy');
  });

  // Regression guard for the sync-scroll-cancels-smooth-scrollIntoView bug:
  // when bidirectional iframe sync is enabled, the first 2 px of a smooth
  // scrollIntoView fires a scroll event that round-trips back via the sync
  // handler and cancels the rest of the animation. Symptom: clicks "do
  // nothing" — iframe scrollTop moves a couple px and stops. This test
  // picks an anchor with a high line number, clicks it, and asserts the
  // iframe scrolled by a meaningful amount (>50 px). Without the fix,
  // scrollTop ends up at ~2.
  test('CSS anchor click actually scrolls the iframe to the target line', async ({ page }) => {
    // Switch to a file likely to have a CSS line anchor (style.css).
    const switched = await page.evaluate(() => {
      const cards = document.querySelectorAll('.toc-card');
      for (const c of cards) {
        if (c.dataset.file && c.dataset.file.endsWith('.css')) {
          c.click();
          return true;
        }
      }
      return false;
    });
    test.skip(!switched, 'cluster has no CSS file to test scroll behaviour on');
    await page.waitForTimeout(600);
    // Find an anchor whose line number is large enough that scrollIntoView
    // must move the iframe meaningfully (not a near-top no-op).
    const result = await page.evaluate(async () => {
      const anchors = Array.from(document.querySelectorAll('.panel section.active .anchor'));
      // Pick the highest-line-numbered anchor for the strongest signal.
      let best = null;
      for (const a of anchors) {
        const n = parseInt(a.dataset.line || '0', 10);
        if (Number.isFinite(n) && (!best || n > best.line)) best = { line: n, el: a };
      }
      if (!best) return { skipped: true };
      // Reset iframe scroll.
      const ifr = document.getElementById('right');
      ifr.contentDocument.scrollingElement.scrollTop = 0;
      best.el.click();
      await new Promise(r => setTimeout(r, 1000));
      return {
        line: best.line,
        scrollTop: ifr.contentDocument.scrollingElement.scrollTop,
      };
    });
    if (result.skipped) test.skip(true, 'no line anchors in active section');
    // Without the suppressSyncFor fix, scrollTop stays at ~2.
    expect(result.scrollTop, `L${result.line} click should scroll iframe substantially`).toBeGreaterThan(50);
  });

  // 📋 (header) feedback button: state capture should include current active file
  // and last anchor click after we interact.
  test('📋 (header) feedback button captures session state', async ({ page }) => {
    // Trigger an anchor click first so feedback has something to report.
    await page.locator('.panel section.active .anchor').first().click();
    await page.locator('#feedback-btn').click();
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain('design-pr-review feedback');
    expect(text).toContain('Active file:');
    expect(text).toContain('Last anchor click:');
    expect(text).toContain('Viewport:');
  });
});
