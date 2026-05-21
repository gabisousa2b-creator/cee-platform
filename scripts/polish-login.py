# -*- coding: utf-8 -*-
"""Améliore l'aspect visuel des 5 pages de login : orbs déco, profile badge avec icône,
gradient accent sur le mot de profil, animation d'apparition."""
import os, re
ROOT = os.path.join(os.path.dirname(__file__), "..", "public")

# Bloc CSS à insérer juste avant </style> du login screen
CSS_BLOCK = u"""
  /* ── Décor visuel ──────────────────────────────────────── */
  .orb { position: fixed; pointer-events: none; border-radius: 50%; filter: blur(80px); opacity: .55; z-index: 0; }
  .orb-1 { width: 460px; height: 460px; top: -180px; right: -120px; background: radial-gradient(circle, rgba(46,126,244,.28), transparent 70%); }
  .orb-2 { width: 380px; height: 380px; bottom: -140px; left: -120px; background: radial-gradient(circle, rgba(91,168,229,.20), transparent 70%); }
  .login-wrap { position: relative; z-index: 1; animation: ew-rise .55s var(--ease-out-quart, cubic-bezier(.25,1,.5,1)) both; }
  @keyframes ew-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  /* Badge profil — icône colorée dans un rond gradient, posé au-dessus du titre */
  .profile-badge {
    width: 56px; height: 56px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent, #2E7EF4), #5BA0FF);
    display: inline-flex; align-items: center; justify-content: center;
    color: #fff; box-shadow: 0 12px 28px -8px rgba(46,126,244,.45);
    margin: -2px 0 12px;
  }
  .profile-badge svg { width: 28px; height: 28px; }
  /* Gradient sur le mot de profil */
  .accent-word {
    background: linear-gradient(135deg, var(--accent, #2E7EF4), #5BA0FF 60%);
    -webkit-background-clip: text; background-clip: text;
    color: transparent; -webkit-text-fill-color: transparent;
  }
  .login-card { transition: box-shadow .3s ease, transform .3s ease; }
  .login-card:hover { box-shadow: 0 32px 80px -22px rgba(10,31,61,.24); transform: translateY(-1px); }
  .form-control:focus { border-color: var(--accent, #2E7EF4); box-shadow: 0 0 0 3px rgba(46,126,244,.15); outline: none; }
"""

# Icônes SVG par profil (24 viewBox, currentColor)
ICONS = {
    "mandataire":  '<svg viewBox="0 0 24 24" fill="none"><path d="M3 4v16h18V4H3zm2 2h14v3H5V6zm0 5h6v7H5v-7zm8 0h6v3h-6v-3zm0 4h6v3h-6v-3z" fill="currentColor"/></svg>',
    "oblige":      '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zm0 8L2 5v6l10 5 10-5V5l-10 5z" fill="currentColor"/></svg>',
    "delegataire": '<svg viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    "installateur":'<svg viewBox="0 0 24 24" fill="none"><path d="M22 21H2v-2h20v2zM6.5 13.5L9 11l3 3 5-5 2 2v6h-13v-3.5zM12 2L4 6v3h16V6L12 2z" fill="currentColor"/></svg>',
    "controleur":  '<svg viewBox="0 0 24 24" fill="none"><path d="M9 11l2 2 4-4m1 9H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    "beneficiaire":'<svg viewBox="0 0 24 24" fill="none"><path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" fill="currentColor"/></svg>',
}

