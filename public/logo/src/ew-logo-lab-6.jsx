/* eslint-disable */
// Echowai — Logo Lab vol. 6
// Based on user favorites: 53, 55, 57, 61, 69, 75, 77, 82, 87, 96, 97, 99 + 17, 21, 8, 3, 5, 4
// Direction: EMMY tick reaction × direct interaction × spectacular reveal

// ─── Shared helpers (local — vol 5 didn't export them) ────
const $W = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)", style, children }) => (
  <span className="serif" style={{
    fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em",
    fontWeight: 500, color, ...style,
  }}>
    {children || <>echo<span style={{ color: accent }}>wai</span></>}
  </span>
);
const $Em = ({ scale = 1 }) => {
  const { last, trend, source } = useEmmy();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: emmyHue(trend) }} className="volt-dot" />
      <span className="mono" style={{ fontSize: 8.5 * scale, color: "var(--muted)", letterSpacing: ".06em" }}>
        EMMY {last.toFixed(2)} {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {source === "emmy" ? "live" : "indic."}
      </span>
    </div>
  );
};
const $Stack = ({ scale = 1, children }) => (
  <div style={{ display: "inline-flex", flexDirection: "column" }}>
    {children}
    <$Em scale={scale} />
  </div>
);

// ─── Styles ───────────────────────────────────────────────
const LogoLab6Styles = () => (
  <style>{`
    @keyframes wipeIn {
      0%   { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
      100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
    }
    @keyframes shatterOut {
      0%   { transform: translate(0,0) rotate(0); opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)) rotate(var(--dr)); opacity: 0; }
    }
    @keyframes burstIn {
      0%   { transform: scale(0); opacity: 0; filter: blur(8px); }
      60%  { transform: scale(1.08); opacity: 1; filter: blur(0); }
      100% { transform: scale(1); opacity: 1; filter: blur(0); }
    }
    @keyframes confettiUp {
      0%   { transform: translate(0,0) rotate(0); opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)) rotate(360deg); opacity: 0; }
    }
    @keyframes glitchPos {
      0%, 100% { transform: translate(0); }
      20%      { transform: translate(-1px, 0); }
      40%      { transform: translate(1px, 0);  }
      60%      { transform: translate(0, 1px); }
      80%      { transform: translate(0, -1px); }
    }
    @keyframes slotRoll {
      0%   { transform: translateY(0); }
      100% { transform: translateY(-200px); }
    }
    @keyframes spotlightCrawl {
      0%, 100% { left: 0%; }
      50%      { left: 92%; }
    }
    @keyframes pourFill {
      0%, 100% { height: 30%; }
      50%      { height: 92%; }
    }
    @keyframes typeRace {
      0%   { transform: translateX(var(--from)); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    @keyframes barEq {
      0%, 100% { transform: scaleY(0.3); }
      50%      { transform: scaleY(1); }
    }
    @keyframes bracketBurst {
      0%   { transform: translateX(0); }
      40%  { transform: translateX(-12px); }
      100% { transform: translateX(0); }
    }
    @keyframes bracketBurstR {
      0%   { transform: translateX(0); }
      40%  { transform: translateX(12px); }
      100% { transform: translateX(0); }
    }
    @keyframes chargeBar {
      0%   { width: 0%; }
      100% { width: 100%; }
    }
  `}</style>
);

// ═══════════════════════════════════════════════════════════
// 20 logos — each: EMMY × interaction × spectacular reveal
// ═══════════════════════════════════════════════════════════

// 101. CINEMA REVEAL — click to wipe-in left-to-right, EMMY-tinted
const L_CinemaReveal = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { trend, last } = useEmmy();
  const [k, setK] = React.useState(0);
  return (
    <$Stack scale={scale}>
      <button onClick={() => setK(k + 1)} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}>
        <span key={k} style={{
          display: "inline-block",
          animation: "wipeIn .8s var(--ease-out-quart) both",
          background: `linear-gradient(90deg, ${emmyHue(trend)}, ${accent} 60%)`,
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        }}>
          <$W scale={scale} color="transparent" accent="transparent" style={{ color: "transparent" }} />
        </span>
      </button>
    </$Stack>
  );
};

