// ─────────────────────────────────────────────────────────────────────────────
// Veille réglementaire CEE (Certificats d'Économies d'Énergie)
// Sources :
//   1. JORF (Légifrance) — détection d'arrêtés modifiant / abrogeant / créant
//      des fiches d'opérations standardisées CEE.
//   2. ATEE webinaires — détection de fiches à l'étude / en projet annoncées
//      lors des sessions du Club C2E.
//
// Enrichissement LLM (optionnel) : si ANTHROPIC_API_KEY est défini, on
// extrait formule kWh cumac + conditions d'éligibilité + produit/service
// depuis le texte d'annexe pour pré-remplir une nouvelle fiche.
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

const https = require('https');

// Helpers fetch
function httpGet(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'EchoWAI-Veille-CEE/1.0', ...(opts.headers || {}) }
    }, (resp) => {
      // Suivi de redirection 3xx
      if ([301, 302, 303, 307, 308].includes(resp.statusCode) && resp.headers.location) {
        return resolve(httpGet(resp.headers.location, opts));
      }
      let buf = '';
      resp.on('data', c => { buf += c; if (buf.length > 2_000_000) buf = buf.slice(0, 2_000_000); });
      resp.on('end', () => resolve({ status: resp.statusCode, body: buf }));
    });
    req.on('error', reject);
    req.setTimeout(opts.timeout || 20000, () => { req.destroy(new Error('timeout')); });
  });
}

// Regex code fiche CEE (BAR-TH-104, IND-UT-117, etc.)
const FICHE_CODE_RX = /\b(BAR|BAT|IND|AGRI|RES|TRA)-[A-Z]{2}-\d{3}(?:\s*v?\d+)?\b/g;

// Détecte action (cree / abroge / modifie) dans un texte près d'un code fiche
function detectActionForCode(text, code) {
  // Recherche fenêtre ±200 caractères autour du code
  const idx = text.indexOf(code);
  if (idx < 0) return null;
  const ctx = text.slice(Math.max(0, idx - 200), Math.min(text.length, idx + 200)).toLowerCase();
  if (/abrog|abrogation|abroger|retire?\s|supprim/.test(ctx)) return 'abrogee';
  if (/cr[ée]ation|cr[ée]e\s|nouvelle?\s+fiche|institue/.test(ctx))  return 'nouvelle';
  if (/modif|r[ée]vis|met\s+\xE0\s+jour|nouvelle\s+version/.test(ctx)) return 'modifiee';
  return null;
}

// 1) Légifrance — derniers JORF
//    Page liste : https://www.legifrance.gouv.fr/contenu/derniers-textes-publies-au-jorf
//    On parse en récupérant les liens vers chaque texte et on garde ceux dont
//    le titre mentionne CEE / certificats d'économies d'énergie / fiche d'opération.
const LEGIFRANCE_JORF_URL = 'https://www.legifrance.gouv.fr/jorf/jour';

async function fetchJORFRecent(daysBack = 14) {
  // On parcourt les N derniers jours (table-of-contents par date)
  const results = [];
  const today = new Date();
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const url = `${LEGIFRANCE_JORF_URL}/${dStr}`;
    try {
      const { status, body } = await httpGet(url);
      if (status !== 200) continue;
      // Liens vers textes JORF : /jorf/id/JORFTEXT000... + title text
      const items = [...body.matchAll(/<a[^>]+href="(\/jorf\/id\/JORFTEXT\d+)"[^>]*>([^<]+)<\/a>/g)];
      for (const m of items) {
        const title = m[2].replace(/\s+/g, ' ').trim();
        if (!/certificat.{0,15}\xE9conomies?\s+d['']\xE9nergie|fiche\s+d['']op\xE9ration\s+standardis\xE9e|op\xE9ration\s+standardis\xE9e\s+d['']\xE9conomies|CEE/i.test(title)) continue;
        results.push({ date: dStr, url: 'https://www.legifrance.gouv.fr' + m[1], title });
      }
    } catch (e) {
      // continue
    }
  }
  return results;
}

