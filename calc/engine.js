/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EchoWAI CEE Platform — Moteur de calcul v2.0
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce module gère tous les calculs de kWhc pour les fiches CEE.
 *
 * IMPORTANT — Avertissement réglementaire :
 * Les valeurs de forfaits sont indicatives et basées sur les arrêtés
 * publiés. Elles peuvent évoluer. Toujours vérifier avec la fiche officielle
 * en vigueur sur : https://www.ecologie.gouv.fr/politiques-publiques/
 * operations-standardisees-deconomies-denergie
 *
 * Types de calcul supportés :
 * ─ forfait_logement        : kwh = forfait_fixe × n_logements
 * ─ forfait_logement_zone   : kwh = forfait[zone] × n_logements
 * ─ surface_zone            : kwh = surface × eph[zone]
 * ─ surface_r_zone          : kwh = surface × eph[zone] (R déjà intégré)
 * ─ quantite_zone           : kwh = quantite × e_unitaire[zone]
 * ─ puissance_zone          : kwh = puissance × coeff[zone]
 * ─ conso_pct               : kwh = conso_annuelle × (pct/100)
 * ─ assistee                : formule affichée, valeur saisie manuellement
 */

'use strict';

// ── Tables de zones climatiques ───────────────────────────────────────────────
// Codes INSEE par département → zone simplifiée H1 / H2 / H3
// Source : Arrêté du 24 mai 2006 modifié
const ZONES = {
  H1: ['01','02','03','04','05','06','07','08','10','21','23','25','26','36','37',
       '38','39','41','42','43','45','51','52','53','55','57','58','60','61','63',
       '67','68','69','70','71','73','74','75','77','78','79','80','88','89','90',
       '91','92','93','94','95','2A','2B'],
  H2: ['09','11','12','15','16','17','18','19','22','24','28','29','30','31','32',
       '33','34','35','40','44','46','47','48','49','50','54','56','64','65','66',
       '81','82','83','84','85','86','87'],
  H3: ['06','13','2A','2B']
};

// Détermination de la zone à partir du département
function zoneFromDept(dept) {
  if (!dept) return null;
  const d = String(dept).toUpperCase().replace(/^0/, '');
  if (ZONES.H3.includes(dept)) return 'H3';
  if (ZONES.H2.includes(dept)) return 'H2';
  if (ZONES.H1.includes(dept)) return 'H1';
  return null;
}

// ── Constantes prix CEE ────────────────────────────────────────────────────────
// Prix indicatif moyen du kWhc sur le marché (€/MWhc)
const PRIX_DEFAULT_EUR_MWH = 4.0; // 4 € par MWhc = 0.004 € par kWhc

// ── Moteur principal ──────────────────────────────────────────────────────────

/**
 * Calcule le volume kWhc et la prime estimée pour une simulation.
 *
 * @param {Object} fiche     - Données de la fiche depuis la DB
 * @param {Object} inputs    - Valeurs saisies par l'utilisateur
 * @param {Object} options   - { is_zni, is_precarite, prix_eur_mwh }
 * @returns {Object}         - Résultat détaillé de la simulation
 */
