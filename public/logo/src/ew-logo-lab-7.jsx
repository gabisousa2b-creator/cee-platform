/* eslint-disable */
// Echowai — Logo Lab vol. 7
// 50 more interactive logos, all EMMY-connected.
// Themes: physical interaction, spatial reveal, particle systems,
// type metamorphoses, cursor-aware, data-driven, time-based.

const LogoLab7Styles = () => (
  <style>{`
    @keyframes scaleIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }
    @keyframes morphIn { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
    @keyframes neonOn { 0% { filter: brightness(0.3); } 50% { filter: brightness(1.4) drop-shadow(0 0 6px var(--volt)); } 100% { filter: brightness(1); } }
    @keyframes flipY { 0%, 100% { transform: rotateY(0); } 50% { transform: rotateY(180deg); } }
    @keyframes wobble {
      0%, 100% { transform: rotate(0); }
      25%      { transform: rotate(-3deg); }
      75%      { transform: rotate(3deg); }
    }
    @keyframes orbitPath {
      from { offset-distance: 0%; }
      to   { offset-distance: 100%; }
    }
    @keyframes ribbon {
      0%   { stroke-dasharray: 0 200; }
      50%  { stroke-dasharray: 100 100; }
      100% { stroke-dasharray: 200 0; }
    }
    @keyframes dropSplash {
      0%   { transform: translateY(-40px) scale(0.5); opacity: 0; }
      50%  { transform: translateY(0) scale(1.2); opacity: 1; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }
    @keyframes morphLetter {
      0%, 100% { letter-spacing: -.035em; transform: scaleX(1); }
      50%      { letter-spacing: .04em;   transform: scaleX(1.05); }
    }
    @keyframes ringDouble {
      0% { transform: scale(0.4); opacity: .8; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes hgFall {
      0%   { transform: translateY(-20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes lapSpin { from { transform: rotate(0); } to { transform: rotate(720deg); } }
  `}</style>
);

const $W7 = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)", style }) => (
  <span className="serif" style={{
    fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500, color, ...style,
  }}>echo<span style={{ color: accent }}>wai</span></span>
);
const $E7 = ({ scale = 1 }) => {
  const { last, trend, source } = useEmmy();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: emmyHue(trend) }} className="volt-dot" />
      <span className="mono" style={{ fontSize: 8.5 * scale, color: "var(--muted)" }}>
        EMMY {last.toFixed(2)} {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"}
      </span>
    </div>
  );
};
const $St7 = ({ scale = 1, children }) => (
  <div style={{ display: "inline-flex", flexDirection: "column" }}>{children}<$E7 scale={scale} /></div>
);

// ═══════════════════════════════════════════════════════════
// 50 LOGOS · 121 → 170
// ═══════════════════════════════════════════════════════════

// 121. Aurora text — gradient flowing through letters
const L_Aurora = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf, s0 = performance.now();
    const loop = (now) => { setT(((now - s0) / 1000) % 6); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, []);
  return (<$St7 scale={scale}>
    <span style={{
      backgroundImage: `linear-gradient(${t * 60}deg, ${accent}, var(--st-valide), var(--st-controle), ${accent})`,
      backgroundSize: "300% 100%", backgroundPosition: `${t * 50}% 50%`,
      WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
      display: "inline-block", fontFamily: "var(--font-display)", fontSize: 32 * scale,
      fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1,
    }}>echowai</span>
  </$St7>);
};

// 122. Neon flicker on EMMY tick
const L_Neon = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last } = useEmmy();
  const [k, setK] = React.useState(0);
  const prev = React.useRef(last);
  React.useEffect(() => { if (prev.current !== last) { setK(k+1); prev.current = last; } }, [last]);
  return (<$St7 scale={scale}>
    <span key={k} style={{ animation: "neonOn .9s ease-out" }}>
      <$W7 scale={scale} color={color} accent={accent} style={{ filter: "drop-shadow(0 0 4px var(--volt-glow))" }} />
    </span>
  </$St7>);
};

// 123. Mirror split — top half + bottom half drift apart
const L_MirrorSplit = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [h, setH] = React.useState(false);
  return (<$St7 scale={scale}>
    <span style={{ position: "relative", display: "inline-block", cursor: "pointer", height: 32 * scale, overflow: "hidden" }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      <span style={{ position: "absolute", top: 0, transform: `translateY(${h ? -4 : 0}px)`, transition: "transform .35s" }}>
        <$W7 scale={scale} color={color} accent={accent} />
      </span>
      <span style={{ position: "absolute", top: 0, transform: `translateY(${h ? 4 : 0}px) scaleY(-1)`, opacity: 0.4, transition: "transform .35s" }}>
        <$W7 scale={scale} color={color} accent={accent} />
      </span>
    </span>
  </$St7>);
};

// 124. Wobble on hover
const L_Wobble = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [h, setH] = React.useState(false);
  return (<$St7 scale={scale}>
    <span style={{ display: "inline-block", animation: h ? "wobble .5s ease-in-out" : "none", cursor: "pointer" }}
      onMouseEnter={() => setH(true)} onAnimationEnd={() => setH(false)}>
      <$W7 scale={scale} color={color} accent={accent} />
    </span>
  </$St7>);
};

