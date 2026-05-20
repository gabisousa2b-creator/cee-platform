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
  { n: "21",  from: null,        kind: "glyph",    component: "LogoBattery", name: "Battery" },
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

// Glyph wrapper — pairs the SVG with our text wordmark + EMMY sub-line
const GlyphWordmark = ({ Glyph, scale = 1, color = "var(--ink)", accent = "var(--volt)" }) => {
  const e = window.useEmmy ? window.useEmmy() : { last: 9.10, trend: 0, source: "indicative" };
  const hue = window.emmyHue ? window.emmyHue(e.trend) : accent;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 * scale }}>
      <Glyph scale={0.9 * scale} color={color} accent={accent} />
      <div style={{ display: "inline-flex", flexDirection: "column" }}>
        <span className="serif" style={{
          fontSize: 28 * scale, lineHeight: 1, letterSpacing: "-0.035em",
          fontWeight: 500, color,
        }}>echo<span style={{ color: accent }}>wai</span></span>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: hue }} className="volt-dot" />
          <span className="mono" style={{ fontSize: 9 * scale, color: "var(--muted)", letterSpacing: ".06em" }}>
            EMMY · {e.last.toFixed(2)} €/MWh {e.trend > 0 ? "↑" : e.trend < 0 ? "↓" : "→"}
          </span>
        </div>
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

  // Notify parent when slot rotates (analytics + auto-fit)
  React.useEffect(() => {
    try { window.parent.postMessage({ source: "ew-logo", slot, n: SELECTED[slot]?.n }, "*"); } catch (e) {}
    // Auto-fit: measure root after paint and tell parent the height
    const id = requestAnimationFrame(() => {
      const r = document.getElementById("root");
      if (!r) return;
      const h = Math.ceil(r.firstChild?.getBoundingClientRect().height || 60);
      try { window.parent.postMessage({ source: "ew-logo-size", height: h + 8 }, "*"); } catch (e) {}
    });
    return () => cancelAnimationFrame(id);
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
  const inner = entry.kind === "glyph"
    ? <GlyphWordmark Glyph={C} scale={scale} color={fg} accent={ax} />
    : <C scale={scale} color={fg} accent={ax} />;
  return <CeePriceProvider>{inner}</CeePriceProvider>;
};

// Boot — wait for lab files (registries on window) before mount
function boot() {
  const need = ["LOGOS_V5", "LOGOS_V6", "LOGOS_V7", "LOGOS_V8", "LOGOS_V9", "CeePriceProvider", "useEmmy", "LogoBattery"];
  const missing = need.filter(k => !window[k]);
  if (missing.length) {
    // try again next frame
    requestAnimationFrame(boot);
    return;
  }
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
}
boot();
