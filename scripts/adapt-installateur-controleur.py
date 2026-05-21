# -*- coding: utf-8 -*-
"""Adapte installateur.html + controleur.html à partir d'oblige.html (clones bruts)."""
import os
ROOT = os.path.join(os.path.dirname(__file__), "..", "public")

# ─────────── Installateur ───────────
p = os.path.join(ROOT, "installateur.html")
s = open(p, encoding="utf-8").read()
repls = [
    (u"EchoWAI — Espace Obligé", u"EchoWAI — Espace Installateur"),
    (u"Espace Obligé", u"Espace Installateur"),
    (u"Validez les dossiers CEE soumis par les apporteurs.",
     u"Suivez vos chantiers RGE : envoi devis, signature, travaux, facture, AH."),
    (u"Accès réservé aux fournisseurs d’énergie soumis à l’obligation CEE. Pour\n      activer votre compte, contactez votre interlocuteur EchoWAI.",
     u"Accès réservé aux installateurs RGE référencés sur la plateforme.\n      Pour activer votre compte, contactez votre interlocuteur EchoWAI."),
    (u"Vos dossiers CEE", u"Vos chantiers"),
    (u"Les apporteurs partenaires vous transmettent leurs dossiers via la\n      plateforme EchoWAI. Vous validez la prime CEE associée, ou la refusez\n      en justifiant. Le cours EMMY de référence s’affiche en haut à gauche.",
     u"Les mandataires partenaires vous confient des chantiers éligibles CEE.\n      Mettez à jour le statut de chaque étape (devis, travaux, facture, AH)."),
    (u"Dossiers reçus", u"Chantiers attribués"),
    (u"En attente de validation", u"Devis à émettre"),
    (u"À traiter en priorité", u"À envoyer"),
    (u"/api/oblige/", u"/api/installateur/"),
    (u"me.type", u'(me.rge_organisme || "RGE") + " " + (me.rge_numero || "")'),
    (u'data-filter="en_attente"', u'data-filter="devis_envoye"'),
    (u'>En attente <span class="badge" id="b-en_attente">', u'>Devis envoyé <span class="badge" id="b-devis_envoye">'),
    (u'id="b-en_attente">', u'id="b-devis_envoye">'),
    (u"s.en_attente", u"s.devis_envoye"),
    (u'data-filter="valide"', u'data-filter="ah_signee"'),
    (u'>Validés <span class="badge" id="b-valide">', u'>AH signées <span class="badge" id="b-ah_signee">'),
    (u'id="b-valide">', u'id="b-ah_signee">'),
    (u"s.valide", u"s.ah_signee"),
    (u'data-filter="refuse"', u'data-filter="travaux_en_cours"'),
    (u'>Refusés <span class="badge" id="b-refuse">', u'>Travaux <span class="badge" id="b-travaux_en_cours">'),
    (u'id="b-refuse">', u'id="b-travaux_en_cours">'),
    (u"s.refuse", u"s.travaux_en_cours"),
]
for a, b in repls:
    s = s.replace(a, b)

# Replace pill mapping
old_pill = u"if (st === 'valide')     return '<span class=\"pill ok\"><i class=\"fas fa-check-circle\"></i> Validé</span>';\n  if (st === 'refuse')     return '<span class=\"pill bad\"><i class=\"fas fa-xmark-circle\"></i> Refusé</span>';\n  if (st === 'en_attente') return '<span class=\"pill warn\"><i class=\"fas fa-hourglass-half\"></i> En attente</span>';"
new_pill = (
  u"if (st === 'devis_envoye')    return '<span class=\"pill warn\"><i class=\"fas fa-paper-plane\"></i> Devis envoyé</span>';\n"
  u"  if (st === 'devis_signe')     return '<span class=\"pill\" style=\"background:#dbeafe;color:#1d4ed8\"><i class=\"fas fa-file-signature\"></i> Devis signé</span>';\n"
  u"  if (st === 'travaux_en_cours')return '<span class=\"pill\" style=\"background:#e0e7ff;color:#3730a3\"><i class=\"fas fa-hammer\"></i> Travaux</span>';\n"
  u"  if (st === 'travaux_termines')return '<span class=\"pill\" style=\"background:#fef9c3;color:#854d0e\"><i class=\"fas fa-flag-checkered\"></i> Terminés</span>';\n"
  u"  if (st === 'facture_emise')   return '<span class=\"pill\" style=\"background:#e0f2fe;color:#075985\"><i class=\"fas fa-file-invoice\"></i> Facturé</span>';\n"
  u"  if (st === 'ah_signee')       return '<span class=\"pill ok\"><i class=\"fas fa-check-circle\"></i> AH signée</span>';"
)
s = s.replace(old_pill, new_pill, 1)

