/* eslint-disable */
// EchoWAI — UX tools (Command Palette, Toast, Postal AutoFill, Comparator, Tooltip)

// ──────────────────────────────────────────────────────────────
// Tooltip — hover-anchored, with arrow, for CEE codes/jargon
// ──────────────────────────────────────────────────────────────
const Tooltip = ({
  children,
  content,
  side = "top"
}) => {
  const [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-block",
      cursor: "help",
      borderBottom: "1px dotted var(--volt)"
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false)
  }, children, open && /*#__PURE__*/React.createElement("div", {
    role: "tooltip",
    style: {
      position: "absolute",
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginBottom: 8,
      background: "var(--ink)",
      color: "#FFFFFF",
      padding: "8px 10px",
      borderRadius: 4,
      fontSize: 11,
      lineHeight: 1.45,
      fontFamily: "var(--font-sans)",
      fontWeight: 400,
      letterSpacing: 0,
      textTransform: "none",
      minWidth: 220,
      maxWidth: 280,
      boxShadow: "0 12px 36px -12px rgba(10,31,61,.35)",
      zIndex: 50,
      animation: "revealUp .25s var(--ease-out-quart) both"
    }
  }, content, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      width: 0,
      height: 0,
      borderLeft: "5px solid transparent",
      borderRight: "5px solid transparent",
      borderTop: "5px solid var(--ink)"
    }
  })));
};

// ──────────────────────────────────────────────────────────────
// Toast Stack — top-right notifications
// ──────────────────────────────────────────────────────────────
const ToastStack = ({
  toasts
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    top: 18,
    right: 18,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    zIndex: 60,
    pointerEvents: "none"
  }
}, toasts.map(t => /*#__PURE__*/React.createElement("div", {
  key: t.id,
  style: {
    background: "var(--card)",
    border: "1px solid var(--rule-on)",
    padding: "12px 16px",
    borderRadius: 6,
    boxShadow: "0 14px 36px -12px rgba(10,31,61,.20)",
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 280,
    animation: "revealUp .35s var(--ease-out-quart) both",
    pointerEvents: "auto"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: t.kind === "success" ? "var(--st-valide)" : t.kind === "warn" ? "var(--st-controle)" : "var(--volt)",
    flexShrink: 0
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    minWidth: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    color: "var(--ink)",
    fontWeight: 500,
    lineHeight: 1.25
  }
}, t.title), t.detail && /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: "var(--muted)",
    marginTop: 2
  }
}, t.detail)), /*#__PURE__*/React.createElement("div", {
  className: "mono",
  style: {
    fontSize: 10,
    color: "var(--bone-mute)"
  }
}, "maintenant"))));

