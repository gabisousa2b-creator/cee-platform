/* eslint-disable */
// Echowai — Logo Lab vol. 5
// 50 typography-led interactive logos. All EMMY-connected via CeePriceProvider.
// Each plays with the "echowai" wordmark itself.

// ─── Shared keyframes ─────────────────────────────────────
const LogoLab5Styles = () => (
  <style>{`
    @keyframes typewrite { from { width: 0; } to { width: 100%; } }
    @keyframes letterBounce {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-6px); }
    }
    @keyframes letterDrop {
      0%   { transform: translateY(-24px); opacity: 0; }
      60%  { transform: translateY(2px);   opacity: 1; }
      100% { transform: translateY(0);     opacity: 1; }
    }
    @keyframes underlineSweep {
      0%   { transform: scaleX(0); transform-origin: left; }
      50%  { transform: scaleX(1); transform-origin: left; }
      51%  { transform-origin: right; }
      100% { transform: scaleX(0); transform-origin: right; }
    }
    @keyframes chromShift {
      0%, 100% { text-shadow: 1px 0 0 rgba(255,71,71,.55), -1px 0 0 rgba(46,126,244,.55); }
      50%      { text-shadow: 2px 0 0 rgba(255,71,71,.55), -2px 0 0 rgba(46,126,244,.55); }
    }
    @keyframes glowOn {
      0%   { text-shadow: 0 0 0 transparent; }
      30%  { text-shadow: 0 0 14px var(--volt-glow); }
      100% { text-shadow: 0 0 0 transparent; }
    }
    @keyframes weightBreathe {
      0%, 100% { font-variation-settings: 'wght' 400; }
      50%      { font-variation-settings: 'wght' 700; }
    }
    @keyframes scrollText { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes letterSpin {
      from { transform: rotateY(0deg); }
      to   { transform: rotateY(360deg); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25%      { transform: translateX(-1.5px); }
      75%      { transform: translateX(1.5px); }
    }
    @keyframes glowDot {
      0%, 100% { box-shadow: 0 0 0 0 var(--volt-glow); }
      50%      { box-shadow: 0 0 0 6px transparent; }
    }
    @keyframes strikeSweep {
      0%   { transform: scaleX(0); transform-origin: left; }
      50%  { transform: scaleX(1); transform-origin: left; }
      100% { transform: scaleX(0); transform-origin: right; }
    }
    @keyframes flipChar { 0%,90% { transform: rotateX(0); } 95% { transform: rotateX(-90deg); } 100% { transform: rotateX(0); } }
    @keyframes letterCycle {
      0%   { color: var(--volt); }
      33%  { color: var(--st-valide); }
      66%  { color: var(--st-controle); }
      100% { color: var(--volt); }
    }
  `}</style>
);

// ─── Tiny inline EMMY ticker beneath wordmark (compact) ────
const Em = ({ scale = 1 }) => {
  const { last, trend, source } = useEmmy();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop:0 }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: emmyHue(trend) }} className="volt-dot" />
      <span className="mono" style={{ fontSize: 8.5 * scale, color: "var(--muted)", letterSpacing: ".06em" }}>
        EMMY {last.toFixed(2)} {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {source === "emmy" ? "" : "indic."}
      </span>
    </div>
  );
};

// ─── Word: takes children styling, optional split ─────────
const Wm = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)", style, ...rest }) => (
  <span className="serif" style={{
    fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em",
    fontWeight: 500, color, ...style,
  }} {...rest}>
    echo<span style={{ color: accent }}>wai</span>
  </span>
);

// Stack: wordmark + EMMY
const Stack = ({ scale = 1, children }) => (
  <div style={{ display: "inline-flex", flexDirection: "column" }}>
    {children}
    <Em scale={scale} />
  </div>
);

// ═══════════════════════════════════════════════════════════
// 50 LOGOS — compact components
// ═══════════════════════════════════════════════════════════

// 51. Typewriter — letters appear one by one
const L_Typewriter = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ overflow: "hidden", display: "inline-block", borderRight: `2px solid ${accent}`,
      whiteSpace: "nowrap", animation: "typewrite 2.2s steps(7) infinite alternate, glowDot 0.8s infinite" }}>
      <Wm scale={scale} color={color} accent={accent} />
    </span>
  </Stack>
);

// 52. Letter Bounce — each letter bounces in sequence
const L_Bounce = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const letters = "echowai".split("");
  return (
    <Stack scale={scale}>
      <span style={{ display: "inline-flex" }} className="serif">
        {letters.map((c, i) => (
          <span key={i} style={{
            fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
            color: i >= 4 ? accent : color, display: "inline-block",
            animation: `letterBounce 1.6s ease-in-out ${i * 0.1}s infinite`,
          }}>{c}</span>
        ))}
      </span>
    </Stack>
  );
};

// 53. Drop In — letters fall in, restart on hover
const L_Drop = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  return (
    <Stack scale={scale}>
      <span style={{ display: "inline-flex", cursor: "pointer" }} onMouseEnter={() => setK(k + 1)} key={k} className="serif">
        {"echowai".split("").map((c, i) => (
          <span key={i} style={{
            fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
            color: i >= 4 ? accent : color, display: "inline-block",
            animation: `letterDrop .6s var(--ease-out-quart) ${i * 0.07}s both`,
          }}>{c}</span>
        ))}
      </span>
    </Stack>
  );
};

// 54. Wave — letters wave sinusoidally
const L_Wave = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf, s0 = performance.now();
    const loop = (now) => { setT((now - s0) / 600); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <Stack scale={scale}>
      <span style={{ display: "inline-flex" }} className="serif">
        {"echowai".split("").map((c, i) => (
          <span key={i} style={{
            fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
            color: i >= 4 ? accent : color, display: "inline-block",
            transform: `translateY(${Math.sin(t + i * 0.7) * 3}px)`,
          }}>{c}</span>
        ))}
      </span>
    </Stack>
  );
};