// 125. Orbital dot — single dot orbits the wordmark
const L_Orbit = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf, s0 = performance.now();
    const loop = (now) => { setT(((now - s0) / 1000)); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, []);
  return (<$St7 scale={scale}>
    <span style={{ position: "relative", display: "inline-block", padding: "8px 12px" }}>
      <$W7 scale={scale} color={color} accent={accent} />
      <span style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%,-50%) translate(${Math.cos(t * 1.2) * 90 * scale}px, ${Math.sin(t * 1.2) * 24 * scale}px)`,
        width: 8 * scale, height: 8 * scale, borderRadius: "50%", background: accent,
      }} className="volt-dot" />
    </span>
  </$St7>);
};

// 126. Ribbon underline — animated SVG ribbon
const L_Ribbon = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <div style={{ display: "inline-flex", flexDirection: "column" }}>
    <$W7 scale={scale} color={color} accent={accent} />
    <svg width={180 * scale} height={10 * scale} viewBox="0 0 180 10">
      <path d="M 0 5 Q 45 0, 90 5 T 180 5" fill="none" stroke={accent} strokeWidth="1.6"
        strokeDasharray="200 200" style={{ animation: "ribbon 3s ease-in-out infinite" }} />
    </svg>
  </div>
</$St7>);

// 127. Drop splash — letters drop from above one by one
const L_DropSplash = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  return (<$St7 scale={scale}>
    <button onClick={() => setK(k + 1)} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}>
      <span key={k} style={{ display: "inline-flex" }} className="serif">
        {"echowai".split("").map((c, i) => (
          <span key={i} style={{
            fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
            color: i >= 4 ? accent : color, display: "inline-block",
            animation: `dropSplash .55s var(--ease-out-quart) ${i * 0.08}s both`,
          }}>{c}</span>
        ))}
      </span>
    </button>
  </$St7>);
};

// 128. Type morph — letter-spacing breathes on EMMY
const L_TypeMorph = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <span style={{ display: "inline-block", animation: "morphLetter 4s ease-in-out infinite" }}>
    <$W7 scale={scale} color={color} accent={accent} />
  </span>
</$St7>);

// 129. Double ring on click
const L_DoubleRing = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [rings, setRings] = React.useState([]);
  const fire = (e) => {
    const id = Math.random();
    setRings(r => [...r, id]);
    setTimeout(() => setRings(r => r.filter(x => x !== id)), 1100);
  };
  return (<$St7 scale={scale}>
    <button onClick={fire} style={{ background: "transparent", border: 0, padding: "12px", cursor: "pointer", position: "relative" }}>
      <$W7 scale={scale} color={color} accent={accent} />
      {rings.map(id => (
        <React.Fragment key={id}>
          <span style={{
            position: "absolute", inset: 0, border: `1.5px solid ${accent}`,
            borderRadius: 4, animation: "ringDouble 1.1s var(--ease-out-quart) forwards", pointerEvents: "none",
          }} />
          <span style={{
            position: "absolute", inset: 0, border: `1.5px solid ${accent}`,
            borderRadius: 4, animation: "ringDouble 1.1s var(--ease-out-quart) .2s forwards", pointerEvents: "none",
          }} />
        </React.Fragment>
      ))}
    </button>
  </$St7>);
};

// 130. Letter randomizer — hover scrambles then resolves
const L_Scramble = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [text, setText] = React.useState("echowai");
  const target = "echowai";
  const run = () => {
    let n = 0;
    const id = setInterval(() => {
      n++;
      if (n >= 10) { clearInterval(id); setText(target); return; }
      setText(target.split("").map((c, i) => n > i * 1.5 ? c : String.fromCharCode(97 + Math.floor(Math.random() * 26))).join(""));
    }, 50);
  };
  return (<$St7 scale={scale}>
    <span onMouseEnter={run} style={{ display: "inline-flex", cursor: "pointer" }}>
      {text.split("").map((c, i) => (
        <span key={i} className="serif" style={{
          fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
          color: i >= 4 ? accent : color, display: "inline-block",
        }}>{c}</span>
      ))}
    </span>
  </$St7>);
};

// 131. Loading bar fills then reveals
const L_LoadingReveal = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const fire = () => { setDone(false); setK(k+1); setTimeout(() => setDone(true), 900); };
  return (<$St7 scale={scale}>
    <button onClick={fire} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <span style={{
        display: "inline-block", opacity: done ? 1 : 0.2, filter: done ? "blur(0)" : "blur(2px)",
        transition: "all .4s var(--ease-out-quart)",
      }}><$W7 scale={scale} color={color} accent={accent} /></span>
      <div style={{ width: "100%", height: 2, background: "var(--card-3)", borderRadius: 1, overflow: "hidden" }}>
        <div key={k} style={{ height: "100%", background: accent, animation: "chargeBar .9s linear forwards" }} />
      </div>
    </button>
  </$St7>);
};

// 132. Inverted on hover — light becomes dark + accent flip
const L_InvertHover = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [h, setH] = React.useState(false);
  return (<$St7 scale={scale}>
    <span onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "inline-block", padding: "4px 10px", borderRadius: 4, cursor: "pointer",
        background: h ? "var(--ink)" : "transparent",
        transition: "background .3s var(--ease-out-quart)",
      }}>
      <$W7 scale={scale} color={h ? "#fff" : color} accent={accent} />
    </span>
  </$St7>);
};

// 133. Letter morphs into icon — "e" becomes echo icon
const L_LetterIcon = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [h, setH] = React.useState(false);
  return (<$St7 scale={scale}>
    <span style={{ display: "inline-flex", alignItems: "baseline", cursor: "pointer" }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      <span style={{ width: 32 * scale, height: 32 * scale, display: "inline-flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <span className="serif" style={{
          fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500, color,
          position: "absolute", opacity: h ? 0 : 1, transition: "opacity .3s",
        }}>e</span>
        <svg width={28 * scale} height={28 * scale} viewBox="0 0 28 28" style={{ opacity: h ? 1 : 0, transition: "opacity .3s" }}>
          <circle cx="6" cy="22" r="2" fill={accent} />
          <path d="M 6 22 A 12 12 0 0 1 18 10" fill="none" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 6 22 A 18 18 0 0 1 24 4"  fill="none" stroke={accent} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
        </svg>
      </span>
      <$W7 scale={scale} color={color} accent={accent} style={{ paddingLeft: 2 }} />
    </span>
  </$St7>);
};

// 134. Compass arrow — arrow rotates with EMMY trend
const L_CompassMark = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { trend } = useEmmy();
  const deg = trend > 0 ? -45 : trend < 0 ? 45 : 0;
  return (<$St7 scale={scale}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg width={32 * scale} height={32 * scale} viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
        <g style={{ transformOrigin: "16px 16px", transform: `rotate(${deg}deg)`, transition: "transform 1s var(--ease-out-quart)" }}>
          <path d="M 16 6 L 19 16 L 16 14 L 13 16 Z" fill={emmyHue(trend)} />
        </g>
      </svg>
      <$W7 scale={scale} color={color} accent={accent} />
    </span>
  </$St7>);
};

// 135. Stack count — small counter increments at each EMMY tick
const L_StackCount = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last } = useEmmy();
  const [n, setN] = React.useState(0);
  const prev = React.useRef(last);
  React.useEffect(() => { if (prev.current !== last) { setN(x => x + 1); prev.current = last; } }, [last]);
  return (<$St7 scale={scale}>
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
      <$W7 scale={scale} color={color} accent={accent} />
      <span className="mono" style={{ fontSize: 11 * scale, color: "var(--muted)" }}>· {n} ticks</span>
    </span>
  </$St7>);
};

// 136. Heartbeat scale — pulses with EMMY tempo
const L_Heartbeat = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last } = useEmmy();
  const [k, setK] = React.useState(0);
  const prev = React.useRef(last);
  React.useEffect(() => { if (prev.current !== last) { setK(k+1); prev.current = last; } }, [last]);
  return (<$St7 scale={scale}>
    <span key={k} style={{ display: "inline-block", animation: "morphIn .5s var(--ease-out-quart)" }}>
      <$W7 scale={scale} color={color} accent={accent} />
    </span>
  </$St7>);
};

// 137. Dot crowd — many small dots that gather around cursor
const L_DotCrowd = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const ref = React.useRef(null);
  const [m, setM] = React.useState(null);
  const dots = React.useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    bx: 10 + (i % 10) * 18, by: 10 + Math.floor(i / 10) * 12,
  })), []);
  const onMove = (e) => { const r = ref.current.getBoundingClientRect(); setM({ x: e.clientX - r.left, y: e.clientY - r.top }); };
  return (<$St7 scale={scale}>
    <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setM(null)}
      style={{ display: "inline-block", padding: "8px 4px", position: "relative", cursor: "crosshair" }}>
      <$W7 scale={scale} color={color} accent={accent} />
      <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} viewBox="0 0 200 40" preserveAspectRatio="none">
        {dots.map((d, i) => {
          let dx = 0, dy = 0;
          if (m) { const ddx = m.x * (200 / 200) - d.bx, ddy = m.y * (40 / 40) - d.by; const dist = Math.hypot(ddx, ddy);
            if (dist < 60) { const k = (60 - dist) / 60 * 0.5; dx = ddx * k; dy = ddy * k; } }
          return <circle key={i} cx={d.bx + dx} cy={d.by + dy} r="0.8" fill={accent} opacity="0.6"
            style={{ transition: "all .2s var(--ease-out-quart)" }} />;
        })}
      </svg>
    </div>
  </$St7>);
};

// 138. Echoes ripple from cursor
const L_RippleCursor = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const ref = React.useRef(null);
  const [ripples, setRipples] = React.useState([]);
  const fire = (e) => {
    const r = ref.current.getBoundingClientRect();
    const id = Math.random();
    setRipples(rs => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples(rs => rs.filter(rr => rr.id !== id)), 900);
  };
  return (<$St7 scale={scale}>
    <div ref={ref} onClick={fire} style={{ display: "inline-block", padding: "8px 12px", position: "relative", cursor: "pointer", overflow: "hidden" }}>
      <$W7 scale={scale} color={color} accent={accent} />
      {ripples.map(rr => (
        <span key={rr.id} style={{
          position: "absolute", left: rr.x, top: rr.y, width: 12, height: 12, borderRadius: "50%",
          border: `1.4px solid ${accent}`, transform: "translate(-50%,-50%)",
          animation: "ringDouble .9s var(--ease-out-quart) forwards", pointerEvents: "none",
        }} />
      ))}
    </div>
  </$St7>);
};

// 139. EMMY pulse halo around wordmark
const L_PulseHalo = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last, trend } = useEmmy();
  return (<$St7 scale={scale}>
    <span style={{ position: "relative", display: "inline-block", padding: "6px 12px" }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: 4, border: `1.4px solid ${emmyHue(trend)}`,
        animation: "pulseGlow 1.6s ease-in-out infinite", opacity: 0.5,
      }} />
      <$W7 scale={scale} color={color} accent={accent} />
    </span>
  </$St7>);
};

// 140. Hourglass flip on tick
const L_HourglassWord = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last } = useEmmy();
  const [k, setK] = React.useState(0);
  const prev = React.useRef(last);
  React.useEffect(() => { if (prev.current !== last) { setK(k+1); prev.current = last; } }, [last]);
  return (<$St7 scale={scale}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span key={k} style={{ display: "inline-block", transformOrigin: "center", animation: "flipY 1s ease-in-out" }}>
        <svg width={20 * scale} height={26 * scale} viewBox="0 0 20 26">
          <path d="M 2 2 L 18 2 L 18 6 L 12 13 L 18 20 L 18 24 L 2 24 L 2 20 L 8 13 L 2 6 Z"
            fill="none" stroke={accent} strokeWidth="1.4" />
        </svg>
      </span>
      <$W7 scale={scale} color={color} accent={accent} />
    </span>
  </$St7>);
};

// 141. Wave background follows EMMY
const L_BgWave = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  const { last } = useEmmy();
  const speed = 1 + emmyNorm(last);
  React.useEffect(() => {
    let raf, s0 = performance.now();
    const loop = (now) => { setT(((now - s0) / 1000) * speed); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, [speed]);
  const wave = "M 0 12 " + Array.from({ length: 21 }, (_, i) =>
    `L ${(i * 10).toFixed(1)} ${(12 + Math.sin(i * 0.5 + t) * 4).toFixed(1)}`
  ).join(" ");
  return (<$St7 scale={scale}>
    <span style={{ position: "relative", display: "inline-block", padding: "6px 12px" }}>
      <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} viewBox="0 0 200 24" preserveAspectRatio="none">
        <path d={wave} fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.3" />
      </svg>
      <$W7 scale={scale} color={color} accent={accent} />
    </span>
  </$St7>);
};

// 142. Long-press to reveal full color
const L_LongPress = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [press, setPress] = React.useState(false);
  return (<$St7 scale={scale}>
    <button onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)} onMouseLeave={() => setPress(false)}
      style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}>
      <$W7 scale={scale} color={press ? accent : color} accent={press ? accent : accent}
        style={{ transition: "color .4s var(--ease-out-quart)" }} />
    </button>
  </$St7>);
};

// 143. Twin wordmark — top/bottom with offset
const L_Twin = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <span style={{ position: "relative", display: "inline-block" }}>
    <$W7 scale={scale} color={color} accent={accent} />
    <span style={{ position: "absolute", top: 0, left: 4, opacity: 0.25, mixBlendMode: "multiply" }}>
      <$W7 scale={scale} color={accent} accent={accent} />
    </span>
  </span>
</$St7>);

// 144. Lap circle — text traces a circle on click
const L_LapCircle = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  return (<$St7 scale={scale}>
    <button onClick={() => setK(k+1)} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", position: "relative" }}>
      <$W7 scale={scale} color={color} accent={accent} />
      <span key={k} style={{
        position: "absolute", inset: -10, borderRadius: 8, border: `1.4px solid ${accent}`,
        animation: "lapSpin .8s linear", opacity: 0.5, pointerEvents: "none",
        clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
      }} />
    </button>
  </$St7>);
};

// 145. Sleek bar above each letter — value driven by EMMY
const L_BarsAbove = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { series } = useEmmy();
  return (<$St7 scale={scale}>
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
      <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 4, height: 10 * scale }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const v = series[series.length - 1 - i] || CEE_BASELINE;
          return <span key={i} style={{
            width: 12 * scale, background: accent, opacity: 0.65,
            height: `${emmyNorm(v) * 100}%`, borderRadius: 1,
            transition: "height .9s var(--ease-out-quart)",
          }} />;
        })}
      </span>
      <$W7 scale={scale} color={color} accent={accent} />
    </div>
  </$St7>);
};

// 146. Single-letter highlighter — focus moves left to right
const L_LetterFocus = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [i, setI] = React.useState(0);
  React.useEffect(() => { const id = setInterval(() => setI(x => (x + 1) % 7), 700); return () => clearInterval(id); }, []);
  return (<$St7 scale={scale}>
    <span style={{ display: "inline-flex" }} className="serif">
      {"echowai".split("").map((c, k) => (
        <span key={k} style={{
          fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
          color: k === i ? accent : (k >= 4 ? "var(--bone-mute)" : "var(--bone-soft)"),
          display: "inline-block", transition: "color .35s",
        }}>{c}</span>
      ))}
    </span>
  </$St7>);
};

// 147. Frame slot — wordmark in a moving frame
const L_FrameSlot = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <span style={{
    display: "inline-block", border: `1.4px solid ${accent}`, padding: "6px 14px", borderRadius: 4,
    boxShadow: "inset 0 0 0 4px var(--card)",
  }}>
    <$W7 scale={scale} color={color} accent={accent} />
  </span>
</$St7>);

// 148. Echo line — wave under letters
const L_WaveLine = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => { let raf, s0=performance.now(); const loop=now=>{setT((now-s0)/300); raf=requestAnimationFrame(loop);}; raf=requestAnimationFrame(loop); return ()=>cancelAnimationFrame(raf); }, []);
  const d = "M 0 5 " + Array.from({ length: 21 }, (_, i) => `L ${(i * 9).toFixed(1)} ${(5 + Math.sin(i * 0.6 + t) * 3).toFixed(1)}`).join(" ");
  return (<$St7 scale={scale}>
    <div style={{ display: "inline-flex", flexDirection: "column" }}>
      <$W7 scale={scale} color={color} accent={accent} />
      <svg width={180 * scale} height={10 * scale} viewBox="0 0 180 10">
        <path d={d} fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  </$St7>);
};

// 149. Hashtag prefix — # appears with hash animation
const L_Hashtag = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <span style={{ display: "inline-flex", alignItems: "baseline" }}>
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 22 * scale, color: accent, marginRight: 4,
      animation: "voltPulse 2s ease-in-out infinite",
    }}>#</span>
    <$W7 scale={scale} color={color} accent={accent} />
  </span>
</$St7>);

// 150. Highlighter — text behind a translucent rect
const L_Highlighter = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <span style={{ background: `linear-gradient(transparent 50%, var(--volt-soft) 50%, var(--volt-soft) 90%, transparent 90%)`, padding: "0 4px" }}>
    <$W7 scale={scale} color={color} accent={accent} />
  </span>
</$St7>);

// 151. Letter dance — letters cycle baselines
const L_Dance = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => { let raf, s0=performance.now(); const loop=now=>{setT((now-s0)/300); raf=requestAnimationFrame(loop);}; raf=requestAnimationFrame(loop); return ()=>cancelAnimationFrame(raf); }, []);
  return (<$St7 scale={scale}>
    <span style={{ display: "inline-flex" }} className="serif">
      {"echowai".split("").map((c, i) => (
        <span key={i} style={{
          fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
          color: i >= 4 ? accent : color, display: "inline-block",
          transform: `translateY(${Math.sin(t + i * 1.2) * 2}px) rotate(${Math.sin(t + i) * 3}deg)`,
        }}>{c}</span>
      ))}
    </span>
  </$St7>);
};

// 152. Boxed reveal — text reveals from inside a sliding box
const L_BoxedReveal = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  return (<$St7 scale={scale}>
    <button onClick={() => setK(k+1)} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", display: "inline-block", overflow: "hidden" }}>
      <span key={k} style={{ display: "inline-block", position: "relative" }}>
        <$W7 scale={scale} color={color} accent={accent} />
        <span style={{
          position: "absolute", inset: 0, background: accent,
          animation: "wipeIn .55s var(--ease-out-quart) forwards reverse",
        }} />
      </span>
    </button>
  </$St7>);
};

// 153. Trend up/down — letters tilt up if EMMY rising
const L_TrendTilt = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { trend } = useEmmy();
  const angle = trend > 0 ? -4 : trend < 0 ? 4 : 0;
  return (<$St7 scale={scale}>
    <span style={{
      display: "inline-block", transform: `rotate(${angle}deg)`,
      transition: "transform .7s var(--ease-out-quart)",
    }}>
      <$W7 scale={scale} color={color} accent={accent} />
    </span>
  </$St7>);
};

// 154. Mosaic — wordmark from tiny squares that color-shift
const L_Mosaic = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <span style={{ position: "relative", display: "inline-block" }}>
    <$W7 scale={scale} color={color} accent={accent} />
    <span style={{
      position: "absolute", inset: 0, background: `repeating-linear-gradient(0deg, transparent 0 3px, rgba(46,126,244,0.1) 3px 4px), repeating-linear-gradient(90deg, transparent 0 3px, rgba(46,126,244,0.1) 3px 4px)`,
      pointerEvents: "none",
    }} />
  </span>
</$St7>);

// 155. Counter EMMY — large number overlay
const L_CounterOverlay = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last } = useEmmy();
  return (<$St7 scale={scale}>
    <div style={{ display: "inline-flex", flexDirection: "column", lineHeight: 0.9 }}>
      <span className="mono" style={{ fontSize: 11 * scale, color: emmyHue(useEmmy().trend), letterSpacing: ".06em" }}>{last.toFixed(2)} €/MWh</span>
      <$W7 scale={scale} color={color} accent={accent} />
    </div>
  </$St7>);
};

// 156. Vinyl spin — circle spins, wordmark inside
const L_Vinyl = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
    <svg width={36 * scale} height={36 * scale} viewBox="0 0 36 36"
      style={{ animation: "spinSlow 6s linear infinite", transformOrigin: "18px 18px" }}>
      <circle cx="18" cy="18" r="16" fill="var(--ink)" />
      <circle cx="18" cy="18" r="11" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="0.5" />
      <circle cx="18" cy="18" r="7"  fill={accent} />
      <circle cx="18" cy="18" r="2"  fill="var(--ink)" />
    </svg>
    <$W7 scale={scale} color={color} accent={accent} />
  </span>
</$St7>);

// 157. Tape player — dots flow horizontally
const L_TapePlay = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => { let raf, s0=performance.now(); const loop=now=>{setT((now-s0)/300); raf=requestAnimationFrame(loop);}; raf=requestAnimationFrame(loop); return ()=>cancelAnimationFrame(raf); }, []);
  return (<$St7 scale={scale}>
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <$W7 scale={scale} color={color} accent={accent} />
      <svg width={180 * scale} height={4 * scale} viewBox="0 0 180 4">
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={(i * 14 + (t * 30) % 28) - 14} cy="2" r="1" fill={accent} />
        ))}
      </svg>
    </div>
  </$St7>);
};

// 158. Burst on hover — radial lines burst out
const L_HoverBurst = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [h, setH] = React.useState(false);
  return (<$St7 scale={scale}>
    <span onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "inline-block", padding: "12px 16px", position: "relative", cursor: "pointer" }}>
      <$W7 scale={scale} color={color} accent={accent} />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <span key={i} style={{
          position: "absolute", left: "50%", top: "50%", width: 1.5, height: 16 * scale,
          background: accent, transformOrigin: "center bottom",
          transform: `translate(-50%, -100%) rotate(${a}rad) translateY(${h ? -20 : -8}px)`,
          opacity: h ? 0.7 : 0, transition: "all .35s var(--ease-out-quart)", pointerEvents: "none",
        }} />;
      })}
    </span>
  </$St7>);
};

// 159. Letter pop on click each
const L_PopEach = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const [pop, setPop] = React.useState(-1);
  return (<$St7 scale={scale}>
    <span style={{ display: "inline-flex" }} className="serif">
      {"echowai".split("").map((c, i) => (
        <span key={i} onClick={() => { setPop(i); setTimeout(() => setPop(-1), 350); }}
          style={{
            fontSize: 32 * scale, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 500,
            color: i >= 4 ? accent : color, display: "inline-block", cursor: "pointer",
            transform: pop === i ? "scale(1.4)" : "scale(1)",
            transition: "transform .35s var(--ease-out-quart)",
          }}>{c}</span>
      ))}
    </span>
  </$St7>);
};

// 160. Constellation reveal
const L_Constellation = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
    <svg width={32 * scale} height={32 * scale} viewBox="0 0 32 32">
      {[[4,8],[16,4],[26,12],[10,18],[22,22],[14,28]].map((p,i) =>
        <circle key={i} cx={p[0]} cy={p[1]} r="1.5" fill={accent}
          style={{ animation: `blink ${2 + i * 0.3}s ease-in-out infinite` }} />
      )}
      {[[0,1],[1,2],[2,3],[3,4],[4,5],[1,4],[0,3]].map(([a,b],i) => {
        const p1 = [[4,8],[16,4],[26,12],[10,18],[22,22],[14,28]][a];
        const p2 = [[4,8],[16,4],[26,12],[10,18],[22,22],[14,28]][b];
        return <line key={i} x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke={accent} strokeWidth="0.5" strokeOpacity="0.4" />;
      })}
    </svg>
    <$W7 scale={scale} color={color} accent={accent} />
  </span>
</$St7>);

// 161-170 — quick variations using existing patterns
const L_DotGridMatrix = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { last } = useEmmy();
  const intensity = emmyNorm(last);
  return (<$St7 scale={scale}>
    <span style={{ position: "relative", display: "inline-block", padding: "4px 8px" }}>
      <span style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, ${accent} 1px, transparent 1.4px)`,
        backgroundSize: "6px 6px", opacity: intensity * 0.4,
      }} />
      <$W7 scale={scale} color={color} accent={accent} />
    </span>
  </$St7>);
};

