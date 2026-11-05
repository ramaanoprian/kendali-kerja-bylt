/**
 * Original vector silhouette of a CC 205-class diesel locomotive (long-hood road switcher, two C-C bogies).
 * Decorative only: always aria-hidden. No operator logos or liveries.
 * Motion lives in CSS (login.css): entrance, wheel spin, idle bounce, headlight pulse, exhaust.
 */
const wheelX = [120, 160, 200, 500, 540, 580];
const stanchions = Array.from({ length: 18 }, (_, i) => 74 + i * 32);
const louvers = Array.from({ length: 13 }, (_, i) => 96 + i * 8);
const doors = [224, 272, 320, 368, 416];
const sleepers = Array.from({ length: 110 }, (_, i) => -1070 + i * 26);

export function Locomotive({ scene = true, className = '' }: { scene?: boolean; className?: string }) {
  return (
    <svg className={`loco ${className}`} viewBox="0 0 720 220" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="loco-beam" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ffe6a8" stopOpacity=".75" />
          <stop offset="1" stopColor="#ffe6a8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="loco-stripe" x1="0" x2="1">
          <stop offset="0" stopColor="#8a7dff" />
          <stop offset=".55" stopColor="#c86bff" />
          <stop offset="1" stopColor="#ff7fb3" />
        </linearGradient>
        <linearGradient id="loco-rim" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8fa0ff" stopOpacity=".7" />
          <stop offset="1" stopColor="#8fa0ff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="loco-lamp"><stop offset="0" stopColor="#fff7d6" /><stop offset="1" stopColor="#ffc95a" stopOpacity="0" /></radialGradient>
      </defs>

      {scene && <g className="loco-scene">
        <path className="loco-hills" d="M-1100 190 L-900 160 L-700 172 L-520 138 L-360 160 L-200 150 L-40 176 L40 150 L110 166 L190 120 L238 92 L262 84 L290 104 L350 140 L430 128 L520 150 L600 132 L680 156 L760 140 L900 160 L1080 128 L1260 158 L1440 146 L1820 170 L1820 190 Z" />
        <path className="loco-hills near" d="M-1100 190 L-800 174 L-500 182 L-200 172 L-40 180 L60 170 L160 178 L260 160 L380 174 L480 162 L600 176 L760 166 L1000 178 L1300 170 L1820 180 L1820 190 Z" />
      </g>}

      <g className="loco-track">
        {sleepers.map(x => <rect key={x} className="loco-sleeper" x={x} y="192" width="16" height="7" rx="1" />)}
        <rect className="loco-ground" x="-1100" y="199" width="2920" height="120" />
        <rect className="loco-rail" x="-1100" y="188" width="2920" height="4" rx="1" />
      </g>

      <g className="loco-train">
        <polygon className="loco-beam" points="648,98 760,58 760,140" fill="url(#loco-beam)" />
        <g className="loco-body">
          {/* pilots and couplers */}
          <path className="loco-dark" d="M60 152 H30 L22 184 H60 Z M640 152 H670 L678 184 H640 Z" />
          <rect className="loco-dark" x="10" y="160" width="16" height="8" rx="2" />
          <rect className="loco-dark" x="674" y="160" width="16" height="8" rx="2" />
          {/* underframe, fuel tank */}
          <rect className="loco-fill" x="58" y="138" width="584" height="14" rx="2" />
          <rect className="loco-dark" x="252" y="152" width="196" height="20" rx="9" />
          <rect className="loco-detail" x="266" y="158" width="168" height="2" rx="1" />
          {/* long hood */}
          <path className="loco-fill" d="M80 140 V86 Q80 78 88 78 H462 Q470 78 470 86 V140 Z" />
          <rect className="loco-fill" x="92" y="70" width="112" height="10" rx="3" />
          <rect className="loco-fill" x="330" y="64" width="18" height="16" rx="2" />
          {louvers.map(x => <rect key={x} className="loco-detail" x={x} y="90" width="3" height="38" rx="1" />)}
          {doors.map(x => <rect key={x} className="loco-outline" x={x} y="90" width="40" height="40" rx="2" />)}
          {/* cab and short nose */}
          <path className="loco-fill" d="M470 140 V60 Q470 48 482 48 H568 Q580 48 580 60 V140 Z" />
          <path className="loco-fill" d="M580 140 V88 H630 Q642 88 644 100 L648 140 Z" />
          <rect className="loco-window" x="486" y="62" width="34" height="28" rx="3" />
          <rect className="loco-window" x="530" y="62" width="36" height="28" rx="3" />
          <rect className="loco-outline" x="530" y="96" width="36" height="40" rx="2" />
          {/* livery stripe and rim light */}
          <rect x="80" y="124" width="568" height="5" fill="url(#loco-stripe)" className="loco-stripe" />
          <path d="M88 78 H462 M482 48 H568" stroke="url(#loco-rim)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <text className="loco-number" x="300" y="116">CC 205</text>
          {/* handrail */}
          <path className="loco-rail-hand" d={`M66 118 H634 ${stanchions.map(x => `M${x} 118 V138`).join(' ')}`} />
          {/* headlight */}
          <circle className="loco-lamp-glow" cx="645" cy="98" r="14" fill="url(#loco-lamp)" />
          <circle className="loco-lamp" cx="645" cy="98" r="4" />
          {/* bogie frames */}
          <rect className="loco-dark" x="98" y="158" width="124" height="22" rx="5" />
          <rect className="loco-dark" x="478" y="158" width="124" height="22" rx="5" />
        </g>
        {/* Position on the outer group, rotation (CSS) on the inner one: CSS transform replaces the attribute. */}
        {wheelX.map(x => <g key={x} transform={`translate(${x} 175)`}><g className="loco-wheel">
          <circle className="loco-wheel-rim" r="15" />
          <circle className="loco-wheel-hub" r="5" />
          <path className="loco-spoke" d="M0 -12 V12 M-12 0 H12" />
        </g></g>)}
        <g className="loco-smoke"><circle cx="339" cy="58" r="7" /><circle cx="339" cy="58" r="7" /><circle cx="339" cy="58" r="7" /></g>
      </g>
    </svg>
  );
}
