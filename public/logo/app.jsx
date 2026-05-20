/* eslint-disable */
// EchoWAI — Rotating logo app (iframe)
// 13 logos selected from lab vols 3,5,6,7,8,9.
// Rotation: deterministic 15-min slot — Math.floor(Date.now()/900000) % N.
// EMMY price hooked via /api/emmy (set window.ECHOWAI_CEE_API before provider mounts).

// Use the existing /api/emmy endpoint as data source
window.ECHOWAI_CEE_API = "/api/emmy";

// ── Selected logos: [n, kind, picker(window) → React component] ──
// kind: "wordmark" = full text+motif (vol5-9), "glyph" = SVG only (vol3 → wrap with our text)
const SELECTED = [
  { n: "184", from: "LOGOS_V8", kind: "wordmark", name: "Letter Flip" },
  { n: "187", from: "LOGOS_V8", kind: "wordmark", name: "Shimmer" },
  { n: "200", from: "LOGOS_V8", kind: "wordmark", name: "Kinetic Focus" },
  { n: "201", from: "LOGOS_V8", kind: "wordmark", name: "Writing Machine" },
  { n: "129", from: "LOGOS_V7", kind: "wordmark", name: "Double Ring" },
  { n: "146", from: "LOGOS_V7", kind: "wordmark", name: "Letter Focus" },
  { n: "112", from: "LOGOS_V6", kind: "wordmark", name: "Bracket Burst" },
  { n: "57",  from: "LOGOS_V5", kind: "wordmark", name: "Underline Sweep" },
  { n: "53",  from: "LOGOS_V5", kind: "wordmark", name: "Drop In" },
  { n: "21",  from: null,        kind: "needs-emmy", component: "LogoBattery", name: "Battery" },
  { n: "227", from: "LOGOS_V9", kind: "wordmark", name: "Hue Rotate" },
  { n: "244", from: "LOGOS_V9", kind: "wordmark", name: "Levitate" },
  { n: "249", from: "LOGOS_V9", kind: "wordmark", name: "Swap Colors" },
];

// Resolve a logo entry → React component
function resolveComponent(entry) {
  if (entry.from) {
    const reg = window[entry.from];
    if (!reg) return null;
    const hit = reg.find(x => String(x.n) === String(entry.n));
    return hit ? hit.C : null;
  }
  // Glyph kind: pull bare component name off window
  return window[entry.component] || null;
}

// Pick current slot — deterministic, identical across tabs
function currentSlot() {
  return Math.floor(Date.now() / 900000) % SELECTED.length;
}

// Pour les logos qui n'embarquent pas leur propre ligne EMMY (vol3 par ex.),
// on les enveloppe dans un stack vertical avec une sub-line discrète en bas.
const EmmyStackWrapper = ({ Logo, scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const e = window.useEmmy ? window.useEmmy() : { last: 9.10, trend: 0, source: "indicative" };
  const hue = window.emmyHue ? window.emmyHue(e.trend) : accent;
  const onDark = color === "#FFFFFF" || color === "#fff" || color === "white";
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 0 }}>
      <Logo scale={scale} color={color} accent={accent} />
      <div className="mono" style={{
        display: "inline-flex", alignItems: "center", gap: 4 * scale, marginTop: 0, lineHeight: 1,
        fontSize: 9 * scale, letterSpacing: ".06em",
        color: onDark ? "rgba(255,255,255,.6)" : "var(--muted, #5B6B85)",
        whiteSpace: "nowrap",
      }}>
        <span style={{ width: 4 * scale, height: 4 * scale, borderRadius: "50%", background: hue, animation: "volt-pulse 2.4s ease-in-out infinite" }} />
        <span style={{ letterSpacing: ".15em" }}>EMMY</span>
        <span style={{ color: onDark ? "rgba(255,255,255,.92)" : "var(--ink, #0a1f3d)", fontWeight: 600 }}>
          {e.last.toFixed(2).replace(".", ",")}
        </span>
        <span>€/MWh</span>
        <span style={{ color: hue, fontWeight: 700 }}>{e.trend > 0 ? "↑" : e.trend < 0 ? "↓" : "→"}</span>
      </div>
    </div>
  );
};

