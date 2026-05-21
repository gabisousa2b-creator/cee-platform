/* eslint-disable */
// EchoWAI — Utilitaires CEE partagés (SIRENE, RGE, CO2, fiches, etc.)
// Pas de dépendance externe sauf node:https (natif).

const https = require('https');

function _getJson(url, headers = {}, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'EchoWAI/1.0', Accept: 'application/json', ...headers } }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: body ? JSON.parse(body) : null }); }
        catch (e) { resolve({ status: res.statusCode, json: null, raw: body }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => { req.destroy(new Error('timeout')); });
  });
}

// ── 1. SIRENE — Vérif d'un SIRET (API publique INSEE via Recherche d'Entreprises) ──
//   https://recherche-entreprises.api.gouv.fr (gratuit, sans clé)
async function checkSiret(siret) {
  const clean = String(siret || '').replace(/\D+/g, '');
  if (!/^\d{14}$/.test(clean)) return { valid: false, error: 'SIRET doit faire 14 chiffres' };
  try {
    const r = await _getJson(`https://recherche-entreprises.api.gouv.fr/search?q=${clean}&page=1&per_page=1`);
    if (r.status !== 200 || !r.json || !r.json.results || !r.json.results.length) {
      return { valid: false, error: 'SIRET inconnu de la base SIRENE' };
    }
    const e = r.json.results[0];
    return {
      valid: true,
      siret: clean,
      siren: e.siren,
      raison_sociale: e.nom_complet || e.nom_raison_sociale,
      forme_juridique: (e.matching_etablissements && e.matching_etablissements[0]?.libelle_categorie_entreprise) || e.complements?.categorie_entreprise || '',
      naf: e.activite_principale,
      naf_libelle: e.libelle_section_activite_principale,
      adresse: e.matching_etablissements && e.matching_etablissements[0]?.adresse,
      code_postal: e.matching_etablissements && e.matching_etablissements[0]?.code_postal,
      ville: e.matching_etablissements && e.matching_etablissements[0]?.libelle_commune,
      etat: e.etat_administratif,
    };
  } catch (e) { return { valid: false, error: e.message || 'Erreur réseau SIRENE' }; }
}

// ── 2. RGE — Vérif via France-Renov (data.gouv.fr Annuaire RGE) ──
//   API publique : https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/lines
async function checkRge(siret) {
  const clean = String(siret || '').replace(/\D+/g, '');
  if (!/^\d{14}$/.test(clean)) return { valid: false, error: 'SIRET invalide' };
  try {
    const r = await _getJson(`https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/lines?q=${clean}&size=10`);
    if (r.status !== 200 || !r.json || !r.json.results) {
      return { valid: false, error: 'Annuaire RGE indisponible' };
    }
    const results = r.json.results || [];
    if (!results.length) return { valid: false, siret: clean, certifications: [], error: 'Aucun certificat RGE actif' };
    const today = new Date().toISOString().slice(0, 10);
    const certs = results.map(c => ({
      domaine: c.code_qualification || c.domaine || '',
      libelle: c.particulier === 'oui' ? 'Travaux particuliers' : (c.nom_certificat || ''),
      organisme: c.nom_certificat || c.qualifiant || '',
      qualif: c.qualification || c.code_qualification,
      date_debut: c.date_debut_validite || c.date_debut,
      date_fin:   c.date_fin_validite   || c.date_fin,
      en_cours:   (c.date_fin_validite || c.date_fin || '9999-12-31') >= today,
    }));
    const actifs = certs.filter(c => c.en_cours);
    return {
      valid: actifs.length > 0,
      siret: clean,
      raison_sociale: results[0].nom_entreprise || results[0].nom,
      certifications: certs,
      actifs_count: actifs.length,
    };
  } catch (e) { return { valid: false, error: e.message || 'Erreur RGE' }; }
}

// ── 3. CO2 — Calcul économies par opération ──
//   Sources : ADEME (kg CO2 / kWh, fiches CEE moyennes). Approximation.
const CO2_PAR_OP = {
  'BAR-TH-101': 35,   // CESI / kg CO2 / dossier annuel
  'BAR-TH-104': 850,  // PAC air/eau
  'BAR-TH-112': 220,  // Chauffe-eau thermo
  'BAR-TH-113': 700,  // Chaudière biomasse
  'BAR-TH-129': 1100, // PAC air/eau collectif
  'BAR-EN-101': 320,  // Isolation combles
  'BAR-EN-102': 450,  // Isolation murs
  'BAR-EN-103': 280,  // Isolation plancher
  'BAT-TH-102': 600,  // Chaudière collective
  'BAT-EN-101': 540,
  'IND-UT-134': 4200, // Système de captation
  default: 350,
};
function co2FromOperations(operations) {
  if (!Array.isArray(operations)) return { kg_an: 0, kg_30ans: 0, voitures_eq: 0 };
  const kgAn = operations.reduce((sum, op) => {
    const factor = CO2_PAR_OP[op.code_fiche] || CO2_PAR_OP.default;
    const volumeMwhc = (op.volume_kwh || 0) / 1000; // kWhc → MWhc
    // 1 MWhc CEE ≈ ~30 kg CO2/an évités (estimation simplifiée)
    return sum + (factor + Math.round(volumeMwhc * 0.3));
  }, 0);
  return {
    kg_an: kgAn,
    kg_30ans: kgAn * 30,
    voitures_eq: Math.round(kgAn / 2300), // 1 voiture ≈ 2,3 t CO2/an
    arbres_eq: Math.round(kgAn / 25),     // 1 arbre ≈ 25 kg CO2/an
  };
}

