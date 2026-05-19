function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* eslint-disable */
// EchoWAI — Animation primitives

// ──────────────────────────────────────────────────────────────
// LiquidNumber — odometer-style fluid digit morph
// Interpolates value over `dur` ms with a quartic ease; each digit
// position renders as a vertical column of 0..9 translated by current
// digit. Decimals/thousands sep supported.
// ──────────────────────────────────────────────────────────────
const LiquidNumber = ({
  value,
  dur = 700,
  format = "fr",
  size = 96,
  color = "var(--bone)"
}) => {
  const [shown, setShown] = React.useState(value);
  const fromRef = React.useRef(value);
  const startRef = React.useRef(null);
  const rafRef = React.useRef(null);
  React.useEffect(() => {
    const from = shown;
    fromRef.current = from;
    startRef.current = performance.now();
    cancelAnimationFrame(rafRef.current);
    const tick = now => {
      const t = Math.min(1, (now - startRef.current) / dur);
      const eased = 1 - Math.pow(1 - t, 4);
      const next = from + (value - from) * eased;
      setShown(next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);else setShown(value);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, dur]);
  const rounded = Math.round(shown);
  const formatted = format === "fr" ? new Intl.NumberFormat("fr-FR").format(rounded) : String(rounded);

  // We render each character — for digits, we make a "reel" column with
  // 0..9 stacked, and translate by the *fractional* digit progress for
  // smoothness even between integers.
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      color,
      fontFamily: "var(--font-display)",
      fontSize: size,
      lineHeight: 0.92,
      letterSpacing: "-0.035em",
      fontWeight: 400
    }
  }, formatted.split("").map((ch, i) => {
    if (!/[0-9]/.test(ch)) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        style: {
          display: "inline-block"
        }
      }, ch);
    }
    const digit = parseInt(ch, 10);
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        display: "inline-block",
        height: size * 0.92,
        overflow: "hidden",
        verticalAlign: "top"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        flexDirection: "column",
        transform: `translateY(-${digit * (size * 0.92)}px)`,
        transition: `transform ${dur}ms var(--ease-out-quart)`
      }
    }, Array.from({
      length: 10
    }, (_, n) => /*#__PURE__*/React.createElement("span", {
      key: n,
      style: {
        height: size * 0.92,
        display: "block"
      }
    }, n))));
  }));
};

// ──────────────────────────────────────────────────────────────
// MagneticBtn — attracts cursor when within radius
// ──────────────────────────────────────────────────────────────
const MagneticBtn = ({
  children,
  strength = 0.35,
  radius = 110,
  style,
  ...rest
}) => {
  const ref = React.useRef(null);
  const [off, setOff] = React.useState({
    x: 0,
    y: 0
  });
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = e => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) setOff({
        x: dx * strength,
        y: dy * strength
      });else setOff({
        x: 0,
        y: 0
      });
    };
    const onLeave = () => setOff({
      x: 0,
      y: 0
    });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [strength, radius]);
  return /*#__PURE__*/React.createElement("span", _extends({
    ref: ref,
    style: {
      display: "inline-block",
      transform: `translate3d(${off.x}px,${off.y}px,0)`,
      transition: "transform 250ms var(--ease-out-quart)",
      ...style
    }
  }, rest), children);
};

// ──────────────────────────────────────────────────────────────
// CursorEcho — ripples emit from cursor on click
// ──────────────────────────────────────────────────────────────
const CursorEcho = ({
  children,
  style
}) => {
  const ref = React.useRef(null);
  const [rings, setRings] = React.useState([]);
  const [hoverPos, setHoverPos] = React.useState({
    x: -999,
    y: -999
  });
  const onMove = e => {
    const r = ref.current.getBoundingClientRect();
    setHoverPos({
      x: e.clientX - r.left,
      y: e.clientY - r.top
    });
  };
  const onClick = e => {
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const id = Math.random();
    setRings(s => [...s, {
      id,
      x,
      y
    }]);
    setTimeout(() => setRings(s => s.filter(r => r.id !== id)), 1400);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    onMouseMove: onMove,
    onClick: onClick,
    onMouseLeave: () => setHoverPos({
      x: -999,
      y: -999
    }),
    style: {
      position: "relative",
      overflow: "hidden",
      ...style
    }
  }, children, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: hoverPos.x,
      top: hoverPos.y,
      width: 360,
      height: 360,
      borderRadius: "50%",
      transform: "translate(-50%, -50%)",
      background: "radial-gradient(closest-side, var(--volt-glow), transparent 70%)",
      mixBlendMode: "screen",
      transition: "opacity .4s",
      opacity: hoverPos.x < 0 ? 0 : 1
    }
  }), rings.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      position: "absolute",
      left: r.x,
      top: r.y,
      width: 200,
      height: 200,
      borderRadius: "50%",
      border: "1px solid var(--volt)",
      transform: "translate(-50%, -50%) scale(0.2)",
      animation: "ringExpand 1.4s var(--ease-out-quart) forwards",
      mixBlendMode: "screen"
    }
  }))));
};