// Parse URL params: theme, scale, slot override (for testing)
function readParams() {
  const u = new URL(window.location.href);
  const theme = u.searchParams.get("theme") || "light";
  const scale = parseFloat(u.searchParams.get("scale") || "1");
  const slotOverride = u.searchParams.get("slot");
  const color = u.searchParams.get("color");
  const accent = u.searchParams.get("accent");
  return { theme, scale, slotOverride, color, accent };
}

const App = () => {
  const { theme, scale, slotOverride, color, accent } = readParams();
  const [slot, setSlot] = React.useState(
    slotOverride !== null ? Number(slotOverride) % SELECTED.length : currentSlot()
  );

  // Apply theme class to <html>
  React.useEffect(() => {
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
  }, [theme]);

  // Tick to next slot at 15-min boundary
  React.useEffect(() => {
    if (slotOverride !== null) return;
    const now = Date.now();
    const next = (Math.floor(now / 900000) + 1) * 900000;
    const t = setTimeout(() => setSlot(currentSlot()), next - now + 50);
    return () => clearTimeout(t);
  }, [slot, slotOverride]);

  // Notify parent when slot rotates (analytics + continuous auto-fit).
  // We watch the rendered element with ResizeObserver and keep the MAX size
  // seen during the current slot — animations that grow (Bracket Burst,
  // Letter Flip…) push width up; we never shrink mid-slot to avoid clipping.
  // Parent receives the slot index too, so it can RESET its size when the
  // slot changes (otherwise a previous wide slot would lock the iframe
  // wider than the next slot needs).
  React.useEffect(() => {
    try { window.parent.postMessage({ source: "ew-logo", slot, n: SELECTED[slot]?.n }, "*"); } catch (e) {}
    const r = document.getElementById("root");
    if (!r) return;
    let maxW = 0, maxH = 0;
    let raf = 0;
    const post = (kind) => {
      try {
        window.parent.postMessage({
          source: "ew-logo-size",
          width: maxW, height: maxH,
          slot: slot, kind: kind || "grow",
        }, "*");
      } catch (e) {}
    };
    const findLogo = () => {
      const kids = r.children;
      for (let i = kids.length - 1; i >= 0; i--) {
        const k = kids[i];
        if (k.tagName === "STYLE") continue;
        return k;
      }
      return null;
    };
    const measure = (forceReset) => {
      const child = findLogo();
      if (!child) return;
      const rect = child.getBoundingClientRect();
      // +2 px each side as visual breathing room; iframe content is the
      // entire logo (text + EMMY sub-line) — no extra padding needed.
      const w = Math.ceil(Math.max(rect.width, child.scrollWidth)) + 4;
      const h = Math.ceil(Math.max(rect.height, child.scrollHeight)) + 2;
      if (forceReset) { maxW = w; maxH = h; post("reset"); return; }
      const grew = w > maxW + 0.5 || h > maxH + 0.5;
      if (grew) { maxW = Math.max(maxW, w); maxH = Math.max(maxH, h); post("grow"); }
    };
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => measure(false)); });
    ro.observe(r);
    const logo0 = findLogo();
    if (logo0) ro.observe(logo0);
    // First measure: RESET so the parent shrinks back if the new slot is
    // narrower than the previous one. Subsequent measures only grow.
    const t0 = setTimeout(() => measure(true), 30);
    const t1 = setTimeout(() => measure(false), 250);
    const t2 = setTimeout(() => measure(false), 700);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [slot]);

  const entry = SELECTED[slot];
  const C = resolveComponent(entry);

  const fg = color || (theme === "dark" ? "#FFFFFF" : "var(--ink)");
  const ax = accent || "var(--volt)";

  if (!C) {
    // Fallback while lab files still loading or component missing
    return (
      <span className="serif" style={{ fontSize: 28 * scale, color: fg, letterSpacing: "-0.035em", fontWeight: 500 }}>
        echo<span style={{ color: ax }}>wai</span>
      </span>
    );
  }

  const CeePriceProvider = window.CeePriceProvider;
  // LabStyles renders the <style> components from every lab volume so the
  // @keyframes referenced by L_* / Logo* components actually exist in the
  // document. Without these, animations referenced by name silently no-op.
  const styleComponents = [
    window.LogoStyles,        // vol1 (base motion + paint helpers)
    window.LogoLab2Styles,    // vol2
    window.LogoLab3Styles,    // vol3 (spinSlow, ripple, batFill, …)
    window.LogoLab5Styles,    // vol5 (typewrite, underlineSweep, …)
    window.LogoLab6Styles,    // vol6 (wipeIn, burstIn, …)
    window.LogoLab7Styles,    // vol7 (orbitPath, ringDouble, …)
    window.LogoLab8Styles,    // vol8 (letterFlipUp, shimmerSweep, …)
    window.LogoLab9Styles,    // vol9 (morphHue, flickerOn, …)
  ].filter(Boolean);
  const inner = entry.kind === "needs-emmy"
    ? <EmmyStackWrapper Logo={C} scale={scale} color={fg} accent={ax} />
    : <C scale={scale} color={fg} accent={ax} />;
  return (
    <CeePriceProvider>
      {styleComponents.map((S, i) => <S key={i} />)}
      {inner}
    </CeePriceProvider>
  );
};

