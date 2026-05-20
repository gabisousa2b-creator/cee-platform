/* eslint-disable */
// EchoWAI — Site shell (TopNav, Footer, Cmd+K modal, Toast host, Cookies)

// Login portal URL — compte.echowai.com in prod, /compte.html in dev
function loginUrl() {
  var h = (typeof location !== "undefined" ? location.hostname : "").toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || /^192\.168\./.test(h) || /^10\./.test(h)) return "/compte.html";
  return "https://compte.echowai.com/";
}
function goLogin() {
  window.location.href = loginUrl();
}

// ─────────────────────────────────────────────────────────
// Liste des espaces visibles dans le menu « Votre espace »
// ─────────────────────────────────────────────────────────
const SITE_SPACES = [
  { id: "mandataire",   label: "Mandataire",   sub: "Apporteurs, dépôt de dossiers, équipe",                href: null,             ico: "M19 14h-2v-2h2v2zm0-4h-2V8h2v2zm-4 4h-2v-2h2v2zm0-4h-2V8h2v2zm-4 4H9v-2h2v2zm0-4H9V8h2v2zM7 14H5v-2h2v2zm0-4H5V8h2v2zM3 4v16h18V4H3z" },
  { id: "oblige",       label: "Obligé",       sub: "Validation des primes CEE",                            href: "/oblige",        ico: "M12 2L2 7l10 5 10-5-10-5zm0 8L2 5v6l10 5 10-5V5l-10 5z" },
  { id: "delegataire",  label: "Délégataire",  sub: "Suivi des dossiers confiés",                           href: "/delegataire",   ico: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "beneficiaire", label: "Bénéficiaire", sub: "Suivi de votre dossier",                               href: "/beneficiaire",  ico: "M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" },
];

// SpaceMenu — bouton « Votre espace » + dropdown élégant qui liste les profils.
// Comportement : ouvre au clic ET au hover (delay sortie 180 ms pour confort).
const SpaceMenu = ({ compact = false }) => {
  const [open, setOpen] = React.useState(false);
  const closeT = React.useRef(null);
  const onEnter = () => { if (closeT.current) clearTimeout(closeT.current); setOpen(true); };
  const onLeave = () => { closeT.current = setTimeout(() => setOpen(false), 180); };
  React.useEffect(() => {
    function onDoc(e) { if (!e.target.closest || !e.target.closest("[data-space-menu]")) setOpen(false); }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);
  const go = (s) => {
    setOpen(false);
    if (!s.href) return goLogin();
    window.location.href = s.href;
  };
  return /*#__PURE__*/React.createElement("span", {
    "data-space-menu": "true",
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    style: { position: "relative", display: "inline-block" }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    "aria-haspopup": "menu",
    "aria-expanded": open,
    style: {
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "var(--volt)", color: "#fff",
      border: 0, borderRadius: 999,
      padding: compact ? "10px 16px" : "11px 18px",
      fontFamily: "var(--font-display)",
      fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em",
      cursor: "pointer",
      boxShadow: open ? "0 12px 32px -8px rgba(46,126,244,.42)" : "0 6px 18px -6px rgba(46,126,244,.32)",
      transition: "transform .25s var(--ease-out-quart), box-shadow .25s ease, background .25s ease",
      transform: open ? "translateY(-1px)" : "translateY(0)",
    }
  },
    /*#__PURE__*/React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true },
      /*#__PURE__*/React.createElement("path", { d: "M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z", fill: "currentColor", opacity: 0.95 })
    ),
    /*#__PURE__*/React.createElement("span", null, "Votre espace"),
    /*#__PURE__*/React.createElement("svg", {
      width: 11, height: 11, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true,
      style: { transition: "transform .25s ease", transform: open ? "rotate(180deg)" : "rotate(0)" }
    }, /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6 6-6", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }))
  ),
  open && /*#__PURE__*/React.createElement("div", {
    role: "menu",
    style: {
      position: "absolute", top: "calc(100% + 10px)", right: 0,
      minWidth: 296, padding: 8,
      background: "var(--card)",
      border: "1px solid var(--rule-on)",
      borderRadius: 12,
      boxShadow: "0 32px 80px -28px rgba(10,31,61,.30), 0 8px 24px -10px rgba(10,31,61,.18)",
      zIndex: 60,
      animation: "spaceMenuRise .22s var(--ease-out-quart) both",
    }
  },
    /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".12em",
        color: "var(--muted)", textTransform: "uppercase",
        padding: "8px 12px 6px",
      }
    }, "Choisissez votre profil"),
    SITE_SPACES.map(s => /*#__PURE__*/React.createElement("button", {
      key: s.id,
      role: "menuitem",
      onClick: () => go(s),
      style: {
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", padding: "11px 12px",
        background: "transparent", border: 0, borderRadius: 8,
        cursor: "pointer", textAlign: "left",
        transition: "background .15s ease, transform .15s ease",
        color: "var(--ink)",
      },
      onMouseEnter: (e) => { e.currentTarget.style.background = "var(--card-2)"; e.currentTarget.style.transform = "translateX(2px)"; },
      onMouseLeave: (e) => { e.currentTarget.style.background = "transparent";   e.currentTarget.style.transform = "translateX(0)"; }
    },
      /*#__PURE__*/React.createElement("span", {
        style: {
          flex: "0 0 36px", width: 36, height: 36, borderRadius: 8,
          background: "var(--volt-glow)", color: "var(--volt)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }
      }, /*#__PURE__*/React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true },
          /*#__PURE__*/React.createElement("path", { d: s.ico, fill: s.id === "delegataire" ? "none" : "currentColor", stroke: s.id === "delegataire" ? "currentColor" : "none", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }))),
      /*#__PURE__*/React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 } },
        /*#__PURE__*/React.createElement("span", { style: { fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 500, letterSpacing: "-0.01em" } }, s.label),
        /*#__PURE__*/React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--bone-soft)" } }, s.sub)
      ),
      /*#__PURE__*/React.createElement("span", { style: { marginLeft: "auto", color: "var(--bone-mute)", fontSize: 14 } }, "→")
    ))
  ));
};
// Keyframe pour l'apparition du menu
if (typeof document !== "undefined" && !document.getElementById("space-menu-kf")) {
  const _kf = document.createElement("style");
  _kf.id = "space-menu-kf";
  _kf.textContent = "@keyframes spaceMenuRise { from { opacity: 0; transform: translateY(-6px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }";
  document.head.appendChild(_kf);
}