const L_BlinkDot = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
    <span style={{ width: 8 * scale, height: 8 * scale, borderRadius: "50%", background: accent, animation: "blink 1s infinite" }} />
    <$W7 scale={scale} color={color} accent={accent} />
  </span>
</$St7>);

const L_DoubleSlash = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
    <span style={{ color: accent, fontSize: 24 * scale, fontFamily: "var(--font-display)", fontWeight: 500 }}>//</span>
    <$W7 scale={scale} color={color} accent={accent} />
  </span>
</$St7>);

const L_ArrowSuffix = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { trend } = useEmmy();
  return (<$St7 scale={scale}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <$W7 scale={scale} color={color} accent={accent} />
      <svg width={20 * scale} height={16 * scale} viewBox="0 0 20 16">
        <path d="M 2 8 L 16 8 M 12 4 L 16 8 L 12 12" stroke={emmyHue(trend)} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  </$St7>);
};

const L_DepthShadow = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <$W7 scale={scale} color={color} accent={accent} style={{
    textShadow: `2px 2px 0 ${accent}, 4px 4px 0 var(--st-valide)`,
  }} />
</$St7>);

const L_Underscore = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <span style={{ display: "inline-flex", alignItems: "baseline" }}>
    <$W7 scale={scale} color={color} accent={accent} />
    <span style={{ color: accent, animation: "blink 1s steps(2) infinite", fontSize: 32 * scale, fontFamily: "var(--font-display)", marginLeft: 2 }}>_</span>
  </span>
