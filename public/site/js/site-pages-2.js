/* eslint-disable */
// EchoWAI — Site pages part 2 (Dispositif, Simulateur, Matériel, Bénéficiaire, Contact)

// ─────────────────────────────────────────────────────────
// Dispositif — CEE explainer
// ─────────────────────────────────────────────────────────
const DispositifPage = ({
  onNavigate
}) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
  style: {
    position: "relative",
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement(AuroraMesh, {
  intensity: 0.6
}), /*#__PURE__*/React.createElement("div", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "80px 32px 60px",
    position: "relative"
  },
  className: "r-padbox section-pad"
}, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--volt)"
  }
}, "Le dispositif"), /*#__PURE__*/React.createElement("h1", {
  className: "serif h1-fluid",
  style: {
    fontSize: 96,
    lineHeight: 0.96,
    letterSpacing: "-0.035em",
    margin: "16px 0 24px",
    color: "var(--ink)",
    fontWeight: 500,
    maxWidth: 1000
  }
}, "Comprendre les ", /*#__PURE__*/React.createElement("em", {
  style: {
    color: "var(--volt)"
  }
}, "Certificats", /*#__PURE__*/React.createElement("br", null), "d'\xC9conomies d'\xC9nergie.")), /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 19,
    lineHeight: 1.55,
    color: "var(--bone-soft)",
    maxWidth: 720,
    margin: 0
  }
}, "Un dispositif r\xE9glementaire n\xE9 en 2006 qui impose aux fournisseurs d'\xE9nergie de financer des travaux d'\xE9conomies d'\xE9nergie r\xE9alis\xE9s par les entreprises, les collectivit\xE9s et les particuliers."))), /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "40px 32px 60px"
  },
  className: "r-padbox section-pad"
}, /*#__PURE__*/React.createElement("div", {
  className: "r-cols-4",
  style: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 18
  }
}, [{
  n: "01",
  k: "Obligés",
  d: "Les fournisseurs d'énergie sont tenus par l'État de financer des opérations d'économies d'énergie."
}, {
  n: "02",
  k: "Bénéficiaires",
  d: "Particuliers, entreprises, collectivités, agriculteurs — toute personne qui réalise des travaux éligibles."
}, {
  n: "03",
  k: "Fiches",
  d: "Chaque type d'opération suit une fiche standardisée publiée au Journal Officiel : 261 fiches au total."
}, {
  n: "04",
  k: "Prime",
  d: "Le volume de kWh cumac généré est converti en euros au cours du certificat, versé au bénéficiaire."
}].map(s => /*#__PURE__*/React.createElement(RevealOnView, {
  key: s.n,
  delay: parseInt(s.n) * 0.06
}, /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 28,
    background: "var(--card)",
    border: "1px solid var(--rule-on)",
    borderRadius: 6,
    minHeight: 230,
    display: "flex",
    flexDirection: "column",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "mono",
  style: {
    fontSize: 11,
    color: "var(--volt)"
  }
}, s.n), /*#__PURE__*/React.createElement("div", {
  className: "serif",
  style: {
    fontSize: 30,
    lineHeight: 1.05,
    color: "var(--ink)",
    fontWeight: 500,
    letterSpacing: "-0.02em"
  }
}, s.k), /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 13,
    color: "var(--bone-soft)",
    lineHeight: 1.55,
    margin: 0
  }
}, s.d)))))), /*#__PURE__*/React.createElement("section", {
  style: {
    background: "var(--card)",
    borderTop: "1px solid var(--rule-on)",
    borderBottom: "1px solid var(--rule-on)"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "80px 32px",
    display: "grid",
    gridTemplateColumns: "1fr 1.4fr",
    gap: 64,
    alignItems: "center"
  },
  className: "r-padbox r-cols-21 section-pad"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)"
  }
}, "Le m\xE9canisme en chiffres"), /*#__PURE__*/React.createElement("h2", {
  className: "serif h2-fluid",
  style: {
    fontSize: 48,
    lineHeight: 1,
    letterSpacing: "-0.025em",
    marginTop: 10,
    color: "var(--ink)",
    fontWeight: 500
  }
}, "Une m\xE9canique", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", {
  style: {
    color: "var(--volt)"
  }
}, "mesurable.")), /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 15,
    color: "var(--bone-soft)",
    lineHeight: 1.6,
    marginTop: 18,
    maxWidth: 400
  }
}, "Chaque kWh \xE9conomis\xE9 est cumul\xE9, actualis\xE9 sur la dur\xE9e de vie de l'op\xE9ration et converti en certificat. La valeur du certificat est cot\xE9e mensuellement.")), /*#__PURE__*/React.createElement("div", {
  className: "r-cols-stats3",
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20
  }
}, [{
  v: 2000,
  suf: "GWh",
  k: "Objectif 5e période",
  s: "fin 2025 — France entière"
}, {
  v: 9,
  suf: ",11 €/MWh",
  k: "Cours du certificat",
  s: "mai 2026"
}, {
  v: 38,
  suf: "jours",
  k: "Délai versement moyen",
  s: "constaté EchoWAI"
}, {
  v: 261,
  suf: " fiches",
  k: "Opérations standardisées",
  s: "arrêté du 22.12.2014"
}].map((s, i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    padding: 24,
    background: "var(--card-2)",
    border: "1px solid var(--rule-on)",
    borderRadius: 6
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "baseline",
    gap: 4
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "serif",
  style: {
    fontSize: 48,
    lineHeight: 0.95,
    letterSpacing: "-0.035em",
    color: "var(--ink)",
    fontWeight: 500
  }
}, /*#__PURE__*/React.createElement(CountUp, {
  to: s.v,
  mono: false
})), /*#__PURE__*/React.createElement("span", {
  className: "mono",
  style: {
    fontSize: 14,
    color: "var(--volt)"
  }
}, s.suf)), /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)",
    marginTop: 10
  }
}, s.k), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    color: "var(--bone-mute)",
    marginTop: 4
  },
  className: "mono"
}, s.s)))))), /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "80px 32px"
  },
  className: "r-padbox section-pad"
}, /*#__PURE__*/React.createElement("div", {
  className: "r-cols-22",
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
}, "Questions fr\xE9quentes"), /*#__PURE__*/React.createElement("h2", {
  className: "serif",
  style: {
    fontSize: 48,
    lineHeight: 1,
    letterSpacing: "-0.025em",
    marginTop: 10,
    color: "var(--ink)",
    fontWeight: 500
  }
}, "Tout ce que vous voulez savoir, ", /*#__PURE__*/React.createElement("em", {
  style: {
    color: "var(--volt)"
  }
}, "en clair."))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FAQAccordion, {
  items: [{
    q: "Qui peut bénéficier d'une prime CEE ?",
    a: "Tout particulier, entreprise, collectivité ou agriculteur qui engage des travaux d'économies d'énergie inscrits sur l'une des 261 fiches d'opération standardisées peut prétendre à une prime. Le bénéficiaire doit faire la demande avant le début des travaux."
  }, {
    q: "Comment est calculée la prime ?",
    a: "Le volume de kWh cumac (cumulé et actualisé sur la durée de vie de l'opération) est multiplié par le cours du certificat (autour de 9 €/MWh actuellement). Une bonification s'applique pour les ménages en situation de précarité énergétique."
  }, {
    q: "Quel est le délai entre les travaux et le versement ?",
    a: "Sur EchoWAI, le délai moyen constaté est de 38 jours entre la validation des pièces justificatives et le versement effectif au bénéficiaire. Le dépôt peut être suivi en temps réel dans l'espace dédié."
  }, {
    q: "Quelles sont les pièces justificatives requises ?",
    a: "Sept pièces standard : attestation sur l'honneur signée du bénéficiaire, devis daté, facture de pose, rapport de contrôle, CV de l'auditeur, et deux pièces administratives. La liste exhaustive est rappelée à l'étape de constitution du dossier."
  }, {
    q: "EchoWAI livre-t-il le matériel ?",
    a: "Oui — l'espace partenaire dispose d'un catalogue de matériel éligible CEE livré directement au bénéficiaire, avec rattachement automatique au dossier. Une option permet de basculer le reste à charge à zéro pour le bénéficiaire."
  }]
})))), /*#__PURE__*/React.createElement(FinalCTA, {
  onNavigate: onNavigate
}));
const FAQAccordion = ({
  items
}) => {
  const [open, setOpen] = React.useState(0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--rule-on)",
      borderRadius: 6,
      background: "var(--card)",
      overflow: "hidden"
    }
  }, items.map((it, i) => {
    const isOpen = i === open;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        borderBottom: i < items.length - 1 ? "1px solid var(--rule-on)" : "none"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(isOpen ? -1 : i),
      style: {
        width: "100%",
        padding: "20px 24px",
        background: "transparent",
        border: 0,
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "var(--font-sans)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 17,
        color: "var(--ink)",
        fontWeight: 500
      }
    }, it.q), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: isOpen ? "var(--volt)" : "var(--card-2)",
        color: isOpen ? "#fff" : "var(--ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        transition: "all .2s",
        flexShrink: 0,
        marginLeft: 16
      }
    }, isOpen ? "−" : "+")), /*#__PURE__*/React.createElement("div", {
      style: {
        maxHeight: isOpen ? 400 : 0,
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition: "max-height .35s var(--ease-out-quart), opacity .25s"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 24px 22px",
        fontSize: 14,
        lineHeight: 1.6,
        color: "var(--bone-soft)"
      }
    }, it.a)));
  }));
};

