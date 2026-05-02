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

  // ── Opérations CEE ────────────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS cee_operations (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiaire_id  INTEGER NOT NULL,
    code_fiche       TEXT NOT NULL,
    nom_operation    TEXT NOT NULL,
    secteur          TEXT DEFAULT '',
    date_engagement  DATE,
    date_achevement  DATE,
    volume_kwh       REAL DEFAULT 0,
    prime_estimee    REAL DEFAULT 0,
    prime_validee    REAL DEFAULT 0,
    statut           TEXT DEFAULT 'en_cours',
    notes            TEXT DEFAULT '',
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (beneficiaire_id) REFERENCES beneficiaires(id) ON DELETE CASCADE
  )`);

  // ── Journal d'activité ────────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiaire_id  INTEGER,
    action           TEXT NOT NULL,
    details          TEXT DEFAULT '',
    auteur           TEXT DEFAULT 'admin',
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ── Statut par document ───────────────────────────────────────────────────────
  db.run(`ALTER TABLE documents ADD COLUMN doc_statut TEXT DEFAULT 'recu'`, () => {});

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

// ── Rate limiting (login) ─────────────────────────────────────────────────────
const loginAttempts = new Map(); // ip → { count, resetAt }
function checkRateLimit(ip) {
  const now = Date.now();
  let entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) { entry = { count: 0, resetAt: now + 15 * 60 * 1000 }; loginAttempts.set(ip, entry); }
  entry.count++;
  return entry.count <= 10; // 10 tentatives / 15 min
}
function getRemainingAttempts(ip) {
  const entry = loginAttempts.get(ip);
  if (!entry || Date.now() > entry.resetAt) return 10;
  return Math.max(0, 10 - entry.count);
}
function resetLoginAttempts(ip) { loginAttempts.delete(ip); }

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
app.post('/api/admin/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
  }
  if (req.body.password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    resetLoginAttempts(ip);
    // Log de connexion
    db.run(`INSERT INTO activity_logs (beneficiaire_id, action, details, auteur) VALUES (NULL, 'connexion_admin', 'Connexion admin réussie', 'admin')`);
    res.json({ success: true });
  } else {
    const remaining = getRemainingAttempts(ip);
    res.status(401).json({ error: `Mot de passe incorrect. ${remaining} tentative(s) restante(s).` });
  }
});
app.post('/api/admin/logout',     (req, res) => { req.session.destroy(); res.json({ success:true }); });
app.get('/api/admin/check-auth',  (req, res) => res.json({ authenticated: !!req.session.isAdmin }));

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  db.get('SELECT COUNT(*) as total FROM beneficiaires WHERE archived=0', [], (err, total) => {
    db.all('SELECT statut, COUNT(*) as count FROM beneficiaires WHERE archived=0 GROUP BY statut', [], (err, byStatut) => {
      db.get('SELECT COUNT(*) as total FROM documents WHERE uploaded_by="beneficiaire"', [], (err, docs) => {
        db.get('SELECT COUNT(*) as total FROM beneficiaires WHERE archived=1', [], (err, arch) => {
          // Stats CEE opérations
          db.get(`SELECT
            COALESCE(SUM(volume_kwh), 0)    AS total_kwh,
            COALESCE(SUM(prime_estimee), 0) AS total_prime_estimee,
            COALESCE(SUM(prime_validee), 0) AS total_prime_validee,
            COUNT(*)                         AS total_operations
            FROM cee_operations`, [], (err, ops) => {
            // Alertes : dossiers en_cours depuis > 30 jours sans nouvelles docs
            db.get(`SELECT COUNT(*) as cnt FROM beneficiaires
              WHERE archived=0 AND statut IN ('en_cours','en_attente')
              AND julianday('now') - julianday(updated_at) > 30`, [], (err, alerts) => {
              res.json({
                total:             total?.total || 0,
                byStatut:          byStatut || [],
                totalDocuments:    docs?.total || 0,
                archived:          arch?.total || 0,
                totalKwh:          ops?.total_kwh || 0,
                totalPrimeEstimee: ops?.total_prime_estimee || 0,
                totalPrimeValidee: ops?.total_prime_validee || 0,
                totalOperations:   ops?.total_operations || 0,
                alertes:           alerts?.cnt || 0
              });
            });
          });
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

// ═══════════════════════════════════════════════════════════════════════════════
// ── OPÉRATIONS CEE ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// Liste de toutes les opérations (avec nom du bénéficiaire)
app.get('/api/admin/operations', requireAdmin, (req, res) => {
  const { beneficiaire_id, statut } = req.query;
  let where = '1=1';
  const params = [];
  if (beneficiaire_id) { where += ' AND o.beneficiaire_id = ?'; params.push(beneficiaire_id); }
  if (statut)          { where += ' AND o.statut = ?'; params.push(statut); }
  db.all(`
    SELECT o.*, b.nom, b.prenom, b.raison_sociale, b.code AS benef_code
    FROM cee_operations o
    LEFT JOIN beneficiaires b ON b.id = o.beneficiaire_id
    WHERE ${where}
    ORDER BY o.created_at DESC`, params,
    (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows)
  );
});

// Créer une opération
app.post('/api/admin/operations', requireAdmin, (req, res) => {
  const { beneficiaire_id, code_fiche, nom_operation, secteur, date_engagement, date_achevement, volume_kwh, prime_estimee, prime_validee, statut, notes } = req.body;
  if (!beneficiaire_id || !code_fiche || !nom_operation) return res.status(400).json({ error: 'Champs requis manquants' });
  db.run(
    `INSERT INTO cee_operations (beneficiaire_id, code_fiche, nom_operation, secteur, date_engagement, date_achevement, volume_kwh, prime_estimee, prime_validee, statut, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [beneficiaire_id, code_fiche.trim(), nom_operation.trim(), secteur||'', date_engagement||null, date_achevement||null, parseFloat(volume_kwh)||0, parseFloat(prime_estimee)||0, parseFloat(prime_validee)||0, statut||'en_cours', notes||''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      // Log d'activité
      db.run(`INSERT INTO activity_logs (beneficiaire_id, action, details, auteur) VALUES (?, 'operation_created', ?, 'admin')`,
        [beneficiaire_id, `Opération CEE créée : ${code_fiche} — ${nom_operation}`]);
      db.get('SELECT o.*, b.nom, b.prenom, b.raison_sociale, b.code AS benef_code FROM cee_operations o LEFT JOIN beneficiaires b ON b.id=o.beneficiaire_id WHERE o.id=?', [this.lastID], (err, row) => res.json(row));
    }
  );
});

