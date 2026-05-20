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
    background: "rgba(255,255,255,.62)",
    backdropFilter: "saturate(180%) blur(20px)",
    WebkitBackdropFilter: "saturate(180%) blur(20px)",
    border: "1px solid rgba(255,255,255,.55)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "var(--sh-3), inset 0 1px 0 rgba(255,255,255,.7)"
  }
}, /*#__PURE__*/React.createElement(Simulator, {
  embedded: true,
  onNavigate: onNavigate
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
    background: "rgba(255,255,255,.62)",
    backdropFilter: "saturate(180%) blur(20px)",
    WebkitBackdropFilter: "saturate(180%) blur(20px)",
    border: "1px solid rgba(255,255,255,.55)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "var(--sh-3), inset 0 1px 0 rgba(255,255,255,.7)"
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
    background: "rgba(255,255,255,.62)",
    backdropFilter: "saturate(180%) blur(20px)",
    WebkitBackdropFilter: "saturate(180%) blur(20px)",
    border: "1px solid rgba(255,255,255,.55)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "var(--sh-3), inset 0 1px 0 rgba(255,255,255,.7)"
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
    gridTemplateColumns: "1fr",
    gap: 18
  }
}, [{
  t: "Espace partenaire",
  d: "Apporteurs d'affaires : déposez des dossiers, gérez votre équipe et votre catalogue d'opérations.",
  action: "Accéder"
}].map(s => /*#__PURE__*/React.createElement(HoverLift, {
  key: s.t,
  style: {
    padding: 32,
    background: "var(--card)",
    border: "1px solid var(--rule-on)",
    borderRadius: 6,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    height: "100%"
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
}, s.d), /*#__PURE__*/React.createElement("span", {
  style: {
    marginTop: "auto"
  }
}, /*#__PURE__*/React.createElement(Btn, {
  variant: "link",
  onClick: () => onNavigate("login")
}, s.action, " \u2192")))))));

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

