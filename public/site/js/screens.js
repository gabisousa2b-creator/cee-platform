function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* eslint-disable */
// EchoWAI — Screens (Voltage edition)

// ────── Browser chrome (light) ──────
const ScreenChrome = ({
  url,
  children,
  height = 980
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    width: "100%",
    height,
    background: "var(--page)",
    border: "1px solid var(--rule-on)",
    display: "flex",
    flexDirection: "column",
    boxShadow: "var(--sh-2)",
    borderRadius: 4
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    height: 36,
    background: "var(--card-2)",
    borderBottom: "1px solid var(--rule-on)",
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    gap: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 6
  }
}, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("span", {
  key: i,
  style: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "var(--rule-on)"
  }
}))), /*#__PURE__*/React.createElement("div", {
  className: "mono",
  style: {
    fontSize: 11,
    color: "var(--muted)",
    background: "var(--card)",
    padding: "4px 12px",
    borderRadius: 4,
    border: "1px solid var(--rule-on)",
    flex: 1,
    maxWidth: 360,
    textAlign: "center"
  }
}, url), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1
  }
})), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    background: "var(--page)"
  }
}, children));
const TopNav = ({
  active = "Le dispositif"
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    padding: "20px 56px",
    borderBottom: "1px solid var(--ink-line)",
    background: "var(--page)"
  }
}, /*#__PURE__*/React.createElement(Wordmark, {
  scale: 0.9
}), /*#__PURE__*/React.createElement("nav", {
  style: {
    display: "flex",
    gap: 32,
    marginLeft: 56,
    fontSize: 14,
    color: "var(--muted)"
  }
}, ["Le dispositif", "Simulateur", "Matériel", "Espaces"].map(n => /*#__PURE__*/React.createElement("a", {
  key: n,
  style: {
    textDecoration: "none",
    color: n === active ? "var(--bone)" : "var(--muted)",
    paddingBottom: 4,
    borderBottom: n === active ? "1px solid var(--volt)" : "1px solid transparent"
  }
}, n))), /*#__PURE__*/React.createElement("div", {
  style: {
    marginLeft: "auto",
    display: "flex",
    gap: 10,
    alignItems: "center"
  }
}, /*#__PURE__*/React.createElement(Btn, {
  variant: "ghost"
}, "B\xE9n\xE9ficiaire"), /*#__PURE__*/React.createElement(Btn, {
  variant: "primary",
  arrow: true
}, "Espace mandataire")));

// ────────── Mini live-prime demo (used in hero) ──────────
const HeroLiveDemo = () => {
  const [surface, setSurface] = React.useState(142);
  const [zone, setZone] = React.useState("H1");
  const [energy, setEnergy] = React.useState("Gaz");
  // Synthetic formula — for the prototype, makes it feel "alive"
  const zoneCoef = {
    H1: 1.0,
    H2: 0.85,
    H3: 0.7
  }[zone];
  const energyCoef = {
    Gaz: 1.0,
    Électricité: 0.92,
    Fioul: 1.15
  }[energy];
  const prime = Math.round(surface * 20.05 * zoneCoef * energyCoef);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--card)",
      border: "1px solid var(--rule-on)",
      padding: 24,
      position: "relative",
      overflow: "hidden",
      borderRadius: 4,
      boxShadow: "var(--sh-2)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--volt)"
    }
  }, "D\xE9mo \xB7 simulateur en direct"), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10,
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
      background: "var(--volt)"
    },
    className: "volt-dot"
  }), " live")), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--bone-mute)",
      marginBottom: 6
    }
  }, "BAR-EN-101 \xB7 Isolation combles \xB7 R\xE9sidentiel"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      margin: "12px 0 4px"
    }
  }, /*#__PURE__*/React.createElement(LiquidNumber, {
    value: prime,
    size: 84,
    color: "var(--bone)"
  }), /*#__PURE__*/React.createElement("span", {
    className: "serif",
    style: {
      fontSize: 36,
      color: "var(--volt)"
    }
  }, "\u20AC")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      marginBottom: 16
    }
  }, "prime estim\xE9e \xB7 ajustez les variables"), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 -24px 16px",
      opacity: 0.6,
      height: 60
    }
  }, /*#__PURE__*/React.createElement(FlowRibbon, {
    height: 60,
    lines: 3,
    speed: 10 + surface / 50,
    color: "var(--volt)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Surface isol\xE9e",
    value: surface,
    min: 20,
    max: 400,
    step: 1,
    onChange: setSurface,
    unit: "m\xB2"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(SegRow, {
    label: "Zone climatique",
    options: ["H1", "H2", "H3"],
    value: zone,
    onChange: setZone
  }), /*#__PURE__*/React.createElement(SegRow, {
    label: "\xC9nergie",
    options: ["Gaz", "Électricité", "Fioul"],
    value: energy,
    onChange: setEnergy
  }))));
};
const SegRow = ({
  label,
  options,
  value,
  onChange
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
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
    gap: 0,
    border: "1px solid var(--rule-on)"
  }
}, options.map(o => /*#__PURE__*/React.createElement("button", {
  key: o,
  onClick: () => onChange(o),
  style: {
    flex: 1,
    padding: "8px 6px",
    background: o === value ? "var(--volt)" : "transparent",
    color: o === value ? "var(--ink)" : "var(--bone)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 500,
    border: 0,
    cursor: "pointer",
    transition: "all .15s"
  }
}, o))));