// 102. HOLD TO CHARGE — press & hold, charge bar fills, release = burst
const L_HoldCharge = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [holding, setHolding] = React.useState(false);
  const [released, setReleased] = React.useState(0);
  return (
    <$Stack scale={scale}>
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
        <button
          onMouseDown={() => setHolding(true)}
          onMouseUp={() => { setHolding(false); setReleased(r => r + 1); }}
          onMouseLeave={() => setHolding(false)}
          style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}>
          <span key={released} style={{
            display: "inline-block",
            animation: released > 0 ? "burstIn .7s var(--ease-out-quart)" : "none",
          }}>
            <$W scale={scale} color={color} accent={accent} />
          </span>
        </button>
        <div style={{ height: 3, background: "var(--card-3)", borderRadius: 2, overflow: "hidden", width: "100%" }}>
          <div style={{
            height: "100%", background: accent,
            width: holding ? "100%" : "0%",
            transition: holding ? "width 1.2s linear" : "width .2s",
          }} />
        </div>
        <span className="mono" style={{ fontSize: 9 * scale, color: "var(--muted)" }}>
          {holding ? "chargement…" : released > 0 ? "✓ écho émis" : "maintenez pour charger"}
        </span>
      </div>
    </$Stack>
  );
};

// 103. SLOT MACHINE — letters spin through random glyphs before settling
const L_Slot = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last } = useEmmy();
  const [k, setK] = React.useState(0);
  const prev = React.useRef(last);
  React.useEffect(() => { if (prev.current !== last) { setK(k + 1); prev.current = last; } }, [last]);
  return (
    <$Stack scale={scale}>
      <button onClick={() => setK(k + 1)} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}>
        <span style={{ display: "inline-flex" }} className="serif">
          {"echowai".split("").map((c, i) => (
            <span key={`${k}-${i}`} style={{
              fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
              color: i >= 4 ? accent : color, display: "inline-block", height: 32 * scale, overflow: "hidden",
            }}>
              <span style={{
                display: "inline-flex", flexDirection: "column",
                animation: `slotRoll ${0.5 + i * 0.12}s var(--ease-out-quart) forwards`,
              }}>
                {/* random glyphs cycle then real letter */}
                <span>{String.fromCharCode(97 + ((i * 7 + 3) % 26))}</span>
                <span>{String.fromCharCode(97 + ((i * 11 + 5) % 26))}</span>
                <span>{String.fromCharCode(97 + ((i * 13 + 7) % 26))}</span>
                <span>{String.fromCharCode(97 + ((i * 17 + 11) % 26))}</span>
                <span>{c}</span>
              </span>
            </span>
          ))}
        </span>
      </button>
    </$Stack>
  );
};

// 104. SHATTER & REBUILD — click: letters explode into particles, then rebuild
const L_Shatter = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [phase, setPhase] = React.useState("idle"); // idle | shattering | rebuilding
  const fire = () => {
    setPhase("shattering");
    setTimeout(() => setPhase("rebuilding"), 600);
    setTimeout(() => setPhase("idle"), 1300);
  };
  return (
    <$Stack scale={scale}>
      <button onClick={fire} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", position: "relative" }}>
        {phase !== "shattering" ? (
          <span key={phase} style={{
            display: "inline-block",
            animation: phase === "rebuilding" ? "burstIn .7s var(--ease-out-quart)" : "none",
          }}>
            <$W scale={scale} color={color} accent={accent} />
          </span>
        ) : (
          <span style={{ display: "inline-flex" }} className="serif">
            {"echowai".split("").map((c, i) => (
              <span key={i} style={{
                fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
                color: i >= 4 ? accent : color, display: "inline-block",
                animation: "shatterOut .6s var(--ease-out-quart) forwards",
                "--dx": `${(Math.random() - 0.5) * 80}px`,
                "--dy": `${(Math.random() - 0.5) * 60}px`,
                "--dr": `${(Math.random() - 0.5) * 360}deg`,
              }}>{c}</span>
            ))}
          </span>
        )}
      </button>
    </$Stack>
  );
};