// Modifier une opération
app.put('/api/admin/operations/:id', requireAdmin, (req, res) => {
  const { code_fiche, nom_operation, secteur, date_engagement, date_achevement, volume_kwh, prime_estimee, prime_validee, statut, notes } = req.body;
  db.run(
    `UPDATE cee_operations SET code_fiche=?, nom_operation=?, secteur=?, date_engagement=?, date_achevement=?, volume_kwh=?, prime_estimee=?, prime_validee=?, statut=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [code_fiche, nom_operation, secteur||'', date_engagement||null, date_achevement||null, parseFloat(volume_kwh)||0, parseFloat(prime_estimee)||0, parseFloat(prime_validee)||0, statut||'en_cours', notes||'', req.params.id],
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true })
  );
});

// Supprimer une opération
app.delete('/api/admin/operations/:id', requireAdmin, (req, res) => {
  db.run('DELETE FROM cee_operations WHERE id=?', [req.params.id],
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true })
  );
});

// ── Journal d'activité ────────────────────────────────────────────────────────
app.get('/api/admin/activity-logs', requireAdmin, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const beneficiaire_id = req.query.beneficiaire_id;
  let where = '1=1';
  const params = [];
  if (beneficiaire_id) { where += ' AND l.beneficiaire_id = ?'; params.push(beneficiaire_id); }
  params.push(limit);
  db.all(`
    SELECT l.*, b.nom, b.prenom, b.code AS benef_code
    FROM activity_logs l
    LEFT JOIN beneficiaires b ON b.id = l.beneficiaire_id
    WHERE ${where}
    ORDER BY l.created_at DESC LIMIT ?`, params,
    (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows)
  );
});

// ── Document statut update ────────────────────────────────────────────────────
app.put('/api/documents/:docId/statut', requireAdmin, (req, res) => {
  const valid = ['recu', 'valide', 'refuse', 'manquant'];
  if (!valid.includes(req.body.doc_statut)) return res.status(400).json({ error: 'Statut invalide' });
  db.run('UPDATE documents SET doc_statut=? WHERE id=?', [req.body.doc_statut, req.params.docId],
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true })
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── EXPORT LOT EMMY ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/admin/export-lot', requireAdmin, (req, res) => {
  db.all(`
    SELECT
      b.code, b.nom, b.prenom, b.raison_sociale, b.siret,
      b.adresse, b.code_postal, b.ville, b.activite,
      b.statut AS statut_dossier, b.created_at AS date_creation,
      o.code_fiche, o.nom_operation, o.secteur,
      o.date_engagement, o.date_achevement,
      o.volume_kwh, o.prime_estimee, o.prime_validee,
      o.statut AS statut_operation
    FROM beneficiaires b
    LEFT JOIN cee_operations o ON o.beneficiaire_id = b.id
    WHERE b.archived = 0
    ORDER BY b.code, o.code_fiche`, [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      // Entêtes CSV compatibles format lot EMMY
      const headers = [
        'CODE_DOSSIER','NOM','PRENOM','RAISON_SOCIALE','SIRET',
        'ADRESSE','CODE_POSTAL','VILLE','ACTIVITE','STATUT_DOSSIER',
        'DATE_CREATION','CODE_FICHE','NOM_OPERATION','SECTEUR',
        'DATE_ENGAGEMENT','DATE_ACHEVEMENT','VOLUME_KWHC',
        'PRIME_ESTIMEE_EUR','PRIME_VALIDEE_EUR','STATUT_OPERATION'
      ];

      const escCsv = v => {
        const s = String(v == null ? '' : v);
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g,'""')}"` : s;
      };

      const lines = [headers.join(',')];
      rows.forEach(r => {
        lines.push([
          r.code, r.nom, r.prenom, r.raison_sociale||'', r.siret||'',
          r.adresse||'', r.code_postal||'', r.ville||'', r.activite||'',
          r.statut_dossier||'', r.date_creation||'',
          r.code_fiche||'', r.nom_operation||'', r.secteur||'',
          r.date_engagement||'', r.date_achevement||'',
          r.volume_kwh||'', r.prime_estimee||'', r.prime_validee||'',
          r.statut_operation||''
        ].map(escCsv).join(','));
      });

      const csv = lines.join('\r\n');
      const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="lot_emmy_${date}.csv"`);
      res.send('﻿' + csv); // BOM UTF-8 pour Excel
    }
  );
});

// ── Tâches / Alertes ──────────────────────────────────────────────────────────
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS taches (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiaire_id  INTEGER,
    titre            TEXT NOT NULL,
    description      TEXT DEFAULT '',
    echeance         DATE,
    priorite         TEXT DEFAULT 'normale',
    statut           TEXT DEFAULT 'ouverte',
    auteur           TEXT DEFAULT 'admin',
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (beneficiaire_id) REFERENCES beneficiaires(id) ON DELETE CASCADE
  )`);
});