async function fetchJORFArticleText(url) {
  try {
    const { status, body } = await httpGet(url);
    if (status !== 200) return '';
    // Nettoyage rapide HTML → texte
    const text = body
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<\/?[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');
    return text;
  } catch (e) { return ''; }
}

// 2) ATEE — webinaires Club C2E (fiches en projet / en cours)
const ATEE_URLS = [
  'https://atee.fr/atee-club-c2e/webinaires',
  'https://atee.fr/club-c2e/agenda',
];

async function fetchATEEWebinars() {
  const results = [];
  for (const url of ATEE_URLS) {
    try {
      const { status, body } = await httpGet(url);
      if (status !== 200) continue;
      const text = body
        .replace(/<script[\s\S]*?<\/script>/g, ' ')
        .replace(/<style[\s\S]*?<\/style>/g, ' ')
        .replace(/<\/?[^>]+>/g, ' ')
        .replace(/\s+/g, ' ');
      const codes = [...new Set(text.match(FICHE_CODE_RX) || [])].map(c => c.toUpperCase());
      codes.forEach(code => results.push({ url, code }));
    } catch (e) { /* continue */ }
  }
  return results;
}

// Enrichissement LLM (optionnel) — pour pré-remplir une nouvelle fiche
async function llmExtractFiche(text, codeHint) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = `Tu es un assistant CEE expert. Voici un extrait d'un arrêté JORF concernant une fiche d'opération standardisée :

${text.slice(0, 12000)}

Si la fiche correspond au code ${codeHint || '(à détecter)'}, extrais en JSON strict :
{
  "code": "BAR-XX-NNN",
  "nom": "...",
  "secteur": "BAR|BAT|IND|AGRI|RES|TRA",
  "sous_secteur": "...",
  "type_travaux": "...",
  "description": "...",
  "conditions_eligibilite": "...",
  "produit_ou_service": "...",
  "formule_kwh": "...",
  "type_calcul": "assistee|forfait_logement|surface_zone|...",
  "date_effet": "YYYY-MM-DD",
  "version": "..."
}

Si tu ne sais pas, mets une chaîne vide. Réponds UNIQUEMENT le JSON, sans markdown.`;
    const resp = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });
    const txt = resp.content[0]?.text || '';
    const m = txt.match(/\{[\s\S]+\}/);
    if (!m) return null;
    return JSON.parse(m[0]);
  } catch (e) {
    console.warn('llmExtractFiche error:', e.message);
    return null;
  }
}