// ──────────────────────────────────────────────────────────────
// FlowRibbon — continuously animated SVG ribbon (sine wave)
// Used as the brand motif: an "echo" that flows
// ──────────────────────────────────────────────────────────────
const FlowRibbon = ({
  height = 200,
  lines = 5,
  speed = 14,
  color = "var(--volt)",
  style
}) => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf;
    let start = performance.now();
    const tick = now => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const paths = [];
  const W = 1200;
  const H = height;
  for (let i = 0; i < lines; i++) {
    const phase = t * speed * 0.06 + i * 0.5;
    const amp = H * 0.18 * (1 - i / lines * 0.5);
    const baseY = H / 2 + (i - lines / 2) * (H * 0.04);
    let d = `M 0 ${baseY}`;
    const steps = 32;
    for (let s = 1; s <= steps; s++) {
      const x = s / steps * W;
      const y = baseY + Math.sin(s / steps * Math.PI * 3 + phase) * amp + Math.sin(s / steps * Math.PI * 5 + phase * 0.7) * amp * 0.3;
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    paths.push({
      d,
      opacity: 1 - i / lines * 0.65,
      width: 1 + (i === 0 ? 0.8 : 0)
    });
  }
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none",
    style: {
      display: "block",
      width: "100%",
      height,
      ...style
    },
    "aria-hidden": true
  }, paths.map((p, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: p.d,
    fill: "none",
    stroke: color,
    strokeWidth: p.width,
    strokeOpacity: p.opacity,
    strokeLinecap: "round"
  })));
};

// ──────────────────────────────────────────────────────────────
// Orb — a luminous floating circle, drifts gently
// ──────────────────────────────────────────────────────────────
const Orb = ({
  size = 360,
  color = "var(--volt-glow)",
  style
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    width: size,
    height: size,
    borderRadius: "50%",
    background: `radial-gradient(closest-side, ${color}, transparent 70%)`,
    filter: "blur(8px)",
    animation: "orbDrift 9s ease-in-out infinite",
    pointerEvents: "none",
    ...style
  }
});

// ──────────────────────────────────────────────────────────────
// LiveTicker — vertically scrolling list of dossier events
// ──────────────────────────────────────────────────────────────
const LiveTicker = ({
  events,
  height = 22
}) => {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI(n => (n + 1) % events.length), 2600);
    return () => clearInterval(t);
  }, [events.length]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      overflow: "hidden",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      transform: `translateY(-${i * height}px)`,
      transition: "transform .5s var(--ease-out-quart)"
    }
  }, events.concat(events[0]).map((e, k) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height,
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "var(--volt)"
    },
    className: "volt-dot"
  }), e))));
};

// ──────────────────────────────────────────────────────────────
// Slider — fluid range input matching design
// ──────────────────────────────────────────────────────────────
const Slider = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  unit,
  format
}) => {
  const pct = (value - min) / (max - min) * 100;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 14,
      color: "var(--on-card)"
    }
  }, format ? format(value) : value, unit && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted)",
      marginLeft: 4
    }
  }, unit))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 26,
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 2,
      background: "var(--rule-on)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      width: `${pct}%`,
      height: 2,
      background: "var(--volt)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: `calc(${pct}% - 8px)`,
      width: 16,
      height: 16,
      borderRadius: "50%",
      background: "var(--volt)",
      boxShadow: "0 0 0 4px rgba(207,242,78,0.18)",
      transition: "left 80ms linear"
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(+e.target.value),
    style: {
      position: "absolute",
      inset: 0,
      opacity: 0,
      cursor: "pointer",
      width: "100%"
    }
  })));
};
Object.assign(window, {
  LiquidNumber,
  MagneticBtn,
  CursorEcho,
  FlowRibbon,
  Orb,
  LiveTicker,
  Slider
});

// ──────────────────────────────────────────────────────────────
// CountUp — animates from 0 to `to` over `dur` ms
// Auto-starts on mount; pass `trigger` to retrigger
// ──────────────────────────────────────────────────────────────
const CountUp = ({
  to,
  dur = 1600,
  format,
  size,
  color,
  mono = true
}) => {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    let raf;
    let start = null;
    const tick = now => {
      if (!start) start = now;
      const tt = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - tt, 3);
      setN(Math.round(eased * to));
      if (tt < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  return /*#__PURE__*/React.createElement("span", {
    className: mono ? "mono" : "",
    style: {
      fontSize: size,
      color,
      fontFeatureSettings: '"tnum"'
    }
  }, format ? format(n) : new Intl.NumberFormat("fr-FR").format(n));
};

// ──────────────────────────────────────────────────────────────
// PathDraw — SVG path that draws itself from 0 → full on mount
// ──────────────────────────────────────────────────────────────
const PathDraw = ({
  d,
  dur = 1.2,
  delay = 0,
  stroke = "currentColor",
  strokeWidth = 1.5,
  ...rest
}) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    try {
      const len = el.getTotalLength();
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
      // Force reflow
      el.getBoundingClientRect();
      el.style.transition = `stroke-dashoffset ${dur}s var(--ease-out-quart) ${delay}s`;
      el.style.strokeDashoffset = "0";
    } catch (e) {}
  }, []);
  return /*#__PURE__*/React.createElement("path", _extends({
    ref: ref,
    d: d,
    fill: "none",
    stroke: stroke,
    strokeWidth: strokeWidth,
    strokeLinecap: "round"
  }, rest));
};