// ─────────────────────────────────────────────────────────
// SimulateurPage — wraps the embedded simulator
// ─────────────────────────────────────────────────────────
const SimulateurPage = ({
  onNavigate
}) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "60px 32px 32px"
  },
  className: "r-padbox"
}, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--volt)"
  }
}, "Outil \xB7 simulateur de prime"), /*#__PURE__*/React.createElement("h1", {
  className: "serif h1-mid",
  style: {
    fontSize: 72,
    lineHeight: 0.96,
    letterSpacing: "-0.035em",
    margin: "12px 0 18px",
    color: "var(--ink)",
    fontWeight: 500
  }
}, "Estimez votre prime, ", /*#__PURE__*/React.createElement("em", {
  style: {
    color: "var(--volt)"
  }
}, "en quatre \xE9tapes.")), /*#__PURE__*/React.createElement("p", {
  className: "body-fluid",
  style: {
    fontSize: 16,
    color: "var(--bone-soft)",
    lineHeight: 1.55,
    maxWidth: 720,
    margin: 0
  }
}, "Renseignez votre op\xE9ration \u2014 surface, zone climatique, \xE9nergie remplac\xE9e, situation du b\xE9n\xE9ficiaire \u2014 et obtenez une estimation chiffr\xE9e imm\xE9diate, bas\xE9e sur les 261 fiches officielles.")), /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "0 32px"
  },
  className: "r-padbox"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--card)",
    border: "1px solid var(--rule-on)",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "var(--sh-2)"
  }
}, /*#__PURE__*/React.createElement(Simulator, {
  embedded: true
}))));