// ──────────────────────────────────────────────────────────────
// CommandPalette — Cmd+K overlay with live, navigable search
// ──────────────────────────────────────────────────────────────
const COMMANDS = [{
  kind: "page",
  label: "Accueil",
  desc: "Vue d'ensemble",
  view: "home"
}, {
  kind: "page",
  label: "Le dispositif CEE",
  desc: "Comprendre les CEE",
  view: "dispositif"
}, {
  kind: "page",
  label: "Simulateur de prime",
  desc: "Estimer en 4 étapes",
  view: "simulateur"
}, {
  kind: "page",
  label: "Commande de matériel",
  desc: "Catalogue éligible",
  view: "materiel"
}, {
  kind: "page",
  label: "Espaces & bénéficiaire",
  desc: "Suivi de dossier",
  view: "beneficiaire"
}, {
  kind: "page",
  label: "Contact",
  desc: "Démo · partenariat",
  view: "contact"
}, {
  kind: "action",
  label: "Simuler ma prime",
  desc: "Lancer le simulateur",
  view: "simulateur"
}, {
  kind: "action",
  label: "Espace mandataire — se connecter",
  desc: "Connexion plateforme",
  view: "login"
}, {
  kind: "action",
  label: "Suivre mon dossier",
  desc: "Espace bénéficiaire",
  view: "beneficiaire"
}, {
  kind: "fiche",
  label: "BAR-EN-101 · Isolation des combles",
  desc: "Résidentiel",
  view: "dispositif"
}, {
  kind: "fiche",
  label: "BAR-TH-104 · Pompe à chaleur air/eau",
  desc: "Résidentiel",
  view: "dispositif"
}, {
  kind: "fiche",
  label: "IND-UT-117 · Récupération de chaleur",
  desc: "Industrie",
  view: "dispositif"
}, {
  kind: "fiche",
  label: "AGRI-TH-116 · Pompe à chaleur élevage",
  desc: "Agriculture",
  view: "dispositif"
}, {
  kind: "legal",
  label: "Mentions légales",
  desc: "Informations éditeur",
  view: "mentions"
}, {
  kind: "legal",
  label: "Politique de confidentialité",
  desc: "RGPD · données",
  view: "confidentialite"
}, {
  kind: "legal",
  label: "Conditions générales d'utilisation",
  desc: "Règles d'usage",
  view: "cgu"
}, {
  kind: "legal",
  label: "Gestion des cookies",
  desc: "Préférences",
  view: "cookies"
}];
const deburr = s => (s || "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const CommandPalette = ({
  embedded = false,
  onNavigate,
  onClose
}) => {
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState(0);
  const listRef = React.useRef(null);
  const filtered = React.useMemo(() => {
    const nq = deburr(q).trim();
    if (!nq) return COMMANDS;
    const terms = nq.split(/\s+/);
    return COMMANDS.map(c => {
      const hay = deburr(c.label + " " + c.desc + " " + c.kind);
      const score = terms.every(t => hay.includes(t)) ? deburr(c.label).startsWith(nq) ? 0 : 1 : -1;
      return {
        c,
        score
      };
    }).filter(x => x.score >= 0).sort((a, b) => a.score - b.score).map(x => x.c);
  }, [q]);
  React.useEffect(() => {
    setSel(0);
  }, [q]);

  // keep the highlighted row visible
  React.useEffect(() => {
    const el = listRef.current && listRef.current.children[sel];
    if (el && el.scrollIntoView) el.scrollIntoView({
      block: "nearest"
    });
  }, [sel]);
  const run = c => {
    if (!c) return;
    if (onClose) onClose();
    if (onNavigate) onNavigate(c.view);
  };
  const onKeyDown = e => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel(s => Math.min(filtered.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel(s => Math.max(0, s - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(filtered[sel]);
    } else if (e.key === "Escape" && onClose) {
      e.preventDefault();
      onClose();
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--card)",
      border: "1px solid var(--rule-on)",
      borderRadius: 8,
      boxShadow: embedded ? "var(--sh-2)" : "0 32px 80px -24px rgba(10,31,61,.32), 0 0 0 1px var(--rule-on)",
      width: "100%",
      maxWidth: 560,
      overflow: "hidden",
      animation: "revealUp .3s var(--ease-out-quart) both"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "16px 18px",
      borderBottom: "1px solid var(--rule-on)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "7",
    r: "5",
    stroke: "var(--volt)",
    strokeWidth: "1.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m11 11 3 3",
    stroke: "var(--volt)",
    strokeWidth: "1.4",
    strokeLinecap: "round"
  })), /*#__PURE__*/React.createElement("input", {
    autoFocus: true,
    placeholder: "Rechercher une page, une fiche, une action\u2026",
    value: q,
    onChange: e => setQ(e.target.value),
    onKeyDown: onKeyDown,
    style: {
      flex: 1,
      border: 0,
      outline: 0,
      fontFamily: "var(--font-sans)",
      fontSize: 15,
      color: "var(--ink)",
      background: "transparent"
    }
  }), q && /*#__PURE__*/React.createElement("button", {
    onClick: () => setQ(""),
    "aria-label": "Effacer",
    style: {
      background: "transparent",
      border: 0,
      cursor: "pointer",
      color: "var(--muted)",
      fontSize: 16,
      lineHeight: 1,
      padding: 2
    }
  }, "\xD7"), /*#__PURE__*/React.createElement("kbd", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      color: "var(--muted)",
      padding: "3px 6px",
      border: "1px solid var(--rule-on)",
      borderRadius: 3,
      background: "var(--card-2)"
    }
  }, "ESC")), /*#__PURE__*/React.createElement("div", {
    ref: listRef,
    style: {
      maxHeight: 340,
      overflow: "auto"
    }
  }, filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 28,
      fontSize: 13,
      color: "var(--muted)",
      textAlign: "center"
    }
  }, "Aucun r\xE9sultat pour ", /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--ink)"
    }
  }, "\"", q, "\""), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 6
    }
  }, "Essayez \xAB simulateur \xBB, \xAB mat\xE9riel \xBB ou \xAB cookies \xBB.")) : filtered.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: c.label,
    onMouseEnter: () => setSel(i),
    onClick: () => run(c),
    style: {
      padding: "11px 18px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: i === sel ? "var(--card-2)" : "transparent",
      borderLeft: i === sel ? "2px solid var(--volt)" : "2px solid transparent",
      cursor: "pointer",
      transition: "background .12s"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 9,
      padding: "3px 6px",
      borderRadius: 3,
      background: kindBg(c.kind),
      color: kindFg(c.kind),
      textTransform: "uppercase",
      letterSpacing: ".06em",
      flexShrink: 0
    }
  }, c.kind), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--ink)",
      flex: 1,
      lineHeight: 1.3
    }
  }, c.label), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--muted)"
    }
  }, c.desc), i === sel && /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--volt)"
    }
  }, "\u21B5")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      padding: "10px 18px",
      background: "var(--card-2)",
      borderTop: "1px solid var(--rule-on)",
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      color: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u2191 \u2193 naviguer"), /*#__PURE__*/React.createElement("span", null, "\u21B5 ouvrir"), /*#__PURE__*/React.createElement("span", null, "esc fermer"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto"
    }
  }, filtered.length, " / ", COMMANDS.length, " r\xE9sultats")));
};
function kindBg(k) {
  return {
    page: "var(--volt-soft)",
    fiche: "var(--sky-soft)",
    action: "rgba(201,122,26,0.15)",
    legal: "var(--card-3)",
    dossier: "rgba(46,139,87,0.15)",
    secteur: "var(--card-3)"
  }[k] || "var(--card-3)";
}
function kindFg(k) {
  return {
    page: "var(--volt-deep)",
    fiche: "var(--volt-deep)",
    action: "var(--st-controle)",
    legal: "var(--bone-soft)",
    dossier: "var(--st-valide)",
    secteur: "var(--bone-soft)"
  }[k] || "var(--bone-soft)";
}

