require('dotenv').config({ path: require('path').join(__dirname, '.env'), override: true });
const express      = require('express');
const multer       = require('multer');
const sqlite3      = require('sqlite3').verbose();
const path         = require('path');
const fs           = require('fs');
const csv          = require('csv-parser');
const session      = require('express-session');
const { Readable } = require('stream');
const Anthropic    = require('@anthropic-ai/sdk');
const nodemailer   = require('nodemailer');
const XLSX         = require('xlsx');

const app  = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Perruche2b';

// ── Directories ───────────────────────────────────────────────────────────────
const DATA_DIR    = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR  = path.join(__dirname, 'public');
[DATA_DIR, UPLOADS_DIR, path.join(PUBLIC_DIR, 'data')].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Database ──────────────────────────────────────────────────────────────────
const db = new sqlite3.Database(path.join(DATA_DIR, 'cee.db'), err => {
  if (err) console.error('DB error:', err);
  else console.log('✅ Base de données connectée');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS beneficiaires (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    code            TEXT UNIQUE NOT NULL,
    nom             TEXT NOT NULL,
    prenom          TEXT NOT NULL,
    email           TEXT DEFAULT '',
    telephone       TEXT DEFAULT '',
    raison_sociale  TEXT DEFAULT '',
    siret           TEXT DEFAULT '',
    adresse         TEXT DEFAULT '',
    code_postal     TEXT DEFAULT '',
    ville           TEXT DEFAULT '',
    activite        TEXT DEFAULT '',
    partenaire      TEXT DEFAULT '',
    statut          TEXT DEFAULT 'en_attente',
    archived        INTEGER DEFAULT 0,
    notes_admin     TEXT DEFAULT '',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Migrations pour les colonnes ajoutées
  db.run(`ALTER TABLE beneficiaires ADD COLUMN activite TEXT DEFAULT ''`, () => {});
  db.run(`ALTER TABLE beneficiaires ADD COLUMN archived INTEGER DEFAULT 0`, () => {});
  db.run(`ALTER TABLE beneficiaires ADD COLUMN partenaire TEXT DEFAULT ''`, () => {});

  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiaire_id  INTEGER NOT NULL,
    type             TEXT NOT NULL,
    filename         TEXT NOT NULL,
    original_name    TEXT NOT NULL,
    uploaded_by      TEXT NOT NULL DEFAULT 'beneficiaire',
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (beneficiaire_id) REFERENCES beneficiaires(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS commentaires (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiaire_id  INTEGER NOT NULL,
    auteur           TEXT NOT NULL DEFAULT 'beneficiaire',
    contenu          TEXT NOT NULL,
    lu_admin         INTEGER DEFAULT 0,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (beneficiaire_id) REFERENCES beneficiaires(id) ON DELETE CASCADE
  )`);
  db.run(`ALTER TABLE commentaires ADD COLUMN lu_admin INTEGER DEFAULT 0`, () => {});
  db.run(`ALTER TABLE beneficiaires ADD COLUMN exclude_relance INTEGER DEFAULT 0`, () => {});

  db.run(`CREATE TABLE IF NOT EXISTS email_templates (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nom        TEXT NOT NULL,
    sujet      TEXT NOT NULL,
    corps      TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Précharge les modèles par défaut si la table est vide
  db.get('SELECT COUNT(*) as cnt FROM email_templates', (err, row) => {
    if (err || row.cnt > 0) return;
    const TPL = [
      { nom: 'Relance — Documents manquants',
        sujet: 'Action requise — Documents manquants pour votre dossier CEE ({{code}})',
        corps: `Bonjour {{prenom}} {{nom}},

Nous avons bien reçu votre dossier CEE (code : {{code}}) et vous remercions de votre confiance.

Afin de finaliser votre dossier et procéder au versement de votre prime, il nous manque les documents suivants :
{{documents_manquants}}

Merci de les déposer dès que possible sur votre espace personnel :
{{lien_portail}}

Ces pièces sont indispensables pour valider votre demande dans les meilleurs délais.

Cordialement,
L'équipe Plateforme CEE` },
      { nom: 'Relance URGENTE — 7 jours restants',
        sujet: 'URGENT — Votre dossier CEE est incomplet ({{code}})',
        corps: `Bonjour {{prenom}} {{nom}},

Malgré notre précédent message, nous n'avons pas encore reçu les documents nécessaires à votre dossier CEE (code : {{code}}).

Documents encore attendus :
{{documents_manquants}}

Sans réception de ces pièces dans les 7 jours, votre dossier sera suspendu.

Déposez vos documents ici : {{lien_portail}}

Cordialement,
L'équipe Plateforme CEE` },
      { nom: 'Bienvenue — Premier contact',
        sujet: 'Bienvenue sur votre espace CEE — Code d\'accès {{code}}',
        corps: `Bonjour {{prenom}} {{nom}},

Bienvenue sur la Plateforme CEE ! Votre dossier a été créé avec succès.

Votre code d'accès : {{code}}

Connectez-vous pour suivre votre dossier et déposer les documents requis :
{{lien_portail}}

Documents à déposer :
• Extrait KBIS ou RNE (moins de 3 mois)
• Liasse fiscale 2024
• Attestation URSSAF en cours de validité

Notre équipe reste disponible pour vous accompagner.

Cordialement,
L'équipe Plateforme CEE` },
      { nom: 'Dossier validé — Prime en cours',
        sujet: 'Votre dossier CEE a été validé ✓ ({{code}})',
        corps: `Bonjour {{prenom}} {{nom}},

Excellente nouvelle ! Votre dossier CEE (code : {{code}}) a été validé.

La prime CEE correspondant à vos travaux est en cours de traitement et vous sera versée dans les prochaines semaines.

Merci de votre confiance.

Cordialement,
L'équipe Plateforme CEE` }
    ];
    TPL.forEach(t => db.run('INSERT INTO email_templates (nom,sujet,corps) VALUES (?,?,?)', [t.nom, t.sujet, t.corps]));
    console.log('✅ Modèles email préchargés');
  });
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));
app.use(session({
  secret: process.env.SESSION_SECRET || 'cee-platform-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 8 * 60 * 60 * 1000 }
}));

// ── Multer ────────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
});

// Admin : accepte PDF, images, docs
const uploadAdmin = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['.pdf','.jpg','.jpeg','.png','.doc','.docx'];
    ok.includes(path.extname(file.originalname).toLowerCase()) ? cb(null, true) : cb(new Error('Format non autorisé'));
  }
});

