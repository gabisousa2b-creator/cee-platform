function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* eslint-disable */
// EchoWAI — Site pages

// ─────────────────────────────────────────────────────────
// HomePage — refined landing with extra sections
// ─────────────────────────────────────────────────────────
const HomePage = ({
  onNavigate
}) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(HomeHero, {
  onNavigate: onNavigate
}), /*#__PURE__*/React.createElement(PathSection, {
  onNavigate: onNavigate
}), /*#__PURE__*/React.createElement(MarqueeBand, null), /*#__PURE__*/React.createElement(StatsSection, null), /*#__PURE__*/React.createElement(TestimonialsSection, null), /*#__PURE__*/React.createElement(FinalCTA, {
  onNavigate: onNavigate
}));
const HomeHero = ({
  onNavigate
}) => /*#__PURE__*/React.createElement(CursorEcho, {
  style: {
    position: "relative",
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement(AuroraMesh, null), /*#__PURE__*/React.createElement(Orb, {
  size: 620,
  color: "var(--volt-glow)",
  style: {
    top: -120,
    left: "44%",
    opacity: .35
  }
}), /*#__PURE__*/React.createElement("div", {
  className: "hero-section r-cols-12",
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "80px 32px 60px",
    display: "grid",
    gridTemplateColumns: "1.25fr 1fr",
    gap: 64,
    alignItems: "start",
    position: "relative"
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealOnView, null, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 12px",
    border: "1px solid var(--rule-on)",
    borderRadius: 999,
    fontSize: 12,
    color: "var(--muted)",
    background: "var(--card)"
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
}, "Plateforme CEE \xB7 261 fiches \xB7 6 secteurs"))), /*#__PURE__*/React.createElement(RevealOnView, {
  delay: 0.1
}, /*#__PURE__*/React.createElement("h1", {
  className: "serif h1-fluid",
  style: {
    fontSize: 108,
    lineHeight: 0.95,
    letterSpacing: "-0.04em",
    margin: "20px 0 0",
    fontWeight: 500,
    color: "var(--ink)"
  }
}, "Du devis", /*#__PURE__*/React.createElement("br", null), "\xE0 la prime,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", {
  style: {
    color: "var(--volt)"
  }
}, "en un seul fil."))), /*#__PURE__*/React.createElement(RevealOnView, {
  delay: 0.2
}, /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 19,
    lineHeight: 1.55,
    color: "var(--bone-soft)",
    maxWidth: 540,
    marginTop: 28
  }
}, "EchoWAI orchestre la simulation, la ", /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--ink)",
    fontWeight: 600
  }
}, "commande de mat\xE9riel pour le b\xE9n\xE9ficiaire"), ", le suivi de dossier et le versement de la prime CEE \u2014 pour les apporteurs, leurs \xE9quipes, et les b\xE9n\xE9ficiaires.")), /*#__PURE__*/React.createElement(RevealOnView, {
  delay: 0.3
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 12,
    marginTop: 32
  }
}, /*#__PURE__*/React.createElement(Btn, {
  variant: "primary",
  arrow: true,
  magnetic: true,
  onClick: () => onNavigate("simulateur")
}, "Simuler ma prime"), /*#__PURE__*/React.createElement(Btn, {
  variant: "secondary",
  arrow: true,
  onClick: () => onNavigate("beneficiaire")
}, "Acc\xE9der \xE0 mon dossier"))), /*#__PURE__*/React.createElement(RevealOnView, {
  delay: 0.4
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 40,
    padding: "16px 20px",
    background: "var(--card)",
    border: "1px solid var(--rule-on)",
    borderRadius: 6,
    maxWidth: 560,
    boxShadow: "var(--sh-2)"
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
    background: "var(--rule-on)"
  }
}), /*#__PURE__*/React.createElement(LiveTicker, {
  events: ["Hubert & fils — pompe à chaleur · dossier validé · 9 605 €", "Boulangerie Lefranc — récupération de chaleur · contrôle en cours", "GAEC du Hêtre — isolation toiture · pièces déposées (7/7)", "Logipro — éclairage tertiaire · prime versée · 14 220 €"]
})))), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    marginTop: 24
  }
}, /*#__PURE__*/React.createElement(RevealOnView, {
  delay: 0.5
}, /*#__PURE__*/React.createElement(HeroLiveDemo, null)), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    top: -14,
    left: 24,
    background: "var(--volt)",
    color: "#FFFFFF",
    padding: "5px 11px",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: ".12em",
    textTransform: "uppercase",
    borderRadius: 3,
    boxShadow: "0 6px 18px -6px var(--volt-glow)"
  }
}, "Essayez \xB7 glissez les curseurs"))));
const PathSection = ({
  onNavigate
}) => /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "80px 32px 40px"
  },
  className: "section-pad"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 36,
    flexWrap: "wrap",
    gap: 16
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)"
  }
}, "Tout ce qu'EchoWAI fait"), /*#__PURE__*/React.createElement("h2", {
  className: "serif h2-fluid",
  style: {
    fontSize: 52,
    lineHeight: 1,
    marginTop: 10,
    letterSpacing: "-0.03em",
    color: "var(--ink)",
    fontWeight: 500
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
  className: "r-cols-4",
  style: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 0,
    border: "1px solid var(--rule-on)",
    borderRadius: 6,
    overflow: "hidden",
    background: "var(--card)"
  }
}, [{
  n: "01",
  k: "Simuler",
  d: "Estimez la prime sur 261 fiches standardisées, en direct, avant tout engagement.",
  viz: "simulator",
  to: "simulateur"
}, {
  n: "02",
  k: "Commander",
  d: "Commandez le matériel pour le bénéficiaire — livré directement, rattaché au dossier.",
  viz: "order",
  to: "materiel"
}, {
  n: "03",
  k: "Suivre",
  d: "Pièces justificatives, points de contrôle, étapes — tout converge sur un seul fil.",
  viz: "track",
  to: "beneficiaire"
}, {
  n: "04",
  k: "Valoriser",
  d: "Versement déclenché dès la validation. Référent dédié pour chaque dossier.",
  viz: "paid",
  to: "beneficiaire"
}].map((s, i, a) => /*#__PURE__*/React.createElement(PathCardLink, _extends({
  key: s.n
}, s, {
  last: i === a.length - 1,
  onNavigate: onNavigate
})))));
const PathCardLink = ({
  n,
  k,
  d,
  viz,
  to,
  last,
  onNavigate
}) => {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate(to),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      padding: 28,
      borderRight: last ? "none" : "1px solid var(--rule-on)",
      background: hover ? "var(--card-2)" : "var(--card)",
      border: "none",
      borderRadius: 0,
      position: "relative",
      overflow: "hidden",
      textAlign: "left",
      minHeight: 280,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      transition: "background .4s var(--ease-out-quart), transform .4s var(--ease-out-quart)",
      transform: hover ? "translateY(-2px)" : "translateY(0)",
      cursor: "pointer",
      fontFamily: "var(--font-sans)"
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
  }, "\xE9tape \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "serif",
    style: {
      fontSize: 40,
      lineHeight: 1,
      letterSpacing: "-0.02em",
      color: "var(--ink)",
      fontWeight: 500
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
const MarqueeBand = () => /*#__PURE__*/React.createElement("div", {
  style: {
    borderTop: "1px solid var(--rule-on)",
    borderBottom: "1px solid var(--rule-on)",
    background: "var(--card)",
    padding: "14px 0",
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
})));
const StatsSection = () => /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "100px 32px"
  },
  className: "section-pad"
}, /*#__PURE__*/React.createElement("div", {
  className: "r-cols-21",
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: 64,
    alignItems: "start"
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)"
  }
}, "Chiffres cl\xE9s"), /*#__PURE__*/React.createElement("h2", {
  className: "serif h2-fluid",
  style: {
    fontSize: 52,
    lineHeight: 1,
    letterSpacing: "-0.03em",
    marginTop: 10,
    marginBottom: 24,
    color: "var(--ink)",
    fontWeight: 500
  }
}, "Une plateforme", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", {
  style: {
    color: "var(--volt)"
  }
}, "active.")), /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 15,
    color: "var(--bone-soft)",
    lineHeight: 1.6,
    maxWidth: 340
  }
}, "Tous les chiffres affich\xE9s ici sont des indicateurs en direct, mis \xE0 jour \xE0 chaque d\xE9p\xF4t, contr\xF4le ou versement.")), /*#__PURE__*/React.createElement("div", {
  className: "r-cols-stats3",
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 0,
    border: "1px solid var(--rule-on)",
    borderRadius: 6,
    overflow: "hidden",
    background: "var(--card)"
  }
}, /*#__PURE__*/React.createElement(StatBox, {
  big: 261,
  unit: "",
  label: "Fiches d'op\xE9ration",
  sub: "couverture int\xE9grale"
}), /*#__PURE__*/React.createElement(StatBox, {
  big: 14820,
  unit: "TWh cumac",
  label: "Volume cumul\xE9",
  sub: "ce mois \xB7 tous secteurs"
}), /*#__PURE__*/React.createElement(StatBox, {
  big: 38,
  unit: "jours",
  label: "D\xE9lai moyen versement",
  sub: "constat\xE9 \xB7 90 derniers dossiers",
  last: true
}), /*#__PURE__*/React.createElement(StatBox, {
  big: 11240,
  unit: "\u20AC",
  label: "Prime moyenne vers\xE9e",
  sub: "par op\xE9ration"
}), /*#__PURE__*/React.createElement(StatBox, {
  big: 312,
  unit: "dossiers",
  label: "Valid\xE9s cette semaine",
  sub: "6 secteurs confondus"
}), /*#__PURE__*/React.createElement(StatBox, {
  big: 97,
  unit: "%",
  label: "Conformit\xE9 au contr\xF4le",
  sub: "taux de validation",
  last: true
}))));
const StatBox = ({
  big,
  unit,
  label,
  sub,
  last
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "28px 24px",
    borderRight: last ? "none" : "1px solid var(--rule-on)",
    borderBottom: "1px solid var(--rule-on)",
    display: "flex",
    flexDirection: "column",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "baseline",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "serif",
  style: {
    fontSize: 56,
    lineHeight: 0.9,
    letterSpacing: "-0.035em",
    color: "var(--ink)",
    fontWeight: 500
  }
}, /*#__PURE__*/React.createElement(CountUp, {
  to: big,
  mono: false
})), unit && /*#__PURE__*/React.createElement("span", {
  className: "mono",
  style: {
    fontSize: 14,
    color: "var(--volt)"
  }
}, unit)), /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)"
  }
}, label), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    color: "var(--bone-mute)"
  },
  className: "mono"
}, sub));
const TestimonialsSection = () => {
  const items = [{
    q: "Le simulateur en direct a changé notre process. On engage chaque dossier sur une estimation chiffrée, jamais sur une intuition.",
    n: "Marie Coignet",
    r: "Directrice CEE · Ouest Énergies",
    a: "MC"
  }, {
    q: "La commande de matériel rattachée au dossier, c'est ce qui nous manquait. On évite trois allers-retours administratifs par chantier.",
    n: "Sébastien Rouvière",
    r: "Apporteur d'affaires · 14 départements",
    a: "SR"
  }, {
    q: "Les bénéficiaires voient leur dossier avancer en temps réel. Plus de « où en est ma prime » au téléphone tous les jours.",
    n: "Aïssa Bensaïd",
    r: "Référente · Coopérative agricole",
    a: "AB"
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--card)",
      borderTop: "1px solid var(--rule-on)",
      borderBottom: "1px solid var(--rule-on)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1320,
      margin: "0 auto",
      padding: "100px 32px"
    },
    className: "section-pad"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, "T\xE9moignages"), /*#__PURE__*/React.createElement("h2", {
    className: "serif h2-fluid",
    style: {
      fontSize: 52,
      lineHeight: 1,
      letterSpacing: "-0.03em",
      marginTop: 10,
      color: "var(--ink)",
      fontWeight: 500,
      maxWidth: 720
    }
  }, "Ils orchestrent leurs CEE ", /*#__PURE__*/React.createElement("em", {
    style: {
      color: "var(--volt)"
    }
  }, "avec EchoWAI."))), /*#__PURE__*/React.createElement("div", {
    className: "r-cols-3",
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 0,
      border: "1px solid var(--rule-on)"
    }
  }, items.map((t, i, a) => /*#__PURE__*/React.createElement("div", {
    key: t.n,
    style: {
      padding: 32,
      borderRight: i < a.length - 1 ? "1px solid var(--rule-on)" : "none",
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "28",
    height: "22",
    viewBox: "0 0 28 22",
    fill: "var(--volt)"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 22V12C0 5.4 4 0.7 11 0v4.4C7.3 5.4 5.2 7.7 4.8 11.2H11V22H0Zm16 0V12C16 5.4 20 0.7 27 0v4.4c-3.7 1-5.8 3.3-6.2 6.8H27V22H16Z"
  })), /*#__PURE__*/React.createElement("p", {
    className: "serif",
    style: {
      fontSize: 22,
      lineHeight: 1.35,
      letterSpacing: "-0.015em",
      color: "var(--ink)",
      margin: 0,
      fontWeight: 400
    }
  }, t.q), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginTop: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      borderRadius: "50%",
      background: "var(--ink)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 600
    }
  }, t.a), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "var(--ink)",
      fontWeight: 500
    }
  }, t.n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted)"
    }
  }, t.r))))))));
};
const FinalCTA = ({
  onNavigate
}) => /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "100px 32px"
  },
  className: "section-pad"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--ink)",
    borderRadius: 8,
    padding: "72px 64px",
    position: "relative",
    overflow: "hidden"
  },
  className: "on-ink cta-padbox"
}, /*#__PURE__*/React.createElement(AuroraMesh, {
  intensity: 0.7
}), /*#__PURE__*/React.createElement(Orb, {
  size: 500,
  color: "var(--volt-glow)",
  style: {
    top: -120,
    right: "10%"
  }
}), /*#__PURE__*/React.createElement("div", {
  className: "r-cols-21",
  style: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: 64,
    alignItems: "center"
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--volt)"
  }
}, "Pr\xEAt \xE0 structurer vos op\xE9rations ?"), /*#__PURE__*/React.createElement("h2", {
  className: "serif h2-fluid",
  style: {
    fontSize: 64,
    lineHeight: 1,
    letterSpacing: "-0.035em",
    margin: "16px 0 20px",
    color: "#FFFFFF",
    fontWeight: 500
  }
}, "Valorisez vos travaux", /*#__PURE__*/React.createElement("br", null), "d'\xE9conomies d'\xE9nergie."), /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 17,
    lineHeight: 1.55,
    color: "rgba(255,255,255,.7)",
    margin: 0,
    maxWidth: 480
  }
}, "Estimez votre prime en quelques minutes ou acc\xE9dez directement \xE0 votre dossier en cours. Aucun engagement, aucune carte bancaire."), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 12,
    marginTop: 32
  }
}, /*#__PURE__*/React.createElement(Btn, {
  variant: "primary",
  arrow: true,
  magnetic: true,
  onClick: () => onNavigate("simulateur")
}, "Lancer une simulation"), /*#__PURE__*/React.createElement("button", {
  onClick: () => onNavigate("beneficiaire"),
  style: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,.3)",
    color: "#FFFFFF",
    padding: "12px 18px",
    borderRadius: 4,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 10
  }
}, "Mon dossier", /*#__PURE__*/React.createElement("svg", {
  width: "14",
  height: "10",
  viewBox: "0 0 14 10",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M1 5h12m0 0L9 1m4 4L9 9",
  stroke: "currentColor",
  strokeWidth: "1.5"
}))))), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative"
  }
}, /*#__PURE__*/React.createElement(FlowRibbon, {
  height: 220,
  lines: 7,
  speed: 14,
  color: "var(--volt)"
})))));
Object.assign(window, {
  HomePage,
  HomeHero,
  PathSection,
  PathCardLink,
  MarqueeBand,
  StatsSection,
  StatBox,
  TestimonialsSection,
  FinalCTA
});