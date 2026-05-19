/* eslint-disable */
// EchoWAI — Site main App

function SiteApp() {
  const [view, setView] = React.useState("home");
  const [cmdKOpen, setCmdKOpen] = React.useState(false);
  useCmdK(() => setCmdKOpen(o => !o));
  const navigate = v => {
    setCmdKOpen(false);
    setView(v);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  const Page = {
    home: HomePage,
    dispositif: DispositifPage,
    simulateur: SimulateurPage,
    materiel: MaterielPage,
    beneficiaire: BeneficiairePage,
    contact: ContactPage
  }[view] || HomePage;
  return /*#__PURE__*/React.createElement(ToastProvider, null, /*#__PURE__*/React.createElement(SiteNav, {
    current: view,
    onNavigate: navigate,
    onCmdK: () => setCmdKOpen(true)
  }), /*#__PURE__*/React.createElement("main", {
    key: view,
    style: {
      animation: "revealUp .5s var(--ease-out-quart) both"
    }
  }, /*#__PURE__*/React.createElement(Page, {
    onNavigate: navigate
  })), /*#__PURE__*/React.createElement(SiteFooter, {
    onNavigate: navigate
  }), /*#__PURE__*/React.createElement(CmdKModal, {
    open: cmdKOpen,
    onClose: () => setCmdKOpen(false),
    onNavigate: navigate
  }));
}
const siteRoot = ReactDOM.createRoot(document.getElementById("root"));
siteRoot.render(/*#__PURE__*/React.createElement(SiteApp, null));