// 105. SPOTLIGHT CRAWL — auto spotlight traverses, letter under it lifts + glows
const L_SpotlightCrawl = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf, s0 = performance.now();
    const loop = (now) => { setT((((now - s0) / 1000) % 4) / 4); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const center = t * 7; // 0..7 letters
  return (
    <$Stack scale={scale}>
      <span style={{ position: "relative", display: "inline-block", padding: "8px 12px" }}>
        <span style={{
          position: "absolute", top: 0, bottom: 0, left: `${(t * 100)}%`,
          width: 60, transform: "translateX(-50%)",
          background: `radial-gradient(closest-side, var(--volt-glow), transparent 70%)`,
          pointerEvents: "none",
        }} />
        <span style={{ display: "inline-flex" }} className="serif">
          {"echowai".split("").map((c, i) => {
            const dist = Math.abs(i - center);
            const lift = Math.max(0, 1 - dist) * 6;
            return (
              <span key={i} style={{
                fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
                color: i >= 4 ? accent : color, display: "inline-block",
                transform: `translateY(-${lift}px)`,
                textShadow: lift > 2 ? `0 0 14px var(--volt-glow)` : "none",
                transition: "all .25s var(--ease-out-quart)",
              }}>{c}</span>
            );
          })}
        </span>
      </span>
    </$Stack>
  );
};

// 106. TILT 3D — wordmark tilts in 3D space toward cursor
const L_Tilt3D = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const ref = React.useRef(null);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    setTilt({
      x: ((e.clientX - r.left - r.width / 2) / r.width) * 20,
      y: ((e.clientY - r.top - r.height / 2) / r.height) * 16,
    });
  };
  return (
    <$Stack scale={scale}>
      <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{ display: "inline-block", perspective: 400, cursor: "crosshair" }}>
        <span style={{
          display: "inline-block",
          transform: `rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`,
          transition: "transform .15s var(--ease-out-quart)",
        }}>
          <$W scale={scale} color={color} accent={accent} />
        </span>
      </div>
    </$Stack>
  );
};

// 107. LIQUID POUR — letters as bottles filled by EMMY-colored liquid
const L_LiquidPour = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last, trend } = useEmmy();
  const fill = emmyNorm(last); // 0..1
  return (
    <$Stack scale={scale}>
      <span style={{ display: "inline-flex", position: "relative", overflow: "hidden", padding: "4px 0" }} className="serif">
        {"echowai".split("").map((c, i) => (
          <span key={i} style={{
            position: "relative", display: "inline-block",
            fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
            color: "var(--card-3)",
          }}>
            {c}
            <span style={{
              position: "absolute", left: 0, right: 0, bottom: 0,
              height: `${30 + fill * 60}%`,
              overflow: "hidden", color: i >= 4 ? accent : emmyHue(trend),
              transition: "height .9s var(--ease-out-quart)",
            }}>{c}</span>
          </span>
        ))}
      </span>
    </$Stack>
  );
};

// 108. LIGHTHOUSE WORDMARK — beam from a fixed point rotates, highlighting one letter
const L_LighthouseWord = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf, s0 = performance.now();
    const loop = (now) => { setT(((now - s0) / 1000) % 5); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const i = Math.floor(t / 5 * 7);
  return (
    <$Stack scale={scale}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
        <svg width={28 * scale} height={28 * scale} viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="2.4" fill={accent} />
          <g style={{ transformOrigin: "14px 14px", animation: "spinSlow 5s linear infinite" }}>
            <path d="M 14 14 L 28 8 L 28 20 Z" fill="var(--volt-glow)" />
          </g>
        </svg>
        <span style={{ display: "inline-flex" }} className="serif">
          {"echowai".split("").map((c, k) => (
            <span key={k} style={{
              fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
              color: k === i ? accent : (k >= 4 ? "rgba(46,126,244,.4)" : "var(--bone-mute)"),
              display: "inline-block",
              transform: k === i ? "translateY(-2px)" : "translateY(0)",
              transition: "all .3s var(--ease-out-quart)",
            }}>{c}</span>
          ))}
        </span>
      </span>
    </$Stack>
  );
};

