function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* eslint-disable */
// EchoWAI — Components (Voltage)

const Btn = ({
  children,
  variant = "primary",
  arrow = false,
  full,
  magnetic,
  ...rest
}) => {
  const base = {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    padding: "12px 18px",
    border: 0,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    transition: "all .18s var(--ease-out-quart)",
    textDecoration: "none",
    letterSpacing: "-0.005em",
    lineHeight: 1,
    width: full ? "100%" : "auto",
    justifyContent: "center",
    borderRadius: 4
  };
  const variants = {
    primary: {
      background: "var(--volt)",
      color: "#FFFFFF",
      boxShadow: "0 1px 2px rgba(10,31,61,.08), 0 6px 16px -6px rgba(46,126,244,.4)"
    },
    dark: {
      background: "var(--ink)",
      color: "#FFFFFF"
    },
    secondary: {
      background: "var(--card)",
      color: "var(--ink)",
      boxShadow: "inset 0 0 0 1px var(--rule-on)"
    },
    ghost: {
      background: "transparent",
      color: "var(--ink)",
      padding: "12px 4px"
    },
    amber: {
      background: "var(--ink)",
      color: "#FFFFFF"
    },
    link: {
      background: "transparent",
      color: "var(--volt)",
      padding: "8px 0",
      boxShadow: "inset 0 -1px 0 var(--volt)"
    }
  };
  const btn = /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    style: {
      ...base,
      ...variants[variant]
    }
  }), /*#__PURE__*/React.createElement("span", null, children), arrow && /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "10",
    viewBox: "0 0 14 10",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 5h12m0 0L9 1m4 4L9 9",
    stroke: "currentColor",
    strokeWidth: "1.5"
  })));
  return magnetic ? /*#__PURE__*/React.createElement(MagneticBtn, null, btn) : btn;
};
const Pill = ({
  children,
  color = "--st-engage",
  strong
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    textTransform: "uppercase",
    letterSpacing: ".1em",
    padding: "5px 9px 5px 8px",
    background: strong ? `var(${color})` : "transparent",
    color: strong ? "#FFFFFF" : `var(${color})`,
    boxShadow: strong ? "none" : `inset 0 0 0 1px var(${color})`,
    borderRadius: 2,
    whiteSpace: "nowrap"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: strong ? "#FFFFFF" : `var(${color})`
  }
}), children);
const Field = ({
  label,
  value,
  hint,
  mono,
  suffix,
  big,
  focused
}) => /*#__PURE__*/React.createElement("label", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "upper",
  style: {
    color: "var(--muted)"
  }
}, label), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "var(--ink-2)",
    border: `1px solid ${focused ? "var(--volt)" : "var(--rule-on)"}`,
    padding: big ? "16px 18px" : "10px 14px",
    transition: "border-color .15s"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    flex: 1,
    fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
    fontSize: big ? 22 : 15,
    color: "var(--bone)"
  }
}, value), suffix && /*#__PURE__*/React.createElement("span", {
  className: "mono",
  style: {
    color: "var(--muted)",
    fontSize: 13
  }
}, suffix), focused && /*#__PURE__*/React.createElement("span", {
  style: {
    width: 1,
    height: 18,
    background: "var(--volt)",
    animation: "blinkCaret 1s steps(2) infinite"
  }
})), hint && /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 12,
    color: "var(--muted)"
  }
}, hint));
const ComponentsCard = () => /*#__PURE__*/React.createElement("div", {
  style: pageBg("520px")
}, /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 48,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 24
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)"
  }
}, "Composants \xB7 Actions & saisie"), /*#__PURE__*/React.createElement("div", {
  className: "serif",
  style: {
    fontSize: 32,
    lineHeight: 1.1
  }
}, "Vocabulaire d'interface"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 28,
    flex: 1
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)",
    marginBottom: 12
  }
}, "Boutons"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "flex-start"
  }
}, /*#__PURE__*/React.createElement(Btn, {
  variant: "primary",
  arrow: true
}, "Acc\xE9der \xE0 mon dossier"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 10
  }
}, /*#__PURE__*/React.createElement(Btn, {
  variant: "secondary"
}, "Simuler une prime"), /*#__PURE__*/React.createElement(Btn, {
  variant: "amber",
  arrow: true
}, "Commander mat\xE9riel")), /*#__PURE__*/React.createElement(Btn, {
  variant: "ghost"
}, "Annuler"), /*#__PURE__*/React.createElement(Btn, {
  variant: "link"
}, "En savoir plus"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)",
    marginBottom: 12
  }
}, "Statuts (pills)"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 14
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  }
}, /*#__PURE__*/React.createElement(Pill, {
  color: "--st-engage"
}, "Engag\xE9"), /*#__PURE__*/React.createElement(Pill, {
  color: "--st-controle"
}, "Contr\xF4le"), /*#__PURE__*/React.createElement(Pill, {
  color: "--st-valide"
}, "Valid\xE9"), /*#__PURE__*/React.createElement(Pill, {
  color: "--st-facture"
}, "Factur\xE9")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  }
}, /*#__PURE__*/React.createElement(Pill, {
  color: "--st-engage",
  strong: true
}, "Engag\xE9"), /*#__PURE__*/React.createElement(Pill, {
  color: "--st-controle",
  strong: true
}, "Contr\xF4le"), /*#__PURE__*/React.createElement(Pill, {
  color: "--st-valide",
  strong: true
}, "Valid\xE9"), /*#__PURE__*/React.createElement(Pill, {
  color: "--st-facture",
  strong: true
}, "Factur\xE9")), /*#__PURE__*/React.createElement("div", {
  style: {
    height: 1,
    background: "var(--rule-on)",
    margin: "6px 0"
  }
}), /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)",
    marginBottom: 4
  }
}, "Champs de saisie"), /*#__PURE__*/React.createElement(Field, {
  label: "Code dossier",
  value: "ECW-2026-04417",
  mono: true,
  focused: true
}), /*#__PURE__*/React.createElement(Field, {
  label: "Secteur",
  value: "R\xE9sidentiel",
  hint: "6 secteurs disponibles"
}))))));
const OperationCard = ({
  title,
  sector,
  code,
  status,
  color,
  prime
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--card)",
    border: "1px solid var(--rule-on)",
    padding: 22,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    position: "relative",
    overflow: "hidden",
    transition: "all .25s var(--ease-out-quart)"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "mono",
  style: {
    fontSize: 11,
    color: "var(--bone-mute)"
  }
}, code), /*#__PURE__*/React.createElement(Pill, {
  color: color
}, status)), /*#__PURE__*/React.createElement("div", {
  className: "serif",
  style: {
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
    color: "var(--bone)"
  }
}, title), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 12,
    color: "var(--muted)"
  }
}, sector), prime && /*#__PURE__*/React.createElement("span", {
  className: "mono",
  style: {
    fontSize: 14,
    color: "var(--volt)",
    fontWeight: 600
  }
}, prime)));
const CardsCard = () => /*#__PURE__*/React.createElement("div", {
  style: pageBg("480px")
}, /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 48,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 22
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
}, "Composants \xB7 Card d'op\xE9ration"), /*#__PURE__*/React.createElement("div", {
  className: "serif",
  style: {
    fontSize: 32,
    lineHeight: 1.1,
    marginTop: 8
  }
}, "L'unit\xE9 de base")), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    color: "var(--muted)",
    maxWidth: 280,
    textAlign: "right"
  }
}, "Une fiche d'op\xE9ration CEE, trait\xE9e comme un panneau de tableau de bord.")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 18,
    flex: 1
  }
}, /*#__PURE__*/React.createElement(OperationCard, {
  title: "Isolation des combles perdus",
  sector: "R\xE9sidentiel \xB7 pavillon individuel",
  code: "BAR-EN-101",
  status: "Valid\xE9",
  color: "--st-valide",
  prime: "2 847 \u20AC"
}), /*#__PURE__*/React.createElement(OperationCard, {
  title: "R\xE9cup\xE9ration de chaleur sur groupe froid",
  sector: "Industrie \xB7 agroalimentaire",
  code: "IND-UT-117",
  status: "Contr\xF4le",
  color: "--st-controle",
  prime: "18 420 \u20AC"
}), /*#__PURE__*/React.createElement(OperationCard, {
  title: "Pompe \xE0 chaleur sur b\xE2timent d'\xE9levage",
  sector: "Agriculture \xB7 bovin laitier",
  code: "AGRI-TH-116",
  status: "Engag\xE9",
  color: "--st-engage",
  prime: "9 605 \u20AC"
}))));