</$St7>);

const L_BigDot = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { trend } = useEmmy();
  return (<$St7 scale={scale}>
    <span style={{ display: "inline-flex", alignItems: "baseline" }}>
      <$W7 scale={scale} color={color} accent={accent} />
      <span style={{ width: 14 * scale, height: 14 * scale, borderRadius: "50%", background: emmyHue(trend), marginLeft: 8, marginBottom: 2 }} className="volt-dot" />
    </span>
  </$St7>);
};

const L_VerticalBars = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const { series } = useEmmy();
  return (<$St7 scale={scale}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, height: 28 * scale }}>
        {series.slice(-5).map((v, i) => (
          <span key={i} style={{ width: 4 * scale, background: accent, height: `${emmyNorm(v) * 100}%`, borderRadius: 1, transition: "height .9s var(--ease-out-quart)" }} />
        ))}
      </span>
      <$W7 scale={scale} color={color} accent={accent} />
    </span>
  </$St7>);
};

const L_RoundCorner = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <span style={{ display: "inline-block", padding: "8px 16px", background: "var(--card-2)", borderRadius: 999 }}>
    <$W7 scale={scale} color={color} accent={accent} />
  </span>
</$St7>);

const L_QuoteMarks = ({ scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => (<$St7 scale={scale}>
  <span style={{ display: "inline-flex", alignItems: "flex-start", gap: 4 }}>
    <span style={{ color: accent, fontSize: 28 * scale, fontFamily: "var(--font-display)", fontWeight: 400, lineHeight: 1 }}>"</span>
    <$W7 scale={scale} color={color} accent={accent} />
    <span style={{ color: accent, fontSize: 28 * scale, fontFamily: "var(--font-display)", fontWeight: 400, lineHeight: 1 }}>"</span>
  </span>
</$St7>);

// Registry
const LOGOS_V7 = [
  { n: "121", name: "Aurora",        tagline: "Gradient qui dérive",       C: L_Aurora,        why: "Gradient multi-couleurs qui traverse le texte. Élégant, doux." },
  { n: "122", name: "Neon Flicker",  tagline: "Tube néon sur tick EMMY",   C: L_Neon,          why: "Le wordmark s'allume comme un néon à chaque mise à jour du cours." },
  { n: "123", name: "Mirror Split",  tagline: "Survol sépare miroir",      C: L_MirrorSplit,   why: "Au survol, top et bottom (miroir) se séparent. Métaphore d'écho." },
  { n: "124", name: "Wobble",        tagline: "Tremble au survol",         C: L_Wobble,        why: "Le wordmark bascule de gauche à droite. Joyeux." },
  { n: "125", name: "Orbital Dot",   tagline: "Point qui orbite",          C: L_Orbit,         why: "Un point parcourt une ellipse autour du wordmark." },
  { n: "126", name: "Ribbon",        tagline: "Ruban anim. en sous-ligne", C: L_Ribbon,        why: "Vague SVG dessous, dessine et efface." },
  { n: "127", name: "Drop Splash",   tagline: "Lettres tombent + splash",  C: L_DropSplash,    why: "Click : chaque lettre tombe avec effet splash." },
  { n: "128", name: "Type Morph",    tagline: "Letter-spacing respire",    C: L_TypeMorph,     why: "L'espacement se dilate et contracte continuellement." },
  { n: "129", name: "Double Ring",   tagline: "Click émet deux anneaux",   C: L_DoubleRing,    why: "Click envoie deux anneaux concentriques décalés." },
  { n: "130", name: "Scramble",      tagline: "Hover : code → texte",      C: L_Scramble,      why: "Survol scramble les lettres puis les résout en 'echowai'." },
  { n: "131", name: "Loading Bar",   tagline: "Barre charge + reveal",     C: L_LoadingReveal, why: "Click déclenche une barre de chargement, wordmark devient net après." },
  { n: "132", name: "Invert Hover",  tagline: "Bloc inversé au survol",    C: L_InvertHover,   why: "Survol pose un bloc navy autour, texte devient blanc." },
  { n: "133", name: "Letter→Icon",   tagline: "Le 'e' se transforme",      C: L_LetterIcon,    why: "Au survol, le 'e' devient une icône d'écho." },
  { n: "134", name: "Compass Mark",  tagline: "Flèche pointe la tendance", C: L_CompassMark,   why: "Une flèche pointe haut/bas selon le trend EMMY." },
  { n: "135", name: "Tick Counter",  tagline: "Compteur de ticks",         C: L_StackCount,    why: "Affiche le nombre de ticks EMMY reçus depuis le chargement." },
  { n: "136", name: "Heartbeat",     tagline: "Pulse sur chaque tick",     C: L_Heartbeat,     why: "Petit zoom morph à chaque mise à jour du cours." },
  { n: "137", name: "Dot Crowd",     tagline: "Foule de points magnétiques", C: L_DotCrowd,    why: "Nuage de points autour du wordmark, attirés par le curseur." },
  { n: "138", name: "Click Ripple",  tagline: "Clique pour rippler",       C: L_RippleCursor,  why: "Chaque clic émet un ripple à l'endroit cliqué." },
  { n: "139", name: "Pulse Halo",    tagline: "Halo qui pulse",            C: L_PulseHalo,     why: "Cadre qui pulse continuellement autour, teinté par trend." },
  { n: "140", name: "Hourglass",     tagline: "Sablier se retourne",       C: L_HourglassWord, why: "Sablier qui pivote à chaque tick EMMY." },
  { n: "141", name: "Bg Wave",       tagline: "Vague en arrière-plan",     C: L_BgWave,        why: "Onde sinusoïdale derrière le wordmark, vitesse = prix." },
  { n: "142", name: "Long Press",    tagline: "Maintenez pour saturer",    C: L_LongPress,     why: "Appuyer & maintenir intensifie la couleur de la marque." },
  { n: "143", name: "Twin",          tagline: "Wordmark dédoublé",         C: L_Twin,          why: "Ombre dupliquée en accent, légère décalage." },
  { n: "144", name: "Lap Circle",    tagline: "Clic trace un tour",        C: L_LapCircle,     why: "Clic dessine un cercle qui fait le tour du wordmark." },
  { n: "145", name: "Bars Above",    tagline: "Barres EQ au-dessus",       C: L_BarsAbove,     why: "Sept barres au-dessus, hauteurs = derniers ticks EMMY." },
  { n: "146", name: "Letter Focus",  tagline: "Focus glisse lettre/lettre", C: L_LetterFocus,  why: "Une lettre s'illumine à la fois, les autres en gris." },
  { n: "147", name: "Frame Slot",    tagline: "Cadre encadré",             C: L_FrameSlot,     why: "Encadré rectangulaire avec inset shadow." },
  { n: "148", name: "Wave Line",     tagline: "Onde sous le mot",          C: L_WaveLine,      why: "Vague continue sous le wordmark." },
  { n: "149", name: "Hashtag",       tagline: "# prefix qui pulse",        C: L_Hashtag,       why: "Préfixe # en mono, animé légèrement." },
  { n: "150", name: "Highlighter",   tagline: "Surligneur jaune",          C: L_Highlighter,   why: "Bande de surligneur derrière les lettres." },
  { n: "151", name: "Dance",         tagline: "Lettres dansent",           C: L_Dance,         why: "Translation Y + rotation légère permanente." },
  { n: "152", name: "Boxed Reveal",  tagline: "Bloc s'évade pour révéler", C: L_BoxedReveal,   why: "Une bande bleue se retire pour laisser apparaître le mot." },
  { n: "153", name: "Trend Tilt",    tagline: "Incline selon EMMY",        C: L_TrendTilt,     why: "Le wordmark s'incline -4°/+4° selon le trend." },
  { n: "154", name: "Mosaic",        tagline: "Grille en superposition",   C: L_Mosaic,        why: "Pattern grille très subtil par-dessus." },
  { n: "155", name: "Counter Overlay", tagline: "Prix en sur-titre",       C: L_CounterOverlay, why: "Cours EMMY affiché juste au-dessus du wordmark." },
  { n: "156", name: "Vinyl",         tagline: "Disque vinyle qui tourne",  C: L_Vinyl,         why: "Petit vinyle à gauche, tourne en boucle." },
  { n: "157", name: "Tape Play",     tagline: "Points qui défilent",       C: L_TapePlay,      why: "Points défilent en bas, comme un bandeau magnétique." },
  { n: "158", name: "Hover Burst",   tagline: "Rayons éclatent au survol", C: L_HoverBurst,    why: "8 rayons sortent radialement au survol." },
  { n: "159", name: "Pop Each",      tagline: "Clic agrandit la lettre",   C: L_PopEach,       why: "Cliquer une lettre la fait grossir brièvement." },
  { n: "160", name: "Constellation", tagline: "Mini-réseau d'étoiles",     C: L_Constellation, why: "Étoiles reliées qui clignotent à gauche." },
  { n: "161", name: "Dot Matrix",    tagline: "Pattern points selon prix", C: L_DotGridMatrix, why: "Densité de points proportionnelle au cours EMMY." },
  { n: "162", name: "Blink Dot",     tagline: "Point témoin",              C: L_BlinkDot,      why: "Point indicateur 'on air' clignotant." },
  { n: "163", name: "Double Slash",  tagline: "// prefix de commentaire",  C: L_DoubleSlash,   why: "Préfixe // en serif accent, esthétique code." },
  { n: "164", name: "Arrow Suffix",  tagline: "Flèche EMMY-colorée",       C: L_ArrowSuffix,   why: "Flèche à droite, teinte selon trend." },
  { n: "165", name: "Depth Shadow",  tagline: "Ombre 3D triple",           C: L_DepthShadow,   why: "Trois ombres décalées, effet poster 3D." },
  { n: "166", name: "Underscore",    tagline: "Underscore clignotant",     C: L_Underscore,    why: "Underscore terminal qui clignote en fin." },
  { n: "167", name: "Big Dot",       tagline: "Point géant en fin",        C: L_BigDot,        why: "Gros point coloré à la fin du wordmark." },
  { n: "168", name: "Vertical Bars", tagline: "Barres 5 ticks à gauche",   C: L_VerticalBars,  why: "5 barres verticales = 5 derniers prix EMMY." },
  { n: "169", name: "Pill",          tagline: "Pill arrondie",             C: L_RoundCorner,   why: "Wordmark dans une pill ronde claire." },
  { n: "170", name: "Quote Marks",   tagline: "Guillemets typographiques", C: L_QuoteMarks,    why: "Guillemets éditoriaux de chaque côté." },
];

const LogoLab7Page = () => {
  const Card = window.LogoCardLite;
  return (
    <CeePriceProvider>
      <LogoStyles />
      <LogoLab2Styles />
      <LogoLab3Styles />
      <LogoLab5Styles />
      <LogoLab6Styles />
      <LogoLab7Styles />

      <section style={{ position: "relative", overflow: "hidden" }}>
        <AuroraMesh intensity={0.6} />
        <Orb size={620} color="var(--volt-glow)" style={{ top: -160, right: -120 }} />
        <div className="r-padbox" style={{ maxWidth: 1320, margin: "0 auto", padding: "72px 32px 36px", position: "relative" }}>
          <div className="upper" style={{ color: "var(--volt)" }}>Logo Lab · volume 7</div>
          <h1 className="serif h1-fluid" style={{ fontSize: 96, lineHeight: 0.96, letterSpacing: "-0.035em", margin: "14px 0 22px", color: "var(--ink)", fontWeight: 500, maxWidth: 1100 }}>
            50 logos <em style={{ color: "var(--volt)" }}>de plus.</em>
          </h1>
          <p className="body-fluid" style={{ fontSize: 17, color: "var(--bone-soft)", lineHeight: 1.55, maxWidth: 880, margin: "0 0 18px" }}>
            Aurora, néon, scramble, surligneur, vinyle, drop splash… 50 nouvelles directions, toutes connectées EMMY, toutes interactives.
          </p>
          <div style={{ display: "inline-flex", padding: "10px 16px", background: "var(--card)", border: "1px solid var(--rule-on)", borderRadius: 6, alignItems: "center", gap: 14 }}>
            <EmmyStatusInline />
          </div>
        </div>
      </section>

      <section className="r-padbox section-pad" style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 32px 80px" }}>
        <div className="r-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {LOGOS_V7.map(({ n, name, tagline, why, C }) => (
            <Card key={n} n={n} name={name} tagline={tagline} why={why}>
              <C />
            </Card>
          ))}
        </div>

        <div style={{ marginTop: 60, padding: 40, background: "var(--ink)", color: "#fff", borderRadius: 8 }} className="on-ink">
          <div className="upper" style={{ color: "var(--volt)" }}>Récap général · 170 logos</div>
          <h3 className="serif" style={{ fontSize: 28, color: "#fff", fontWeight: 500, marginTop: 8, letterSpacing: "-0.02em" }}>
            7 volumes · 170 concepts uniques
          </h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 12, lineHeight: 1.55, maxWidth: 720 }}>
            Tu peux maintenant <strong style={{ color: "var(--volt)" }}>shortlister une fois pour toutes</strong> — la collection devient un véritable répertoire. Donne-moi tes finalistes (5 max idéalement) et j'installe celui qu'on retient partout dans le site.
          </p>
        </div>
      </section>
    </CeePriceProvider>
  );
};

Object.assign(window, { LogoLab7Page, LogoLab7Styles, LOGOS_V7 });