// 55. Color Cycle — letters cycle volt/valide/controle
const L_ColorCycle = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ display: "inline-flex" }} className="serif">
      {"echowai".split("").map((c, i) => (
        <span key={i} style={{
          fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
          color, display: "inline-block",
          animation: `letterCycle 4s linear ${i * 0.2}s infinite`,
        }}>{c}</span>
      ))}
    </span>
  </Stack>
);

// 56. Chrom Shift — RGB split aberration on hover
const L_Chrom = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ animation: "chromShift 2.4s ease-in-out infinite", display: "inline-block" }}>
      <Wm scale={scale} color={color} accent={accent} />
    </span>
  </Stack>
);

// 57. Underline Sweep — animated underline
const L_Underline = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ position: "relative", display: "inline-block", paddingBottom: 4 }}>
      <Wm scale={scale} color={color} accent={accent} />
      <span style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: accent,
        animation: "underlineSweep 3s ease-in-out infinite",
      }} />
    </span>
  </Stack>
);

// 58. Strike Sweep — line goes through then disappears
const L_Strike = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ position: "relative", display: "inline-block" }}>
      <Wm scale={scale} color={color} accent={accent} />
      <span style={{
        position: "absolute", left: 0, right: 0, top: "50%", height: 2, background: accent,
        animation: "strikeSweep 2.8s ease-in-out infinite",
      }} />
    </span>
  </Stack>
);

// 59. Magnetic Letters — letters follow cursor with attenuation
const L_Magnetic = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const ref = React.useRef(null);
  const [m, setM] = React.useState(null);
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    setM({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  return (
    <Stack scale={scale}>
      <span ref={ref} style={{ display: "inline-flex" }} className="serif"
        onMouseMove={onMove} onMouseLeave={() => setM(null)}>
        {"echowai".split("").map((c, i) => {
          const lx = i * (18 * scale) + 9; // approx letter center
          let dx = 0, dy = 0;
          if (m) {
            const ddx = m.x - lx;
            const dist = Math.hypot(ddx, m.y - 16);
            if (dist < 80) { const k = (80 - dist) / 80 * 0.4; dx = ddx * k; dy = (m.y - 16) * k; }
          }
          return (
            <span key={i} style={{
              fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
              color: i >= 4 ? accent : color, display: "inline-block",
              transform: `translate(${dx}px, ${dy}px)`, transition: "transform .2s var(--ease-out-quart)",
            }}>{c}</span>
          );
        })}
      </span>
    </Stack>
  );
};

// 60. Repel Letters — opposite of magnetic
const L_Repel = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const ref = React.useRef(null);
  const [m, setM] = React.useState(null);
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    setM({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  return (
    <Stack scale={scale}>
      <span ref={ref} style={{ display: "inline-flex", cursor: "crosshair" }} className="serif"
        onMouseMove={onMove} onMouseLeave={() => setM(null)}>
        {"echowai".split("").map((c, i) => {
          const lx = i * (18 * scale) + 9;
          let dx = 0, dy = 0;
          if (m) {
            const ddx = lx - m.x;
            const ddy = 16 - m.y;
            const dist = Math.hypot(ddx, ddy);
            if (dist < 60) { const k = (60 - dist) / 60 * 0.6; dx = ddx * k; dy = ddy * k; }
          }
          return (
            <span key={i} style={{
              fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
              color: i >= 4 ? accent : color, display: "inline-block",
              transform: `translate(${dx}px, ${dy}px)`, transition: "transform .25s var(--ease-out-quart)",
            }}>{c}</span>
          );
        })}
      </span>
    </Stack>
  );
};

// 61. Hover Stretch — letter under cursor grows
const L_HoverStretch = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [h, setH] = React.useState(-1);
  return (
    <Stack scale={scale}>
      <span style={{ display: "inline-flex", lineHeight: 1.4 }} className="serif">
        {"echowai".split("").map((c, i) => (
          <span key={i} onMouseEnter={() => setH(i)} onMouseLeave={() => setH(-1)}
            style={{
              fontSize: (h === i ? 44 : 32) * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
              color: i >= 4 ? accent : color, display: "inline-block",
              transition: "all .25s var(--ease-out-quart)", cursor: "pointer",
              transform: h === i ? "translateY(-3px)" : "translateY(0)",
            }}>{c}</span>
        ))}
      </span>
    </Stack>
  );
};

// 62. Spin Letter — hovered letter spins on Y axis
const L_SpinLetter = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ display: "inline-flex" }} className="serif">
      {"echowai".split("").map((c, i) => (
        <span key={i} style={{
          fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
          color: i >= 4 ? accent : color, display: "inline-block", cursor: "pointer",
          transition: "transform .5s var(--ease-out-quart)",
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "rotateY(360deg)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "rotateY(0)"}>{c}</span>
      ))}
    </span>
  </Stack>
);

// 63. Outline — text-stroke style
const L_Outline = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span className="serif" style={{
      fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 700,
      color: "transparent", WebkitTextStroke: `1.4px ${color}`,
    }}>
      echo<span style={{ WebkitTextStroke: `1.4px ${accent}` }}>wai</span>
    </span>
  </Stack>
);

// 64. Glow — emits glow continuously
const L_Glow = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ animation: "glowOn 2.6s ease-in-out infinite" }}>
      <Wm scale={scale} color={color} accent={accent} />
    </span>
  </Stack>
);

// 65. Weight Breathe — variable-font weight oscillates
const L_WeightBreathe = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <Wm scale={scale} color={color} accent={accent} style={{ animation: "weightBreathe 3.4s ease-in-out infinite" }} />
  </Stack>
);

// 66. Skew — text skews subtly with hover
const L_Skew = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{
      display: "inline-block", cursor: "pointer", transition: "transform .3s var(--ease-out-quart)",
    }} onMouseEnter={(e) => e.currentTarget.style.transform = "skewX(-12deg)"}
       onMouseLeave={(e) => e.currentTarget.style.transform = "skewX(0)"}>
      <Wm scale={scale} color={color} accent={accent} />
    </span>
  </Stack>
);