// MaterialCard — for the ordering catalog
const MaterialCard = ({
  name,
  code,
  unit,
  price,
  leadtime,
  sector,
  qty: initialQty = 0,
  onAdd,
  image
}) => {
  const [qty, setQty] = React.useState(initialQty);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--card)",
      border: "1px solid var(--rule-on)",
      padding: 18,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 120,
      background: "var(--card-3)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundImage: "repeating-linear-gradient(135deg, rgba(10,31,61,0.06) 0 8px, transparent 8px 16px)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--bone-mute)",
      letterSpacing: ".12em",
      textTransform: "uppercase"
    }
  }, image || "photo produit")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--bone-mute)"
    }
  }, code), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--muted)"
    }
  }, sector)), /*#__PURE__*/React.createElement("div", {
    className: "serif",
    style: {
      fontSize: 22,
      lineHeight: 1.15,
      color: "var(--bone)",
      letterSpacing: "-0.015em"
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 18,
      color: "var(--volt)"
    }
  }, price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--muted)"
    }
  }, unit)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "var(--st-valide)"
    },
    className: "volt-dot"
  }), "Livraison ", leadtime), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "stretch"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      border: "1px solid var(--rule-on)",
      background: "var(--ink-2)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setQty(Math.max(0, qty - 1)),
    style: {
      width: 32,
      height: 32,
      background: "transparent",
      color: "var(--bone)",
      border: 0,
      cursor: "pointer",
      fontSize: 18
    }
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      width: 32,
      textAlign: "center",
      color: "var(--bone)"
    }
  }, qty), /*#__PURE__*/React.createElement("button", {
    onClick: () => setQty(qty + 1),
    style: {
      width: 32,
      height: 32,
      background: "transparent",
      color: "var(--bone)",
      border: 0,
      cursor: "pointer",
      fontSize: 18
    }
  }, "+")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setQty(qty + 1);
      onAdd && onAdd();
    },
    style: {
      flex: 1,
      background: qty > 0 ? "var(--volt)" : "transparent",
      color: qty > 0 ? "var(--ink)" : "var(--bone)",
      border: qty > 0 ? "none" : "1px solid var(--rule-on)",
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all .2s"
    }
  }, qty > 0 ? "Ajouté ✓" : "Ajouter au dossier")));
};
Object.assign(window, {
  Btn,
  Pill,
  Field,
  ComponentsCard,
  CardsCard,
  OperationCard,
  MaterialCard
});