// ─────────────────────────────────────────────────────────
// Site Top Nav — sticky, navigates between views
// ─────────────────────────────────────────────────────────
const SiteNav = ({
  current,
  onNavigate,
  onCmdK
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [{
    id: "dispositif",
    label: "Le dispositif"
  }, {
    id: "simulateur",
    label: "Simulateur"
  }, {
    id: "materiel",
    label: "Matériel"
  }, {
    id: "beneficiaire",
    label: "Espaces"
  }, {
    id: "contact",
    label: "Contact"
  }];
  const go = id => {
    setMobileOpen(false);
    onNavigate(id);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 40,
      background: scrolled ? "rgba(236,239,245,0.92)" : "rgba(236,239,245,0.80)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--rule-on)",
      boxShadow: scrolled ? "0 10px 30px -22px rgba(10,31,61,.45)" : "none",
      transition: "background .3s var(--ease-out-quart), box-shadow .3s var(--ease-out-quart)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "site-nav-inner",
    style: {
      maxWidth: 1320,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => go("home"),
    style: {
      background: "transparent",
      border: 0,
      padding: 0,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    scale: 0.85
  })), /*#__PURE__*/React.createElement("nav", {
    className: "nav-links",
    style: {
      fontSize: 14,
      color: "var(--muted)"
    }
  }, links.map(l => /*#__PURE__*/React.createElement("button", {
    key: l.id,
    onClick: () => go(l.id),
    style: {
      background: "transparent",
      border: 0,
      cursor: "pointer",
      padding: "4px 0",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: current === l.id ? "var(--ink)" : "var(--muted)",
      fontWeight: current === l.id ? 500 : 400,
      borderBottom: current === l.id ? "1px solid var(--volt)" : "1px solid transparent",
      transition: "all .2s var(--ease-out-quart)"
    }
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onCmdK,
    title: "Rechercher (\u2318K)",
    className: "hide-on-mobile",
    style: {
      background: "var(--card)",
      border: "1px solid var(--rule-on)",
      padding: "7px 10px 7px 12px",
      borderRadius: 4,
      display: "flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 12,
      color: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "7",
    r: "5",
    stroke: "currentColor",
    strokeWidth: "1.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m11 11 3 3",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round"
  })), /*#__PURE__*/React.createElement("span", null, "Rechercher"), /*#__PURE__*/React.createElement("kbd", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      padding: "2px 5px",
      border: "1px solid var(--rule-on)",
      borderRadius: 3,
      background: "var(--card-2)"
    }
  }, "\u2318K")), /*#__PURE__*/React.createElement("span", {
    className: "hide-on-mobile"
  }, /*#__PURE__*/React.createElement(SpaceMenu, null)), /*#__PURE__*/React.createElement("button", {
    onClick: onCmdK,
    className: "only-on-mobile",
    "aria-label": "Rechercher",
    style: {
      background: "var(--card)",
      border: "1px solid var(--rule-on)",
      width: 40,
      height: 40,
      borderRadius: 4,
      cursor: "pointer",
      display: "none",
      alignItems: "center",
      justifyContent: "center"
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
    stroke: "var(--ink)",
    strokeWidth: "1.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m11 11 3 3",
    stroke: "var(--ink)",
    strokeWidth: "1.4",
    strokeLinecap: "round"
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setMobileOpen(!mobileOpen),
    className: "only-on-mobile",
    "aria-label": "Menu",
    style: {
      background: "var(--card)",
      border: "1px solid var(--rule-on)",
      width: 40,
      height: 40,
      borderRadius: 4,
      cursor: "pointer",
      display: "none",
      alignItems: "center",
      justifyContent: "center"
    }
  }, mobileOpen ? /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 3l10 10M13 3L3 13",
    stroke: "var(--ink)",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "14",
    viewBox: "0 0 18 14"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 1h18M0 7h18M0 13h18",
    stroke: "var(--ink)",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  })))))), mobileOpen && /*#__PURE__*/React.createElement("div", {
    className: "mobile-drawer"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 18,
      left: 20,
      right: 20,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    scale: 0.85
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setMobileOpen(false),
    "aria-label": "Fermer",
    style: {
      background: "var(--card)",
      border: "1px solid var(--rule-on)",
      width: 40,
      height: 40,
      borderRadius: 4,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 16 16"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 3l10 10M13 3L3 13",
    stroke: "var(--ink)",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  })))), /*#__PURE__*/React.createElement("nav", null, /*#__PURE__*/React.createElement("button", {
    onClick: () => go("home"),
    style: {
      color: current === "home" ? "var(--volt)" : "var(--ink)"
    }
  }, "Accueil"), links.map(l => /*#__PURE__*/React.createElement("button", {
    key: l.id,
    onClick: () => go(l.id),
    style: {
      color: current === l.id ? "var(--volt)" : "var(--ink)"
    }
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    className: "mobile-drawer-actions"
  },
    SITE_SPACES.map(s => /*#__PURE__*/React.createElement("button", {
      key: s.id,
      onClick: () => { setMobileOpen(false); if (s.href) window.location.href = s.href; else goLogin(); },
      style: {
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        background: "var(--card-2)", border: "1px solid var(--rule-on)",
        borderRadius: 10, padding: "12px 14px",
        fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 500,
        color: "var(--ink)", cursor: "pointer", textAlign: "left",
      }
    },
      /*#__PURE__*/React.createElement("span", {
        style: { width: 32, height: 32, borderRadius: 6, background: "var(--volt-glow)", color: "var(--volt)",
          display: "inline-flex", alignItems: "center", justifyContent: "center" }
      }, /*#__PURE__*/React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24" },
          /*#__PURE__*/React.createElement("path", { d: s.ico, fill: s.id === "delegataire" ? "none" : "currentColor", stroke: s.id === "delegataire" ? "currentColor" : "none", strokeWidth: "2" }))),
      /*#__PURE__*/React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2 } },
        /*#__PURE__*/React.createElement("span", null, "Espace " + s.label.toLowerCase()),
        /*#__PURE__*/React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--bone-soft)" } }, s.sub)
      )
    )),
    /*#__PURE__*/React.createElement(Btn, {
      variant: "secondary",
      arrow: true,
      full: true,
      onClick: () => go("simulateur")
    }, "Simuler ma prime"))));
};