// 109. CONFETTI BURST — click, confetti explodes, wordmark appears
const L_Confetti = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  const palette = ["var(--volt)", "var(--st-valide)", "var(--st-controle)", "var(--volt-deep)"];
  return (
    <$Stack scale={scale}>
      <button onClick={() => setK(k + 1)} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", position: "relative" }}>
        <span key={k} style={{
          display: "inline-block",
          animation: k > 0 ? "burstIn .65s var(--ease-out-quart)" : "none",
        }}>
          <$W scale={scale} color={color} accent={accent} />
        </span>
        {k > 0 && Array.from({ length: 18 }).map((_, i) => (
          <span key={`${k}-${i}`} style={{
            position: "absolute", left: "50%", top: "50%",
            width: 4, height: 4, background: palette[i % 4],
            borderRadius: "1px", pointerEvents: "none",
            animation: "confettiUp .9s var(--ease-out-quart) forwards",
            "--dx": `${(Math.random() - 0.5) * 120}px`,
            "--dy": `${-30 - Math.random() * 60}px`,
          }} />
        ))}
      </button>
    </$Stack>
  );
};

// 110. EQUALIZER WORDMARK — each letter has a bar above driven by EMMY
const L_EqualizerWord = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { series } = useEmmy();
  const bars = "echowai".split("").map((_, i) => {
    const v = series[series.length - 1 - i] ?? CEE_BASELINE;
    return emmyNorm(v);
  });
  return (
    <$Stack scale={scale}>
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 3 }}>
        <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 0, height: 16 * scale }}>
          {bars.map((h, i) => (
            <span key={i} style={{
              width: 18 * scale, marginRight: 2, height: `${20 + h * 70}%`,
              background: i === 6 ? emmyHue(useEmmy().trend) : accent,
              borderRadius: 1, transition: "height .9s var(--ease-out-quart)",
            }} />
          ))}
        </span>
        <$W scale={scale} color={color} accent={accent} />
      </div>
    </$Stack>
  );
};

// 111. CARET PAINTER — caret traverses left to right, paints wordmark behind
const L_CaretPainter = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  return (
    <$Stack scale={scale}>
      <button onClick={() => setK(k + 1)} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", position: "relative" }}>
        <span style={{ display: "inline-flex" }} className="serif">
          {"echowai".split("").map((c, i) => (
            <span key={`${k}-${i}`} style={{
              fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
              color: i >= 4 ? accent : color, display: "inline-block",
              opacity: 0,
              animation: `letterDrop .3s var(--ease-out-quart) ${i * 0.12}s forwards`,
            }}>{c}</span>
          ))}
        </span>
        <span style={{
          position: "absolute", top: 0, left: 0, width: 2, height: 32 * scale, background: accent,
          animation: "scrollText 1s linear",
          animationDuration: "1.0s",
          animationFillMode: "forwards",
        }} />
      </button>
    </$Stack>
  );
};

// 112. BRACKET BURST — click: brackets fly outward, EMMY value flashes in middle
const L_BracketBurst = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  const { last } = useEmmy();
  return (
    <$Stack scale={scale}>
      <button onClick={() => setK(k + 1)} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", position: "relative" }}>
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4, position: "relative" }}>
          <span key={`l-${k}`} className="serif" style={{
            fontSize: 36 * scale, fontWeight: 400, color: accent,
            animation: k > 0 ? "bracketBurst .6s var(--ease-out-quart)" : "none",
          }}>[</span>
          <$W scale={scale} color={color} accent={accent} />
          <span key={`r-${k}`} className="serif" style={{
            fontSize: 36 * scale, fontWeight: 400, color: accent,
            animation: k > 0 ? "bracketBurstR .6s var(--ease-out-quart)" : "none",
          }}>]</span>
        </span>
        {k > 0 && <span key={`v-${k}`} style={{
          position: "absolute", left: "50%", top: -8, transform: "translateX(-50%)",
          color: accent, fontFamily: "var(--font-mono)", fontSize: 10, whiteSpace: "nowrap",
          animation: "letterDrop .6s var(--ease-out-quart) forwards", opacity: 0,
        }}>{last.toFixed(2)} €/MWh</span>}
      </button>
    </$Stack>
  );
};