// Bénéficiaire : PDF uniquement
const uploadBenef = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.pdf') cb(null, true);
    else cb(new Error('FORMAT_PDF_ONLY'));
  }
});

const csvXlsxUpload = multer({ storage: multer.memoryStorage() });

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = 'CEE-';
  for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  c += '-';
  for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}
function generateUniqueCode() {
  return new Promise((resolve, reject) => {
    const try_ = () => {
      const code = generateCode();
      db.get('SELECT id FROM beneficiaires WHERE code = ?', [code], (err, row) => {
        if (err) reject(err); else if (row) try_(); else resolve(code);
      });
    };
    try_();
  });
}
const requireAdmin       = (req, res, next) => req.session.isAdmin        ? next() : res.status(401).json({ error: 'Non autorisé' });
const requireBeneficiary = (req, res, next) => req.session.beneficiaireId ? next() : res.status(401).json({ error: 'Non autorisé' });

// ── Import : détection automatique des champs ─────────────────────────────────
const FIELD_SYNONYMS = {
  nom:            ['nom','name','lastname','last_name','last name','family_name','nom de famille','surname','nom_famille'],
  prenom:         ['prenom','prénom','firstname','first_name','first name','given name','prenom_contact','forename'],
  email:          ['email','mail','e-mail','courriel','adresse mail','adresse_mail','email_address','contact_email'],
  telephone:      ['telephone','téléphone','tel','tél','phone','mobile','portable','gsm','numéro','numero','tél.','téléphone portable','num_tel'],
  raison_sociale: ['raison_sociale','raison sociale','raisonsociale','company','société','societe','entreprise','denomination','dénomination','nom société','nom_entreprise','structure','enseigne'],
  siret:          ['siret','n°siret','numero_siret','numéro siret','n° siret','num_siret','siret_number'],
  adresse:        ['adresse','address','rue','voie','adresse_ligne1','adresse postale','adresse ligne 1','adresse_postale','street'],
  code_postal:    ['code_postal','codepostal','cp','postal_code','zip','code postal','code post','cpostal','code_post'],
  ville:          ['ville','city','commune','localite','localité','municipality','cité'],
  activite:       ['activite','activité','activity','secteur','secteur_activite','metier','métier','profession','domaine','naf','ape','code_ape','code ape','secteur_activité'],
  partenaire:     ['partenaire','partner','apporteur','apporteur_affaire','apporteur d affaires','obligé','oblige','mandataire','origine','source','reseau','réseau','commercial']
};

// Partenaires reconnus (id normalisé → nom canonique)
const PARTENAIRES = {
  'releve energie':      'Relève Energie',
  'releve_energie':      'Relève Energie',
  'releveenergie':       'Relève Energie',
  'relève energie':      'Relève Energie',
  'relève_energie':      'Relève Energie',
  'france eco habitat':  'France Eco Habitat',
  'france_eco_habitat':  'France Eco Habitat',
  'franceecohabitat':    'France Eco Habitat',
  'france-eco-habitat':  'France Eco Habitat'
};
function canonPartenaire(v) {
  if (!v) return '';
  // Supprimer le caractère de remplacement Unicode U+FFFD (encodage cassé, ex: CSV mal encodé)
  const stripped = String(v).replace(/\uFFFD/g, '');
  const n = stripped.toLowerCase().trim().replace(/[\s\-_]+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  for (const [k, name] of Object.entries(PARTENAIRES)) {
    const kn = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\s\-_]+/g,' ');
    if (n === kn) return name;
  }
  // Si la valeur originale contenait U+FFFD, retourner la version nettoyée plutôt que la valeur cassée
  return stripped.trim() || String(v).trim();
}

function normalize(s) {
  return String(s||'').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\s_\-\.]+/g,'_');
}

function detectMapping(headers) {
  const mapping = {};
  const used = new Set();
  const normalizedHeaders = headers.map(normalize);

  for (const [field, synonyms] of Object.entries(FIELD_SYNONYMS)) {
    const normSynonyms = synonyms.map(normalize);
    let bestIdx = -1, confident = false;

    // Exact match first
    for (let i = 0; i < normalizedHeaders.length; i++) {
      if (used.has(i)) continue;
      if (normSynonyms.includes(normalizedHeaders[i])) {
        bestIdx = i; confident = true; break;
      }
    }
    // Partial match fallback
    if (bestIdx === -1) {
      for (let i = 0; i < normalizedHeaders.length; i++) {
        if (used.has(i)) continue;
        for (const syn of normSynonyms) {
          if (normalizedHeaders[i].includes(syn) || syn.includes(normalizedHeaders[i])) {
            bestIdx = i; confident = false; break;
          }
        }
        if (bestIdx !== -1) break;
      }
    }
    if (bestIdx !== -1) {
      mapping[field] = { idx: bestIdx, header: headers[bestIdx], confident };
      used.add(bestIdx);
    }
  }
  return mapping;
}