// ─────────────────────────────────────────────────────────
// MaterielPage
// ─────────────────────────────────────────────────────────
const MaterielPage = () => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "60px 32px 32px"
  },
  className: "r-padbox"
}, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--volt)"
  }
}, "Espace partenaire \xB7 commande mat\xE9riel"), /*#__PURE__*/React.createElement("h1", {
  className: "serif h1-mid",
  style: {
    fontSize: 72,
    lineHeight: 0.96,
    letterSpacing: "-0.035em",
    margin: "12px 0 18px",
    color: "var(--ink)",
    fontWeight: 500
  }
}, "Commandez ", /*#__PURE__*/React.createElement("em", {
  style: {
    color: "var(--volt)"
  }
}, "pour le b\xE9n\xE9ficiaire.")), /*#__PURE__*/React.createElement("p", {
  className: "body-fluid",
  style: {
    fontSize: 16,
    color: "var(--bone-soft)",
    lineHeight: 1.55,
    maxWidth: 720,
    margin: 0
  }
}, "Catalogue de mat\xE9riel \xE9ligible CEE, livr\xE9 directement chez le b\xE9n\xE9ficiaire et rattach\xE9 au dossier en cours. Activez le mode \xAB reste \xE0 charge \xE0 0 \u20AC \xBB pour absorber int\xE9gralement le co\xFBt via la prime.")), /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "0 32px"
  },
  className: "r-padbox"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--card)",
    border: "1px solid var(--rule-on)",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "var(--sh-2)"
  }
}, /*#__PURE__*/React.createElement(MaterialOrder, {
  embedded: true
}))));

