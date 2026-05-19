/* eslint-disable */
// EchoWAI — Brand assets (Voltage edition)

// pageBg helper — used by all artboards
function pageBg(height, dark = true) {
  return {
    position: "relative",
    width: "100%",
    height,
    background: dark ? "var(--page)" : "var(--bone)",
    color: dark ? "var(--on-page)" : "var(--ink)",
    overflow: "hidden"
  };
}

// EchoMark — wave glyph with draw-in animation
const EchoMark = ({
  size = 56,
  color = "var(--volt)"
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 56 56",
  fill: "none",
  "aria-hidden": true
}, /*#__PURE__*/React.createElement("g", {
  stroke: color,
  strokeLinecap: "round",
  strokeWidth: "1.6",
  fill: "none"
}, /*#__PURE__*/React.createElement(PathDraw, {
  d: "M4 28 Q14 14, 24 28 T 44 28",
  stroke: color,
  strokeWidth: "1.6",
  dur: 1.0,
  delay: 0.05,
  opacity: 0.5
}), /*#__PURE__*/React.createElement(PathDraw, {
  d: "M4 36 Q14 22, 24 36 T 44 36",
  stroke: color,
  strokeWidth: "1.6",
  dur: 1.2,
  delay: 0.3
})), /*#__PURE__*/React.createElement("circle", {
  cx: "50",
  cy: "28",
  r: "3.2",
  fill: color,
  className: "volt-dot"
}));
const Wordmark = ({
  scale = 1,
  color = "var(--bone)",
  accent = "var(--volt)"
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10 * scale,
    color
  }
}, /*#__PURE__*/React.createElement(EchoMark, {
  size: 26 * scale,
  color: accent
}), /*#__PURE__*/React.createElement("span", {
  className: "serif",
  style: {
    fontSize: 28 * scale,
    lineHeight: 1,
    letterSpacing: "-0.035em",
    fontWeight: 500,
    color
  }
}, "echo", /*#__PURE__*/React.createElement("span", {
  style: {
    color: accent
  }
}, "wai")));

// Brand card — features the wordmark + flowing motif
const BrandCard = () => /*#__PURE__*/React.createElement("div", {
  style: pageBg("520px")
}, /*#__PURE__*/React.createElement(Orb, {
  size: 520,
  color: "var(--volt-glow)",
  style: {
    top: -200,
    right: -160
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    padding: 48,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)"
  }
}, "Identit\xE9 \xB7 S\xE9r\xE9nit\xE9"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 24
  }
}, /*#__PURE__*/React.createElement(Wordmark, {
  scale: 2
}), /*#__PURE__*/React.createElement("div", {
  className: "serif",
  style: {
    fontSize: 30,
    lineHeight: 1.15,
    maxWidth: 420,
    color: "var(--bone-2)"
  }
}, "Le dispositif CEE,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", {
  style: {
    color: "var(--volt)"
  }
}, "structur\xE9, lisible,"), /*#__PURE__*/React.createElement("br", null), "valoris\xE9 en direct.")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between"
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)"
  }
}, "Symbole"), /*#__PURE__*/React.createElement("div", {
  style: {
    height: 8
  }
}), /*#__PURE__*/React.createElement(EchoMark, {
  size: 56,
  color: "var(--volt)"
})), /*#__PURE__*/React.createElement("div", {
  style: {
    textAlign: "right"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)"
  }
}, "Signature"), /*#__PURE__*/React.createElement("div", {
  className: "mono",
  style: {
    fontSize: 11,
    color: "var(--bone-soft)",
    marginTop: 8
  }
}, "CEE \xB7 261 fiches \xB7 6 secteurs")))));

// Echo motif — features the flowing ribbon, live
const EchoCard = () => /*#__PURE__*/React.createElement("div", {
  style: pageBg("520px")
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    padding: 48,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)"
  }
}, "Motif \xB7 L'onde fluide"), /*#__PURE__*/React.createElement("div", {
  className: "serif",
  style: {
    fontSize: 32,
    lineHeight: 1.15,
    marginTop: 12,
    maxWidth: 380
  }
}, "Un signal d'\xE9nergie", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", {
  style: {
    color: "var(--volt)"
  }
}, "qui se propage."))), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    margin: "0 -48px"
  }
}, /*#__PURE__*/React.createElement(FlowRibbon, {
  height: 220,
  lines: 6,
  color: "var(--volt)"
})), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    color: "var(--muted)",
    maxWidth: 440,
    lineHeight: 1.55
  }
}, "L'onde signe la marque dans le hero, les transitions entre \xE9tapes, le pied de page et les \xE9tats de chargement. Elle r\xE9agit au calcul de la prime \u2014 chaque saisie la fait vibrer.")));

// Voice — three principles, dark
const VoiceCard = () => {
  const principles = [{
    k: "Précis",
    v: "Le vocabulaire CEE reste exact : fiche d'opération, bénéficiaire, point de contrôle.",
    e: "« BAR-EN-101 », pas « isolation »."
  }, {
    k: "Sobre",
    v: "Aucun superlatif marketing. La règlementation parle pour nous, la voix reste basse.",
    e: "« Estimez votre prime », pas « Boostez vos revenus »."
  }, {
    k: "Vivant",
    v: "L'interface respire. Une phrase courte, un verbe à l'impératif, l'utilisateur au centre.",
    e: "« Déposez vos pièces. On s'occupe du reste. »"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: pageBg("520px")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 48,
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, "Ton de voix"), /*#__PURE__*/React.createElement("div", {
    className: "serif",
    style: {
      fontSize: 36,
      lineHeight: 1.1,
      marginTop: 10,
      marginBottom: 28
    }
  }, "Trois principes"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 1,
      background: "var(--rule-on)",
      border: "1px solid var(--rule-on)",
      flex: 1
    }
  }, principles.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: "var(--page)",
      padding: 28,
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--bone-mute)"
    }
  }, "0", i + 1), /*#__PURE__*/React.createElement("span", {
    className: "serif",
    style: {
      fontSize: 28,
      color: "var(--volt)"
    }
  }, p.k)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      lineHeight: 1.55,
      color: "var(--bone-2)"
    }
  }, p.v), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      borderLeft: "2px solid var(--volt)",
      paddingLeft: 12,
      fontSize: 13,
      color: "var(--bone-soft)",
      fontStyle: "italic"
    }
  }, p.e))))));
};
Object.assign(window, {
  EchoMark,
  Wordmark,
  BrandCard,
  EchoCard,
  VoiceCard,
  pageBg
});