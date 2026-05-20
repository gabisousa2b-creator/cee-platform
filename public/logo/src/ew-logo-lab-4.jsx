/* eslint-disable */
// Echowai — Logo Lab vol. 4
// Global EMMY price context + 17 new logos, each consuming the cours.

// ─────────────────────────────────────────────────────────
// CEE EMMY price — single shared provider
// ─────────────────────────────────────────────────────────
const CeePriceContext = React.createContext(null);

const CeePriceProvider = ({ children, endpoint }) => {
  // useCeePrice is defined in src/logo-lab-2.jsx — same shape: { series, last, trend, source }
  const value = useCeePrice({ endpoint });
  return <CeePriceContext.Provider value={value}>{children}</CeePriceContext.Provider>;
};

// Fallback for logos rendered outside a provider — gives a stable indicative value.
const useEmmy = () => {
  const ctx = React.useContext(CeePriceContext);
  if (ctx) return ctx;
  // Standalone fallback — each logo gets its own tiny ticker
  return useCeePrice({});
};

// Helpers used by many logos
const emmyHue = (trend) => trend > 0 ? "var(--st-valide)" : trend < 0 ? "var(--signal-stop)" : "var(--volt)";
const emmyNorm = (v) => {
  const lo = CEE_BASELINE * (1 - CEE_BAND);
  const hi = CEE_BASELINE * (1 + CEE_BAND);
  return Math.max(0.05, Math.min(0.95, (v - lo) / (hi - lo)));
};
const emmyLabel = (last, trend, source, scale = 1) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: emmyHue(trend) }} className="volt-dot" />
    <span className="mono" style={{ fontSize: 9.5 * scale, color: "var(--muted)", letterSpacing: ".06em" }}>
      EMMY · {last.toFixed(2)} €/MWh
    </span>
    <span className="mono" style={{ fontSize: 9.5 * scale, color: emmyHue(trend), fontWeight: 600 }}>
      {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"}
    </span>
    <span className="mono" style={{ fontSize: 8.5 * scale, color: "var(--bone-mute)" }}>
      · {source === "emmy" ? "live" : "indicatif"}
    </span>
  </div>
);

// Compact wordmark with EMMY underline
const WordmarkEmmy = ({ scale, color, accent, last, trend, source }) => (
  <div style={{ display: "inline-flex", flexDirection: "column" }}>
    <span className="serif" style={{
      fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em",
      fontWeight: 500, color,
    }}>
      echo<span style={{ color: accent }}>wai</span>
    </span>
    {emmyLabel(last, trend, source, scale)}
  </div>
);

