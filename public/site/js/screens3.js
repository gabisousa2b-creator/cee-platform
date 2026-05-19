/* eslint-disable */
// EchoWAI — Screen 3: Commande Matériel

const MATERIALS = [{
  code: "ISO-LV-300",
  name: "Laine de verre rouleau · 300 mm",
  sector: "RES",
  unit: "/m² · TVA 5,5%",
  price: "12,40 €",
  leadtime: "48h · expédié sous 24h",
  image: "ISOLANT — laine de verre"
}, {
  code: "PAC-AW-12",
  name: "Pompe à chaleur air/eau · 12 kW",
  sector: "RES",
  unit: "unité · pose incluse",
  price: "4 280 €",
  leadtime: "5-7 j",
  image: "PAC AIR/EAU 12kW"
}, {
  code: "RT-VMC-D2",
  name: "VMC double flux · 250 m³/h",
  sector: "RES",
  unit: "unité · raccordement compris",
  price: "1 095 €",
  leadtime: "3-5 j",
  image: "VMC DOUBLE FLUX"
}, {
  code: "TH-CON-PRG",
  name: "Régulateur connecté programmable",
  sector: "BAT",
  unit: "unité · pilotage à distance",
  price: "168 €",
  leadtime: "24h",
  image: "RÉGULATEUR"
}, {
  code: "ECL-LED-TS",
  name: "Tube LED T8 · 1500 mm · 22W",
  sector: "BAT",
  unit: "/pièce · lot de 25",
  price: "9,80 €",
  leadtime: "48h",
  image: "TUBE LED T8"
}, {
  code: "AGR-PAC-EL",
  name: "PAC bâtiment d'élevage · 18 kW",
  sector: "AGRI",
  unit: "unité · raccordement",
  price: "6 920 €",
  leadtime: "7-10 j",
  image: "PAC ÉLEVAGE"
}];
const MaterialOrder = ({
  embedded = false
}) => {
  const [cart, setCart] = React.useState([{
    code: "ISO-LV-300",
    qty: 142,
    price: 12.40,
    name: "Laine de verre 300mm"
  }, {
    code: "TH-CON-PRG",
    qty: 1,
    price: 168,
    name: "Régulateur connecté"
  }]);
  const [filter, setFilter] = React.useState("Tous");
  const [snap, setSnap] = React.useState(null); // {x,y} of last add
  const [resteZero, setResteZero] = React.useState(false);
  const cartRef = React.useRef(null);
  const handleAdd = (m, e) => {
    const rect = e?.currentTarget?.getBoundingClientRect();
    if (rect && cartRef.current) {
      const cartRect = cartRef.current.getBoundingClientRect();
      setSnap({
        from: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        },
        to: {
          x: cartRect.left + 40,
          y: cartRect.top + 40
        },
        label: m.name,
        id: Math.random()
      });
      setTimeout(() => setSnap(null), 900);
    }
    setCart(c => {
      const ex = c.find(x => x.code === m.code);
      if (ex) return c.map(x => x.code === m.code ? {
        ...x,
        qty: x.qty + 1
      } : x);
      return [...c, {
        code: m.code,
        qty: 1,
        price: parseFloat(m.price.replace(/[^\d,]/g, "").replace(",", ".")),
        name: m.name
      }];
    });
  };
  const total = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const items = filter === "Tous" ? MATERIALS : MATERIALS.filter(m => m.sector === filter);
  // Pricing logic — toggle drives the model
  const advance = resteZero ? total : Math.min(total * 0.4, 2847);
  const reste = resteZero ? 0 : total - advance;
  const content = /*#__PURE__*/React.createElement(React.Fragment, null, snap && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      left: snap.from.x,
      top: snap.from.y,
      zIndex: 100,
      background: "var(--volt)",
      color: "var(--ink)",
      padding: "6px 10px",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: ".08em",
      textTransform: "uppercase",
      transform: `translate(${snap.to.x - snap.from.x}px, ${snap.to.y - snap.from.y}px) scale(0.3)`,
      opacity: 0,
      transition: "all .8s var(--ease-out-quart)",
      pointerEvents: "none",
      whiteSpace: "nowrap"
    }
  }, "+ ", snap.label), /*#__PURE__*/React.createElement("div", {
    className: "r-cols-cart",
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 380px",
      height: embedded ? "auto" : "calc(100% - 77px)",
      minHeight: embedded ? 900 : "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "catalog-pane",
    style: {
      padding: "40px 48px",
      overflowY: "auto",
      borderRight: "1px solid var(--ink-line)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--muted)"
    }
  }, "Espace partenaire \xB7 Commande mat\xE9riel"), /*#__PURE__*/React.createElement("h2", {
    className: "serif",
    style: {
      fontSize: 52,
      lineHeight: 0.95,
      letterSpacing: "-0.03em",
      margin: "12px 0 8px",
      fontWeight: 400,
      color: "var(--bone)"
    }
  }, "Commandez", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", {
    style: {
      color: "var(--volt)"
    }
  }, "pour le b\xE9n\xE9ficiaire.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: "var(--muted)",
      maxWidth: 540,
      lineHeight: 1.55,
      margin: 0
    }
  }, "Mat\xE9riel \xE9ligible CEE, livr\xE9 directement chez le b\xE9n\xE9ficiaire et rattach\xE9 au dossier en cours. Une seule commande, un seul interlocuteur.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, ["Tous", "RES", "BAT", "AGRI"].map(f => /*#__PURE__*/React.createElement("button", {
    key: f,
    onClick: () => setFilter(f),
    style: {
      padding: "8px 14px",
      background: f === filter ? "var(--volt)" : "transparent",
      color: f === filter ? "var(--ink)" : "var(--bone)",
      border: `1px solid ${f === filter ? "var(--volt)" : "var(--ink-line)"}`,
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: ".08em",
      textTransform: "uppercase",
      cursor: "pointer",
      transition: "all .2s"
    }
  }, f)))), /*#__PURE__*/React.createElement("div", {
    className: "r-cols-4",
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 18
    }
  }, items.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.code,
    onClick: e => handleAdd(m, e)
  }, /*#__PURE__*/React.createElement(MaterialCardLite, m)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      padding: "20px 24px",
      background: "var(--ink-2)",
      border: "1px solid var(--ink-line)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: 4
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--volt)",
      marginBottom: 4
    }
  }, "Avantage partenaire"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "var(--bone)"
    }
  }, "Toute commande > 5 000 \u20AC d\xE9clenche une ", /*#__PURE__*/React.createElement("strong", null, "avance sur prime"), " au b\xE9n\xE9ficiaire d\xE8s exp\xE9dition.")), /*#__PURE__*/React.createElement(Btn, {
    variant: "link"
  }, "Conditions"))), /*#__PURE__*/React.createElement("div", {
    ref: cartRef,
    className: "cart-pane",
    style: {
      padding: 32,
      background: "var(--card-2)",
      display: "flex",
      flexDirection: "column",
      gap: 20,
      position: "relative",
      overflow: "hidden",
      borderLeft: "1px solid var(--rule-on)"
    }
  }, /*#__PURE__*/React.createElement(Orb, {
    size: 400,
    color: "var(--volt-glow)",
    style: {
      top: -120,
      right: -100,
      opacity: .6
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "upper",
    style: {
      color: "var(--volt)"
    }
  }, "Panier \xB7 dossier rattach\xE9"), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--bone-mute)"
    }
  }, "ECW-2026-04417")), /*#__PURE__*/React.createElement("div", {
    className: "serif",
    style: {
      fontSize: 24,
      lineHeight: 1.15,
      color: "var(--bone)",
      marginTop: 8
    }
  }, "Hubert & fils SARL", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--muted)",
      fontFamily: "var(--font-sans)"
    }
  }, "BAR-EN-101 \xB7 Isolation"))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--ink-line)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      position: "relative"
    }
  }, cart.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: c.code,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--bone)"
    }
  }, c.name), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 13,
      color: "var(--volt)"
    }
  }, new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(c.qty * c.price))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 11,
      color: "var(--bone-mute)"
    },
    className: "mono"
  }, /*#__PURE__*/React.createElement("span", null, c.code, " \xB7 ", c.qty, " \xD7"), /*#__PURE__*/React.createElement("span", null, c.price.toFixed(2), " \u20AC"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--ink-line)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: resteZero ? "var(--volt)" : "var(--card)",
      border: `1px solid ${resteZero ? "var(--volt)" : "var(--rule-on)"}`,
      padding: "12px 14px",
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      cursor: "pointer",
      transition: "all .25s var(--ease-out-quart)",
      boxShadow: resteZero ? "0 8px 24px -8px var(--volt-glow)" : "none"
    },
    onClick: () => setResteZero(!resteZero)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: resteZero ? "#fff" : "var(--ink)"
    }
  }, "Reste \xE0 charge \xE0 0 \u20AC"), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10,
      color: resteZero ? "rgba(255,255,255,.78)" : "var(--muted)"
    }
  }, resteZero ? "avance étendue · couverture intégrale" : "modèle standard · avance 40 %")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 38,
      height: 22,
      borderRadius: 11,
      background: resteZero ? "rgba(255,255,255,.95)" : "var(--card-3)",
      border: `1px solid ${resteZero ? "rgba(255,255,255,.95)" : "var(--rule-on)"}`,
      transition: "all .25s var(--ease-out-quart)",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 1,
      left: resteZero ? 17 : 1,
      width: 18,
      height: 18,
      borderRadius: "50%",
      background: resteZero ? "var(--volt)" : "var(--bone-mute)",
      transition: "all .3s var(--ease-out-quart)",
      boxShadow: "0 1px 3px rgba(10,31,61,.2)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--muted)"
    }
  }, "Sous-total HT"), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 13,
      color: "var(--bone)"
    }
  }, new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(total))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--muted)"
    }
  }, resteZero ? "Couverture CEE intégrale" : "Avance sur prime"), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 13,
      color: "var(--st-valide)"
    }
  }, "\u2212 ", new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(advance))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--ink-line)",
      margin: "12px 0"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--bone)",
      fontWeight: 600
    }
  }, "Reste \xE0 charge"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(LiquidNumber, {
    value: Math.round(reste),
    size: 32,
    color: resteZero ? "var(--st-valide)" : "var(--volt)"
  }), /*#__PURE__*/React.createElement("span", {
    className: "serif",
    style: {
      fontSize: 18,
      color: resteZero ? "var(--st-valide)" : "var(--volt)"
    }
  }, "\u20AC"))), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--bone-mute)"
    }
  }, resteZero ? "✓ bénéficiaire ne paie rien" : "net après prime CEE")), /*#__PURE__*/React.createElement(Btn, {
    variant: "primary",
    arrow: true,
    full: true,
    magnetic: true
  }, "Confirmer la commande"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      fontSize: 11,
      color: "var(--bone-mute)"
    },
    className: "mono"
  }, /*#__PURE__*/React.createElement("div", null, "\u21B3 livraison estim\xE9e \xB7 23/05/2026"), /*#__PURE__*/React.createElement("div", null, "\u21B3 rattachement automatique au dossier"), /*#__PURE__*/React.createElement("div", null, "\u21B3 facture \xE9mise sous 48h")))));
  if (embedded) return content;
  return /*#__PURE__*/React.createElement("div", {
    style: pageBg("1100px")
  }, /*#__PURE__*/React.createElement(ScreenChrome, {
    url: "echowai.com/partenaire/materiel",
    height: 1100
  }, /*#__PURE__*/React.createElement(TopNav, {
    active: "Mat\xE9riel"
  }), content));
};