// ──────────────────────────────────────────────────────────────
// AuroraMesh — slow drifting layered radial gradients (background)
// ──────────────────────────────────────────────────────────────
const AuroraMesh = ({
  intensity = 1,
  hue = "blue"
}) => {
  const tones = hue === "blue" ? ["rgba(46,126,244,0.18)", "rgba(91,168,229,0.16)", "rgba(187,215,251,0.22)"] : ["rgba(207,242,78,0.16)", "rgba(76,229,140,0.16)", "rgba(255,255,255,0.0)"];
  return /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      overflow: "hidden"
    }
  }, [{
    x: "20%",
    y: "30%",
    w: 700,
    h: 600,
    c: tones[0],
    dur: 18,
    delay: 0
  }, {
    x: "75%",
    y: "15%",
    w: 600,
    h: 520,
    c: tones[1],
    dur: 22,
    delay: -7
  }, {
    x: "55%",
    y: "85%",
    w: 800,
    h: 640,
    c: tones[2],
    dur: 26,
    delay: -12
  }].map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: "absolute",
      left: g.x,
      top: g.y,
      width: g.w,
      height: g.h,
      transform: "translate(-50%, -50%)",
      background: `radial-gradient(closest-side, ${g.c}, transparent 70%)`,
      filter: "blur(28px)",
      opacity: intensity,
      animation: `auroraDrift ${g.dur}s ${g.delay}s ease-in-out infinite`
    }
  })));
};

// ──────────────────────────────────────────────────────────────
// Marquee — continuous horizontal scroll (CSS-only, gap-aware)
// ──────────────────────────────────────────────────────────────
const Marquee = ({
  items,
  speed = 40,
  separator = "·"
}) => {
  // Duplicate the list once so the translation by -50% loops seamlessly
  const list = [...items, ...items];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: "hidden",
      position: "relative",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      gap: 32,
      whiteSpace: "nowrap",
      animation: `marqueeShift ${speed}s linear infinite`,
      paddingRight: 32
    }
  }, list.map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("span", null, t), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--rule)"
    }
  }, separator)))));
};

// ──────────────────────────────────────────────────────────────
// RevealOnView — fades up when scrolled into view
// (uses IntersectionObserver; on canvas this works for visible-enough cards)
// ──────────────────────────────────────────────────────────────
const RevealOnView = ({
  children,
  delay = 0,
  distance = 18,
  dur = 0.9
}) => {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      });
    }, {
      threshold: 0.1
    });
    io.observe(ref.current);
    // Fallback for canvases that report intersections oddly
    const fallback = setTimeout(() => setShown(true), 700);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      opacity: shown ? 1 : 0,
      transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
      transition: `opacity ${dur}s var(--ease-out-quart) ${delay}s, transform ${dur}s var(--ease-out-quart) ${delay}s`
    }
  }, children);
};

// ──────────────────────────────────────────────────────────────
// ProgressStripe — barber-pole loader bar (height + value 0..1)
// ──────────────────────────────────────────────────────────────
const ProgressStripe = ({
  value = 0.6,
  height = 8,
  label
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  }
}, label && /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)",
    display: "flex",
    justifyContent: "space-between"
  }
}, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
  className: "mono"
}, Math.round(value * 100), "%")), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    height,
    background: "var(--card-2)",
    overflow: "hidden",
    borderRadius: 2
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "stripe-loader",
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: `${value * 100}%`,
    transition: "width .8s var(--ease-out-quart)"
  }
})));

// ──────────────────────────────────────────────────────────────
// HoverLift — wraps children, lifts + glows on hover
// ──────────────────────────────────────────────────────────────
const HoverLift = ({
  children,
  style
}) => {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      transform: hover ? "translateY(-3px)" : "translateY(0)",
      boxShadow: hover ? "0 18px 40px -16px rgba(10,31,61,.20)" : "var(--sh-1)",
      transition: "transform .35s var(--ease-out-quart), box-shadow .35s var(--ease-out-quart)",
      ...style
    }
  }, children);
};
Object.assign(window, {
  CountUp,
  PathDraw,
  AuroraMesh,
  Marquee,
  RevealOnView,
  ProgressStripe,
  HoverLift
});