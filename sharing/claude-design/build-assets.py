"""Generate 4 filled-flat SVG diagrams and convert to PNG.

Palette (pulled from the existing TrendLife template):
  RED    #D71920  primary accent
  NAVY   #153241  primary text / outlines
  GRAY   #788086  secondary text
  LGT    #F4F6F7  light backgrounds
  WHITE  #FFFFFF

Run:
  DYLD_LIBRARY_PATH=/opt/homebrew/opt/cairo/lib python3 build-assets.py
"""
import os
import cairosvg

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "assets")
os.makedirs(OUT, exist_ok=True)

RED = "#D71920"
NAVY = "#153241"
GRAY = "#788086"
LGT = "#F4F6F7"
WHITE = "#FFFFFF"
SOFT_RED = "#FBE5E6"

W, H = 1600, 900  # 16:9

# ---------- A1 · GitHub vs Git ----------
a1 = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">
  <style>
    .title {{ font: 600 38px 'Inter','Helvetica Neue',Arial,sans-serif; fill: {NAVY}; }}
    .label {{ font: 700 26px 'Inter',Arial,sans-serif; fill: {NAVY}; letter-spacing: 2px; }}
    .sublabel {{ font: 500 22px 'Inter',Arial,sans-serif; fill: {GRAY}; }}
    .termtxt {{ font: 500 22px 'JetBrains Mono','Menlo',monospace; fill: #8FE8A8; }}
    .guitxt {{ font: 500 20px 'Inter',Arial,sans-serif; fill: {NAVY}; }}
  </style>
  <rect width="{W}" height="{H}" fill="{WHITE}"/>

  <!-- Row 1 headers -->
  <text class="label" x="300" y="90">CLI</text>
  <text class="label" x="1100" y="90">GUI</text>

  <!-- LEFT: Terminal panel (dark) -->
  <rect x="120" y="120" width="620" height="320" rx="14" fill="#0F1724"/>
  <!-- Window dots -->
  <circle cx="150" cy="150" r="7" fill="#FF5F57"/>
  <circle cx="172" cy="150" r="7" fill="#FEBC2E"/>
  <circle cx="194" cy="150" r="7" fill="#28C840"/>
  <text class="termtxt" x="150" y="210">$ git add .</text>
  <text class="termtxt" x="150" y="248">$ git commit -m "fix"</text>
  <text class="termtxt" x="150" y="286">$ git push origin main</text>
  <text class="termtxt" x="150" y="330" fill="#5B6B85">[main 3a4f1c] fix</text>
  <text class="termtxt" x="150" y="368" fill="#5B6B85">1 file changed</text>
  <!-- git label corner -->
  <rect x="630" y="400" width="90" height="30" rx="6" fill="{RED}"/>
  <text x="675" y="420" text-anchor="middle" font-family="Inter,Arial" font-size="16" font-weight="700" fill="{WHITE}">git</text>

  <!-- RIGHT: GUI panel (light) -->
  <rect x="860" y="120" width="620" height="320" rx="14" fill="{WHITE}" stroke="{NAVY}" stroke-width="3"/>
  <rect x="860" y="120" width="620" height="40" rx="14" fill="{LGT}"/>
  <rect x="860" y="150" width="620" height="10" fill="{LGT}"/>
  <circle cx="890" cy="140" r="7" fill="#FF5F57"/>
  <circle cx="912" cy="140" r="7" fill="#FEBC2E"/>
  <circle cx="934" cy="140" r="7" fill="#28C840"/>
  <!-- Commit list -->
  <circle cx="905" cy="200" r="14" fill="{RED}"/>
  <text class="guitxt" x="940" y="206">fix layout bug</text>
  <text class="guitxt" x="940" y="230" font-size="15" fill="{GRAY}">Karen · 2 min ago</text>
  <line x1="905" y1="214" x2="905" y2="260" stroke="{GRAY}" stroke-width="2"/>
  <circle cx="905" cy="270" r="14" fill="{NAVY}"/>
  <text class="guitxt" x="940" y="276">add header</text>
  <text class="guitxt" x="940" y="300" font-size="15" fill="{GRAY}">Karen · 1 hr ago</text>
  <!-- Push button -->
  <rect x="1180" y="380" width="260" height="50" rx="8" fill="{RED}"/>
  <text x="1310" y="412" text-anchor="middle" font-family="Inter,Arial" font-size="20" font-weight="700" fill="{WHITE}">Push to origin</text>
  <!-- octocat circle -->
  <circle cx="1440" cy="150" r="14" fill="{NAVY}"/>
  <circle cx="1435" cy="147" r="2.5" fill="{WHITE}"/>
  <circle cx="1445" cy="147" r="2.5" fill="{WHITE}"/>

  <!-- BIG arrow / approx -->
  <text x="800" y="300" text-anchor="middle" font-family="Inter,Arial" font-size="60" font-weight="300" fill="{GRAY}">≈</text>

  <!-- Row 2 headers -->
  <text class="label" x="170" y="530">CLAUDE CODE</text>
  <text class="label" x="950" y="530">CLAUDE DESIGN</text>

  <!-- Row 2 LEFT: Claude Code panel -->
  <rect x="120" y="560" width="620" height="280" rx="14" fill="#0F1724"/>
  <circle cx="150" cy="590" r="7" fill="#FF5F57"/>
  <circle cx="172" cy="590" r="7" fill="#FEBC2E"/>
  <circle cx="194" cy="590" r="7" fill="#28C840"/>
  <text class="termtxt" x="150" y="650">$ claude "design a pricing page"</text>
  <text class="termtxt" x="150" y="688" fill="#5B6B85">● Reading /App.jsx</text>
  <text class="termtxt" x="150" y="726" fill="#5B6B85">● Writing /Pricing.jsx</text>
  <text class="termtxt" x="150" y="770" fill="#8FE8A8">✓ preview at localhost:3000</text>

  <!-- Row 2 RIGHT: Claude Design canvas -->
  <rect x="860" y="560" width="620" height="280" rx="14" fill="{WHITE}" stroke="{NAVY}" stroke-width="3"/>
  <!-- chat sidebar -->
  <rect x="860" y="560" width="200" height="280" fill="{LGT}"/>
  <rect x="880" y="595" width="160" height="30" rx="15" fill="{WHITE}" stroke="{GRAY}" stroke-width="1"/>
  <rect x="880" y="635" width="160" height="44" rx="10" fill="{RED}"/>
  <text x="960" y="661" text-anchor="middle" font-family="Inter,Arial" font-size="14" fill="{WHITE}">design pricing page</text>
  <rect x="880" y="689" width="160" height="30" rx="15" fill="{WHITE}" stroke="{GRAY}" stroke-width="1"/>
  <!-- canvas preview (stacked cards) -->
  <rect x="1090" y="595" width="370" height="30" rx="6" fill="{LGT}"/>
  <rect x="1090" y="640" width="110" height="170" rx="8" fill="{SOFT_RED}"/>
  <rect x="1220" y="640" width="110" height="170" rx="8" fill="{LGT}" stroke="{NAVY}" stroke-width="2"/>
  <rect x="1350" y="640" width="110" height="170" rx="8" fill="{LGT}"/>

  <!-- arrow between row2 -->
  <text x="800" y="730" text-anchor="middle" font-family="Inter,Arial" font-size="60" font-weight="300" fill="{GRAY}">≈</text>
</svg>"""

# ---------- A2 · CLI vs GUI on-ramp ----------
a2 = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">
  <style>
    .label {{ font: 700 28px 'Inter',Arial,sans-serif; fill: {NAVY}; }}
    .path-label {{ font: 500 20px 'Inter',Arial,sans-serif; fill: {GRAY}; }}
    .persona {{ font: 600 24px 'Inter',Arial,sans-serif; fill: {WHITE}; }}
  </style>
  <rect width="{W}" height="{H}" fill="{WHITE}"/>

  <!-- Designer persona at left -->
  <circle cx="230" cy="450" r="90" fill="{NAVY}"/>
  <circle cx="230" cy="420" r="28" fill="{WHITE}"/>
  <path d="M 170 500 Q 230 470 290 500 L 290 540 L 170 540 Z" fill="{WHITE}"/>
  <text x="230" y="605" text-anchor="middle" class="label">Designer</text>

  <!-- Dimmed path (top) -->
  <line x1="340" y1="420" x2="780" y2="270" stroke="{GRAY}" stroke-width="3" stroke-dasharray="10,6"/>
  <rect x="780" y="220" width="440" height="160" rx="16" fill="{LGT}" stroke="{GRAY}" stroke-width="2"/>
  <!-- terminal mini -->
  <rect x="810" y="250" width="190" height="100" rx="8" fill="#0F1724"/>
  <circle cx="825" cy="268" r="4" fill="#FF5F57"/>
  <circle cx="837" cy="268" r="4" fill="#FEBC2E"/>
  <circle cx="849" cy="268" r="4" fill="#28C840"/>
  <text x="820" y="305" font-family="Menlo,monospace" font-size="14" fill="#8FE8A8">$ claude ...</text>
  <text x="820" y="328" font-family="Menlo,monospace" font-size="12" fill="#5B6B85">...</text>
  <text x="1030" y="280" class="label" fill="{GRAY}">Claude Code</text>
  <text x="1030" y="312" class="path-label">Steep learning curve</text>
  <text x="1030" y="340" class="path-label">CLI · Git · config files</text>

  <!-- Highlighted path (bottom) -->
  <line x1="340" y1="480" x2="780" y2="620" stroke="{RED}" stroke-width="6"/>
  <polygon points="775,610 800,625 775,635" fill="{RED}"/>
  <rect x="780" y="560" width="440" height="160" rx="16" fill="{SOFT_RED}" stroke="{RED}" stroke-width="3"/>
  <!-- GUI canvas mini -->
  <rect x="810" y="590" width="190" height="100" rx="8" fill="{WHITE}" stroke="{NAVY}" stroke-width="2"/>
  <rect x="810" y="590" width="60" height="100" rx="8" fill="{LGT}"/>
  <rect x="818" y="605" width="44" height="8" rx="4" fill="{RED}"/>
  <rect x="818" y="620" width="44" height="6" rx="3" fill="{GRAY}"/>
  <rect x="880" y="605" width="50" height="30" rx="4" fill="{LGT}"/>
  <rect x="940" y="605" width="50" height="30" rx="4" fill="{LGT}"/>
  <rect x="880" y="645" width="50" height="30" rx="4" fill="{LGT}"/>
  <rect x="940" y="645" width="50" height="30" rx="4" fill="{LGT}"/>
  <text x="1030" y="620" class="label" fill="{RED}">Claude Design</text>
  <text x="1030" y="652" class="path-label">Start here</text>
  <text x="1030" y="680" class="path-label">Canvas · chat · one-click export</text>

  <!-- Converge destination (far right) -->
  <rect x="1300" y="360" width="240" height="180" rx="16" fill="{NAVY}"/>
  <text x="1420" y="420" text-anchor="middle" font-family="Inter,Arial" font-size="22" font-weight="700" fill="{WHITE}">Same output</text>
  <text x="1420" y="460" text-anchor="middle" font-family="Inter,Arial" font-size="16" fill="{WHITE}">Prototype</text>
  <text x="1420" y="485" text-anchor="middle" font-family="Inter,Arial" font-size="16" fill="{WHITE}">Slide</text>
  <text x="1420" y="510" text-anchor="middle" font-family="Inter,Arial" font-size="16" fill="{WHITE}">One-pager</text>
  <!-- converge arrows -->
  <path d="M 1220 300 Q 1280 330 1300 420" fill="none" stroke="{GRAY}" stroke-width="2" stroke-dasharray="6,4"/>
  <path d="M 1220 640 Q 1280 570 1300 480" fill="none" stroke="{RED}" stroke-width="3"/>
</svg>"""

# ---------- A3 · Camera / Car analogy ----------
CJK = "'PingFang TC','Hiragino Sans TC','Noto Sans CJK TC','Microsoft JhengHei'"
a3 = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">
  <style>
    .pair-label {{ font: 600 22px 'Inter',Arial,{CJK},sans-serif; fill: {NAVY}; }}
    .pair-sub {{ font: 500 16px {CJK},'Inter',Arial,sans-serif; fill: {GRAY}; }}
    .caption {{ font: 500 24px 'Inter',Arial,sans-serif; fill: {NAVY}; }}
    .cap-em {{ font: 700 24px 'Inter',Arial,sans-serif; fill: {RED}; }}
  </style>
  <rect width="{W}" height="{H}" fill="{WHITE}"/>

  <!-- TOP ROW: Camera pair -->
  <!-- Left: Point-and-shoot (simple) -->
  <rect x="200" y="140" width="260" height="180" rx="12" fill="{LGT}"/>
  <rect x="240" y="170" width="180" height="120" rx="8" fill="{NAVY}"/>
  <circle cx="330" cy="230" r="38" fill="{LGT}"/>
  <circle cx="330" cy="230" r="24" fill="{NAVY}"/>
  <circle cx="330" cy="230" r="12" fill="{GRAY}"/>
  <rect x="395" y="180" width="18" height="10" rx="2" fill="{RED}"/>
  <text x="330" y="355" text-anchor="middle" class="pair-label">Point-and-shoot</text>
  <text x="330" y="380" text-anchor="middle" class="pair-sub">傻瓜相機</text>

  <!-- Separator -->
  <line x1="750" y1="170" x2="750" y2="390" stroke="{GRAY}" stroke-width="2" stroke-dasharray="4,4"/>

  <!-- Right: DSLR (complex) -->
  <rect x="1040" y="130" width="320" height="200" rx="12" fill="{NAVY}"/>
  <!-- grip -->
  <rect x="1040" y="180" width="60" height="140" rx="12" fill="#0A1A23"/>
  <!-- lens -->
  <circle cx="1200" cy="230" r="70" fill="#0A1A23"/>
  <circle cx="1200" cy="230" r="54" fill="{NAVY}" stroke="{GRAY}" stroke-width="2"/>
  <circle cx="1200" cy="230" r="36" fill="#0A1A23"/>
  <circle cx="1200" cy="230" r="18" fill="{GRAY}"/>
  <!-- dials -->
  <circle cx="1100" cy="160" r="14" fill="{GRAY}"/>
  <circle cx="1300" cy="160" r="14" fill="{GRAY}"/>
  <rect x="1275" y="180" width="60" height="8" rx="2" fill="{RED}"/>
  <!-- viewfinder bump -->
  <rect x="1170" y="110" width="60" height="20" rx="4" fill="{NAVY}"/>
  <text x="1200" y="365" text-anchor="middle" class="pair-label">DSLR</text>
  <text x="1200" y="390" text-anchor="middle" class="pair-sub">單眼</text>

  <!-- Horizontal separator -->
  <line x1="200" y1="470" x2="1400" y2="470" stroke="{LGT}" stroke-width="2"/>

  <!-- BOTTOM ROW: Gear shift pair -->
  <!-- Left: Automatic (P-R-N-D) -->
  <rect x="200" y="520" width="260" height="200" rx="12" fill="{LGT}"/>
  <rect x="300" y="540" width="60" height="160" rx="30" fill="{NAVY}"/>
  <circle cx="330" cy="600" r="16" fill="{RED}"/>
  <text x="240" y="575" class="pair-sub" font-size="18" font-weight="700" fill="{NAVY}">P</text>
  <text x="240" y="605" class="pair-sub" font-size="18" font-weight="700" fill="{NAVY}">R</text>
  <text x="240" y="635" class="pair-sub" font-size="18" font-weight="700" fill="{NAVY}">N</text>
  <text x="240" y="665" class="pair-sub" font-size="18" font-weight="700" fill="{RED}">D</text>
  <text x="330" y="755" text-anchor="middle" class="pair-label">Automatic</text>
  <text x="330" y="780" text-anchor="middle" class="pair-sub">自排車</text>

  <!-- Separator -->
  <line x1="750" y1="550" x2="750" y2="790" stroke="{GRAY}" stroke-width="2" stroke-dasharray="4,4"/>

  <!-- Right: Manual H-pattern -->
  <rect x="1040" y="520" width="320" height="200" rx="12" fill="{LGT}"/>
  <!-- H pattern -->
  <line x1="1120" y1="580" x2="1280" y2="580" stroke="{NAVY}" stroke-width="4"/>
  <line x1="1120" y1="660" x2="1280" y2="660" stroke="{NAVY}" stroke-width="4"/>
  <line x1="1200" y1="580" x2="1200" y2="660" stroke="{NAVY}" stroke-width="4"/>
  <circle cx="1120" cy="580" r="12" fill="{NAVY}"/><text x="1120" y="560" text-anchor="middle" font-size="14" font-weight="700" fill="{NAVY}">1</text>
  <circle cx="1200" cy="580" r="12" fill="{NAVY}"/><text x="1200" y="560" text-anchor="middle" font-size="14" font-weight="700" fill="{NAVY}">3</text>
  <circle cx="1280" cy="580" r="12" fill="{NAVY}"/><text x="1280" y="560" text-anchor="middle" font-size="14" font-weight="700" fill="{NAVY}">5</text>
  <circle cx="1120" cy="660" r="12" fill="{NAVY}"/><text x="1120" y="693" text-anchor="middle" font-size="14" font-weight="700" fill="{NAVY}">2</text>
  <circle cx="1200" cy="660" r="12" fill="{NAVY}"/><text x="1200" y="693" text-anchor="middle" font-size="14" font-weight="700" fill="{NAVY}">4</text>
  <circle cx="1280" cy="660" r="12" fill="{RED}"/><text x="1280" y="693" text-anchor="middle" font-size="14" font-weight="700" fill="{RED}">6</text>
  <text x="1200" y="755" text-anchor="middle" class="pair-label">Manual</text>
  <text x="1200" y="780" text-anchor="middle" class="pair-sub">手排車</text>

  <!-- Caption strip -->
  <rect x="300" y="830" width="1000" height="50" rx="25" fill="{SOFT_RED}"/>
  <text x="400" y="862" class="caption">Claude Design</text>
  <text x="645" y="862" class="cap-em">easier to drive</text>
  <text x="855" y="862" class="caption">· Claude Code</text>
  <text x="1080" y="862" class="cap-em">wider range</text>
</svg>"""

# ---------- A4 · Figma MCP bidirectional flow ----------
a4 = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">
  <style>
    .node-title {{ font: 700 26px 'Inter',Arial,sans-serif; fill: {NAVY}; }}
    .node-sub {{ font: 500 18px 'Inter',Arial,sans-serif; fill: {GRAY}; }}
    .arrow-label {{ font: 500 18px 'Inter',Arial,sans-serif; fill: {NAVY}; }}
    .arrow-label-em {{ font: 700 18px 'Inter',Arial,sans-serif; fill: {RED}; }}
    .bridge {{ font: 700 22px 'Inter',Arial,sans-serif; fill: {WHITE}; letter-spacing: 2px; }}
  </style>
  <rect width="{W}" height="{H}" fill="{WHITE}"/>

  <!-- LEFT NODE: Claude Code -->
  <rect x="100" y="340" width="340" height="220" rx="16" fill="{LGT}" stroke="{NAVY}" stroke-width="3"/>
  <!-- terminal icon -->
  <rect x="150" y="380" width="240" height="140" rx="10" fill="#0F1724"/>
  <circle cx="170" cy="400" r="6" fill="#FF5F57"/>
  <circle cx="188" cy="400" r="6" fill="#FEBC2E"/>
  <circle cx="206" cy="400" r="6" fill="#28C840"/>
  <text x="168" y="440" font-family="Menlo,monospace" font-size="16" fill="#8FE8A8">$ claude</text>
  <text x="168" y="465" font-family="Menlo,monospace" font-size="12" fill="#5B6B85">designing...</text>
  <text x="168" y="490" font-family="Menlo,monospace" font-size="12" fill="#5B6B85">● step 2/5</text>
  <text x="270" y="590" text-anchor="middle" class="node-title">Claude Code</text>
  <text x="270" y="616" text-anchor="middle" class="node-sub">+ Claude Design</text>

  <!-- CENTER NODE: MCP Bridge -->
  <rect x="660" y="380" width="280" height="140" rx="70" fill="{RED}"/>
  <!-- plug icon -->
  <circle cx="720" cy="450" r="28" fill="{WHITE}"/>
  <rect x="700" y="440" width="16" height="6" fill="{RED}"/>
  <rect x="724" y="440" width="16" height="6" fill="{RED}"/>
  <rect x="700" y="454" width="40" height="6" fill="{RED}"/>
  <text x="830" y="440" text-anchor="middle" class="bridge">MCP</text>
  <text x="830" y="470" text-anchor="middle" font-family="Inter,Arial" font-size="16" font-weight="500" fill="{WHITE}">bridge</text>
  <text x="800" y="555" text-anchor="middle" class="node-title">Figma MCP</text>
  <text x="800" y="582" text-anchor="middle" class="node-sub">official integration</text>

  <!-- RIGHT NODE: Figma file -->
  <rect x="1160" y="340" width="340" height="220" rx="16" fill="{WHITE}" stroke="{NAVY}" stroke-width="3"/>
  <!-- Figma logo simplified -->
  <g transform="translate(1280,390)">
    <rect x="0" y="0" width="40" height="40" rx="20" fill="#F24E1E"/>
    <rect x="40" y="0" width="40" height="40" fill="#A259FF"/>
    <rect x="0" y="40" width="40" height="40" fill="#1ABCFE"/>
    <rect x="40" y="40" width="40" height="40" rx="20" fill="#0ACF83"/>
    <rect x="0" y="80" width="40" height="40" rx="20" fill="#FF7262"/>
  </g>
  <text x="1330" y="590" text-anchor="middle" class="node-title">Figma file</text>
  <text x="1330" y="616" text-anchor="middle" class="node-sub">ideation · polish</text>

  <!-- TOP ARROW (left→right, EXPORT) -->
  <path d="M 440 400 Q 600 340 660 400" fill="none" stroke="{RED}" stroke-width="4"/>
  <polygon points="650,395 668,400 652,410" fill="{RED}"/>
  <path d="M 940 400 Q 1100 340 1160 400" fill="none" stroke="{RED}" stroke-width="4"/>
  <polygon points="1150,395 1168,400 1152,410" fill="{RED}"/>
  <text x="800" y="300" text-anchor="middle" class="arrow-label-em">EXPORT</text>
  <text x="800" y="325" text-anchor="middle" class="arrow-label">Claude Design output → polish in Figma</text>

  <!-- BOTTOM ARROW (right→left, IMPORT) -->
  <path d="M 1160 500 Q 1000 560 940 500" fill="none" stroke="{NAVY}" stroke-width="4"/>
  <polygon points="950,505 932,500 948,490" fill="{NAVY}"/>
  <path d="M 660 500 Q 500 560 440 500" fill="none" stroke="{NAVY}" stroke-width="4"/>
  <polygon points="450,505 432,500 448,490" fill="{NAVY}"/>
  <text x="800" y="660" text-anchor="middle" class="arrow-label" font-weight="700">IMPORT</text>
  <text x="800" y="686" text-anchor="middle" class="arrow-label">Legacy Figma project → context for Claude Code</text>
</svg>"""

images = {
    "a1-github-vs-git": a1,
    "a2-cli-vs-gui": a2,
    "a3-camera-car-analogy": a3,
    "a4-figma-mcp-flow": a4,
}

for name, svg in images.items():
    svg_path = os.path.join(OUT, f"{name}.svg")
    png_path = os.path.join(OUT, f"{name}.png")
    with open(svg_path, "w") as f:
        f.write(svg)
    cairosvg.svg2png(bytestring=svg.encode("utf-8"), write_to=png_path, output_width=1600)
    print(f"  wrote {name}.svg + .png")

print("done.")