// 67. Stack Vertical
const L_VerticalStack = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
    <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: -4 }}>
      <Wm scale={scale * 0.7} color={color} accent={accent} style={{ fontSize: 22 * scale, letterSpacing: "-.02em" }} />
    </span>
  </div>
);

// 68. Echo Above — small "echo" mirror above
const L_Mirror = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 0.9 }}>
      <span className="serif" style={{
        fontSize: 14 * scale, color: accent, opacity: 0.5,
        letterSpacing: "-0.02em", textAlign: "right", paddingRight: 4,
      }}>echo · echo · echo</span>
      <Wm scale={scale} color={color} accent={accent} />
    </span>
  </Stack>
);

// 69. Brackets — animated brackets
const L_Brackets = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [hov, setHov] = React.useState(false);
  return (
    <Stack scale={scale}>
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: hov ? 14 : 6, transition: "gap .3s", cursor: "pointer" }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
        <span className="serif" style={{ fontSize: 36 * scale, fontWeight: 400, color: accent }}>[</span>
        <Wm scale={scale} color={color} accent={accent} />
        <span className="serif" style={{ fontSize: 36 * scale, fontWeight: 400, color: accent }}>]</span>
      </span>
    </Stack>
  );
};

// 70. Slash — animated diagonal slash
const L_Slash = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
      <Wm scale={scale} color={color} accent={accent} />
      <span style={{
        width: 2, height: 28 * scale, background: accent,
        transform: "rotate(20deg)", animation: "shake 0.8s ease-in-out infinite",
      }} />
      <span className="mono" style={{ fontSize: 11 * scale, color: "var(--muted)", letterSpacing: ".06em" }}>cee</span>
    </span>
  </Stack>
);

// 71. Dot Replace — "i" dot is a live cee tick
const L_DotReplace = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { trend } = useEmmy();
  return (
    <Stack scale={scale}>
      <span style={{ display: "inline-flex", alignItems: "baseline", position: "relative" }} className="serif">
        <span style={{ fontSize: 32 * scale, fontWeight: 500, letterSpacing: "-0.035em", color }}>echowa</span>
        <span style={{ position: "relative", display: "inline-block" }}>
          <span style={{ fontSize: 32 * scale, fontWeight: 500, letterSpacing: "-0.035em", color: accent }}>i</span>
          {/* override dot */}
          <span style={{
            position: "absolute", top: -2 * scale, left: "50%",
            width: 7 * scale, height: 7 * scale, borderRadius: "50%",
            background: emmyHue(trend),
            transform: "translateX(-50%)",
            animation: "glowDot 1.4s infinite",
          }} />
        </span>
      </span>
    </Stack>
  );
};

// 72. Click Discharge — click to send ripples through wordmark
const L_Discharge = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [n, setN] = React.useState(0);
  return (
    <Stack scale={scale}>
      <button onClick={() => setN(n + 1)} style={{
        background: "transparent", border: 0, padding: 0, cursor: "pointer",
        position: "relative",
      }}>
        <Wm scale={scale} color={color} accent={accent} key={n}
          style={{ animation: "glowOn 0.9s ease-out", display: "inline-block" }} />
      </button>
    </Stack>
  );
};

// 73. Underline Sparkline — underline IS the EMMY sparkline
const L_SparkUnderline = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { series } = useEmmy();
  const W = 200, H = 20;
  const lo = CEE_BASELINE * (1 - CEE_BAND), hi = CEE_BASELINE * (1 + CEE_BAND);
  const norm = (v) => 1 - (v - lo) / (hi - lo);
  const d = "M " + series.map((v, i) => `${(i / (series.length - 1) * W).toFixed(1)} ${(4 + norm(v) * (H - 8)).toFixed(1)}`).join(" L ");
  return (
    <Stack scale={scale}>
      <span style={{ display: "inline-flex", flexDirection: "column" }}>
        <Wm scale={scale} color={color} accent={accent} />
        <svg width="200" height="20" viewBox={`0 0 ${W} ${H}`}>
          <path d={d} fill="none" stroke={accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "d .9s var(--ease-out-quart)" }} />
        </svg>
      </span>
    </Stack>
  );
};

// 74. Scroll Marquee — text scrolls horizontally inside fixed frame
const L_Marquee = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ overflow: "hidden", display: "inline-block", maxWidth: 200 * scale, whiteSpace: "nowrap" }}>
      <span style={{ display: "inline-flex", gap: 24, animation: "scrollText 10s linear infinite" }}>
        {[0,1,2,3].map(k => <Wm key={k} scale={scale} color={color} accent={accent} />)}
      </span>
    </span>
  </Stack>
);

// 75. Letter Spin Auto — letter "o" spins continuously
const L_OSpin = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ display: "inline-flex" }} className="serif">
      {"echowai".split("").map((c, i) => (
        <span key={i} style={{
          fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
          color: i >= 4 ? accent : color, display: "inline-block",
          animation: i === 3 ? "letterSpin 3s linear infinite" : "none",
        }}>{c}</span>
      ))}
    </span>
  </Stack>
);

// 76. Letter Spacing Pulse — letter-spacing breathes
const L_SpacingPulse = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [ls, setLs] = React.useState(-0.035);
  React.useEffect(() => {
    let raf, s0 = performance.now();
    const loop = (now) => {
      const t = ((now - s0) / 1000);
      setLs(-0.02 + Math.sin(t * 0.8) * 0.04);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <Stack scale={scale}>
      <Wm scale={scale} color={color} accent={accent} style={{ letterSpacing: `${ls}em` }} />
    </Stack>
  );
};

// 77. Click to Stagger — clicking restarts a letter-by-letter reveal
const L_ClickStagger = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  return (
    <Stack scale={scale}>
      <button onClick={() => setK(k + 1)} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}>
        <span key={k} style={{ display: "inline-flex" }} className="serif">
          {"echowai".split("").map((c, i) => (
            <span key={i} style={{
              fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
              color: i >= 4 ? accent : color, display: "inline-block",
              animation: `letterDrop .5s var(--ease-out-quart) ${i * 0.08}s both`,
            }}>{c}</span>
          ))}
        </span>
      </button>
    </Stack>
  );
};

