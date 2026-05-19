/* eslint-disable */
// EchoWAI — Screens 2: Simulator (4-step interactive) + Dossier + Sectors

// ────────── SIMULATOR (full screen) ──────────
const Simulator = ({
  embedded = false
}) => {
  const [step, setStep] = React.useState(1); // 0..3
  const [surface, setSurface] = React.useState(142);
  const [zone, setZone] = React.useState("H1");
  const [energy, setEnergy] = React.useState("Gaz");
  const [precarite, setPrecarite] = React.useState("Standard");
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
  const precCoef = {
    Standard: 1,
    Précaire: 2.1,
    "Très précaire": 3.2
  }[precarite];
  const prime = Math.round(surface * 20.05 * zoneCoef * energyCoef * precCoef);
  const cumac = Math.round(prime / 0.0091);
  const content = /*#__PURE__*/React.createElement("div", {
    className: "r-cols-sim",
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1.05fr",
      height: embedded ? "auto" : "calc(100% - 77px)",
      minHeight: embedded ? 820 : "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-pane",
    style: {
      padding: 56,
      borderRight: "1px solid var(--ink-line)",
      display: "flex",
      flexDirection: "column",
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, "Simulateur \xB7 \xE9tape ", step + 1, " sur 4"), /*#__PURE__*/React.createElement("h2", {
    className: "serif",
    style: {
      fontSize: 54,
      lineHeight: 0.95,
      letterSpacing: "-0.03em",
      margin: "14px 0 12px",
      fontWeight: 400
    }
  }, "D\xE9crivez", /*#__PURE__*/React.createElement("br", null), "votre op\xE9ration."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: "var(--muted)",
      maxWidth: 420,
      lineHeight: 1.55,
      margin: 0
    }
  }, "Identifiez la fiche standardis\xE9e \u2014 EchoWAI estime instantan\xE9ment la prime.")), /*#__PURE__*/React.createElement("div", {
    className: "r-cols-stepper",
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 8
    }
  }, ["Secteur", "Opération", "Bénéficiaire", "Estimation"].map((k, i) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setStep(i),
    style: {
      background: "transparent",
      border: 0,
      cursor: "pointer",
      textAlign: "left",
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 2,
      background: i <= step ? "var(--volt)" : "var(--ink-line)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--bone-mute)"
    }
  }, "0", i + 1), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: i <= step ? "var(--bone)" : "var(--muted)",
      fontWeight: i === step ? 600 : 400
    }
  }, k)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Fiche d'op\xE9ration",
    value: "BAR-EN-101 \xB7 Isolation des combles perdus",
    mono: true,
    big: true,
    focused: true
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Surface isol\xE9e",
    value: surface,
    min: 20,
    max: 500,
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
    label: "\xC9nergie remplac\xE9e",
    options: ["Gaz", "Électricité", "Fioul"],
    value: energy,
    onChange: setEnergy
  })), /*#__PURE__*/React.createElement(SegRow, {
    label: "Pr\xE9carit\xE9 \xE9nerg\xE9tique",
    options: ["Standard", "Précaire", "Très précaire"],
    value: precarite,
    onChange: setPrecarite
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: "auto"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => setStep(Math.max(0, step - 1))
  }, "\u2190 Pr\xE9c\xE9dent"), /*#__PURE__*/React.createElement(Btn, {
    variant: "primary",
    arrow: true,
    magnetic: true,
    onClick: () => setStep(Math.min(3, step + 1))
  }, "Continuer"))), /*#__PURE__*/React.createElement("div", {
    className: "sim-pane",
    style: {
      background: "var(--card-2)",
      padding: 56,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement(AuroraMesh, {
    intensity: 0.7
  }), /*#__PURE__*/React.createElement(Orb, {
    size: 520,
    color: "var(--volt-glow)",
    style: {
      top: -120,
      right: -140,
      opacity: .5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8
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
    className: "upper",
    style: {
      color: "var(--volt)"
    }
  }, "Estimation en direct")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 14,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(LiquidNumber, {
    value: prime,
    size: 156,
    color: "var(--ink)"
  }), /*#__PURE__*/React.createElement("span", {
    className: "serif",
    style: {
      fontSize: 64,
      color: "var(--volt)"
    }
  }, "\u20AC")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "var(--muted)",
      marginTop: 12,
      maxWidth: 480,
      lineHeight: 1.55
    }
  }, "Prime estim\xE9e TTC, susceptible d'ajustement lors du contr\xF4le. Mise \xE0 jour en temps r\xE9el \xE0 chaque variable modifi\xE9e."), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "32px -56px 0",
      opacity: 0.5
    }
  }, /*#__PURE__*/React.createElement(FlowRibbon, {
    height: 110,
    lines: 5,
    speed: 8 + surface / 30,
    color: "var(--volt)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 28,
      paddingTop: 28,
      borderTop: "1px solid var(--rule-on)"
    }
  }, [["Volume kWh cumac", new Intl.NumberFormat("fr-FR").format(cumac)], ["Cours du certificat", "9,11 €/MWh"], ["Délai de versement", "≈ 42 j"], ["Pièces requises", "7 documents"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 22,
      color: "var(--ink)",
      marginTop: 6
    }
  }, v))))));
  if (embedded) return content;
  return /*#__PURE__*/React.createElement("div", {
    style: pageBg("1000px")
  }, /*#__PURE__*/React.createElement(ScreenChrome, {
    url: "echowai.com/simulateur",
    height: 1000
  }, /*#__PURE__*/React.createElement(TopNav, {
    active: "Simulateur"
  }), content));
};

