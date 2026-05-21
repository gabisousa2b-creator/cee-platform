# -*- coding: utf-8 -*-
"""Ajoute un lien « ← Accueil echowai.com » sur les 6 pages de login."""
import os, re
ROOT = os.path.join(os.path.dirname(__file__), "..", "public")

BACK_LINK = u'''
    <a href="https://echowai.com" class="back-home" style="display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:#94a3b8;text-decoration:none;margin-top:14px;font-family:'IBM Plex Mono',monospace;transition:color .2s">
      <i class="fas fa-arrow-left" style="font-size:11px"></i><span>Retour à l'accueil echowai.com</span>
    </a>'''

for f in ["mandataire.html", "oblige.html", "delegataire.html", "installateur.html", "controleur.html", "portal.html"]:
    p = os.path.join(ROOT, f)
    s = open(p, encoding="utf-8").read()
    if "back-home" in s:
        continue
    # Insert before .login-foot (after .login-card closing)
    if '<div class="login-foot">' in s:
        s = s.replace('<div class="login-foot">', BACK_LINK + '\n    <div class="login-foot">', 1)
    elif '</div>\n  </div>\n\n' in s:
        # Fallback : insert after first .login-card close
        s = s.replace('</div>\n  </div>\n\n', '</div>' + BACK_LINK + '\n  </div>\n\n', 1)
    else:
        # Last resort : before #loginScreen closing
        s = s.replace('</div>\n</body>', BACK_LINK + '\n</div>\n</body>', 1)
    open(p, "w", encoding="utf-8").write(s)
    print("back-home", f)
print("DONE")