// 113. PIXEL REBUILD — letters explode into pixel-dust then reform
const L_PixelRebuild = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [phase, setPhase] = React.useState("on");
  const fire = () => { setPhase("off"); setTimeout(() => setPhase("on"), 700); };
  return (
    <$Stack scale={scale}>
      <button onClick={fire} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", position: "relative" }}>
        {phase === "on" ? (
          <span style={{ display: "inline-block", animation: "burstIn .6s var(--ease-out-quart)" }}>
            <$W scale={scale} color={color} accent={accent} />
          </span>
        ) : (
          <span style={{ position: "relative", display: "inline-block", width: 180 * scale, height: 32 * scale }}>
            {Array.from({ length: 60 }).map((_, i) => (
              <span key={i} style={{
                position: "absolute", left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                width: 3, height: 3, background: i % 4 === 0 ? accent : color,
                animation: "shatterOut .7s var(--ease-out-quart) forwards",
                "--dx": `${(Math.random() - 0.5) * 60}px`,
                "--dy": `${(Math.random() - 0.5) * 40}px`,
                "--dr": "0deg",
              }} />
            ))}
          </span>
        )}
      </button>
    </$Stack>
  );
};

// 114. DIAGONAL WIPE — hover: wordmark wipes in on diagonal, EMMY color tint
const L_DiagWipe = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { trend } = useEmmy();
  const [k, setK] = React.useState(0);
  return (
    <$Stack scale={scale}>
      <span onMouseEnter={() => setK(k + 1)} style={{ display: "inline-block", cursor: "pointer", overflow: "hidden" }}>
        <span key={k} style={{
          display: "inline-block",
          animation: "wipeIn .55s var(--ease-out-quart)",
          background: `linear-gradient(45deg, ${emmyHue(trend)}, ${accent})`,
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        }}>
          <$W scale={scale} color="transparent" accent="transparent" />
        </span>
      </span>
    </$Stack>
  );
};

// 115. TYPE RACE — letters race in from random sides
const L_TypeRace = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  return (
    <$Stack scale={scale}>
      <button onClick={() => setK(k + 1)} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}>
        <span key={k} style={{ display: "inline-flex" }} className="serif">
          {"echowai".split("").map((c, i) => {
            const fromLeft = (i + k) % 2 === 0;
            return (
              <span key={i} style={{
                fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
                color: i >= 4 ? accent : color, display: "inline-block",
                "--from": fromLeft ? "-40px" : "40px",
                animation: `typeRace .5s var(--ease-out-quart) ${i * 0.08}s both`,
                opacity: 0,
              }}>{c}</span>
            );
          })}
        </span>
      </button>
    </$Stack>
  );
};

// 116. ECHO TRAIL TYPE — typing the word in real-time on hover
const L_EchoTrailType = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [progress, setProgress] = React.useState(7);
  const hover = () => {
    setProgress(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1; setProgress(i);
      if (i >= 7) clearInterval(id);
    }, 90);
  };
  return (
    <$Stack scale={scale}>
      <span onMouseEnter={hover} style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }} className="serif">
        {"echowai".split("").slice(0, progress).map((c, i) => (
          <span key={i} style={{
            fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
            color: i >= 4 ? accent : color, display: "inline-block",
            animation: "burstIn .25s var(--ease-out-quart) both",
          }}>{c}</span>
        ))}
        {progress < 7 && (
          <span style={{ width: 2, height: 28 * scale, background: accent, marginLeft: 1, animation: "glowDot .5s steps(2) infinite" }} />
        )}
      </span>
    </$Stack>
  );
};

// 117. UNDERLINE-TO-SPARKLINE — line animates from straight into live sparkline on hover
const L_UnderlineToSpark = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { series } = useEmmy();
  const [hov, setHov] = React.useState(false);
  const W = 180, H = 14;
  const lo = CEE_BASELINE * (1 - CEE_BAND), hi = CEE_BASELINE * (1 + CEE_BAND);
  const norm = (v) => 1 - (v - lo) / (hi - lo);
  const spark = "M " + series.map((v, i) => `${(i / (series.length - 1) * W).toFixed(1)} ${(2 + norm(v) * (H - 4)).toFixed(1)}`).join(" L ");
  const flat = `M 0 ${H/2} L ${W} ${H/2}`;
  return (
    <$Stack scale={scale}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ display: "inline-flex", flexDirection: "column", cursor: "pointer" }}>
        <$W scale={scale} color={color} accent={accent} />
        <svg width={W * scale} height={H * scale} viewBox={`0 0 ${W} ${H}`}>
          <path d={hov ? spark : flat} fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "d .9s var(--ease-out-quart)" }} />
        </svg>
      </div>
    </$Stack>
  );
};