// ──────────────────────────────────────────────────────────────
// PostalAutoFill — type a code postal, watch zone/secteur cascade in
// ──────────────────────────────────────────────────────────────
const POSTAL_DB = {
  "75001": {
    ville: "Paris",
    zone: "H1",
    region: "Île-de-France",
    lat: "Tertiaire dominant"
  },
  "13001": {
    ville: "Marseille",
    zone: "H3",
    region: "Provence-Alpes-Côte d'Azur",
    lat: "Résidentiel · tertiaire"
  },
  "33000": {
    ville: "Bordeaux",
    zone: "H2",
    region: "Nouvelle-Aquitaine",
    lat: "Résidentiel"
  },
  "59000": {
    ville: "Lille",
    zone: "H1",
    region: "Hauts-de-France",
    lat: "Industrie · résidentiel"
  },
  "69001": {
    ville: "Lyon",
    zone: "H1",
    region: "Auvergne-Rhône-Alpes",
    lat: "Tertiaire · résidentiel"
  },
  "44000": {
    ville: "Nantes",
    zone: "H2",
    region: "Pays de la Loire",
    lat: "Résidentiel"
  },
  "67000": {
    ville: "Strasbourg",
    zone: "H1",
    region: "Grand Est",
    lat: "Résidentiel · tertiaire"
  }
};
const PostalAutoFill = () => {
  const [code, setCode] = React.useState("");
  const match = POSTAL_DB[code];
  const [pulse, setPulse] = React.useState(0);
  React.useEffect(() => {
    if (match) setPulse(p => p + 1);
  }, [match]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--card)",
      border: "1px solid var(--rule-on)",
      borderRadius: 6,
      padding: 28,
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, "Outil \xB7 pr\xE9-saisie"), /*#__PURE__*/React.createElement("div", {
    className: "serif",
    style: {
      fontSize: 24,
      color: "var(--ink)",
      marginTop: 6
    }
  }, "Code postal intelligent")), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--volt)"
    }
  }, "\u25CF ", Object.keys(POSTAL_DB).length, " codes index\xE9s")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, "Code postal du b\xE9n\xE9ficiaire"), /*#__PURE__*/React.createElement("input", {
    value: code,
    onChange: e => setCode(e.target.value.replace(/\D/g, "").slice(0, 5)),
    placeholder: "Essayez 75001, 13001, 67000\u2026",
    style: {
      background: "var(--card-2)",
      border: `1px solid ${match ? "var(--volt)" : "var(--rule-on)"}`,
      padding: "16px 18px",
      fontFamily: "var(--font-mono)",
      fontSize: 22,
      color: "var(--ink)",
      outline: 0,
      letterSpacing: ".12em",
      transition: "border-color .25s"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 12
    }
  }, [{
    k: "Ville",
    v: match?.ville,
    delay: 0
  }, {
    k: "Zone climatique",
    v: match?.zone,
    delay: 0.12,
    accent: true
  }, {
    k: "Région",
    v: match?.region,
    delay: 0.24
  }].map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: f.k,
    style: {
      background: match ? "var(--card-2)" : "var(--card-3)",
      border: "1px solid var(--rule-on)",
      padding: "10px 12px",
      borderRadius: 4,
      transition: `all .35s var(--ease-out-quart) ${f.delay}s`,
      transform: match ? "translateY(0)" : "translateY(6px)",
      opacity: match ? 1 : 0.35
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)",
      fontSize: 10
    }
  }, f.k), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 14,
      color: f.accent ? "var(--volt)" : "var(--ink)",
      marginTop: 4,
      minHeight: 18
    }
  }, f.v || "—")))), match && /*#__PURE__*/React.createElement("div", {
    key: pulse,
    style: {
      marginTop: 14,
      padding: "10px 14px",
      background: "var(--volt-soft)",
      borderLeft: "3px solid var(--volt)",
      fontSize: 12,
      color: "var(--volt-deep)",
      animation: "revealUp .4s var(--ease-out-quart) both"
    }
  }, "\u21B3 ", /*#__PURE__*/React.createElement("strong", null, "Profil dominant d\xE9tect\xE9"), " : ", match.lat, ". Pr\xE9-s\xE9lection automatique des fiches d'op\xE9ration correspondantes."));
};