# Pages à mettre à jour (id, label-mot-accent, icon-key, h3-template-to-find, h3-new)
PAGES = [
    ("mandataire.html",   "mandataire",  "mandataire",
     u'<h3 style="margin:0 0 4px;font-size:24px;letter-spacing:-.02em;font-weight:500">Espace <span style="color:var(--accent)">mandataire</span></h3>',
     u'<div class="profile-badge">{ICON}</div>\n    <h3 style="margin:0 0 4px;font-size:24px;letter-spacing:-.02em;font-weight:500">Espace <span class="accent-word">mandataire</span></h3>'),
    ("oblige.html",       "Obligé",      "oblige",
     u'<h3 style="margin:0 0 4px;font-size:24px;letter-spacing:-.02em;font-weight:500">Espace Obligé</h3>',
     u'<div class="profile-badge">{ICON}</div>\n    <h3 style="margin:0 0 4px;font-size:24px;letter-spacing:-.02em;font-weight:500">Espace <span class="accent-word">Obligé</span></h3>'),
    ("delegataire.html",  "Délégataire", "delegataire",
     u'<h3 style="margin:0 0 4px;font-size:24px;letter-spacing:-.02em;font-weight:500">Espace Délégataire</h3>',
     u'<div class="profile-badge">{ICON}</div>\n    <h3 style="margin:0 0 4px;font-size:24px;letter-spacing:-.02em;font-weight:500">Espace <span class="accent-word">Délégataire</span></h3>'),
    ("installateur.html", "Installateur","installateur",
     u'<h3 style="margin:0 0 4px;font-size:24px;letter-spacing:-.02em;font-weight:500">Espace Installateur</h3>',
     u'<div class="profile-badge">{ICON}</div>\n    <h3 style="margin:0 0 4px;font-size:24px;letter-spacing:-.02em;font-weight:500">Espace <span class="accent-word">Installateur</span></h3>'),
    ("controleur.html",   "Contrôleur",  "controleur",
     u'<h3 style="margin:0 0 4px;font-size:24px;letter-spacing:-.02em;font-weight:500">Espace Contrôleur</h3>',
     u'<div class="profile-badge">{ICON}</div>\n    <h3 style="margin:0 0 4px;font-size:24px;letter-spacing:-.02em;font-weight:500">Espace <span class="accent-word">Contrôleur</span></h3>'),
]

# Pour portal.html (bénéficiaire), titre différent
PORTAL_OLD = u'<h3 style="margin:0 0 4px;font-size:24px;letter-spacing:-.02em;font-weight:500">Espace bénéficiaire</h3>'
PORTAL_NEW = u'<div class="profile-badge">{ICON}</div>\n      <h3 style="margin:0 0 4px;font-size:24px;letter-spacing:-.02em;font-weight:500">Espace <span class="accent-word">bénéficiaire</span></h3>'.replace("{ICON}", ICONS["beneficiaire"])

for filename, label, icon_key, old_h3, new_h3_tpl in PAGES:
    p = os.path.join(ROOT, filename)
    s = open(p, encoding="utf-8").read()
    # 1. Inject CSS block right before </style>
    if "/* ── Décor visuel ──" not in s:
        s = s.replace("</style>", CSS_BLOCK + "</style>", 1)
    # 2. Add orbs to body opening
    if '<div class="orb orb-1"></div>' not in s:
        s = re.sub(r"<body([^>]*)>", r"<body\1>\n<div class=\"orb orb-1\"></div>\n<div class=\"orb orb-2\"></div>", s, count=1)
    # 3. Replace h3 with badge + accent
    new_h3 = new_h3_tpl.replace("{ICON}", ICONS[icon_key])
    if old_h3 in s:
        s = s.replace(old_h3, new_h3, 1)
    open(p, "w", encoding="utf-8").write(s)
    print("updated", filename)

# Portal.html — login section already has light card style
p = os.path.join(ROOT, "portal.html")
s = open(p, encoding="utf-8").read()
if "/* ── Décor visuel ──" not in s:
    # Insert CSS before </style> just BEFORE the first one (login styles)
    s = s.replace("</style>", CSS_BLOCK + "</style>", 1)
if '<div class="orb orb-1"></div>' not in s:
    s = re.sub(r"<body([^>]*)>", r"<body\1>\n<div class=\"orb orb-1\"></div>\n<div class=\"orb orb-2\"></div>", s, count=1)
if PORTAL_OLD in s:
    s = s.replace(PORTAL_OLD, PORTAL_NEW, 1)
open(p, "w", encoding="utf-8").write(s)
print("updated portal.html")
print("DONE")