// ─────────────────────────────────────────────────────────
// BeneficiairePage
// ─────────────────────────────────────────────────────────
const BeneficiairePage = ({
  onNavigate
}) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "60px 32px 32px"
  },
  className: "r-padbox"
}, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--volt)"
  }
}, "Espace b\xE9n\xE9ficiaire"), /*#__PURE__*/React.createElement("h1", {
  className: "serif h1-mid",
  style: {
    fontSize: 72,
    lineHeight: 0.96,
    letterSpacing: "-0.035em",
    margin: "12px 0 18px",
    color: "var(--ink)",
    fontWeight: 500
  }
}, "Suivez votre dossier ", /*#__PURE__*/React.createElement("em", {
  style: {
    color: "var(--volt)"
  }
}, "en direct.")), /*#__PURE__*/React.createElement("p", {
  className: "body-fluid",
  style: {
    fontSize: 16,
    color: "var(--bone-soft)",
    lineHeight: 1.55,
    maxWidth: 720,
    margin: 0
  }
}, "Chaque \xE9tape de votre dossier CEE \u2014 \xE9ligibilit\xE9, constitution, contr\xF4le, validation, versement \u2014 visible et dat\xE9e. D\xE9posez vos pi\xE8ces justificatives en glisser-d\xE9poser et recevez vos notifications en temps r\xE9el.")), /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "0 32px"
  },
  className: "r-padbox"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--card)",
    border: "1px solid var(--rule-on)",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "var(--sh-2)"
  }
}, /*#__PURE__*/React.createElement(DossierTracker, {
  embedded: true
}))), /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "80px 32px 0"
  },
  className: "r-padbox section-pad"
}, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)",
    marginBottom: 18
  }
}, "Autres espaces"), /*#__PURE__*/React.createElement("div", {
  className: "r-cols-3",
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18
  }
}, [{
  t: "Espace partenaire",
  d: "Apporteurs d'affaires : déposez des dossiers, gérez votre équipe et votre catalogue d'opérations.",
  action: "Accéder"
}, {
  t: "Administration",
  d: "Pilotage de la plateforme : dossiers, partenaires, fiches d'opérations et paramètres.",
  action: "Accéder"
}].map(s => /*#__PURE__*/React.createElement("div", {
  key: s.t,
  style: {
    padding: 32,
    background: "var(--card)",
    border: "1px solid var(--rule-on)",
    borderRadius: 6,
    display: "flex",
    flexDirection: "column",
    gap: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "serif",
  style: {
    fontSize: 28,
    color: "var(--ink)",
    fontWeight: 500,
    letterSpacing: "-0.02em"
  }
}, s.t), /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 14,
    color: "var(--bone-soft)",
    lineHeight: 1.55,
    margin: 0
  }
}, s.d), /*#__PURE__*/React.createElement(Btn, {
  variant: "link"
}, s.action, " \u2192"))))));

