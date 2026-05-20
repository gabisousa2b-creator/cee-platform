/* eslint-disable */
// Echowai — Logo Lab vol. 2
// 6 new logos with stronger interaction / UX — cursor-aware, clickable, live data

// ─────────────────────────────────────────────────────────
// 7. ECHO TRAIL — mark follows cursor in its container,
//    leaves a fading trail of small arcs.
//    UX: you literally make the echo as you move.
// ─────────────────────────────────────────────────────────
const LogoEchoTrail = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const ref = React.useRef(null);
  const [trail, setTrail] = React.useState([]);  // [{x, y, id}]
  const [pos, setPos] = React.useState({ x: 28, y: 28 });
  const last = React.useRef(0);

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = Math.max(8, Math.min(48, ((e.clientX - r.left) / r.width) * 56));
    const y = Math.max(8, Math.min(48, ((e.clientY - r.top) / r.height) * 56));
    setPos({ x, y });
    // throttle: 1 trail point per 80ms
    const now = performance.now();
    if (now - last.current > 80) {
      last.current = now;
      const id = now;
      setTrail(t => [...t.slice(-6), { x, y, id }]);
      setTimeout(() => setTrail(t => t.filter(p => p.id !== id)), 900);
    }
  };
  const onLeave = () => {
    setPos({ x: 28, y: 28 });
    setTrail([]);
  };

  const s = scale;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * s, color }}>
      <svg ref={ref} width={56 * s} height={56 * s} viewBox="0 0 56 56"
        onMouseMove={onMove} onMouseLeave={onLeave}
        style={{ cursor: "crosshair" }} aria-hidden>
        {/* Faint container ring as a hit area */}
        <circle cx="28" cy="28" r="24" fill="transparent" stroke={accent} strokeOpacity="0.12" strokeWidth="1" />
        {/* Trail */}
        {trail.map((p, i) => (
          <circle key={p.id} cx={p.x} cy={p.y} r={6 + i * 1.4}
            fill="none" stroke={accent} strokeWidth="1"
            style={{
              opacity: 0.45 - i * 0.05,
              animation: "trailFade .9s linear forwards",
              transformOrigin: `${p.x}px ${p.y}px`,
            }} />
        ))}
        {/* Active node — follows cursor */}
        <circle cx={pos.x} cy={pos.y} r="3.2" fill={accent}
          style={{ transition: "cx .12s linear, cy .12s linear" }} />
        {/* Live emitter ripple */}
        <circle cx={pos.x} cy={pos.y} r="8" fill="none" stroke={accent} strokeWidth="1.4"
          style={{
            opacity: 0.5,
            transition: "cx .12s linear, cy .12s linear",
            animation: "trailFade 1.4s ease-out infinite",
            transformOrigin: `${pos.x}px ${pos.y}px`,
          }} />
      </svg>
      <span className="serif" style={{
        fontSize: 32 * s, lineHeight: 1, letterSpacing: "-0.035em",
        fontWeight: 500, color,
      }}>
        echo<span style={{ color: accent }}>wai</span>
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// 8. LIVE INDEX — the mark IS a mini sparkline of the
//    CEE certificate price (EMMY registry).
//    Tries window.ECHOWAI_CEE_API first; falls back to a
//    smooth random walk clamped at ±5% from baseline 9.11.
// ─────────────────────────────────────────────────────────
const CEE_BASELINE = 9.11;       // €/MWh — last known indicative EMMY level
const CEE_BAND     = 0.05;       // ±5% clamp
const CEE_STEP     = 0.003;      // ±0.3% per tick → progressive walk
const CEE_TICK_MS  = 3000;       // 3s — keep it stately, like a real market

