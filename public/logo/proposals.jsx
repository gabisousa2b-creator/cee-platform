/* eslint-disable */
// EchoWAI — Propositions de logos améliorés (signature + interactifs + EMMY-aware).
// Tous les composants partagent la même API : { scale, color, accent }.
// Tous consomment useEmmy() (déjà fourni par vol4 via CeePriceProvider).

// Helpers locaux — recopiés depuis vol4/vol5 pour ne pas dépendre du chargement complet
const _hue = (t) => t > 0 ? "#16a34a" : t < 0 ? "#ea580c" : "var(--volt, #2E7EF4)";
const _norm = (v) => {
  const B = 9.10, band = 0.05;
  const lo = B * (1 - band), hi = B * (1 + band);
  return Math.max(0.05, Math.min(0.95, (v - lo) / (hi - lo)));
};

// ── Sub-line EMMY commune (collée au wordmark, scale prop.) ───────
const _EmmySub = ({ scale = 1, onDark = false, accent = "var(--volt)" }) => {
  const e = window.useEmmy ? window.useEmmy() : { last: 9.10, trend: 0, source: "indicative" };
  const hue = _hue(e.trend);
  return (
    <div className="mono" style={{
      display: "inline-flex", alignItems: "center", gap: 4 * scale, marginTop: 0,
      fontSize: 9 * scale, letterSpacing: ".06em", lineHeight: 1,
      color: onDark ? "rgba(255,255,255,.6)" : "var(--muted, #6b7280)", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 4 * scale, height: 4 * scale, borderRadius: "50%", background: hue, animation: "ew-pulse 2.4s ease-in-out infinite" }} />
      <span style={{ letterSpacing: ".15em" }}>EMMY</span>
      <span style={{ color: onDark ? "rgba(255,255,255,.92)" : "var(--ink, #0a1f3d)", fontWeight: 600 }}>
        {e.last.toFixed(2).replace(".", ",")}
      </span>
      <span>€/MWh</span>
      <span style={{ color: hue, fontWeight: 700 }}>{e.trend > 0 ? "↑" : e.trend < 0 ? "↓" : "→"}</span>
    </div>
  );
};

// ── Wordmark base (texte echo + wai accent) ───────────────────────
const _Mark = ({ scale = 1, color, accent, children, style }) => (
  <span className="serif" style={{
    fontSize: 30 * scale, lineHeight: 1, letterSpacing: "-0.035em",
    fontWeight: 500, color, display: "inline-flex", alignItems: "baseline",
    ...style,
  }}>
    {children}
  </span>
);