// 78. Inverted Block — text on a navy block
const L_BlockInvert = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{
      background: "var(--ink)", color: "#fff",
      padding: `${4 * scale}px ${12 * scale}px`, borderRadius: 4,
      display: "inline-block",
    }}>
      <Wm scale={scale} color="#fff" accent={accent} />
    </span>
  </Stack>
);

// 79. Shadow Walk — drop shadow that drifts
const L_ShadowWalk = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf, s0 = performance.now();
    const loop = (now) => { setT((now - s0) / 600); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <Stack scale={scale}>
      <Wm scale={scale} color={color} accent={accent} style={{
        textShadow: `${Math.cos(t) * 6}px ${Math.sin(t) * 6}px 0 var(--volt-glow)`,
      }} />
    </Stack>
  );
};

// 80. Three-Tone — each char-group different color
const L_ThreeTone = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span className="serif" style={{
      fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
    }}>
      <span style={{ color }}>e</span>
      <span style={{ color: "var(--st-valide)" }}>ch</span>
      <span style={{ color }}>o</span>
      <span style={{ color: accent }}>wa</span>
      <span style={{ color: "var(--st-controle)" }}>i</span>
    </span>
  </Stack>
);

// 81. Mono Stamp — wordmark in monospace, smaller
const L_MonoStamp = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 22 * scale,
      letterSpacing: ".06em", textTransform: "uppercase",
      color, fontWeight: 500,
    }}>
      echo<span style={{ color: accent }}>wai</span>
    </span>
  </Stack>
);

// 82. Reverse Caret — caret on left side blinking
const L_ReverseCaret = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{
        display: "inline-block", width: 2, height: 28 * scale, background: accent,
        animation: "glowDot .8s steps(2) infinite",
      }} />
      <Wm scale={scale} color={color} accent={accent} />
    </span>
  </Stack>
);

// 83. Bracketed Tag — like an html tag
const L_TagBracket = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span className="mono" style={{ fontSize: 13 * scale, color: "var(--muted)" }}>
      &lt;<span style={{ color: accent }}>echo</span>:<Wm scale={scale * 0.78} color={color} accent={accent} style={{ fontSize: 22 * scale, letterSpacing: "-.025em" }} />&gt;
    </span>
  </Stack>
);

// 84. Echo Echo — text repeats fading away
const L_EchoEcho = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ position: "relative", display: "inline-block" }}>
      {[3, 2, 1, 0].map(i => (
        <span key={i} style={{
          position: i === 0 ? "relative" : "absolute",
          left: i * (4 * scale), top: i * (-2 * scale),
          opacity: 1 - i * 0.25,
          filter: i > 0 ? `blur(${i * 0.4}px)` : "none",
        }}>
          <Wm scale={scale} color={color} accent={accent} />
        </span>
      ))}
    </span>
  </Stack>
);

// 85. Live Number — wordmark plus live count
const L_LiveNumber = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last } = useEmmy();
  return (
    <Stack scale={scale}>
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
        <Wm scale={scale} color={color} accent={accent} />
        <span className="mono" style={{ fontSize: 14 * scale, color: emmyHue(useEmmy().trend), background: "var(--card-2)", padding: "2px 6px", borderRadius: 3 }}>
          {last.toFixed(2)}€
        </span>
      </span>
    </Stack>
  );
};

// 86. Punch — text "punch-in" zoom from large to normal
const L_Punch = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  return (
    <Stack scale={scale}>
      <span key={k} onMouseEnter={() => setK(k + 1)} style={{
        display: "inline-block", animation: "letterDrop .7s var(--ease-out-quart)",
        transform: "scale(1.6)", cursor: "pointer",
      }}>
        <span style={{ animation: "letterDrop .4s var(--ease-out-quart) forwards" }}>
          <Wm scale={scale} color={color} accent={accent} />
        </span>
      </span>
    </Stack>
  );
};

// 87. Folding letter — first letter "e" folds
const L_FoldE = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ display: "inline-flex" }} className="serif">
      <span style={{
        fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500, color,
        display: "inline-block", transformOrigin: "right",
        animation: "letterSpin 4s linear infinite",
      }}>e</span>
      <span style={{ fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500, color }}>cho</span>
      <span style={{ fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500, color: accent }}>wai</span>
    </span>
  </Stack>
);

// 88. Cursor Reveal — wordmark hidden, cursor reveals via spotlight
const L_Spotlight = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const ref = React.useRef(null);
  const [pos, setPos] = React.useState({ x: 50, y: 50 });
  const [active, setActive] = React.useState(false);
  return (
    <Stack scale={scale}>
      <div ref={ref} onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }} onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)}
        style={{
          padding: "4px 12px", cursor: "crosshair", borderRadius: 4,
          background: active
            ? `radial-gradient(80px 80px at ${pos.x}% ${pos.y}%, transparent 0%, var(--card-2) 100%)`
            : "var(--card-2)",
        }}>
        <Wm scale={scale} color={color} accent={accent} />
      </div>
    </Stack>
  );
};

// 89. Tick Glow — wordmark flashes glow on every EMMY tick
const L_TickGlow = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last } = useEmmy();
  const [k, setK] = React.useState(0);
  const prev = React.useRef(last);
  React.useEffect(() => { if (prev.current !== last) { setK(k + 1); prev.current = last; } }, [last]);
  return (
    <Stack scale={scale}>
      <span key={k} style={{ display: "inline-block", animation: "glowOn .8s ease-out" }}>
        <Wm scale={scale} color={color} accent={accent} />
      </span>
    </Stack>
  );
};