// ─────────────────────────────────────────────────────────
// ContactPage
// ─────────────────────────────────────────────────────────
const ContactPage = () => {
  const toast = useToast();
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    role: "Apporteur",
    message: ""
  });
  const submit = e => {
    e.preventDefault();
    toast.push("success", "Message envoyé", "Notre équipe vous répond sous 24h ouvrées.");
    setForm({
      name: "",
      email: "",
      role: "Apporteur",
      message: ""
    });
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1320,
      margin: "0 auto",
      padding: "60px 32px 32px"
    },
    className: "r-padbox"
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--volt)"
    }
  }, "Contact"), /*#__PURE__*/React.createElement("h1", {
    className: "serif h1-mid",
    style: {
      fontSize: 72,
      lineHeight: 0.96,
      letterSpacing: "-0.035em",
      margin: "12px 0 18px",
      color: "var(--ink)",
      fontWeight: 500
    }
  }, "Parlons de votre ", /*#__PURE__*/React.createElement("em", {
    style: {
      color: "var(--volt)"
    }
  }, "parcours CEE.")), /*#__PURE__*/React.createElement("p", {
    className: "body-fluid",
    style: {
      fontSize: 16,
      color: "var(--bone-soft)",
      lineHeight: 1.55,
      maxWidth: 720,
      margin: 0
    }
  }, "Une question sur la plateforme, une demande de d\xE9mo, ou un partenariat \u2014 l'\xE9quipe r\xE9pond sous 24h.")), /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1320,
      margin: "0 auto",
      padding: "32px 32px 80px"
    },
    className: "r-padbox"
  }, /*#__PURE__*/React.createElement("div", {
    className: "r-cols-21",
    style: {
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr",
      gap: 48,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    style: {
      background: "var(--card)",
      border: "1px solid var(--rule-on)",
      borderRadius: 8,
      padding: 40,
      display: "flex",
      flexDirection: "column",
      gap: 18,
      boxShadow: "var(--sh-2)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "r-cols-form2",
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(FormField, {
    label: "Nom complet",
    value: form.name,
    onChange: v => setForm({
      ...form,
      name: v
    }),
    placeholder: "Marie Coignet"
  }), /*#__PURE__*/React.createElement(FormField, {
    label: "E-mail",
    value: form.email,
    onChange: v => setForm({
      ...form,
      email: v
    }),
    placeholder: "marie@entreprise.fr",
    type: "email"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)",
      marginBottom: 8
    }
  }, "R\xF4le"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 0,
      border: "1px solid var(--rule-on)",
      borderRadius: 4,
      overflow: "hidden"
    }
  }, ["Apporteur", "Bénéficiaire", "Obligé", "Autre"].map(r => /*#__PURE__*/React.createElement("button", {
    key: r,
    type: "button",
    onClick: () => setForm({
      ...form,
      role: r
    }),
    style: {
      flex: 1,
      padding: "12px 8px",
      background: form.role === r ? "var(--volt)" : "var(--card)",
      color: form.role === r ? "#fff" : "var(--ink)",
      border: 0,
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 500,
      transition: "all .15s"
    }
  }, r)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)",
      marginBottom: 8
    }
  }, "Message"), /*#__PURE__*/React.createElement("textarea", {
    value: form.message,
    onChange: e => setForm({
      ...form,
      message: e.target.value
    }),
    placeholder: "Pr\xE9sentez bri\xE8vement votre besoin\u2026",
    rows: 6,
    style: {
      width: "100%",
      padding: "14px 16px",
      background: "var(--card-2)",
      border: "1px solid var(--rule-on)",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--ink)",
      outline: 0,
      resize: "vertical",
      borderRadius: 4
    }
  })), /*#__PURE__*/React.createElement(Btn, {
    variant: "primary",
    arrow: true,
    magnetic: true
  }, "Envoyer"), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--bone-mute)"
    }
  }, "\u21B3 vos donn\xE9es restent en France \u2014 h\xE9bergement OVHcloud, certifi\xE9 HDS et ISO 27001.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(ContactBlock, {
    label: "Email g\xE9n\xE9ral",
    value: "contact@echowai.com"
  }), /*#__PURE__*/React.createElement(ContactBlock, {
    label: "D\xE9mo plateforme",
    value: "demo@echowai.com"
  }), /*#__PURE__*/React.createElement(ContactBlock, {
    label: "Apporteurs d'affaires",
    value: "partenaires@echowai.com"
  }), /*#__PURE__*/React.createElement(ContactBlock, {
    label: "Support b\xE9n\xE9ficiaires",
    value: "support@echowai.com"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      background: "var(--ink)",
      color: "#fff",
      borderRadius: 6
    },
    className: "on-ink"
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--volt)"
    }
  }, "D\xE9lai de r\xE9ponse"), /*#__PURE__*/React.createElement("div", {
    className: "serif",
    style: {
      fontSize: 32,
      color: "#fff",
      marginTop: 8,
      fontWeight: 500,
      letterSpacing: "-0.02em"
    }
  }, "Sous 24h ouvr\xE9es"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "rgba(255,255,255,.65)",
      marginTop: 6
    }
  }, "jours ouvr\xE9s \xB7 9h-19h CET"))))));
};
const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}) => /*#__PURE__*/React.createElement("label", {
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
}, label), /*#__PURE__*/React.createElement("input", {
  type: type,
  value: value,
  onChange: e => onChange(e.target.value),
  placeholder: placeholder,
  style: {
    background: "var(--card-2)",
    border: "1px solid var(--rule-on)",
    padding: "12px 14px",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--ink)",
    outline: 0,
    borderRadius: 4
  }
}));
const ContactBlock = ({
  label,
  value
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    borderLeft: "2px solid var(--volt)",
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)"
  }
}, label), /*#__PURE__*/React.createElement("div", {
  className: "mono",
  style: {
    fontSize: 15,
    color: "var(--ink)",
    marginTop: 6
  }
}, value));
Object.assign(window, {
  DispositifPage,
  FAQAccordion,
  SimulateurPage,
  MaterielPage,
  BeneficiairePage,
  ContactPage,
  FormField,
  ContactBlock
});