function rowToData(row, mapping) {
  const d = {};
  for (const [field, { idx }] of Object.entries(mapping)) {
    d[field] = (Array.isArray(row) ? row[idx] : row[Object.keys(row)[idx]] || '') ;
    d[field] = String(d[field] || '').trim();
  }
  return d;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── DOCUMENT ANALYSIS (Claude AI) ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const DOC_TYPES = {
  kbis_rne:           { name: 'KBIS ou RNE',         desc: "un extrait Kbis (document officiel du greffe du Tribunal de Commerce) ou une attestation d'inscription au Registre National des Entreprises (RNE) ou Registre des Métiers" },
  liasse_fiscale:     { name: 'liasse fiscale 2024',  desc: "une liasse fiscale de l'exercice 2024 (ensemble de formulaires fiscaux professionnels : bilan, compte de résultat, formulaires 2065, 2033, 2031, 2050, etc.)" },
  attestation_urssaf: { name: 'attestation URSSAF 2024', desc: "une attestation de vigilance ou attestation de situation globale délivrée par l'URSSAF en 2024" }
};

async function analyzeDocument(filePath, originalName, expectedType) {
  if (!process.env.ANTHROPIC_API_KEY) return { valid: true, skipped: true };
  const typeInfo = DOC_TYPES[expectedType];
  if (!typeInfo) return { valid: true, skipped: true };
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length > 4.5 * 1024 * 1024) return { valid: true, skipped: true };
    const base64 = buf.toString('base64');
    const ext = path.extname(originalName).toLowerCase();
    const contentPart = ext === '.pdf'
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
      : { type: 'image',    source: { type: 'base64', media_type: { '.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png' }[ext]||'image/jpeg', data: base64 } };

    const otherTypes = Object.entries(DOC_TYPES).filter(([k]) => k !== expectedType).map(([,v]) => `- ${v.name}`).join('\n');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const resp = await client.messages.create({
      model: 'claude-opus-4-5', max_tokens: 300,
      messages: [{ role: 'user', content: [
        contentPart,
        { type: 'text', text: `Tu es expert en documents administratifs français pour dossiers CEE.\nVérifie si ce document est : ${typeInfo.desc}.\nSi non, identifie s'il s'agit de :\n${otherTypes}\nRéponds UNIQUEMENT en JSON strict :\n{"valid":true,"reason":"..."} si correct\n{"valid":false,"reason":"Ce document semble être [identifié]. Déposez-le dans l'emplacement '[nom correct]'."} si mauvais emplacement\n{"valid":false,"reason":"Ce document n'est pas un ${typeInfo.name}."} si sans rapport\n{"valid":true,"reason":"..."} si incertain` }
      ]}]
    });
    const match = resp.content[0].text.trim().match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { valid: true, skipped: true };
  } catch(e) {
    console.error('⚠️  Analyse IA:', e.message, '— accepté par défaut');
    return { valid: true, skipped: true };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── EMAIL ─────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const pendingEmails = new Map();
const EMAIL_DELAY   = 15 * 60 * 1000;

function getTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

function scheduleRecapEmail(beneficiaireId, commentId) {
  let p = pendingEmails.get(beneficiaireId);
  if (p) { clearTimeout(p.timer); p.commentIds.push(commentId); }
  else { p = { commentIds: [commentId] }; pendingEmails.set(beneficiaireId, p); }
  p.timer = setTimeout(() => { pendingEmails.delete(beneficiaireId); sendRecapEmail(beneficiaireId, p.commentIds); }, EMAIL_DELAY);
  console.log(`⏱  Email récap dans 15 min → bénéficiaire #${beneficiaireId}`);
}

function sendRecapEmail(beneficiaireId, commentIds) {
  const t = getTransporter(); if (!t) return;
  db.get('SELECT * FROM beneficiaires WHERE id = ?', [beneficiaireId], (err, b) => {
    if (err || !b || !b.email) return;
    const ph = commentIds.map(() => '?').join(',');
    db.all(`SELECT * FROM commentaires WHERE id IN (${ph}) ORDER BY created_at ASC`, commentIds, async (err, comments) => {
      if (err || !comments?.length) return;
      const STATUT_FR = { en_attente:'En attente', en_cours:'En cours', documents_recus:'Documents reçus', valide:'Validé ✓', refuse:'Refusé' };
      const commentsHtml = comments.map(c => `<div style="background:#EFF6FF;border-left:4px solid #1D4ED8;padding:14px 18px;margin:10px 0;border-radius:6px;"><p style="margin:0 0 8px;color:#1E293B;line-height:1.6;">${c.contenu.replace(/\n/g,'<br>')}</p><p style="margin:0;font-size:12px;color:#64748B;">${new Date(c.created_at+'Z').toLocaleString('fr-FR',{timeZone:'Europe/Paris'})}</p></div>`).join('');
      const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head><body style="font-family:'Segoe UI',Arial,sans-serif;background:#F8FAFC;margin:0;padding:30px 0;"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);"><div style="background:linear-gradient(135deg,#1D4ED8,#059669);padding:28px 32px;text-align:center;"><div style="font-size:2rem;margin-bottom:8px;">⚡</div><h1 style="color:#fff;margin:0;font-size:1.4rem;font-weight:700;">Plateforme CEE</h1><p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:.9rem;">Mise à jour de votre dossier</p></div><div style="padding:32px;"><p style="color:#1E293B;font-size:1rem;margin-top:0;">Bonjour <strong>${b.prenom} ${b.nom}</strong>,</p><p style="color:#475569;">Votre conseiller CEE a répondu sur votre dossier :</p><div style="background:#F8FAFC;border-radius:10px;padding:16px;margin:20px 0;"><div><span style="font-size:.75rem;color:#94A3B8;text-transform:uppercase;">Code dossier</span><br><strong style="font-family:monospace;color:#1D4ED8;font-size:1.1rem;">${b.code}</strong></div>${b.raison_sociale?`<div style="margin-top:8px;"><span style="font-size:.75rem;color:#94A3B8;text-transform:uppercase;">Entreprise</span><br><strong>${b.raison_sociale}</strong></div>`:''}<div style="margin-top:8px;"><span style="font-size:.75rem;color:#94A3B8;text-transform:uppercase;">Statut</span><br><strong style="color:#059669;">${STATUT_FR[b.statut]||b.statut}</strong></div></div><h3 style="color:#1E293B;font-size:1rem;margin:24px 0 8px;">💬 Message${comments.length>1?'s':''} de votre conseiller</h3>${commentsHtml}<div style="text-align:center;margin:28px 0 8px;"><a href="${process.env.PLATFORM_URL||'http://localhost:3000'}/portal.html" style="background:linear-gradient(135deg,#059669,#047857);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:.95rem;display:inline-block;">Accéder à mon dossier →</a><p style="color:#94A3B8;font-size:.8rem;margin-top:12px;">Code : <strong style="font-family:monospace;color:#1D4ED8;">${b.code}</strong></p></div></div><div style="background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;"><p style="color:#94A3B8;font-size:.8rem;margin:0;">Plateforme CEE — JMJ Transition</p><p style="color:#CBD5E1;font-size:.75rem;margin:4px 0 0;">Email automatique — ne pas répondre directement.</p></div></div></body></html>`;
      try {
        await t.sendMail({ from:`"${process.env.SMTP_FROM_NAME||'Plateforme CEE'}" <${process.env.SMTP_USER}>`, to:b.email, subject:`Réponse de votre conseiller CEE — Dossier ${b.code}`, html });
        console.log(`📧 Récap envoyé → ${b.email}`);
      } catch(e) { console.error('❌ Email:', e.message); }
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── ADMIN ROUTES ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/admin/login',      (req, res) => { if (req.body.password === ADMIN_PASSWORD) { req.session.isAdmin = true; res.json({ success:true }); } else res.status(401).json({ error:'Mot de passe incorrect' }); });
app.post('/api/admin/logout',     (req, res) => { req.session.destroy(); res.json({ success:true }); });
app.get('/api/admin/check-auth',  (req, res) => res.json({ authenticated: !!req.session.isAdmin }));

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  db.get('SELECT COUNT(*) as total FROM beneficiaires WHERE archived=0', [], (err, total) => {
    db.all('SELECT statut, COUNT(*) as count FROM beneficiaires WHERE archived=0 GROUP BY statut', [], (err, byStatut) => {
      db.get('SELECT COUNT(*) as total FROM documents WHERE uploaded_by="beneficiaire"', [], (err, docs) => {
        db.get('SELECT COUNT(*) as total FROM beneficiaires WHERE archived=1', [], (err, arch) => {
          res.json({ total:total?.total||0, byStatut:byStatut||[], totalDocuments:docs?.total||0, archived:arch?.total||0 });
        });
      });
    });
  });
});

app.get('/api/admin/beneficiaires', requireAdmin, (req, res) => {
  const { search, statut, archived } = req.query;
  let where = 'b.archived = ?';
  const params = [archived === '1' ? 1 : 0];
  if (search) {
    where += ' AND (b.nom LIKE ? OR b.prenom LIKE ? OR b.raison_sociale LIKE ? OR b.siret LIKE ? OR b.code LIKE ? OR b.email LIKE ?)';
    const s = `%${search}%`; params.push(s,s,s,s,s,s);
  }
  if (statut) { where += ' AND b.statut = ?'; params.push(statut); }
  const query = `
    SELECT b.*,
      (SELECT COUNT(DISTINCT type) FROM documents WHERE beneficiaire_id=b.id AND uploaded_by='beneficiaire' AND type IN ('kbis_rne','liasse_fiscale','attestation_urssaf')) AS docs_count,
      (SELECT CASE WHEN COUNT(*)>0 THEN 1 ELSE 0 END FROM documents WHERE beneficiaire_id=b.id AND uploaded_by='beneficiaire' AND type='kbis_rne')           AS has_kbis,
      (SELECT CASE WHEN COUNT(*)>0 THEN 1 ELSE 0 END FROM documents WHERE beneficiaire_id=b.id AND uploaded_by='beneficiaire' AND type='liasse_fiscale')     AS has_liasse,
      (SELECT CASE WHEN COUNT(*)>0 THEN 1 ELSE 0 END FROM documents WHERE beneficiaire_id=b.id AND uploaded_by='beneficiaire' AND type='attestation_urssaf') AS has_urssaf,
      (SELECT COUNT(*) FROM commentaires WHERE beneficiaire_id=b.id AND auteur='beneficiaire' AND lu_admin=0) AS msgs_non_lus,
      (SELECT COUNT(*) FROM commentaires WHERE beneficiaire_id=b.id AND auteur='beneficiaire') AS total_msgs
    FROM beneficiaires b
    WHERE ${where}
    ORDER BY b.created_at DESC`;
  db.all(query, params, (err, rows) => err ? res.status(500).json({ error:err.message }) : res.json(rows));
});

// Notifications : tous les fils avec messages bénéficiaire (lus + non lus)
app.get('/api/admin/notifications', requireAdmin, (req, res) => {
  db.all(`
    SELECT b.id, b.nom, b.prenom, b.code, b.raison_sociale,
      COUNT(c.id) AS total_msgs,
      SUM(CASE WHEN c.lu_admin=0 THEN 1 ELSE 0 END) AS msgs_non_lus,
      MAX(c.created_at) AS dernier_msg
    FROM commentaires c
    JOIN beneficiaires b ON b.id = c.beneficiaire_id
    WHERE c.auteur='beneficiaire'
    GROUP BY b.id
    ORDER BY msgs_non_lus DESC, dernier_msg DESC`, [],
    (err, rows) => {
      if (err) return res.status(500).json({ error:err.message });
      const total = rows.reduce((s,r) => s + (r.msgs_non_lus||0), 0);
      res.json({ total, beneficiaires: rows });
    }
  );
});

// Marquer tous les messages d'un bénéficiaire comme lus par l'admin
app.put('/api/admin/beneficiaires/:id/mark-read', requireAdmin, (req, res) => {
  db.run(`UPDATE commentaires SET lu_admin=1 WHERE beneficiaire_id=? AND auteur='beneficiaire'`, [req.params.id],
    (err) => err ? res.status(500).json({ error:err.message }) : res.json({ success:true }));
});

app.post('/api/admin/beneficiaires', requireAdmin, async (req, res) => {
  try {
    const { nom, prenom, email, telephone, raison_sociale, siret, adresse, code_postal, ville, activite, partenaire } = req.body;
    if (!nom?.trim() || !prenom?.trim()) return res.status(400).json({ error:'Nom et prénom requis' });
    const code = await generateUniqueCode();
    db.run(
      `INSERT INTO beneficiaires (code,nom,prenom,email,telephone,raison_sociale,siret,adresse,code_postal,ville,activite,partenaire) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [code,nom.trim(),prenom.trim(),email||'',telephone||'',raison_sociale||'',siret||'',adresse||'',code_postal||'',ville||'',activite||'',canonPartenaire(partenaire||'')],
      function(err) { if(err) return res.status(500).json({error:err.message}); db.get('SELECT * FROM beneficiaires WHERE id=?',[this.lastID],(err,row)=>res.json(row)); }
    );
  } catch(err) { res.status(500).json({ error:err.message }); }
});

// Import CSV/XLSX avec détection automatique
app.post('/api/admin/beneficiaires/import', requireAdmin, csvXlsxUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error:'Fichier requis' });
  const ext = path.extname(req.file.originalname).toLowerCase();
  const results=[], errors=[], warnings=[];
  let headers=[], dataRows=[];

  try {
    if (ext === '.xlsx' || ext === '.xls') {
      const wb = XLSX.read(req.file.buffer, { type:'buffer' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws, { header:1, defval:'' });
      headers = (raw[0]||[]).map(String);
      dataRows = raw.slice(1).map(row => { const o={}; headers.forEach((h,i)=>{ o[h]=String(row[i]||'').trim(); }); return o; });
    } else {
      const content = req.file.buffer.toString('utf-8');
      // Detect separator
      const firstLine = content.split('\n')[0];
      const sep = firstLine.split(';').length > firstLine.split(',').length ? ';' : ',';
      await new Promise((resolve, reject) => {
        Readable.from(content)
          .pipe(csv({ separator:sep, mapHeaders:({header})=>header.trim() }))
          .on('data', d => dataRows.push(d)).on('end', resolve).on('error', reject);
      });
      headers = dataRows.length > 0 ? Object.keys(dataRows[0]) : [];
    }

    const mapping = detectMapping(headers);

    // Avertissements pour les mappings incertains
    for (const [field, info] of Object.entries(mapping)) {
      if (!info.confident) warnings.push(`⚠️ Champ "${field}" détecté depuis la colonne "${info.header}" — vérification recommandée`);
    }
    if (!mapping.nom)    warnings.push('⚠️ Colonne "nom" non détectée');
    if (!mapping.prenom) warnings.push('⚠️ Colonne "prénom" non détectée');

    for (const row of dataRows) {
      const d = {};
      for (const [field, info] of Object.entries(mapping)) {
        d[field] = String(row[info.header] || '').trim();
      }
      const nom = d.nom||'', prenom = d.prenom||'';
      if (!nom || !prenom) { errors.push(`Ligne ignorée : nom/prénom manquant`); continue; }
      try {
        const code = await generateUniqueCode();
        await new Promise((resolve, reject) => {
          const partenaireFromCsv = canonPartenaire(d.partenaire || (req.body && req.body.partenaire) || '');
          db.run(
            `INSERT INTO beneficiaires (code,nom,prenom,email,telephone,raison_sociale,siret,adresse,code_postal,ville,activite,partenaire) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [code,nom,prenom,d.email||'',d.telephone||'',d.raison_sociale||'',d.siret||'',d.adresse||'',d.code_postal||'',d.ville||'',d.activite||'',partenaireFromCsv],
            function(err) { err ? reject(err) : (results.push({nom,prenom,code}), resolve()); }
          );
        });
      } catch(e) { errors.push(`${nom} ${prenom} : ${e.message}`); }
    }

    res.json({ success:true, created:results.length, errors:errors.length, warnings:warnings.length, details:results, errorDetails:errors, warningDetails:warnings, mappingInfo: Object.fromEntries(Object.entries(mapping).map(([f,i])=>[f,{header:i.header,confident:i.confident}])) });
  } catch(err) { res.status(500).json({ error:err.message }); }
});