// 90. Wai Up — "wai" lifts above "echo"
const L_WaiUp = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ display: "inline-flex", alignItems: "flex-end" }}>
      <span className="serif" style={{ fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500, color }}>echo</span>
      <span className="serif" style={{
        fontSize: 24 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500, color: accent,
        marginBottom: 8 * scale, marginLeft: 2,
      }}>wai</span>
    </span>
  </Stack>
);

// 91. Lowercase + Accent — etiolated dotless
const L_Dotless = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <Wm scale={scale} color={color} accent={accent}
      style={{ fontFeatureSettings: '"ss01", "smcp"', fontWeight: 400 }} />
  </Stack>
);

// 92. Trail Echo — echoes follow cursor
const L_TrailEcho = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const ref = React.useRef(null);
  const [trail, setTrail] = React.useState([]);
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    const id = Math.random();
    setTrail(t => [...t.slice(-3), { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setTrail(t => t.filter(p => p.id !== id)), 800);
  };
  return (
    <Stack scale={scale}>
      <div ref={ref} onMouseMove={onMove} style={{ position: "relative", display: "inline-block", padding: "8px 16px", cursor: "crosshair" }}>
        <Wm scale={scale} color={color} accent={accent} />
        {trail.map((p, i) => (
          <span key={p.id} style={{
            position: "absolute", left: p.x, top: p.y, transform: "translate(-50%, -50%)",
            opacity: 0.5 - i * 0.1, pointerEvents: "none",
            animation: "letterDrop .8s var(--ease-out-quart) forwards",
            color: accent, fontSize: 12, fontFamily: "var(--font-mono)",
          }}>echo</span>
        ))}
      </div>
    </Stack>
  );
};

// 93. ASCII Border — characters around wordmark
const L_AsciiBorder = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span style={{ display: "inline-flex", flexDirection: "column", fontFamily: "var(--font-mono)", fontSize: 10 * scale, color: accent, lineHeight: 1 }}>
      <span>┌─────────────┐</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "2px 8px" }}>
        │ <Wm scale={scale * 0.85} color={color} accent={accent} /> │
      </span>
      <span>└─────────────┘</span>
    </span>
  </Stack>
);

// 94. Drag One Letter — draggable letter springs back
const L_DragLetter = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [drag, setDrag] = React.useState({ active: false, x: 0, y: 0 });
  const startRef = React.useRef(null);
  return (
    <Stack scale={scale}>
      <span style={{ display: "inline-flex" }} className="serif">
        {"echowai".split("").map((c, i) => {
          const isW = i === 4;
          return (
            <span key={i}
              onMouseDown={isW ? (e) => { startRef.current = { x: e.clientX, y: e.clientY }; setDrag({ active: true, x: 0, y: 0 }); } : undefined}
              onMouseMove={isW && drag.active ? (e) => {
                setDrag({ active: true, x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y });
              } : undefined}
              onMouseUp={isW ? () => setDrag({ active: false, x: 0, y: 0 }) : undefined}
              onMouseLeave={isW ? () => setDrag({ active: false, x: 0, y: 0 }) : undefined}
              style={{
                fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
                color: i >= 4 ? accent : color, display: "inline-block",
                cursor: isW ? "grab" : "default",
                transform: isW ? `translate(${drag.x}px, ${drag.y}px)` : "none",
                transition: drag.active ? "none" : "transform .35s var(--ease-out-quart)",
              }}>{c}</span>
          );
        })}
      </span>
    </Stack>
  );
};

// 95. Erratic Shake on Hover — shaking word on hover
const L_Shake = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [h, setH] = React.useState(false);
  return (
    <Stack scale={scale}>
      <span style={{
        display: "inline-block", animation: h ? "shake .12s linear infinite" : "none", cursor: "pointer",
      }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
        <Wm scale={scale} color={color} accent={accent} />
      </span>
    </Stack>
  );
};

// 96. Caret Cycle — caret moves along the word
const L_CaretCycle = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [i, setI] = React.useState(0);
  React.useEffect(() => { const id = setInterval(() => setI(x => (x + 1) % 8), 380); return () => clearInterval(id); }, []);
  return (
    <Stack scale={scale}>
      <span style={{ display: "inline-flex", alignItems: "center" }} className="serif">
        {"echowai".split("").map((c, k) => (
          <React.Fragment key={k}>
            {i === k && <span style={{ width: 2, height: 28 * scale, background: accent, display: "inline-block", marginRight: 1 }} />}
            <span style={{
              fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
              color: k >= 4 ? accent : color, display: "inline-block",
            }}>{c}</span>
          </React.Fragment>
        ))}
      </span>
    </Stack>
  );
};

// 97. Slash Echo — diagonal slash separates echo / wai
const L_DiagSlash = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (
  <Stack scale={scale}>
    <span className="serif" style={{ fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500 }}>
      <span style={{ color }}>echo</span>
      <span style={{
        display: "inline-block", width: 2, height: 32 * scale, background: accent, margin: "0 4px",
        transform: "rotate(15deg)", verticalAlign: "middle", animation: "glowOn 2s ease-in-out infinite",
      }} />
      <span style={{ color: accent }}>wai</span>
    </span>
  </Stack>
);

// 98. Letter Pop — random letter pops larger occasionally
const L_LetterPop = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [pop, setPop] = React.useState(0);
  React.useEffect(() => { const id = setInterval(() => setPop(Math.floor(Math.random() * 7)), 1200); return () => clearInterval(id); }, []);
  return (
    <Stack scale={scale}>
      <span style={{ display: "inline-flex" }} className="serif">
        {"echowai".split("").map((c, k) => (
          <span key={k} style={{
            fontSize: 32 * scale * (k === pop ? 1.18 : 1), lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
            color: k >= 4 ? accent : color, display: "inline-block",
            transform: k === pop ? "translateY(-2px)" : "translateY(0)",
            transition: "all .35s var(--ease-out-quart)",
          }}>{c}</span>
        ))}
      </span>
    </Stack>
  );
};