// ──────────────────────────────────────────────────────────────
// ComparisonSlider — drag a divider to compare two prime simulations
// ──────────────────────────────────────────────────────────────
const ComparisonSlider = () => {
  const ref = React.useRef(null);
  const [pos, setPos] = React.useState(0.55);
  const onMove = e => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    setPos(Math.max(0.08, Math.min(0.92, x / r.width)));
  };
  const onDown = () => {
    const move = e => onMove(e);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
  const A = {
    label: "Standard",
    prime: 2847,
    cumac: 312480,
    ducacheck: "Profil neutre"
  };
  const B = {
    label: "Précaire",
    prime: 5980,
    cumac: 656690,
    ducacheck: "Bonification"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--card)",
      border: "1px solid var(--rule-on)",
      borderRadius: 6,
      padding: 28,
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, "Outil \xB7 comparateur"), /*#__PURE__*/React.createElement("div", {
    className: "serif",
    style: {
      fontSize: 24,
      color: "var(--ink)",
      marginTop: 6
    }
  }, "Glissez pour comparer")), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--muted)"
    }
  }, "Std \u2194 Pr\xE9caire")), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    onMouseDown: onDown,
    style: {
      position: "relative",
      height: 180,
      background: "var(--card-2)",
      borderRadius: 4,
      overflow: "hidden",
      cursor: "ew-resize",
      userSelect: "none"
    }
  }, /*#__PURE__*/React.createElement(PrimePanel, {
    data: B,
    accent: "var(--volt-deep)",
    side: "B"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      width: `${pos * 100}%`,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(PrimePanel, {
    data: A,
    accent: "var(--ink)",
    side: "A",
    full: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: `${pos * 100}%`,
      width: 2,
      background: "var(--volt)",
      transform: "translateX(-1px)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: "var(--card)",
      border: "2px solid var(--volt)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 12px -2px rgba(10,31,61,.18)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "10",
    viewBox: "0 0 14 10",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 1L1 5l4 4M9 1l4 4-4 4",
    stroke: "var(--volt)",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 14,
      fontSize: 11,
      color: "var(--muted)"
    },
    className: "mono"
  }, /*#__PURE__*/React.createElement("span", null, "\u2190 ", A.label), /*#__PURE__*/React.createElement("span", null, B.label, " \u2192")));
};
const PrimePanel = ({
  data,
  accent,
  side,
  full
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    inset: 0,
    background: side === "A" ? "var(--card)" : "var(--card-2)",
    padding: "20px 24px",
    width: full ? "100%" : "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: accent
  }
}, side === "A" ? "Option A" : "Option B", " \xB7 ", data.label), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    marginTop: 8
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "serif",
  style: {
    fontSize: 48,
    color: accent,
    lineHeight: 0.95,
    letterSpacing: "-0.03em",
    fontWeight: 500
  }
}, new Intl.NumberFormat("fr-FR").format(data.prime)), /*#__PURE__*/React.createElement("span", {
  className: "serif",
  style: {
    fontSize: 24,
    color: accent,
    fontWeight: 500
  }
}, "\u20AC"))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    color: "var(--muted)"
  },
  className: "mono"
}, /*#__PURE__*/React.createElement("span", null, "cumac \xB7 ", new Intl.NumberFormat("fr-FR").format(data.cumac)), /*#__PURE__*/React.createElement("span", null, data.ducacheck)));