// ─────────────────────────────────────────────────────────
// Site Footer
// ─────────────────────────────────────────────────────────
const SiteFooter = ({
  onNavigate
}) => /*#__PURE__*/React.createElement("footer", {
  style: {
    background: "var(--ink)",
    color: "var(--bone-2)",
    marginTop: 80
  },
  className: "on-ink"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "64px 32px 32px"
  },
  className: "r-padbox"
}, /*#__PURE__*/React.createElement("div", {
  className: "r-cols-footer",
  style: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    gap: 40,
    marginBottom: 56
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Wordmark, {
  scale: 1.1,
  color: "#FFFFFF",
  accent: "var(--volt)"
}), /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "rgba(255,255,255,.65)",
    maxWidth: 320,
    marginTop: 18
  }
}, "Plateforme de gestion des Certificats d'\xC9conomies d'\xC9nergie \u2014 simulation, dossiers, commande mat\xE9riel et suivi."), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    padding: "8px 12px",
    background: "rgba(255,255,255,.06)",
    borderRadius: 4,
    width: "fit-content"
  }
}, /*#__PURE__*/React.createElement("svg", {
  width: "12",
  height: "14",
  viewBox: "0 0 12 14",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M6 1 1 3v5c0 2.5 2 4.5 5 5 3-.5 5-2.5 5-5V3L6 1Z",
  stroke: "var(--volt)",
  strokeWidth: "1.2",
  strokeLinejoin: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 7l1.5 1.5L8 5.5",
  stroke: "var(--volt)",
  strokeWidth: "1.4",
  strokeLinecap: "round"
})), /*#__PURE__*/React.createElement("span", {
  className: "mono",
  style: {
    fontSize: 11,
    color: "var(--volt)"
  }
}, "D\xE9p\xF4t de pi\xE8ces s\xE9curis\xE9"))), /*#__PURE__*/React.createElement(FooterCol, {
  title: "Plateforme",
  links: [{
    l: "Le dispositif",
    to: "dispositif"
  }, {
    l: "Simulateur",
    to: "simulateur"
  }, {
    l: "Matériel",
    to: "materiel"
  }, {
    l: "Tarifs",
    to: "contact"
  }],
  onNavigate: onNavigate
}), /*#__PURE__*/React.createElement(FooterCol, {
  title: "Espaces",
  links: [{
    l: "Bénéficiaire",
    to: "beneficiaire"
  }, {
    l: "Espace partenaire",
    to: "login"
  }, {
    l: "Administration",
    to: "login"
  }],
  onNavigate: onNavigate
}), /*#__PURE__*/React.createElement(FooterCol, {
  title: "L\xE9gal",
  links: [{
    l: "Mentions légales",
    to: "mentions"
  }, {
    l: "CGU",
    to: "cgu"
  }, {
    l: "Confidentialité",
    to: "confidentialite"
  }, {
    l: "Gestion des cookies",
    to: "cookies"
  }],
  onNavigate: onNavigate
})), /*#__PURE__*/React.createElement("div", {
  className: "footer-bottom",
  style: {
    borderTop: "1px solid rgba(255,255,255,.1)",
    paddingTop: 28,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 12,
    color: "rgba(255,255,255,.5)"
  }
}, "EchoWAI \xA9 2026 \u2014 Certificats d'\xC9conomies d'\xC9nergie \xB7 Tous droits r\xE9serv\xE9s"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 18,
    alignItems: "center",
    flexWrap: "wrap"
  }
}, [{
  l: "Mentions légales",
  to: "mentions"
}, {
  l: "CGU",
  to: "cgu"
}, {
  l: "Confidentialité",
  to: "confidentialite"
}, {
  l: "Cookies",
  to: "cookies"
}].map(x => /*#__PURE__*/React.createElement("button", {
  key: x.to,
  onClick: () => onNavigate(x.to),
  style: {
    background: "transparent",
    border: 0,
    padding: 0,
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    color: "rgba(255,255,255,.5)"
  },
  onMouseEnter: e => e.currentTarget.style.color = "var(--volt)",
  onMouseLeave: e => e.currentTarget.style.color = "rgba(255,255,255,.5)"
}, x.l)), /*#__PURE__*/React.createElement("span", {
  className: "mono",
  style: {
    fontSize: 11,
    color: "rgba(255,255,255,.5)"
  }
}, "contact@echowai.com")))));
const FooterCol = ({
  title,
  links,
  onNavigate
}) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--volt)",
    marginBottom: 16
  }
}, title), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  }
}, links.map(l => /*#__PURE__*/React.createElement("button", {
  key: l.l,
  onClick: () => onNavigate(l.to),
  style: {
    background: "transparent",
    border: 0,
    padding: 0,
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "rgba(255,255,255,.75)",
    textAlign: "left",
    transition: "color .2s"
  },
  onMouseEnter: e => e.currentTarget.style.color = "var(--volt)",
  onMouseLeave: e => e.currentTarget.style.color = "rgba(255,255,255,.75)"
}, l.l))));