# Actions row
old_row = u"${r.oblige_statut === 'en_attente' ? `\n            <button class=\"ok\"  onclick=\"valider(${r.id})\"  title=\"Valider\"><i class=\"fas fa-check\"></i></button>\n            <button class=\"bad\" onclick=\"refuser(${r.id})\" title=\"Refuser\"><i class=\"fas fa-xmark\"></i></button>\n          ` : ''}"
new_row = (
  u"${(() => {\n"
  u"            const next = { 'non_assigne':'devis_envoye','devis_envoye':'devis_signe','devis_signe':'travaux_en_cours','travaux_en_cours':'travaux_termines','travaux_termines':'facture_emise','facture_emise':'ah_signee' }[r.installateur_statut || 'non_assigne'];\n"
  u"            return next ? '<button class=\"see\" onclick=\"avance(' + r.id + ', \\'' + next + '\\')\" title=\"Étape suivante\"><i class=\"fas fa-arrow-right\"></i></button>' : '';\n"
  u"          })()}"
)
s = s.replace(old_row, new_row, 1)
s = s.replace(u"r.oblige_statut", u"r.installateur_statut")

# Functions replace
i0 = s.find(u"window.valider = async (id)")
i1 = s.find(u"window.voir", i0)
new_fns = (
  u"window.avance = async (id, statut) => {\n"
  u"  const r = await fetch('/api/installateur/dossiers/' + id + '/statut', {\n"
  u"    method: 'POST', headers: { 'Content-Type': 'application/json' },\n"
  u"    body: JSON.stringify({ statut }),\n"
  u"  });\n"
  u"  if (!r.ok) { alert('Erreur'); return; }\n"
  u"  await Promise.all([loadStats(), loadList()]);\n"
  u"};\n"
)
s = s[:i0] + new_fns + s[i1:]
s = s.replace(u"d.oblige_statut", u"d.installateur_statut")
s = s.replace(u"Statut Obligé", u"Statut installateur")
s = s.replace(u"d.oblige_motif_refus", u"d.installateur_notes")
s = s.replace(u"Motif refus", u"Notes")

open(p, "w", encoding="utf-8").write(s)

# ─────────── Controleur ───────────
p = os.path.join(ROOT, "controleur.html")
s = open(p, encoding="utf-8").read()
repls = [
    (u"EchoWAI — Espace Obligé", u"EchoWAI — Espace Contrôleur"),
    (u"Espace Obligé", u"Espace Contrôleur"),
    (u"Validez les dossiers CEE soumis par les apporteurs.",
     u"Programmez et réalisez les contrôles in-situ des dossiers CEE."),
    (u"Accès réservé aux fournisseurs d’énergie soumis à l’obligation CEE. Pour\n      activer votre compte, contactez votre interlocuteur EchoWAI.",
     u"Accès réservé aux organismes accrédités COFRAC.\n      Pour activer votre compte, contactez votre interlocuteur EchoWAI."),
    (u"Vos dossiers CEE", u"Vos missions de contrôle"),
    (u"Les apporteurs partenaires vous transmettent leurs dossiers via la\n      plateforme EchoWAI. Vous validez la prime CEE associée, ou la refusez\n      en justifiant. Le cours EMMY de référence s’affiche en haut à gauche.",
     u"Les dossiers sélectionnés pour contrôle in-situ vous sont attribués.\n      Programmez la visite, déposez votre rapport, concluez (OK / écart / NC)."),
    (u"Dossiers reçus", u"Missions attribuées"),
    (u"En attente de validation", u"À planifier"),
    (u"À traiter en priorité", u"Visites à programmer"),
    (u"/api/oblige/", u"/api/controleur/"),
    (u"me.type", u'"accréd. " + (me.accreditation_no || "")'),
    (u'data-filter="en_attente"', u'data-filter="non_planifie"'),
    (u'>En attente <span class="badge" id="b-en_attente">', u'>À planifier <span class="badge" id="b-non_planifie">'),
    (u'id="b-en_attente">', u'id="b-non_planifie">'),
    (u"s.en_attente", u"s.non_planifie"),
    (u'data-filter="valide"', u'data-filter="controle_ok"'),
    (u'>Validés <span class="badge" id="b-valide">', u'>Contrôles OK <span class="badge" id="b-controle_ok">'),
    (u'id="b-valide">', u'id="b-controle_ok">'),
    (u"s.valide", u"s.controle_ok"),
    (u'data-filter="refuse"', u'data-filter="non_conforme"'),
    (u'>Refusés <span class="badge" id="b-refuse">', u'>Non conformes <span class="badge" id="b-non_conforme">'),
    (u'id="b-refuse">', u'id="b-non_conforme">'),
    (u"s.refuse", u"s.non_conforme"),
]
for a, b in repls:
    s = s.replace(a, b)