// ─── 34. HEATBOX — 5×5 grid that pulses on each EMMY tick ─
const LogoHeatbox = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { series, last, trend, source } = useEmmy();
  const norm = emmyNorm(last);
  // 25 cells, intensity radiates from center weighted by price
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
        {Array.from({ length: 25 }).map((_, i) => {
          const x = i % 5, y = Math.floor(i / 5);
          const cx = 8 + x * 10, cy = 8 + y * 10;
          const dist = Math.hypot(x - 2, y - 2);
          const heat = Math.max(0, 1 - dist / 2.8) * norm;
          return (
            <rect key={i} x={cx - 3.5} y={cy - 3.5} width="7" height="7" rx="1"
              fill={heat > 0.5 ? emmyHue(trend) : accent} opacity={0.15 + heat * 0.85} />
          );
        })}
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 35. BAR MARQUEE — last N prices as right-anchored bars ─
const LogoBarMarquee = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { series, last, trend, source } = useEmmy();
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={64 * scale} height={56 * scale} viewBox="0 0 64 56" aria-hidden>
        {series.slice(-12).map((v, i) => {
          const n = emmyNorm(v);
          const h = 4 + n * 32;
          return <rect key={i} x={4 + i * 5} y={28 - h / 2} width="3.4" height={h}
            rx="1" fill={i === 11 ? emmyHue(trend) : accent} opacity={0.4 + (i / 12) * 0.6}
            style={{ transition: "all .8s var(--ease-out-quart)" }} />;
        })}
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 36. STRAND — single horizontal line, thickness = price ─
const LogoStrand = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { series, last, trend, source } = useEmmy();
  const norm = emmyNorm(last);
  const sw = 1 + norm * 5;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
        <line x1="4" y1="28" x2="52" y2="28" stroke={accent} strokeWidth={sw}
          strokeLinecap="round" style={{ transition: "stroke-width .9s var(--ease-out-quart)" }} />
        <circle cx="52" cy="28" r={2 + norm * 2.5} fill={emmyHue(trend)}
          style={{ transition: "r .9s var(--ease-out-quart), fill .3s" }} />
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 37. ECHO COIN — disk flips on each new EMMY tick ─────
const LogoEchoCoin = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last, trend, source } = useEmmy();
  const [flips, setFlips] = React.useState(0);
  const prevRef = React.useRef(last);
  React.useEffect(() => {
    if (prevRef.current !== last) { setFlips(f => f + 1); prevRef.current = last; }
  }, [last]);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <div style={{ width: 48 * scale, height: 48 * scale, perspective: 200 }}>
        <div style={{
          width: "100%", height: "100%", position: "relative",
          transform: `rotateY(${flips * 180}deg)`,
          transition: "transform .9s var(--ease-out-quart)",
          transformStyle: "preserve-3d",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            borderRadius: "50%", background: accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontFamily: "var(--font-display)", fontSize: 18 * scale, fontWeight: 500,
            backfaceVisibility: "hidden",
          }}>e</div>
          <div style={{
            position: "absolute", inset: 0,
            borderRadius: "50%", background: "var(--ink)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: accent, fontFamily: "var(--font-mono)", fontSize: 9 * scale,
            transform: "rotateY(180deg)", backfaceVisibility: "hidden",
          }}>{last.toFixed(2)}</div>
        </div>
      </div>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 38. LIQUID DISC — circle fills bottom-up to price ─────