// 118. DISCOVER DOTS — letters initially hidden as dots, hover reveals each
const L_Discover = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [seen, setSeen] = React.useState(new Set());
  return (
    <$Stack scale={scale}>
      <span style={{ display: "inline-flex", gap: 2 }} className="serif">
        {"echowai".split("").map((c, i) => (
          <span key={i} onMouseEnter={() => setSeen(s => new Set([...s, i]))}
            style={{
              fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
              color: i >= 4 ? accent : color, display: "inline-block", cursor: "crosshair",
              minWidth: 20 * scale, textAlign: "center",
              transition: "all .35s var(--ease-out-quart)",
            }}>
            {seen.has(i) ? c : <span style={{ display: "inline-block", width: 8 * scale, height: 8 * scale, borderRadius: "50%", background: i >= 4 ? accent : color, opacity: 0.4, verticalAlign: "middle" }} />}
          </span>
        ))}
      </span>
    </$Stack>
  );
};

// 119. GLITCH REVEAL — text glitches on each EMMY tick
const L_GlitchTick = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last } = useEmmy();
  const [k, setK] = React.useState(0);
  const prev = React.useRef(last);
  React.useEffect(() => { if (prev.current !== last) { setK(k + 1); prev.current = last; } }, [last]);
  return (
    <$Stack scale={scale}>
      <span key={k} style={{ display: "inline-block", animation: "glitchPos .35s linear" }}>
        <$W scale={scale} color={color} accent={accent} style={{
          textShadow: `1px 0 0 ${emmyHue(useEmmy().trend)}, -1px 0 0 ${accent}`,
        }} />
      </span>
    </$Stack>
  );
};

// 120. ECHO TICKER — every EMMY tick adds a fading copy behind
const L_TickEcho = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last } = useEmmy();
  const [echoes, setEchoes] = React.useState([]);
  const prev = React.useRef(last);
  React.useEffect(() => {
    if (prev.current !== last) {
      const id = Math.random();
      setEchoes(e => [...e, id]);
      setTimeout(() => setEchoes(e => e.filter(x => x !== id)), 1200);
      prev.current = last;
    }
  }, [last]);
  return (
    <$Stack scale={scale}>
      <span style={{ position: "relative", display: "inline-block" }}>
        {echoes.map((id, i) => (
          <span key={id} style={{
            position: "absolute", inset: 0, opacity: 0.4,
            animation: "shatterOut 1.2s var(--ease-out-quart) forwards",
            "--dx": "16px", "--dy": "0px", "--dr": "0deg",
            color: emmyHue(useEmmy().trend),
            pointerEvents: "none",
          }}>
            <$W scale={scale} color="currentColor" accent="currentColor" />
          </span>
        ))}
        <$W scale={scale} color={color} accent={accent} />
      </span>
    </$Stack>
  );
};