// 99. Hover Reveal — wordmark hidden until hover
const L_HoverReveal = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [h, setH] = React.useState(false);
  return (
    <Stack scale={scale}>
      <span onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
        display: "inline-block", cursor: "pointer", padding: "0 6px",
        filter: h ? "blur(0)" : "blur(6px)", transition: "filter .4s var(--ease-out-quart)",
      }}>
        <Wm scale={scale} color={color} accent={accent} />
      </span>
    </Stack>
  );
};

// 100. EMMY Letter Color — every letter colored by recent trend
const L_TrendLetters = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { series } = useEmmy();
  // map last 7 deltas to letter colors
  const deltas = series.slice(-8).slice(0, 7).map((v, i) => series[series.length - 7 + i + 1] - v);
  return (
    <Stack scale={scale}>
      <span style={{ display: "inline-flex" }} className="serif">
        {"echowai".split("").map((c, k) => {
          const d = deltas[k] || 0;
          const col = d > 0.005 ? "var(--st-valide)" : d < -0.005 ? "var(--signal-stop)" : (k >= 4 ? accent : color);
          return (
            <span key={k} style={{
              fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
              color: col, display: "inline-block", transition: "color .5s",
            }}>{c}</span>
          );
        })}
      </span>
    </Stack>
  );
};