app.get('/api/admin/taches', requireAdmin, (req, res) => {
  const { statut, beneficiaire_id } = req.query;
  let where = '1=1';
  const params = [];
  if (statut) { where += ' AND t.statut=?'; params.push(statut); }
  if (beneficiaire_id) { where += ' AND t.beneficiaire_id=?'; params.push(beneficiaire_id); }
  db.all(`SELECT t.*, b.nom, b.prenom, b.code AS benef_code
    FROM taches t LEFT JOIN beneficiaires b ON b.id=t.beneficiaire_id
    WHERE ${where} ORDER BY CASE t.priorite WHEN 'urgente' THEN 1 WHEN 'haute' THEN 2 WHEN 'normale' THEN 3 ELSE 4 END, t.echeance ASC`, params,
    (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});

app.post('/api/admin/taches', requireAdmin, (req, res) => {
  const { beneficiaire_id, titre, description, echeance, priorite } = req.body;
  if (!titre?.trim()) return res.status(400).json({ error: 'Titre requis' });
  db.run(`INSERT INTO taches (beneficiaire_id,titre,description,echeance,priorite) VALUES (?,?,?,?,?)`,
    [beneficiaire_id||null, titre.trim(), description||'', echeance||null, priorite||'normale'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT t.*, b.nom, b.prenom, b.code AS benef_code FROM taches t LEFT JOIN beneficiaires b ON b.id=t.beneficiaire_id WHERE t.id=?', [this.lastID], (e,r) => res.json(r));
    });
});

app.put('/api/admin/taches/:id', requireAdmin, (req, res) => {
  const { titre, description, echeance, priorite, statut } = req.body;
  db.run(`UPDATE taches SET titre=?,description=?,echeance=?,priorite=?,statut=? WHERE id=?`,
    [titre, description||'', echeance||null, priorite||'normale', statut||'ouverte', req.params.id],
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

app.delete('/api/admin/taches/:id', requireAdmin, (req, res) => {
  db.run('DELETE FROM taches WHERE id=?', [req.params.id],
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// ── Moteur de calcul CEE ─────────────────────────────────────────────────────
const calcEngine = require('./calc/engine');

// ── Bibliothèque fiches CEE ────────────────────────────────────────────────────
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS cee_fiches (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    code              TEXT UNIQUE NOT NULL,
    nom               TEXT NOT NULL,
    secteur           TEXT NOT NULL,
    sous_secteur      TEXT DEFAULT '',
    version           TEXT DEFAULT '',
    type_travaux      TEXT DEFAULT '',
    description       TEXT DEFAULT '',
    conditions_eligibilite TEXT DEFAULT '',
    formule_kwh       TEXT DEFAULT '',
    formule_json      TEXT DEFAULT '{}',
    type_calcul       TEXT DEFAULT 'assistee',
    simulation_mode   TEXT DEFAULT 'assistee',
    statut            TEXT DEFAULT 'valide',
    date_effet        TEXT DEFAULT '',
    date_abrogation   TEXT DEFAULT '',
    source_url        TEXT DEFAULT '',
    lien_pdf          TEXT DEFAULT '',
    points_controle   TEXT DEFAULT '[]',
    etapes            TEXT DEFAULT '[]',
    unite_facteur     TEXT DEFAULT '',
    valeur_min        REAL,
    valeur_max        REAL,
    duree_vie         INTEGER DEFAULT 0,
    periode_validite  TEXT DEFAULT '',
    documents_requis  TEXT DEFAULT '[]',
    zni_eligible      INTEGER DEFAULT 0,
    zni_multiplier    REAL DEFAULT 1.0,
    precarite_eligible INTEGER DEFAULT 0,
    precarite_bonus   REAL DEFAULT 1.0,
    actif             INTEGER DEFAULT 1,
    notes             TEXT DEFAULT '',
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Migrations silencieuses pour nouvelles colonnes
  const newCols = [
    `ALTER TABLE cee_fiches ADD COLUMN formule_json TEXT DEFAULT '{}'`,
    `ALTER TABLE cee_fiches ADD COLUMN type_calcul TEXT DEFAULT 'assistee'`,
    `ALTER TABLE cee_fiches ADD COLUMN simulation_mode TEXT DEFAULT 'assistee'`,
    `ALTER TABLE cee_fiches ADD COLUMN statut TEXT DEFAULT 'valide'`,
    `ALTER TABLE cee_fiches ADD COLUMN date_effet TEXT DEFAULT ''`,
    `ALTER TABLE cee_fiches ADD COLUMN date_abrogation TEXT DEFAULT ''`,
    `ALTER TABLE cee_fiches ADD COLUMN source_url TEXT DEFAULT ''`,
    `ALTER TABLE cee_fiches ADD COLUMN lien_pdf TEXT DEFAULT ''`,
    `ALTER TABLE cee_fiches ADD COLUMN points_controle TEXT DEFAULT '[]'`,
    `ALTER TABLE cee_fiches ADD COLUMN etapes TEXT DEFAULT '[]'`
  ];
  newCols.forEach(sql => db.run(sql, () => {}));

  // Seed avec les fiches les plus courantes si la table est vide
  db.get('SELECT COUNT(*) AS cnt FROM cee_fiches', (err, row) => {
    if (err || row.cnt > 0) return;
    const FICHES = [
      // ── BAR — Bâtiment Résidentiel ────────────────────────────────────────────
      { code:'BAR-TH-101', nom:'Chaudière individuelle haute performance', secteur:'BAR', sous_secteur:'Thermique', type_travaux:'Équipement',
        description:'Installation d\'une chaudière individuelle à condensation ou à très haute performance énergétique en remplacement d\'une chaudière existante.',
        conditions_eligibilite:'Logement existant de plus de 2 ans. Remplacement d\'une chaudière existante. Puissance nominale ≤ 70 kW.',
        formule_kwh:'B × 1700', unite_facteur:'kWhc/logement', valeur_min:1700, valeur_max:1700, duree_vie:17,
        documents_requis:JSON.stringify(['Facture travaux','CERFA','AH avant travaux','Note de dimensionnement']),
        zni_eligible:1, zni_multiplier:4.0, precarite_eligible:1, precarite_bonus:2.0 },
      { code:'BAR-TH-104', nom:'Pompe à chaleur individuelle air/eau', secteur:'BAR', sous_secteur:'Thermique', type_travaux:'Équipement',
        description:'Installation d\'une pompe à chaleur de type air/eau pour le chauffage d\'un logement individuel.',
        conditions_eligibilite:'COP ≥ 3.4. Logement de plus de 2 ans. Puissance nominale ≤ 70 kW.',
        formule_kwh:'B × 2400', unite_facteur:'kWhc/logement', valeur_min:2400, valeur_max:2400, duree_vie:17,
        documents_requis:JSON.stringify(['Facture travaux','CERFA','Caractéristiques techniques PAC','Note de dimensionnement']),
        zni_eligible:0, zni_multiplier:1.0, precarite_eligible:1, precarite_bonus:2.0 },
      { code:'BAR-TH-106', nom:'Chaudière individuelle à micro-cogénération gaz', secteur:'BAR', sous_secteur:'Thermique', type_travaux:'Équipement',
        description:'Installation d\'une chaudière individuelle à micro-cogénération au gaz naturel.',
        conditions_eligibilite:'Puissance électrique ≤ 3 kWe. Logement individuel existant.',
        formule_kwh:'B × 8200', unite_facteur:'kWhc/logement', valeur_min:8200, valeur_max:8200, duree_vie:17,
        documents_requis:JSON.stringify(['Facture travaux','CERFA','Caractéristiques techniques']),
        zni_eligible:0, zni_multiplier:1.0, precarite_eligible:0, precarite_bonus:1.0 },
      { code:'BAR-TH-107', nom:'Chaudière collective haute performance', secteur:'BAR', sous_secteur:'Thermique', type_travaux:'Équipement',
        description:'Installation d\'une chaudière collective à condensation ou à très haute performance énergétique.',
        conditions_eligibilite:'Bâtiment collectif existant de plus de 2 ans. Remplacement d\'une chaudière collective.',
        formule_kwh:'Nlog × 1700', unite_facteur:'kWhc/logement', valeur_min:1700, valeur_max:1700, duree_vie:17,
        documents_requis:JSON.stringify(['Facture travaux','CERFA','AH avant travaux','Note dimensionnement']),
        zni_eligible:1, zni_multiplier:4.0, precarite_eligible:1, precarite_bonus:2.0 },
      { code:'BAR-TH-110', nom:'Chauffe-eau solaire individuel (CESI)', secteur:'BAR', sous_secteur:'Renouvelable', type_travaux:'Équipement',
        description:'Installation d\'un chauffe-eau solaire individuel avec capteurs solaires thermiques.',
        conditions_eligibilite:'Surface de capteurs ≥ 1 m². CESi certifié NF-Solar. Logement individuel.',
        formule_kwh:'B × Sc × 800', unite_facteur:'kWhc/m² de capteurs', valeur_min:800, valeur_max:800, duree_vie:20,
        documents_requis:JSON.stringify(['Facture travaux','Certification NF-Solar','CERFA']),
        zni_eligible:1, zni_multiplier:1.6, precarite_eligible:1, precarite_bonus:2.0 },
      { code:'BAR-TH-112', nom:'Appareil indépendant de chauffage au bois', secteur:'BAR', sous_secteur:'Biomasse', type_travaux:'Équipement',
        description:'Installation d\'un insert ou poêle à bois labellisé Flamme Verte 7 étoiles ou équivalent.',
        conditions_eligibilite:'Label Flamme Verte 7 étoiles ou Ω ≥ 0.75. Rendement ≥ 75%. Logement existant.',
        formule_kwh:'B × 2500', unite_facteur:'kWhc/logement', valeur_min:2500, valeur_max:2500, duree_vie:15,
        documents_requis:JSON.stringify(['Facture travaux','Label Flamme Verte','CERFA']),
        zni_eligible:0, zni_multiplier:1.0, precarite_eligible:1, precarite_bonus:2.0 },
      { code:'BAR-TH-113', nom:'Chaudière biomasse individuelle', secteur:'BAR', sous_secteur:'Biomasse', type_travaux:'Équipement',
        description:'Installation d\'une chaudière à biomasse pour le chauffage central d\'un logement individuel.',
        conditions_eligibilite:'Label Flamme Verte 7 étoiles ou équivalent. Rendement ≥ 77%. Logement existant.',
        formule_kwh:'B × 12800', unite_facteur:'kWhc/logement', valeur_min:12800, valeur_max:12800, duree_vie:17,
        documents_requis:JSON.stringify(['Facture travaux','Label Flamme Verte','CERFA','Note dimensionnement']),
        zni_eligible:0, zni_multiplier:1.0, precarite_eligible:1, precarite_bonus:2.0 },
      { code:'BAR-TH-127', nom:'Ventilation mécanique simple flux', secteur:'BAR', sous_secteur:'Ventilation', type_travaux:'Équipement',
        description:'Mise en place d\'une ventilation mécanique contrôlée simple flux hygroréglable.',
        conditions_eligibilite:'Bâtiment résidentiel existant de plus de 2 ans. VMC SF à autoréglage ou hygroréglable type A ou B.',
        formule_kwh:'B × 640', unite_facteur:'kWhc/logement', valeur_min:640, valeur_max:640, duree_vie:15,
        documents_requis:JSON.stringify(['Facture travaux','Caractéristiques VMC','CERFA']),
        zni_eligible:0, zni_multiplier:1.0, precarite_eligible:1, precarite_bonus:2.0 },
      { code:'BAR-EN-101', nom:'Isolation des combles ou toiture', secteur:'BAR', sous_secteur:'Isolation', type_travaux:'Travaux d\'isolation',
        description:'Isolation thermique des combles perdus ou de la toiture d\'un bâtiment résidentiel.',
        conditions_eligibilite:'Résistance thermique R ≥ 7 m².K/W. Bâtiment de plus de 2 ans.',
        formule_kwh:'Sh × R × E', unite_facteur:'kWhc/m²', valeur_min:100, valeur_max:500, duree_vie:30,
        documents_requis:JSON.stringify(['Facture travaux','Caractéristiques isolant','CERFA']),
        zni_eligible:1, zni_multiplier:2.0, precarite_eligible:1, precarite_bonus:2.0 },
      { code:'BAR-EN-102', nom:'Isolation des murs par l\'extérieur ou par l\'intérieur', secteur:'BAR', sous_secteur:'Isolation', type_travaux:'Travaux d\'isolation',
        description:'Isolation thermique des parois verticales (murs) d\'un bâtiment résidentiel.',
        conditions_eligibilite:'Résistance thermique R ≥ 3.7 m².K/W. Logement existant de plus de 2 ans.',
        formule_kwh:'Sh × R × E', unite_facteur:'kWhc/m²', valeur_min:80, valeur_max:400, duree_vie:30,
        documents_requis:JSON.stringify(['Facture travaux','Caractéristiques isolant','CERFA']),
        zni_eligible:1, zni_multiplier:2.0, precarite_eligible:1, precarite_bonus:2.0 },
      { code:'BAR-EN-103', nom:'Isolation d\'un plancher bas', secteur:'BAR', sous_secteur:'Isolation', type_travaux:'Travaux d\'isolation',
        description:'Isolation thermique du plancher bas d\'un bâtiment résidentiel.',
        conditions_eligibilite:'Résistance thermique R ≥ 3 m².K/W. Logement existant.',
        formule_kwh:'Sh × R × E', unite_facteur:'kWhc/m²', valeur_min:60, valeur_max:350, duree_vie:30,
        documents_requis:JSON.stringify(['Facture travaux','Caractéristiques isolant','CERFA']),
        zni_eligible:0, zni_multiplier:1.0, precarite_eligible:1, precarite_bonus:2.0 },
      { code:'BAR-EN-104', nom:'Fenêtres ou portes-fenêtres à double vitrage', secteur:'BAR', sous_secteur:'Isolation', type_travaux:'Remplacement menuiseries',
        description:'Remplacement de fenêtres ou portes-fenêtres par des équipements avec double ou triple vitrage.',
        conditions_eligibilite:'Uw ≤ 1.3 W/m².K et Sw ≥ 0.3. Ou Uw ≤ 1.7 et Sw ≥ 0.36. Logement existant.',
        formule_kwh:'N × E', unite_facteur:'kWhc/fenêtre', valeur_min:700, valeur_max:2000, duree_vie:24,
        documents_requis:JSON.stringify(['Facture travaux','Caractéristiques produit','CERFA']),
        zni_eligible:0, zni_multiplier:1.0, precarite_eligible:1, precarite_bonus:2.0 },
      // ── BAT — Bâtiment Tertiaire ──────────────────────────────────────────────
      { code:'BAT-TH-102', nom:'Chaudière collective haute performance — tertiaire', secteur:'BAT', sous_secteur:'Thermique', type_travaux:'Équipement',
        description:'Remplacement d\'une chaudière collective dans un bâtiment tertiaire par une chaudière à condensation.',
        conditions_eligibilite:'Rendement PCI à pleine charge ≥ 105 %. Bâtiment tertiaire existant.',
        formule_kwh:'P × DJU × Cf', unite_facteur:'kWhc/kW', valeur_min:1000, valeur_max:5000, duree_vie:17,
        documents_requis:JSON.stringify(['Facture travaux','Caractéristiques chaudière','Note dimensionnement','CERFA']),
        zni_eligible:1, zni_multiplier:2.5, precarite_eligible:0, precarite_bonus:1.0 },
      { code:'BAT-TH-113', nom:'Pompe à chaleur de type air/eau ou eau/eau — tertiaire', secteur:'BAT', sous_secteur:'Thermique', type_travaux:'Équipement',
        description:'Installation d\'une PAC pour le chauffage ou la production d\'eau chaude sanitaire d\'un bâtiment tertiaire.',
        conditions_eligibilite:'COP ≥ 3.4 (air/eau) ou COP ≥ 4.2 (eau/eau). Bâtiment tertiaire existant.',
        formule_kwh:'P × DJU × Cf', unite_facteur:'kWhc/kW', valeur_min:1500, valeur_max:8000, duree_vie:17,
        documents_requis:JSON.stringify(['Facture travaux','Caractéristiques PAC','Note dimensionnement','CERFA']),
        zni_eligible:0, zni_multiplier:1.0, precarite_eligible:0, precarite_bonus:1.0 },
      { code:'BAT-EN-101', nom:'Isolation de la toiture d\'un bâtiment tertiaire', secteur:'BAT', sous_secteur:'Isolation', type_travaux:'Travaux d\'isolation',
        description:'Isolation thermique de la toiture ou des combles d\'un bâtiment tertiaire.',
        conditions_eligibilite:'R ≥ 6 m².K/W (toiture terrasse) ou R ≥ 7 m².K/W (rampants). Surface ≥ 50 m².',
        formule_kwh:'Sh × R × E', unite_facteur:'kWhc/m²', valeur_min:200, valeur_max:1000, duree_vie:30,
        documents_requis:JSON.stringify(['Facture travaux','Caractéristiques isolant','Plan des surfaces','CERFA']),
        zni_eligible:1, zni_multiplier:2.0, precarite_eligible:0, precarite_bonus:1.0 },
      { code:'BAT-EN-102', nom:'Isolation des murs d\'un bâtiment tertiaire', secteur:'BAT', sous_secteur:'Isolation', type_travaux:'Travaux d\'isolation',
        description:'Isolation thermique des parois opaques verticales (murs) d\'un bâtiment tertiaire.',
        conditions_eligibilite:'R ≥ 3.7 m².K/W. Surface ≥ 20 m². Bâtiment tertiaire existant.',
        formule_kwh:'Sh × R × E', unite_facteur:'kWhc/m²', valeur_min:150, valeur_max:800, duree_vie:30,
        documents_requis:JSON.stringify(['Facture travaux','Caractéristiques isolant','Plan','CERFA']),
        zni_eligible:1, zni_multiplier:2.0, precarite_eligible:0, precarite_bonus:1.0 },
      { code:'BAT-EQ-127', nom:'Motorisation de fermetures', secteur:'BAT', sous_secteur:'Équipements', type_travaux:'Équipement',
        description:'Motorisation de stores ou volets dans un bâtiment tertiaire pour optimiser les apports solaires.',
        conditions_eligibilite:'Bâtiment tertiaire existant de plus de 2 ans. Surface de baies vitrées motorisées ≥ 10 m².',
        formule_kwh:'Sb × E', unite_facteur:'kWhc/m² de baies', valeur_min:100, valeur_max:600, duree_vie:15,
        documents_requis:JSON.stringify(['Facture travaux','CERFA']),
        zni_eligible:0, zni_multiplier:1.0, precarite_eligible:0, precarite_bonus:1.0 },
      // ── IND — Industrie ───────────────────────────────────────────────────────
      { code:'IND-UT-116', nom:'Système de récupération de chaleur sur air comprimé', secteur:'IND', sous_secteur:'Air comprimé', type_travaux:'Équipement',
        description:'Installation d\'un système de récupération de chaleur sur un compresseur d\'air industriel.',
        conditions_eligibilite:'Compresseur de puissance ≥ 22 kW. Récupération ≥ 70 % de la chaleur compresseur.',
        formule_kwh:'Qrécup × 8760 × taux', unite_facteur:'kWhc/kW compresseur', valeur_min:5000, valeur_max:50000, duree_vie:12,
        documents_requis:JSON.stringify(['Facture travaux','Schéma installation','Bilan thermique','CERFA']),
        zni_eligible:0, zni_multiplier:1.0, precarite_eligible:0, precarite_bonus:1.0 },
      { code:'IND-UT-117', nom:'Système de management de l\'énergie', secteur:'IND', sous_secteur:'Management', type_travaux:'Service',
        description:'Mise en place et certification d\'un système de management de l\'énergie selon ISO 50001.',
        conditions_eligibilite:'Certification ISO 50001 obtenue. Établissement industriel de plus de 2 ans.',
        formule_kwh:'Conso × 3%', unite_facteur:'% des consommations', valeur_min:10000, valeur_max:500000, duree_vie:5,
        documents_requis:JSON.stringify(['Certificat ISO 50001','Rapport audit','Bilan conso','CERFA']),
        zni_eligible:0, zni_multiplier:1.0, precarite_eligible:0, precarite_bonus:1.0 },
      { code:'IND-EN-101', nom:'Isolation des parois d\'un bâtiment industriel', secteur:'IND', sous_secteur:'Isolation', type_travaux:'Travaux d\'isolation',
        description:'Isolation thermique des parois opaques d\'un bâtiment industriel (murs, toiture).',
        conditions_eligibilite:'R ≥ 3.7 m².K/W (murs) ou R ≥ 6 m².K/W (toiture). Bâtiment industriel existant.',
        formule_kwh:'Sh × R × E', unite_facteur:'kWhc/m²', valeur_min:100, valeur_max:2000, duree_vie:30,
        documents_requis:JSON.stringify(['Facture travaux','Caractéristiques isolant','Plan','CERFA']),
        zni_eligible:1, zni_multiplier:1.5, precarite_eligible:0, precarite_bonus:1.0 },
      // ── TRA — Transport ───────────────────────────────────────────────────────
      { code:'TRA-EQ-101', nom:'Covoiturage de longue distance', secteur:'TRA', sous_secteur:'Covoiturage', type_travaux:'Service',
        description:'Mise en place d\'une plateforme de covoiturage pour les trajets domicile-travail longue distance.',
        conditions_eligibilite:'Distance ≥ 80 km. Minimum 10 covoitureurs par mois. Attestations requises.',
        formule_kwh:'N_trajets × D × Ef', unite_facteur:'kWhc/trajet', valeur_min:100, valeur_max:10000, duree_vie:3,
        documents_requis:JSON.stringify(['Convention covoiturage','Attestations','Relevés kilométriques','CERFA']),
        zni_eligible:0, zni_multiplier:1.0, precarite_eligible:0, precarite_bonus:1.0 },
      // ── AGRI — Agriculture ────────────────────────────────────────────────────
      { code:'AGRI-EQ-101', nom:'Pompe à chaleur pour bâtiment agricole', secteur:'AGRI', sous_secteur:'Thermique', type_travaux:'Équipement',
        description:'Installation d\'une pompe à chaleur pour le chauffage d\'un bâtiment agricole (serre, étable, etc.).',
        conditions_eligibilite:'COP ≥ 3.4. Bâtiment agricole existant de plus de 2 ans.',
        formule_kwh:'P × DJU × Cf', unite_facteur:'kWhc/kW', valeur_min:1000, valeur_max:10000, duree_vie:17,
        documents_requis:JSON.stringify(['Facture travaux','Caractéristiques PAC','Note dimensionnement','CERFA']),
        zni_eligible:1, zni_multiplier:2.0, precarite_eligible:0, precarite_bonus:1.0 },
      // ── RES — Réseaux ─────────────────────────────────────────────────────────
      { code:'RES-CH-102', nom:'Réseau de chaleur alimenté majoritairement par des ENR', secteur:'RES', sous_secteur:'Réseau chaleur', type_travaux:'Infrastructure',
        description:'Création ou extension d\'un réseau de chaleur alimenté à plus de 50 % par des énergies renouvelables.',
        conditions_eligibilite:'Part ENR > 50 %. Réseau nouveau ou extension significative.',
        formule_kwh:'Q_ENR × Cf', unite_facteur:'kWhc/MWh d\'ENR', valeur_min:50000, valeur_max:5000000, duree_vie:30,
        documents_requis:JSON.stringify(['Étude faisabilité','Bilan ENR','Contrat réseau','CERFA']),
        zni_eligible:1, zni_multiplier:1.5, precarite_eligible:0, precarite_bonus:1.0 }
    ];
    const stmt = db.prepare('INSERT OR IGNORE INTO cee_fiches (code,nom,secteur,sous_secteur,type_travaux,description,conditions_eligibilite,formule_kwh,unite_facteur,valeur_min,valeur_max,duree_vie,documents_requis,zni_eligible,zni_multiplier,precarite_eligible,precarite_bonus) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    FICHES.forEach(f => {
      stmt.run(f.code,f.nom,f.secteur,f.sous_secteur,f.type_travaux,f.description,f.conditions_eligibilite,f.formule_kwh,f.unite_facteur,f.valeur_min,f.valeur_max,f.duree_vie,f.documents_requis,f.zni_eligible,f.zni_multiplier,f.precarite_eligible,f.precarite_bonus);
    });
    stmt.finalize();
    console.log(`✅ ${FICHES.length} fiches CEE préchargées`);
  });
});

// ── Tables annexes (veille, devis, factures) ──────────────────────────────────
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS veille_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    run_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut      TEXT DEFAULT 'ok',
    fiches_verifiees INTEGER DEFAULT 0,
    changements TEXT DEFAULT '[]',
    erreur      TEXT DEFAULT '',
    declenche_par TEXT DEFAULT 'auto'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS devis (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    numero          TEXT UNIQUE NOT NULL,
    type            TEXT DEFAULT 'devis',
    statut          TEXT DEFAULT 'brouillon',
    beneficiaire_id INTEGER,
    client_nom      TEXT DEFAULT '',
    client_prenom   TEXT DEFAULT '',
    client_email    TEXT DEFAULT '',
    client_tel      TEXT DEFAULT '',
    client_societe  TEXT DEFAULT '',
    client_siret    TEXT DEFAULT '',
    client_adresse  TEXT DEFAULT '',
    client_cp       TEXT DEFAULT '',
    client_ville    TEXT DEFAULT '',
    code_fiche      TEXT DEFAULT '',
    nom_operation   TEXT DEFAULT '',
    secteur         TEXT DEFAULT '',
    volume_kwh      REAL DEFAULT 0,
    prix_eur_mwh    REAL DEFAULT 4.0,
    montant_ht      REAL DEFAULT 0,
    tva_pct         REAL DEFAULT 20.0,
    montant_ttc     REAL DEFAULT 0,
    validite_jours  INTEGER DEFAULT 30,
    conditions      TEXT DEFAULT '',
    mentions_legales TEXT DEFAULT '',
    partenaire_json TEXT DEFAULT '{}',
    date_devis      DATE DEFAULT CURRENT_DATE,
    date_echeance   DATE,
    notes           TEXT DEFAULT '',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS partenaires (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nom           TEXT NOT NULL,
    siret         TEXT DEFAULT '',
    adresse       TEXT DEFAULT '',
    code_postal   TEXT DEFAULT '',
    ville         TEXT DEFAULT '',
    email         TEXT DEFAULT '',
    telephone     TEXT DEFAULT '',
    site_web      TEXT DEFAULT '',
    logo_url      TEXT DEFAULT '',
    texte_custom  TEXT DEFAULT '',
    role_defaut   TEXT DEFAULT '',
    actif         INTEGER DEFAULT 1,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Numérotation auto devis/factures
function generateNumero(type) {
  const prefix = type === 'facture' ? 'FAC' : 'DEV';
  const yr = new Date().getFullYear();
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) AS cnt FROM devis WHERE type=? AND strftime('%Y',created_at)=?`,
      [type, String(yr)], (err, row) => {
        if (err) reject(err);
        else resolve(`${prefix}-${yr}-${String((row?.cnt||0)+1).padStart(4,'0')}`);
      });
  });
}

// ── Routes Fiches CEE ─────────────────────────────────────────────────────────
// GET — liste avec filtres
app.get('/api/fiches', (req, res) => {
  const { secteur, search, actif, zni, mode } = req.query;
  let where = '1=1';
  const params = [];
  if (actif !== undefined) { where += ' AND actif=?'; params.push(parseInt(actif)); }
  else { where += ' AND actif=1'; }
  if (secteur) { where += ' AND secteur=?'; params.push(secteur); }
  if (zni === '1') { where += ' AND zni_eligible=1'; }
  if (mode) { where += ' AND simulation_mode=?'; params.push(mode); }
  if (search) {
    where += ' AND (code LIKE ? OR nom LIKE ? OR description LIKE ? OR type_travaux LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  db.all(`SELECT * FROM cee_fiches WHERE ${where} ORDER BY secteur, code`, params,
    (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});

// GET — fiche individuelle
app.get('/api/fiches/:code', (req, res) => {
  db.get('SELECT * FROM cee_fiches WHERE code=? AND actif=1', [req.params.code.toUpperCase()],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Fiche non trouvée' });
      res.json(row);
    });
});

// POST — simuler prime pour une fiche (V2 — moteur calcul)
app.post('/api/fiches/:code/simuler', (req, res) => {
  const { inputs = {}, is_zni, is_precarite, prix_eur_mwh } = req.body;
  // Compat legacy : si facteur envoyé directement
  if (req.body.facteur !== undefined && !inputs.facteur) inputs.facteur = req.body.facteur;

  db.get('SELECT * FROM cee_fiches WHERE code=? AND actif=1', [req.params.code.toUpperCase()], (err, fiche) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!fiche) return res.status(404).json({ error: 'Fiche non trouvée' });
    try {
      const result = calcEngine.simulate(fiche, inputs, {
        is_zni: !!is_zni, is_precarite: !!is_precarite,
        prix_eur_mwh: parseFloat(prix_eur_mwh) || calcEngine.PRIX_DEFAULT_EUR_MWH
      });
      res.json(result);
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
  });
});

// POST — créer fiche (admin)
app.post('/api/admin/fiches', requireAdmin, (req, res) => {
  const f = req.body;
  if (!f.code || !f.nom || !f.secteur) return res.status(400).json({ error: 'Code, nom et secteur requis' });
  db.run(`INSERT INTO cee_fiches
    (code,nom,secteur,sous_secteur,type_travaux,description,conditions_eligibilite,
     formule_kwh,formule_json,type_calcul,simulation_mode,statut,date_effet,source_url,lien_pdf,
     unite_facteur,valeur_min,valeur_max,duree_vie,documents_requis,points_controle,
     zni_eligible,zni_multiplier,precarite_eligible,precarite_bonus,notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [f.code.toUpperCase(),f.nom,f.secteur,f.sous_secteur||'',f.type_travaux||'',
     f.description||'',f.conditions_eligibilite||'',f.formule_kwh||'',
     JSON.stringify(f.formule_json||{}),f.type_calcul||'assistee',f.simulation_mode||'assistee',
     f.statut||'valide',f.date_effet||'',f.source_url||'',f.lien_pdf||'',
     f.unite_facteur||'',f.valeur_min||null,f.valeur_max||null,f.duree_vie||0,
     JSON.stringify(f.documents_requis||[]),JSON.stringify(f.points_controle||[]),
     f.zni_eligible?1:0,f.zni_multiplier||1.0,f.precarite_eligible?1:0,f.precarite_bonus||1.0,f.notes||''],
    function(err) {
      if (err) return res.status(err.message.includes('UNIQUE')?409:500).json({ error: err.message });
      db.get('SELECT * FROM cee_fiches WHERE id=?',[this.lastID],(e,r)=>res.json(r));
    });
});

// PUT — modifier fiche (admin)
app.put('/api/admin/fiches/:code', requireAdmin, (req, res) => {
  const f = req.body;
  db.run(`UPDATE cee_fiches SET
    nom=?,secteur=?,sous_secteur=?,type_travaux=?,description=?,conditions_eligibilite=?,
    formule_kwh=?,formule_json=?,type_calcul=?,simulation_mode=?,statut=?,date_effet=?,
    source_url=?,lien_pdf=?,unite_facteur=?,valeur_min=?,valeur_max=?,duree_vie=?,
    documents_requis=?,points_controle=?,zni_eligible=?,zni_multiplier=?,
    precarite_eligible=?,precarite_bonus=?,actif=?,notes=?,updated_at=CURRENT_TIMESTAMP
    WHERE code=?`,
    [f.nom,f.secteur,f.sous_secteur||'',f.type_travaux||'',f.description||'',f.conditions_eligibilite||'',
     f.formule_kwh||'',JSON.stringify(f.formule_json||{}),f.type_calcul||'assistee',f.simulation_mode||'assistee',
     f.statut||'valide',f.date_effet||'',f.source_url||'',f.lien_pdf||'',
     f.unite_facteur||'',f.valeur_min||null,f.valeur_max||null,f.duree_vie||0,
     JSON.stringify(f.documents_requis||[]),JSON.stringify(f.points_controle||[]),
     f.zni_eligible?1:0,f.zni_multiplier||1.0,f.precarite_eligible?1:0,f.precarite_bonus||1.0,
     f.actif!==undefined?f.actif:1,f.notes||'',req.params.code.toUpperCase()],
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// DELETE — désactiver fiche (soft delete)
app.delete('/api/admin/fiches/:code', requireAdmin, (req, res) => {
  db.run('UPDATE cee_fiches SET actif=0,updated_at=CURRENT_TIMESTAMP WHERE code=?',
    [req.params.code.toUpperCase()],
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── DEVIS / FACTURES ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// GET — liste
app.get('/api/admin/devis', requireAdmin, (req, res) => {
  const { type, statut } = req.query;
  let where = '1=1';
  const params = [];
  if (type) { where += ' AND type=?'; params.push(type); }
  if (statut) { where += ' AND statut=?'; params.push(statut); }
  db.all(`SELECT d.*, b.nom AS benef_nom, b.prenom AS benef_prenom
    FROM devis d LEFT JOIN beneficiaires b ON b.id=d.beneficiaire_id
    WHERE ${where} ORDER BY d.created_at DESC`, params,
    (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});

// GET — un seul devis
app.get('/api/admin/devis/:id', requireAdmin, (req, res) => {
  db.get('SELECT * FROM devis WHERE id=?', [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Document non trouvé' });
      res.json(row);
    });
});

// POST — créer devis/facture
app.post('/api/admin/devis', requireAdmin, async (req, res) => {
  const d = req.body;
  const type = d.type || 'devis';
  try {
    const numero = await generateNumero(type);
    const montant_ht = parseFloat(d.montant_ht) || 0;
    const tva = parseFloat(d.tva_pct) || 20;
    const montant_ttc = parseFloat((montant_ht * (1 + tva/100)).toFixed(2));
    db.run(`INSERT INTO devis
      (numero,type,statut,beneficiaire_id,client_nom,client_prenom,client_email,client_tel,
       client_societe,client_siret,client_adresse,client_cp,client_ville,
       code_fiche,nom_operation,secteur,volume_kwh,prix_eur_mwh,montant_ht,tva_pct,montant_ttc,
       validite_jours,conditions,mentions_legales,partenaire_json,date_devis,date_echeance,notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [numero,type,d.statut||'brouillon',d.beneficiaire_id||null,
       d.client_nom||'',d.client_prenom||'',d.client_email||'',d.client_tel||'',
       d.client_societe||'',d.client_siret||'',d.client_adresse||'',d.client_cp||'',d.client_ville||'',
       d.code_fiche||'',d.nom_operation||'',d.secteur||'',
       parseFloat(d.volume_kwh)||0,parseFloat(d.prix_eur_mwh)||4.0,
       montant_ht,tva,montant_ttc,
       parseInt(d.validite_jours)||30,d.conditions||'',d.mentions_legales||'',
       JSON.stringify(d.partenaire||{}),d.date_devis||new Date().toISOString().slice(0,10),
       d.date_echeance||null,d.notes||''],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT * FROM devis WHERE id=?',[this.lastID],(e,r)=>res.json(r));
      });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT — modifier devis/facture
app.put('/api/admin/devis/:id', requireAdmin, (req, res) => {
  const d = req.body;
  const montant_ht = parseFloat(d.montant_ht) || 0;
  const tva = parseFloat(d.tva_pct) || 20;
  const montant_ttc = parseFloat((montant_ht * (1 + tva/100)).toFixed(2));
  db.run(`UPDATE devis SET
    statut=?,client_nom=?,client_prenom=?,client_email=?,client_tel=?,
    client_societe=?,client_siret=?,client_adresse=?,client_cp=?,client_ville=?,
    code_fiche=?,nom_operation=?,secteur=?,volume_kwh=?,prix_eur_mwh=?,
    montant_ht=?,tva_pct=?,montant_ttc=?,validite_jours=?,conditions=?,
    mentions_legales=?,partenaire_json=?,date_devis=?,date_echeance=?,notes=?,
    updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [d.statut||'brouillon',d.client_nom||'',d.client_prenom||'',d.client_email||'',d.client_tel||'',
     d.client_societe||'',d.client_siret||'',d.client_adresse||'',d.client_cp||'',d.client_ville||'',
     d.code_fiche||'',d.nom_operation||'',d.secteur||'',
     parseFloat(d.volume_kwh)||0,parseFloat(d.prix_eur_mwh)||4.0,
     montant_ht,tva,montant_ttc,parseInt(d.validite_jours)||30,d.conditions||'',d.mentions_legales||'',
     JSON.stringify(d.partenaire||{}),d.date_devis||new Date().toISOString().slice(0,10),
     d.date_echeance||null,d.notes||'',req.params.id],
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// DELETE — supprimer devis
app.delete('/api/admin/devis/:id', requireAdmin, (req, res) => {
  db.run('DELETE FROM devis WHERE id=?', [req.params.id],
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// ── Partenaires ────────────────────────────────────────────────────────────────
app.get('/api/admin/partenaires', requireAdmin, (req, res) => {
  db.all('SELECT * FROM partenaires WHERE actif=1 ORDER BY nom', [],
    (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});
app.post('/api/admin/partenaires', requireAdmin, (req, res) => {
  const p = req.body;
  if (!p.nom) return res.status(400).json({ error: 'Nom requis' });
  db.run(`INSERT INTO partenaires (nom,siret,adresse,code_postal,ville,email,telephone,site_web,logo_url,texte_custom,role_defaut)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [p.nom,p.siret||'',p.adresse||'',p.code_postal||'',p.ville||'',p.email||'',
     p.telephone||'',p.site_web||'',p.logo_url||'',p.texte_custom||'',p.role_defaut||''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM partenaires WHERE id=?',[this.lastID],(e,r)=>res.json(r));
    });
});
app.put('/api/admin/partenaires/:id', requireAdmin, (req, res) => {
  const p = req.body;
  db.run(`UPDATE partenaires SET nom=?,siret=?,adresse=?,code_postal=?,ville=?,email=?,telephone=?,
    site_web=?,logo_url=?,texte_custom=?,role_defaut=?,actif=? WHERE id=?`,
    [p.nom,p.siret||'',p.adresse||'',p.code_postal||'',p.ville||'',p.email||'',
     p.telephone||'',p.site_web||'',p.logo_url||'',p.texte_custom||'',p.role_defaut||'',
     p.actif!==undefined?p.actif:1,req.params.id],
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── VEILLE JOURNALIÈRE ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const https = require('https');

function runVeille(declenchePar = 'auto') {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const ATEE_URL = 'https://www.ecologie.gouv.fr/politiques-publiques/operations-standardisees-deconomies-denergie';

    // Récupère le contenu de la page officielle
    const req = https.get(ATEE_URL, { headers: { 'User-Agent': 'EchoWAI-CEE-Platform/2.0' } }, (resp) => {
      let data = '';
      resp.on('data', chunk => { data += chunk; if (data.length > 500000) data = data.slice(0,500000); });
      resp.on('end', () => {
        // Extraction simple des codes fiches via regex
        const codeRegex = /\b(BAR|BAT|IND|AGRI|RES|TRA)-[A-Z]{2}-\d{3}\b/g;
        const codesFound = [...new Set(data.match(codeRegex) || [])];

        db.all('SELECT code FROM cee_fiches WHERE actif=1', [], (err, rows) => {
          const codesDB = rows ? rows.map(r => r.code) : [];
          const nouveaux = codesFound.filter(c => !codesDB.includes(c));
          const changements = nouveaux.map(c => ({ type: 'nouveau_code_detecte', code: c }));

          const logEntry = {
            statut: 'ok',
            fiches_verifiees: codesDB.length,
            changements: JSON.stringify(changements),
            declenche_par: declenchePar,
            duree_ms: Date.now() - startTime
          };

          db.run(`INSERT INTO veille_logs (statut,fiches_verifiees,changements,declenche_par)
            VALUES (?,?,?,?)`,
            [logEntry.statut, logEntry.fiches_verifiees, logEntry.changements, logEntry.declenche_par],
            () => resolve({ ...logEntry, changements }));
        });
      });
    });

    req.on('error', (e) => {
      db.run(`INSERT INTO veille_logs (statut,erreur,declenche_par) VALUES (?,?,?)`,
        ['erreur', e.message, declenchePar], () => {});
      resolve({ statut: 'erreur', erreur: e.message });
    });
    req.setTimeout(15000, () => { req.destroy(); });
  });
}

// Planifier veille journalière à 6h
function scheduleDailyVeille() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(6, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next - now;
  setTimeout(() => {
    runVeille('auto').then(r => console.log('🔍 Veille CEE:', r.statut, `— ${r.changements?.length||0} changement(s)`));
    setInterval(() => runVeille('auto'), 24 * 60 * 60 * 1000);
  }, delay);
  console.log(`⏰ Veille CEE planifiée dans ${Math.round(delay/3600000)}h`);
}
scheduleDailyVeille();

// GET — logs veille
app.get('/api/admin/veille/logs', requireAdmin, (req, res) => {
  db.all('SELECT * FROM veille_logs ORDER BY run_at DESC LIMIT 50', [],
    (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});

// POST — déclencher veille manuellement
app.post('/api/admin/veille/run', requireAdmin, async (req, res) => {
  try {
    const result = await runVeille('manuel');
    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }); }
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
