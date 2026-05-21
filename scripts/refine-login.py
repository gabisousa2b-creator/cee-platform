# -*- coding: utf-8 -*-
"""Login épuré : logo centré, suppression des orbs, profile badge + titre centrés."""
import os, re
ROOT = os.path.join(os.path.dirname(__file__), "..", "public")

NEW_DECOR_CSS = u"""
  /* ── Décor visuel — épuré ─────────────────────────────── */
  .login-wrap { position: relative; z-index: 1; animation: ew-rise .55s var(--ease-out-quart, cubic-bezier(.25,1,.5,1)) both; text-align: center; }
  .login-wrap > .ew-logo-host { display: flex; justify-content: center; margin-bottom: 22px; padding: 0; }
  .login-wrap > .ew-logo-host .ew-logo { font-size: 1.7rem; }
  @keyframes ew-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  .login-card {
    background: #fff;
    border: 1px solid rgba(10,31,61,.06);
    border-radius: 18px;
    padding: 36px 32px 32px;
    box-shadow: 0 24px 64px -22px rgba(10,31,61,.14), 0 6px 18px -8px rgba(10,31,61,.06);
    text-align: left;
  }
  /* Badge profil — centré, dégradé doux */
  .profile-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent, #2E7EF4), #5BA0FF);
    display: flex; align-items: center; justify-content: center;
    color: #fff; box-shadow: 0 10px 26px -10px rgba(46,126,244,.55);
    margin: 0 auto 16px;
  }
  .profile-badge svg { width: 26px; height: 26px; }
  /* Titre centré, sub-line centrée, form aligné à gauche */
  .login-card h3 { text-align: center; margin: 0 0 6px !important; }
  .login-card .login-sub { text-align: center; margin: 4px 0 26px !important; }
  .accent-word {
    background: linear-gradient(135deg, var(--accent, #2E7EF4), #5BA0FF 60%);
    -webkit-background-clip: text; background-clip: text;
    color: transparent; -webkit-text-fill-color: transparent;
  }
  .form-control:focus { border-color: var(--accent, #2E7EF4); box-shadow: 0 0 0 3px rgba(46,126,244,.13); outline: none; }
  /* Suppression complète des orbs précédentes */
  .orb { display: none !important; }
"""

PAGES = [
    "mandataire.html", "oblige.html", "delegataire.html",
    "installateur.html", "controleur.html", "portal.html",
]

for f in PAGES:
    p = os.path.join(ROOT, f)
    s = open(p, encoding="utf-8").read()
    # Replace previous décor block
    s = re.sub(r"\s*/\* ── D[ée]cor visuel.*?\*/.*?(?=</style>)", "", s, count=1, flags=re.DOTALL)
    # Inject new CSS before first </style>
    s = s.replace("</style>", NEW_DECOR_CSS + "</style>", 1)
    # Center logo: wrap the existing ew-logo line in a logo-host div
    s = re.sub(
        r'<div style="text-align:left;\s*margin-bottom:\s*\d+px;\s*padding-left:\s*\d+px;">\s*<span class="ew-logo"',
        '<div class="ew-logo-host"><span class="ew-logo"',
        s
    )
    # Also support portal which had different wrapper (already covered if string matched). Add fallback for portal pattern.
    open(p, "w", encoding="utf-8").write(s)
    print("refined", f)
print("DONE")