// ═══════════════════════════════════════════════════════════
// LOGO REGISTRY
// ═══════════════════════════════════════════════════════════
const LOGOS_V5 = [
  { n: "51", name: "Typewriter",       tagline: "Lettres frappées à la machine", group: "Reveal",     C: L_Typewriter,    why: "Le wordmark se révèle caractère par caractère puis disparaît. Caret clignotant. EMMY visible dessous." },
  { n: "52", name: "Letter Bounce",    tagline: "Chaque lettre rebondit",        group: "Reveal",     C: L_Bounce,        why: "Animation onde — chaque lettre rebondit avec un décalage. Très vivant, idéal en hero." },
  { n: "53", name: "Drop In",          tagline: "Survolez pour réjouer",         group: "Reveal",     C: L_Drop,          why: "Les lettres tombent en cascade. Survolez le wordmark pour relancer l'effet." },
  { n: "54", name: "Wave",             tagline: "Onde sinusoïdale lettre par lettre", group: "Motion", C: L_Wave,         why: "Sinusoïde permanente sur l'axe Y — chaque lettre ondule indépendamment." },
  { n: "55", name: "Color Cycle",      tagline: "Cycle volt → vert → ambre",      group: "Color",      C: L_ColorCycle,    why: "Chaque lettre cycle entre trois teintes du système de statut CEE. Hypnotique." },
  { n: "56", name: "Chrom Shift",      tagline: "Aberration chromatique",        group: "Color",      C: L_Chrom,         why: "RGB split rouge/bleu — esthétique CRT/glitch. Plus tech-forward." },
  { n: "57", name: "Underline Sweep",  tagline: "Soulignement qui balaye",       group: "Lines",      C: L_Underline,     why: "Une ligne traverse de gauche à droite puis se rétracte. Mouvement institutionnel calme." },
  { n: "58", name: "Strike Sweep",     tagline: "Barre qui traverse",             group: "Lines",      C: L_Strike,        why: "Barre horizontale qui traverse le wordmark puis disparaît. Tension narrative." },
  { n: "59", name: "Magnetic Letters", tagline: "Suivent votre curseur",          group: "Cursor",     C: L_Magnetic,      why: "Chaque lettre est attirée par votre souris avec atténuation par distance. Très immersif." },
  { n: "60", name: "Repel Letters",    tagline: "Fuient votre curseur",           group: "Cursor",     C: L_Repel,         why: "Inverse du magnetic — les lettres s'éloignent. Effet 'fluide' surprenant." },
  { n: "61", name: "Hover Stretch",    tagline: "Survol agrandit la lettre",      group: "Cursor",     C: L_HoverStretch,  why: "La lettre survolée prend 40% de plus et remonte. Tactile, ludique." },
  { n: "62", name: "Spin Letter",      tagline: "Survol fait pivoter 360°",       group: "Cursor",     C: L_SpinLetter,    why: "Chaque lettre pivote sur l'axe Y au survol. Très satisfaisant." },
  { n: "63", name: "Outline",          tagline: "Contour uniquement",             group: "Glyph",      C: L_Outline,       why: "Lettres en stroke seulement — esthétique poster, architecturale." },
  { n: "64", name: "Glow",             tagline: "Halo pulsant",                   group: "Glyph",      C: L_Glow,          why: "Glow bleu qui respire en boucle douce. Donne de la chaleur lumineuse." },
  { n: "65", name: "Weight Breathe",   tagline: "Graisse variable qui respire",   group: "Type",       C: L_WeightBreathe, why: "Tire-parti de l'axe variable de Bricolage — poids oscille 400↔700. Subtil mais distinctif." },
  { n: "66", name: "Skew",             tagline: "Survolez pour incliner",         group: "Cursor",     C: L_Skew,          why: "Inclinaison italique au survol. Sensation de mouvement." },
  { n: "67", name: "Vertical Stack",   tagline: "Compact vertical",               group: "Layout",     C: L_VerticalStack, why: "Wordmark compressé pour formats étroits — sidebar, app mobile." },
  { n: "68", name: "Mirror Echo",      tagline: "echo·echo·echo en signature",    group: "Layout",     C: L_Mirror,        why: "Une mini-ligne 'echo · echo · echo' en exergue rappelle l'origine du nom." },
  { n: "69", name: "Brackets",         tagline: "[ echowai ] expansibles",        group: "Layout",     C: L_Brackets,      why: "Crochets qui s'écartent au survol — esthétique code, balisage." },
  { n: "70", name: "Slash",            tagline: "Wordmark / cee",                 group: "Layout",     C: L_Slash,         why: "Slash diagonal puis 'cee' en mono — signature contextualisée." },
  { n: "71", name: "Dot Replace",      tagline: "Point du 'i' = tick EMMY",       group: "EMMY",       C: L_DotReplace,    why: "Le point du 'i' de wai est remplacé par un cercle qui prend la couleur de tendance EMMY." },
  { n: "72", name: "Click Discharge",  tagline: "Cliquez pour décharger",         group: "Click",      C: L_Discharge,     why: "Un clic émet un glow + relance le ressort. Easter-egg signature." },
  { n: "73", name: "Spark Underline",  tagline: "Sparkline EMMY en souligne",     group: "EMMY",       C: L_SparkUnderline,why: "Le souligne du wordmark est en fait le sparkline live du cours EMMY. Identité + data fusionnés." },
  { n: "74", name: "Marquee",          tagline: "Texte qui défile",               group: "Motion",     C: L_Marquee,       why: "Le wordmark défile en continu — esthétique ticker financier." },
  { n: "75", name: "O Spin",           tagline: "Le 'o' tourne en continu",       group: "Motion",     C: L_OSpin,         why: "Seul le 'o' de echo tourne sur lui-même — détail signature mémorable." },
  { n: "76", name: "Spacing Pulse",    tagline: "Letter-spacing respire",         group: "Type",       C: L_SpacingPulse,  why: "L'espacement entre lettres oscille — le wordmark respire dans son rythme." },
  { n: "77", name: "Click Stagger",    tagline: "Cliquez pour rejouer",           group: "Click",      C: L_ClickStagger,  why: "Stagger en cascade au clic — sensation de redémarrage propre." },
  { n: "78", name: "Block Invert",     tagline: "Bloc navy inversé",              group: "Layout",     C: L_BlockInvert,   why: "Wordmark en bloc navy avec texte blanc — institutionnel fort, ressemble à un cartouche." },
  { n: "79", name: "Shadow Walk",      tagline: "Ombre qui dérive en cercle",     group: "Motion",     C: L_ShadowWalk,    why: "Drop-shadow qui tourne autour des lettres — effet 3D léger sans saturer." },
  { n: "80", name: "Three Tone",       tagline: "Couleurs statut CEE",            group: "Color",      C: L_ThreeTone,     why: "Sept lettres réparties en trois couleurs (engagé/validé/contrôle) — système-driven." },
  { n: "81", name: "Mono Stamp",       tagline: "Tout en monospace",              group: "Type",       C: L_MonoStamp,     why: "Le wordmark en monospace, esthétique tampon administratif — pour cartouches officiels." },
  { n: "82", name: "Reverse Caret",    tagline: "Caret qui clignote à gauche",    group: "Type",       C: L_ReverseCaret,  why: "Caret avant le mot — sensation 'curseur prêt à éditer'." },
  { n: "83", name: "HTML Tag",         tagline: "<echo:wai>",                     group: "Type",       C: L_TagBracket,    why: "Wordmark présenté comme une balise XML/HTML — pour audiences tech." },
  { n: "84", name: "Echo Echo",        tagline: "Texte qui s'éloigne",            group: "Layered",    C: L_EchoEcho,      why: "Le wordmark se répète en décalage avec flou — sensation d'écho visuel littéral." },
  { n: "85", name: "Live Number",      tagline: "+ pill cours EMMY",              group: "EMMY",       C: L_LiveNumber,    why: "Le wordmark suivi d'une pill compacte affichant le cours EMMY en couleur de tendance." },
  { n: "86", name: "Punch",            tagline: "Survol pour rejouer",            group: "Click",      C: L_Punch,         why: "Zoom in cinematic au survol — entrée 'punch-in'." },
  { n: "87", name: "Fold E",           tagline: "Le 'e' fait des rotations",      group: "Motion",     C: L_FoldE,         why: "Le 'e' initial pivote sur l'axe Y en boucle. Détail signature singulier." },
  { n: "88", name: "Spotlight",        tagline: "Lampe-torche au curseur",        group: "Cursor",     C: L_Spotlight,     why: "Le wordmark est dissimulé sous un calque ; la souris révèle une zone — interaction de découverte." },
  { n: "89", name: "Tick Glow",        tagline: "Glow sur chaque tick EMMY",      group: "EMMY",       C: L_TickGlow,      why: "Le wordmark s'illumine brièvement à chaque mise à jour du cours EMMY. Discret mais vivant." },
  { n: "90", name: "Wai Up",           tagline: "'wai' surélevé",                 group: "Layout",     C: L_WaiUp,         why: "Le 'wai' est plus petit et levé — l'œil s'arrête sur l'accentuation." },
  { n: "91", name: "Dotless",          tagline: "Variante ouverte",               group: "Type",       C: L_Dotless,       why: "Variante typographique alternative — petites majuscules / OpenType ss01." },
  { n: "92", name: "Trail Echo",       tagline: "Mini-echos qui suivent",         group: "Cursor",     C: L_TrailEcho,     why: "Survoler le mark dépose des mini 'echo' qui s'évanouissent — l'utilisateur écrit avec sa souris." },
  { n: "93", name: "ASCII Border",     tagline: "Encadrement caractères",         group: "Layout",     C: L_AsciiBorder,   why: "Bordure ASCII autour du wordmark — esthétique terminal." },
  { n: "94", name: "Drag W",           tagline: "Glissez le 'w'",                 group: "Click",      C: L_DragLetter,    why: "Le 'w' est draggable — le tirer puis le relâcher, il revient en élastique." },
  { n: "95", name: "Shake on Hover",   tagline: "Survolez pour trembler",         group: "Cursor",     C: L_Shake,         why: "Le wordmark tremble nerveusement au survol — surprise contrôlée." },
  { n: "96", name: "Caret Cycle",      tagline: "Caret qui parcourt",             group: "Type",       C: L_CaretCycle,    why: "Le caret traverse le wordmark lettre par lettre — sensation de lecture." },
  { n: "97", name: "Diag Slash",       tagline: "/ entre echo et wai",            group: "Layout",     C: L_DiagSlash,     why: "Slash diagonal séparateur — esthétique éditoriale forte." },
  { n: "98", name: "Letter Pop",       tagline: "Une lettre fait un saut",        group: "Motion",     C: L_LetterPop,     why: "Toutes les 1.2 s une lettre aléatoire grossit brièvement. Surprise discrète." },
  { n: "99", name: "Hover Reveal",     tagline: "Flou levé au survol",            group: "Cursor",     C: L_HoverReveal,   why: "Wordmark flou par défaut, net au survol — invitation à interagir." },
  { n: "100", name: "Trend Letters",   tagline: "Lettres colorées par tendance",  group: "EMMY",       C: L_TrendLetters,  why: "Chaque lettre prend la couleur du delta EMMY correspondant à un tick historique. Le wordmark devient une mini-data-viz." },
];

