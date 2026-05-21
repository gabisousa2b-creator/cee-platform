# -*- coding: utf-8 -*-
"""Apple-style liquid glass sur les login cards : backdrop-filter blur+saturate,
fond mesh pastel doux, border highlight, shadows layered."""
import os
ROOT = os.path.join(os.path.dirname(__file__), "..", "public")

GLASS_CSS = u"""
  /* ── Apple-style liquid glass background ─────────────────── */
  body {
    background:
      radial-gradient(circle at 18% 18%, rgba(91,168,229,.28), transparent 55%),
      radial-gradient(circle at 82% 12%, rgba(46,126,244,.22), transparent 60%),
      radial-gradient(circle at 75% 88%, rgba(167,139,250,.18), transparent 60%),
      radial-gradient(circle at 12% 82%, rgba(96,165,250,.20), transparent 55%),
      #eef1f6 !important;
    background-attachment: fixed !important;
  }
  /* Liquid glass card */
  .login-card {
    background: rgba(255, 255, 255, 0.55) !important;
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    backdrop-filter: blur(30px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.6) !important;
    border-radius: 22px !important;
    box-shadow:
      0 30px 80px -28px rgba(10, 31, 61, 0.22),
      0 8px 24px -10px rgba(10, 31, 61, 0.10),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.6) !important;
    position: relative; overflow: hidden;
  }
  /* Subtle inner top highlight (liquid sheen) */
  .login-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.9) 50%, transparent);
    pointer-events: none;
  }
  /* Inputs in glass — translucent, refined focus */
  .login-card .form-control,
  .login-card .code-input {
    background: rgba(255, 255, 255, 0.65) !important;
    border: 1px solid rgba(10, 31, 61, 0.08) !important;
    backdrop-filter: blur(6px);
    transition: all .25s ease;
  }
  .login-card .form-control:focus,
  .login-card .code-input:focus {
    background: rgba(255, 255, 255, 0.92) !important;
    border-color: var(--accent, #2E7EF4) !important;
    box-shadow: 0 0 0 4px rgba(46, 126, 244, 0.16), 0 6px 18px -8px rgba(46, 126, 244, 0.25) !important;
  }
  /* Buttons keep solid for hierarchy */
  .login-card .btn-login,
  .login-card .btn-pri-login {
    box-shadow: 0 12px 30px -10px rgba(46,126,244,.50), inset 0 1px 0 0 rgba(255,255,255,.25);
  }
  /* Profile badge — glass-pop avec halo */
  .profile-badge {
    box-shadow:
      0 12px 32px -10px rgba(46,126,244,.55),
      inset 0 1px 0 0 rgba(255,255,255,.35) !important;
  }
  /* Logo host (au-dessus de la card) — légère ombre portée */
  .ew-logo-host { filter: drop-shadow(0 2px 6px rgba(10,31,61,.06)); }
"""

PAGES = [
    "mandataire.html", "oblige.html", "delegataire.html",
    "installateur.html", "controleur.html", "portal.html",
]

for f in PAGES:
    p = os.path.join(ROOT, f)
    s = open(p, encoding="utf-8").read()
    # idempotent : retire l'ancien bloc si présent
    if "/* ── Apple-style liquid glass" in s:
        # remove previous block to avoid duplication
        import re as _re
        s = _re.sub(r"\s*/\* ── Apple-style liquid glass.*?(?=\s*</style>)", "", s, count=1, flags=_re.DOTALL)
    # insert before first </style>
    s = s.replace("</style>", GLASS_CSS + "</style>", 1)
    open(p, "w", encoding="utf-8").write(s)
    print("glass", f)
print("DONE")