old_pill_c = u"if (st === 'valide')     return '<span class=\"pill ok\"><i class=\"fas fa-check-circle\"></i> Validé</span>';\n  if (st === 'refuse')     return '<span class=\"pill bad\"><i class=\"fas fa-xmark-circle\"></i> Refusé</span>';\n  if (st === 'en_attente') return '<span class=\"pill warn\"><i class=\"fas fa-hourglass-half\"></i> En attente</span>';"
new_pill_c = (
  u"if (st === 'non_planifie') return '<span class=\"pill warn\"><i class=\"fas fa-calendar-xmark\"></i> À planifier</span>';\n"
  u"  if (st === 'planifie')     return '<span class=\"pill\" style=\"background:#dbeafe;color:#1d4ed8\"><i class=\"fas fa-calendar-check\"></i> Planifié</span>';\n"
  u"  if (st === 'controle_ok')  return '<span class=\"pill ok\"><i class=\"fas fa-check-circle\"></i> OK</span>';\n"
  u"  if (st === 'ecart_mineur') return '<span class=\"pill warn\"><i class=\"fas fa-triangle-exclamation\"></i> Écart</span>';\n"
  u"  if (st === 'non_conforme') return '<span class=\"pill bad\"><i class=\"fas fa-xmark-circle\"></i> NC</span>';"
)
s = s.replace(old_pill_c, new_pill_c, 1)

old_row_c = u"${r.oblige_statut === 'en_attente' ? `\n            <button class=\"ok\"  onclick=\"valider(${r.id})\"  title=\"Valider\"><i class=\"fas fa-check\"></i></button>\n            <button class=\"bad\" onclick=\"refuser(${r.id})\" title=\"Refuser\"><i class=\"fas fa-xmark\"></i></button>\n          ` : ''}"
new_row_c = (
  u"${(['non_planifie','planifie'].includes(r.controleur_statut)) ? '<button class=\"see\" onclick=\"planifier(' + r.id + ')\" title=\"Planifier\"><i class=\"fas fa-calendar-plus\"></i></button>' : ''}\n"
  u"          ${r.controleur_statut === 'planifie' ? '<button class=\"ok\" onclick=\"conclure(' + r.id + ', \\'controle_ok\\')\" title=\"OK\"><i class=\"fas fa-check\"></i></button><button class=\"bad\" onclick=\"conclure(' + r.id + ', \\'non_conforme\\')\" title=\"NC\"><i class=\"fas fa-xmark\"></i></button>' : ''}"
)
s = s.replace(old_row_c, new_row_c, 1)
s = s.replace(u"r.oblige_statut", u"r.controleur_statut")

i0 = s.find(u"window.valider = async (id)")
i1 = s.find(u"window.voir", i0)
new_fns_c = (
  u"window.planifier = async (id) => {\n"
  u"  const d = prompt('Date de visite (AAAA-MM-JJ) :');\n"
  u"  if (!d) return;\n"
  u"  const r = await fetch('/api/controleur/dossiers/' + id + '/statut', {\n"
  u"    method: 'POST', headers: { 'Content-Type': 'application/json' },\n"
  u"    body: JSON.stringify({ statut: 'planifie', date_visite: d }),\n"
  u"  });\n"
  u"  if (!r.ok) { alert('Erreur'); return; }\n"
  u"  await Promise.all([loadStats(), loadList()]);\n"
  u"};\n"
  u"window.conclure = async (id, statut) => {\n"
  u"  const rapport = prompt('Rapport / observations :');\n"
  u"  if (!rapport) return;\n"
  u"  const r = await fetch('/api/controleur/dossiers/' + id + '/statut', {\n"
  u"    method: 'POST', headers: { 'Content-Type': 'application/json' },\n"
  u"    body: JSON.stringify({ statut, rapport }),\n"
  u"  });\n"
  u"  if (!r.ok) { alert('Erreur'); return; }\n"
  u"  await Promise.all([loadStats(), loadList()]);\n"
  u"};\n"
)
s = s[:i0] + new_fns_c + s[i1:]
s = s.replace(u"d.oblige_statut", u"d.controleur_statut")
s = s.replace(u"Statut Obligé", u"Statut contrôle")
s = s.replace(u"d.oblige_motif_refus", u"d.controleur_rapport")
s = s.replace(u"Motif refus", u"Rapport")

open(p, "w", encoding="utf-8").write(s)
print("done")
