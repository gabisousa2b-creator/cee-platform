/* eslint-disable */
// Echowai — Logo Lab vol. 3
// 20 NEW proposals — geometric, data-led, interactive, motion-rich, type-led

const LogoLab3Styles = () => (
  <style>{`
    @keyframes spinSlow   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes spinFast   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes blink      { 0%,40%,100% { opacity: 1; } 50%,90% { opacity: 0.25; } }
    @keyframes lhSweep    { from { transform: rotate(-30deg); } to { transform: rotate(390deg); } }
    @keyframes ripple     { 0% { r: 1; opacity: .7; } 100% { r: 18; opacity: 0; } }
    @keyframes drop       { 0% { transform: translateY(-14px); opacity: 0; } 30% { opacity: 1; } 70% { transform: translateY(10px); opacity: 1; } 100% { transform: translateY(10px); opacity: 0; } }
    @keyframes orbit2     { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
    @keyframes batFill    { 0%, 100% { width: 28%; } 50% { width: 92%; } }
    @keyframes bloom      { 0%, 100% { transform: scale(0.94); } 50% { transform: scale(1.04); } }
    @keyframes ecgPulse {
      0%   { stroke-dashoffset: 200; }
      45%  { stroke-dashoffset: 0;   }
      55%  { stroke-dashoffset: 0;   }
      100% { stroke-dashoffset: -200;}
    }
    @keyframes stampHit {
      0%, 100% { transform: scale(1) rotate(-6deg); }
      8%       { transform: scale(0.86) rotate(-6deg); }
      14%      { transform: scale(1.04) rotate(-6deg); }
      22%      { transform: scale(1) rotate(-6deg); }
    }
    @keyframes tallyTick {
      0%, 90%  { transform: translateY(0); }
      95%      { transform: translateY(-14px); }
      100%     { transform: translateY(-14px); }
    }
    @keyframes spiralDraw {
      0%   { stroke-dashoffset: 240; }
      55%  { stroke-dashoffset: 0;   }
      100% { stroke-dashoffset: 0;   }
    }
    @keyframes phaseA { 0%,100% { transform: translateX(-3px); } 50% { transform: translateX(3px); } }
    @keyframes phaseB { 0%,100% { transform: translateX(3px); }  50% { transform: translateX(-3px); } }
    @keyframes pixGlow { 0%, 100% { opacity: 0.18; } 50% { opacity: 1; } }
    @keyframes scrollX { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes glyphDot {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.6); }
    }
    @keyframes vaultRot { 0%,30% { transform: rotate(0deg); } 50% { transform: rotate(108deg); } 70%,100% { transform: rotate(108deg); } }
    @keyframes haloRot   { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
    @keyframes typewriter { from { width: 0; } to { width: 100%; } }
  `}</style>
);

// Wordmark — shared
const W = ({ scale, color, accent, kerning = 0 }) => (
  <span className="serif" style={{
    fontSize: 32 * scale, lineHeight: 1, letterSpacing: `${-0.035 + kerning}em`,
    fontWeight: 500, color,
  }}>
    echo<span style={{ color: accent }}>wai</span>
  </span>
);
const Row = ({ children, scale, color, gap = 14 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: gap * scale, color }}>
    {children}
  </div>
);

// ─── 13. SPIRAL — golden arc that draws then resets ───────
const LogoSpiral = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Row scale={scale} color={color}>
    <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
      <path
        d="M 28 28 m 0 -2 a 2 2 0 1 1 0 4 a 4 4 0 1 1 0 -8 a 8 8 0 1 1 0 16 a 16 16 0 1 1 0 -22"
        fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round"
        strokeDasharray="240"
        style={{ animation: "spiralDraw 3.4s ease-in-out infinite" }}
      />
      <circle cx="28" cy="6" r="2.4" fill={accent} />
    </svg>
    <W scale={scale} color={color} accent={accent} />
  </Row>
);

