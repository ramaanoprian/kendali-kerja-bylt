/**
 * Original vector silhouette of a CC 205-class diesel locomotive, drawn from its general form:
 * full-width cab with raked windscreen and twin roof headlights, long hood with panel doors,
 * rear radiator grille, dynamic-brake grille behind the cab, roof silencer, deep underframe,
 * fuel tank, and two three-axle (C-C) bogies. Decorative only: always aria-hidden.
 * No operator logos or liveries. Motion lives in CSS (login.css).
 */
const wheelX = [92, 138, 184, 500, 546, 592];
const doors = Array.from({ length: 9 }, (_, i) => 140 + i * 26);
const radiator = Array.from({ length: 11 }, (_, i) => 62 + i * 6);
const dbGrille = Array.from({ length: 7 }, (_, i) => 78 + i * 3);
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
        <polygon className="loco-beam" points="654,62 790,20 790,112" fill="url(#loco-beam)" />
        <g className="loco-body">
          {/* pilots (plough) and couplers */}
          <path className="loco-dark" d="M40 146 H22 L16 178 H40 Z M654 146 H684 L692 178 H654 Z" />
          <rect className="loco-dark" x="4" y="152" width="16" height="9" rx="2" />
          <rect className="loco-dark" x="688" y="152" width="18" height="9" rx="2" />
          {/* deep underframe */}
          <rect className="loco-fill" x="36" y="130" width="640" height="18" rx="2" />
          <rect className="loco-detail" x="40" y="139" width="632" height="2" rx="1" />
          {/* fuel tank between the bogies */}
          <path className="loco-dark" d="M230 148 H424 V160 Q424 172 412 172 H242 Q230 172 230 160 Z" />
          <rect className="loco-detail" x="244" y="155" width="166" height="2" rx="1" />
          {/* long hood: lower roof at the radiator end, rising toward the cab */}
          <path className="loco-fill" d="M48 130 V84 Q48 76 56 75 L132 66 H462 Q472 66 472 74 V130 Z" />
          {/* roof: radiator fan humps, silencer, dynamic-brake housing */}
          <path className="loco-fill" d="M62 73 Q76 63 92 63 Q108 63 122 70 Z" />
          <rect className="loco-fill" x="404" y="56" width="50" height="13" rx="6.5" />
          <rect className="loco-fill" x="220" y="62" width="120" height="6" rx="3" />
          {/* rear radiator grille, panel doors, dynamic-brake side grille */}
          {radiator.map(x => <rect key={x} className="loco-detail" x={x} y="82" width="2.5" height="32" rx="1" />)}
          {doors.map(x => <path key={x} className="loco-outline" d={`M${x} 76 V126`} />)}
          {dbGrille.map(y => <rect key={y} className="loco-detail" x="380" y={y} width="84" height="1.6" rx=".8" />)}
          {/* full-width cab with raked windscreen */}
          <path className="loco-fill" d="M472 130 V62 Q472 52 482 52 H626 Q636 52 641 60 L656 84 L658 130 Z" />
          {/* twin headlight housing on the cab roof front */}
          <rect className="loco-fill" x="628" y="44" width="22" height="12" rx="5" />
          <rect className="loco-window" x="488" y="64" width="30" height="34" rx="3" />
          <rect className="loco-window" x="522" y="64" width="30" height="34" rx="3" />
          <path className="loco-window" d="M598 64 H626 L640 86 H598 Z" />
          <rect className="loco-outline" x="590" y="62" width="54" height="66" rx="3" />
          {/* number plate on the cab side */}
          <rect className="loco-plate" x="488" y="104" width="64" height="14" rx="2" />
          <text className="loco-number" x="520" y="115" textAnchor="middle">CC 205</text>
          {/* front end: step, marker lights */}
          <rect className="loco-fill" x="650" y="112" width="26" height="22" rx="2" />
          <circle className="loco-marker" cx="664" cy="122" r="2.4" />
          {/* livery stripe and rim light */}
          <rect x="48" y="118" width="610" height="4" fill="url(#loco-stripe)" className="loco-stripe" />
          <path d="M56 75 L132 66 H462 M482 52 H626" stroke="url(#loco-rim)" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* handrails beside the cab and at the front */}
          <path className="loco-rail-hand" d="M374 102 H468 M378 102 V130 M422 102 V130 M466 102 V130 M662 96 V112 M676 96 V112 M662 96 H676" />
          {/* headlights */}
          <circle className="loco-lamp-glow" cx="650" cy="50" r="16" fill="url(#loco-lamp)" />
          <circle className="loco-lamp" cx="646" cy="50" r="3.4" />
          <circle className="loco-lamp" cx="654" cy="50" r="3.4" />
          {/* bogie side frames with springs and brake cylinders */}
          {[72, 480].map(x => <g key={x}>
            <path className="loco-dark" d={`M${x} 154 H${x + 136} Q${x + 142} 154 ${x + 142} 160 V176 Q${x + 142} 182 ${x + 136} 182 H${x + 6} Q${x} 182 ${x} 176 Z`} />
            <rect className="loco-detail" x={x + 34} y="146" width="10" height="10" rx="2" />
            <rect className="loco-detail" x={x + 80} y="146" width="10" height="10" rx="2" />
            <rect className="loco-detail" x={x + 8} y="160" width="126" height="2" rx="1" />
          </g>)}
        </g>
        {/* Position on the outer group, rotation (CSS) on the inner one: CSS transform replaces the attribute. */}
        {wheelX.map(x => <g key={x} transform={`translate(${x} 171)`}><g className="loco-wheel">
          <circle className="loco-wheel-rim" r="17" />
          <circle className="loco-wheel-hub" r="5.5" />
          <path className="loco-spoke" d="M0 -14 V14 M-14 0 H14" />
        </g></g>)}
        <g className="loco-smoke"><circle cx="429" cy="52" r="7" /><circle cx="429" cy="52" r="7" /><circle cx="429" cy="52" r="7" /></g>
      </g>
    </svg>
  );
}

/** Compact side-view locomotive glyph for the app brand mark (inherits currentColor). */
export function LocoMark({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size * 0.7} viewBox="0 0 30 21" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M2 14 V8.5 Q2 7 3.5 7 H19 V4 Q19 3 20 3 H26 Q27 3 27.6 4 L29 7.5 V14 Z" />
    <rect x="21" y="5" width="4" height="3" rx=".6" fill="#000" fillOpacity=".28" />
    <rect x="1" y="14.5" width="29" height="1.6" rx=".8" />
    <circle cx="6" cy="18.3" r="2.2" /><circle cx="11" cy="18.3" r="2.2" /><circle cx="20" cy="18.3" r="2.2" /><circle cx="25" cy="18.3" r="2.2" />
  </svg>;
}