// ────────── DOSSIER TRACKER ──────────
const DossierTracker = ({
  embedded = false
}) => {
  const steps = [{
    k: "Éligibilité",
    n: "01",
    t: "14/04/2026",
    d: "Fiche identifiée · simulation validée"
  }, {
    k: "Constitution",
    n: "02",
    t: "21/04/2026",
    d: "7 pièces déposées · 7/7"
  }, {
    k: "Contrôle",
    n: "03",
    t: "02/05/2026",
    d: "Vérification des points de contrôle"
  }, {
    k: "Validation",
    n: "04",
    t: "—",
    d: "En attente"
  }, {
    k: "Versement",
    n: "05",
    t: "—",
    d: "En attente"
  }];
  const active = 2;
  const content = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "32px 48px",
      borderBottom: "1px solid var(--ink-line)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, "Espace b\xE9n\xE9ficiaire"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 16,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "serif",
    style: {
      fontSize: 40,
      margin: 0,
      letterSpacing: "-0.025em",
      fontWeight: 400,
      color: "var(--bone)"
    }
  }, "Hubert & fils SARL"), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--bone-mute)"
    }
  }, "ECW-2026-04417"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "secondary"
  }, "T\xE9l\xE9charger attestation"), /*#__PURE__*/React.createElement(Btn, {
    variant: "primary",
    arrow: true,
    magnetic: true
  }, "D\xE9poser une pi\xE8ce"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 18,
      height: 1,
      background: "var(--ink-line)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 18,
      height: 1,
      background: "var(--volt)",
      width: `${active / (steps.length - 1) * 100}%`,
      transition: "width .5s var(--ease-out-quart)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
      position: "relative"
    }
  }, steps.map((s, i) => {
    const done = i < active;
    const cur = i === active;
    return /*#__PURE__*/React.createElement("div", {
      key: s.k,
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: cur ? "var(--volt)" : done ? "var(--ink)" : "var(--card)",
        border: `1px solid ${cur ? "var(--volt)" : done ? "var(--ink)" : "var(--rule-on)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: cur ? "#FFFFFF" : done ? "#FFFFFF" : "var(--bone-mute)",
        boxShadow: cur ? "0 0 0 4px var(--volt-glow)" : "none"
      }
    }, s.n), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: cur ? 600 : 500,
        color: done || cur ? "var(--bone)" : "var(--muted)"
      }
    }, s.k), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 11,
        color: "var(--bone-mute)"
      }
    }, s.t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--muted)",
        maxWidth: 180,
        lineHeight: 1.5
      }
    }, s.d));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "r-cols-22",
    style: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: 32,
      marginTop: 56
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)",
      marginBottom: 14
    }
  }, "Pi\xE8ces justificatives"), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--ink-line)",
      background: "var(--card)"
    }
  }, [["AH", "Attestation sur l'honneur", "signé 21/04", "--st-valide", "Validé"], ["FA", "Facture de pose", "21/04 · 1 page", "--st-valide", "Validé"], ["DV", "Devis signé daté", "21/04 · 2 pages", "--st-valide", "Validé"], ["RC", "Rapport de contrôle", "en cours d'examen", "--st-controle", "Contrôle"], ["CV", "CV de l'auditeur", "manquant", "--st-engage", "Attendu"]].map(([k, t, d, c, s], i, arr) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "grid",
      gridTemplateColumns: "44px 1fr 1fr auto",
      gap: 16,
      alignItems: "center",
      padding: "14px 18px",
      borderBottom: i < arr.length - 1 ? "1px solid var(--ink-line)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--bone-mute)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--bone)"
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--muted)"
    }
  }, d), /*#__PURE__*/React.createElement(Pill, {
    color: c
  }, s))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--card-2)",
      padding: 28,
      border: "1px solid var(--ink-line)",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, "Prime totale"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(LiquidNumber, {
    value: 30872,
    size: 64,
    color: "var(--volt)"
  }), /*#__PURE__*/React.createElement("span", {
    className: "serif",
    style: {
      fontSize: 28,
      color: "var(--volt)"
    }
  }, "\u20AC")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--muted)",
      marginTop: 6
    }
  }, "Cumul \xB7 3 op\xE9rations"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(ProgressStripe, {
    value: 0.62,
    label: "Avancement dossier",
    height: 6
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--ink-line)",
      margin: "20px 0 16px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted)"
    }
  }, "Volume cumac"), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--bone)"
    }
  }, "3,42 GWh")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted)"
    }
  }, "Versement estim\xE9"), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--bone)"
    }
  }, "12/06/2026")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted)"
    }
  }, "R\xE9f\xE9rent"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--bone)"
    }
  }, "C. Bocquet")))))));
  if (embedded) return content;
  return /*#__PURE__*/React.createElement("div", {
    style: pageBg("840px")
  }, /*#__PURE__*/React.createElement(ScreenChrome, {
    url: "echowai.com/beneficiaire/ECW-2026-04417",
    height: 840
  }, content));
};

// ────────── SECTORS ──────────
const SectorsCard = () => {
  const [active, setActive] = React.useState(0);
  const sectors = [{
    k: "Résidentiel",
    c: "BAR",
    n: 89,
    ex: "Isolation, chauffage, ventilation des logements."
  }, {
    k: "Tertiaire",
    c: "BAT",
    n: 47,
    ex: "Bureaux, commerces, hôtellerie, enseignement."
  }, {
    k: "Industrie",
    c: "IND",
    n: 62,
    ex: "Procédés, utilités, récupération de chaleur."
  }, {
    k: "Agriculture",
    c: "AGRI",
    n: 18,
    ex: "Élevage, serres, irrigation, séchage."
  }, {
    k: "Réseaux",
    c: "RES",
    n: 24,
    ex: "Réseaux de chaleur, éclairage public, eau."
  }, {
    k: "Transport",
    c: "TRA",
    n: 21,
    ex: "Flottes, fluvial, ferroviaire, formation."
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: pageBg("700px")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "48px 56px",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, "Couverture \xB7 Section type"), /*#__PURE__*/React.createElement("h2", {
    className: "serif",
    style: {
      fontSize: 64,
      lineHeight: 1,
      letterSpacing: "-0.03em",
      margin: "12px 0 0",
      fontWeight: 400,
      maxWidth: 720,
      color: "var(--bone)"
    }
  }, "Six secteurs d'op\xE9rations", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", {
    style: {
      color: "var(--volt)"
    }
  }, "standardis\xE9es."))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 8,
      color: "var(--volt)"
    }
  }, /*#__PURE__*/React.createElement(LiquidNumber, {
    value: 261,
    size: 96,
    color: "var(--volt)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)",
      marginTop: 4
    }
  }, "fiches couvertes"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: 0,
      border: "1px solid var(--ink-line)",
      flex: 1
    }
  }, sectors.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.k,
    onMouseEnter: () => setActive(i),
    style: {
      padding: 24,
      borderRight: i < 5 ? "1px solid var(--ink-line)" : "none",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      position: "relative",
      overflow: "hidden",
      background: i === active ? "var(--volt)" : "var(--card)",
      color: i === active ? "#FFFFFF" : "var(--ink)",
      transition: "background .4s var(--ease-out-quart), color .4s var(--ease-out-quart)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10,
      opacity: 0.7
    }
  }, "0", i + 1, " \xB7 ", s.c), /*#__PURE__*/React.createElement("div", {
    className: "serif",
    style: {
      fontSize: 28,
      lineHeight: 1.05,
      letterSpacing: "-0.02em"
    }
  }, s.k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      lineHeight: 1.5,
      opacity: 0.8,
      flex: 1
    }
  }, s.ex), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginTop: "auto"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      opacity: 0.6
    }
  }, "fiches"), /*#__PURE__*/React.createElement("span", {
    className: "serif",
    style: {
      fontSize: 36,
      lineHeight: 1
    }
  }, s.n)))))));
};
Object.assign(window, {
  Simulator,
  DossierTracker,
  SectorsCard,
  SegRow
});