app.get('/api/admin/beneficiaires/:id', requireAdmin, (req, res) => {
  db.get('SELECT * FROM beneficiaires WHERE id=?', [req.params.id], (err, b) => {
    if (err||!b) return res.status(404).json({ error:'Bénéficiaire introuvable' });
    db.all('SELECT * FROM documents WHERE beneficiaire_id=? ORDER BY created_at DESC', [b.id], (err, docs) => {
      db.all('SELECT * FROM commentaires WHERE beneficiaire_id=? ORDER BY created_at ASC', [b.id], (err, comms) => {
        res.json({ ...b, documents:docs||[], commentaires:comms||[] });
      });
    });
  });
});

app.put('/api/admin/beneficiaires/:id', requireAdmin, (req, res) => {
  const { nom, prenom, email, telephone, raison_sociale, siret, adresse, code_postal, ville, activite, partenaire, notes_admin } = req.body;
  db.run(
    `UPDATE beneficiaires SET nom=?,prenom=?,email=?,telephone=?,raison_sociale=?,siret=?,adresse=?,code_postal=?,ville=?,activite=?,partenaire=?,notes_admin=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [nom,prenom,email,telephone,raison_sociale,siret,adresse,code_postal,ville,activite||'',canonPartenaire(partenaire||''),notes_admin||'',req.params.id],
    err => err ? res.status(500).json({error:err.message}) : res.json({success:true})
  );
});

app.put('/api/admin/beneficiaires/:id/status', requireAdmin, (req, res) => {
  const valid = ['en_attente','en_cours','documents_recus','valide','refuse'];
  if (!valid.includes(req.body.statut)) return res.status(400).json({ error:'Statut invalide' });
  db.run('UPDATE beneficiaires SET statut=?,updated_at=CURRENT_TIMESTAMP WHERE id=?', [req.body.statut, req.params.id],
    err => err ? res.status(500).json({error:err.message}) : res.json({success:true}));
});

// Archive (soft delete)
app.put('/api/admin/beneficiaires/:id/archive', requireAdmin, (req, res) => {
  const archived = req.body.archived ? 1 : 0;
  db.run('UPDATE beneficiaires SET archived=?,updated_at=CURRENT_TIMESTAMP WHERE id=?', [archived, req.params.id],
    err => err ? res.status(500).json({error:err.message}) : res.json({success:true}));
});

// Suppression définitive
app.delete('/api/admin/beneficiaires/:id', requireAdmin, (req, res) => {
  db.all('SELECT filename FROM documents WHERE beneficiaire_id=?', [req.params.id], (err, docs) => {
    if (docs) docs.forEach(d => { const fp=path.join(UPLOADS_DIR,d.filename); if(fs.existsSync(fp)) fs.unlinkSync(fp); });
    db.run('DELETE FROM beneficiaires WHERE id=?', [req.params.id],
      err => err ? res.status(500).json({error:err.message}) : res.json({success:true}));
  });
});

app.post('/api/admin/beneficiaires/:id/documents', requireAdmin, uploadAdmin.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error:'Fichier requis' });
  db.run('INSERT INTO documents (beneficiaire_id,type,filename,original_name,uploaded_by) VALUES (?,?,?,?,?)',
    [req.params.id, req.body.type||'admin', req.file.filename, req.file.originalname, 'admin'],
    function(err) { err ? res.status(500).json({error:err.message}) : res.json({id:this.lastID,filename:req.file.filename,original_name:req.file.originalname}); }
  );
});

app.post('/api/admin/beneficiaires/:id/comments', requireAdmin, (req, res) => {
  if (!req.body.contenu?.trim()) return res.status(400).json({ error:'Commentaire vide' });
  const beneficiaireId = parseInt(req.params.id);
  db.run('INSERT INTO commentaires (beneficiaire_id,auteur,contenu) VALUES (?,?,?)',
    [beneficiaireId,'admin',req.body.contenu.trim()],
    function(err) { if(err) return res.status(500).json({error:err.message}); res.json({id:this.lastID,success:true}); scheduleRecapEmail(beneficiaireId, this.lastID); }
  );
});

// Email groupé
app.post('/api/admin/email/broadcast', requireAdmin, async (req, res) => {
  const { beneficiaireIds, subject, body } = req.body;
  if (!subject?.trim() || !body?.trim() || !beneficiaireIds?.length)
    return res.status(400).json({ error:'Sujet, contenu et destinataires requis' });
  const t = getTransporter();
  if (!t) return res.status(503).json({ error:'Email non configuré (SMTP manquant)' });

  const ph = beneficiaireIds.map(() => '?').join(',');
  db.all(`SELECT * FROM beneficiaires WHERE id IN (${ph}) AND email != '' AND archived=0`, beneficiaireIds, async (err, benefs) => {
    if (err) return res.status(500).json({ error:err.message });
    const sent=[], failed=[], skipped=[];

    for (const b of benefs) {
      if (!b.email) { skipped.push(`${b.prenom} ${b.nom} (pas d'email)`); continue; }
      const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head><body style="font-family:'Segoe UI',Arial,sans-serif;background:#F8FAFC;margin:0;padding:30px 0;"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);"><div style="background:linear-gradient(135deg,#1D4ED8,#059669);padding:28px 32px;text-align:center;"><div style="font-size:2rem;">⚡</div><h1 style="color:#fff;margin:6px 0 0;font-size:1.4rem;">Plateforme CEE</h1></div><div style="padding:32px;"><p style="color:#1E293B;">Bonjour <strong>${b.prenom} ${b.nom}</strong>,</p><div style="color:#1E293B;line-height:1.8;">${body.replace(/\n/g,'<br>')}</div><div style="text-align:center;margin:28px 0;"><a href="${process.env.PLATFORM_URL||'http://localhost:3000'}/portal.html" style="background:linear-gradient(135deg,#059669,#047857);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;display:inline-block;">Accéder à mon dossier →</a><p style="color:#94A3B8;font-size:.8rem;margin-top:10px;">Code : <strong style="font-family:monospace;color:#1D4ED8;">${b.code}</strong></p></div></div><div style="background:#F8FAFC;padding:16px 32px;text-align:center;border-top:1px solid #E2E8F0;"><p style="color:#94A3B8;font-size:.8rem;margin:0;">Plateforme CEE — JMJ Transition</p></div></div></body></html>`;
      try {
        await t.sendMail({ from:`"${process.env.SMTP_FROM_NAME||'Plateforme CEE'}" <${process.env.SMTP_USER}>`, to:b.email, subject, html });
        sent.push(b.email);
      } catch(e) { failed.push({ email:b.email, error:e.message }); }
    }
    res.json({ success:true, sent:sent.length, failed:failed.length, skipped:skipped.length, sentList:sent, failedList:failed, skippedList:skipped });
  });
});