const LogoLiquidDisc = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last, trend, source } = useEmmy();
  const fillY = 50 - emmyNorm(last) * 44; // 50 at low, 6 at high (within 56-vb)
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
        <defs>
          <clipPath id={`disc-${last.toFixed(2)}`}>
            <circle cx="28" cy="28" r="22" />
          </clipPath>
        </defs>
        <circle cx="28" cy="28" r="22" fill="var(--card-2)" stroke={accent} strokeWidth="1.4" />
        <rect x="0" y={fillY} width="56" height="56" fill={accent}
          clipPath={`url(#disc-${last.toFixed(2)})`}
          style={{ transition: "y .9s var(--ease-out-quart)" }} />
        <text x="28" y="32" fontSize="9" fontFamily="var(--font-mono)" fill={color} textAnchor="middle" letterSpacing="0.8">
          {last.toFixed(2)}
        </text>
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 39. TUNING FORK — vibrates per tick ──────────────────
const LogoTuningFork = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last, trend, source } = useEmmy();
  const [vib, setVib] = React.useState(0);
  const prev = React.useRef(last);
  React.useEffect(() => {
    if (prev.current !== last) { setVib(v => v + 1); prev.current = last; }
  }, [last]);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={48 * scale} height={56 * scale} viewBox="0 0 48 56" aria-hidden
        key={vib} style={{ animation: "phaseA 1.2s ease-in-out" }}>
        <line x1="24" y1="42" x2="24" y2="52" stroke={color} strokeWidth="2" />
        <line x1="16" y1="8"  x2="16" y2="42" stroke={accent} strokeWidth="2" />
        <line x1="32" y1="8"  x2="32" y2="42" stroke={accent} strokeWidth="2" />
        <line x1="16" y1="42" x2="32" y2="42" stroke={color} strokeWidth="2" />
        <circle cx="16" cy="6" r="2" fill={accent} />
        <circle cx="32" cy="6" r="2" fill={accent} />
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 40. WAVE STACK — 3 sine waves, speeds proportional to volatility ─
const LogoWaveStack = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { series, last, trend, source } = useEmmy();
  const vol = Math.abs(series[series.length - 1] - series[series.length - 4]) || 0.01;
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf; let s0 = performance.now();
    const loop = (now) => { setT((now - s0) / 1000); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const N = 24, vbW = 56;
  const wave = (yBase, phaseOffset, amp) => "M " + Array.from({ length: N + 1 }, (_, i) => {
    const x = (i / N) * vbW;
    const y = yBase + Math.sin((i / N) * Math.PI * 3 + t * (1 + vol * 4) + phaseOffset) * amp;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" L ");
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
        <path d={wave(18, 0, 4)} fill="none" stroke={accent} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
        <path d={wave(28, 1.2, 6)} fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
        <path d={wave(38, 2.4, 4)} fill="none" stroke={accent} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 41. SONAR PING — single ring emits exactly on tick ───
const LogoSonarPing = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last, trend, source } = useEmmy();
  const [pings, setPings] = React.useState([]);
  const prev = React.useRef(last);
  React.useEffect(() => {
    if (prev.current !== last) {
      const id = Math.random();
      setPings(p => [...p, id]);
      setTimeout(() => setPings(p => p.filter(x => x !== id)), 1500);
      prev.current = last;
    }
  }, [last]);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
        {pings.map(id => (
          <circle key={id} cx="28" cy="28" r="6"
            fill="none" stroke={emmyHue(trend)} strokeWidth="1.5"
            style={{
              transformOrigin: "28px 28px",
              animation: "pressBurst 1.5s var(--ease-out-quart) forwards",
            }} />
        ))}
        <circle cx="28" cy="28" r="3.4" fill={emmyHue(trend)} />
        <circle cx="28" cy="28" r="6" fill="none" stroke={accent} strokeOpacity="0.3" strokeWidth="1" />
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 42. SPIROGRAPH — petals proportional to price ────────
const LogoSpirograph = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last, trend, source } = useEmmy();
  const petals = 5 + Math.round(emmyNorm(last) * 6); // 5..11
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden
        style={{ animation: "spinSlow 16s linear infinite", transformOrigin: "28px 28px" }}>
        {Array.from({ length: petals }).map((_, i) => {
          const a = (i / petals) * Math.PI * 2;
          const cx = 28 + Math.cos(a) * 10;
          const cy = 28 + Math.sin(a) * 10;
          return <circle key={i} cx={cx} cy={cy} r="8" fill="none" stroke={accent} strokeWidth="1" opacity="0.45" />;
        })}
        <circle cx="28" cy="28" r="3" fill={emmyHue(trend)} />
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 43. TAPE REEL — two reels turning, tape between ──────
const LogoTapeReel = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { series, last, trend, source } = useEmmy();
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={72 * scale} height={56 * scale} viewBox="0 0 72 56" aria-hidden>
        <rect x="4" y="22" width="64" height="14" rx="2" fill="var(--card-2)" stroke={color} strokeWidth="1.2" strokeOpacity="0.3" />
        <text x="36" y="32" fontSize="7" fontFamily="var(--font-mono)" fill={accent} textAnchor="middle" letterSpacing="0.8">
          {last.toFixed(2)} €/MWh
        </text>
        {[14, 58].map((cx, i) => (
          <g key={i} style={{ transformOrigin: `${cx}px 28px`, animation: `spinSlow ${4 + i}s linear infinite ${i === 1 ? "reverse" : ""}` }}>
            <circle cx={cx} cy="28" r="10" fill="var(--card)" stroke={color} strokeWidth="1.2" />
            <circle cx={cx} cy="28" r="3" fill={accent} />
            <line x1={cx - 8} y1="28" x2={cx + 8} y2="28" stroke={color} strokeWidth="0.6" />
          </g>
        ))}
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 44. HOURGLASS — sand falls, refills with each tick ───
const LogoHourglass = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last, trend, source } = useEmmy();
  const [flip, setFlip] = React.useState(0);
  const prev = React.useRef(last);
  React.useEffect(() => {
    if (prev.current !== last) { setFlip(f => f + 1); prev.current = last; }
  }, [last]);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={48 * scale} height={56 * scale} viewBox="0 0 48 56" aria-hidden
        key={flip} style={{
          transformOrigin: "24px 28px",
          animation: "spinFast .9s var(--ease-out-quart)",
        }}>
        <path d="M 10 6 L 38 6 L 38 12 L 26 28 L 38 44 L 38 50 L 10 50 L 10 44 L 22 28 L 10 12 Z"
          fill="none" stroke={color} strokeWidth="1.4" />
        <path d="M 11 50 L 24 36 L 37 50 Z" fill={accent} opacity="0.5" />
        <line x1="24" y1="28" x2="24" y2="44" stroke={accent} strokeWidth="1" />
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 45. POLYGON MORPH — n-gon where n = floor(price) ─────
const LogoPolygonMorph = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last, trend, source } = useEmmy();
  const n = Math.max(3, Math.round(last)); // 3-12-ish
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return `${(28 + Math.cos(a) * 20).toFixed(1)},${(28 + Math.sin(a) * 20).toFixed(1)}`;
  }).join(" ");
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
        <polygon points={pts} fill="none" stroke={accent} strokeWidth="1.6" strokeLinejoin="round"
          style={{ transition: "all .7s var(--ease-out-quart)" }} />
        <text x="28" y="32" fontSize="11" fontFamily="var(--font-mono)" fill={emmyHue(trend)} textAnchor="middle" fontWeight="600">
          {n}
        </text>
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 46. STACK BARS — 5 stacked vertical bars, top = current ─
const LogoStackBars = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { series, last, trend, source } = useEmmy();
  const recent = series.slice(-5);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
        {recent.map((v, i) => {
          const w = emmyNorm(v) * 40 + 8;
          return <rect key={i} x="8" y={10 + i * 8} width={w} height="6" rx="1"
            fill={i === 4 ? emmyHue(trend) : accent} opacity={0.4 + (i / 4) * 0.6}
            style={{ transition: "width .8s var(--ease-out-quart)" }} />;
        })}
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 47. COMET — orbiting trail, speed = price ─────────────
const LogoComet = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last, trend, source } = useEmmy();
  const speed = 6 + (1 - emmyNorm(last)) * 8; // faster when low
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
        <circle cx="28" cy="28" r="18" fill="none" stroke={color} strokeOpacity="0.16" strokeWidth="1" />
        <g style={{ transformOrigin: "28px 28px", animation: `spinSlow ${speed}s linear infinite` }}>
          <circle cx="28" cy="10" r="3" fill={emmyHue(trend)} />
          <line x1="28" y1="10" x2="32" y2="2" stroke={emmyHue(trend)} strokeWidth="1.2" strokeOpacity="0.5" strokeLinecap="round" />
        </g>
        <circle cx="28" cy="28" r="2" fill={color} />
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 48. BOUNCING — physics ball, height = price ──────────
const LogoBouncing = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last, trend, source } = useEmmy();
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf; let s0 = performance.now();
    const loop = (now) => { setT((now - s0) / 1000); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const h = 8 + emmyNorm(last) * 32;
  const y = 44 - Math.abs(Math.sin(t * 3)) * h;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
        <line x1="6" y1="44" x2="50" y2="44" stroke={color} strokeOpacity="0.3" strokeWidth="1" />
        <circle cx="28" cy={y} r="5" fill={emmyHue(trend)} />
        <ellipse cx="28" cy="46" rx={5 + (44 - y) * 0.1} ry="1.5" fill={color} opacity="0.18" />
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 49. IRIS — 4 quadrant arcs at different speeds ───────
const LogoIris = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last, trend, source } = useEmmy();
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 56 56" aria-hidden>
        {[8, 14, 20].map((r, i) => (
          <g key={r} style={{
            transformOrigin: "28px 28px",
            animation: `${i % 2 === 0 ? "spinSlow" : "spinFast"} ${5 + i * 2}s linear infinite ${i % 2 ? "reverse" : ""}`,
          }}>
            <path d={`M ${28 + r} 28 A ${r} ${r} 0 0 1 28 ${28 - r}`} fill="none"
              stroke={i === 1 ? emmyHue(trend) : accent} strokeWidth="1.6" strokeLinecap="round" />
            <path d={`M 28 ${28 + r} A ${r} ${r} 0 0 1 ${28 - r} 28`} fill="none"
              stroke={i === 1 ? emmyHue(trend) : accent} strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
          </g>
        ))}
        <circle cx="28" cy="28" r="2.4" fill={accent} />
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── 50. MAGNET POLES — two poles with field lines ────────
const LogoMagnet = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last, trend, source } = useEmmy();
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * scale, color }}>
      <svg width={64 * scale} height={56 * scale} viewBox="0 0 64 56" aria-hidden>
        <rect x="8" y="22" width="10" height="12" fill={accent} />
        <rect x="46" y="22" width="10" height="12" fill={emmyHue(trend)} />
        {[16, 28, 40].map((y, i) => (
          <path key={i} d={`M 18 ${y} Q 32 ${y - 6 + i * 4}, 46 ${y}`}
            fill="none" stroke={accent} strokeWidth="1" strokeOpacity={0.6 - i * 0.1}
            style={{ animation: `bloom 2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
        <text x="13" y="29" fontSize="6" fontFamily="var(--font-mono)" fill="#fff" textAnchor="middle">N</text>
        <text x="51" y="29" fontSize="6" fontFamily="var(--font-mono)" fill="#fff" textAnchor="middle">S</text>
      </svg>
      <WordmarkEmmy scale={scale} color={color} accent={accent} last={last} trend={trend} source={source} />
    </div>
  );
};

// ─── Card wrapper (reuses vol3 styles) ────────────────────
// Note: depends on LogoCardLite from vol3 — must be loaded
const LogoLab4Page = () => {
  const Card = window.LogoCardLite;
  return (
    <CeePriceProvider>
      <LogoStyles />
      <LogoLab2Styles />
      <LogoLab3Styles />

      <section style={{ position: "relative", overflow: "hidden" }}>
        <AuroraMesh intensity={0.6} />
        <Orb size={620} color="var(--volt-glow)" style={{ top: -160, right: -120 }} />
        <div className="r-padbox" style={{ maxWidth: 1320, margin: "0 auto", padding: "72px 32px 36px", position: "relative" }}>
          <div className="upper" style={{ color: "var(--volt)" }}>Logo Lab · volume 4 · branché EMMY</div>
          <h1 className="serif h1-fluid" style={{ fontSize: 96, lineHeight: 0.96, letterSpacing: "-0.035em", margin: "14px 0 22px", color: "var(--ink)", fontWeight: 500, maxWidth: 1100 }}>
            17 logos <em style={{ color: "var(--volt)" }}>qui réagissent au cours.</em>
          </h1>
          <p className="body-fluid" style={{ fontSize: 17, color: "var(--bone-soft)", lineHeight: 1.55, maxWidth: 820, margin: 0 }}>
            Tous ces marks consomment <strong style={{ color: "var(--ink)", fontWeight: 600 }}>la même source EMMY</strong> — un seul fetch global, tous écoutent. Chacun traduit le cours différemment : taille, vitesse, nombre d'éléments, teinte selon la tendance, animation par tick. Sous chaque logo, le label EMMY confirme la valeur lue.
          </p>
          <div style={{ marginTop: 24, padding: "14px 18px", background: "var(--card)", border: "1px solid var(--rule-on)", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 14 }}>
            <EmmyStatusInline />
          </div>
        </div>
      </section>

      <section className="r-padbox section-pad" style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 32px 80px" }}>
        <div className="upper" style={{ color: "var(--muted)", marginBottom: 18 }}>Data-driven · prix en direct</div>
        <div className="r-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <Card n="34" name="Heatbox"      tagline="Grille de chaleur · pulse sur tick" why="Grille 5×5 dont l'intensité radie depuis le centre, pondérée par le cours actuel. Le centre s'illumine en vert ou rouge selon la tendance.">
            <LogoHeatbox /></Card>
          <Card n="35" name="Bar Marquee"  tagline="12 derniers prix en barres" why="Histogramme glissant des 12 derniers ticks. La dernière barre prend la couleur de tendance — visuel data-room intégré dans le mark.">
            <LogoBarMarquee /></Card>
          <Card n="36" name="Strand"       tagline="Fil dont l'épaisseur = prix" why="Ligne horizontale unique, épaisseur proportionnelle au cours. Minimal absolu. Le point de fin change de couleur selon la tendance.">
            <LogoStrand /></Card>
          <Card n="37" name="Echo Coin"    tagline="Pièce qui retourne sur tick" why="Disque pile/face qui se retourne en 3D à chaque mise à jour EMMY. Face cachée affiche le cours en monospace. Tactile, mémorable.">
            <LogoEchoCoin /></Card>
        </div>

        <div className="upper" style={{ color: "var(--muted)", margin: "40px 0 18px" }}>Liquides · physiques</div>
        <div className="r-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <Card n="38" name="Liquid Disc"  tagline="Disque qui se remplit" why="Cercle qui se remplit bottom-up jusqu'au niveau de prix normalisé. Le chiffre apparaît au centre. Métaphore liquide directe.">
            <LogoLiquidDisc /></Card>
          <Card n="39" name="Tuning Fork"  tagline="Diapason qui vibre" why="Diapason qui vibre sur chaque mise à jour. Métaphore acoustique forte — l'écho devient vibration mesurable.">
            <LogoTuningFork /></Card>
          <Card n="40" name="Wave Stack"   tagline="Trois ondes · vitesse = volatilité" why="Trois ondes sinusoïdales empilées. La vitesse d'animation est proportionnelle à la volatilité du cours (delta sur 3 ticks). Énergique quand le marché bouge.">
            <LogoWaveStack /></Card>
          <Card n="41" name="Sonar Ping"   tagline="Ping émis pile sur le tick" why="Au lieu d'émettre en boucle, ce sonar n'émet QUE quand EMMY met à jour. Couleur du ping selon tendance. Plus sobre, plus 'data'.">
            <LogoSonarPing /></Card>
        </div>

        <div className="upper" style={{ color: "var(--muted)", margin: "40px 0 18px" }}>Géométries · structures</div>
        <div className="r-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <Card n="42" name="Spirograph"   tagline="Pétales · n proportionnel au prix" why="Rosette dont le nombre de pétales est dérivé du cours (5-11). Tourne lentement en continu. Évoque la géométrie sacrée et la précision technique.">
            <LogoSpirograph /></Card>
          <Card n="43" name="Tape Reel"    tagline="Bobines à bande" why="Deux bobines tournant en sens inverse, bande entre les deux portant le cours. Esthétique télégraphique, presque physique-matériel.">
            <LogoTapeReel /></Card>
          <Card n="44" name="Hourglass"    tagline="Sablier qui se retourne" why="Sablier qui pivote sur lui-même à chaque mise à jour. Temps qui passe + valeur qui change. Métaphore narrative forte.">
            <LogoHourglass /></Card>
          <Card n="45" name="Polygon Morph" tagline="n-gone où n = floor(price)" why="Polygone régulier dont le nombre de côtés est égal à la partie entière du cours EMMY. Pédagogique, presque mathématique. Affiche le n.">
            <LogoPolygonMorph /></Card>
        </div>

        <div className="upper" style={{ color: "var(--muted)", margin: "40px 0 18px" }}>Motion · trajectoires</div>
        <div className="r-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <Card n="46" name="Stack Bars"   tagline="5 derniers prix · empilés" why="5 barres horizontales empilées, la dernière (en bas) prend la couleur de tendance. Largeur = prix normalisé. Lecture instantanée d'un mini-trend.">
            <LogoStackBars /></Card>
          <Card n="47" name="Comet"        tagline="Comète · vitesse inverse au prix" why="Comète qui orbite autour d'un point. Vitesse inverse au cours (lente quand cher, rapide quand bas marché). Counter-intuitif mais lisible avec habitude.">
            <LogoComet /></Card>
          <Card n="48" name="Bouncing"     tagline="Balle · hauteur = prix" why="Balle qui rebondit, hauteur du rebond proportionnelle au cours. Avec ombre au sol. Physique simple, lisibilité immédiate.">
            <LogoBouncing /></Card>
          <Card n="49" name="Iris"         tagline="3 anneaux à vitesses opposées" why="Trois demi-cercles concentriques tournant à vitesses et sens différents. Anneau central prend la couleur de tendance.">
            <LogoIris /></Card>
        </div>

        <div className="upper" style={{ color: "var(--muted)", margin: "40px 0 18px" }}>Conceptuels · symboliques</div>
        <div className="r-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <Card n="50" name="Magnet"       tagline="Champ entre deux pôles" why="Deux pôles N/S avec des lignes de champ qui ondulent doucement. Pôle sud prend la couleur de tendance. Métaphore d'attraction du marché.">
            <LogoMagnet /></Card>
        </div>

        <div style={{
          marginTop: 60, padding: 40, background: "var(--ink)", color: "#fff", borderRadius: 8,
        }} className="on-ink">
          <div className="upper" style={{ color: "var(--volt)" }}>Architecture</div>
          <h3 className="serif" style={{ fontSize: 28, color: "#fff", fontWeight: 500, marginTop: 8, letterSpacing: "-0.02em" }}>
            Un seul fetch EMMY · 50 logos qui écoutent
          </h3>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1.6, marginTop: 12, maxWidth: 720, margin: "12px 0 0" }}>
            Tous les logos consomment le contexte <code style={{ color: "var(--volt)", fontFamily: "var(--font-mono)" }}>CeePriceProvider</code> qui fait un seul appel toutes les 3 s. En prod, remplace l'endpoint par ton API : <code style={{ color: "var(--volt)", fontFamily: "var(--font-mono)" }}>window.ECHOWAI_CEE_API = "..."</code>. Tous les logos basculent automatiquement de « indicatif » à « live ».
          </p>
        </div>

        <p style={{ marginTop: 32, fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
          ↳ Avec les volumes 1, 2 et 3 → <strong style={{ color: "var(--ink)" }}>50 concepts uniques</strong> au total.
        </p>
      </section>
    </CeePriceProvider>
  );
};

// Small status pill — displays in the hero
const EmmyStatusInline = () => {
  const { last, trend, source } = useEmmy();
  return (
    <>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: emmyHue(trend) }} className="volt-dot" />
      <span className="mono" style={{ fontSize: 12, color: "var(--ink)" }}>
        EMMY · {last.toFixed(2)} €/MWh
      </span>
      <span className="mono" style={{ fontSize: 12, color: emmyHue(trend), fontWeight: 600 }}>
        {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"}
      </span>
      <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
        {source === "emmy" ? "live" : "cours indicatif · ±5 % de la baseline"}
      </span>
    </>
  );
};

Object.assign(window, {
  CeePriceContext, CeePriceProvider, useEmmy, emmyHue, emmyNorm, emmyLabel, WordmarkEmmy,
  LogoLab4Page, EmmyStatusInline,
  LogoHeatbox, LogoBarMarquee, LogoStrand, LogoEchoCoin, LogoLiquidDisc,
  LogoTuningFork, LogoWaveStack, LogoSonarPing, LogoSpirograph, LogoTapeReel,
  LogoHourglass, LogoPolygonMorph, LogoStackBars, LogoComet, LogoBouncing,
  LogoIris, LogoMagnet,
});
