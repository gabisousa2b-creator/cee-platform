/* eslint-disable */
// EchoWAI — Site main App

const SITE_PAGES = {
  home: HomePage,
  dispositif: DispositifPage,
  simulateur: SimulateurPage,
  materiel: MaterielPage,
  beneficiaire: BeneficiairePage,
  contact: ContactPage,
  mentions: MentionsPage,
  cgu: CGUPage,
  confidentialite: ConfidentialitePage,
  cookies: CookiesPage
};
function SiteApp() {
  const [view, setView] = React.useState(() => {
    const h = (location.hash || "").replace(/^#\/?/, "");
    return SITE_PAGES[h] ? h : "home";
  });
  const [cmdKOpen, setCmdKOpen] = React.useState(false);
  useCmdK(() => setCmdKOpen(o => !o));
  const navigate = v => {
    setCmdKOpen(false);
    if (v === "login") {
      goLogin();
      return;
    }
    if (!SITE_PAGES[v]) v = "home";
    if (location.hash !== "#/" + v) location.hash = "#/" + v;
    setView(v);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Back / forward button + deep links
  React.useEffect(() => {
    const onHash = () => {
      const h = (location.hash || "").replace(/^#\/?/, "");
      setView(SITE_PAGES[h] ? h : "home");
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const Page = SITE_PAGES[view] || HomePage;
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
  }), /*#__PURE__*/React.createElement(CookieBanner, {
    onNavigate: navigate
  }));
}
const siteRoot = ReactDOM.createRoot(document.getElementById("root"));
siteRoot.render(/*#__PURE__*/React.createElement(SiteApp, null));