// ─── 14. COMPASS — N indicator that drifts then snaps ─────
const LogoCompass = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Row scale={scale} color={color}>
    <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
      <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="1.4" strokeOpacity="0.2" />
      {/* ticks */}
      {[0, 90, 180, 270].map(a => {
        const rad = a * Math.PI / 180 - Math.PI / 2;
        return (
          <line key={a}
            x1={28 + Math.cos(rad) * 18} y1={28 + Math.sin(rad) * 18}
            x2={28 + Math.cos(rad) * 22} y2={28 + Math.sin(rad) * 22}
            stroke={color} strokeOpacity="0.35" strokeWidth="1.2" />
        );
      })}
      <g style={{ transformOrigin: "28px 28px", animation: "spinSlow 14s linear infinite" }}>
        <path d="M 28 10 L 31 28 L 28 26 L 25 28 Z" fill={accent} />
        <path d="M 28 46 L 31 28 L 28 30 L 25 28 Z" fill={color} fillOpacity="0.4" />
      </g>
      <circle cx="28" cy="28" r="2" fill={color} />
    </svg>
    <W scale={scale} color={color} accent={accent} />
  </Row>
);

// ─── 15. CONSTELLATION — dots + connecting lines ──────────
const LogoConstellation = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const stars = [
    [8, 16], [22, 8], [38, 14], [50, 24],
    [16, 32], [30, 28], [44, 38], [22, 46],
  ];
  const links = [[0,1],[1,2],[2,3],[1,4],[4,5],[5,2],[5,6],[6,3],[4,7],[5,7]];
  return (
    <Row scale={scale} color={color}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
        {links.map(([a,b],i) => (
          <line key={i} x1={stars[a][0]} y1={stars[a][1]} x2={stars[b][0]} y2={stars[b][1]}
            stroke={accent} strokeWidth="0.8" strokeOpacity="0.4" />
        ))}
        {stars.map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r={i === 5 ? 2.4 : 1.4} fill={accent}
            style={{ animation: `blink ${2.4 + i * 0.2}s ease-in-out ${i * 0.15}s infinite` }} />
        ))}
      </svg>
      <W scale={scale} color={color} accent={accent} />
    </Row>
  );
};

// ─── 16. LIGHTHOUSE — beam sweeps a sector ────────────────
const LogoLighthouse = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Row scale={scale} color={color}>
    <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
      <defs>
        <radialGradient id="lhBeam" cx="0" cy="0.5" r="1">
          <stop offset="0" stopColor={accent} stopOpacity="0.55" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="28" cy="28" r="22" fill="none" stroke={accent} strokeOpacity="0.16" strokeWidth="1" />
      <g style={{ transformOrigin: "28px 28px", animation: "lhSweep 5s linear infinite" }}>
        <path d="M 28 28 L 60 16 L 60 40 Z" fill="url(#lhBeam)" />
      </g>
      <circle cx="28" cy="28" r="3.4" fill={accent} />
      <circle cx="28" cy="28" r="6" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.35" />
    </svg>
    <W scale={scale} color={color} accent={accent} />
  </Row>
);