// ── Document download ─────────────────────────────────────────────────────────
app.delete('/api/documents/:docId', requireAdmin, (req, res) => {
  db.get('SELECT * FROM documents WHERE id=?', [req.params.docId], (err, doc) => {
    if (err || !doc) return res.status(404).json({ error:'Document introuvable' });
    const fp = path.join(UPLOADS_DIR, doc.filename);
    if (fs.existsSync(fp)) { try { fs.unlinkSync(fp); } catch(e){} }
    db.run('DELETE FROM documents WHERE id=?', [req.params.docId], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success:true });
    });
  });
});

app.get('/api/documents/:docId/download', (req, res) => {
  if (!req.session.isAdmin && !req.session.beneficiaireId) return res.status(401).json({ error:'Non autorisé' });
  db.get('SELECT * FROM documents WHERE id=?', [req.params.docId], (err, doc) => {
    if (err||!doc) return res.status(404).json({ error:'Document introuvable' });
    if (req.session.beneficiaireId && req.session.beneficiaireId !== doc.beneficiaire_id) return res.status(403).json({ error:'Accès refusé' });
    const fp = path.join(UPLOADS_DIR, doc.filename);
    if (!fs.existsSync(fp)) return res.status(404).json({ error:'Fichier introuvable' });
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.original_name)}"`);
    res.sendFile(fp);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── PORTAIL BÉNÉFICIAIRE ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/portal/login', (req, res) => {
  const code = (req.body.code||'').trim().toUpperCase();
  if (!code) return res.status(400).json({ error:'Code requis' });
  db.get('SELECT * FROM beneficiaires WHERE UPPER(code)=?', [code], (err, row) => {
    if (err) return res.status(500).json({ error:err.message });
    if (!row) return res.status(401).json({ error:'Code invalide. Vérifiez votre code et réessayez.' });
    req.session.beneficiaireId = row.id;
    res.json({ success:true, nom:row.nom, prenom:row.prenom });
  });
});
app.post('/api/portal/logout',    (req, res) => { req.session.destroy(); res.json({success:true}); });
app.get('/api/portal/check-auth', (req, res) => res.json({ authenticated: !!req.session.beneficiaireId }));