// ═══════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════
const LOGOS_V6 = [
  { n: "101", name: "Cinema Reveal",      tagline: "Wipe gauche-à-droite · gradient EMMY",   C: L_CinemaReveal,     why: "Au clic, le wordmark se révèle par un wipe latéral avec un gradient teinté par la tendance EMMY (vert haut / rouge bas). Spectaculaire et data-aware." },
  { n: "102", name: "Hold to Charge",     tagline: "Maintenez pour décharger",                C: L_HoldCharge,       why: "Appuyez et maintenez : une jauge se remplit. Au relâchement, le wordmark fait un burst spectaculaire. Tactile, gamifié." },
  { n: "103", name: "Slot Machine",       tagline: "Lettres défilent puis se figent",         C: L_Slot,             why: "À chaque tick EMMY, les lettres défilent comme un bandit manchot avant de se figer sur 'echowai'. Casino-grade reveal." },
  { n: "104", name: "Shatter & Rebuild",  tagline: "Click : éclate + reconstruit",            C: L_Shatter,          why: "Cliquez pour faire exploser les lettres en particules, qui se réassemblent en un burst lumineux. Cinematographique." },
  { n: "105", name: "Spotlight Crawl",    tagline: "Spot lumineux qui traverse",              C: L_SpotlightCrawl,   why: "Un spotlight glisse de gauche à droite en boucle ; la lettre sous le spot se soulève + glow. Visuellement intense, jamais agressif." },
  { n: "106", name: "Tilt 3D",            tagline: "Inclinaison 3D au curseur",               C: L_Tilt3D,           why: "Le wordmark s'incline en 3D vers votre curseur — perspective parallax. Sensation 'objet précieux'." },
  { n: "107", name: "Liquid Pour",        tagline: "Lettres remplies par cours EMMY",         C: L_LiquidPour,       why: "Chaque lettre se remplit du bas vers le haut comme un récipient. Niveau de remplissage proportionnel au cours EMMY. Pédagogique." },
  { n: "108", name: "Lighthouse Word",    tagline: "Faisceau illumine une lettre",            C: L_LighthouseWord,   why: "Un mark-phare à gauche émet un faisceau rotatif ; la lettre 'éclairée' s'illumine pendant que les autres restent en gris. Spectaculaire." },
  { n: "109", name: "Confetti Burst",     tagline: "Click : confettis + reveal",              C: L_Confetti,         why: "Clic explose en confettis multicolores ; le wordmark apparaît au centre avec un effet burst. Joie pure." },
  { n: "110", name: "Equalizer Word",     tagline: "Barres EQ au-dessus de chaque lettre",    C: L_EqualizerWord,    why: "Une barre verticale au-dessus de chaque lettre, hauteur proportionnelle à un tick EMMY. Le wordmark devient un mini-graphe." },
  { n: "111", name: "Caret Painter",      tagline: "Caret traverse, peint les lettres",       C: L_CaretPainter,     why: "Au clic, un caret traverse de gauche à droite et 'peint' les lettres une par une derrière lui. Très satisfaisant." },
  { n: "112", name: "Bracket Burst",      tagline: "[ ] s'écartent + valeur affichée",        C: L_BracketBurst,     why: "Au clic, les crochets [ ] s'écartent violemment et le cours EMMY actuel s'affiche brièvement au-dessus. Forte signature." },
  { n: "113", name: "Pixel Rebuild",      tagline: "Particules · reconstruction",             C: L_PixelRebuild,     why: "Clic disperse 60 particules ; le wordmark se reforme dans un burst. Variante plus pointilliste du shatter." },
  { n: "114", name: "Diagonal Wipe",      tagline: "Hover : wipe diagonal + gradient",        C: L_DiagWipe,         why: "Au survol, le wordmark apparaît par un wipe diagonal avec gradient EMMY. Plus élégant que cinema reveal." },
  { n: "115", name: "Type Race",          tagline: "Lettres convergent vers leur position",   C: L_TypeRace,         why: "Au clic, chaque lettre arrive de gauche ou droite alternativement, vers sa position finale. Mouvement de réassemblage." },
  { n: "116", name: "Trail Type",         tagline: "Hover : tape le mot en direct",           C: L_EchoTrailType,    why: "Au survol, le wordmark s'écrit en direct lettre par lettre, comme si quelqu'un tapait. Caret clignote en attendant." },
  { n: "117", name: "Underline → Spark",  tagline: "Souligne devient sparkline EMMY",         C: L_UnderlineToSpark, why: "Au survol, le souligne droit se transforme en sparkline live du cours EMMY. Métamorphose data-elegant." },
  { n: "118", name: "Discover Dots",      tagline: "Survolez chaque point",                   C: L_Discover,         why: "Les lettres sont initialement des points ; survoler chacun le révèle. Exploration ludique, gamifie l'identité." },
  { n: "119", name: "Glitch Tick",        tagline: "Glitch RGB sur chaque tick EMMY",         C: L_GlitchTick,       why: "À chaque mise à jour du cours, le wordmark glitch brièvement avec aberration chromatique aux couleurs du trend. Énergique." },
  { n: "120", name: "Echo Drift",         tagline: "Tick → écho fantôme dérive",              C: L_TickEcho,         why: "À chaque tick EMMY, une copie fantôme du wordmark se détache et dérive vers la droite en s'estompant. Littéralement un écho." },
];