// ─── 17. DNA — two interweaving sine strands ──────────────
const LogoDNA = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf; const start = performance.now();
    const loop = (now) => { setT((now - start) / 700); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const N = 24;
  const pts = (offset) => Array.from({ length: N + 1 }, (_, i) => {
    const x = 4 + (i / N) * 48;
    const y = 28 + Math.sin((i / N) * Math.PI * 4 + t + offset) * 12;
    return [x, y];
  });
  const a = pts(0), b = pts(Math.PI);
  const path = (p) => "M " + p.map(([x,y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ");
  return (
    <Row scale={scale} color={color}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
        <path d={path(a)} fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <path d={path(b)} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />
        {a.map((p, i) => i % 4 === 0 ? (
          <line key={i} x1={p[0]} y1={p[1]} x2={b[i][0]} y2={b[i][1]} stroke={accent} strokeWidth="0.6" strokeOpacity="0.3" />
        ) : null)}
      </svg>
      <W scale={scale} color={color} accent={accent} />
    </Row>
  );
};

// ─── 18. INKDROP — drop falls, ripple expands ─────────────
const LogoInkdrop = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Row scale={scale} color={color}>
    <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
      <line x1="4" y1="40" x2="52" y2="40" stroke={color} strokeOpacity="0.2" strokeWidth="0.8" />
      <ellipse cx="28" cy="40" rx="0" ry="0" stroke={accent} strokeWidth="1.4" fill="none"
        style={{ animation: "ripple 2.6s ease-out infinite", transformOrigin: "28px 40px" }}>
      </ellipse>
      <g style={{ animation: "drop 2.6s ease-in infinite" }}>
        <path d="M 28 22 C 25 28, 25 34, 28 36 C 31 34, 31 28, 28 22 Z" fill={accent} />
      </g>
      <circle cx="28" cy="40" r="2" fill={accent} />
    </svg>
    <W scale={scale} color={color} accent={accent} />
  </Row>
);

// ─── 19. PHASE — two circles drift in opposing phase ──────
const LogoPhase = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Row scale={scale} color={color}>
    <svg width={64 * scale} height={56 * scale} viewBox="0 0 64 56" aria-hidden>
      <g style={{ animation: "phaseA 3s ease-in-out infinite" }}>
        <circle cx="24" cy="28" r="14" fill={accent} fillOpacity="0.7" />
      </g>
      <g style={{ animation: "phaseB 3s ease-in-out infinite" }}>
        <circle cx="40" cy="28" r="14" fill={accent} fillOpacity="0.4" />
      </g>
    </svg>
    <W scale={scale} color={color} accent={accent} />
  </Row>
);

// ─── 20. BATTERY — energy fills the cell ──────────────────
const LogoBattery = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Row scale={scale} color={color}>
    <svg width={64 * scale} height={56 * scale} viewBox="0 0 64 56" aria-hidden>
      <rect x="6" y="20" width="48" height="20" rx="3" fill="none" stroke={color} strokeWidth="1.6" />
      <rect x="55" y="26" width="4" height="8" rx="1" fill={color} />
      <rect x="8" y="22" height="16" rx="2" fill={accent}
        style={{ animation: "batFill 3.6s ease-in-out infinite", width: "60%" }} />
    </svg>
    <W scale={scale} color={color} accent={accent} />
  </Row>
);

// ─── 21. ECG / HEART PULSE ────────────────────────────────
const LogoECG = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Row scale={scale} color={color}>
    <svg width={72 * scale} height={56 * scale} viewBox="0 0 72 56" aria-hidden>
      <line x1="4" y1="28" x2="68" y2="28" stroke={color} strokeOpacity="0.18" strokeWidth="0.8" />
      <path
        d="M 4 28 L 20 28 L 24 18 L 30 38 L 34 14 L 38 28 L 52 28 L 56 24 L 60 28 L 68 28"
        fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="200"
        style={{ animation: "ecgPulse 2.6s ease-in-out infinite" }}
      />
    </svg>
    <W scale={scale} color={color} accent={accent} />
  </Row>
);

// ─── 22. TALLY — odometer flip every 3s ──────────────────
const LogoTally = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [n, setN] = React.useState(312);
  React.useEffect(() => {
    const id = setInterval(() => setN(x => x + Math.floor(Math.random() * 4) + 1), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <Row scale={scale} color={color}>
      <div style={{
        width: 56 * scale, height: 32 * scale, padding: "0 8px",
        background: "var(--ink)", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        borderRadius: 4, fontFamily: "var(--font-mono)", fontSize: 16 * scale,
        letterSpacing: ".06em",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent }} className="volt-dot" />
        <span>{n}</span>
      </div>
      <W scale={scale} color={color} accent={accent} />
    </Row>
  );
};

// ─── 23. HALFTONE — dot grid sizes form a wave ────────────
const LogoHalftone = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const W2 = 9, H2 = 5;
  return (
    <Row scale={scale} color={color}>
      <svg width={72 * scale} height={40 * scale} viewBox="0 0 72 40" aria-hidden>
        {Array.from({ length: H2 }).map((_, y) =>
          Array.from({ length: W2 }).map((_, x) => {
            const cx = 6 + x * 7.5;
            const cy = 4 + y * 8;
            // size by sine wave + vertical falloff
            const dy = Math.abs(y - 2);
            const wave = Math.sin(x * 0.6) * 0.5 + 0.5;
            const r = (1 - dy * 0.3) * (0.8 + wave * 1.6);
            return (
              <circle key={`${x}-${y}`} cx={cx} cy={cy} r={Math.max(0.4, r)}
                fill={x === 4 ? accent : color}
                opacity={x === 4 ? 1 : 0.55 - dy * 0.1}
                style={{ animation: `pixGlow ${2 + (x * 0.1)}s ease-in-out ${(x + y) * 0.08}s infinite` }} />
            );
          })
        )}
      </svg>
      <W scale={scale} color={color} accent={accent} />
    </Row>
  );
};