// ── 4. Fiche CEE — Récupération info standard (montant cumac/m² ou /unité) ──
const FICHE_CEE = {
  'BAR-TH-101': { nom: 'CESI individuel',          unite: 'capteurs', cumac_unit: 12500,  duree: 17 },
  'BAR-TH-104': { nom: 'PAC air/eau',               unite: 'unité',    cumac_unit: 30000,  duree: 17 },
  'BAR-TH-112': { nom: 'Chauffe-eau thermo.',       unite: 'unité',    cumac_unit: 8200,   duree: 17 },
  'BAR-TH-113': { nom: 'Chaudière biomasse',        unite: 'unité',    cumac_unit: 51000,  duree: 17 },
  'BAR-EN-101': { nom: 'Isolation combles',         unite: 'm²',       cumac_unit: 1700,   duree: 30 },
  'BAR-EN-102': { nom: 'Isolation murs',            unite: 'm²',       cumac_unit: 2100,   duree: 25 },
  'BAR-EN-103': { nom: 'Isolation plancher',        unite: 'm²',       cumac_unit: 1900,   duree: 30 },
  'IND-UT-134': { nom: 'Système captation',         unite: 'kW',       cumac_unit: 18000,  duree: 15 },
  'BAT-TH-102': { nom: 'Chaudière coll. (BAT)',     unite: 'unité',    cumac_unit: 95000,  duree: 17 },
};
function fichesEligibles() { return Object.keys(FICHE_CEE).map(k => ({ code: k, ...FICHE_CEE[k] })); }
function calcCumac(code, quantite) {
  const f = FICHE_CEE[code];
  if (!f) return 0;
  return Math.round((parseFloat(quantite) || 0) * f.cumac_unit);
}

// ── 5. Obligation 5e période (TWh cumac) — barême indicatif par obligé ──
//   Période : 2022-2025 · 3 100 TWhc dont 1 130 précarité
const OBLIGATION_5P = {
  total_twhc: 3100,
  precarite_twhc: 1130,
  date_debut: '2022-01-01',
  date_fin:   '2025-12-31',
  penalite_eur_kwhc: 0.02, // pénalité libératoire indicative
};
function obligationProgress(volume_acquis_kwhc, obligation_annuelle_kwhc, periodeEnd = OBLIGATION_5P.date_fin) {
  if (!obligation_annuelle_kwhc) return null;
  const obj = obligation_annuelle_kwhc;
  const reste = Math.max(0, obj - volume_acquis_kwhc);
  const pct = Math.min(100, Math.round((volume_acquis_kwhc / obj) * 100));
  const today = new Date();
  const end = new Date(periodeEnd);
  const joursRestants = Math.max(0, Math.round((end - today) / 86400000));
  return {
    obligation_kwhc: obj,
    acquis_kwhc: volume_acquis_kwhc,
    reste_kwhc: reste,
    pct,
    penalite_si_non_atteinte: Math.round(reste * OBLIGATION_5P.penalite_eur_kwhc),
    jours_restants: joursRestants,
    rythme_quotidien_requis: joursRestants > 0 ? Math.round(reste / joursRestants) : 0,
  };
}

// ── 6. Commission auto (engine) ──
function calcCommission(mode, valeur, ctx) {
  const v = parseFloat(valeur) || 0;
  if (v <= 0) return 0;
  if (mode === 'pct')       return Math.round((ctx.subvention || 0) * v / 100);
  if (mode === 'eur_mwhc')  return Math.round(((ctx.volume_cumac || 0) / 1000) * v);
  if (mode === 'fixe')      return Math.round(v);
  return 0;
}

// ── 7. Estimateur économie €/an client ──
//   Selon opération + chauffage actuel (gaz/fioul/élec) + surface
function eurEconomieAnnuelle(operations) {
  if (!Array.isArray(operations)) return 0;
  let total = 0;
  for (const op of operations) {
    const baseCumac = (op.volume_kwh || 0) / 1000; // MWhc
    // 1 MWhc ≈ 60 €/an d'économie facture moyenne (estimation)
    total += Math.round(baseCumac * 60);
  }
  return total;
}

module.exports = {
  checkSiret,
  checkRge,
  co2FromOperations,
  fichesEligibles,
  calcCumac,
  FICHE_CEE,
  OBLIGATION_5P,
  obligationProgress,
  calcCommission,
  eurEconomieAnnuelle,
};