// Hook: returns { series, last, trend, source }
// - series: 14 last prices in €/MWh
// - last:   most recent number
// - trend:  +1 / -1 / 0 over last 3 ticks
// - source: 'emmy' if real fetch succeeded, 'indicative' otherwise
const useCeePrice = ({ endpoint, length = 14 } = {}) => {
  const url = endpoint || (typeof window !== "undefined" && window.ECHOWAI_CEE_API);
  const [series, setSeries] = React.useState(() => {
    // seed with a flat-ish line near baseline
    return Array.from({ length }, (_, i) =>
      CEE_BASELINE * (1 + Math.sin(i * 0.4) * 0.008)
    );
  });
  const [source, setSource] = React.useState("indicative");

  const stepSynth = React.useCallback((prev) => {
    // Mean-reverting smooth walk clamped at baseline ± 5%
    const drift = (CEE_BASELINE - prev) * 0.06;         // pull toward baseline
    const noise = (Math.random() - 0.5) * 2 * CEE_STEP * CEE_BASELINE;
    let next = prev + drift + noise;
    const lo = CEE_BASELINE * (1 - CEE_BAND);
    const hi = CEE_BASELINE * (1 + CEE_BAND);
    if (next < lo) next = lo + Math.random() * (CEE_BASELINE - lo) * 0.1;
    if (next > hi) next = hi - Math.random() * (hi - CEE_BASELINE) * 0.1;
    return next;
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      let real = null;
      if (url) {
        try {
          const res = await fetch(url, { headers: { Accept: "application/json" } });
          if (res.ok) {
            const data = await res.json();
            // Expected shape: { price: number } or { value: number }
            real = data && (data.price ?? data.value);
          }
        } catch (e) {
          // CORS / network / unreachable — fall through to synthetic
        }
      }
      if (cancelled) return;
      setSeries(s => {
        const prev = s[s.length - 1];
        const next = typeof real === "number" ? real : stepSynth(prev);
        return [...s.slice(1), next];
      });
      if (real !== null) setSource("emmy");
    };
    tick();
    const id = setInterval(tick, CEE_TICK_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [url, stepSynth]);

  const last  = series[series.length - 1];
  const prev3 = series[series.length - 4] ?? last;
  const trend = last > prev3 + 0.005 ? 1 : last < prev3 - 0.005 ? -1 : 0;

  return { series, last, trend, source };
};

const LogoLiveIndex = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)", endpoint }) => {
  const { series, last, trend, source } = useCeePrice({ endpoint });
  // Normalize to 0..1 against the ±5% band for plot
  const lo = CEE_BASELINE * (1 - CEE_BAND);
  const hi = CEE_BASELINE * (1 + CEE_BAND);
  const norm = (v) => Math.max(0.08, Math.min(0.92, (v - lo) / (hi - lo)));
  const s = scale;
  const W = 70, H = 36, P = 4;
  const pts = series.map((v, i) => ({
    x: P + (i / (series.length - 1)) * (W - 2 * P),
    y: P + (1 - norm(v)) * (H - 2 * P),
  }));
  const d = "M " + pts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");
  const fillD = d + ` L ${W - P} ${H - P} L ${P} ${H - P} Z`;
  const lp = pts[pts.length - 1];
  const trendChar = trend > 0 ? "↑" : trend < 0 ? "↓" : "→";
  const trendColor = trend > 0 ? "var(--st-valide)" : trend < 0 ? "var(--signal-stop)" : "var(--muted)";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * s, color }}>
      <svg width={W * s} height={H * s} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <defs>
          <linearGradient id="liveGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={accent} stopOpacity="0.3" />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Mid-line (baseline) */}
        <line x1={P} y1={H / 2} x2={W - P} y2={H / 2} stroke={accent} strokeOpacity="0.18" strokeWidth="0.6" strokeDasharray="2 2" />
        {/* Area fill */}
        <path d={fillD} fill="url(#liveGrad)" style={{ transition: "d .8s var(--ease-out-quart)" }} />
        {/* Line */}
        <path d={d} fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "d .8s var(--ease-out-quart)" }} />
        {/* Last point */}
        <circle cx={lp.x} cy={lp.y} r="2.4" fill={accent}
          style={{ transition: "cx .8s var(--ease-out-quart), cy .8s var(--ease-out-quart)" }} />
        <circle cx={lp.x} cy={lp.y} r="4" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.5"
          style={{ transition: "cx .8s, cy .8s", animation: "trailFade 1.6s ease-out infinite" }} />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <span className="serif" style={{
          fontSize: 32 * s, lineHeight: 1, letterSpacing: "-0.035em",
          fontWeight: 500, color,
        }}>
          echo<span style={{ color: accent }}>wai</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent }} className="volt-dot" />
          <span className="mono" style={{ fontSize: 9.5 * s, color: "var(--muted)", letterSpacing: ".06em" }}>
            EMMY · {last.toFixed(2)} €/MWh
          </span>
          <span className="mono" style={{ fontSize: 9.5 * s, color: trendColor, fontWeight: 600 }}>{trendChar}</span>
          <span className="mono" style={{ fontSize: 8.5 * s, color: "var(--bone-mute)", letterSpacing: ".04em" }}>
            · {source === "emmy" ? "live" : "indicatif"}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// 9. PRESSABLE — click the mark to discharge a big ripple