// ─── 24. STAMP — official-looking circular stamp ──────────
const LogoStamp = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Row scale={scale} color={color}>
    <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden
      style={{ animation: "stampHit 3.2s ease-out infinite", transformOrigin: "28px 28px" }}>
      <circle cx="28" cy="28" r="22" fill="none" stroke={accent} strokeWidth="2" />
      <circle cx="28" cy="28" r="17" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.5" />
      <text x="28" y="22" fontFamily="var(--font-mono)" fontSize="6" fill={accent} textAnchor="middle" letterSpacing="1.2" fontWeight="600">CEE · 2026</text>
      <line x1="14" y1="28" x2="42" y2="28" stroke={accent} strokeWidth="1.2" strokeOpacity="0.6" />
      <text x="28" y="38" fontFamily="var(--font-mono)" fontSize="5" fill={accent} textAnchor="middle" letterSpacing="1.2">ECHOWAI</text>
    </svg>
    <W scale={scale} color={color} accent={accent} />
  </Row>
);

// ─── 25. VAULT — combination lock rotates ─────────────────
const LogoVault = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Row scale={scale} color={color}>
    <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
      <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="1.4" strokeOpacity="0.2" />
      <g style={{ transformOrigin: "28px 28px", animation: "vaultRot 4.5s ease-in-out infinite" }}>
        <line x1="28" y1="28" x2="28" y2="8" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
      </g>
      {/* tick marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30) * Math.PI / 180;
        const x1 = 28 + Math.cos(a) * 19, y1 = 28 + Math.sin(a) * 19;
        const x2 = 28 + Math.cos(a) * 22, y2 = 28 + Math.sin(a) * 22;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeOpacity="0.35" strokeWidth="1" />;
      })}
      <circle cx="28" cy="28" r="3" fill={color} />
    </svg>
    <W scale={scale} color={color} accent={accent} />
  </Row>
);

// ─── 26. TICKER WORDMARK — sub-line scrolls ──────────────
const LogoTicker = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 * scale, color }}>
    <W scale={scale} color={color} accent={accent} />
    <div style={{ overflow: "hidden", maxWidth: 240 * scale, height: 14 * scale,
      borderTop: "1px solid var(--rule-on)", paddingTop: 2 * scale }}>
      <div style={{
        display: "inline-flex", gap: 18 * scale, whiteSpace: "nowrap",
        animation: "scrollX 18s linear infinite",
        fontFamily: "var(--font-mono)", fontSize: 9 * scale, color: "var(--muted)",
      }}>
        {Array.from({ length: 4 }).flatMap((_, k) => [
          <span key={`a${k}`}>● cours · 9,11 €/MWh</span>,
          <span key={`b${k}`} style={{ color: accent }}>● 312 dossiers ce mois</span>,
          <span key={`c${k}`}>● versement médian · 38 j</span>,
        ])}
      </div>
    </div>
  </div>
);

// ─── 27. GLYPH DOT — the "i" of wai pulses ───────────────
const LogoGlyphDot = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <div style={{ display: "inline-flex", alignItems: "baseline", color, position: "relative" }}>
    <span className="serif" style={{ fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500, color }}>
      echowa
    </span>
    <span style={{ position: "relative", display: "inline-block" }}>
      <span className="serif" style={{ fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500, color: accent, fontFeatureSettings: '"ss01"' }}>i</span>
      {/* override the i dot */}
      <span style={{
        position: "absolute",
        top: -4 * scale, left: "50%",
        width: 8 * scale, height: 8 * scale, borderRadius: "50%",
        background: accent, transform: "translateX(-50%)",
        animation: "glyphDot 1.6s ease-in-out infinite",
      }} />
      {/* satellite ring */}
      <span style={{
        position: "absolute",
        top: -8 * scale, left: "50%",
        width: 18 * scale, height: 18 * scale, borderRadius: "50%",
        border: `1px solid ${accent}`, opacity: 0.4,
        transform: "translateX(-50%)",
        animation: "haloRot 5s linear infinite",
      }} />
    </span>
  </div>
);

