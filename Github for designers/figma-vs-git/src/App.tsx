export default function App() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-10 font-sans">
      <div className="w-full max-w-4xl">
        {/* Headers */}
        <div className="grid grid-cols-2 gap-8 mb-3">
          <div className="flex items-center gap-2">
            <FigmaLogo />
            <span className="text-lg font-semibold text-gray-800">Figma</span>
          </div>
          <div className="flex items-center gap-2">
            <GitHubLogo size={22} color="#24292f" />
            <span className="text-lg font-semibold text-gray-800">Git / GitHub</span>
          </div>
        </div>

        {/* Diagrams */}
        <div className="grid grid-cols-2 gap-8">
          <FigmaDiagram />
          <GitDiagram />
        </div>

        {/* Key insight */}
        <div className="grid grid-cols-2 gap-8 mt-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-center text-sm text-orange-700">
            所有人編輯<strong>同一份</strong>雲端檔案
          </div>
          <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-center text-sm text-gray-700">
            每個人有<strong>自己的副本</strong>，改完再合併
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Icons ── */

function FigmaLogo() {
  return (
    <svg width="22" height="33" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
      <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
      <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
      <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
      <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
    </svg>
  );
}

function GitHubLogo({ size = 20, color = "#24292f" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function PersonIcon({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill={color} fillOpacity="0.75" />
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function CloudIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="22" viewBox="0 0 24 18" fill="none">
      <path d="M19 8h-1.26A8 8 0 109 16h10a5 5 0 000-10z" fill={color} fillOpacity="0.65" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="13" rx="2" stroke="#555" strokeWidth="1.8" fill="none"/>
      <path d="M8 20h8M12 16v4" stroke="#555" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Shared primitives ── */

function UserNode({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: color + "18", border: `1.5px solid ${color}35` }}
      >
        <PersonIcon color={color} />
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

function VerticalArrow({ topLabel, bottomLabel }: { topLabel: string; bottomLabel: string }) {
  return (
    <div className="flex flex-col items-center">
      {/* up arrow */}
      <div className="flex items-center gap-1">
        <svg width="14" height="28" viewBox="0 0 14 28" fill="none">
          <path d="M7 24L7 4M7 4L3 9M7 4L11 9" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[10px] text-gray-400 w-12">{topLabel}</span>
      </div>
      {/* down arrow */}
      <div className="flex items-center gap-1">
        <svg width="14" height="28" viewBox="0 0 14 28" fill="none">
          <path d="M7 4L7 24M7 24L3 19M7 24L11 19" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[10px] text-gray-400 w-12">{bottomLabel}</span>
      </div>
    </div>
  );
}

function BidirectionalArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 my-1">
      <svg width="14" height="32" viewBox="0 0 14 32" fill="none">
        <path d="M7 28L7 4M7 4L3 9M7 4L11 9M7 28L3 23M7 28L11 23" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-[10px] text-gray-400 whitespace-nowrap">{label}</span>
    </div>
  );
}

/* ── Figma Diagram ── */

function FigmaDiagram() {
  const color = "#F24E1E";
  return (
    <div className="border border-orange-200 rounded-2xl bg-orange-50/40 p-6 flex flex-col items-center gap-3">
      {/* Cloud */}
      <div
        className="w-44 h-20 rounded-2xl flex flex-col items-center justify-center gap-1"
        style={{ backgroundColor: color + "18", border: `2px solid ${color}` }}
      >
        <CloudIcon color={color} />
        <span className="text-xs font-semibold" style={{ color }}>Figma Cloud</span>
        <span className="text-[10px] text-gray-400">唯一一份</span>
      </div>

      {/* Arrows */}
      <div className="flex gap-12">
        <BidirectionalArrow label="自動即時同步" />
        <BidirectionalArrow label="自動即時同步" />
      </div>

      {/* Users */}
      <div className="flex gap-12">
        <UserNode label="設計師 A" color={color} />
        <UserNode label="設計師 B" color={color} />
      </div>
    </div>
  );
}

/* ── Git Diagram ── */

function GitDiagram() {
  return (
    <div className="border border-gray-300 rounded-2xl bg-gray-50/60 p-6 flex flex-col items-center gap-2">
      {/* Remote */}
      <div className="w-44 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 bg-gray-100 border-2 border-gray-700">
        <GitHubLogo size={20} color="#24292f" />
        <span className="text-xs font-semibold text-gray-800">GitHub Remote</span>
        <span className="text-[10px] text-gray-400">共享中心</span>
      </div>

      {/* Push / Pull arrows */}
      <div className="flex gap-14">
        <VerticalArrow topLabel="push ↑" bottomLabel="pull ↓" />
        <VerticalArrow topLabel="push ↑" bottomLabel="pull ↓" />
      </div>

      {/* Local + Users */}
      <div className="flex gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 bg-white border-2 border-gray-400">
            <MonitorIcon />
            <span className="text-[10px] text-gray-500">Local 副本</span>
          </div>
          <UserNode label="開發者 A" color="#24292f" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 bg-white border-2 border-gray-400">
            <MonitorIcon />
            <span className="text-[10px] text-gray-500">Local 副本</span>
          </div>
          <UserNode label="開發者 B" color="#24292f" />
        </div>
      </div>
    </div>
  );
}