// ╔══════════════════════════════════════════════════════════════════╗
// ║ P1 — VOLTAGE SPARK                                                ║
// ║ Éclair latéral qui se charge à chaque tick EMMY. Hover = arcs     ║
// ║ continus. Brightness piloté par la normalisation du prix.         ║
// ╚══════════════════════════════════════════════════════════════════╝
const P1_VoltageSpark = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const e = window.useEmmy ? window.useEmmy() : { last: 9.10, trend: 0 };
  const intensity = _norm(e.last);
  const hue = _hue(e.trend);
  const [hover, setHover] = React.useState(false);
  const onDark = color === "#FFFFFF" || color === "#fff";
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "inline-flex", flexDirection: "column", cursor: "default" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 * scale }}>
        <svg width={20 * scale} height={32 * scale} viewBox="0 0 20 32" aria-hidden style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id={"sg" + scale} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={hue} stopOpacity={0.4 + 0.6 * intensity} />
              <stop offset="1" stopColor={accent} stopOpacity={0.7} />
            </linearGradient>
            <filter id={"sgf" + scale} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.6" />
            </filter>
          </defs>
          {/* Background arcs (only on hover) */}
          {hover && [0, 1, 2].map(i => (
            <path key={i}
              d="M 10 4 Q 14 10 8 16 Q 4 22 12 28"
              fill="none" stroke={hue} strokeWidth="0.8"
              strokeLinecap="round" opacity={0.4 - i * 0.1}
              style={{ animation: `ew-arc ${1.2 + i * 0.2}s ${i * 0.15}s ease-out infinite` }}
            />
          ))}
          {/* Main bolt */}
          <path d="M 12 2 L 6 14 L 11 14 L 8 30 L 16 14 L 11 14 Z"
            fill={"url(#sg" + scale + ")"} filter={"url(#sgf" + scale + ")"}
            style={{ transition: "fill .6s ease", animation: "ew-jolt 4.8s ease-in-out infinite" }}
          />
          <path d="M 12 2 L 6 14 L 11 14 L 8 30 L 16 14 L 11 14 Z"
            fill="none" stroke={hue} strokeWidth="0.6" strokeLinejoin="round" opacity="0.9"
          />
        </svg>
        <_Mark scale={scale} color={color} accent={accent}>
          echo<span style={{ color: accent }}>wai</span>
        </_Mark>
      </div>
      <div style={{ paddingLeft: 28 * scale }}>
        <_EmmySub scale={scale} onDark={onDark} accent={accent} />
      </div>
    </div>
  );
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║ P2 — LIVE SPARKLINE                                               ║
// ║ Sparkline EMMY (14 ticks) intégré sous le wordmark. Point         ║
// ║ terminal pulse. Hover affiche min/max/Δ.                          ║
// ╚══════════════════════════════════════════════════════════════════╝
const P2_LiveSparkline = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const e = window.useEmmy ? window.useEmmy() : { last: 9.10, trend: 0, series: Array(14).fill(9.10) };
  const series = e.series || Array(14).fill(e.last);
  const hue = _hue(e.trend);
  const [hover, setHover] = React.useState(false);
  const W = 200, H = 22, P = 2;
  const lo = Math.min(...series), hi = Math.max(...series);
  const range = Math.max(0.01, hi - lo);
  const pts = series.map((v, i) => ({
    x: P + (i / (series.length - 1)) * (W - 2 * P),
    y: P + (1 - (v - lo) / range) * (H - 2 * P),
  }));
  const path = "M " + pts.map(p => p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" L ");
  const fill = path + ` L ${W - P} ${H - P} L ${P} ${H - P} Z`;
  const last = pts[pts.length - 1];
  const onDark = color === "#FFFFFF" || color === "#fff";
  const delta = ((e.last - series[0]) / series[0]) * 100;
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "inline-flex", flexDirection: "column", gap: 1 * scale }}>
      <_Mark scale={scale} color={color} accent={accent}>
        echo<span style={{ color: accent }}>wai</span>
      </_Mark>
      <div style={{ position: "relative", width: W * scale, height: H * scale }}>
        <svg width={W * scale} height={H * scale} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }} aria-hidden>
          <defs>
            <linearGradient id={"sl" + scale} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={hue} stopOpacity="0.35" />
              <stop offset="1" stopColor={hue} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={fill} fill={"url(#sl" + scale + ")"} style={{ transition: "d .6s var(--ease-out-quart, ease-out)" }} />
          <path d={path} fill="none" stroke={hue} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "d .6s var(--ease-out-quart, ease-out), stroke .6s ease" }}
          />
          <circle cx={last.x} cy={last.y} r="2" fill={hue} />
          <circle cx={last.x} cy={last.y} r="4" fill="none" stroke={hue} strokeWidth="0.8" opacity="0.5"
            style={{ animation: "ew-trail 1.6s ease-out infinite" }}
          />
        </svg>
        {hover && (
          <div className="mono" style={{
            position: "absolute", right: 0, top: -10 * scale,
            fontSize: 8 * scale, color: onDark ? "rgba(255,255,255,.78)" : "var(--ink, #0a1f3d)",
            background: onDark ? "rgba(0,0,0,.6)" : "rgba(255,255,255,.9)",
            padding: "1px 5px", borderRadius: 3, border: `1px solid ${hue}33`,
          }}>
            {delta >= 0 ? "+" : ""}{delta.toFixed(2)}%
          </div>
        )}
      </div>
      <div className="mono" style={{
        fontSize: 8.5 * scale, letterSpacing: ".08em",
        color: onDark ? "rgba(255,255,255,.55)" : "var(--muted, #6b7280)", marginTop: 1 * scale,
      }}>
        EMMY · {e.last.toFixed(2).replace(".", ",")} €/MWh
      </div>
    </div>
  );
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║ P3 — ORBITAL TRIO                                                 ║
// ║ 3 satellites en orbite autour du "o" de echo, vitesse pilotée par ║
// ║ le prix EMMY. Hover → orbites figées en triangle de référence.    ║
// ╚══════════════════════════════════════════════════════════════════╝
const P3_OrbitalTrio = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const e = window.useEmmy ? window.useEmmy() : { last: 9.10, trend: 0 };
  const hue = _hue(e.trend);
  const speed = 3 + (1 - _norm(e.last)) * 6; // 3s (cher) → 9s (bas)
  const [hover, setHover] = React.useState(false);
  const onDark = color === "#FFFFFF" || color === "#fff";
  // The "o" of echo is the 2nd char — overlay orbits at its position
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "inline-flex", flexDirection: "column" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <_Mark scale={scale} color={color} accent={accent}>
          ech<span style={{ position: "relative", display: "inline-block" }}>
            o
            <span aria-hidden style={{
              position: "absolute", left: "50%", top: "50%",
              width: 0, height: 0, pointerEvents: "none",
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  position: "absolute",
                  width: 4 * scale, height: 4 * scale,
                  borderRadius: "50%",
                  background: i === 0 ? hue : accent,
                  marginLeft: -2 * scale, marginTop: -2 * scale,
                  offsetPath: `circle(${17 * scale}px at 0px 0px)`,
                  offsetDistance: hover ? `${(i * 33.33)}%` : "0%",
                  animation: hover ? "none" : `ew-orbit ${speed}s linear infinite`,
                  animationDelay: `${-(speed / 3) * i}s`,
                  transition: "background .6s ease, offset-distance .6s ease",
                  boxShadow: `0 0 ${5 * scale}px ${i === 0 ? hue : accent}`,
                }} />
              ))}
            </span>
          </span>
          <span style={{ color: accent }}>wai</span>
        </_Mark>
      </div>
      <_EmmySub scale={scale} onDark={onDark} accent={accent} />
    </div>
  );
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║ P4 — VAULT DIAL                                                   ║
// ║ Cadran de coffre-fort à gauche, l'aiguille pointe la position du  ║
// ║ prix EMMY dans la bande ±5%. Tick = micro-rotation. Click = open. ║
// ╚══════════════════════════════════════════════════════════════════╝
const P4_VaultDial = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const e = window.useEmmy ? window.useEmmy() : { last: 9.10, trend: 0 };
  const hue = _hue(e.trend);
  const angle = -135 + _norm(e.last) * 270; // -135° (lo) → +135° (hi)
  const [open, setOpen] = React.useState(false);
  const onDark = color === "#FFFFFF" || color === "#fff";
  React.useEffect(() => { if (!open) return; const t = setTimeout(() => setOpen(false), 700); return () => clearTimeout(t); }, [open]);
  return (
    <div style={{ display: "inline-flex", flexDirection: "column" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 9 * scale }}>
        <svg width={34 * scale} height={34 * scale} viewBox="0 0 34 34" aria-hidden
          onClick={() => setOpen(o => !o)}
          style={{ cursor: "pointer", transition: "transform .6s var(--ease-out-quart, ease-out)" }}
        >
          {/* Outer ring */}
          <circle cx="17" cy="17" r="15.5" fill="none" stroke={color} strokeWidth="1.2" opacity="0.75" />
          {/* Tick marks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30) * Math.PI / 180;
            const x1 = 17 + Math.cos(a) * 13.5, y1 = 17 + Math.sin(a) * 13.5;
            const x2 = 17 + Math.cos(a) * 15.5, y2 = 17 + Math.sin(a) * 15.5;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.7" opacity="0.55" />;
          })}
          {/* Inner dial */}
          <circle cx="17" cy="17" r="11" fill="none" stroke={color} strokeWidth="0.7" opacity="0.5" />
          {/* Needle */}
          <g style={{ transition: "transform .9s var(--ease-out-quart, ease-out)", transform: `rotate(${angle}deg)`, transformOrigin: "17px 17px", transformBox: "view-box" }}>
            <line x1="17" y1="17" x2="17" y2="6.5" stroke={hue} strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="17" cy="17" r="2.4" fill={hue} />
          </g>
          {/* Open ring (flash on click) */}
          {open && <circle cx="17" cy="17" r="15" fill="none" stroke={hue} strokeWidth="1.2" style={{ animation: "ew-burst .7s ease-out forwards" }} />}
        </svg>
        <_Mark scale={scale} color={color} accent={accent}>
          echo<span style={{ color: accent }}>wai</span>
        </_Mark>
      </div>
      <div style={{ paddingLeft: 42 * scale }}>
        <_EmmySub scale={scale} onDark={onDark} accent={accent} />
      </div>
    </div>
  );
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║ P5 — PULSE TRACE (ECG)                                            ║
// ║ Ligne ECG défile sous le wordmark, BPM piloté par la tendance     ║
// ║ (up = rapide, down = lent). Pic en couleur de tendance.           ║
// ╚══════════════════════════════════════════════════════════════════╝
const P5_PulseTrace = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const e = window.useEmmy ? window.useEmmy() : { last: 9.10, trend: 0 };
  const hue = _hue(e.trend);
  const dur = e.trend > 0 ? 1.6 : e.trend < 0 ? 3.2 : 2.4;
  const onDark = color === "#FFFFFF" || color === "#fff";
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 1 * scale }}>
      <_Mark scale={scale} color={color} accent={accent}>
        echo<span style={{ color: accent }}>wai</span>
      </_Mark>
      <svg width={200 * scale} height={18 * scale} viewBox="0 0 200 18" aria-hidden style={{ display: "block" }}>
        <defs>
          <mask id={"ecgMask" + scale}>
            <rect x="0" y="0" width="200" height="18" fill="black" />
            <rect x="0" y="0" width="60" height="18" fill="white" style={{ transformBox: "view-box", transform: "translateX(-60px)", animation: `ew-ecg-sweep ${dur}s linear infinite` }} />
          </mask>
        </defs>
        <line x1="0" y1="9" x2="200" y2="9" stroke={onDark ? "rgba(255,255,255,.25)" : "var(--bone-mute,#cbd5e1)"} strokeWidth="0.6" strokeDasharray="2 3" />
        <path d="M 0 9 L 30 9 L 35 9 L 38 4 L 42 14 L 46 6 L 50 9 L 90 9 L 95 9 L 98 4 L 102 14 L 106 6 L 110 9 L 200 9"
          fill="none" stroke={hue} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: `ew-ecg-march ${dur}s linear infinite` }}
        />
      </svg>
      <div className="mono" style={{
        fontSize: 8.5 * scale, color: onDark ? "rgba(255,255,255,.55)" : "var(--muted,#6b7280)",
        letterSpacing: ".08em", marginTop: 1 * scale,
      }}>
        EMMY · {e.last.toFixed(2).replace(".", ",")} €/MWh · {e.trend > 0 ? "↑" : e.trend < 0 ? "↓" : "→"}
      </div>
    </div>
  );
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║ P6 — ENERGY TOKENS                                                ║
// ║ 5 jetons carrés à droite du wordmark, nombre rempli = position    ║
// ║ EMMY dans la bande (0-5). Survol = tooltip valeur. Tick = ripple. ║
// ╚══════════════════════════════════════════════════════════════════╝
const P6_EnergyTokens = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const e = window.useEmmy ? window.useEmmy() : { last: 9.10, trend: 0 };
  const filled = Math.round(_norm(e.last) * 5); // 0..5
  const hue = _hue(e.trend);
  const onDark = color === "#FFFFFF" || color === "#fff";
  return (
    <div style={{ display: "inline-flex", flexDirection: "column" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10 * scale }}>
        <_Mark scale={scale} color={color} accent={accent}>
          echo<span style={{ color: accent }}>wai</span>
        </_Mark>
        <div style={{ display: "inline-flex", gap: 3 * scale }} title={`EMMY ${e.last.toFixed(2)} €/MWh`}>
          {[0, 1, 2, 3, 4].map(i => (
            <span key={i} style={{
              width: 8 * scale, height: 16 * scale, borderRadius: 1.5,
              background: i < filled ? (i === filled - 1 ? hue : accent) : "transparent",
              border: `1.2px solid ${i < filled ? (i === filled - 1 ? hue : accent) : (onDark ? "rgba(255,255,255,.28)" : "var(--bone-mute,#cbd5e1)")}`,
              transition: "background .5s ease, border-color .5s ease",
              animation: i === filled - 1 ? "ew-pulse 1.8s ease-in-out infinite" : "none",
              opacity: i < filled ? 1 : 0.7,
            }} />
          ))}
        </div>
      </div>
      <_EmmySub scale={scale} onDark={onDark} accent={accent} />
    </div>
  );
};

