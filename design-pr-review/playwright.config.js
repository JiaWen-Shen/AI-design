// Playwright config for design-pr-review wrapper smoke tests.
//
// Run order assumption: the developer (or a subagent dispatch) has already
// built a workspace + wrapper. The base URL points at whichever local server
// serve-compare.sh spun up. Each test reads SMOKE_WORKSPACE + SMOKE_CLUSTER
// + SMOKE_PORT env vars to know what to hit.
//
// First-time setup:
//   cd ~/.claude/skills/design-pr-review
//   npm install
//   npx playwright install --with-deps chromium
//
// Usage:
//   bash scripts/run-smoke.sh /tmp/design-review-282 sso-views-mixed
// (the runner script handles building + serving + invoking playwright).

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  reporter: [['list']],
  use: {
    headless: true,
    // base URL is set per-test via env so we can target whichever port
    // serve-compare.sh picked.
    permissions: ['clipboard-read', 'clipboard-write'],
    viewport: { width: 1440, height: 900 },
  },
});
