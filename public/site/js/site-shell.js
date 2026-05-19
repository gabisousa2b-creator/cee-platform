/* eslint-disable */
// EchoWAI — Site shell (TopNav, Footer, Cmd+K modal, Toast host)

// ─────────────────────────────────────────────────────────
// Site Top Nav — sticky, navigates between views
// ─────────────────────────────────────────────────────────
const SiteNav = ({
  current,
  onNavigate,
  onCmdK
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
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
      background: "rgba(236,239,245,0.86)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--rule-on)"
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
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "primary",
    arrow: true,
    onClick: () => go("beneficiaire")
  }, "Acc\xE9der \xE0 mon dossier")), /*#__PURE__*/React.createElement("button", {
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
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "primary",
    arrow: true,
    full: true,
    onClick: () => go("beneficiaire")
  }, "Acc\xE9der \xE0 mon dossier"), /*#__PURE__*/React.createElement(Btn, {
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
    l: "Partenaire",
    to: "beneficiaire"
  }, {
    l: "Administration",
    to: "beneficiaire"
  }],
  onNavigate: onNavigate
}), /*#__PURE__*/React.createElement(FooterCol, {
  title: "L\xE9gal",
  links: [{
    l: "Mentions légales",
    to: "contact"
  }, {
    l: "CGU",
    to: "contact"
  }, {
    l: "Confidentialité",
    to: "contact"
  }, {
    l: "Contact",
    to: "contact"
  }],
  onNavigate: onNavigate
})), /*#__PURE__*/React.createElement("div", {
  style: {
    borderTop: "1px solid rgba(255,255,255,.1)",
    paddingTop: 28,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 12,
    color: "rgba(255,255,255,.5)"
  }
}, "EchoWAI \xA9 2026 \u2014 Certificats d'\xC9conomies d'\xC9nergie \xB7 Tous droits r\xE9serv\xE9s"), /*#__PURE__*/React.createElement("span", {
  className: "mono",
  style: {
    fontSize: 11,
    color: "rgba(255,255,255,.5)"
  }
}, "contact@echowai.com"))));
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
  }, /*#__PURE__*/React.createElement(CommandPalette, null)));
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
Object.assign(window, {
  SiteNav,
  SiteFooter,
  CmdKModal,
  ToastContext,
  ToastProvider,
  useToast,
  useCmdK,
  FooterCol
});