// ═══════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════
const groups = ["Reveal", "Motion", "Color", "Lines", "Cursor", "Click", "EMMY", "Type", "Layout", "Layered", "Glyph"];

const LogoLab5Page = () => {
  const Card = window.LogoCardLite;
  const [filter, setFilter] = React.useState("Tous");
  const visible = filter === "Tous" ? LOGOS_V5 : LOGOS_V5.filter(l => l.group === filter);
  return (
    <CeePriceProvider>
      <LogoStyles />
      <LogoLab2Styles />
      <LogoLab3Styles />
      <LogoLab5Styles />

      <section style={{ position: "relative", overflow: "hidden" }}>
        <AuroraMesh intensity={0.6} />
        <Orb size={620} color="var(--volt-glow)" style={{ top: -160, right: -120 }} />
        <div className="r-padbox" style={{ maxWidth: 1320, margin: "0 auto", padding: "72px 32px 36px", position: "relative" }}>
          <div className="upper" style={{ color: "var(--volt)" }}>Logo Lab · volume 5</div>
          <h1 className="serif h1-fluid" style={{ fontSize: 96, lineHeight: 0.96, letterSpacing: "-0.035em", margin: "14px 0 22px", color: "var(--ink)", fontWeight: 500, maxWidth: 1100 }}>
            50 logos <em style={{ color: "var(--volt)" }}>joués sur le wordmark.</em>
          </h1>
          <p className="body-fluid" style={{ fontSize: 17, color: "var(--bone-soft)", lineHeight: 1.55, maxWidth: 880, margin: "0 0 22px" }}>
            Cette série pousse l'identité dans le wordmark lui-même : <strong style={{ color: "var(--ink)", fontWeight: 600 }}>les lettres « echowai » sont la matière première</strong>. Reveal, motion, cursor-aware, click, EMMY-driven, glyph alternates — chaque mark exploite une dimension différente de la typographie.
          </p>
          <div style={{ display: "inline-flex", padding: "10px 16px", background: "var(--card)", border: "1px solid var(--rule-on)", borderRadius: 6, alignItems: "center", gap: 14 }}>
            <EmmyStatusInline />
          </div>
        </div>
      </section>

      {/* Filter pills */}
      <section className="r-padbox" style={{ maxWidth: 1320, margin: "0 auto", padding: "20px 32px 12px" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Tous", ...groups].map(g => (
            <button key={g} onClick={() => setFilter(g)} style={{
              padding: "7px 14px", borderRadius: 4,
              background: filter === g ? "var(--volt)" : "var(--card)",
              color: filter === g ? "#fff" : "var(--ink)",
              border: "1px solid " + (filter === g ? "var(--volt)" : "var(--rule-on)"),
              fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase",
              cursor: "pointer", transition: "all .2s",
            }}>
              {g} {g !== "Tous" && <span style={{ opacity: 0.6, marginLeft: 4 }}>{LOGOS_V5.filter(l => l.group === g).length}</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="r-padbox section-pad" style={{ maxWidth: 1320, margin: "0 auto", padding: "16px 32px 80px" }}>
        <div className="r-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {visible.map(({ n, name, tagline, why, C }) => (
            <Card key={n} n={n} name={name} tagline={tagline} why={why}>
              <C />
            </Card>
          ))}
        </div>

        <div style={{
          marginTop: 60, padding: 40, background: "var(--ink)", color: "#fff", borderRadius: 8,
        }} className="on-ink">
          <div className="upper" style={{ color: "var(--volt)" }}>Récap général · 100 logos au total</div>
          <h3 className="serif" style={{ fontSize: 28, color: "#fff", fontWeight: 500, marginTop: 8, letterSpacing: "-0.02em" }}>
            5 volumes · 100 concepts uniques
          </h3>
          <div className="r-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 24, fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,.75)" }}>
            <div><strong style={{ color: "var(--volt)" }}>Vol 1</strong> · Sonar · Waveform · Monogram · Frequency · Beam · Shell</div>
            <div><strong style={{ color: "var(--volt)" }}>Vol 2</strong> · Echo Trail · Live Index · Pressable · Particles · Aperture · Field</div>
            <div><strong style={{ color: "var(--volt)" }}>Vol 3</strong> · Spiral · Compass · Constellation · Bridge · Lighthouse · DNA · Inkdrop · Eclipse · Battery · ECG · Tally · Halftone · Stamp · Vault · Radar · Ticker · Glyph Dot · Phase · Network · Bloom</div>
            <div><strong style={{ color: "var(--volt)" }}>Vol 4</strong> · Heatbox · Bar Marquee · Strand · Echo Coin · Liquid Disc · Tuning Fork · Wave Stack · Sonar Ping · Spirograph · Tape Reel · Hourglass · Polygon Morph · Stack Bars · Comet · Bouncing · Iris · Magnet</div>
            <div style={{ gridColumn: "1 / span 2" }}><strong style={{ color: "var(--volt)" }}>Vol 5</strong> · les 50 ci-dessus</div>
          </div>
        </div>
      </section>
    </CeePriceProvider>
  );
};

Object.assign(window, { LogoLab5Page, LogoLab5Styles, LOGOS_V5 });