// ─────────────────────────────────────────────────────────
// Cmd+K Modal — full overlay with palette
// ─────────────────────────────────────────────────────────
const CmdKModal = ({
  open,
  onClose,
  onNavigate
}) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 80,
      background: "rgba(10,31,61,0.4)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingTop: 120,
      animation: "revealUp .25s var(--ease-out-quart) both"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "92%",
      maxWidth: 600
    }
  }, /*#__PURE__*/React.createElement(CommandPalette, {
    onNavigate: onNavigate,
    onClose: onClose
  })));
};

// ─────────────────────────────────────────────────────────
// Toast Host — globally accessible
// ─────────────────────────────────────────────────────────
const ToastContext = React.createContext(null);
const ToastProvider = ({
  children
}) => {
  const [toasts, setToasts] = React.useState([]);
  const push = (kind, title, detail) => {
    const id = Math.random();
    setToasts(t => [...t, {
      id,
      kind,
      title,
      detail
    }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  };
  return /*#__PURE__*/React.createElement(ToastContext.Provider, {
    value: {
      push
    }
  }, children, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      top: 84,
      right: 24,
      zIndex: 70,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement(ToastStack, {
    toasts: toasts
  })));
};
const useToast = () => React.useContext(ToastContext);

// Global keyboard shortcut for Cmd+K
const useCmdK = cb => {
  React.useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        cb();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cb]);
};