function simulate(fiche, inputs, options = {}) {
  const {
    is_zni       = false,
    is_precarite = false,
    prix_eur_mwh = PRIX_DEFAULT_EUR_MWH
  } = options;

  let formule_json;
  try {
    formule_json = typeof fiche.formule_json === 'string'
      ? JSON.parse(fiche.formule_json || '{}')
      : (fiche.formule_json || {});
  } catch(e) {
    formule_json = {};
  }

  const type_calcul = fiche.type_calcul || formule_json.type || 'assistee';

  let kwh_base      = 0;
  let detail        = {};
  let warnings      = [];
  let calc_readable = '';

  // ── Dispatch par type de calcul ──────────────────────────────────────────────
  switch (type_calcul) {

    case 'forfait_logement': {
      const n    = parseFloat(inputs.n_logements) || 1;
      const val  = parseFloat(formule_json.forfait) || fiche.valeur_min || 0;
      kwh_base   = val * n;
      detail     = { forfait: val, n_logements: n };
      calc_readable = `${n} logement(s) × ${val.toLocaleString('fr-FR')} kWhc = ${kwh_base.toLocaleString('fr-FR')} kWhc`;
      break;
    }

    case 'forfait_logement_zone': {
      const n     = parseFloat(inputs.n_logements) || 1;
      const zone  = inputs.zone || 'H2';
      const table = formule_json.tables?.forfaits_zone || {};
      const val   = parseFloat(table[zone]) || fiche.valeur_min || 0;
      kwh_base    = val * n;
      detail      = { forfait_zone: val, zone, n_logements: n };
      calc_readable = `${n} logement(s) × ${val.toLocaleString('fr-FR')} kWhc (zone ${zone}) = ${kwh_base.toLocaleString('fr-FR')} kWhc`;
      if (!table[zone]) warnings.push(`Zone ${zone} non disponible dans la table — valeur par défaut utilisée`);
      break;
    }

    case 'surface_zone': {
      const s    = parseFloat(inputs.surface) || 0;
      const zone = inputs.zone || 'H2';
      const table = formule_json.tables?.eph_zone || {};
      const eph  = parseFloat(table[zone]) || fiche.valeur_min || 0;
      kwh_base   = s * eph;
      detail     = { surface: s, eph, zone };
      calc_readable = `${s} m² × ${eph} kWhc/m² (zone ${zone}) = ${kwh_base.toLocaleString('fr-FR')} kWhc`;
      if (s <= 0) warnings.push('Surface doit être > 0 m²');
      break;
    }

    case 'surface_r_zone': {
      // Isolation : surface × coeff (le R est déjà intégré dans le forfait par zone)
      const s    = parseFloat(inputs.surface) || 0;
      const zone = inputs.zone || 'H2';
      const r    = parseFloat(inputs.r_value) || 0;
      const table = formule_json.tables?.coeff_zone || {};
      const coeff = parseFloat(table[zone]) || 1;
      // Formule simplifiée : kwh = S × coeff[zone]  (R minimal supposé respecté)
      kwh_base   = s * coeff;
      detail     = { surface: s, r_value: r, coeff, zone };
      calc_readable = `${s} m² × ${coeff} kWhc/m² (zone ${zone}) = ${kwh_base.toLocaleString('fr-FR')} kWhc`;
      if (s <= 0) warnings.push('Surface doit être > 0 m²');
      if (r < (formule_json.r_min || 0)) warnings.push(`R thermique (${r} m².K/W) inférieur au minimum requis (${formule_json.r_min})`);
      break;
    }

    case 'quantite_zone': {
      const n    = parseInt(inputs.quantite) || 1;
      const zone = inputs.zone || 'H2';
      const table = formule_json.tables?.e_unitaire_zone || {};
      const eu   = parseFloat(table[zone]) || fiche.valeur_min || 0;
      kwh_base   = n * eu;
      detail     = { quantite: n, e_unitaire: eu, zone };
      calc_readable = `${n} unité(s) × ${eu.toLocaleString('fr-FR')} kWhc/unité (zone ${zone}) = ${kwh_base.toLocaleString('fr-FR')} kWhc`;
      break;
    }

    case 'puissance_zone': {
      const p    = parseFloat(inputs.puissance) || 0;
      const zone = inputs.zone || 'H2';
      const table = formule_json.tables?.coeff_puissance_zone || {};
      const coeff = parseFloat(table[zone]) || fiche.valeur_min || 0;
      kwh_base   = p * coeff;
      detail     = { puissance: p, coeff_zone: coeff, zone };
      calc_readable = `${p} kW × ${coeff} kWhc/kW (zone ${zone}) = ${kwh_base.toLocaleString('fr-FR')} kWhc`;
      if (p <= 0) warnings.push('Puissance doit être > 0 kW');
      break;
    }

    case 'conso_pct': {
      const conso = parseFloat(inputs.conso_annuelle) || 0;
      const pct   = parseFloat(formule_json.pct) || 3;
      kwh_base    = conso * (pct / 100);
      detail      = { conso_annuelle: conso, pct };
      calc_readable = `${conso.toLocaleString('fr-FR')} kWh × ${pct}% = ${kwh_base.toLocaleString('fr-FR')} kWhc`;
      if (conso <= 0) warnings.push('Consommation annuelle doit être > 0 kWh');
      break;
    }

    case 'bareme': {
      // Barème générique : kwh = montant_base[clés] × Π facteurs
      // formule_json = { champs:[...], tranches:[...], base:{cles,table}, facteurs:[...] }
      const ctx = Object.assign({}, inputs);
      const facDetail = [];
      // Tranches : valeur numérique → label de tranche (avec variantes optionnelles)
      (formule_json.tranches || []).forEach(tr => {
        const v = parseFloat(inputs[tr.champ]);
        let bornes = tr.bornes;
        if (tr.selonChamp) bornes = (tr.variantes || {})[ctx[tr.selonChamp]] || [];
        let hit = null;
        if (!isNaN(v)) {
          for (const b of (bornes || [])) {
            if (v >= b.min && (b.max == null || v < b.max)) { hit = b; break; }
          }
        }
        ctx[tr.id]              = hit ? (hit.cle != null ? hit.cle : hit.val) : '';
        ctx['_' + tr.id + '_v'] = hit && hit.val != null ? hit.val : (hit ? 1 : 0);
      });
      // Montant de base
      const baseKey = (formule_json.base?.cles || []).map(c => String(ctx[c] ?? '')).join('|');
      kwh_base = parseFloat((formule_json.base?.table || {})[baseKey]) || 0;
      // Facteurs correctifs
      (formule_json.facteurs || []).forEach(f => {
        let fac;
        if (f.direct)       fac = parseFloat(inputs[f.champ]) || 0;   // multiplicateur direct (surface, quantité…)
        else if (f.tranche) fac = parseFloat(ctx['_' + f.tranche + '_v']);
        else                fac = parseFloat((f.table || {})[String(ctx[f.champ] ?? '')]);
        if (isNaN(fac)) fac = 1;
        kwh_base *= fac;
        facDetail.push({ nom: f.label || f.champ || f.tranche, facteur: fac });
      });
      detail = { base_key: baseKey, montant_base: parseFloat((formule_json.base?.table || {})[baseKey]) || 0, facteurs: facDetail };
      calc_readable = `Barème ${fiche.code} — base [${baseKey}]` +
        facDetail.map(f => ` × ${f.facteur} (${f.nom})`).join('') +
        ` = ${Math.round(kwh_base).toLocaleString('fr-FR')} kWhc`;
      if (kwh_base <= 0) warnings.push('Combinaison de paramètres absente du barème — vérifiez les valeurs saisies.');
      break;
    }

    case 'assistee':
    default: {
      // Mode assisté : l'utilisateur a calculé la valeur ou l'a consultée
      kwh_base = parseFloat(inputs.kwh_manuel) || 0;
      detail   = { kwh_manuel: kwh_base };
      calc_readable = `Valeur saisie : ${kwh_base.toLocaleString('fr-FR')} kWhc`;
      if (kwh_base <= 0) warnings.push('Veuillez saisir le volume kWhc calculé à partir de la fiche officielle');
      break;
    }
  }

  // ── Multiplicateurs ZNI et précarité ─────────────────────────────────────────
  let multiplicateur  = 1;
  let bonus_applied   = [];

  if (is_zni && fiche.zni_eligible) {
    multiplicateur *= (fiche.zni_multiplier || 2);
    bonus_applied.push({ label: 'Bonification ZNI', factor: fiche.zni_multiplier || 2 });
  }
  if (is_precarite && fiche.precarite_eligible) {
    multiplicateur *= (fiche.precarite_bonus || 2);
    bonus_applied.push({ label: 'Ménage précaire', factor: fiche.precarite_bonus || 2 });
  }

  const kwh_total  = Math.round(kwh_base * multiplicateur);
  const mwh_total  = parseFloat((kwh_total / 1000).toFixed(2));
  const gwh_total  = parseFloat((kwh_total / 1_000_000).toFixed(6));

  // Prime : prix €/MWhc × MWhc
  const prix_kwh   = prix_eur_mwh / 1000;
  const prime      = parseFloat((kwh_total * prix_kwh).toFixed(2));

  // ── Documents requis ──────────────────────────────────────────────────────────
  let docs = [];
  try { docs = JSON.parse(fiche.documents_requis || '[]'); } catch(e) { docs = []; }

  // ── Points de contrôle ────────────────────────────────────────────────────────
  let controles = [];
  try { controles = JSON.parse(fiche.points_controle || '[]'); } catch(e) { controles = []; }

  return {
    // Identification
    code          : fiche.code,
    nom           : fiche.nom,
    secteur       : fiche.secteur,
    version       : fiche.version || '',
    statut        : fiche.statut || 'valide',
    simulation_mode: fiche.simulation_mode || 'assistee',
    source_url    : fiche.source_url || '',

    // Résultats
    kwh_base     : Math.round(kwh_base),
    multiplicateur,
    kwh_total,
    mwh_total,
    gwh_total    : gwh_total >= 0.001 ? gwh_total : null,

    // Valorisation
    prix_eur_mwh,
    prime_estimee: prime,

    // Détail du calcul
    type_calcul,
    calc_readable,
    detail,
    bonus_applied,

    // Options appliquées
    is_zni       : !!is_zni && !!fiche.zni_eligible,
    is_precarite : !!is_precarite && !!fiche.precarite_eligible,

    // Documents et contrôle
    documents_requis: docs,
    points_controle : controles,

    // Alertes
    warnings,

    // Disclaimer obligatoire
    disclaimer: 'Simulation indicative basée sur les arrêtés CEE. Vérifiez toujours avec la fiche officielle en vigueur avant engagement.'
  };
}

// ── Export ─────────────────────────────────────────────────────────────────────
module.exports = { simulate, zoneFromDept, PRIX_DEFAULT_EUR_MWH };