app.get('/api/portal/dossier', requireBeneficiary, (req, res) => {
  const id = req.session.beneficiaireId;
  db.get('SELECT * FROM beneficiaires WHERE id=?', [id], (err, b) => {
    if (err||!b) return res.status(404).json({ error:'Dossier introuvable' });
    db.all('SELECT * FROM documents WHERE beneficiaire_id=? ORDER BY created_at DESC', [id], (err, docs) => {
      db.all('SELECT * FROM commentaires WHERE beneficiaire_id=? ORDER BY created_at ASC', [id], (err, comms) => {
        res.json({ ...b, documents:docs||[], commentaires:comms||[] });
      });
    });
  });
});

// Upload bénéficiaire : PDF uniquement + analyse IA
app.post('/api/portal/documents', requireBeneficiary, (req, res, next) => {
  uploadBenef.single('file')(req, res, err => {
    if (err) {
      if (err.message === 'FORMAT_PDF_ONLY')
        return res.status(400).json({ error:'Format PDF uniquement. Les photos et images ne sont pas acceptées. Veuillez scanner votre document et l\'exporter en PDF.', formatError: true });
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error:'Fichier requis' });
  const validTypes = ['kbis_rne','liasse_fiscale','attestation_urssaf'];
  if (!validTypes.includes(req.body.type)) { fs.unlinkSync(req.file.path); return res.status(400).json({ error:'Type invalide' }); }

  const filePath = path.join(UPLOADS_DIR, req.file.filename);
  const analysis = await analyzeDocument(filePath, req.file.originalname, req.body.type);
  if (!analysis.valid) {
    try { fs.unlinkSync(filePath); } catch(e) {}
    return res.status(422).json({ error: analysis.reason || `Document non conforme à un ${DOC_TYPES[req.body.type]?.name}.`, rejected: true });
  }

  const id = req.session.beneficiaireId;
  db.run('INSERT INTO documents (beneficiaire_id,type,filename,original_name,uploaded_by) VALUES (?,?,?,?,?)',
    [id, req.body.type, req.file.filename, req.file.originalname, 'beneficiaire'],
    function(err) {
      if (err) return res.status(500).json({ error:err.message });
      // Vérifier si les 3 documents obligatoires sont maintenant présents
      db.get(`SELECT COUNT(DISTINCT type) as cnt FROM documents
              WHERE beneficiaire_id=? AND uploaded_by='beneficiaire'
              AND type IN ('kbis_rne','liasse_fiscale','attestation_urssaf')`, [id], (err, row) => {
        if (row?.cnt >= 3) {
          db.run(`UPDATE beneficiaires SET statut='dossier_complet', updated_at=CURRENT_TIMESTAMP WHERE id=?`, [id]);
        } else {
          db.get('SELECT statut FROM beneficiaires WHERE id=?', [id], (err, b) => {
            if (b?.statut === 'en_attente') db.run(`UPDATE beneficiaires SET statut='en_cours', updated_at=CURRENT_TIMESTAMP WHERE id=?`, [id]);
          });
        }
      });
      res.json({ id:this.lastID, filename:req.file.filename, original_name:req.file.originalname });
    }
  );
});

// Mise à jour coordonnées par le bénéficiaire lui-même
app.put('/api/portal/profil', requireBeneficiary, (req, res) => {
  const { nom, prenom, email, telephone, adresse, code_postal, ville } = req.body;
  const id = req.session.beneficiaireId;
  db.run(`UPDATE beneficiaires SET nom=?,prenom=?,email=?,telephone=?,adresse=?,code_postal=?,ville=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [nom||'',prenom||'',email||'',telephone||'',adresse||'',code_postal||'',ville||'',id],
    (err) => err ? res.status(500).json({ error:err.message }) : res.json({ success:true })
  );
});

app.post('/api/portal/comments', requireBeneficiary, (req, res) => {
  if (!req.body.contenu?.trim()) return res.status(400).json({ error:'Commentaire vide' });
  db.run('INSERT INTO commentaires (beneficiaire_id,auteur,contenu) VALUES (?,?,?)',
    [req.session.beneficiaireId,'beneficiaire',req.body.contenu.trim()],
    function(err) { err ? res.status(500).json({error:err.message}) : res.json({id:this.lastID,success:true}); }
  );
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (req.file?.path && fs.existsSync(req.file.path)) { try { fs.unlinkSync(req.file.path); } catch(e) {} }
  res.status(500).json({ error: err.message || 'Erreur serveur' });
});

// ── Exclude relance ───────────────────────────────────────────────────────────
app.put('/api/admin/beneficiaires/:id/exclude-relance', requireAdmin, (req, res) => {
  const val = req.body.exclude ? 1 : 0;
  db.run('UPDATE beneficiaires SET exclude_relance=? WHERE id=?', [val, req.params.id],
    err => err ? res.status(500).json({error:err.message}) : res.json({success:true}));
});

// ── Relance candidates ────────────────────────────────────────────────────────
app.get('/api/admin/relance-candidates', requireAdmin, (req, res) => {
  db.all(`
    SELECT b.*,
      (SELECT COUNT(DISTINCT type) FROM documents WHERE beneficiaire_id=b.id AND uploaded_by='beneficiaire' AND type IN ('kbis_rne','liasse_fiscale','attestation_urssaf')) AS docs_count,
      (SELECT CASE WHEN COUNT(*)>0 THEN 1 ELSE 0 END FROM documents WHERE beneficiaire_id=b.id AND uploaded_by='beneficiaire' AND type='kbis_rne')           AS has_kbis,
      (SELECT CASE WHEN COUNT(*)>0 THEN 1 ELSE 0 END FROM documents WHERE beneficiaire_id=b.id AND uploaded_by='beneficiaire' AND type='liasse_fiscale')     AS has_liasse,
      (SELECT CASE WHEN COUNT(*)>0 THEN 1 ELSE 0 END FROM documents WHERE beneficiaire_id=b.id AND uploaded_by='beneficiaire' AND type='attestation_urssaf') AS has_urssaf
    FROM beneficiaires b
    WHERE b.archived=0 AND b.exclude_relance=0 AND b.email!=''
      AND (SELECT COUNT(DISTINCT type) FROM documents WHERE beneficiaire_id=b.id AND uploaded_by='beneficiaire' AND type IN ('kbis_rne','liasse_fiscale','attestation_urssaf')) < 3
    ORDER BY b.created_at DESC`, [],
    (err, rows) => err ? res.status(500).json({error:err.message}) : res.json(rows)
  );
});

// ── Send relances ─────────────────────────────────────────────────────────────
app.post('/api/admin/send-relances', requireAdmin, async (req, res) => {
  const { beneficiaireIds, templateId } = req.body;
  if (!beneficiaireIds?.length) return res.status(400).json({error:'Aucun destinataire'});
  const transporter = getTransporter();
  if (!transporter) return res.status(400).json({error:'SMTP non configuré'});

  const template = await new Promise((resolve, reject) =>
    db.get('SELECT * FROM email_templates WHERE id=?', [templateId], (err,r) => err ? reject(err) : resolve(r))
  );
  if (!template) return res.status(400).json({error:'Modèle introuvable'});

  const benefs = await new Promise((resolve, reject) =>
    db.all(`SELECT b.*,
      (SELECT CASE WHEN COUNT(*)>0 THEN 1 ELSE 0 END FROM documents WHERE beneficiaire_id=b.id AND uploaded_by='beneficiaire' AND type='kbis_rne') AS has_kbis,
      (SELECT CASE WHEN COUNT(*)>0 THEN 1 ELSE 0 END FROM documents WHERE beneficiaire_id=b.id AND uploaded_by='beneficiaire' AND type='liasse_fiscale') AS has_liasse,
      (SELECT CASE WHEN COUNT(*)>0 THEN 1 ELSE 0 END FROM documents WHERE beneficiaire_id=b.id AND uploaded_by='beneficiaire' AND type='attestation_urssaf') AS has_urssaf
      FROM beneficiaires b WHERE b.id IN (${beneficiaireIds.map(()=>'?').join(',')})`,
      beneficiaireIds, (err,rows) => err ? reject(err) : resolve(rows))
  );

  const portalBase = process.env.PORTAL_URL || `http://localhost:${PORT}/portal.html`;
  let sent = 0, failed = 0;

  for (const b of benefs) {
    if (!b.email) { failed++; continue; }
    const missing = [];
    if (!b.has_kbis)   missing.push('• Extrait KBIS ou RNE');
    if (!b.has_liasse) missing.push('• Liasse fiscale 2024');
    if (!b.has_urssaf) missing.push('• Attestation URSSAF');

    const bodyText = template.corps
      .replace(/\{\{prenom\}\}/g, b.prenom).replace(/\{\{nom\}\}/g, b.nom)
      .replace(/\{\{code\}\}/g, b.code)
      .replace(/\{\{documents_manquants\}\}/g, missing.join('\n'))
      .replace(/\{\{lien_portail\}\}/g, `${portalBase}?code=${b.code}`);
    const subjectText = template.sujet.replace(/\{\{code\}\}/g, b.code).replace(/\{\{prenom\}\}/g, b.prenom).replace(/\{\{nom\}\}/g, b.nom);

    try {
      await transporter.sendMail({ from: process.env.SMTP_USER, to: b.email, subject: subjectText, text: bodyText });
      sent++;
    } catch(e) { console.error('Relance error:', b.email, e.message); failed++; }
  }
  res.json({sent, failed});
});

// ── Email templates CRUD ──────────────────────────────────────────────────────
app.get('/api/admin/email-templates', requireAdmin, (req, res) => {
  db.all('SELECT * FROM email_templates ORDER BY created_at', [], (err,rows) => err ? res.status(500).json({error:err.message}) : res.json(rows));
});
app.post('/api/admin/email-templates', requireAdmin, (req, res) => {
  const {nom,sujet,corps} = req.body;
  if (!nom||!sujet||!corps) return res.status(400).json({error:'Champs requis'});
  db.run('INSERT INTO email_templates (nom,sujet,corps) VALUES (?,?,?)', [nom,sujet,corps],
    function(err) { if(err) return res.status(500).json({error:err.message}); db.get('SELECT * FROM email_templates WHERE id=?',[this.lastID],(e,row)=>res.json(row)); }
  );
});
app.put('/api/admin/email-templates/:id', requireAdmin, (req, res) => {
  const {nom,sujet,corps} = req.body;
  db.run('UPDATE email_templates SET nom=?,sujet=?,corps=? WHERE id=?', [nom,sujet,corps,req.params.id],
    err => err ? res.status(500).json({error:err.message}) : res.json({success:true})
  );
});
app.delete('/api/admin/email-templates/:id', requireAdmin, (req, res) => {
  db.run('DELETE FROM email_templates WHERE id=?', [req.params.id],
    err => err ? res.status(500).json({error:err.message}) : res.json({success:true})
  );
});

// ── ChatBot CEE ───────────────────────────────────────────────────────────────
app.post('/api/admin/chatbot', requireAdmin, async (req, res) => {
  const { messages } = req.body;
  if (!process.env.ANTHROPIC_API_KEY) return res.status(400).json({error:'Clé API Anthropic non configurée dans .env'});
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const resp = await client.messages.create({
      model: 'claude-opus-4-5', max_tokens: 1024,
      system: `Tu es un expert CEE (Certificats d'Économies d'Énergie) et des aides à la rénovation énergétique en France. Tu travailles pour la Plateforme CEE et tu aides l'équipe administrative à :
- Comprendre les fiches d'opérations standardisées (BAR, BAT, IND, AGRI, RES, TRA) et leurs conditions d'éligibilité
- Calculer et vérifier les montants de prime CEE selon les forfaits en vigueur
- Vérifier les règles de cumul entre opérations
- Comprendre les exigences de certification RGE et les pièces justificatives
- Gérer les procédures administratives et les délais CEE
- Répondre aux questions sur MaPrimeRénov', les Coups de Pouce, et autres dispositifs ENR

Tu réponds de façon professionnelle, précise et concise. Tu cites les codes de fiches, arrêtés et périodes CEE quand c'est pertinent. Si tu n'es pas certain d'une valeur, tu le précises.`,
      messages: messages.map(m => ({ role: m.role, content: m.content }))
    });
    res.json({ content: resp.content[0].text });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Plateforme CEE démarrée : http://localhost:${PORT}`);
  console.log(`   🔐 Mot de passe admin    : ${ADMIN_PASSWORD}`);
  console.log(`   🤖 Analyse IA (Claude)   : ${process.env.ANTHROPIC_API_KEY ? '✅ Activée' : '⚠️  Désactivée'}`);
  console.log(`   📧 Email (Nodemailer)    : ${process.env.SMTP_USER ? '✅ Activé → '+process.env.SMTP_USER : '⚠️  Désactivé'}\n`);
});