// ─── 28. ECLIPSE — disk drifts over disk ─────────────────
const LogoEclipse = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Row scale={scale} color={color}>
    <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
      <defs>
        <mask id="eclipMask">
          <rect width="56" height="56" fill="black" />
          <circle cx="28" cy="28" r="18" fill="white" />
        </mask>
      </defs>
      <circle cx="28" cy="28" r="18" fill={accent} />
      <g style={{ animation: "phaseA 4s ease-in-out infinite" }}>
        <circle cx="28" cy="28" r="18" fill="var(--card)" />
      </g>
      <circle cx="28" cy="28" r="18" fill="none" stroke={accent} strokeWidth="1.4" />
    </svg>
    <W scale={scale} color={color} accent={accent} />
  </Row>
);

// ─── 29. NETWORK — node graph growing edges ─────────────
const LogoNetwork = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const nodes = [[12,14],[28,8],[44,16],[20,30],[36,30],[14,44],[42,42],[28,46]];
  const edges = [[0,1],[1,2],[0,3],[3,4],[2,4],[3,5],[4,6],[5,7],[7,6],[3,7]];
  return (
    <Row scale={scale} color={color}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
        {edges.map(([a,b], i) => (
          <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
            stroke={accent} strokeWidth="1" strokeOpacity="0.5"
            style={{ animation: `pixGlow ${2 + i * 0.1}s ease-in-out ${i * 0.1}s infinite` }} />
        ))}
        {nodes.map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r={i === 3 ? 2.6 : 1.6} fill={accent} />
        ))}
      </svg>
      <W scale={scale} color={color} accent={accent} />
    </Row>
  );
};

// ─── 30. RADAR — sweep with blip ─────────────────────────
const LogoRadar = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Row scale={scale} color={color}>
    <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
      <defs>
        <linearGradient id="rdSweep" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={accent} stopOpacity="0" />
          <stop offset="1" stopColor={accent} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <circle cx="28" cy="28" r="22" fill="none" stroke={accent} strokeOpacity="0.18" strokeWidth="1" />
      <circle cx="28" cy="28" r="14" fill="none" stroke={accent} strokeOpacity="0.18" strokeWidth="1" />
      <circle cx="28" cy="28" r="6"  fill="none" stroke={accent} strokeOpacity="0.18" strokeWidth="1" />
      <g style={{ transformOrigin: "28px 28px", animation: "spinSlow 3.4s linear infinite" }}>
        <path d="M 28 28 L 52 28 A 24 24 0 0 0 28 4 Z" fill="url(#rdSweep)" opacity="0.7" />
      </g>
      <circle cx="40" cy="16" r="2.4" fill={accent} className="volt-dot" />
      <circle cx="28" cy="28" r="2" fill={accent} />
    </svg>
    <W scale={scale} color={color} accent={accent} />
  </Row>
);

// ─── 31. BRIDGE — arch metaphor ──────────────────────────
const LogoBridge = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Row scale={scale} color={color}>
    <svg width={64 * scale} height={56 * scale} viewBox="0 0 64 56" aria-hidden>
      <line x1="4" y1="40" x2="60" y2="40" stroke={color} strokeWidth="1.4" strokeOpacity="0.3" />
      <path d="M 4 40 Q 32 8, 60 40" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <circle cx="4" cy="40" r="3" fill={accent} />
      <circle cx="60" cy="40" r="3" fill={accent} />
      <circle cx="32" cy="14" r="2.6" fill={accent}
        style={{ animation: "bloom 2.4s ease-in-out infinite", transformOrigin: "32px 14px" }} />
    </svg>
    <W scale={scale} color={color} accent={accent} />
  </Row>
);