// ────────── HERO ──────────
const LandingHero = () => /*#__PURE__*/React.createElement("div", {
  style: pageBg("1180px")
}, /*#__PURE__*/React.createElement(ScreenChrome, {
  url: "echowai.com",
  height: 1180
}, /*#__PURE__*/React.createElement(TopNav, {
  active: "Le dispositif"
}), /*#__PURE__*/React.createElement(CursorEcho, {
  style: {
    position: "relative",
    padding: "56px 56px 32px",
    display: "grid",
    gridTemplateColumns: "1.25fr 1fr",
    gap: 56,
    alignItems: "start",
    background: "var(--page)"
  }
}, /*#__PURE__*/React.createElement(AuroraMesh, null), /*#__PURE__*/React.createElement(Orb, {
  size: 520,
  color: "var(--volt-glow)",
  style: {
    top: -80,
    left: "32%",
    opacity: .35
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 12px",
    border: "1px solid var(--ink-line)",
    borderRadius: 999,
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
}), /*#__PURE__*/React.createElement("span", {
  className: "mono",
  style: {
    letterSpacing: ".08em"
  }
}, "Plateforme CEE \xB7 261 fiches \xB7 6 secteurs")), /*#__PURE__*/React.createElement("h1", {
  className: "serif",
  style: {
    fontSize: 104,
    lineHeight: 0.95,
    letterSpacing: "-0.04em",
    margin: "20px 0 0",
    fontWeight: 400,
    color: "var(--bone)"
  }
}, "Du devis", /*#__PURE__*/React.createElement("br", null), "\xE0 la prime,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", {
  style: {
    color: "var(--volt)"
  }
}, "en un seul fil.")), /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 18,
    lineHeight: 1.55,
    color: "var(--bone-soft)",
    maxWidth: 520,
    marginTop: 28
  }
}, "EchoWAI orchestre la simulation, la ", /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--bone)",
    fontWeight: 600
  }
}, "commande de mat\xE9riel pour le b\xE9n\xE9ficiaire"), ", le suivi de dossier et le versement de la prime CEE \u2014 pour les apporteurs, leurs \xE9quipes, et les b\xE9n\xE9ficiaires."), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 12,
    marginTop: 32
  }
}, /*#__PURE__*/React.createElement(Btn, {
  variant: "primary",
  arrow: true,
  magnetic: true
}, "Simuler ma prime"), /*#__PURE__*/React.createElement(Btn, {
  variant: "secondary",
  arrow: true
}, "Acc\xE9der \xE0 mon dossier")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 36,
    padding: "16px 20px",
    background: "var(--card)",
    border: "1px solid var(--rule-on)",
    borderRadius: 4,
    maxWidth: 540,
    boxShadow: "var(--sh-1)"
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "upper",
  style: {
    color: "var(--volt)"
  }
}, "En direct"), /*#__PURE__*/React.createElement("span", {
  style: {
    width: 1,
    height: 14,
    background: "var(--ink-line)"
  }
}), /*#__PURE__*/React.createElement(LiveTicker, {
  events: ["Hubert & fils — pompe à chaleur · dossier validé · 9 605 €", "Boulangerie Lefranc — récupération de chaleur · contrôle en cours", "GAEC du Hêtre — isolation toiture · pièces déposées (7/7)", "Logipro — éclairage tertiaire · prime versée · 14 220 €"]
}))), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    marginTop: 24
  }
}, /*#__PURE__*/React.createElement(HeroLiveDemo, null), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    top: -16,
    left: 24,
    background: "var(--volt)",
    color: "var(--ink)",
    padding: "4px 10px",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: ".12em",
    textTransform: "uppercase"
  }
}, "Essayez \xB7 glissez les curseurs"))), /*#__PURE__*/React.createElement("div", {
  style: {
    borderTop: "1px solid var(--ink-line)",
    padding: "48px 56px 0"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 28
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)"
  }
}, "Tout ce qu'EchoWAI fait"), /*#__PURE__*/React.createElement("div", {
  className: "serif",
  style: {
    fontSize: 44,
    lineHeight: 1,
    marginTop: 8,
    letterSpacing: "-0.03em",
    color: "var(--bone)"
  }
}, "Un parcours, ", /*#__PURE__*/React.createElement("em", {
  style: {
    color: "var(--volt)"
  }
}, "quatre \xE9tapes."))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 12,
    fontSize: 12,
    color: "var(--muted)"
  }
}, /*#__PURE__*/React.createElement("span", null, "B\xE9n\xE9ficiaire"), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Partenaire"), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Administrateur"))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 0,
    border: "1px solid var(--ink-line)"
  }
}, [{
  n: "01",
  k: "Simuler",
  d: "Estimez la prime sur 261 fiches standardisées, en direct, avant tout engagement.",
  viz: "simulator"
}, {
  n: "02",
  k: "Commander",
  d: "Commandez le matériel pour le bénéficiaire — livré directement, rattaché au dossier.",
  viz: "order"
}, {
  n: "03",
  k: "Suivre",
  d: "Pièces justificatives, points de contrôle, étapes — tout converge sur un seul fil.",
  viz: "track"
}, {
  n: "04",
  k: "Valoriser",
  d: "Versement déclenché dès la validation. Référent dédié pour chaque dossier.",
  viz: "paid"
}].map((s, i) => /*#__PURE__*/React.createElement(PathCard, _extends({
  key: s.n
}, s, {
  index: i
}))))), /*#__PURE__*/React.createElement("div", {
  style: {
    borderTop: "1px solid var(--ink-line)",
    borderBottom: "1px solid var(--ink-line)",
    background: "var(--card)",
    padding: "12px 0",
    overflow: "hidden",
    marginTop: 32
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "mono",
  style: {
    fontSize: 12,
    color: "var(--muted)",
    letterSpacing: ".06em"
  }
}, /*#__PURE__*/React.createElement(Marquee, {
  speed: 45,
  items: ["Cours du certificat · 9,11 €/MWh", "Volume total cumac · 14,8 TWh ce mois", "Dossiers validés cette semaine · 312", "Prime moyenne versée · 11 240 €", "Délai moyen versement · 38 jours", "Nouveaux partenaires · 47 ce trimestre"]
}))), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "32px 56px 0",
    borderTop: "1px solid var(--ink-line)"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "upper",
  style: {
    color: "var(--muted)"
  }
}, "Couverture"), /*#__PURE__*/React.createElement("span", {
  className: "mono",
  style: {
    fontSize: 12,
    color: "var(--bone-soft)"
  }
}, "6 secteurs \xB7 261 fiches \xB7 arr\xEAt\xE9 du 22.12.2014")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: 0,
    marginTop: 16,
    borderTop: "1px solid var(--ink-line)",
    borderBottom: "1px solid var(--ink-line)"
  }
}, [["Résidentiel", 89], ["Tertiaire", 47], ["Industrie", 62], ["Agriculture", 18], ["Réseaux", 24], ["Transport", 21]].map(([k, n], i, a) => /*#__PURE__*/React.createElement("div", {
  key: k,
  style: {
    padding: "18px 16px",
    borderRight: i < a.length - 1 ? "1px solid var(--ink-line)" : "none",
    display: "flex",
    flexDirection: "column",
    gap: 4
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 13,
    color: "var(--bone)"
  }
}, k), /*#__PURE__*/React.createElement("span", {
  className: "mono",
  style: {
    fontSize: 11,
    color: "var(--muted)"
  }
}, /*#__PURE__*/React.createElement(CountUp, {
  to: n,
  mono: false
}), " fiches")))))));