// ─────────────────────────────────────────────────────────
// Legal pages — Mentions légales, CGU, Confidentialité, Cookies
// ─────────────────────────────────────────────────────────
const LEGAL_UPDATED = "19 mai 2026";
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
const Todo = ({
  children
}) => /*#__PURE__*/React.createElement("span", {
  title: "Information \xE0 compl\xE9ter par l'\xE9diteur",
  style: {
    background: "var(--volt-soft)",
    color: "var(--volt-deep)",
    padding: "1px 7px",
    borderRadius: 3,
    fontFamily: "var(--font-mono)",
    fontSize: 12.5
  }
}, children);
const LegalBlocks = ({
  body
}) => /*#__PURE__*/React.createElement(React.Fragment, null, body.map((b, i) => {
  if (typeof b === "string") return /*#__PURE__*/React.createElement("p", {
    key: i,
    style: {
      fontSize: 14.5,
      lineHeight: 1.72,
      color: "var(--bone-soft)",
      margin: "0 0 14px"
    }
  }, b);
  if (b.h) return /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "upper",
    style: {
      color: "var(--ink)",
      fontSize: 12,
      margin: "22px 0 10px"
    }
  }, b.h);
  if (b.ul) return /*#__PURE__*/React.createElement("ul", {
    key: i,
    style: {
      margin: "0 0 16px",
      padding: 0,
      listStyle: "none",
      display: "flex",
      flexDirection: "column",
      gap: 9
    }
  }, b.ul.map((x, j) => /*#__PURE__*/React.createElement("li", {
    key: j,
    style: {
      fontSize: 14.5,
      lineHeight: 1.65,
      color: "var(--bone-soft)",
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--volt)",
      flexShrink: 0,
      fontWeight: 600
    }
  }, "\u2014"), /*#__PURE__*/React.createElement("span", null, x))));
  if (b.kv) return /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      border: "1px solid var(--rule-on)",
      borderRadius: 6,
      overflow: "hidden",
      margin: "0 0 16px"
    }
  }, b.kv.map((row, j) => /*#__PURE__*/React.createElement("div", {
    key: j,
    className: "legal-kv",
    style: {
      display: "flex",
      gap: 16,
      padding: "11px 16px",
      borderBottom: j < b.kv.length - 1 ? "1px solid var(--rule-on)" : "none",
      background: j % 2 ? "var(--card-2)" : "var(--card)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "upper",
    style: {
      color: "var(--muted)",
      width: 210,
      flexShrink: 0,
      fontSize: 11
    }
  }, row[0]), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--ink)",
      lineHeight: 1.5
    }
  }, row[1]))));
  if (b.action === "cookies") return /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      margin: "6px 0 18px"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "primary",
    arrow: true,
    onClick: () => window.EWCookies && window.EWCookies.open()
  }, "G\xE9rer mes pr\xE9f\xE9rences de cookies"));
  return null;
}));
const LegalDoc = ({
  label,
  title,
  updated,
  lede,
  sections,
  onNavigate
}) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
  style: {
    position: "relative",
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement(AuroraMesh, {
  intensity: 0.45
}), /*#__PURE__*/React.createElement("div", {
  style: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "60px 32px 26px",
    position: "relative"
  },
  className: "r-padbox section-pad"
}, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--volt)"
  }
}, label), /*#__PURE__*/React.createElement("h1", {
  className: "serif h1-mid",
  style: {
    fontSize: 58,
    lineHeight: 1.02,
    letterSpacing: "-0.03em",
    margin: "14px 0 14px",
    color: "var(--ink)",
    fontWeight: 500
  }
}, title), lede && /*#__PURE__*/React.createElement("p", {
  className: "body-fluid",
  style: {
    fontSize: 16,
    color: "var(--bone-soft)",
    lineHeight: 1.6,
    maxWidth: 720,
    margin: 0
  }
}, lede), /*#__PURE__*/React.createElement("div", {
  className: "mono",
  style: {
    fontSize: 12,
    color: "var(--bone-mute)",
    marginTop: 16
  }
}, "Derni\xE8re mise \xE0 jour \xB7 ", updated))), /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "8px 32px 24px"
  },
  className: "r-padbox section-pad"
}, /*#__PURE__*/React.createElement("div", {
  className: "r-cols-legal",
  style: {
    display: "grid",
    gridTemplateColumns: "248px 1fr",
    gap: 44,
    alignItems: "start"
  }
}, /*#__PURE__*/React.createElement("nav", {
  className: "legal-toc",
  style: {
    position: "sticky",
    top: 92,
    display: "flex",
    flexDirection: "column",
    gap: 1
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "upper",
  style: {
    color: "var(--muted)",
    marginBottom: 10
  }
}, "Sommaire"), sections.map((s, i) => /*#__PURE__*/React.createElement("a", {
  key: s.id,
  href: "#" + s.id,
  onClick: e => {
    e.preventDefault();
    scrollToId(s.id);
  },
  style: {
    fontSize: 13,
    color: "var(--bone-soft)",
    textDecoration: "none",
    padding: "6px 0",
    display: "flex",
    gap: 9,
    lineHeight: 1.4,
    transition: "color .15s"
  },
  onMouseEnter: e => e.currentTarget.style.color = "var(--volt)",
  onMouseLeave: e => e.currentTarget.style.color = "var(--bone-soft)"
}, /*#__PURE__*/React.createElement("span", {
  className: "mono",
  style: {
    color: "var(--volt)",
    flexShrink: 0
  }
}, String(i + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("span", null, s.title)))), /*#__PURE__*/React.createElement("article", {
  style: {
    background: "var(--card)",
    border: "1px solid var(--rule-on)",
    borderRadius: 8,
    padding: "36px 40px",
    boxShadow: "var(--sh-2)"
  },
  className: "legal-article"
}, sections.map((s, i) => /*#__PURE__*/React.createElement("div", {
  key: s.id,
  id: s.id,
  style: {
    scrollMarginTop: 92,
    marginBottom: i < sections.length - 1 ? 30 : 6
  }
}, /*#__PURE__*/React.createElement("h2", {
  className: "serif",
  style: {
    fontSize: 23,
    color: "var(--ink)",
    fontWeight: 500,
    letterSpacing: "-0.02em",
    margin: "0 0 14px",
    display: "flex",
    alignItems: "baseline",
    gap: 11
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "mono",
  style: {
    fontSize: 13,
    color: "var(--volt)"
  }
}, String(i + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("span", null, s.title)), /*#__PURE__*/React.createElement(LegalBlocks, {
  body: s.body
}))), /*#__PURE__*/React.createElement("div", {
  style: {
    borderTop: "1px solid var(--rule-on)",
    paddingTop: 22,
    marginTop: 10,
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  }
}, /*#__PURE__*/React.createElement(Btn, {
  variant: "secondary",
  arrow: true,
  onClick: () => onNavigate("contact")
}, "Une question ? Contactez-nous"), /*#__PURE__*/React.createElement(Btn, {
  variant: "ghost",
  onClick: () => onNavigate("home")
}, "\u2190 Retour \xE0 l'accueil"))))));
const MentionsPage = ({
  onNavigate
}) => /*#__PURE__*/React.createElement(LegalDoc, {
  label: "Informations l\xE9gales",
  title: "Mentions l\xE9gales",
  updated: LEGAL_UPDATED,
  onNavigate: onNavigate,
  lede: "Informations relatives \xE0 l'\xE9diteur et \xE0 l'h\xE9bergeur de la plateforme EchoWAI, conform\xE9ment \xE0 la loi n\xB0 2004-575 du 21 juin 2004 pour la confiance dans l'\xE9conomie num\xE9rique (LCEN).",
  sections: [{
    id: "ml-editeur",
    title: "Éditeur du site",
    body: ["Le site echowai.com et la plateforme accessible depuis compte.echowai.com sont édités par :", {
      kv: [["Raison sociale", /*#__PURE__*/React.createElement(Todo, null, "raison sociale de l'\xE9diteur")], ["Forme juridique", /*#__PURE__*/React.createElement(Todo, null, "SAS / SARL / \u2026")], ["Capital social", /*#__PURE__*/React.createElement(Todo, null, "montant en euros")], ["Siège social", /*#__PURE__*/React.createElement(Todo, null, "adresse postale compl\xE8te")], ["SIREN / SIRET", /*#__PURE__*/React.createElement(Todo, null, "num\xE9ro d'identification")], ["RCS", /*#__PURE__*/React.createElement(Todo, null, "ville et num\xE9ro d'immatriculation")], ["N° TVA intracommunautaire", /*#__PURE__*/React.createElement(Todo, null, "FR\u2026")], ["Directeur de la publication", /*#__PURE__*/React.createElement(Todo, null, "nom du repr\xE9sentant l\xE9gal")], ["Contact", "contact@echowai.com"]]
    }, "Les champs signalés ci-dessus doivent être complétés avec les informations légales de la société éditrice avant la mise en ligne définitive."]
  }, {
    id: "ml-hebergeur",
    title: "Hébergement",
    body: ["La plateforme est hébergée sur des serveurs situés au sein de l'Union européenne, par :", {
      kv: [["Hébergeur", /*#__PURE__*/React.createElement(Todo, null, "raison sociale de l'h\xE9bergeur")], ["Adresse", /*#__PURE__*/React.createElement(Todo, null, "adresse postale de l'h\xE9bergeur")], ["Localisation des données", "Union européenne"]]
    }, "Les données traitées par la plateforme sont conservées sur des infrastructures localisées dans l'Union européenne."]
  }, {
    id: "ml-pi",
    title: "Propriété intellectuelle",
    body: ["L'ensemble des éléments composant le site et la plateforme — structure, textes, identité visuelle, logos, illustrations, interfaces, code source et bases de données — est protégé par le droit de la propriété intellectuelle et reste la propriété exclusive de l'éditeur ou de ses partenaires.", "Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, de ces éléments, par quelque procédé que ce soit et sur quelque support que ce soit, est interdite sans l'autorisation écrite préalable de l'éditeur.", "Les marques et dénominations citées appartiennent à leurs titulaires respectifs."]
  }, {
    id: "ml-donnees",
    title: "Données personnelles",
    body: ["Le traitement des données à caractère personnel effectué dans le cadre de la plateforme est décrit dans la Politique de confidentialité, conformément au Règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés.", "Vous y trouverez le détail des données collectées, des finalités, des durées de conservation et des modalités d'exercice de vos droits."]
  }, {
    id: "ml-cookies",
    title: "Cookies",
    body: ["Le site utilise des cookies et traceurs dont la nature, les finalités et la durée de conservation sont décrites dans la page dédiée à la gestion des cookies. Vous pouvez à tout moment modifier vos préférences."]
  }, {
    id: "ml-resp",
    title: "Responsabilité",
    body: ["L'éditeur met tout en œuvre pour fournir des informations fiables et tenues à jour. Les estimations produites par le simulateur de prime sont fournies à titre strictement indicatif et ne constituent ni un engagement contractuel, ni une garantie du montant définitif de la prime CEE, lequel dépend des contrôles réglementaires applicables.", "L'éditeur ne saurait être tenu pour responsable des dommages directs ou indirects résultant de l'accès au site, de son utilisation, ou de l'impossibilité d'y accéder."]
  }, {
    id: "ml-droit",
    title: "Droit applicable",
    body: ["Les présentes mentions légales sont régies par le droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents."]
  }]
});
const CGUPage = ({
  onNavigate
}) => /*#__PURE__*/React.createElement(LegalDoc, {
  label: "Conditions d'utilisation",
  title: "Conditions g\xE9n\xE9rales d'utilisation",
  updated: LEGAL_UPDATED,
  onNavigate: onNavigate,
  lede: "Les pr\xE9sentes conditions d\xE9finissent les r\xE8gles d'acc\xE8s et d'utilisation de la plateforme EchoWAI de gestion des Certificats d'\xC9conomies d'\xC9nergie.",
  sections: [{
    id: "cgu-objet",
    title: "Objet",
    body: ["Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités de mise à disposition et d'utilisation de la plateforme EchoWAI, qui permet la simulation de primes CEE, la constitution et le suivi de dossiers, la commande de matériel éligible et le suivi du versement des primes.", "La plateforme s'adresse aux apporteurs d'affaires et à leurs équipes, aux bénéficiaires de travaux d'économies d'énergie, ainsi qu'aux administrateurs du dispositif."]
  }, {
    id: "cgu-acceptation",
    title: "Acceptation des conditions",
    body: ["L'accès et l'utilisation de la plateforme impliquent l'acceptation pleine et entière des présentes CGU. L'utilisateur qui n'accepte pas ces conditions est invité à ne pas utiliser le service.", "L'éditeur se réserve le droit de modifier les CGU à tout moment ; la version applicable est celle en vigueur à la date d'utilisation du service."]
  }, {
    id: "cgu-acces",
    title: "Accès au service",
    body: ["La plateforme est organisée en espaces distincts, accessibles selon le profil de l'utilisateur :", {
      ul: ["Espace partenaire — dépôt et gestion des dossiers, gestion des équipes, catalogue d'opérations et commande de matériel ;", "Espace bénéficiaire — suivi du dossier en temps réel et dépôt des pièces justificatives ;", "Espace administration — pilotage de la plateforme, des partenaires et des fiches d'opération."]
    }, "L'accès à certaines fonctionnalités nécessite la création d'un compte et l'attribution de droits par un administrateur ou un responsable de partenaire."]
  }, {
    id: "cgu-compte",
    title: "Comptes et sécurité",
    body: ["L'utilisateur est responsable de la confidentialité de ses identifiants de connexion et de toute activité réalisée depuis son compte.", "Il s'engage à informer sans délai l'éditeur de toute utilisation non autorisée de son compte ou de toute atteinte à la sécurité. L'éditeur ne saurait être tenu responsable des conséquences d'une divulgation des identifiants par l'utilisateur."]
  }, {
    id: "cgu-obligations",
    title: "Obligations de l'utilisateur",
    body: ["L'utilisateur s'engage à utiliser la plateforme conformément à sa destination, à la réglementation applicable et aux présentes CGU. Il s'interdit notamment :", {
      ul: ["de fournir des informations inexactes, trompeuses ou frauduleuses, en particulier dans les dossiers et pièces justificatives ;", "de porter atteinte au fonctionnement, à la sécurité ou à l'intégrité de la plateforme ;", "d'accéder à des données ou espaces auxquels il n'est pas autorisé ;", "de reproduire ou détourner tout ou partie du service à des fins non prévues."]
    }]
  }, {
    id: "cgu-simulation",
    title: "Simulation et estimation de prime",
    body: ["Le simulateur fournit une estimation indicative du montant de la prime CEE à partir des données saisies par l'utilisateur. Cette estimation ne constitue ni un devis, ni un engagement contractuel.", "Le montant définitif de la prime dépend de la fiche d'opération applicable, du cours du certificat, de la situation du bénéficiaire et des contrôles réglementaires. Il ne peut être garanti qu'au terme de la validation du dossier."]
  }, {
    id: "cgu-materiel",
    title: "Commande de matériel et primes",
    body: ["L'espace partenaire permet la commande de matériel éligible auprès d'un catalogue central. Les prix, la disponibilité et les délais sont indiqués au moment de la commande.", "La constitution et la valorisation des dossiers CEE s'effectuent dans le respect du cadre réglementaire applicable aux Certificats d'Économies d'Énergie. Le versement de la prime est conditionné à la validation des pièces justificatives."]
  }, {
    id: "cgu-dispo",
    title: "Disponibilité et maintenance",
    body: ["L'éditeur s'efforce d'assurer la disponibilité de la plateforme 24h/24, sans toutefois y être tenu. L'accès peut être suspendu pour des opérations de maintenance, de mise à jour ou pour des raisons de sécurité, sans que cela n'ouvre droit à indemnité."]
  }, {
    id: "cgu-pi",
    title: "Propriété intellectuelle",
    body: ["La plateforme, ses composants logiciels, son identité visuelle et ses contenus sont protégés par le droit de la propriété intellectuelle. L'utilisation du service ne confère à l'utilisateur aucun droit de propriété sur ces éléments.", "Les données saisies par l'utilisateur restent sa propriété ; il concède à l'éditeur les droits nécessaires à leur traitement pour la fourniture du service."]
  }, {
    id: "cgu-resp",
    title: "Responsabilité",
    body: ["L'éditeur fournit le service avec diligence mais ne saurait garantir l'absence totale d'erreur ou d'interruption. Sa responsabilité ne peut être engagée pour les dommages indirects, ni pour les conséquences d'informations erronées fournies par l'utilisateur.", "L'utilisateur demeure seul responsable de l'exactitude des données qu'il renseigne et de la conformité des dossiers qu'il dépose."]
  }, {
    id: "cgu-donnees",
    title: "Données personnelles",
    body: ["Les traitements de données personnelles réalisés dans le cadre de la plateforme sont décrits dans la Politique de confidentialité, que l'utilisateur est invité à consulter."]
  }, {
    id: "cgu-droit",
    title: "Modification et droit applicable",
    body: ["Les présentes CGU sont régies par le droit français. En cas de litige, les parties rechercheront une solution amiable avant toute action contentieuse ; à défaut, les tribunaux français seront compétents."]
  }]
});
const ConfidentialitePage = ({
  onNavigate
}) => /*#__PURE__*/React.createElement(LegalDoc, {
  label: "Protection des donn\xE9es",
  title: "Politique de confidentialit\xE9",
  updated: LEGAL_UPDATED,
  onNavigate: onNavigate,
  lede: "Cette politique d\xE9crit la mani\xE8re dont EchoWAI collecte et traite vos donn\xE9es \xE0 caract\xE8re personnel, conform\xE9ment au R\xE8glement g\xE9n\xE9ral sur la protection des donn\xE9es (RGPD) et \xE0 la loi Informatique et Libert\xE9s.",
  sections: [{
    id: "rgpd-resp",
    title: "Responsable du traitement",
    body: ["Le responsable du traitement des données est la société éditrice de la plateforme EchoWAI, dont les coordonnées figurent dans les mentions légales.", "Pour toute question relative à la protection de vos données, vous pouvez écrire à : ", {
      kv: [["Contact protection des données", "contact@echowai.com"]]
    }]
  }, {
    id: "rgpd-donnees",
    title: "Données collectées",
    body: ["Selon votre profil et votre usage de la plateforme, nous sommes susceptibles de collecter :", {
      ul: ["des données d'identification : nom, prénom, adresse e-mail, fonction, société de rattachement ;", "des données de connexion et d'usage : identifiants de compte, journaux techniques, adresse IP, horodatage ;", "des données relatives aux dossiers CEE : informations sur les bénéficiaires, les opérations, les pièces justificatives et le matériel commandé ;", "des données de contact transmises via les formulaires du site."]
    }]
  }, {
    id: "rgpd-finalites",
    title: "Finalités et bases légales",
    body: ["Vos données sont traitées pour les finalités suivantes :", {
      ul: ["fournir et gérer l'accès à la plateforme et à ses espaces — exécution du contrat ou mesures précontractuelles ;", "constituer, instruire et suivre les dossiers de Certificats d'Économies d'Énergie — exécution du contrat et obligation légale ;", "assurer la sécurité, la prévention de la fraude et le bon fonctionnement du service — intérêt légitime ;", "répondre à vos demandes de contact ou de démonstration — intérêt légitime ou consentement ;", "mesurer l'audience du site — consentement, via les cookies concernés."]
    }]
  }, {
    id: "rgpd-destinataires",
    title: "Destinataires des données",
    body: ["Vos données sont accessibles aux personnels habilités de l'éditeur ainsi que, le cas échéant, aux partenaires intervenant dans le traitement de votre dossier (apporteurs, délégataires, organismes de contrôle).", "Elles peuvent également être communiquées à des sous-traitants techniques (hébergement, messagerie) agissant sur instruction de l'éditeur, ainsi qu'aux autorités administratives lorsque la réglementation CEE l'exige."]
  }, {
    id: "rgpd-duree",
    title: "Durée de conservation",
    body: ["Les données sont conservées pour la durée strictement nécessaire aux finalités poursuivies :", {
      ul: ["données de compte : pendant la durée de la relation, puis archivées selon les obligations légales ;", "données de dossiers CEE : pendant la durée requise par la réglementation applicable aux Certificats d'Économies d'Énergie ;", "données de contact : jusqu'à 3 ans à compter du dernier échange ;", "journaux techniques : généralement 12 mois."]
    }]
  }, {
    id: "rgpd-securite",
    title: "Sécurité",
    body: ["L'éditeur met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre la perte, l'altération ou l'accès non autorisé : contrôle des accès, chiffrement des échanges, hébergement sécurisé et journalisation."]
  }, {
    id: "rgpd-transferts",
    title: "Transferts hors de l'Union européenne",
    body: ["Les données sont hébergées et traitées au sein de l'Union européenne. En l'absence de transfert hors UE, aucune garantie spécifique d'encadrement n'est requise. Tout recours futur à un prestataire hors UE serait assorti des garanties prévues par le RGPD."]
  }, {
    id: "rgpd-droits",
    title: "Vos droits",
    body: ["Conformément à la réglementation, vous disposez des droits suivants sur vos données :", {
      ul: ["droit d'accès et de rectification ;", "droit à l'effacement, dans les limites des obligations légales de conservation ;", "droit à la limitation et droit d'opposition au traitement ;", "droit à la portabilité des données que vous avez fournies ;", "droit de définir des directives relatives au sort de vos données après votre décès."]
    }, "Pour exercer ces droits, écrivez à contact@echowai.com en justifiant de votre identité. Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr)."]
  }, {
    id: "rgpd-cookies",
    title: "Cookies",
    body: ["Le site utilise des cookies dont le détail et les modalités de gestion sont précisés dans la page dédiée à la gestion des cookies.", {
      action: "cookies"
    }]
  }]
});
const CookiesPage = ({
  onNavigate
}) => /*#__PURE__*/React.createElement(LegalDoc, {
  label: "Cookies",
  title: "Gestion des cookies",
  updated: LEGAL_UPDATED,
  onNavigate: onNavigate,
  lede: "Cette page explique ce que sont les cookies, ceux que la plateforme EchoWAI utilise, et la mani\xE8re dont vous pouvez \xE0 tout moment contr\xF4ler vos pr\xE9f\xE9rences.",
  sections: [{
    id: "ck-def",
    title: "Qu'est-ce qu'un cookie ?",
    body: ["Un cookie est un petit fichier déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la consultation d'un site. Il permet notamment de faire fonctionner le service, de mémoriser vos choix et, sous réserve de votre accord, de mesurer l'audience.", "Le dépôt des cookies non strictement nécessaires est soumis à votre consentement, recueilli via le bandeau affiché lors de votre première visite."]
  }, {
    id: "ck-types",
    title: "Cookies utilisés",
    body: ["La plateforme utilise trois catégories de cookies :", {
      kv: [["Strictement nécessaires", "Session, authentification, sécurité et équilibrage de charge. Indispensables au fonctionnement du service — déposés sans consentement."], ["Mesure d'audience", "Statistiques de fréquentation anonymisées, destinées à améliorer la plateforme. Soumis à votre consentement."], ["Préférences", "Mémorisation de vos choix d'affichage et de navigation. Soumis à votre consentement."]]
    }]
  }, {
    id: "ck-gerer",
    title: "Gérer vos préférences",
    body: ["Vous pouvez accepter ou refuser les cookies non essentiels, et modifier votre choix à tout moment via le gestionnaire de préférences :", {
      action: "cookies"
    }, "Le retrait de votre consentement n'affecte pas le fonctionnement des cookies strictement nécessaires."]
  }, {
    id: "ck-tiers",
    title: "Cookies tiers",
    body: ["Certains cookies peuvent être déposés par des services tiers (par exemple des outils de mesure d'audience). Ces tiers sont responsables de l'usage qu'ils font des informations collectées, dans le cadre de leurs propres politiques."]
  }, {
    id: "ck-duree",
    title: "Durée de conservation",
    body: ["Les cookies ont une durée de vie limitée : les cookies de session expirent à la fermeture du navigateur ; les autres cookies sont conservés pour une durée maximale de 13 mois. Votre choix de consentement est, lui, conservé jusqu'à 6 mois, après quoi le bandeau vous est de nouveau présenté."]
  }, {
    id: "ck-navigateur",
    title: "Paramétrer votre navigateur",
    body: ["Vous pouvez également configurer votre navigateur pour accepter ou refuser les cookies, ou être averti de leur dépôt. Chaque navigateur propose ses propres réglages, généralement accessibles depuis le menu « Options » ou « Préférences », rubrique « Confidentialité ».", "Le blocage de l'ensemble des cookies peut toutefois dégrader certaines fonctionnalités de la plateforme."]
  }, {
    id: "ck-plus",
    title: "En savoir plus",
    body: ["Pour davantage d'informations sur les cookies et la protection de votre vie privée, vous pouvez consulter le site de la CNIL (www.cnil.fr). Le traitement de vos données personnelles est par ailleurs détaillé dans notre Politique de confidentialité."]
  }]
});
Object.assign(window, {
  DispositifPage,
  FAQAccordion,
  SimulateurPage,
  MaterielPage,
  BeneficiairePage,
  ContactPage,
  FormField,
  ContactBlock,
  MentionsPage,
  CGUPage,
  ConfidentialitePage,
  CookiesPage,
  LegalDoc,
  LegalBlocks,
  Todo,
  scrollToId
});