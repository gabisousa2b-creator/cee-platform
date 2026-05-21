# -*- coding: utf-8 -*-
"""Injecte /js/ew-notif.js + un <span class="ew-notif-host"></span> dans le header
des 4 dashboards (oblige, delegataire, installateur, controleur)."""
import os, re
ROOT = os.path.join(os.path.dirname(__file__), "..", "public")

for f in ["oblige.html", "delegataire.html", "installateur.html", "controleur.html"]:
    p = os.path.join(ROOT, f)
    s = open(p, encoding="utf-8").read()
    # Add script tag if not present
    if "/js/ew-notif.js" not in s:
        s = s.replace('<script src="/js/ew-emmy.js" defer></script>',
                      '<script src="/js/ew-emmy.js" defer></script>\n<script src="/js/ew-notif.js" defer></script>')
    # Inject host in .right before existing button (only if missing)
    if 'class="ew-notif-host"' not in s:
        s = re.sub(
            r'(<div class="right">)',
            r'\1\n      <span class="ew-notif-host"></span>',
            s, count=1
        )
    open(p, "w", encoding="utf-8").write(s)
    print("done", f)
print("DONE")