// Each 4-step card has its own little visualisation
const PathCard = ({
  n,
  k,
  d,
  viz,
  index
}) => {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      padding: 28,
      borderRight: index < 3 ? "1px solid var(--ink-line)" : "none",
      background: hover ? "var(--card)" : "var(--page)",
      position: "relative",
      overflow: "hidden",
      minHeight: 280,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      transition: "background .4s var(--ease-out-quart), transform .4s var(--ease-out-quart)",
      transform: hover ? "translateY(-2px)" : "translateY(0)",
      boxShadow: hover ? "0 18px 40px -16px rgba(10,31,61,.16)" : "none",
      zIndex: hover ? 2 : 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--volt)"
    }
  }, n), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--bone-mute)"
    }
  }, "\xE9tape")), /*#__PURE__*/React.createElement("div", {
    className: "serif",
    style: {
      fontSize: 38,
      lineHeight: 1,
      letterSpacing: "-0.02em",
      color: "var(--bone)"
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--bone-soft)",
      lineHeight: 1.55,
      maxWidth: 240
    }
  }, d), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto"
    }
  }, /*#__PURE__*/React.createElement(PathViz, {
    kind: viz
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      bottom: 0,
      height: 2,
      width: hover ? "100%" : "0%",
      background: "var(--volt)",
      transition: "width .5s var(--ease-out-quart)"
    }
  }));
};
const PathViz = ({
  kind
}) => {
  if (kind === "simulator") {
    const [v, setV] = React.useState(120);
    React.useEffect(() => {
      const t = setInterval(() => setV(80 + Math.random() * 220), 1800);
      return () => clearInterval(t);
    }, []);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "baseline",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(LiquidNumber, {
      value: Math.round(v * 20),
      size: 28,
      color: "var(--volt)"
    }), /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 12,
        color: "var(--bone-soft)"
      }
    }, "\u20AC")), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        height: 4,
        background: "var(--ink-lift)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: `${v / 300 * 100}%`,
        background: "var(--volt)",
        transition: "width 1.6s var(--ease-out-quart)"
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 10,
        color: "var(--bone-mute)"
      }
    }, "surface \xB7 ", Math.round(v), " m\xB2"));
  }
  if (kind === "order") {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, ["Isolation", "PAC", "Régulation"].map((m, i) => /*#__PURE__*/React.createElement("div", {
      key: m,
      style: {
        flex: 1,
        padding: 8,
        background: "var(--card-2)",
        border: "1px solid var(--rule-on)",
        display: "flex",
        flexDirection: "column",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 9,
        color: "var(--bone-mute)"
      }
    }, "0", i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: "var(--bone)"
      }
    }, m), /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 9,
        color: "var(--volt)"
      }
    }, "en stock"))));
  }
  if (kind === "track") {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 4
      }
    }, [["E", "var(--st-engage)"], ["C", "var(--st-controle)"], ["V", "var(--rule-on)"], ["F", "var(--rule-on)"]].map(([l, c], i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        height: 4,
        background: c
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 10,
        color: "var(--bone-mute)"
      },
      className: "mono"
    }, /*#__PURE__*/React.createElement("span", null, "engag\xE9"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--st-controle)"
      }
    }, "contr\xF4le"), /*#__PURE__*/React.createElement("span", null, "valid\xE9"), /*#__PURE__*/React.createElement("span", null, "factur\xE9")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--bone-soft)"
      }
    }, "7 pi\xE8ces \xB7 7/7 d\xE9pos\xE9es"));
  }
  if (kind === "paid") {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "baseline",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "serif",
      style: {
        fontSize: 32,
        color: "var(--volt)"
      }
    }, "9 605"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: "var(--volt)"
      }
    }, "\u20AC")), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 11,
        color: "var(--bone-mute)"
      }
    }, "vers\xE9 \xB7 12/06/2026"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 10,
        color: "var(--st-valide)",
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", null, "\u2713"), " virement instruit"));
  }
  return null;
};
Object.assign(window, {
  LandingHero,
  HeroLiveDemo,
  PathCard,
  ScreenChrome,
  TopNav
});