// ── Keyframes ajoutés au document une fois ─────────────────────────
(function injectKeyframes() {
  if (document.getElementById("ew-proposals-keyframes")) return;
  const css = `
    @keyframes ew-pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(.85)} }
    @keyframes ew-orbit  { to { offset-distance: 100%; } }
    @keyframes ew-trail  { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.6);opacity:0} }
    @keyframes ew-jolt   { 0%,92%,100%{transform:translateY(0)} 95%{transform:translateY(-2px) scaleY(1.08)} 97%{transform:translateY(1px)} }
    @keyframes ew-arc    { 0%{stroke-dasharray:0 60; opacity:.6} 100%{stroke-dasharray:60 0; opacity:0} }
    @keyframes ew-burst  { 0%{transform:scale(.9);opacity:.9} 100%{transform:scale(1.3);opacity:0} }
    @keyframes ew-ecg-march { 0%{stroke-dashoffset:200;stroke-dasharray:60 200} 100%{stroke-dashoffset:0} }
    @keyframes ew-ecg-sweep { 0%{transform:translateX(-60px)} 100%{transform:translateX(200px)} }
  `;
  const s = document.createElement("style");
  s.id = "ew-proposals-keyframes";
  s.textContent = css;
  document.head.appendChild(s);
})();

// ── Registre exposé ─────────────────────────────────────────────────
window.EW_PROPOSALS = [
  { n: "P1", name: "Voltage Spark",    why: "Éclair latéral qui se charge à chaque tick. Hover = arcs continus. Signature énergétique forte.", C: P1_VoltageSpark },
  { n: "P2", name: "Live Sparkline",   why: "Sparkline EMMY (14 ticks) intégré au logo. Hover = Δ%. Data-driven, identité info-graphique.", C: P2_LiveSparkline },
  { n: "P3", name: "Orbital Trio",     why: "3 satellites autour du 'o'. Vitesse pilotée par le prix. Hover fige l'orbite en triangle.", C: P3_OrbitalTrio },
  { n: "P4", name: "Vault Dial",       why: "Cadran de coffre, aiguille = position prix dans la bande. Click = animation d'ouverture.", C: P4_VaultDial },
  { n: "P5", name: "Pulse Trace",      why: "ECG défilant, BPM piloté par la tendance (up = rapide). Confiance, vitalité plateforme.", C: P5_PulseTrace },
  { n: "P6", name: "Energy Tokens",    why: "5 jetons carrés, remplissage = normalisation prix (0-5). Lecture instantanée du niveau.", C: P6_EnergyTokens },
];