// ──────────────────────────────────────────────────────────────
// UX Tools card — single artboard showcasing all tools
// ──────────────────────────────────────────────────────────────
const UXToolsCard = () => {
  const [toasts, setToasts] = React.useState([]);
  const addToast = (kind, title, detail) => {
    const id = Math.random();
    setToasts(t => [...t, {
      id,
      kind,
      title,
      detail
    }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: pageBg("900px")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 48,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, "Outils UX int\xE9gr\xE9s"), /*#__PURE__*/React.createElement("div", {
    className: "serif",
    style: {
      fontSize: 36,
      lineHeight: 1.1,
      marginTop: 8
    }
  }, "Quatre outils, partout dans le produit")), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--muted)"
    }
  }, "tous interactifs \xB7 cliquez \xB7 tapez")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--volt)"
    }
  }, "01 \xB7 Command Palette \u2318K"), /*#__PURE__*/React.createElement(CommandPalette, {
    embedded: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--volt)"
    }
  }, "02 \xB7 Code postal intelligent"), /*#__PURE__*/React.createElement(PostalAutoFill, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--volt)"
    }
  }, "03 \xB7 Comparateur de primes"), /*#__PURE__*/React.createElement(ComparisonSlider, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--volt)"
    }
  }, "04 \xB7 Toasts & Tooltips"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--card)",
      border: "1px solid var(--rule-on)",
      borderRadius: 6,
      padding: 28,
      position: "relative",
      overflow: "hidden",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(ToastStack, {
    toasts: toasts
  }), /*#__PURE__*/React.createElement("div", {
    className: "serif",
    style: {
      fontSize: 18,
      color: "var(--ink)"
    }
  }, "Feedback temps r\xE9el"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--muted)",
      lineHeight: 1.55,
      margin: 0
    }
  }, "Chaque action d\xE9clenche un toast localis\xE9. Survolez", " ", /*#__PURE__*/React.createElement(Tooltip, {
    content: "BAR-EN-101 : fiche d'op\xE9ration CEE pour l'isolation des combles perdus en secteur r\xE9sidentiel."
  }, "BAR-EN-101"), " ", "ou", " ", /*#__PURE__*/React.createElement(Tooltip, {
    content: "kWh cumac = kilowattheure cumul\xE9 et actualis\xE9 sur la dur\xE9e de vie de l'op\xE9ration. Unit\xE9 officielle CEE."
  }, "cumac"), " ", "pour lire la d\xE9finition."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginTop: "auto"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => addToast("success", "Pièce déposée", "Attestation sur l'honneur · signée"),
    style: toastBtn()
  }, "+ succ\xE8s"), /*#__PURE__*/React.createElement("button", {
    onClick: () => addToast("warn", "Contrôle planifié", "Auditeur · 14h le 22/05"),
    style: toastBtn()
  }, "+ contr\xF4le"), /*#__PURE__*/React.createElement("button", {
    onClick: () => addToast("info", "Prime estimée mise à jour", "2 847 € → 3 120 €"),
    style: toastBtn()
  }, "+ info")))))));
};
function toastBtn() {
  return {
    background: "var(--card-2)",
    color: "var(--ink)",
    border: "1px solid var(--rule-on)",
    padding: "8px 12px",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    cursor: "pointer",
    letterSpacing: ".06em",
    textTransform: "uppercase",
    borderRadius: 3
  };
}
Object.assign(window, {
  Tooltip,
  ToastStack,
  CommandPalette,
  PostalAutoFill,
  ComparisonSlider,
  UXToolsCard
});