// ─────────────────────────────────────────────────────────
// Cookie consent — RGPD banner + preference manager
// ─────────────────────────────────────────────────────────
const COOKIE_KEY = "ew_cookie_consent_v1";
function readConsent() {
  try {
    return JSON.parse(localStorage.getItem(COOKIE_KEY) || "null");
  } catch (e) {
    return null;
  }
}
function writeConsent(c) {
  try {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({
      ...c,
      ts: Date.now()
    }));
  } catch (e) {}
}
const CookieBanner = ({
  onNavigate
}) => {
  const [visible, setVisible] = React.useState(false);
  const [custom, setCustom] = React.useState(false);
  const [analytics, setAnalytics] = React.useState(true);
  const [prefs, setPrefs] = React.useState(true);
  React.useEffect(() => {
    if (!readConsent()) setVisible(true);
    window.EWCookies = {
      open: () => {
        const c = readConsent();
        if (c) {
          setAnalytics(!!c.analytics);
          setPrefs(!!c.prefs);
        }
        setCustom(true);
        setVisible(true);
      },
      get: readConsent
    };
  }, []);
  if (!visible) return null;
  const decide = c => {
    writeConsent(c);
    setVisible(false);
    setCustom(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "cookie-banner",
    style: {
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 90,
      display: "flex",
      justifyContent: "center",
      padding: 16,
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      pointerEvents: "auto",
      width: "100%",
      maxWidth: 880,
      background: "var(--card)",
      border: "1px solid var(--rule-on)",
      borderRadius: 10,
      boxShadow: "0 28px 70px -20px rgba(10,31,61,.4)",
      overflow: "hidden",
      animation: "revealUp .45s var(--ease-out-quart) both"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: 3,
      background: "var(--volt)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "22px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "8",
    r: "6.5",
    stroke: "var(--volt)",
    strokeWidth: "1.3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "6.5",
    r: "1",
    fill: "var(--volt)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "9",
    r: "1.1",
    fill: "var(--volt)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6.5",
    cy: "10.5",
    r: ".8",
    fill: "var(--volt)"
  })), /*#__PURE__*/React.createElement("span", {
    className: "upper",
    style: {
      color: "var(--ink)"
    }
  }, "Vos cookies, votre choix")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      lineHeight: 1.6,
      color: "var(--bone-soft)",
      margin: "12px 0 0"
    }
  }, "EchoWAI utilise des cookies strictement n\xE9cessaires au fonctionnement de la plateforme, et \u2014 avec votre accord \u2014 des cookies de mesure d'audience et de pr\xE9f\xE9rences. D\xE9tails dans notre", " ", /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setVisible(false);
      onNavigate && onNavigate("cookies");
    },
    style: {
      background: "transparent",
      border: 0,
      padding: 0,
      cursor: "pointer",
      color: "var(--volt)",
      fontFamily: "var(--font-sans)",
      fontSize: 13.5,
      textDecoration: "underline"
    }
  }, "politique de gestion des cookies"), "."), custom && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(CookieRow, {
    title: "Strictement n\xE9cessaires",
    desc: "Session, s\xE9curit\xE9, \xE9quilibrage de charge. Indispensables \u2014 toujours actifs.",
    locked: true,
    checked: true
  }), /*#__PURE__*/React.createElement(CookieRow, {
    title: "Mesure d'audience",
    desc: "Statistiques de fr\xE9quentation anonymis\xE9es pour am\xE9liorer le service.",
    checked: analytics,
    onToggle: () => setAnalytics(v => !v)
  }), /*#__PURE__*/React.createElement(CookieRow, {
    title: "Pr\xE9f\xE9rences",
    desc: "M\xE9morisation de vos choix d'affichage et de langue.",
    checked: prefs,
    onToggle: () => setPrefs(v => !v)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 18,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "primary",
    onClick: () => decide({
      analytics: true,
      prefs: true
    })
  }, "Tout accepter"), /*#__PURE__*/React.createElement(Btn, {
    variant: "secondary",
    onClick: () => decide({
      analytics: false,
      prefs: false
    })
  }, "Tout refuser"), custom ? /*#__PURE__*/React.createElement(Btn, {
    variant: "secondary",
    onClick: () => decide({
      analytics,
      prefs
    })
  }, "Enregistrer mes choix") : /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => setCustom(true)
  }, "Personnaliser")))));
};
const CookieRow = ({
  title,
  desc,
  checked,
  onToggle,
  locked
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    padding: "12px 14px",
    background: "var(--card-2)",
    border: "1px solid var(--rule-on)",
    borderRadius: 6
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    minWidth: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    color: "var(--ink)",
    fontWeight: 600
  }
}, title), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    color: "var(--muted)",
    marginTop: 3,
    lineHeight: 1.5
  }
}, desc)), /*#__PURE__*/React.createElement("button", {
  onClick: locked ? undefined : onToggle,
  disabled: locked,
  "aria-pressed": !!checked,
  style: {
    flexShrink: 0,
    width: 42,
    height: 24,
    borderRadius: 999,
    border: 0,
    background: checked ? "var(--volt)" : "var(--rule-on)",
    cursor: locked ? "not-allowed" : "pointer",
    opacity: locked ? 0.6 : 1,
    position: "relative",
    transition: "background .2s var(--ease-out-quart)"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    position: "absolute",
    top: 3,
    left: checked ? 21 : 3,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#fff",
    transition: "left .2s var(--ease-out-quart)",
    boxShadow: "0 1px 3px rgba(10,31,61,.3)"
  }
})));
Object.assign(window, {
  SiteNav,
  SiteFooter,
  CmdKModal,
  ToastContext,
  ToastProvider,
  useToast,
  useCmdK,
  FooterCol,
  CookieBanner,
  CookieRow,
  loginUrl,
  goLogin
});