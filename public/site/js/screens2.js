/* eslint-disable */
// EchoWAI — Screens 2: Simulator (4-step interactive) + Dossier + Sectors

// ────────── SIMULATOR — parcours 4 étapes interactif ──────────
const SIM_SECTEURS = [{
  id: "BAR",
  nom: "Résidentiel",
  desc: "Logements & copropriétés"
}, {
  id: "BAT",
  nom: "Tertiaire",
  desc: "Bureaux, commerces, écoles"
}, {
  id: "IND",
  nom: "Industrie",
  desc: "Sites de production"
}, {
  id: "AGRI",
  nom: "Agriculture",
  desc: "Exploitations & élevage"
}, {
  id: "RES",
  nom: "Réseaux",
  desc: "Chaleur & éclairage public"
}, {
  id: "TRA",
  nom: "Transport",
  desc: "Flottes & logistique"
}];
const SIM_OPERATIONS = {
  BAR: [{
    code: "BAR-EN-101",
    nom: "Isolation des combles perdus",
    base: 16,
    unit: "m²",
    min: 20,
    max: 400,
    def: 120
  }, {
    code: "BAR-TH-104",
    nom: "Pompe à chaleur air/eau",
    base: 8400,
    unit: "logement",
    min: 1,
    max: 30,
    def: 1
  }, {
    code: "BAR-TH-171",
    nom: "Pompe à chaleur air/air",
    base: 5200,
    unit: "logement",
    min: 1,
    max: 30,
    def: 1
  }],
  BAT: [{
    code: "BAT-EN-103",
    nom: "Isolation de toiture-terrasse",
    base: 13,
    unit: "m²",
    min: 50,
    max: 2000,
    def: 350
  }, {
    code: "BAT-TH-116",
    nom: "Gestion technique du bâtiment",
    base: 4,
    unit: "m²",
    min: 100,
    max: 6000,
    def: 900
  }],
  IND: [{
    code: "IND-UT-117",
    nom: "Récupération de chaleur fatale",
    base: 19000,
    unit: "installation",
    min: 1,
    max: 8,
    def: 1
  }, {
    code: "IND-UT-102",
    nom: "Moteur haut rendement IE3",
    base: 980,
    unit: "kW",
    min: 5,
    max: 400,
    def: 60
  }],
  AGRI: [{
    code: "AGRI-TH-116",
    nom: "PAC sur bâtiment d'élevage",
    base: 7200,
    unit: "bâtiment",
    min: 1,
    max: 15,
    def: 1
  }, {
    code: "AGRI-EQ-101",
    nom: "Pré-refroidisseur de lait",
    base: 2200,
    unit: "installation",
    min: 1,
    max: 8,
    def: 1
  }],
  RES: [{
    code: "RES-CH-103",
    nom: "Raccordement à un réseau de chaleur",
    base: 480,
    unit: "logement",
    min: 5,
    max: 800,
    def: 90
  }, {
    code: "RES-EC-104",
    nom: "Rénovation de l'éclairage public",
    base: 300,
    unit: "point",
    min: 10,
    max: 2000,
    def: 160
  }],
  TRA: [{
    code: "TRA-EQ-101",
    nom: "Télématique embarquée de flotte",
    base: 620,
    unit: "véhicule",
    min: 1,
    max: 250,
    def: 24
  }, {
    code: "TRA-SE-104",
    nom: "Formation à l'écoconduite",
    base: 380,
    unit: "conducteur",
    min: 1,
    max: 200,
    def: 18
  }]
};
const SIM_STEPS = ["Secteur", "Opération", "Profil", "Estimation"];
const SimPick = ({
  active,
  onClick,
  children
}) => {
  const [h, setH] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      textAlign: "left",
      cursor: "pointer",
      width: "100%",
      fontFamily: "var(--font-sans)",
      background: active ? "var(--volt-soft)" : "var(--card)",
      border: "1px solid " + (active ? "var(--volt)" : "var(--rule-on)"),
      borderRadius: 12,
      padding: "13px 15px",
      transition: "transform .25s var(--ease-out-quart), background .15s, border-color .15s, box-shadow .25s",
      transform: h && !active ? "translateY(-2px)" : "none",
      boxShadow: active ? "0 8px 20px -8px var(--volt-glow)" : h ? "var(--sh-2)" : "none"
    }
  }, children);
};
const Simulator = ({
  embedded = false,
  onNavigate
}) => {
  const [step, setStep] = React.useState(0);
  const [secteur, setSecteur] = React.useState("BAR");
  const [opIdx, setOpIdx] = React.useState(0);
  const ops = SIM_OPERATIONS[secteur];
  const op = ops[Math.min(opIdx, ops.length - 1)];
  const [qty, setQty] = React.useState(op.def);
  const [zone, setZone] = React.useState("H1");
  const [energy, setEnergy] = React.useState("Gaz");
  const [precarite, setPrec] = React.useState("Standard");
  const zoneCoef = {
    H1: 1.0,
    H2: 0.85,
    H3: 0.7
  }[zone];
  const energyCoef = {
    "Gaz": 1.0,
    "Électricité": 0.92,
    "Fioul": 1.15
  }[energy];
  const precCoef = {
    "Standard": 1,
    "Précaire": 2.1,
    "Très précaire": 3.2
  }[precarite];
  const prime = Math.round(op.base * qty * zoneCoef * energyCoef * precCoef);
  const cumac = Math.round(prime / 0.0091);
  const secteurNom = (SIM_SECTEURS.find(s => s.id === secteur) || {}).nom;
  const fmt = n => new Intl.NumberFormat("fr-FR").format(n);
  const pickSecteur = id => {
    setSecteur(id);
    setOpIdx(0);
    setQty(SIM_OPERATIONS[id][0].def);
  };
  const pickOp = i => {
    setOpIdx(i);
    setQty(SIM_OPERATIONS[secteur][i].def);
  };
  const pad = embedded ? 38 : 56;
  const heads = ["Quel est votre secteur ?", "Quelle opération valoriser ?", "Le profil du chantier.", "Votre estimation est prête."];
  let body;
  if (step === 0) {
    body = /*#__PURE__*/React.createElement("div", {
      className: "r-cols-form2",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }
    }, SIM_SECTEURS.map(s => /*#__PURE__*/React.createElement(SimPick, {
      key: s.id,
      active: secteur === s.id,
      onClick: () => pickSecteur(s.id)
    }, /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 10,
        color: secteur === s.id ? "var(--volt-deep)" : "var(--bone-mute)"
      }
    }, s.id), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        color: "var(--ink)",
        fontWeight: 600,
        marginTop: 3
      }
    }, s.nom), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--muted)",
        marginTop: 2
      }
    }, s.desc))));
  } else if (step === 1) {
    body = /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 9
      }
    }, ops.map((o, i) => /*#__PURE__*/React.createElement(SimPick, {
      key: o.code,
      active: opIdx === i,
      onClick: () => pickOp(i)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 10,
        padding: "3px 7px",
        borderRadius: 4,
        background: "var(--volt-soft)",
        color: "var(--volt-deep)",
        flexShrink: 0
      }
    }, o.code), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: "var(--ink)",
        fontWeight: 500
      }
    }, o.nom)))));
  } else if (step === 2) {
    body = /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 20
      }
    }, /*#__PURE__*/React.createElement(Slider, {
      label: "Quantité — " + op.unit,
      value: qty,
      min: op.min,
      max: op.max,
      step: 1,
      onChange: setQty,
      unit: op.unit
    }), /*#__PURE__*/React.createElement("div", {
      className: "r-cols-form2",
      style: {
        display: "flex",
        gap: 16,
        flexWrap: "wrap"
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
      label: "Situation du b\xE9n\xE9ficiaire",
      options: ["Standard", "Précaire", "Très précaire"],
      value: precarite,
      onChange: setPrec
    }));
  } else {
    body = /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid var(--rule-on)",
        borderRadius: 12,
        overflow: "hidden"
      }
    }, [["Secteur", secteurNom], ["Opération", op.code + " · " + op.nom], ["Quantité", fmt(qty) + " " + op.unit], ["Zone climatique", zone], ["Énergie remplacée", energy], ["Situation", precarite]].map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "10px 14px",
        background: i % 2 ? "var(--card-2)" : "transparent",
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "upper",
      style: {
        color: "var(--muted)"
      }
    }, k), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--ink)",
        textAlign: "right",
        fontWeight: 500
      }
    }, v)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      variant: "primary",
      arrow: true,
      magnetic: true,
      onClick: () => onNavigate && onNavigate("login")
    }, "D\xE9poser ce dossier"), /*#__PURE__*/React.createElement(Btn, {
      variant: "secondary",
      onClick: () => onNavigate && onNavigate("contact")
    }, "Parler \xE0 un conseiller")));
  }
  const content = /*#__PURE__*/React.createElement("div", {
    className: "r-cols-sim",
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1.05fr",
      height: embedded ? "auto" : "calc(100% - 77px)",
      minHeight: embedded ? 700 : "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-pane",
    style: {
      padding: pad,
      borderRight: "1px solid var(--ink-line)",
      display: "flex",
      flexDirection: "column",
      gap: embedded ? 22 : 28
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--volt)"
    }
  }, "\xC9tape ", step + 1, " / 4 \xB7 ", SIM_STEPS[step]), /*#__PURE__*/React.createElement("h2", {
    className: "serif",
    style: {
      fontSize: embedded ? 28 : 48,
      lineHeight: 1.06,
      letterSpacing: "-0.025em",
      margin: embedded ? "10px 0 0" : "14px 0 0",
      fontWeight: 500,
      color: "var(--ink)"
    }
  }, heads[step])), /*#__PURE__*/React.createElement("div", {
    className: "r-cols-stepper",
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 8
    }
  }, SIM_STEPS.map((k, i) => /*#__PURE__*/React.createElement("button", {
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
      height: 3,
      borderRadius: 3,
      background: i <= step ? "var(--volt)" : "var(--rule-on)",
      transition: "background .35s var(--ease-out-quart)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--bone-mute)"
    }
  }, "0", i + 1), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: i <= step ? "var(--ink)" : "var(--muted)",
      fontWeight: i === step ? 600 : 400
    }
  }, k)))), /*#__PURE__*/React.createElement("div", {
    key: step,
    style: {
      flex: 1,
      animation: "revealUp .35s var(--ease-out-quart) both"
    }
  }, body), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, step > 0 && /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => setStep(step - 1)
  }, "\u2190 Pr\xE9c\xE9dent"), step < 3 ? /*#__PURE__*/React.createElement(Btn, {
    variant: "primary",
    arrow: true,
    magnetic: true,
    onClick: () => setStep(step + 1)
  }, "Continuer") : /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => setStep(0)
  }, "\u21BB Recommencer"))), /*#__PURE__*/React.createElement("div", {
    className: "sim-pane",
    style: {
      background: "var(--card-2)",
      padding: pad,
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
    className: "sim-amount",
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 12,
      marginTop: 14,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(LiquidNumber, {
    value: prime,
    size: embedded ? 108 : 156,
    color: "var(--ink)"
  }), /*#__PURE__*/React.createElement("span", {
    className: "serif",
    style: {
      fontSize: embedded ? 46 : 64,
      color: "var(--volt)"
    }
  }, "\u20AC")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--muted)",
      marginTop: 10,
      maxWidth: 470,
      lineHeight: 1.55
    }
  }, op.code, " \xB7 ", op.nom, " \u2014 prime estim\xE9e pour ", fmt(qty), " ", op.unit, ". Susceptible d'ajustement lors du contr\xF4le."), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: embedded ? "22px -38px 0" : "32px -56px 0",
      opacity: 0.5
    }
  }, /*#__PURE__*/React.createElement(FlowRibbon, {
    height: embedded ? 84 : 110,
    lines: 5,
    speed: 8 + Math.min(14, qty / 8),
    color: "var(--volt)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24,
      paddingTop: 24,
      borderTop: "1px solid var(--rule-on)"
    }
  }, [["Volume kWh cumac", fmt(cumac)], ["Cours du certificat", "9,11 €/MWh"], ["Délai de versement", "≈ 42 jours"], ["Pièces requises", "7 documents"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: embedded ? 19 : 22,
      color: "var(--ink)",
      marginTop: 5
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