// ─── 32. BLOOM — flower-petal expand on hover ────────────
const LogoBloom = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <Row scale={scale} color={color}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ cursor: "pointer" }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
          const r = hover ? 14 : 6;
          const rad = a * Math.PI / 180;
          const cx = 28 + Math.cos(rad) * r;
          const cy = 28 + Math.sin(rad) * r;
          return (
            <circle key={a} cx={cx} cy={cy} r="3.6" fill={accent}
              opacity={0.5 + (i % 2) * 0.3}
              style={{ transition: "cx .4s var(--ease-out-quart), cy .4s var(--ease-out-quart)" }} />
          );
        })}
        <circle cx="28" cy="28" r="3.4" fill={color} />
      </svg>
      <W scale={scale} color={color} accent={accent} />
    </Row>
  );
};

// ─── Card wrapper — minimal ──────────────────────────────
const LogoCardLite = ({ n, name, tagline, why, children }) => (
  <div style={{
    background: "var(--card)", border: "1px solid var(--rule-on)",
    borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column",
    boxShadow: "var(--sh-1)",
  }}>
    <div style={{ padding: "14px 18px 0", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span className="mono" style={{ fontSize: 10, color: "var(--volt)" }}>{n}</span>
      <span className="mono" style={{ fontSize: 9, color: "var(--bone-mute)" }}>vol.3</span>
    </div>
    <div style={{ padding: "4px 18px 14px" }}>
      <div className="serif" style={{ fontSize: 20, color: "var(--ink)", fontWeight: 500, letterSpacing: "-0.02em" }}>{name}</div>
      <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{tagline}</div>
    </div>
    <div style={{
      background: "var(--page)", padding: "32px 18px",
      display: "flex", alignItems: "center", justifyContent: "center", minHeight: 110,
      borderTop: "1px solid var(--rule-on)", borderBottom: "1px solid var(--rule-on)",
    }}>
      {React.cloneElement(children, { scale: 0.95 })}
    </div>
    <div className="on-ink" style={{
      background: "var(--ink)", padding: "18px",
      display: "flex", alignItems: "center", justifyContent: "center",
      borderTop: "1px solid var(--rule-on)",
    }}>
      {React.cloneElement(children, { scale: 0.7, color: "#FFFFFF", accent: "var(--volt)" })}
    </div>
    <div style={{ padding: "12px 18px 16px", background: "var(--card)", borderTop: "1px solid var(--rule-on)" }}>
      <p style={{ fontSize: 12, color: "var(--bone-soft)", lineHeight: 1.5, margin: 0 }}>{why}</p>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────
const LogoLab3Page = () => (
  <div>
    <LogoStyles />
    <LogoLab2Styles />
    <LogoLab3Styles />

    <section style={{ position: "relative", overflow: "hidden" }}>
      <AuroraMesh intensity={0.6} />
      <Orb size={620} color="var(--volt-glow)" style={{ top: -160, right: -120 }} />
      <div className="r-padbox" style={{ maxWidth: 1320, margin: "0 auto", padding: "72px 32px 36px", position: "relative" }}>
        <div className="upper" style={{ color: "var(--volt)" }}>Logo Lab · volume 3</div>
        <h1 className="serif h1-fluid" style={{ fontSize: 96, lineHeight: 0.96, letterSpacing: "-0.035em", margin: "14px 0 22px", color: "var(--ink)", fontWeight: 500, maxWidth: 1100 }}>
          Vingt nouvelles directions <em style={{ color: "var(--volt)" }}>pour Echowai.</em>
        </h1>
        <p className="body-fluid" style={{ fontSize: 17, color: "var(--bone-soft)", lineHeight: 1.55, maxWidth: 820, margin: 0 }}>
          Au-delà des 12 précédents, cette troisième série explore des registres plus variés — institutionnels (sceau, coffre), narratifs (pont, phare), data (compteur, halftone), type (glyphe), motion (ECG, ADN, éclipse) et physiques (boussole, radar, réseau).
        </p>
      </div>
    </section>

    <section className="r-padbox section-pad" style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 32px 80px" }}>
      <div className="upper" style={{ color: "var(--muted)", marginBottom: 18 }}>Géométriques · structurels</div>
      <div className="r-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <LogoCardLite n="13" name="Spiral"        tagline="L'écho qui s'enroule" why="Spirale qui se redessine en boucle de 0 à 360°, terminée par un point au sommet. Forme classique mais animation singulière — la trace s'efface puis revient.">
          <LogoSpiral /></LogoCardLite>
        <LogoCardLite n="14" name="Compass"       tagline="Boussole CEE" why="Aiguille tournante lente sur cadran cardinal. Évoque l'orientation, la direction — l'apporteur qui guide son bénéficiaire dans le dispositif.">
          <LogoCompass /></LogoCardLite>
        <LogoCardLite n="15" name="Constellation" tagline="Réseau de points" why="8 étoiles reliées formant un réseau qui clignote en cascade. Évoque la communauté de partenaires, le maillage territorial.">
          <LogoConstellation /></LogoCardLite>
        <LogoCardLite n="16" name="Bridge"        tagline="Du devis à la prime" why="Arche qui relie deux points fermes, avec un sommet qui pulse. Métaphore narrative directe du parcours EchoWAI.">
          <LogoBridge /></LogoCardLite>
      </div>

      <div className="upper" style={{ color: "var(--muted)", margin: "40px 0 18px" }}>Motion · physiques</div>
      <div className="r-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <LogoCardLite n="17" name="Lighthouse" tagline="Phare énergétique" why="Faisceau lumineux qui balaye 360° en continu. Évoque la visibilité, la guidance — l'apporteur qui éclaire le bénéficiaire.">
          <LogoLighthouse /></LogoCardLite>
        <LogoCardLite n="18" name="DNA"        tagline="Brins entrelacés" why="Deux brins sinusoïdaux qui s'enlacent, avec des liaisons. Évoque l'expertise + le bénéficiaire qui collaborent pour une opération.">
          <LogoDNA /></LogoCardLite>
        <LogoCardLite n="19" name="Inkdrop"    tagline="L'impact qui se propage" why="Goutte d'encre qui tombe et déclenche un ripple. L'écho devient acte concret — un dépôt qui se propage en versement.">
          <LogoInkdrop /></LogoCardLite>
        <LogoCardLite n="20" name="Eclipse"    tagline="Phases de couverture" why="Deux disques qui dérivent l'un sur l'autre. Métaphore : la prime CEE qui couvre progressivement le coût des travaux jusqu'à la totalité.">
          <LogoEclipse /></LogoCardLite>
      </div>

      <div className="upper" style={{ color: "var(--muted)", margin: "40px 0 18px" }}>Data · indicateurs</div>
      <div className="r-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <LogoCardLite n="21" name="Battery"  tagline="Énergie stockée" why="Cellule de batterie qui se remplit puis se vide en boucle douce. Métaphore directe d'économie d'énergie cumulée.">
          <LogoBattery /></LogoCardLite>
        <LogoCardLite n="22" name="ECG"      tagline="Pulse de la plateforme" why="Ligne ECG qui défile — bat cardiaque de la plateforme. Évoque la vie, l'activité, la santé du dispositif.">
          <LogoECG /></LogoCardLite>
        <LogoCardLite n="23" name="Tally"    tagline="Compteur incrémental" why="Compteur de dossiers qui s'incrémente toutes les 2,4 s — la plateforme est active 24/7. Forte sensation de mouvement permanent.">
          <LogoTally /></LogoCardLite>
        <LogoCardLite n="24" name="Halftone" tagline="Onde en demi-tons" why="Grille de points dont la taille forme une onde. Hommage typo-print, distinctif éditorial. Animation par cellule, jamais agressive.">
          <LogoHalftone /></LogoCardLite>
      </div>

      <div className="upper" style={{ color: "var(--muted)", margin: "40px 0 18px" }}>Institutionnels · sceaux</div>
      <div className="r-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <LogoCardLite n="25" name="Stamp"     tagline="Sceau officiel" why="Tampon circulaire qui s'imprime avec un micro-rebond toutes les 3 s. Codes 'document officiel' modernisés — la marque devient un acte d'authentification.">
          <LogoStamp /></LogoCardLite>
        <LogoCardLite n="26" name="Vault"     tagline="Coffre-fort" why="Combinaison qui tourne vers une position. Évoque la sécurité, le chiffrement des pièces justificatives — argument de confiance fort.">
          <LogoVault /></LogoCardLite>
        <LogoCardLite n="27" name="Stamp+CEE" tagline="Variante avec millésime" why="(voir n°25) — variante institutionnelle. À combiner avec une typographie monospace pour les documents administratifs.">
          <LogoStamp /></LogoCardLite>
        <LogoCardLite n="28" name="Radar"     tagline="Détection en continu" why="Radar avec sweep + blip détecté. Suggère que la plateforme surveille les opportunités CEE pour ses utilisateurs.">
          <LogoRadar /></LogoCardLite>
      </div>

      <div className="upper" style={{ color: "var(--muted)", margin: "40px 0 18px" }}>Type-led · narratifs</div>
      <div className="r-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <LogoCardLite n="29" name="Ticker"     tagline="Wordmark + ligne info" why="Le wordmark surplombe un ticker qui défile en continu — cours, dossiers, délais. Information utile fusionnée à l'identité.">
          <LogoTicker /></LogoCardLite>
        <LogoCardLite n="30" name="Glyph Dot"  tagline="Le 'i' qui rayonne" why="Le point du i de wai est remplacé par un cercle pulsant avec halo orbital. Le mark vit DANS la typographie — pas à côté.">
          <LogoGlyphDot /></LogoCardLite>
        <LogoCardLite n="31" name="Phase"      tagline="Deux cercles" why="Deux disques qui se croisent en phase opposée. Minimal, mémorable, fonctionne en favicon comme en bannière.">
          <LogoPhase /></LogoCardLite>
        <LogoCardLite n="32" name="Network"    tagline="Graphe de partenaires" why="Réseau de 8 nœuds + arêtes qui clignotent en cascade. Évoque l'écosystème EchoWAI : apporteurs, obligés, bénéficiaires.">
          <LogoNetwork /></LogoCardLite>
      </div>

      {/* Bloom — bonus interactive */}
      <div style={{ marginTop: 40 }} className="r-cols-4">
        <div className="upper" style={{ color: "var(--muted)", marginBottom: 18 }}>Bonus · interactif</div>
        <div style={{ maxWidth: 400 }}>
          <LogoCardLite n="33" name="Bloom" tagline="Survolez pour ouvrir" why="8 pétales qui s'écartent au survol. Tactile, organique. La marque s'ouvre à l'utilisateur.">
            <LogoBloom />
          </LogoCardLite>
        </div>
      </div>

      {/* Summary panel */}
      <div style={{
        marginTop: 60, padding: 40, background: "var(--ink)", color: "#fff", borderRadius: 8,
      }} className="on-ink">
        <div className="upper" style={{ color: "var(--volt)" }}>Récapitulatif</div>
        <h3 className="serif" style={{ fontSize: 28, color: "#fff", fontWeight: 500, marginTop: 8, letterSpacing: "-0.02em" }}>
          32 propositions au total — 3 volumes
        </h3>
        <div className="r-cols-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginTop: 24, fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,.75)" }}>
          <div>
            <strong style={{ color: "var(--volt)" }}>Volume 1</strong><br/>
            Sonar · Waveform · Monogram · Frequency · Beam · Shell
          </div>
          <div>
            <strong style={{ color: "var(--volt)" }}>Volume 2</strong><br/>
            Echo Trail · Live Index · Pressable · Particles · Aperture · Field
          </div>
          <div>
            <strong style={{ color: "var(--volt)" }}>Volume 3</strong><br/>
            Spiral · Compass · Constellation · Bridge · Lighthouse · DNA · Inkdrop · Eclipse · Battery · ECG · Tally · Halftone · Stamp · Vault · Radar · Ticker · Glyph Dot · Phase · Network · Bloom
          </div>
        </div>
      </div>
    </section>
  </div>
);

Object.assign(window, {
  LogoLab3Page, LogoLab3Styles, LogoCardLite,
  LogoSpiral, LogoCompass, LogoConstellation, LogoLighthouse, LogoDNA,
  LogoInkdrop, LogoPhase, LogoBattery, LogoECG, LogoTally, LogoHalftone,
  LogoStamp, LogoVault, LogoTicker, LogoGlyphDot, LogoEclipse, LogoNetwork,
  LogoRadar, LogoBridge, LogoBloom,
});