// Boot — wait for lab files (registries on window) before mount.
// We need both the L_ components AND every LogoLab<N>Styles so the
// keyframes those components reference actually get into the document.
function boot() {
  const need = [
    "LOGOS_V5", "LOGOS_V6", "LOGOS_V7", "LOGOS_V8", "LOGOS_V9",
    "CeePriceProvider", "useEmmy", "LogoBattery",
    "LogoLab3Styles", "LogoLab5Styles", "LogoLab6Styles",
    "LogoLab7Styles", "LogoLab8Styles", "LogoLab9Styles",
  ];
  const missing = need.filter(k => !window[k]);
  if (missing.length) {
    // try again next frame
    requestAnimationFrame(boot);
    return;
  }
  // #root is a native <a href="/" target="_top">. The browser handles
  // top-level navigation natively, which:
  //  - works without scripted setTimeout (no user-activation issues)
  //  - sends a proper history entry, supports Ctrl/Cmd-click and
  //    middle-click natively
  //  - always lands on the PARENT's origin, never the iframe origin
  // Our only job here is to PREVENT the navigation when the user is
  // already on the home page — so the logo stays fluid and interactive.
  // Le site utilise un hash-routing : "/" sans hash et "#/home" sont
  // l'accueil ; "#/contact", "#/dispositif"… sont d'autres vues.
  const HOME_HASHES = new Set(["", "#", "#/", "#/home", "#home"]);
  const HOME_PATHS  = new Set(["/", "/index.html"]);
  function isOnHome() {
    try {
      const loc = window.parent.location;
      if (!HOME_PATHS.has(loc.pathname)) return false;
      return HOME_HASHES.has(loc.hash || "");
    } catch (e) {
      return false;
    }
  }
  const rootEl = document.getElementById("root");
  rootEl.addEventListener("click", function (ev) {
    if (isOnHome()) {
      // Already at /, kill the anchor's default navigation but let
      // any inner button's onClick run normally for the animation.
      ev.preventDefault();
      return;
    }
    // Si on est sur la même pathname mais une autre vue hash-routée
    // (ex. /#/contact), un anchor href="/" déclenche seulement un
    // hashchange — la SPA peut louper le re-render selon son listener.
    // Pour être sûr de ramener l'utilisateur sur l'accueil, on force
    // un set du hash sur "#/home" + on previent la nav anchor.
    try {
      const loc = window.parent.location;
      if (HOME_PATHS.has(loc.pathname) && !HOME_HASHES.has(loc.hash || "")) {
        ev.preventDefault();
        loc.hash = "#/home";
        return;
      }
    } catch (e) { /* cross-origin: laisse l'anchor faire son boulot */ }
    // Autres cas (admin, partenaire, portal, compte…) : l'anchor
    // target="_top" navigue vers / sur l'origine du parent.
  });
  // If iframe ever loads as the top document (direct visit to /logo/),
  // the anchor's target="_top" is a no-op self-link. Rewrite to "_self".
  if (window.parent === window) {
    rootEl.setAttribute("target", "_self");
  }
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}
boot();