// ── Orchestration ───────────────────────────────────────────────────────────
async function runJORF(db, declenchePar = 'auto') {
  const startTime = Date.now();
  const changes = [];
  let errored = null;
  try {
    const articles = await fetchJORFRecent(14);
    for (const art of articles) {
      const text = await fetchJORFArticleText(art.url);
      if (!text) continue;
      const codes = [...new Set(text.match(FICHE_CODE_RX) || [])].map(c => c.toUpperCase());
      for (const code of codes) {
        const action = detectActionForCode(text, code);
        if (!action) continue;
        await new Promise(res => {
          db.get('SELECT code, statut, actif FROM cee_fiches WHERE code=?', [code], (e, row) => {
            if (e) return res();
            if (action === 'abrogee') {
              if (!row || row.statut !== 'abrogee') {
                db.run('UPDATE cee_fiches SET statut=?, actif=0, date_abrogation=?, source_url=? WHERE code=?',
                  ['abrogee', art.date, art.url, code], () => { changes.push({ type: 'abrogation', code, date: art.date, url: art.url }); res(); });
                if (!row) {
                  // Le code apparaît dans un arrêté d'abrogation mais pas en base : on l'insère minimal
                  const sect = (code.split('-')[0] || 'BAR');
                  db.run(`INSERT OR IGNORE INTO cee_fiches (code,nom,secteur,statut,actif,date_abrogation,source_url) VALUES (?,?,?,?,?,?,?)`,
                    [code, code, sect, 'abrogee', 0, art.date, art.url]);
                }
              } else { res(); }
            } else if (action === 'nouvelle') {
              if (!row) {
                // Tente enrichissement LLM
                llmExtractFiche(text, code).then(rich => {
                  const sect = (code.split('-')[0] || 'BAR');
                  db.run(`INSERT OR IGNORE INTO cee_fiches (code,nom,secteur,sous_secteur,type_travaux,description,conditions_eligibilite,formule_kwh,type_calcul,statut,actif,date_effet,source_url,version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [
                      code,
                      rich?.nom || code,
                      rich?.secteur || sect,
                      rich?.sous_secteur || '',
                      rich?.type_travaux || '',
                      rich?.description || '',
                      rich?.conditions_eligibilite || '',
                      rich?.formule_kwh || '',
                      rich?.type_calcul || 'assistee',
                      'valide', 1,
                      rich?.date_effet || art.date,
                      art.url,
                      rich?.version || '',
                    ],
                    () => { changes.push({ type: 'nouvelle_fiche', code, enriched: !!rich, url: art.url }); res(); }
                  );
                }).catch(() => res());
              } else { res(); }
            } else if (action === 'modifiee') {
              db.run('UPDATE cee_fiches SET source_url=? WHERE code=?', [art.url, code],
                () => { changes.push({ type: 'modification', code, url: art.url }); res(); });
            } else { res(); }
          });
        });
      }
    }
  } catch (e) {
    errored = e.message;
  }
  return new Promise(resolve => {
    db.run(`INSERT INTO veille_logs (statut, fiches_verifiees, changements, erreur, declenche_par) VALUES (?,?,?,?,?)`,
      [errored ? 'erreur' : 'ok', changes.length, JSON.stringify({ source: 'JORF', changes }), errored || '', declenchePar + '/jorf'],
      () => resolve({ source: 'JORF', statut: errored ? 'erreur' : 'ok', erreur: errored, changements: changes, duree_ms: Date.now() - startTime }));
  });
}

async function runATEE(db, declenchePar = 'auto') {
  const startTime = Date.now();
  const changes = [];
  let errored = null;
  try {
    const detected = await fetchATEEWebinars();
    const codes = [...new Set(detected.map(d => d.code))];
    for (const code of codes) {
      await new Promise(res => {
        db.get('SELECT code, statut FROM cee_fiches WHERE code=?', [code], (e, row) => {
          if (e) return res();
          if (!row) {
            const sect = (code.split('-')[0] || 'BAR');
            db.run(`INSERT OR IGNORE INTO cee_fiches (code,nom,secteur,statut,actif,source_url) VALUES (?,?,?,?,?,?)`,
              [code, code + ' (en projet)', sect, 'en_projet', 1, detected[0]?.url || ''],
              () => { changes.push({ type: 'nouvelle_en_projet', code }); res(); });
          } else if (row.statut === 'valide') {
            // déjà publiée : on ne modifie pas
            res();
          } else if (row.statut !== 'en_projet' && row.statut !== 'en_cours') {
            db.run('UPDATE cee_fiches SET statut=? WHERE code=?', ['en_projet', code],
              () => { changes.push({ type: 'flag_en_projet', code }); res(); });
          } else { res(); }
        });
      });
    }
  } catch (e) {
    errored = e.message;
  }
  return new Promise(resolve => {
    db.run(`INSERT INTO veille_logs (statut, fiches_verifiees, changements, erreur, declenche_par) VALUES (?,?,?,?,?)`,
      [errored ? 'erreur' : 'ok', changes.length, JSON.stringify({ source: 'ATEE', changes }), errored || '', declenchePar + '/atee'],
      () => resolve({ source: 'ATEE', statut: errored ? 'erreur' : 'ok', erreur: errored, changements: changes, duree_ms: Date.now() - startTime }));
  });
}

async function runAll(db, declenchePar = 'auto') {
  const jorf = await runJORF(db, declenchePar);
  const atee = await runATEE(db, declenchePar);
  return { jorf, atee };
}

module.exports = { runJORF, runATEE, runAll, fetchJORFRecent, fetchATEEWebinars };