const LogoLab6Page = () => {
  const Card = window.LogoCardLite;
  return (
    <CeePriceProvider>
      <LogoStyles />
      <LogoLab2Styles />
      <LogoLab3Styles />
      <LogoLab5Styles />
      <LogoLab6Styles />

      <section style={{ position: "relative", overflow: "hidden" }}>
        <AuroraMesh intensity={0.7} />
        <Orb size={620} color="var(--volt-glow)" style={{ top: -160, left: -120 }} />
        <div className="r-padbox" style={{ maxWidth: 1320, margin: "0 auto", padding: "72px 32px 36px", position: "relative" }}>
          <div className="upper" style={{ color: "var(--volt)" }}>Logo Lab · volume 6 · sur mesure</div>
          <h1 className="serif h1-fluid" style={{ fontSize: 96, lineHeight: 0.96, letterSpacing: "-0.035em", margin: "14px 0 22px", color: "var(--ink)", fontWeight: 500, maxWidth: 1100 }}>
            20 logos <em style={{ color: "var(--volt)" }}>EMMY × interaction × spectacle.</em>
          </h1>
          <p className="body-fluid" style={{ fontSize: 17, color: "var(--bone-soft)", lineHeight: 1.55, maxWidth: 880, margin: "0 0 18px" }}>
            Calibrés sur ta short-list — typographie jouée (53, 55, 57, 61, 69, 75, 77, 87, 96, 97, 99), caret cycle (82, 96), data live (8), géométriques signature (3, 5, 17, 21). Chaque mark combine <strong style={{ color: "var(--ink)" }}>réaction au cours EMMY</strong> + <strong style={{ color: "var(--ink)" }}>interaction directe</strong> + <strong style={{ color: "var(--ink)" }}>apparition spectaculaire</strong>.
          </p>
          <div style={{ display: "inline-flex", padding: "10px 16px", background: "var(--card)", border: "1px solid var(--rule-on)", borderRadius: 6, alignItems: "center", gap: 14 }}>
            <EmmyStatusInline />
          </div>
        </div>
      </section>

      <section className="r-padbox section-pad" style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 32px 80px" }}>
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            ↳ <strong style={{ color: "var(--ink)" }}>Astuce</strong> — survolez, cliquez, maintenez. Chaque mark a une interaction propre indiquée dans la description.
          </p>
        </div>

        <div className="r-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {LOGOS_V6.map(({ n, name, tagline, why, C }) => (
            <Card key={n} n={n} name={name} tagline={tagline} why={why}>
              <C />
            </Card>
          ))}
        </div>

        <div style={{ marginTop: 60, padding: 40, background: "var(--ink)", color: "#fff", borderRadius: 8 }} className="on-ink">
          <div className="upper" style={{ color: "var(--volt)" }}>Top 5 recommandés pour ta short-list</div>
          <div className="r-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18, marginTop: 14 }}>
            {[
              { n: "104", t: "Le plus cinématographique", desc: "Shatter & Rebuild" },
              { n: "108", t: "Le plus signature", desc: "Lighthouse Word" },
              { n: "112", t: "Hommage à #69", desc: "Bracket Burst" },
              { n: "117", t: "Hommage à #57+#8", desc: "Underline → Spark" },
              { n: "120", t: "Pure poésie écho", desc: "Echo Drift" },
            ].map(r => (
              <div key={r.n} style={{ padding: 16, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 4 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--volt)" }}>{r.n}</span>
                <div className="serif" style={{ fontSize: 18, color: "#fff", marginTop: 6, fontWeight: 500 }}>{r.desc}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", marginTop: 4, lineHeight: 1.45 }}>{r.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </CeePriceProvider>
  );
};

Object.assign(window, { LogoLab6Page, LogoLab6Styles, LOGOS_V6 });