//    + +1 pulse counter. Tactile, gamified.
// ─────────────────────────────────────────────────────────
const LogoPressable = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [pulses, setPulses] = React.useState([]); // {id}
  const [count, setCount] = React.useState(0);
  const fire = () => {
    const id = Math.random();
    setPulses(p => [...p, id]);
    setCount(c => c + 1);
    setTimeout(() => setPulses(p => p.filter(x => x !== id)), 1200);
  };
  const s = scale;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * s, color }}>
      <button onClick={fire} aria-label="Émettre un écho"
        style={{
          background: "transparent", border: 0, padding: 0, cursor: "pointer",
          position: "relative", width: 56 * s, height: 56 * s, display: "block",
        }}>
        <svg width={56 * s} height={56 * s} viewBox="0 0 56 56" aria-hidden>
          {/* Hit ring */}
          <circle cx="28" cy="28" r="22" fill="var(--card-2)" stroke={accent} strokeWidth="1.4" strokeOpacity="0.4" />
          {/* Pulses */}
          {pulses.map(id => (
            <circle key={id} cx="28" cy="28" r="22" fill="none" stroke={accent} strokeWidth="1.5"
              style={{
                transformOrigin: "28px 28px",
                animation: "pressBurst 1.2s var(--ease-out-quart) forwards",
              }} />
          ))}
          {/* Core */}
          <circle cx="28" cy="28" r="6" fill={accent}
            style={{ animation: "corePress 1.8s ease-in-out infinite" }} />
          {/* Triangle pointer (play-like) */}
          <path d="M 26 25 L 32 28 L 26 31 Z" fill="#fff" opacity="0.95" />
        </svg>
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span className="serif" style={{
          fontSize: 32 * s, lineHeight: 1, letterSpacing: "-0.035em",
          fontWeight: 500, color,
        }}>
          echo<span style={{ color: accent }}>wai</span>
        </span>
        <span className="mono" style={{ fontSize: 9.5 * s, color: "var(--muted)" }}>
          {count > 0 ? `${count} écho${count > 1 ? "s" : ""} émis` : "cliquez le bouton"}
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// 10. PARTICLES — 14 dots in random orbits, attracted toward
//     a center node. Cursor proximity disturbs them.
// ─────────────────────────────────────────────────────────
const LogoParticles = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const ref = React.useRef(null);
  const [mouse, setMouse] = React.useState(null);
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    let raf; const start = performance.now();
    const loop = (now) => {
      setTick((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - r.left) / r.width) * 56,
      y: ((e.clientY - r.top) / r.height) * 56,
    });
  };

  // 14 base positions on rings
  const particles = React.useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const ring = i < 7 ? 0 : 1;
      const angle0 = (i / 7) * Math.PI * 2 + ring * 0.4;
      const r = ring === 0 ? 14 : 20;
      return { angle0, r, speed: ring === 0 ? 0.5 : -0.34 };
    });
  }, []);

  const s = scale;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * s, color }}>
      <svg ref={ref} width={56 * s} height={56 * s} viewBox="0 0 56 56"
        onMouseMove={onMove} onMouseLeave={() => setMouse(null)} aria-hidden>
        {/* Core */}
        <circle cx="28" cy="28" r="3.2" fill={accent} />
        <circle cx="28" cy="28" r="6" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.25" />
        {/* Particles */}
        {particles.map((p, i) => {
          const a = p.angle0 + tick * p.speed;
          let x = 28 + Math.cos(a) * p.r;
          let y = 28 + Math.sin(a) * p.r;
          // Repel from mouse
          if (mouse) {
            const dx = x - mouse.x; const dy = y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 18) {
              const push = (18 - dist) / 18 * 8;
              x += (dx / dist) * push;
              y += (dy / dist) * push;
            }
          }
          return (
            <circle key={i} cx={x} cy={y} r="1.6" fill={accent}
              opacity={p.r === 14 ? 0.85 : 0.5} />
          );
        })}
      </svg>
      <span className="serif" style={{
        fontSize: 32 * s, lineHeight: 1, letterSpacing: "-0.035em",
        fontWeight: 500, color,
      }}>
        echo<span style={{ color: accent }}>wai</span>
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// 11. APERTURE — 6-blade iris that gently opens/closes,
//     mark = camera-like opening with continuous rotation.
// ─────────────────────────────────────────────────────────
const LogoAperture = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const s = scale;
  // 6 blades, each a sector
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * s, color }}>
      <svg width={56 * s} height={56 * s} viewBox="0 0 56 56" aria-hidden
        style={{ animation: "apertureSpin 12s linear infinite" }}>
        {/* outer rim */}
        <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="1.4" strokeOpacity="0.2" />
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 60) * Math.PI / 180;
          // each blade is a triangle from rim to a point near center, offset
          const x1 = 28 + Math.cos(angle) * 21;
          const y1 = 28 + Math.sin(angle) * 21;
          const x2 = 28 + Math.cos(angle + Math.PI / 3) * 21;
          const y2 = 28 + Math.sin(angle + Math.PI / 3) * 21;
          const cx = 28 + Math.cos(angle + Math.PI / 6) * 9;
          const cy = 28 + Math.sin(angle + Math.PI / 6) * 9;
          return (
            <path key={i} d={`M ${x1} ${y1} L ${x2} ${y2} L ${cx} ${cy} Z`}
              fill={accent} fillOpacity={0.12 + (i % 2) * 0.08}
              stroke={accent} strokeOpacity="0.4" strokeWidth="0.8"
              style={{
                animation: `apertureBreath 4s ease-in-out ${i * 0.1}s infinite`,
                transformOrigin: "28px 28px",
              }} />
          );
        })}
        {/* central dot */}
        <circle cx="28" cy="28" r="3" fill={accent} />
      </svg>
      <span className="serif" style={{
        fontSize: 32 * s, lineHeight: 1, letterSpacing: "-0.035em",
        fontWeight: 500, color,
      }}>
        echo<span style={{ color: accent }}>wai</span>
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// 12. FIELD — magnetic field lines that bend toward cursor
// ─────────────────────────────────────────────────────────
const LogoField = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const ref = React.useRef(null);
  const [mouse, setMouse] = React.useState({ x: 28, y: 28 });
  const [active, setActive] = React.useState(false);

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - r.left) / r.width) * 56,
      y: ((e.clientY - r.top) / r.height) * 56,
    });
  };

  const s = scale;
  const lines = 5;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 * s, color }}>
      <svg ref={ref} width={56 * s} height={56 * s} viewBox="0 0 56 56"
        onMouseEnter={() => setActive(true)}
        onMouseMove={onMove}
        onMouseLeave={() => { setActive(false); setMouse({ x: 28, y: 28 }); }}
        aria-hidden>
        {/* Field lines: horizontal curves bent toward mouse */}
        {Array.from({ length: lines }).map((_, i) => {
          const baseY = 14 + i * 7;
          const mx = active ? mouse.x : 28;
          const my = active ? mouse.y : baseY;
          const bend = (baseY - my) * 0.6;
          const d = `M 4 ${baseY} Q ${mx} ${baseY + bend}, 52 ${baseY}`;
          return (
            <path key={i} d={d}
              fill="none" stroke={accent} strokeWidth="1.2"
              strokeOpacity={0.25 + (i === 2 ? 0.4 : 0)}
              strokeLinecap="round"
              style={{ transition: "d .25s var(--ease-out-quart)" }} />
          );
        })}
        {/* Source node — follows mouse */}
        <circle cx={mouse.x} cy={mouse.y} r="3.2" fill={accent}
          style={{ transition: "cx .25s var(--ease-out-quart), cy .25s var(--ease-out-quart)" }} />
        <circle cx={mouse.x} cy={mouse.y} r="7" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.3"
          style={{ transition: "cx .25s, cy .25s" }} />
      </svg>
      <span className="serif" style={{
        fontSize: 32 * s, lineHeight: 1, letterSpacing: "-0.035em",
        fontWeight: 500, color,
      }}>
        echo<span style={{ color: accent }}>wai</span>
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Extra keyframes
// ─────────────────────────────────────────────────────────
const LogoLab2Styles = () => (
  <style>{`
    @keyframes trailFade {
      0%   { transform: scale(0.7); opacity: 0.55; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes pressBurst {
      0%   { transform: scale(0.7); opacity: 0.7; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes corePress {
      0%, 100% { transform: scale(1); transform-origin: 28px 28px; }
      50%      { transform: scale(1.12); transform-origin: 28px 28px; }
    }
    @keyframes apertureSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes apertureBreath {
      0%, 100% { fill-opacity: 0.10; }
      50%      { fill-opacity: 0.28; }
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────
// Page — Volume 2
// ─────────────────────────────────────────────────────────
const LogoLab2Page = () => (
  <div>
    <LogoStyles />
    <LogoLab2Styles />

    <section style={{ position: "relative", overflow: "hidden" }}>
      <AuroraMesh intensity={0.7} />
      <Orb size={600} color="var(--volt-glow)" style={{ top: -160, left: -120 }} />
      <div className="r-padbox" style={{ maxWidth: 1320, margin: "0 auto", padding: "72px 32px 36px", position: "relative" }}>
        <div className="upper" style={{ color: "var(--volt)" }}>Logo Lab · volume 2</div>
        <h1 className="serif h1-fluid" style={{ fontSize: 96, lineHeight: 0.96, letterSpacing: "-0.035em", margin: "14px 0 22px", color: "var(--ink)", fontWeight: 500, maxWidth: 980 }}>
          Six logos <em style={{ color: "var(--volt)" }}>qui réagissent à vous.</em>
        </h1>
        <p className="body-fluid" style={{ fontSize: 17, color: "var(--bone-soft)", lineHeight: 1.55, maxWidth: 760, margin: 0 }}>
          Cette série pousse l'identité au-delà du décoratif : <strong style={{ color: "var(--ink)", fontWeight: 600 }}>chaque mark engage l'utilisateur</strong> — il suit le curseur, il affiche une donnée en direct, il se clique, il se défend contre la souris. L'identité devient un outil.
        </p>
      </div>
    </section>

    <section className="r-padbox section-pad" style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 32px 80px" }}>
      <div className="r-cols-3 logo-stage" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
        <LogoCard n="07" name="Echo Trail" tagline="Le curseur génère l'écho" recommended
          why="Survolez le mark : un point suit votre curseur, laissant des arcs qui s'évanouissent. L'utilisateur fabrique littéralement l'écho. Le plus immersif de la série.">
          <LogoEchoTrail />
        </LogoCard>

        <LogoCard n="08" name="Live Index" tagline="Cours EMMY en temps réel"
          why="Le mark consomme l'API du registre EMMY (via le hook useCeePrice, endpoint configurable). Marche progressive lissée plafonnée à ±5 % de la baseline (9,11 €/MWh) — le label bascule de « indicatif » à « live » dès que l'API répond. Une seule ligne à brancher en prod.">
          <LogoLiveIndex />
        </LogoCard>

        <LogoCard n="09" name="Pressable" tagline="Cliquez pour émettre un écho"
          why="Bouton-mark : un clic émet un ripple visible, un compteur s'incrémente. Tactile, gamifié, sensation de plateforme active. Idéal pour un easter-egg signature.">
          <LogoPressable />
        </LogoCard>

        <LogoCard n="10" name="Particles" tagline="Le mark se défend contre votre souris"
          why="14 particules orbitent en deux anneaux. Quand vous approchez la souris, elles s'éloignent — comme un champ de force. Singulier, jamais vu, organique.">
          <LogoParticles />
        </LogoCard>

        <LogoCard n="11" name="Aperture" tagline="L'iris qui respire"
          why="Un diaphragme à 6 lames tourne lentement, chaque lame respire en fade-in. Évoque le focus, l'attention, la précision — métaphore CEE forte.">
          <LogoAperture />
        </LogoCard>

        <LogoCard n="12" name="Field" tagline="Le champ magnétique qui suit"
          why="Cinq lignes de champ horizontales se courbent vers votre curseur en temps réel, comme un champ magnétique réagissant à un aimant. Le plus physique, le plus 'science'.">
          <LogoField />
        </LogoCard>
      </div>

      {/* Try-on tip box */}
      <div className="r-cols-3 try-grid" style={{
        marginTop: 60, padding: 40, background: "var(--ink)", color: "#fff",
        borderRadius: 8, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32,
      }}>
        <div>
          <div className="upper" style={{ color: "var(--volt)" }}>Le conseil UX</div>
          <div className="serif" style={{ fontSize: 24, color: "#fff", fontWeight: 500, marginTop: 8, letterSpacing: "-0.02em" }}>
            Engagement direct
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", lineHeight: 1.55, marginTop: 8 }}>
            Echo Trail et Field demandent <em style={{ color: "var(--volt)" }}>une interaction</em> — survolez-les pour les comprendre. Idéal en hero, plus risqué en favicon.
          </p>
        </div>
        <div>
          <div className="upper" style={{ color: "var(--volt)" }}>Le conseil produit</div>
          <div className="serif" style={{ fontSize: 24, color: "#fff", fontWeight: 500, marginTop: 8, letterSpacing: "-0.02em" }}>
            Donnée vivante
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", lineHeight: 1.55, marginTop: 8 }}>
            <em style={{ color: "var(--volt)" }}>Live Index</em> transforme le logo en signal de marché. À connecter à une vraie API de cours pour un effet jamais vu sur la concurrence.
          </p>
        </div>
        <div>
          <div className="upper" style={{ color: "var(--volt)" }}>Le conseil marque</div>
          <div className="serif" style={{ fontSize: 24, color: "#fff", fontWeight: 500, marginTop: 8, letterSpacing: "-0.02em" }}>
            Singularité
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", lineHeight: 1.55, marginTop: 8 }}>
            <em style={{ color: "var(--volt)" }}>Particles</em> et <em style={{ color: "var(--volt)" }}>Aperture</em> n'existent nulle part ailleurs dans le marché CEE. À retenir si la différenciation est prioritaire.
          </p>
        </div>
      </div>

      {/* Hint card */}
      <div style={{
        marginTop: 32, padding: "20px 28px", background: "var(--card)",
        border: "1px solid var(--rule-on)", borderRadius: 8,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
      }}>
        <span style={{ fontSize: 13, color: "var(--bone-soft)" }}>
          ↳ <strong style={{ color: "var(--ink)", fontWeight: 600 }}>Astuce</strong> — survolez chaque mark, cliquez le bouton Pressable. Les marks qui requièrent une interaction l'indiquent sous le wordmark.
        </span>
        <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>volume 2 · 6 nouvelles propositions</span>
      </div>
    </section>
  </div>
);

Object.assign(window, {
  LogoLab2Page, LogoLab2Styles,
  LogoEchoTrail, LogoLiveIndex, LogoPressable, LogoParticles, LogoAperture, LogoField,
  useCeePrice, CEE_BASELINE, CEE_BAND,
});