// Compact material card — clickable, shows hover-add affordance
const MaterialCardLite = ({
  name,
  code,
  sector,
  unit,
  price,
  leadtime,
  image
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--card)",
    border: "1px solid var(--ink-line)",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    position: "relative",
    overflow: "hidden",
    transition: "all .25s var(--ease-out-quart)",
    cursor: "pointer"
  },
  onMouseEnter: e => {
    e.currentTarget.style.borderColor = "var(--volt)";
    e.currentTarget.style.transform = "translateY(-2px)";
  },
  onMouseLeave: e => {
    e.currentTarget.style.borderColor = "var(--ink-line)";
    e.currentTarget.style.transform = "translateY(0)";
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    height: 110,
    background: "var(--card-3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    padding: "6px 14px"
  }
}, /*#__PURE__*/React.createElement(ProductIllustration, {
  code: code
}), /*#__PURE__*/React.createElement("span", {
  style: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "var(--ink)",
    color: "#FFFFFF",
    padding: "3px 6px",
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    letterSpacing: ".08em"
  }
}, sector)), /*#__PURE__*/React.createElement("div", {
  className: "mono",
  style: {
    fontSize: 10,
    color: "var(--bone-mute)"
  }
}, code), /*#__PURE__*/React.createElement("div", {
  className: "serif",
  style: {
    fontSize: 19,
    lineHeight: 1.15,
    color: "var(--bone)",
    letterSpacing: "-0.015em",
    minHeight: 44
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
    fontSize: 10,
    color: "var(--muted)"
  }
}, unit)), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 10,
    color: "var(--muted)",
    display: "flex",
    alignItems: "center",
    gap: 6
  },
  className: "mono"
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "var(--st-valide)"
  },
  className: "volt-dot"
}), leadtime), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 6,
    padding: "8px 0",
    textAlign: "center",
    border: "1px solid var(--volt)",
    color: "var(--volt)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 2
  }
}, "+ Ajouter au dossier"));
Object.assign(window, {
  MaterialOrder,
  MaterialCardLite
});