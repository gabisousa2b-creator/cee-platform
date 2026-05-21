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
const PDFDocument  = require('pdfkit');
const XLSX         = require('xlsx');

const app  = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Perruche2b';

// ── Directories ───────────────────────────────────────────────────────────────
const DATA_DIR    = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR  = path.join(__dirname, 'public');
const LOGOS_DIR   = path.join(PUBLIC_DIR, 'logos');
[DATA_DIR, UPLOADS_DIR, LOGOS_DIR, path.join(PUBLIC_DIR, 'data')].forEach(dir => {
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

  // ── Communication partenaires ─────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS annonces (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    titre      TEXT NOT NULL,
    contenu    TEXT NOT NULL,
    niveau     TEXT DEFAULT 'info',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS messages_partenaire (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    partenaire_id INTEGER NOT NULL,
    auteur        TEXT NOT NULL DEFAULT 'partenaire',
    nom_auteur    TEXT DEFAULT '',
    contenu       TEXT NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS comm_modeles (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    categorie  TEXT DEFAULT 'email',
    titre      TEXT NOT NULL,
    contenu    TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.get('SELECT COUNT(*) AS n FROM annonces', (e, r) => {
    if (e || !r || r.n) return;
    const a = db.prepare('INSERT INTO annonces (titre,contenu,niveau) VALUES (?,?,?)');
    a.run('Bienvenue sur votre espace partenaire EchoWAI', "Votre espace centralise le dépôt des dossiers CEE, le suivi des commissions, les exports EMMY et les outils de communication. Les annonces d'EchoWAI s'afficheront ici.", 'info');
    a.run("Catalogue d'opérations", "Le catalogue couvre les 261 fiches d'opérations standardisées des 6 secteurs CEE. Fixez une commission par opération avant de l'affecter à vos apporteurs d'affaires.", 'nouveaute');
    a.run('Rappel — pièces justificatives', "Tout dossier doit comporter le KBIS/RNE, la liasse fiscale et l'attestation de vigilance URSSAF du bénéficiaire pour passer en contrôle.", 'alerte');
    a.finalize();
  });
  db.get('SELECT COUNT(*) AS n FROM comm_modeles', (e, r) => {
    if (e || !r || r.n) return;
    const m = db.prepare('INSERT INTO comm_modeles (categorie,titre,contenu) VALUES (?,?,?)');
    m.run('email', 'Email — Première prise de contact', "Objet : Votre prime CEE — pièces à transmettre\n\nBonjour,\n\nNous accompagnons la valorisation de vos travaux d'économies d'énergie au titre des Certificats d'Économies d'Énergie (CEE).\n\nPour constituer votre dossier, merci de nous transmettre :\n- l'extrait KBIS ou RNE de votre société,\n- votre dernière liasse fiscale,\n- votre attestation de vigilance URSSAF.\n\nNous restons à votre disposition.\n\nCordialement,");
    m.run('email', 'Email — Relance pièces manquantes', "Objet : Dossier CEE — pièces en attente\n\nBonjour,\n\nVotre dossier CEE est en cours de constitution ; il nous manque encore certaines pièces justificatives.\n\nMerci de nous les transmettre afin de ne pas retarder le versement de votre prime.\n\nCordialement,");
    m.run('attestation', "Attestation sur l'honneur — modèle", "ATTESTATION SUR L'HONNEUR\n\nJe soussigné(e) [Nom Prénom], agissant en qualité de [fonction] de la société [raison sociale], SIRET [numéro],\n\natteste sur l'honneur que les travaux d'économies d'énergie réalisés à l'adresse [adresse des travaux] sont conformes à la fiche d'opération standardisée [code fiche] et n'ont fait l'objet d'aucune autre demande de Certificats d'Économies d'Énergie.\n\nFait à [ville], le [date].\n\nSignature :");
    m.run('marketing', 'Argumentaire — Le dispositif CEE', "LES CERTIFICATS D'ÉCONOMIES D'ÉNERGIE\n\nLe dispositif CEE oblige les fournisseurs d'énergie à financer des travaux d'économies d'énergie.\n\nPour le bénéficiaire :\n- une prime qui réduit le coût des travaux,\n- un dispositif encadré par l'État,\n- un accompagnement de bout en bout.\n\nSecteurs éligibles : résidentiel, tertiaire, industrie, agriculture, réseaux, transport.");
    m.finalize();
  });

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
    prime_negociee   REAL DEFAULT 0,
    prime_validee    REAL DEFAULT 0,
    statut           TEXT DEFAULT 'en_cours',
    notes            TEXT DEFAULT '',
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (beneficiaire_id) REFERENCES beneficiaires(id) ON DELETE CASCADE
  )`);
  // Migration silencieuse : renommage prime_estimee → prime_negociee
  db.run(`ALTER TABLE cee_operations ADD COLUMN prime_negociee REAL DEFAULT 0`, () => {});
  db.run(`UPDATE cee_operations SET prime_negociee = prime_estimee WHERE prime_negociee = 0 AND prime_estimee > 0`, () => {});

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

// ── Routage par domaine ───────────────────────────────────────────────────────
// compte.echowai.com → plateforme (admin / partenaire / apporteur)
// echowai.com        → vitrine institutionnelle + /beneficiaire
const COMPTE_HOST = 'compte.echowai.com';
const MAIN_HOSTS  = ['echowai.com', 'www.echowai.com'];
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  const host = (req.hostname || '').toLowerCase();
  const u = req.path;
  if (host === COMPTE_HOST) {
    if (u === '/' || u === '/index.html') return res.sendFile(path.join(PUBLIC_DIR, 'compte.html'));
    if (u === '/beneficiaire' || u === '/portal.html') return res.redirect(301, 'https://echowai.com/beneficiaire');
    return next();
  }
  if (MAIN_HOSTS.includes(host)) {
    if (u === '/admin'      || u === '/admin.html')      return res.redirect(301, 'https://' + COMPTE_HOST + '/admin.html');
    if (u === '/partenaire' || u === '/partenaire.html') return res.redirect(301, 'https://' + COMPTE_HOST + '/partenaire.html');
    if (u === '/compte.html')                            return res.redirect(301, 'https://' + COMPTE_HOST + '/');
    return next();
  }
  return next(); // localhost / dev : tout est servi, aucune redirection
});
// Portail bénéficiaire — accessible sur echowai.com/beneficiaire
app.get('/beneficiaire', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'portal.html')));
// Espace obligé — accessible via /oblige
app.get('/oblige', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'oblige.html')));
// Espace délégataire — accessible via /delegataire
app.get('/delegataire', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'delegataire.html')));
// Espace mandataire — accessible via /mandataire (alias enrichi de compte.html)
app.get('/mandataire', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'mandataire.html')));
// Espace installateur RGE
app.get('/installateur', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'installateur.html')));
// Espace contrôleur (organisme accrédité COFRAC)
app.get('/controleur',   (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'controleur.html')));

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

// Logo partenaire : images uniquement, stockées dans public/logos (servies en statique)
const uploadLogo = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, LOGOS_DIR),
    filename:    (req, file, cb) => cb(null, 'logo-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['.jpg','.jpeg','.png','.svg','.webp'];
    ok.includes(path.extname(file.originalname).toLowerCase()) ? cb(null, true) : cb(new Error('Image requise (jpg, png, svg, webp)'));
  }
});

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
const requirePartner     = (req, res, next) => req.session.compteId       ? next() : res.status(401).json({ error: 'Non autorisé' });
const requireOblige      = (req, res, next) => req.session.obligeId       ? next() : res.status(401).json({ error: 'Non autorisé' });
const requireDelegataire = (req, res, next) => req.session.delegataireId  ? next() : res.status(401).json({ error: 'Non autorisé' });
const requireInstallateur= (req, res, next) => req.session.installateurId ? next() : res.status(401).json({ error: 'Non autorisé' });
const requireControleur  = (req, res, next) => req.session.controleurId   ? next() : res.status(401).json({ error: 'Non autorisé' });
// ── RBAC — rôles : super_admin · admin_partenaire · apporteur ─────────────────
function sessionRole(req) { return req.session.isAdmin ? 'super_admin' : (req.session.role || null); }
function requireRole(...roles) {
  return (req, res, next) => roles.includes(sessionRole(req))
    ? next() : res.status(403).json({ error: 'Accès non autorisé pour votre rôle' });
}
// Prix CEE effectif : override partenaire sinon taux global
function getPrixCee(partenaireId, cb) {
  db.get(`SELECT valeur FROM parametres WHERE cle='prix_cee_eur_mwh'`, [], (e, g) => {
    const prixGlobal = parseFloat(g && g.valeur) || 7.5;
    if (!partenaireId) return cb(prixGlobal);
    db.get('SELECT prix_eur_mwh FROM partenaires WHERE id=?', [partenaireId], (e2, p) =>
      cb(p && p.prix_eur_mwh != null ? parseFloat(p.prix_eur_mwh) : prixGlobal));
  });
}
// Commission selon le mode : pct (% subvention) · eur_mwhc (€/MWhc) · fixe (€/dossier)
function computeCommission(mode, valeur, ctx) {
  const v = parseFloat(valeur) || 0;
  if (v <= 0) return 0;
  if (mode === 'pct')      return Math.round((ctx.subvention   || 0) * v / 100);
  if (mode === 'eur_mwhc') return Math.round((ctx.volume_cumac || 0) / 1000 * v);
  if (mode === 'fixe')     return Math.round(v);
  return 0;
}

// ── Hash mot de passe (crypto natif, scrypt — aucune dépendance) ──────────────
const crypto = require('crypto');
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(String(pw), salt, 64).toString('hex');
}
function verifyPassword(pw, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, dk] = stored.split(':');
  try {
    const test = crypto.scryptSync(String(pw), salt, 64);
    const ref  = Buffer.from(dk, 'hex');
    return test.length === ref.length && crypto.timingSafeEqual(test, ref);
  } catch(e) { return false; }
}

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

// ── Connexion unifiée — portail unique compte.echowai.com (admin / partenaire / apporteur) ──
app.post('/api/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
  const email    = (req.body.email || '').trim();
  const password = req.body.password || '';
  if (!password) return res.status(400).json({ error: 'Mot de passe requis' });

  const tryAdmin = () => {
    if (password === ADMIN_PASSWORD) {
      req.session.isAdmin = true;
      resetLoginAttempts(ip);
      db.run(`INSERT INTO activity_logs (beneficiaire_id, action, details, auteur) VALUES (NULL, 'connexion_admin', 'Connexion admin réussie', 'admin')`);
      return res.json({ success: true, role: 'super_admin', redirect: '/admin.html' });
    }
    return res.status(401).json({ error: 'Identifiants incorrects' });
  };

  if (!email) return tryAdmin();

  db.get(`SELECT c.*, p.nom AS partenaire_nom FROM comptes c
          JOIN partenaires p ON p.id=c.partenaire_id
          WHERE lower(c.email)=lower(?) AND c.actif=1 AND p.actif=1`,
    [email], (err, c) => {
      if (err) return res.status(500).json({ error: err.message });
      if (c && verifyPassword(password, c.password_hash)) {
        resetLoginAttempts(ip);
        req.session.compteId     = c.id;
        req.session.role         = c.role;
        req.session.partenaireId = c.partenaire_id;
        db.run('UPDATE comptes SET last_login=CURRENT_TIMESTAMP WHERE id=?', [c.id]);
        return res.json({ success: true, role: c.role, redirect: '/partenaire.html' });
      }
      return tryAdmin();
    });
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  db.get('SELECT COUNT(*) as total FROM beneficiaires WHERE archived=0', [], (err, total) => {
    db.all('SELECT statut, COUNT(*) as count FROM beneficiaires WHERE archived=0 GROUP BY statut', [], (err, byStatut) => {
      db.get('SELECT COUNT(*) as total FROM documents WHERE uploaded_by="beneficiaire"', [], (err, docs) => {
        db.get('SELECT COUNT(*) as total FROM beneficiaires WHERE archived=1', [], (err, arch) => {
          // Stats CEE opérations
          db.get(`SELECT
            COALESCE(SUM(volume_kwh), 0)    AS total_kwh,
            COALESCE(SUM(prime_negociee), 0) AS total_prime_negociee,
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
                totalPrimeNegociee: ops?.total_prime_negociee || 0,
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

// Parcours CEE du dossier : engage → controle → valide → facture
app.put('/api/admin/beneficiaires/:id/statut-cee', requireAdmin, (req, res) => {
  const valid = ['engage','controle','valide','facture'];
  if (!valid.includes(req.body.statut_cee)) return res.status(400).json({ error:'Statut CEE invalide' });
  db.run('UPDATE beneficiaires SET statut_cee=?,updated_at=CURRENT_TIMESTAMP WHERE id=?',
    [req.body.statut_cee, req.params.id], (err) => {
      if (err) return res.status(500).json({ error:err.message });
      db.run(`INSERT INTO activity_logs (beneficiaire_id,action,details,auteur) VALUES (?,?,?,?)`,
        [req.params.id, 'statut_cee', 'Parcours CEE → ' + req.body.statut_cee, 'admin']);
      res.json({ success:true });
    });
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

// Pièces à fournir par le bénéficiaire (cahier des charges) — il ne voit que les siennes
app.get('/api/portal/pieces', requireBeneficiary, (req, res) => {
  db.all("SELECT id,nom,obligatoire,fourni,ordre FROM dossier_pieces WHERE beneficiaire_id=? AND fourni_par='beneficiaire' ORDER BY ordre,id",
    [req.session.beneficiaireId], (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows || []));
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
  const { beneficiaire_id, code_fiche, nom_operation, secteur, date_engagement, date_achevement, volume_kwh, prime_negociee, prime_validee, statut, notes } = req.body;
  if (!beneficiaire_id || !code_fiche || !nom_operation) return res.status(400).json({ error: 'Champs requis manquants' });
  db.run(
    `INSERT INTO cee_operations (beneficiaire_id, code_fiche, nom_operation, secteur, date_engagement, date_achevement, volume_kwh, prime_negociee, prime_validee, statut, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [beneficiaire_id, code_fiche.trim(), nom_operation.trim(), secteur||'', date_engagement||null, date_achevement||null, parseFloat(volume_kwh)||0, parseFloat(prime_negociee)||0, parseFloat(prime_validee)||0, statut||'en_cours', notes||''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.run(`INSERT INTO activity_logs (beneficiaire_id, action, details, auteur) VALUES (?, 'operation_created', ?, 'admin')`,
        [beneficiaire_id, `Opération CEE créée : ${code_fiche} — ${nom_operation}`]);
      db.get('SELECT o.*, b.nom, b.prenom, b.raison_sociale, b.code AS benef_code FROM cee_operations o LEFT JOIN beneficiaires b ON b.id=o.beneficiaire_id WHERE o.id=?', [this.lastID], (err, row) => res.json(row));
    }
  );
});

// Modifier une opération
app.put('/api/admin/operations/:id', requireAdmin, (req, res) => {
  const { code_fiche, nom_operation, secteur, date_engagement, date_achevement, volume_kwh, prime_negociee, prime_validee, statut, notes } = req.body;
  db.run(
    `UPDATE cee_operations SET code_fiche=?, nom_operation=?, secteur=?, date_engagement=?, date_achevement=?, volume_kwh=?, prime_negociee=?, prime_validee=?, statut=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [code_fiche, nom_operation, secteur||'', date_engagement||null, date_achevement||null, parseFloat(volume_kwh)||0, parseFloat(prime_negociee)||0, parseFloat(prime_validee)||0, statut||'en_cours', notes||'', req.params.id],
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
      o.volume_kwh, o.prime_negociee, o.prime_validee,
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
        'PRIME_NEGOCIEE_EUR','PRIME_VALIDEE_EUR','STATUT_OPERATION'
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
          r.volume_kwh||'', r.prime_negociee||'', r.prime_validee||'',
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
  // Migrations : compte de connexion partenaire
  [`ALTER TABLE partenaires ADD COLUMN login_email TEXT DEFAULT ''`,
   `ALTER TABLE partenaires ADD COLUMN password_hash TEXT DEFAULT ''`,
   `ALTER TABLE partenaires ADD COLUMN compte_actif INTEGER DEFAULT 0`,
   `ALTER TABLE partenaires ADD COLUMN last_login DATETIME`,
   `ALTER TABLE partenaires ADD COLUMN permissions TEXT DEFAULT '{}'`,
   `ALTER TABLE partenaires ADD COLUMN prix_eur_mwh REAL`,
   `ALTER TABLE partenaires ADD COLUMN commission_mode TEXT DEFAULT 'pct'`,
   `ALTER TABLE partenaires ADD COLUMN commission_valeur REAL DEFAULT 0`
  ].forEach(sql => db.run(sql, () => {}));

  // ── RBAC : comptes utilisateurs (admin_partenaire, apporteur) ────────────────
  db.run(`CREATE TABLE IF NOT EXISTS comptes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    partenaire_id INTEGER NOT NULL,
    role          TEXT NOT NULL DEFAULT 'apporteur',
    nom           TEXT DEFAULT '',
    email         TEXT NOT NULL,
    password_hash TEXT DEFAULT '',
    actif         INTEGER DEFAULT 1,
    commission_mode   TEXT DEFAULT 'pct',
    commission_valeur REAL DEFAULT 0,
    last_login    DATETIME,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  [`ALTER TABLE comptes ADD COLUMN commission_mode TEXT DEFAULT 'pct'`,
   `ALTER TABLE comptes ADD COLUMN commission_valeur REAL DEFAULT 0`,
   `ALTER TABLE comptes ADD COLUMN operations TEXT DEFAULT '[]'`
  ].forEach(sql => db.run(sql, () => {}));

  // Catalogue d'opérations par partenaire (fiches CEE proposées + commission)
  db.run(`CREATE TABLE IF NOT EXISTS partenaire_operations (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    partenaire_id     INTEGER NOT NULL,
    code_fiche        TEXT NOT NULL,
    nom               TEXT DEFAULT '',
    secteur           TEXT DEFAULT '',
    commission_mode   TEXT DEFAULT 'pct',
    commission_valeur REAL DEFAULT 0,
    actif             INTEGER DEFAULT 1,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Commission personnalisée par (apporteur × opération) — surcharge la commission de l'opération
  db.run(`CREATE TABLE IF NOT EXISTS apporteur_operations_comm (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    apporteur_id      INTEGER NOT NULL,
    operation_id      INTEGER NOT NULL,
    commission_mode   TEXT DEFAULT 'pct',
    commission_valeur REAL DEFAULT 0,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(apporteur_id, operation_id)
  )`);
  // ── Délégataires CEE ──────────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS delegataires (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nom        TEXT NOT NULL UNIQUE,
    actif      INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Délégataires retenus par un partenaire + prix MWhc négocié
  db.run(`CREATE TABLE IF NOT EXISTS partenaire_delegataires (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    partenaire_id  INTEGER NOT NULL,
    delegataire_id INTEGER NOT NULL,
    prix_mwhc      REAL DEFAULT 0,
    actif          INTEGER DEFAULT 1,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(partenaire_id, delegataire_id)
  )`);
  db.run(`ALTER TABLE beneficiaires ADD COLUMN delegataire_id INTEGER`, () => {});

  // ── Obligés CEE — fournisseurs d'énergie soumis à obligation ─────────────────
  // Un obligé reçoit les dossiers que les partenaires lui ont attribués et
  // valide la prime CEE. Auth dédié (session.obligeId), espace propre.
  db.run(`CREATE TABLE IF NOT EXISTS obliges (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    raison_sociale           TEXT NOT NULL,
    siret                    TEXT DEFAULT '',
    type                     TEXT DEFAULT 'energie',     -- energie, carburant, autre
    email                    TEXT NOT NULL UNIQUE,
    password_hash            TEXT DEFAULT '',
    contact_nom              TEXT DEFAULT '',
    contact_tel              TEXT DEFAULT '',
    kwhc_obligation_annuelle REAL DEFAULT 0,             -- volume CEE annuel à acquérir
    prix_eur_mwhc            REAL DEFAULT 9.10,          -- prix de référence proposé
    actif                    INTEGER DEFAULT 1,
    last_login               DATETIME,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Lien dossier → obligé : oblige_id sur beneficiaires + statut de validation.
  [`ALTER TABLE beneficiaires ADD COLUMN oblige_id INTEGER`,
   `ALTER TABLE beneficiaires ADD COLUMN oblige_statut TEXT DEFAULT 'non_assigne'`,  // non_assigne, en_attente, valide, refuse
   `ALTER TABLE beneficiaires ADD COLUMN oblige_valide_at DATETIME`,
   `ALTER TABLE beneficiaires ADD COLUMN oblige_motif_refus TEXT DEFAULT ''`
  ].forEach(sql => db.run(sql, () => {}));
  // Seed obligés démo (mot de passe par défaut: oblige2026, à changer en prod)
  db.get('SELECT COUNT(*) AS n FROM obliges', (e, r) => {
    if (e || !r || r.n) return;
    const seedHash = hashPassword('oblige2026');
    const seeds = [
      { rs: 'TotalEnergies Marketing France', email: 'oblige.demo@totalenergies.fr', type: 'carburant', kwhc: 25e9, siret: '54205117800012' },
      { rs: 'EDF SA',                          email: 'oblige.demo@edf.fr',          type: 'energie',   kwhc: 80e9, siret: '55208131766522' },
      { rs: 'Engie',                           email: 'oblige.demo@engie.fr',        type: 'energie',   kwhc: 45e9, siret: '54210755500021' },
    ];
    const st = db.prepare(`INSERT INTO obliges (raison_sociale, email, type, kwhc_obligation_annuelle, siret, password_hash) VALUES (?,?,?,?,?,?)`);
    seeds.forEach(s => st.run(s.rs, s.email, s.type, s.kwhc, s.siret, seedHash));
    st.finalize();
  });

  // ── Installateurs RGE — entreprises qui exécutent les travaux ────────────────
  db.run(`CREATE TABLE IF NOT EXISTS installateurs (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    raison_sociale   TEXT NOT NULL,
    siret            TEXT DEFAULT '',
    rge_numero       TEXT DEFAULT '',         -- N° RGE Qualibat / Qualifelec / Qualit'EnR
    rge_organisme    TEXT DEFAULT '',         -- Qualibat, Qualifelec, Qualit'EnR, Qualiclimafroid
    rge_qualifs      TEXT DEFAULT '[]',       -- JSON: liste de codes qualif (8221, 8222…)
    rge_valid_until  DATE,
    email            TEXT NOT NULL UNIQUE,
    password_hash    TEXT DEFAULT '',
    contact_nom      TEXT DEFAULT '',
    contact_tel      TEXT DEFAULT '',
    adresse          TEXT DEFAULT '',
    ville            TEXT DEFAULT '',
    code_postal      TEXT DEFAULT '',
    actif            INTEGER DEFAULT 1,
    last_login       DATETIME,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // ── Contrôleurs — organismes accrédités COFRAC pour contrôles in-situ ───────
  db.run(`CREATE TABLE IF NOT EXISTS controleurs (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    raison_sociale    TEXT NOT NULL,
    siret             TEXT DEFAULT '',
    accreditation_no  TEXT DEFAULT '',        -- N° accréditation COFRAC (NF EN ISO 17020)
    accreditation_until DATE,
    email             TEXT NOT NULL UNIQUE,
    password_hash     TEXT DEFAULT '',
    contact_nom       TEXT DEFAULT '',
    contact_tel       TEXT DEFAULT '',
    actif             INTEGER DEFAULT 1,
    last_login        DATETIME,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Suivi côté installateur / contrôleur pour chaque dossier
  [`ALTER TABLE beneficiaires ADD COLUMN installateur_id INTEGER`,
   `ALTER TABLE beneficiaires ADD COLUMN installateur_statut TEXT DEFAULT 'non_assigne'`, // non_assigne, devis_envoye, devis_signe, travaux_en_cours, travaux_termines, facture_emise, ah_signee
   `ALTER TABLE beneficiaires ADD COLUMN installateur_date_devis DATE`,
   `ALTER TABLE beneficiaires ADD COLUMN installateur_date_facture DATE`,
   `ALTER TABLE beneficiaires ADD COLUMN installateur_notes TEXT DEFAULT ''`,
   `ALTER TABLE beneficiaires ADD COLUMN controleur_id INTEGER`,
   `ALTER TABLE beneficiaires ADD COLUMN controleur_statut TEXT DEFAULT 'non_planifie'`,   // non_planifie, planifie, controle_ok, ecart_mineur, non_conforme
   `ALTER TABLE beneficiaires ADD COLUMN controleur_date_visite DATE`,
   `ALTER TABLE beneficiaires ADD COLUMN controleur_rapport TEXT DEFAULT ''`
  ].forEach(sql => db.run(sql, () => {}));
  // Seed 2 installateurs + 2 contrôleurs démo
  setTimeout(() => {
    db.get('SELECT COUNT(*) AS n FROM installateurs', (e, r) => {
      if (e || !r || r.n) return;
      const h = hashPassword('installateur2026');
      const seeds = [
        { rs: 'Iso Confort SARL', email: 'installateur.demo@isoconfort.fr', rge_no: 'QB-8221-123456', rge_org: 'Qualibat', siret: '83012345600015' },
        { rs: 'Therm\'Élec',      email: 'installateur.demo@thermelec.fr',  rge_no: 'QF-9221-789012', rge_org: 'Qualifelec', siret: '83098765400022' },
      ];
      const st = db.prepare(`INSERT INTO installateurs (raison_sociale, email, password_hash, rge_numero, rge_organisme, siret) VALUES (?,?,?,?,?,?)`);
      seeds.forEach(s => st.run(s.rs, s.email, h, s.rge_no, s.rge_org, s.siret));
      st.finalize();
    });
    db.get('SELECT COUNT(*) AS n FROM controleurs', (e, r) => {
      if (e || !r || r.n) return;
      const h = hashPassword('controleur2026');
      const seeds = [
        { rs: 'Veritas Contrôle CEE', email: 'controleur.demo@bureauveritas.fr', acc: '1-2345', siret: '77566802000010' },
        { rs: 'Socotec Énergie',      email: 'controleur.demo@socotec.fr',       acc: '1-3210', siret: '54206834400025' },
      ];
      const st = db.prepare(`INSERT INTO controleurs (raison_sociale, email, password_hash, accreditation_no, siret) VALUES (?,?,?,?,?)`);
      seeds.forEach(s => st.run(s.rs, s.email, h, s.acc, s.siret));
      st.finalize();
    });
  }, 400);

  // Active 3 comptes délégataires démo (mot de passe par défaut: delegataire2026)
  // Idempotent : ne fait rien si les comptes existent déjà.
  setTimeout(() => {
    const delegSeeds = [
      { nom: 'Hellio Solutions',    email: 'delegataire.demo@hellio.com' },
      { nom: 'Effy Connect',        email: 'delegataire.demo@effy.fr' },
      { nom: 'TotalEnergies Marketing France', email: 'delegataire.demo@totalenergies.fr' },
    ];
    const seedHash = hashPassword('delegataire2026');
    delegSeeds.forEach(s => {
      db.run(`UPDATE delegataires
              SET email=?, password_hash=?, compte_actif=1
              WHERE nom=? AND (compte_actif=0 OR compte_actif IS NULL OR email='' OR email IS NULL)`,
        [s.email, seedHash, s.nom], () => {});
    });
  }, 300);
  // Colonnes d'authentification + portail pour les délégataires
  [`ALTER TABLE delegataires ADD COLUMN email TEXT DEFAULT ''`,
   `ALTER TABLE delegataires ADD COLUMN password_hash TEXT DEFAULT ''`,
   `ALTER TABLE delegataires ADD COLUMN contact_nom TEXT DEFAULT ''`,
   `ALTER TABLE delegataires ADD COLUMN contact_tel TEXT DEFAULT ''`,
   `ALTER TABLE delegataires ADD COLUMN siret TEXT DEFAULT ''`,
   `ALTER TABLE delegataires ADD COLUMN compte_actif INTEGER DEFAULT 0`,
   `ALTER TABLE delegataires ADD COLUMN last_login DATETIME`
  ].forEach(sql => db.run(sql, () => {}));
  // Statut de suivi côté délégataire pour chaque dossier
  [`ALTER TABLE beneficiaires ADD COLUMN delegataire_statut TEXT DEFAULT 'non_assigne'`,  // non_assigne, en_traitement, soumis, valide, refuse
   `ALTER TABLE beneficiaires ADD COLUMN delegataire_traite_at DATETIME`,
   `ALTER TABLE beneficiaires ADD COLUMN delegataire_notes TEXT DEFAULT ''`
  ].forEach(sql => db.run(sql, () => {}));
  db.get('SELECT COUNT(*) AS n FROM delegataires', (e, r) => {
    if (e || !r || r.n) return;
    const noms = ["Abokine","ACE Énergie","ACT Commodities France","Aidée","Akéa Énergies","AlphaCEE","Arès",
      "Capital Energy","CertiNergy","CN Solutions","D.D.E.R","Drapo","EBS Énergie","Éco Environnement",
      "Économie d'Énergie","Effy Chauffage","Effy Connect","Effy Renov","Enerly Eco","Enneo","Enr'Cert",
      "Acciona Energia France","GreenYellow","Hellio Solutions","La Compagnie des Économies d'Énergie",
      "Loris ENR","Neutrali","OAAN Consulting","Objectif 54","Objectif EcoÉnergie","OFEE","Premium Energy",
      "Sonergia","Teksial","TotalEnergies Marketing France","Vertigo","Vos Travaux Éco","Ynergie"];
    const st = db.prepare('INSERT INTO delegataires (nom) VALUES (?)');
    noms.forEach(n => st.run(n));
    st.finalize();
  });
  // ── Cahier des charges — pièces requises par (partenaire × délégataire × opération) ──
  // Lignes de base : partenaire_id / delegataire_id / operation_id à NULL = standard CEE
  db.run(`CREATE TABLE IF NOT EXISTS cdc_pieces (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    partenaire_id  INTEGER,
    delegataire_id INTEGER,
    operation_id   INTEGER,
    nom            TEXT NOT NULL,
    fourni_par     TEXT DEFAULT 'partenaire',
    obligatoire    INTEGER DEFAULT 1,
    ordre          INTEGER DEFAULT 0,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.get('SELECT COUNT(*) AS n FROM cdc_pieces WHERE partenaire_id IS NULL', (e, r) => {
    if (e || !r || r.n) return;
    const base = [
      ['Devis signé et daté (antérieur à l\'engagement)', 'partenaire', 1],
      ['Facture des travaux', 'partenaire', 1],
      ["Attestation sur l'honneur (AH) signée", 'partenaire', 1],
      ['Cadre de contribution / attestation de convention', 'partenaire', 1],
      ['Preuve de réalisation des travaux', 'partenaire', 0],
      ['Fiche technique / certificat du matériel posé', 'partenaire', 0],
      ['Extrait KBIS ou RNE du bénéficiaire', 'beneficiaire', 1],
      ['Liasse fiscale', 'beneficiaire', 1],
      ['Attestation de vigilance URSSAF', 'beneficiaire', 1]
    ];
    const st = db.prepare('INSERT INTO cdc_pieces (partenaire_id,delegataire_id,operation_id,nom,fourni_par,obligatoire,ordre) VALUES (NULL,NULL,NULL,?,?,?,?)');
    base.forEach((p, i) => st.run(p[0], p[1], p[2], i));
    st.finalize();
  });
  // Pièces requises d'un dossier — instanciées depuis le cahier des charges
  db.run(`CREATE TABLE IF NOT EXISTS dossier_pieces (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiaire_id INTEGER NOT NULL,
    nom             TEXT NOT NULL,
    fourni_par      TEXT DEFAULT 'partenaire',
    obligatoire     INTEGER DEFAULT 1,
    fourni          INTEGER DEFAULT 0,
    ordre           INTEGER DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // ── Catalogue matériel — articles disponibles, rattachés à une opération ──────
  db.run(`CREATE TABLE IF NOT EXISTS materiel (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    partenaire_id INTEGER NOT NULL,
    operation_id  INTEGER,
    nom           TEXT NOT NULL,
    reference     TEXT DEFAULT '',
    marque        TEXT DEFAULT '',
    categorie     TEXT DEFAULT '',
    unite         TEXT DEFAULT 'unité',
    actif         INTEGER DEFAULT 1,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Catalogue central : champs prix, TVA, fiche technique, photo, stock
  [`ALTER TABLE materiel ADD COLUMN prix_achat REAL DEFAULT 0`,
   `ALTER TABLE materiel ADD COLUMN prix_vente REAL DEFAULT 0`,
   `ALTER TABLE materiel ADD COLUMN tva REAL DEFAULT 20`,
   `ALTER TABLE materiel ADD COLUMN specs TEXT DEFAULT ''`,
   `ALTER TABLE materiel ADD COLUMN image_url TEXT DEFAULT ''`,
   `ALTER TABLE materiel ADD COLUMN stock REAL DEFAULT 0`,
   `ALTER TABLE materiel ADD COLUMN seuil_alerte REAL DEFAULT 0`,
   `ALTER TABLE materiel ADD COLUMN code_fiche TEXT DEFAULT ''`
  ].forEach(sql => db.run(sql, () => {}));
  // Matériel sélectionné pour un dossier (commande à venir — stock/paiement ultérieurs)
  db.run(`CREATE TABLE IF NOT EXISTS dossier_materiel (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiaire_id INTEGER NOT NULL,
    materiel_id     INTEGER NOT NULL,
    quantite        REAL DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(beneficiaire_id, materiel_id)
  )`);
  // ── Commandes de matériel ─────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS commandes (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    partenaire_id     INTEGER NOT NULL,
    reference         TEXT,
    statut            TEXT DEFAULT 'preparee',
    livraison_type    TEXT DEFAULT 'entrepot',
    livraison_adresse TEXT DEFAULT '',
    notes             TEXT DEFAULT '',
    created_by        TEXT DEFAULT '',
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS commande_lignes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    commande_id     INTEGER NOT NULL,
    beneficiaire_id INTEGER,
    materiel_id     INTEGER,
    nom             TEXT DEFAULT '',
    quantite        REAL DEFAULT 1,
    prix_unitaire   REAL DEFAULT 0,
    tva             REAL DEFAULT 20
  )`);
  db.run(`ALTER TABLE commandes ADD COLUMN reste_a_charge REAL DEFAULT 0`, () => {});
  // Mouvements de stock — journal des entrées / sorties
  db.run(`CREATE TABLE IF NOT EXISTS stock_mouvements (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    materiel_id INTEGER NOT NULL,
    type        TEXT DEFAULT 'sortie',
    quantite    REAL DEFAULT 0,
    motif       TEXT DEFAULT '',
    commande_id INTEGER,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Cours EMMY (CEE) — base réévaluée une fois par jour
  db.run(`CREATE TABLE IF NOT EXISTS emmy_state (
    id   INTEGER PRIMARY KEY CHECK (id = 1),
    base REAL,
    day  TEXT
  )`);
  // Cahier des charges : preuve d'achat du matériel (ajout après seed initial)
  db.get("SELECT id FROM cdc_pieces WHERE partenaire_id IS NULL AND nom LIKE '%matériel%'", (e, r) => {
    if (e || r) return;
    db.run("INSERT INTO cdc_pieces (partenaire_id,delegataire_id,operation_id,nom,fourni_par,obligatoire,ordre) VALUES (NULL,NULL,NULL,?,?,?,?)",
      ["Preuve d'achat / facture du matériel", 'partenaire', 1, 9]);
  });
  // Opération choisie au dépôt d'un dossier (id partenaire_operations)
  db.run(`ALTER TABLE beneficiaires ADD COLUMN operation_id INTEGER`, () => {});

  // ── Paramètres globaux (taux CEE, etc.) ───────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS parametres (
    cle    TEXT PRIMARY KEY,
    valeur TEXT DEFAULT ''
  )`);
  db.run(`INSERT OR IGNORE INTO parametres (cle,valeur) VALUES ('prix_cee_eur_mwh','7.5')`);

  // Rattachement dossier → apporteur qui l'a déposé
  db.run(`ALTER TABLE beneficiaires ADD COLUMN apporteur_id INTEGER`, () => {});
  // Rattachement dossier → installateur en charge de la pose
  db.run(`ALTER TABLE beneficiaires ADD COLUMN installateur_id INTEGER`, () => {});
  // Parcours CEE du dossier : engage → controle → valide → facture
  db.run(`ALTER TABLE beneficiaires ADD COLUMN statut_cee TEXT DEFAULT 'engage'`, () => {});

  // Migration douce : promeut les logins partenaire existants en compte admin_partenaire
  db.run(`INSERT INTO comptes (partenaire_id, role, nom, email, password_hash, actif)
          SELECT id, 'admin_partenaire', nom, login_email, password_hash, compte_actif
          FROM partenaires p
          WHERE p.login_email <> ''
            AND NOT EXISTS (SELECT 1 FROM comptes c WHERE c.partenaire_id=p.id AND c.role='admin_partenaire')`, () => {});
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

// ── Cours EMMY (CEE) — base réévaluée chaque jour, lue par le logo ───────────
function emmyToday(cb) {
  const today = new Date().toISOString().slice(0, 10);
  db.get('SELECT base, day FROM emmy_state WHERE id=1', [], (err, row) => {
    if (err) return cb({ base: 9.10, day: today });
    if (row && row.day === today && row.base > 0) return cb({ base: row.base, day: today });
    const ANCHOR = 9.10;
    let base = (row && row.base > 0) ? row.base : ANCHOR;
    const delta = (Math.random() - 0.5) * 0.42 - (base - ANCHOR) * 0.12; // dérive douce, retour à la moyenne
    base = Math.round(Math.max(8.0, Math.min(10.6, base + delta)) * 100) / 100;
    db.run('INSERT INTO emmy_state (id,base,day) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET base=excluded.base, day=excluded.day',
      [base, today], () => {});
    cb({ base: base, day: today });
  });
}
app.get('/api/emmy', (req, res) => {
  // base = jour ; price/value = alias attendus par le hook du logo widget
  emmyToday(d => res.json({ ...d, price: d.base, value: d.base }));
});

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
  db.all(`SELECT p.id,p.nom,p.siret,p.adresse,p.code_postal,p.ville,p.email,p.telephone,
            p.site_web,p.logo_url,p.texte_custom,p.role_defaut,p.actif,p.prix_eur_mwh,
            p.commission_mode,p.commission_valeur,p.created_at,
            (SELECT COUNT(*) FROM beneficiaires b WHERE b.partenaire=p.nom AND b.archived=0) AS nb_dossiers,
            (SELECT email FROM comptes c WHERE c.partenaire_id=p.id AND c.role='admin_partenaire' LIMIT 1) AS login_email,
            (SELECT actif FROM comptes c WHERE c.partenaire_id=p.id AND c.role='admin_partenaire' LIMIT 1) AS compte_actif,
            (SELECT COUNT(*) FROM comptes c WHERE c.partenaire_id=p.id AND c.role='apporteur' AND c.actif=1) AS nb_apporteurs
          FROM partenaires p WHERE p.actif=1 ORDER BY p.nom`, [],
    (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});
app.post('/api/admin/partenaires', requireAdmin, (req, res) => {
  const p = req.body;
  if (!p.nom) return res.status(400).json({ error: 'Nom requis' });
  const cmode = ['pct','eur_mwhc','fixe'].includes(p.commission_mode) ? p.commission_mode : 'pct';
  db.run(`INSERT INTO partenaires (nom,siret,adresse,code_postal,ville,email,telephone,site_web,logo_url,texte_custom,role_defaut,prix_eur_mwh,commission_mode,commission_valeur)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [p.nom,p.siret||'',p.adresse||'',p.code_postal||'',p.ville||'',p.email||'',
     p.telephone||'',p.site_web||'',p.logo_url||'',p.texte_custom||'',p.role_defaut||'',
     (p.prix_eur_mwh==='' || p.prix_eur_mwh==null) ? null : parseFloat(p.prix_eur_mwh),
     cmode, parseFloat(p.commission_valeur) || 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM partenaires WHERE id=?',[this.lastID],(e,r)=>res.json(r));
    });
});
app.put('/api/admin/partenaires/:id', requireAdmin, (req, res) => {
  const p = req.body;
  const cmode = ['pct','eur_mwhc','fixe'].includes(p.commission_mode) ? p.commission_mode : 'pct';
  db.run(`UPDATE partenaires SET nom=?,siret=?,adresse=?,code_postal=?,ville=?,email=?,telephone=?,
    site_web=?,logo_url=?,texte_custom=?,role_defaut=?,prix_eur_mwh=?,commission_mode=?,commission_valeur=?,actif=? WHERE id=?`,
    [p.nom,p.siret||'',p.adresse||'',p.code_postal||'',p.ville||'',p.email||'',
     p.telephone||'',p.site_web||'',p.logo_url||'',p.texte_custom||'',p.role_defaut||'',
     (p.prix_eur_mwh==='' || p.prix_eur_mwh==null) ? null : parseFloat(p.prix_eur_mwh),
     cmode, parseFloat(p.commission_valeur) || 0,
     p.actif!==undefined?p.actif:1,req.params.id],
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// Suppression partenaire (soft delete) + désactivation de ses comptes
app.delete('/api/admin/partenaires/:id', requireAdmin, (req, res) => {
  db.run('UPDATE partenaires SET actif=0 WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run('UPDATE comptes SET actif=0 WHERE partenaire_id=?', [req.params.id], () => res.json({ success: true }));
  });
});

// Compte Admin Partenaire — création / mise à jour (super admin)
app.put('/api/admin/partenaires/:id/compte', requireAdmin, (req, res) => {
  const pid = req.params.id;
  const { login_email, password, compte_actif } = req.body;
  if (password && String(password).length < 6)
    return res.status(400).json({ error: 'Mot de passe : 6 caractères minimum' });
  db.get(`SELECT c.id AS compte_id, p.nom FROM partenaires p
          LEFT JOIN comptes c ON c.partenaire_id=p.id AND c.role='admin_partenaire'
          WHERE p.id=?`, [pid], (err, row) => {
    if (err)  return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Partenaire introuvable' });
    if (row.compte_id) {
      const sets = [], vals = [];
      if (login_email !== undefined)  { sets.push('email=?');  vals.push(String(login_email||'').trim().toLowerCase()); }
      if (compte_actif !== undefined) { sets.push('actif=?');  vals.push(compte_actif ? 1 : 0); }
      if (password) { sets.push('password_hash=?'); vals.push(hashPassword(password)); }
      if (!sets.length) return res.status(400).json({ error: 'Aucune modification' });
      vals.push(row.compte_id);
      db.run(`UPDATE comptes SET ${sets.join(',')} WHERE id=?`, vals,
        e => e ? res.status(500).json({ error: e.message }) : res.json({ success: true }));
    } else {
      if (!login_email || !password)
        return res.status(400).json({ error: 'Email et mot de passe requis pour créer le compte' });
      db.run(`INSERT INTO comptes (partenaire_id,role,nom,email,password_hash,actif) VALUES (?,?,?,?,?,?)`,
        [pid, 'admin_partenaire', row.nom, String(login_email).trim().toLowerCase(), hashPassword(password),
         compte_actif === false ? 0 : 1],
        e => e ? res.status(500).json({ error: e.message }) : res.json({ success: true }));
    }
  });
});

// Paramètres globaux (taux CEE) — super admin
app.get('/api/admin/parametres', requireAdmin, (req, res) => {
  db.all('SELECT cle,valeur FROM parametres', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const o = {}; (rows || []).forEach(r => o[r.cle] = r.valeur);
    res.json(o);
  });
});
app.put('/api/admin/parametres', requireAdmin, (req, res) => {
  const entries = Object.entries(req.body || {});
  if (!entries.length) return res.status(400).json({ error: 'Aucun paramètre' });
  let done = 0, failed = null;
  entries.forEach(([cle, valeur]) => {
    db.run(`INSERT INTO parametres (cle,valeur) VALUES (?,?)
            ON CONFLICT(cle) DO UPDATE SET valeur=excluded.valeur`,
      [cle, String(valeur)], (err) => {
        if (err) failed = err.message;
        if (++done === entries.length) failed ? res.status(500).json({ error: failed }) : res.json({ success: true });
      });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── ESPACE PARTENAIRE ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/partner/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  db.get(`SELECT c.*, p.nom AS partenaire_nom FROM comptes c
          JOIN partenaires p ON p.id=c.partenaire_id
          WHERE lower(c.email)=lower(?) AND c.actif=1 AND p.actif=1`,
    [String(email).trim()], (err, c) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!c || !verifyPassword(password, c.password_hash)) {
        return res.status(401).json({ error: 'Identifiants incorrects' });
      }
      resetLoginAttempts(ip);
      req.session.compteId     = c.id;
      req.session.role         = c.role;
      req.session.partenaireId = c.partenaire_id;
      db.run('UPDATE comptes SET last_login=CURRENT_TIMESTAMP WHERE id=?', [c.id]);
      res.json({ success: true, nom: c.nom || c.partenaire_nom, role: c.role });
    });
});
app.post('/api/partner/logout',    (req, res) => { req.session.destroy(); res.json({ success: true }); });
app.get('/api/partner/check-auth', (req, res) => res.json({ authenticated: !!req.session.compteId, role: sessionRole(req) }));

// Changement de mot de passe en self-service (admin_partenaire ou apporteur)
app.post('/api/partner/change-password', requirePartner, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password)
    return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' });
  if (String(new_password).length < 6)
    return res.status(400).json({ error: 'Nouveau mot de passe : 6 caractères minimum' });
  db.get('SELECT password_hash FROM comptes WHERE id=? AND actif=1', [req.session.compteId], (err, c) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!c)  return res.status(401).json({ error: 'Session invalide' });
    if (!verifyPassword(current_password, c.password_hash))
      return res.status(403).json({ error: 'Mot de passe actuel incorrect' });
    db.run('UPDATE comptes SET password_hash=? WHERE id=?', [hashPassword(new_password), req.session.compteId],
      e => e ? res.status(500).json({ error: e.message }) : res.json({ success: true }));
  });
});

// Profil de l'organisation partenaire — l'admin partenaire gère ses coordonnées
app.get('/api/partner/profile', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    db.get('SELECT id,nom,siret,adresse,code_postal,ville,email,telephone,site_web,logo_url FROM partenaires WHERE id=?',
      [s.partenaire_id], (err, row) => err ? res.status(500).json({ error: err.message }) : res.json(row || {}));
  });
});
app.put('/api/partner/profile', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const f = req.body;
    if (!f.nom || !String(f.nom).trim()) return res.status(400).json({ error: 'Le nom est requis' });
    db.run(`UPDATE partenaires SET nom=?,siret=?,adresse=?,code_postal=?,ville=?,email=?,telephone=?,site_web=? WHERE id=?`,
      [String(f.nom).trim(), f.siret||'', f.adresse||'', f.code_postal||'', f.ville||'', f.email||'', f.telephone||'', f.site_web||'', s.partenaire_id],
      err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
  });
});
app.post('/api/partner/logo', requireRole('admin_partenaire'), (req, res) => {
  uploadLogo.single('logo')(req, res, (err) => {
    if (err)        return res.status(400).json({ error: err.message || 'Upload échoué' });
    if (!req.file)  return res.status(400).json({ error: 'Aucun fichier reçu' });
    partnerScope(req, res, (s) => {
      const url = '/logos/' + req.file.filename;
      db.run('UPDATE partenaires SET logo_url=? WHERE id=?', [url, s.partenaire_id],
        e => e ? res.status(500).json({ error: e.message }) : res.json({ success: true, logo_url: url }));
    });
  });
});

// Contexte du compte connecté + garde de session
function partnerScope(req, res, cb) {
  db.get(`SELECT c.id, c.role, c.partenaire_id, c.nom AS compte_nom, c.operations,
                 c.commission_mode AS c_cmode, c.commission_valeur AS c_cval,
                 p.nom AS partenaire_nom, p.prix_eur_mwh,
                 p.commission_mode AS p_cmode, p.commission_valeur AS p_cval
          FROM comptes c JOIN partenaires p ON p.id=c.partenaire_id
          WHERE c.id=? AND c.actif=1 AND p.actif=1`,
    [req.session.compteId], (err, row) => {
      if (err)  return res.status(500).json({ error: err.message });
      if (!row) return res.status(401).json({ error: 'Session invalide' });
      cb(row);
    });
}
// Filtre dossiers selon le rôle : apporteur = ses dépôts ; installateur = ses dossiers ; admin_partenaire = tout l'org
function dossierFilter(s) {
  if (s.role === 'apporteur')
    return { where: 'b.archived=0 AND b.partenaire=? AND b.apporteur_id=?', params: [s.partenaire_nom, s.id] };
  if (s.role === 'installateur')
    return { where: 'b.archived=0 AND b.partenaire=? AND b.installateur_id=?', params: [s.partenaire_nom, s.id] };
  return { where: 'b.archived=0 AND b.partenaire=?', params: [s.partenaire_nom] };
}
// Commission du périmètre courant : apporteur → sa commission ; admin_partenaire → celle de l'org
function scopeCommission(s) {
  return s.role === 'apporteur'
    ? { mode: s.c_cmode || 'pct', valeur: s.c_cval || 0 }
    : { mode: s.p_cmode || 'pct', valeur: s.p_cval || 0 };
}
// Résolution de la commission d'un dossier — priorité :
// 1. commission personnalisée apporteur × opération  2. commission de l'opération  3. commission du périmètre
function resolveCommission(r, cc) {
  if (r.ao_cmode != null) return { mode: r.ao_cmode, valeur: r.ao_cval };
  if (r.op_cmode != null) return { mode: r.op_cmode, valeur: r.op_cval };
  return { mode: cc.mode, valeur: cc.valeur };
}
const COMMISSION_MODES = ['pct', 'eur_mwhc', 'fixe'];

app.get('/api/partner/me', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    const cc = scopeCommission(s);
    getPrixCee(s.partenaire_id, (prix) => res.json({
      compte_nom: s.compte_nom, partenaire_nom: s.partenaire_nom,
      role: s.role, partenaire_id: s.partenaire_id, prix_eur_mwh: prix,
      commission_mode: cc.mode, commission_valeur: cc.valeur
    }));
  });
});

app.get('/api/partner/stats', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    const f = dossierFilter(s);
    getPrixCee(s.partenaire_id, (prix) => {
      const cc = scopeCommission(s);
      db.all(`SELECT b.statut, po.commission_mode AS op_cmode, po.commission_valeur AS op_cval,
                aoc.commission_mode AS ao_cmode, aoc.commission_valeur AS ao_cval,
                (SELECT COALESCE(SUM(volume_kwh),0) FROM cee_operations WHERE beneficiaire_id=b.id) AS cumac
              FROM beneficiaires b
              LEFT JOIN partenaire_operations po ON po.id=b.operation_id
              LEFT JOIN apporteur_operations_comm aoc ON aoc.apporteur_id=b.apporteur_id AND aoc.operation_id=b.operation_id
              WHERE ${f.where}`, f.params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const byStatut = {}; let total = 0, cumac = 0, commission = 0;
        (rows || []).forEach(r => {
          byStatut[r.statut] = (byStatut[r.statut] || 0) + 1;
          total++; cumac += (r.cumac || 0);
          const subv = Math.round((r.cumac || 0) * prix / 1000);
          const rc = resolveCommission(r, cc);
          commission += computeCommission(rc.mode, rc.valeur, { subvention: subv, volume_cumac: r.cumac || 0 });
        });
        res.json({ total, byStatut, volume_cumac: cumac,
          subvention: Math.round(cumac * prix / 1000), prix_eur_mwh: prix, commission });
      });
    });
  });
});

app.get('/api/partner/dossiers', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    const f = dossierFilter(s);
    getPrixCee(s.partenaire_id, (prix) => {
      db.all(`SELECT b.id,b.code,b.nom,b.prenom,b.email,b.telephone,b.raison_sociale,b.siret,b.adresse,b.code_postal,b.ville,
                b.activite,b.statut,b.statut_cee,b.apporteur_id,b.operation_id,b.created_at,b.updated_at,
                (SELECT COALESCE(SUM(volume_kwh),0) FROM cee_operations WHERE beneficiaire_id=b.id) AS volume_cumac,
                (SELECT COUNT(DISTINCT type) FROM documents WHERE beneficiaire_id=b.id AND uploaded_by='beneficiaire' AND type IN ('kbis_rne','liasse_fiscale','attestation_urssaf')) AS docs_count,
                (SELECT nom FROM comptes WHERE id=b.apporteur_id) AS apporteur_nom,
                (SELECT nom FROM comptes WHERE id=b.installateur_id) AS installateur_nom,
                b.installateur_id,
                po.code_fiche AS operation_code, po.nom AS operation_nom,
                po.commission_mode AS op_cmode, po.commission_valeur AS op_cval,
                aoc.commission_mode AS ao_cmode, aoc.commission_valeur AS ao_cval
              FROM beneficiaires b
              LEFT JOIN partenaire_operations po ON po.id=b.operation_id
              LEFT JOIN apporteur_operations_comm aoc ON aoc.apporteur_id=b.apporteur_id AND aoc.operation_id=b.operation_id
              WHERE ${f.where} ORDER BY b.created_at DESC`, f.params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const cc = scopeCommission(s);
        (rows || []).forEach(r => {
          r.subvention = Math.round((r.volume_cumac || 0) * prix / 1000);
          const rc = resolveCommission(r, cc);
          r.commission = computeCommission(rc.mode, rc.valeur, { subvention: r.subvention, volume_cumac: r.volume_cumac });
        });
        res.json(rows || []);
      });
    });
  });
});

app.get('/api/partner/dossiers/:id', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    const f = dossierFilter(s);
    getPrixCee(s.partenaire_id, (prix) => {
      db.get(`SELECT b.id,b.code,b.nom,b.prenom,b.email,b.telephone,b.raison_sociale,b.siret,b.adresse,
                b.code_postal,b.ville,b.activite,b.statut,b.statut_cee,b.partenaire,b.apporteur_id,b.operation_id,b.created_at,b.updated_at,
                po.code_fiche AS operation_code, po.nom AS operation_nom,
                po.commission_mode AS op_cmode, po.commission_valeur AS op_cval,
                aoc.commission_mode AS ao_cmode, aoc.commission_valeur AS ao_cval
              FROM beneficiaires b
              LEFT JOIN partenaire_operations po ON po.id=b.operation_id
              LEFT JOIN apporteur_operations_comm aoc ON aoc.apporteur_id=b.apporteur_id AND aoc.operation_id=b.operation_id
              WHERE ${f.where} AND b.id=?`, [...f.params, req.params.id], (err, b) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!b)  return res.status(404).json({ error: 'Dossier introuvable ou hors de votre périmètre' });
        db.all(`SELECT id,type,original_name,doc_statut,uploaded_by,created_at FROM documents WHERE beneficiaire_id=? ORDER BY created_at DESC`,
          [b.id], (e2, docs) => {
            db.all(`SELECT code_fiche,nom_operation,secteur,volume_kwh,prime_negociee,prime_validee,statut,date_engagement FROM cee_operations WHERE beneficiaire_id=?`,
              [b.id], (e3, ops) => {
                const cumac = (ops || []).reduce((t, o) => t + (o.volume_kwh || 0), 0);
                const subvention = Math.round(cumac * prix / 1000);
                const cc = scopeCommission(s);
                const rc = resolveCommission(b, cc);
                res.json({ ...b, documents: docs || [], operations: ops || [],
                  volume_cumac: cumac, subvention, prix_eur_mwh: prix,
                  commission: computeCommission(rc.mode, rc.valeur, { subvention, volume_cumac: cumac }),
                  commission_mode: rc.mode });
              });
          });
      });
    });
  });
});

// ── Pièces requises d'un dossier (cahier des charges instancié) ──────────────
app.get('/api/partner/dossiers/:id/pieces', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    const f = dossierFilter(s);
    db.get(`SELECT b.id FROM beneficiaires b WHERE ${f.where} AND b.id=?`, [...f.params, req.params.id], (e, b) => {
      if (e)  return res.status(500).json({ error: e.message });
      if (!b) return res.status(404).json({ error: 'Dossier hors de votre périmètre' });
      db.all('SELECT id,nom,fourni_par,obligatoire,fourni,ordre FROM dossier_pieces WHERE beneficiaire_id=? ORDER BY ordre,id',
        [b.id], (e2, rows) => e2 ? res.status(500).json({ error: e2.message }) : res.json(rows || []));
    });
  });
});
app.post('/api/partner/dossiers/:id/pieces/generer', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    const f = dossierFilter(s);
    db.get(`SELECT b.id,b.delegataire_id,b.operation_id FROM beneficiaires b WHERE ${f.where} AND b.id=?`,
      [...f.params, req.params.id], (e, b) => {
        if (e)  return res.status(500).json({ error: e.message });
        if (!b) return res.status(404).json({ error: 'Dossier hors de votre périmètre' });
        getCdc(s.partenaire_id, b.delegataire_id, b.operation_id, (e2, cdc) => {
          if (e2) return res.status(500).json({ error: e2.message });
          db.run('DELETE FROM dossier_pieces WHERE beneficiaire_id=?', [b.id], (e3) => {
            if (e3) return res.status(500).json({ error: e3.message });
            const st = db.prepare('INSERT INTO dossier_pieces (beneficiaire_id,nom,fourni_par,obligatoire,ordre) VALUES (?,?,?,?,?)');
            cdc.pieces.forEach((p, i) => st.run(b.id, p.nom, p.fourni_par, p.obligatoire ? 1 : 0, i));
            st.finalize(err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true, count: cdc.pieces.length }));
          });
        });
      });
  });
});
app.put('/api/partner/dossiers/:id/pieces', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    const f = dossierFilter(s);
    db.get(`SELECT b.id FROM beneficiaires b WHERE ${f.where} AND b.id=?`, [...f.params, req.params.id], (e, b) => {
      if (e)  return res.status(500).json({ error: e.message });
      if (!b) return res.status(404).json({ error: 'Dossier hors de votre périmètre' });
      const pieces = Array.isArray(req.body.pieces) ? req.body.pieces : [];
      db.run('DELETE FROM dossier_pieces WHERE beneficiaire_id=?', [b.id], (e2) => {
        if (e2) return res.status(500).json({ error: e2.message });
        if (!pieces.length) return res.json({ success: true });
        const st = db.prepare('INSERT INTO dossier_pieces (beneficiaire_id,nom,fourni_par,obligatoire,fourni,ordre) VALUES (?,?,?,?,?,?)');
        pieces.forEach((p, i) => {
          const nom = String(p.nom || '').trim();
          if (!nom) return;
          st.run(b.id, nom, p.fourni_par === 'beneficiaire' ? 'beneficiaire' : 'partenaire', p.obligatoire ? 1 : 0, p.fourni ? 1 : 0, i);
        });
        st.finalize(err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
      });
    });
  });
});

// ── Génération de documents PDF — devis, facture, AH, attestation de convention ──
function renderDocPdf(res, ctx) {
  const { b, org, deleg, type, prix, cumac, subvention } = ctx;
  const INK = '#181c24', SOFT = '#5c6470', RULE = '#cdd2db', BAND = '#1f2632';
  const eur = n => (Math.round(n) || 0).toLocaleString('fr-FR') + ' €';
  const today = new Date().toLocaleDateString('fr-FR');
  const nomComplet = ((b.prenom||'') + ' ' + (b.nom||'')).trim() || '—';
  const villeBenef = [b.code_postal, b.ville].filter(Boolean).join(' ');
  const opLabel = (b.op_code ? b.op_code + ' — ' : '') + (b.op_nom || "Opération d'économies d'énergie");
  const delegNom = (deleg && deleg.deleg_nom) ? deleg.deleg_nom : null;
  const TITRE = { devis:'DEVIS', facture:'FACTURE', ah:"ATTESTATION SUR L'HONNEUR", convention:'ATTESTATION DE CONVENTION' };
  const REF   = { devis:'DEV', facture:'FAC', ah:'AH', convention:'CONV' };
  const M = 56;

  const doc = new PDFDocument({ size:'A4', margin:M, info:{ Title: TITRE[type] + ' ' + b.code, Author: org.nom || '' } });
  doc.pipe(res);
  const W = doc.page.width - 2 * M;
  const R = M + W;

  // En-tête — identité de l'émetteur
  doc.font('Helvetica-Bold').fontSize(13).fillColor(INK).text(org.nom || 'Émetteur', M, M, { width: W * 0.56 });
  doc.font('Helvetica').fontSize(8.5).fillColor(SOFT);
  [org.adresse, [org.code_postal, org.ville].filter(Boolean).join(' '),
   org.siret && ('SIRET ' + org.siret),
   [org.telephone, org.site_web].filter(Boolean).join('   ·   ')]
   .filter(Boolean).forEach(l => doc.text(l, { width: W * 0.56 }));
  const leftBottom = doc.y;

  // En-tête — intitulé et référence du document
  doc.font('Helvetica-Bold').fontSize(18).fillColor(INK).text(TITRE[type], M, M, { width: W, align:'right' });
  doc.font('Helvetica').fontSize(9).fillColor(SOFT);
  doc.text('Référence  ' + REF[type] + '-' + b.code, { width: W, align:'right' });
  doc.text("Date d'émission  " + today, { width: W, align:'right' });
  if (type === 'devis') doc.text('Validité  30 jours', { width: W, align:'right' });

  let y = Math.max(leftBottom, doc.y) + 18;
  doc.moveTo(M, y).lineWidth(1).strokeColor(RULE).lineTo(R, y).stroke();
  y += 20;

  const lab = type === 'ah' ? 'DÉCLARANT' : (type === 'convention' ? 'OBJET' : 'CLIENT');
  doc.font('Helvetica-Bold').fontSize(8).fillColor(SOFT).text(lab, M, y);
  y = doc.y + 3;
  if (type === 'convention') {
    doc.font('Helvetica').fontSize(9.5).fillColor(INK).text('Dossier CEE n° ' + b.code, M, y, { width: W }); y = doc.y + 18;
  } else {
    if (b.raison_sociale && b.raison_sociale.trim()) { doc.font('Helvetica-Bold').fontSize(10.5).fillColor(INK).text(b.raison_sociale, M, y, { width: W }); y = doc.y; }
    doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(nomComplet, M, y, { width: W }); y = doc.y;
    doc.fontSize(8.5).fillColor(SOFT);
    [b.adresse, villeBenef, b.siret && ('SIRET ' + b.siret)].filter(Boolean).forEach(l => { doc.text(l, M, y, { width: W }); y = doc.y; });
    y += 20;
  }

  const para = (t) => { doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(t, M, y, { width: W, align:'justify', lineGap:2.5 }); y = doc.y + 9; };
  const sign = (g, d) => {
    y += 6;
    const bw = (W - 32) / 2;
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(INK).text(g, M, y, { width: bw });
    doc.text(d, M + bw + 32, y, { width: bw });
    const by = doc.y + 4;
    doc.rect(M, by, bw, 74).lineWidth(.8).strokeColor(RULE).stroke();
    doc.rect(M + bw + 32, by, bw, 74).lineWidth(.8).strokeColor(RULE).stroke();
    y = by + 74;
  };

  if (type === 'devis' || type === 'facture') {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(SOFT).text('OBJET', M, y); y = doc.y + 3;
    doc.font('Helvetica').fontSize(9.5).fillColor(INK).text("Valorisation d'une opération d'économies d'énergie au titre des Certificats d'Économies d'Énergie.", M, y, { width: W }); y = doc.y + 16;
    const w0 = W*0.46, w1 = W*0.20, w2 = W*0.17, w3 = W - w0 - w1 - w2;
    const c0 = M, c1 = M+w0, c2 = c1+w1, c3 = c2+w2;
    doc.rect(M, y, W, 19).fill(BAND);
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#ffffff');
    doc.text('DÉSIGNATION', c0+7, y+6, { width:w0-10 });
    doc.text('VOLUME', c1, y+6, { width:w1-7, align:'right' });
    doc.text('PRIX UNITAIRE', c2, y+6, { width:w2-7, align:'right' });
    doc.text('MONTANT', c3, y+6, { width:w3-7, align:'right' });
    y += 19;
    const rh = 40;
    doc.rect(M, y, W, rh).lineWidth(.8).strokeColor(RULE).stroke();
    doc.font('Helvetica').fontSize(8.5).fillColor(INK).text(opLabel, c0+7, y+8, { width:w0-12 });
    doc.text(cumac.toLocaleString('fr-FR') + ' kWhc', c1, y+14, { width:w1-7, align:'right' });
    doc.text(prix + ' €/MWhc', c2, y+14, { width:w2-7, align:'right' });
    doc.font('Helvetica-Bold').text(eur(subvention), c3, y+14, { width:w3-7, align:'right' });
    y += rh + 12;
    if (Array.isArray(ctx.materiel) && ctx.materiel.length) {
      doc.font('Helvetica-Bold').fontSize(8).fillColor(SOFT).text('MATÉRIEL INCLUS', M, y); y = doc.y + 4;
      ctx.materiel.forEach(mt => {
        doc.font('Helvetica').fontSize(8.7).fillColor(INK)
          .text('•  ' + (mt.nom || '—') + '   ×' + (mt.quantite || 1), M + 4, y, { width: W - 8 });
        y = doc.y + 2;
      });
      y += 12;
    }
    const tw = W*0.44, tx = R-tw;
    doc.rect(tx, y, tw, 28).fill(BAND);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff').text(type==='facture' ? 'NET À PAYER' : 'PRIME CEE ESTIMÉE', tx+10, y+9, { width:tw*0.5 });
    doc.fontSize(12).fillColor('#ffffff').text(eur(subvention), tx+tw*0.5, y+8, { width:tw*0.5-10, align:'right' });
    y += 28 + 22;
    if (type === 'devis') {
      para("Le présent devis est établi au titre du dispositif des Certificats d'Économies d'Énergie (articles L.221-1 et suivants du Code de l'énergie). Le montant indiqué revêt un caractère estimatif et demeure subordonné à la validation du dossier. Devis valable 30 jours à compter de sa date d'émission.");
      y += 4;
      doc.font('Helvetica').fontSize(8.5).fillColor(SOFT).text('Fait à ' + (b.ville || '________________') + ', le ' + today, M, y); y = doc.y + 10;
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(INK).text('Bon pour accord — date et signature du client', M, y); y = doc.y + 4;
      doc.rect(M, y, W*0.5, 76).lineWidth(.8).strokeColor(RULE).stroke();
      y += 76;
    } else {
      para("Montant valorisé au titre du dispositif des Certificats d'Économies d'Énergie. Règlement à réception de la présente facture.");
      para("Conformément aux articles L.441-10 et D.441-5 du Code de commerce, tout retard de paiement donne lieu à des pénalités calculées au taux de trois fois le taux d'intérêt légal, ainsi qu'à une indemnité forfaitaire pour frais de recouvrement de 40 euros. Aucun escompte n'est accordé pour paiement anticipé.");
    }
  } else if (type === 'ah') {
    para("Je soussigné(e) " + nomComplet + ", agissant en qualité de représentant de " + (b.raison_sociale || 'la structure bénéficiaire') + (b.siret ? (', immatriculée sous le numéro SIRET ' + b.siret) : '') + ", déclare sur l'honneur ce qui suit :");
    para("1.   Les travaux d'économies d'énergie réalisés à l'adresse " + (b.adresse || '—') + ' ' + villeBenef + " relèvent de l'opération standardisée " + opLabel + ".");
    para("2.   Ces travaux sont achevés et conformes aux exigences techniques de la fiche d'opération standardisée correspondante.");
    para("3.   Ces travaux n'ont fait l'objet d'aucune autre demande de Certificats d'Économies d'Énergie auprès d'un tiers.");
    para("4.   Je reconnais avoir été informé(e), préalablement à l'engagement des travaux, du rôle actif et incitatif joué par " + (org.nom || 'le professionnel') + (delegNom ? (" ainsi que par le délégataire " + delegNom) : '') + " dans ma décision de réaliser ces travaux.");
    para("La présente attestation est établie pour servir et valoir ce que de droit.");
    doc.font('Helvetica').fontSize(8.5).fillColor(SOFT).text('Fait à ' + (b.ville || '________________') + ', le ' + today, M, y); y = doc.y + 6;
    sign('Le bénéficiaire', 'Le professionnel');
  } else {
    para("Entre les soussignés :");
    para("•   " + (org.nom || '—') + (org.siret ? (', SIRET ' + org.siret) : '') + ", ci-après dénommé « le partenaire » ;");
    para("•   " + (delegNom || '—') + ", ci-après dénommé « le délégataire ».");
    para("Il est attesté de la convention conclue entre les parties, dans le cadre du dispositif des Certificats d'Économies d'Énergie, pour le traitement du dossier référencé " + b.code + " relatif à l'opération " + opLabel + ", au bénéfice de " + (b.raison_sociale || nomComplet) + ".");
    para("Le prix de valorisation négocié entre les parties s'établit à " + prix + " euros par MWh cumac. Le délégataire s'engage à porter les Certificats d'Économies d'Énergie correspondants et à en assurer le dépôt auprès du registre national des certificats d'économies d'énergie.");
    doc.font('Helvetica').fontSize(8.5).fillColor(SOFT).text('Fait le ' + today, M, y); y = doc.y + 6;
    sign('Pour le partenaire', 'Pour le délégataire');
  }

  // Pied de page — identité légale de l'émetteur
  const fy = doc.page.height - M - 24;
  doc.moveTo(M, fy).lineWidth(.7).strokeColor(RULE).lineTo(R, fy).stroke();
  const legal = [org.nom, org.siret && ('SIRET ' + org.siret),
    [org.code_postal, org.ville].filter(Boolean).join(' ')].filter(Boolean).join('   —   ');
  doc.font('Helvetica').fontSize(7).fillColor(SOFT).text(legal || '', M, fy + 6, { width: W, align:'center' });
  doc.end();
}
app.get('/api/partner/dossiers/:id/document/:type', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    const type = String(req.params.type || '').toLowerCase();
    const TYPES = { devis:'Devis', facture:'Facture', ah:"Attestation sur l'honneur", convention:'Attestation de convention' };
    if (!TYPES[type]) return res.status(400).json({ error: 'Type de document inconnu' });
    const f = dossierFilter(s);
    db.get(`SELECT b.*, po.code_fiche AS op_code, po.nom AS op_nom,
              (SELECT COALESCE(SUM(volume_kwh),0) FROM cee_operations WHERE beneficiaire_id=b.id) AS cumac
            FROM beneficiaires b LEFT JOIN partenaire_operations po ON po.id=b.operation_id
            WHERE ${f.where} AND b.id=?`, [...f.params, req.params.id], (e, b) => {
      if (e)  return res.status(500).json({ error: e.message });
      if (!b) return res.status(404).json({ error: 'Dossier hors de votre périmètre' });
      db.get('SELECT * FROM partenaires WHERE id=?', [s.partenaire_id], (e2, org) => {
        db.get(`SELECT d.nom AS deleg_nom, pd.prix_mwhc FROM delegataires d
                LEFT JOIN partenaire_delegataires pd ON pd.delegataire_id=d.id AND pd.partenaire_id=?
                WHERE d.id=?`, [s.partenaire_id, b.delegataire_id || 0], (e3, deleg) => {
          getPrixCee(s.partenaire_id, (prixDefaut) => {
            const prix = (deleg && deleg.prix_mwhc) ? deleg.prix_mwhc : prixDefaut;
            db.all(`SELECT dm.quantite, m.nom FROM dossier_materiel dm
                    JOIN materiel m ON m.id=dm.materiel_id WHERE dm.beneficiaire_id=?`, [b.id], (e4, materiel) => {
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', `attachment; filename="${type}-${b.code}.pdf"`);
              renderDocPdf(res, { type, titre: TYPES[type], b, org: org || {}, deleg: deleg || {},
                prix, cumac: b.cumac || 0, subvention: Math.round((b.cumac || 0) * prix / 1000),
                materiel: materiel || [] });
            });
          });
        });
      });
    });
  });
});

// ═══ Tableau de bord partenaire — exports CSV ════════════════════════════════
const REGIONS_FR = {
  'Auvergne-Rhône-Alpes':['01','03','07','15','26','38','42','43','63','69','73','74'],
  'Bourgogne-Franche-Comté':['21','25','39','58','70','71','89','90'],
  'Bretagne':['22','29','35','56'],
  'Centre-Val de Loire':['18','28','36','37','41','45'],
  'Corse':['20','2A','2B'],
  'Grand Est':['08','10','51','52','54','55','57','67','68','88'],
  'Hauts-de-France':['02','59','60','62','80'],
  'Île-de-France':['75','77','78','91','92','93','94','95'],
  'Normandie':['14','27','50','61','76'],
  'Nouvelle-Aquitaine':['16','17','19','23','24','33','40','47','64','79','86','87'],
  'Occitanie':['09','11','12','30','31','32','34','46','48','65','66','81','82'],
  'Pays de la Loire':['44','49','53','72','85'],
  "Provence-Alpes-Côte d'Azur":['04','05','06','13','83','84'],
  'Guadeloupe':['971'],'Martinique':['972'],'Guyane':['973'],'La Réunion':['974'],'Mayotte':['976']
};
const DEPT_TO_REGION = {};
Object.entries(REGIONS_FR).forEach(([reg, depts]) => depts.forEach(d => { DEPT_TO_REGION[d] = reg; }));
function regionFromCP(cp) {
  cp = String(cp || '').trim();
  if (!cp) return '';
  if (cp.startsWith('97') || cp.startsWith('98')) return DEPT_TO_REGION[cp.slice(0,3)] || '';
  return DEPT_TO_REGION[cp.slice(0,2)] || '';
}
function csvCell(v) {
  v = (v == null ? '' : String(v));
  return /[";\r\n]/.test(v) ? '"' + v.replace(/"/g,'""') + '"' : v;
}
function buildCsv(headers, rows) {
  const lines = [headers.map(csvCell).join(';')];
  rows.forEach(r => lines.push(r.map(csvCell).join(';')));
  return '﻿' + lines.join('\r\n');
}
function sendCsv(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}
const CEE_STATUT_FR  = { engage:'Engagé', controle:'Contrôle', valide:'Validé', facture:'Facturé' };
const COMM_MODE_FR   = { pct:'%', eur_mwhc:'€/MWhc', fixe:'€ fixe' };

// Export des commissions par apporteur d'affaires
app.get('/api/partner/export/commissions', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    const f = dossierFilter(s);
    getPrixCee(s.partenaire_id, (prix) => {
      const cc = scopeCommission(s);
      db.all(`SELECT b.code,b.nom,b.prenom,b.raison_sociale,b.code_postal,b.ville,b.statut_cee,
                (SELECT COALESCE(SUM(volume_kwh),0) FROM cee_operations WHERE beneficiaire_id=b.id) AS cumac,
                (SELECT nom FROM comptes WHERE id=b.apporteur_id) AS apporteur_nom,
                po.code_fiche AS op_code, po.nom AS op_nom, po.commission_mode AS op_cmode, po.commission_valeur AS op_cval,
                aoc.commission_mode AS ao_cmode, aoc.commission_valeur AS ao_cval
              FROM beneficiaires b
              LEFT JOIN partenaire_operations po ON po.id=b.operation_id
              LEFT JOIN apporteur_operations_comm aoc ON aoc.apporteur_id=b.apporteur_id AND aoc.operation_id=b.operation_id
              WHERE ${f.where} ORDER BY apporteur_nom, b.created_at`, f.params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        rows = rows || [];
        const headers = ['Apporteur','Code dossier','Bénéficiaire','Entreprise','Opération','Fiche',
          'Région','Ville','Volume kWh cumac','Subvention (€)','Commission','Mode','Statut CEE'];
        const out = []; let grand = 0, sub = 0, lastApp = null, nApp = 0;
        const flush = () => { if (lastApp !== null) {
          out.push([`Total — ${lastApp}`,'','','','','','','', '', '', sub, `${nApp} dossier(s)`, '']); out.push([]);
        } };
        rows.forEach(r => {
          const app = r.apporteur_nom || '(non attribué)';
          if (app !== lastApp) { flush(); sub = 0; nApp = 0; lastApp = app; }
          const subv = Math.round((r.cumac||0) * prix / 1000);
          const rc = resolveCommission(r, cc);
          const cm = rc.mode, cv = rc.valeur;
          const com = computeCommission(cm, cv, { subvention: subv, volume_cumac: r.cumac });
          sub += com; grand += com; nApp++;
          out.push([app, r.code, `${r.prenom||''} ${r.nom||''}`.trim(), r.raison_sociale||'',
            r.op_nom||'', r.op_code||'', regionFromCP(r.code_postal), r.ville||'',
            r.cumac||0, subv, com, COMM_MODE_FR[cm]||cm, CEE_STATUT_FR[r.statut_cee]||r.statut_cee||'']);
        });
        flush();
        out.push(['TOTAL GÉNÉRAL','','','','','','','', '', '', grand, `${rows.length} dossier(s)`, '']);
        sendCsv(res, `commissions-${new Date().toISOString().slice(0,10)}.csv`, buildCsv(headers, out));
      });
    });
  });
});

// Export EMMY — tableau récapitulatif des opérations (structure Annexe 6, arrêté 04/09/2014)
app.get('/api/partner/export/emmy', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    const f = dossierFilter(s);
    const opId = parseInt(req.query.operation_id) || null;
    let where = f.where; const params = [...f.params];
    if (opId) { where += ' AND b.operation_id=?'; params.push(opId); }
    getPrixCee(s.partenaire_id, (prix) => {
      db.all(`SELECT b.code,b.nom,b.prenom,b.raison_sociale,b.siret,b.adresse,b.code_postal,b.ville,b.statut_cee,
                (SELECT COALESCE(SUM(volume_kwh),0) FROM cee_operations WHERE beneficiaire_id=b.id) AS cumac,
                (SELECT MIN(date_engagement) FROM cee_operations WHERE beneficiaire_id=b.id) AS d_eng,
                (SELECT MAX(date_achevement) FROM cee_operations WHERE beneficiaire_id=b.id) AS d_ach,
                po.code_fiche AS op_code, po.nom AS op_nom, po.secteur AS op_secteur
              FROM beneficiaires b LEFT JOIN partenaire_operations po ON po.id=b.operation_id
              WHERE ${where} ORDER BY po.code_fiche, b.code`, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        rows = rows || [];
        const headers = ['Référence dossier','Type de bénéficiaire','Raison sociale','Nom','Prénom','SIRET',
          'Adresse des travaux','Code postal','Ville','Région','Code fiche','Dénomination opération','Secteur',
          "Date d'engagement","Date d'achèvement",'Volume (kWh cumac)','Prime estimée (€)','Statut'];
        const out = rows.map(r => {
          const morale = !!(r.raison_sociale && r.raison_sociale.trim());
          const subv = Math.round((r.cumac||0) * prix / 1000);
          return [r.code, morale?'Personne morale':'Personne physique', r.raison_sociale||'',
            r.nom||'', r.prenom||'', r.siret||'', r.adresse||'', r.code_postal||'', r.ville||'',
            regionFromCP(r.code_postal), r.op_code||'', r.op_nom||'', r.op_secteur||'',
            r.d_eng||'', r.d_ach||'', r.cumac||0, subv, CEE_STATUT_FR[r.statut_cee]||r.statut_cee||''];
        });
        let fname = 'export-emmy';
        if (opId && rows[0] && rows[0].op_code) fname += '-' + String(rows[0].op_code).replace(/[^A-Za-z0-9-]/g,'');
        sendCsv(res, `${fname}-${new Date().toISOString().slice(0,10)}.csv`, buildCsv(headers, out));
      });
    });
  });
});

// Helpers DB promesse (pour l'import séquentiel)
function dbGet(sql, params) { return new Promise((resolve, reject) => db.get(sql, params, (e, r) => e ? reject(e) : resolve(r))); }
function dbRun(sql, params) { return new Promise((resolve, reject) => db.run(sql, params, function(e) { e ? reject(e) : resolve(this); })); }
// Parseur CSV — détecte ; ou , — gère les champs entre guillemets
function parseCsvText(text) {
  text = text.replace(/^﻿/, '');
  const firstLine = text.split(/\r?\n/)[0] || '';
  const sep = (firstLine.split(';').length >= firstLine.split(',').length) ? ';' : ',';
  const rows = []; let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i+1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') { inQ = true; }
    else if (c === sep)   { row.push(field); field = ''; }
    else if (c === '\n')  { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r')  { field += c; }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Import CEE / EMMY — crée les nouveaux dossiers, met à jour ceux reconnus par leur code
app.post('/api/partner/import', requireRole('admin_partenaire','apporteur'), (req, res) => {
  csvXlsxUpload.single('file')(req, res, (uErr) => {
    if (uErr)      return res.status(400).json({ error: uErr.message || 'Upload échoué' });
    if (!req.file) return res.status(400).json({ error: 'Fichier CSV requis' });
    partnerScope(req, res, async (s) => {
      try {
        const rows = parseCsvText(req.file.buffer.toString('utf8'));
        if (rows.length < 2) return res.status(400).json({ error: 'Fichier vide ou sans ligne de données.' });
        const norm = h => String(h||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
        const head = rows[0].map(norm);
        const col = (...names) => { for (const n of names) { const i = head.indexOf(n); if (i >= 0) return i; } return -1; };
        const ci = {
          code:    col('code','reference dossier','reference','ref'),
          nom:     col('nom'),
          prenom:  col('prenom'),
          rs:      col('raison sociale','entreprise','societe','raison_sociale'),
          siret:   col('siret'),
          email:   col('email','mail','e-mail'),
          tel:     col('telephone','tel'),
          adresse: col('adresse','adresse des travaux'),
          cp:      col('code postal','cp','code_postal'),
          ville:   col('ville'),
          fiche:   col('code fiche','code fiche operation','fiche','operation'),
          volume:  col('volume (kwh cumac)','volume kwh cumac','volume','kwh cumac','cumac','volume_kwh'),
          statut:  col('statut','statut cee','statut_cee')
        };
        const normStatut = v => { v = norm(v);
          if (v.startsWith('eng'))    return 'engage';
          if (v.startsWith('contr'))  return 'controle';
          if (v.startsWith('valid'))  return 'valide';
          if (v.startsWith('factur')) return 'facture';
          return null; };
        const get = (row, i) => (i >= 0 && i < row.length) ? String(row[i] || '').trim() : '';
        const dataRows = rows.slice(1).filter(r => r.some(c => String(c||'').trim()));
        let created = 0, updated = 0; const errors = [];
        for (let idx = 0; idx < dataRows.length; idx++) {
          const row = dataRows[idx], ln = idx + 2;
          try {
            const code = get(row, ci.code);
            const nom = get(row, ci.nom), prenom = get(row, ci.prenom), rs = get(row, ci.rs);
            const statut = normStatut(get(row, ci.statut));
            const volume = parseFloat(get(row, ci.volume).replace(/[  ]/g,'').replace(',','.')) || 0;
            const fiche = get(row, ci.fiche);
            let existing = null;
            if (code) {
              let q = 'SELECT id FROM beneficiaires WHERE code=? AND partenaire=? AND archived=0';
              const qp = [code, s.partenaire_nom];
              if (s.role === 'apporteur') { q += ' AND apporteur_id=?'; qp.push(s.id); }
              existing = await dbGet(q, qp);
            }
            if (existing) {
              if (statut) await dbRun('UPDATE beneficiaires SET statut_cee=?,updated_at=CURRENT_TIMESTAMP WHERE id=?', [statut, existing.id]);
              if (volume > 0) {
                const op = await dbGet('SELECT id FROM cee_operations WHERE beneficiaire_id=? LIMIT 1', [existing.id]);
                if (op) await dbRun('UPDATE cee_operations SET volume_kwh=?,updated_at=CURRENT_TIMESTAMP WHERE id=?', [volume, op.id]);
                else    await dbRun("INSERT INTO cee_operations (beneficiaire_id,code_fiche,nom_operation,volume_kwh,statut) VALUES (?,?,?,?,'en_cours')", [existing.id, fiche, fiche || 'Import', volume]);
              }
              updated++;
            } else {
              if (!nom && !rs) { errors.push({ ligne: ln, message: 'Ni nom ni raison sociale — ligne ignorée' }); continue; }
              const newCode = await generateUniqueCode();
              const r = await dbRun(`INSERT INTO beneficiaires (code,nom,prenom,email,telephone,raison_sociale,siret,adresse,code_postal,ville,partenaire,statut,statut_cee,apporteur_id)
                                     VALUES (?,?,?,?,?,?,?,?,?,?,?,'en_attente',?,?)`,
                [newCode, nom || rs, prenom, get(row,ci.email), get(row,ci.tel), rs, get(row,ci.siret),
                 get(row,ci.adresse), get(row,ci.cp), get(row,ci.ville), s.partenaire_nom,
                 statut || 'engage', s.role === 'apporteur' ? s.id : null]);
              if (volume > 0 || fiche) {
                await dbRun("INSERT INTO cee_operations (beneficiaire_id,code_fiche,nom_operation,volume_kwh,statut) VALUES (?,?,?,?,'en_cours')",
                  [r.lastID, fiche, fiche || 'Import', volume]);
              }
              created++;
            }
          } catch(e) { errors.push({ ligne: ln, message: e.message }); }
        }
        res.json({ success: true, total: dataRows.length, created, updated, errors });
      } catch(e) { res.status(500).json({ error: e.message }); }
    });
  });
});

// ═══ Communication partenaire — annonces, messagerie, modèles ════════════════
app.get('/api/partner/annonces', requirePartner, (req, res) => {
  db.all('SELECT id,titre,contenu,niveau,created_at FROM annonces ORDER BY created_at DESC LIMIT 50', [],
    (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows || []));
});
app.get('/api/partner/modeles', requirePartner, (req, res) => {
  db.all('SELECT id,categorie,titre,contenu FROM comm_modeles ORDER BY categorie,titre', [],
    (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows || []));
});
app.get('/api/partner/messages', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    db.all('SELECT id,auteur,nom_auteur,contenu,created_at FROM messages_partenaire WHERE partenaire_id=? ORDER BY created_at',
      [s.partenaire_id], (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows || []));
  });
});
app.post('/api/partner/messages', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    const contenu = String(req.body.contenu || '').trim();
    if (!contenu) return res.status(400).json({ error: 'Message vide' });
    db.run('INSERT INTO messages_partenaire (partenaire_id,auteur,nom_auteur,contenu) VALUES (?,?,?,?)',
      [s.partenaire_id, 'partenaire', s.compte_nom || s.partenaire_nom, contenu], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const t = getTransporter();
        if (t && process.env.SMTP_USER) {
          t.sendMail({ from: `"EchoWAI Plateforme" <${process.env.SMTP_USER}>`, to: process.env.SMTP_USER,
            subject: `Message partenaire — ${s.partenaire_nom}`,
            text: `De : ${s.compte_nom || ''} (${s.partenaire_nom})\n\n${contenu}` }).catch(() => {});
        }
        res.json({ success: true, id: this.lastID });
      });
  });
});
// Communication bénéficiaires — le partenaire envoie un email à l'un de ses bénéficiaires
app.post('/api/partner/contact-beneficiaire', requireRole('admin_partenaire','apporteur'), (req, res) => {
  partnerScope(req, res, (s) => {
    const { beneficiaire_id, sujet, message } = req.body;
    if (!beneficiaire_id || !String(sujet||'').trim() || !String(message||'').trim())
      return res.status(400).json({ error: 'Bénéficiaire, sujet et message requis' });
    const f = dossierFilter(s);
    db.get(`SELECT b.email,b.nom,b.prenom FROM beneficiaires b WHERE ${f.where} AND b.id=?`,
      [...f.params, beneficiaire_id], (err, b) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!b) return res.status(404).json({ error: 'Bénéficiaire hors de votre périmètre' });
        if (!b.email) return res.status(400).json({ error: "Ce bénéficiaire n'a pas d'adresse email" });
        const t = getTransporter();
        if (!t) return res.status(400).json({ error: 'Service email non configuré sur le serveur' });
        const safe = String(message).replace(/[<>&]/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;' }[c]));
        t.sendMail({
          from: `"${s.partenaire_nom}" <${process.env.SMTP_USER}>`, to: b.email,
          subject: String(sujet).trim(),
          html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;white-space:pre-wrap">${safe}</div>`
        }).then(() => res.json({ success: true }))
          .catch(e => res.status(500).json({ error: 'Envoi échoué : ' + e.message }));
      });
  });
});
// Admin — gestion des annonces (UI admin à venir)
app.post('/api/admin/annonces', requireAdmin, (req, res) => {
  const { titre, contenu, niveau } = req.body;
  if (!titre || !contenu) return res.status(400).json({ error: 'Titre et contenu requis' });
  db.run('INSERT INTO annonces (titre,contenu,niveau) VALUES (?,?,?)',
    [titre, contenu, ['info','alerte','nouveaute'].includes(niveau) ? niveau : 'info'],
    function(err) { err ? res.status(500).json({ error: err.message }) : res.json({ success: true, id: this.lastID }); });
});
app.delete('/api/admin/annonces/:id', requireAdmin, (req, res) => {
  db.run('DELETE FROM annonces WHERE id=?', [req.params.id],
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// ── Catalogue matériel central — géré par le super-admin ─────────────────────
app.get('/api/admin/materiel', requireAdmin, (req, res) => {
  db.all(`SELECT id,code_fiche,nom,reference,marque,categorie,unite,prix_achat,prix_vente,tva,
            specs,image_url,stock,seuil_alerte,actif,
            (SELECT COALESCE(SUM(cl.quantite),0) FROM commande_lignes cl
               JOIN commandes co ON co.id=cl.commande_id
               WHERE cl.materiel_id=materiel.id AND co.statut='preparee') AS engage
          FROM materiel ORDER BY code_fiche, nom COLLATE NOCASE`, [],
    (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows || []));
});
app.post('/api/admin/materiel', requireAdmin, (req, res) => {
  const m = req.body;
  if (!m.nom || !String(m.nom).trim()) return res.status(400).json({ error: 'Nom du matériel requis' });
  db.run(`INSERT INTO materiel (partenaire_id,nom,reference,marque,categorie,unite,code_fiche,
            prix_achat,prix_vente,tva,specs,image_url,stock,seuil_alerte,actif)
          VALUES (0,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`,
    [String(m.nom).trim(), m.reference||'', m.marque||'', m.categorie||'', m.unite||'unité', m.code_fiche||'',
     parseFloat(m.prix_achat)||0, parseFloat(m.prix_vente)||0, m.tva===undefined?20:(parseFloat(m.tva)||0),
     m.specs||'', m.image_url||'', parseFloat(m.stock)||0, parseFloat(m.seuil_alerte)||0],
    function(err) { err ? res.status(500).json({ error: err.message }) : res.json({ success: true, id: this.lastID }); });
});
app.put('/api/admin/materiel/:id', requireAdmin, (req, res) => {
  const m = req.body, sets = [], vals = [];
  ['nom','reference','marque','categorie','unite','code_fiche','specs','image_url'].forEach(k => {
    if (m[k] !== undefined) { sets.push(k + '=?'); vals.push(String(m[k] || '')); }
  });
  ['prix_achat','prix_vente','tva','stock','seuil_alerte'].forEach(k => {
    if (m[k] !== undefined) { sets.push(k + '=?'); vals.push(parseFloat(m[k]) || 0); }
  });
  if (m.actif !== undefined) { sets.push('actif=?'); vals.push(m.actif ? 1 : 0); }
  if (!sets.length) return res.status(400).json({ error: 'Aucune modification' });
  vals.push(req.params.id);
  db.run(`UPDATE materiel SET ${sets.join(',')} WHERE id=?`, vals,
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});
app.delete('/api/admin/materiel/:id', requireAdmin, (req, res) => {
  db.run('DELETE FROM materiel WHERE id=?', [req.params.id],
    err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});
// Suivi de stock — mouvements
app.get('/api/admin/stock-mouvements', requireAdmin, (req, res) => {
  const where = [], vals = [];
  if (req.query.materiel_id) { where.push('sm.materiel_id=?'); vals.push(req.query.materiel_id); }
  db.all(`SELECT sm.id,sm.materiel_id,sm.type,sm.quantite,sm.motif,sm.commande_id,sm.created_at,
            m.nom AS materiel_nom, m.code_fiche
          FROM stock_mouvements sm LEFT JOIN materiel m ON m.id=sm.materiel_id
          ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
          ORDER BY sm.created_at DESC, sm.id DESC LIMIT 100`, vals,
    (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows || []));
});
app.post('/api/admin/stock-mouvements', requireAdmin, (req, res) => {
  const b = req.body, mid = parseInt(b.materiel_id);
  const q = Math.abs(parseFloat(b.quantite) || 0);
  if (!mid || !q) return res.status(400).json({ error: 'Matériel et quantité requis' });
  const type = b.type === 'sortie' ? 'sortie' : 'entree';
  const delta = type === 'sortie' ? -q : q;
  db.run('UPDATE materiel SET stock=stock+? WHERE id=?', [delta, mid], err => {
    if (err) return res.status(500).json({ error: err.message });
    db.run('INSERT INTO stock_mouvements (materiel_id,type,quantite,motif) VALUES (?,?,?,?)',
      [mid, type, delta, String(b.motif || 'Ajustement manuel')],
      e => e ? res.status(500).json({ error: e.message }) : res.json({ success: true }));
  });
});

// Dépôt d'un dossier par un partenaire / apporteur
app.post('/api/partner/dossiers', requireRole('admin_partenaire','apporteur'), (req, res) => {
  partnerScope(req, res, async (s) => {
    try {
      const b = req.body;
      if (!b.nom || !b.nom.trim() || !b.prenom || !b.prenom.trim())
        return res.status(400).json({ error: 'Nom et prénom requis' });
      const code = await generateUniqueCode();
      let opId = parseInt(b.operation_id) || null;
      if (opId && s.role === 'apporteur') {
        let ids = []; try { ids = JSON.parse(s.operations || '[]'); } catch(e) {}
        if (!ids.includes(opId)) opId = null;
      }
      const delId = parseInt(b.delegataire_id) || null;
      const instId = parseInt(b.installateur_id) || null;
      db.run(`INSERT INTO beneficiaires (code,nom,prenom,email,telephone,raison_sociale,siret,adresse,code_postal,ville,activite,partenaire,apporteur_id,operation_id,delegataire_id,installateur_id)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [code, b.nom.trim(), b.prenom.trim(), b.email||'', b.telephone||'', b.raison_sociale||'', b.siret||'',
         b.adresse||'', b.code_postal||'', b.ville||'', b.activite||'', s.partenaire_nom, s.id, opId, delId, instId],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          db.run(`INSERT INTO activity_logs (beneficiaire_id,action,details,auteur) VALUES (?,?,?,?)`,
            [this.lastID, 'dossier_depose', 'Dossier déposé via l\'espace partenaire', s.compte_nom || s.partenaire_nom]);
          res.json({ success: true, code });
        });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
});

// ── Gestion d'équipe (Admin Partenaire) ──────────────────────────────────────
app.get('/api/partner/team', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    db.all(`SELECT id,role,nom,email,actif,commission_mode,commission_valeur,operations,last_login,created_at
            FROM comptes WHERE partenaire_id=? ORDER BY role,nom`,
      [s.partenaire_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all(`SELECT aoc.apporteur_id, aoc.operation_id, aoc.commission_mode, aoc.commission_valeur
                FROM apporteur_operations_comm aoc
                JOIN comptes c ON c.id=aoc.apporteur_id
                WHERE c.partenaire_id=?`, [s.partenaire_id], (e2, comm) => {
          const byApp = {};
          (comm || []).forEach(c => { (byApp[c.apporteur_id] = byApp[c.apporteur_id] || []).push(c); });
          (rows || []).forEach(r => { r.op_commissions = byApp[r.id] || []; });
          res.json(rows || []);
        });
      });
  });
});
app.post('/api/partner/team', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const { nom, email, password } = req.body;
    if (!nom || !email || !password) return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
    if (String(password).length < 6)  return res.status(400).json({ error: 'Mot de passe : 6 caractères minimum' });
    const cmode = COMMISSION_MODES.includes(req.body.commission_mode) ? req.body.commission_mode : 'pct';
    const cval  = parseFloat(req.body.commission_valeur) || 0;
    const role = req.body.role === 'installateur' ? 'installateur' : 'apporteur';
    db.get('SELECT id FROM comptes WHERE lower(email)=lower(?)', [String(email).trim()], (e, exist) => {
      if (exist) return res.status(409).json({ error: 'Cet email est déjà utilisé' });
      db.run(`INSERT INTO comptes (partenaire_id,role,nom,email,password_hash,actif,commission_mode,commission_valeur)
              VALUES (?,?,?,?,?,1,?,?)`,
        [s.partenaire_id, role, nom.trim(), String(email).trim().toLowerCase(), hashPassword(password), cmode, cval],
        err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
    });
  });
});
app.put('/api/partner/team/:id', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const { nom, password, actif, commission_mode, commission_valeur } = req.body;
    const sets = [], vals = [];
    if (nom !== undefined)   { sets.push('nom=?');   vals.push(String(nom).trim()); }
    if (actif !== undefined) { sets.push('actif=?'); vals.push(actif ? 1 : 0); }
    if (commission_mode !== undefined)  { sets.push('commission_mode=?');  vals.push(COMMISSION_MODES.includes(commission_mode) ? commission_mode : 'pct'); }
    if (commission_valeur !== undefined){ sets.push('commission_valeur=?'); vals.push(parseFloat(commission_valeur) || 0); }
    if (req.body.operations !== undefined) {
      const ids = Array.isArray(req.body.operations) ? req.body.operations.map(Number).filter(n => n > 0) : [];
      sets.push('operations=?'); vals.push(JSON.stringify(ids));
    }
    if (password) {
      if (String(password).length < 6) return res.status(400).json({ error: 'Mot de passe : 6 caractères minimum' });
      sets.push('password_hash=?'); vals.push(hashPassword(password));
    }
    if (!sets.length) return res.status(400).json({ error: 'Aucune modification' });
    vals.push(req.params.id, s.partenaire_id);
    db.run(`UPDATE comptes SET ${sets.join(',')} WHERE id=? AND partenaire_id=? AND role IN ('apporteur','installateur')`, vals,
      err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
  });
});
// Installateurs de l'organisation — pour rattacher un dossier (dépôt)
app.get('/api/partner/installateurs', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    db.all("SELECT id,nom FROM comptes WHERE partenaire_id=? AND role='installateur' AND actif=1 ORDER BY nom COLLATE NOCASE",
      [s.partenaire_id], (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows || []));
  });
});
// Commission personnalisée d'un apporteur sur une opération — surcharge la commission de l'opération
app.put('/api/partner/team/:id/op-commission', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const apporteurId = parseInt(req.params.id);
    const operationId = parseInt(req.body.operation_id);
    if (!apporteurId || !operationId) return res.status(400).json({ error: 'Apporteur et opération requis' });
    db.get(`SELECT id FROM comptes WHERE id=? AND partenaire_id=? AND role='apporteur'`, [apporteurId, s.partenaire_id], (e1, app) => {
      if (e1)  return res.status(500).json({ error: e1.message });
      if (!app) return res.status(404).json({ error: 'Apporteur introuvable' });
      db.get('SELECT id FROM partenaire_operations WHERE id=? AND partenaire_id=?', [operationId, s.partenaire_id], (e2, op) => {
        if (e2)  return res.status(500).json({ error: e2.message });
        if (!op) return res.status(404).json({ error: 'Opération hors de votre catalogue' });
        if (req.body.reset) {
          db.run('DELETE FROM apporteur_operations_comm WHERE apporteur_id=? AND operation_id=?', [apporteurId, operationId],
            err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true, reset: true }));
        } else {
          const mode = COMMISSION_MODES.includes(req.body.commission_mode) ? req.body.commission_mode : 'pct';
          const val  = parseFloat(req.body.commission_valeur) || 0;
          db.run(`INSERT INTO apporteur_operations_comm (apporteur_id,operation_id,commission_mode,commission_valeur)
                  VALUES (?,?,?,?)
                  ON CONFLICT(apporteur_id,operation_id) DO UPDATE SET
                    commission_mode=excluded.commission_mode, commission_valeur=excluded.commission_valeur`,
            [apporteurId, operationId, mode, val],
            err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
        }
      });
    });
  });
});

// ── Délégataires — répertoire national + sélection du partenaire ─────────────
app.get('/api/partner/delegataires', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    db.all('SELECT id,nom FROM delegataires WHERE actif=1 ORDER BY nom COLLATE NOCASE', [], (e1, repertoire) => {
      if (e1) return res.status(500).json({ error: e1.message });
      db.all('SELECT id,delegataire_id,prix_mwhc,actif FROM partenaire_delegataires WHERE partenaire_id=?',
        [s.partenaire_id], (e2, sel) => {
          if (e2) return res.status(500).json({ error: e2.message });
          res.json({ repertoire: repertoire || [], selection: sel || [] });
        });
    });
  });
});
app.post('/api/partner/delegataires', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const did = parseInt(req.body.delegataire_id);
    if (!did) return res.status(400).json({ error: 'Délégataire requis' });
    db.get('SELECT id FROM delegataires WHERE id=? AND actif=1', [did], (e, d) => {
      if (e)  return res.status(500).json({ error: e.message });
      if (!d) return res.status(404).json({ error: 'Délégataire introuvable' });
      db.run(`INSERT INTO partenaire_delegataires (partenaire_id,delegataire_id,prix_mwhc) VALUES (?,?,?)
              ON CONFLICT(partenaire_id,delegataire_id) DO UPDATE SET actif=1, prix_mwhc=excluded.prix_mwhc`,
        [s.partenaire_id, did, parseFloat(req.body.prix_mwhc) || 0],
        err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
    });
  });
});
app.put('/api/partner/delegataires/:id', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const sets = [], vals = [];
    if (req.body.prix_mwhc !== undefined) { sets.push('prix_mwhc=?'); vals.push(parseFloat(req.body.prix_mwhc) || 0); }
    if (req.body.actif !== undefined)     { sets.push('actif=?');     vals.push(req.body.actif ? 1 : 0); }
    if (!sets.length) return res.status(400).json({ error: 'Aucune modification' });
    vals.push(req.params.id, s.partenaire_id);
    db.run(`UPDATE partenaire_delegataires SET ${sets.join(',')} WHERE id=? AND partenaire_id=?`, vals,
      err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
  });
});
app.delete('/api/partner/delegataires/:id', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    db.run('DELETE FROM partenaire_delegataires WHERE id=? AND partenaire_id=?', [req.params.id, s.partenaire_id],
      err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
  });
});
// Délégataires retenus — pour le dépôt d'un dossier (admin_partenaire + apporteur)
app.get('/api/partner/my-delegataires', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    db.all(`SELECT pd.delegataire_id, pd.prix_mwhc, d.nom
            FROM partenaire_delegataires pd JOIN delegataires d ON d.id=pd.delegataire_id
            WHERE pd.partenaire_id=? AND pd.actif=1 ORDER BY d.nom COLLATE NOCASE`,
      [s.partenaire_id], (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows || []));
  });
});

// ── Cahier des charges — pièces requises par (délégataire × opération) ───────
// Résout le cahier effectif : personnalisé du partenaire sinon base standard
function getCdc(partenaireId, delegataireId, operationId, cb) {
  db.all(`SELECT id,nom,fourni_par,obligatoire,ordre FROM cdc_pieces
          WHERE partenaire_id=? AND delegataire_id=? AND operation_id=? ORDER BY ordre,id`,
    [partenaireId, delegataireId, operationId], (e, custom) => {
      if (e) return cb(e);
      if (custom && custom.length) return cb(null, { personnalise: true, pieces: custom });
      db.all(`SELECT id,nom,fourni_par,obligatoire,ordre FROM cdc_pieces
              WHERE partenaire_id IS NULL AND delegataire_id IS NULL AND operation_id IS NULL ORDER BY ordre,id`,
        [], (e2, base) => e2 ? cb(e2) : cb(null, { personnalise: false, pieces: base || [] }));
    });
}
app.get('/api/partner/cdc', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const did = parseInt(req.query.delegataire_id), oid = parseInt(req.query.operation_id);
    if (!did || !oid) return res.status(400).json({ error: 'Délégataire et opération requis' });
    getCdc(s.partenaire_id, did, oid, (e, r) => e ? res.status(500).json({ error: e.message }) : res.json(r));
  });
});
app.put('/api/partner/cdc', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const did = parseInt(req.body.delegataire_id), oid = parseInt(req.body.operation_id);
    if (!did || !oid) return res.status(400).json({ error: 'Délégataire et opération requis' });
    const pieces = Array.isArray(req.body.pieces) ? req.body.pieces : [];
    db.run('DELETE FROM cdc_pieces WHERE partenaire_id=? AND delegataire_id=? AND operation_id=?',
      [s.partenaire_id, did, oid], (e) => {
        if (e) return res.status(500).json({ error: e.message });
        if (!pieces.length) return res.json({ success: true });
        const st = db.prepare('INSERT INTO cdc_pieces (partenaire_id,delegataire_id,operation_id,nom,fourni_par,obligatoire,ordre) VALUES (?,?,?,?,?,?,?)');
        pieces.forEach((p, i) => {
          const nom = String(p.nom || '').trim();
          if (!nom) return;
          st.run(s.partenaire_id, did, oid, nom, p.fourni_par === 'beneficiaire' ? 'beneficiaire' : 'partenaire', p.obligatoire ? 1 : 0, i);
        });
        st.finalize(err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
      });
  });
});
app.delete('/api/partner/cdc', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const did = parseInt(req.query.delegataire_id), oid = parseInt(req.query.operation_id);
    if (!did || !oid) return res.status(400).json({ error: 'Délégataire et opération requis' });
    db.run('DELETE FROM cdc_pieces WHERE partenaire_id=? AND delegataire_id=? AND operation_id=?',
      [s.partenaire_id, did, oid], err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
  });
});

// ── Catalogue matériel + sélection par dossier ───────────────────────────────
app.get('/api/partner/materiel', requirePartner, (req, res) => {
  const cf = (req.query.code_fiche || '').trim();
  let where = 'actif=1'; const params = [];
  if (cf) { where += ' AND code_fiche=?'; params.push(cf); }
  db.all(`SELECT id,code_fiche,nom,reference,marque,categorie,unite,prix_vente,tva,specs,image_url
          FROM materiel WHERE ${where} ORDER BY code_fiche, nom COLLATE NOCASE`, params,
    (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows || []));
});
app.post('/api/partner/materiel', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const m = req.body;
    if (!m.nom || !String(m.nom).trim()) return res.status(400).json({ error: 'Nom du matériel requis' });
    db.run(`INSERT INTO materiel (partenaire_id,operation_id,nom,reference,marque,categorie,unite,actif)
            VALUES (?,?,?,?,?,?,?,1)`,
      [s.partenaire_id, parseInt(m.operation_id) || null, String(m.nom).trim(), m.reference||'', m.marque||'',
       m.categorie||'', m.unite||'unité'],
      function(err) { err ? res.status(500).json({ error: err.message }) : res.json({ success: true, id: this.lastID }); });
  });
});
app.put('/api/partner/materiel/:id', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const m = req.body, sets = [], vals = [];
    ['nom','reference','marque','categorie','unite'].forEach(k => {
      if (m[k] !== undefined) { sets.push(k + '=?'); vals.push(String(m[k] || '')); }
    });
    if (m.operation_id !== undefined) { sets.push('operation_id=?'); vals.push(parseInt(m.operation_id) || null); }
    if (m.actif !== undefined)        { sets.push('actif=?');        vals.push(m.actif ? 1 : 0); }
    if (!sets.length) return res.status(400).json({ error: 'Aucune modification' });
    vals.push(req.params.id, s.partenaire_id);
    db.run(`UPDATE materiel SET ${sets.join(',')} WHERE id=? AND partenaire_id=?`, vals,
      err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
  });
});
app.delete('/api/partner/materiel/:id', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    db.run('DELETE FROM materiel WHERE id=? AND partenaire_id=?', [req.params.id, s.partenaire_id],
      err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
  });
});
// Matériel d'un dossier — catalogue disponible pour son opération + quantités sélectionnées
app.get('/api/partner/dossiers/:id/materiel', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    const f = dossierFilter(s);
    db.get(`SELECT b.id, po.code_fiche AS fiche FROM beneficiaires b
            LEFT JOIN partenaire_operations po ON po.id=b.operation_id
            WHERE ${f.where} AND b.id=?`,
      [...f.params, req.params.id], (e, b) => {
        if (e)  return res.status(500).json({ error: e.message });
        if (!b) return res.status(404).json({ error: 'Dossier hors de votre périmètre' });
        db.all(`SELECT m.id,m.nom,m.reference,m.marque,m.categorie,m.unite,m.prix_vente,m.image_url,
                  (SELECT quantite FROM dossier_materiel WHERE beneficiaire_id=? AND materiel_id=m.id) AS quantite
                FROM materiel m
                WHERE m.actif=1 AND (m.code_fiche=? OR m.code_fiche='' OR m.code_fiche IS NULL)
                ORDER BY m.nom COLLATE NOCASE`,
          [b.id, b.fiche || ''], (e2, rows) =>
            e2 ? res.status(500).json({ error: e2.message }) : res.json(rows || []));
      });
  });
});
app.put('/api/partner/dossiers/:id/materiel', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    const f = dossierFilter(s);
    db.get(`SELECT b.id FROM beneficiaires b WHERE ${f.where} AND b.id=?`, [...f.params, req.params.id], (e, b) => {
      if (e)  return res.status(500).json({ error: e.message });
      if (!b) return res.status(404).json({ error: 'Dossier hors de votre périmètre' });
      const items = Array.isArray(req.body.items) ? req.body.items : [];
      db.run('DELETE FROM dossier_materiel WHERE beneficiaire_id=?', [b.id], (e2) => {
        if (e2) return res.status(500).json({ error: e2.message });
        const valid = items.filter(it => parseInt(it.materiel_id) && parseFloat(it.quantite) > 0);
        if (!valid.length) return res.json({ success: true });
        const st = db.prepare('INSERT OR REPLACE INTO dossier_materiel (beneficiaire_id,materiel_id,quantite) VALUES (?,?,?)');
        valid.forEach(it => st.run(b.id, parseInt(it.materiel_id), parseFloat(it.quantite)));
        st.finalize(err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
      });
    });
  });
});
// Affectation de matériel en masse — à tous les dossiers d'une opération
app.post('/api/partner/materiel/affecter-masse', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const opId = parseInt(req.body.operation_id), matId = parseInt(req.body.materiel_id);
    const qte = parseFloat(req.body.quantite) || 1;
    if (!opId || !matId) return res.status(400).json({ error: 'Opération et matériel requis' });
    db.all('SELECT id FROM beneficiaires WHERE partenaire=? AND operation_id=? AND archived=0',
      [s.partenaire_nom, opId], (e, rows) => {
        if (e) return res.status(500).json({ error: e.message });
        const ids = (rows || []).map(r => r.id);
        if (!ids.length) return res.json({ success: true, count: 0 });
        const st = db.prepare('INSERT OR REPLACE INTO dossier_materiel (beneficiaire_id,materiel_id,quantite) VALUES (?,?,?)');
        ids.forEach(id => st.run(id, matId, qte));
        st.finalize(err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true, count: ids.length }));
      });
  });
});

// ── Commandes de matériel ─────────────────────────────────────────────────────
function genCmdRef() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = 'CMD-'; for (let i = 0; i < 6; i++) r += c[Math.floor(Math.random() * c.length)];
  return r;
}
const CMD_STATUTS = ['preparee','commandee','expediee','livree','annulee'];
const LIV_TYPES   = ['entrepot','beneficiaire','partenaire','chantier'];

app.post('/api/partner/commandes', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const ids = Array.isArray(req.body.beneficiaire_ids) ? req.body.beneficiaire_ids.map(Number).filter(Boolean) : [];
    if (!ids.length) return res.status(400).json({ error: 'Sélectionnez au moins un dossier' });
    const livType = LIV_TYPES.includes(req.body.livraison_type) ? req.body.livraison_type : 'entrepot';
    const ph = ids.map(() => '?').join(',');
    db.all(`SELECT dm.beneficiaire_id, dm.materiel_id, dm.quantite, m.nom, m.prix_vente, m.tva
            FROM dossier_materiel dm
            JOIN beneficiaires b ON b.id=dm.beneficiaire_id
            JOIN materiel m ON m.id=dm.materiel_id
            WHERE b.partenaire=? AND dm.beneficiaire_id IN (${ph})`,
      [s.partenaire_nom, ...ids], (e, lignes) => {
        if (e) return res.status(500).json({ error: e.message });
        if (!lignes || !lignes.length) return res.status(400).json({ error: 'Aucun matériel sélectionné sur ces dossiers' });
        db.run(`INSERT INTO commandes (partenaire_id,reference,statut,livraison_type,livraison_adresse,notes,created_by,reste_a_charge)
                VALUES (?,?,'preparee',?,?,?,?,?)`,
          [s.partenaire_id, genCmdRef(), livType, req.body.livraison_adresse || '', req.body.notes || '',
           s.compte_nom || s.partenaire_nom, parseFloat(req.body.reste_a_charge) || 0],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });
            const cid = this.lastID;
            const st = db.prepare('INSERT INTO commande_lignes (commande_id,beneficiaire_id,materiel_id,nom,quantite,prix_unitaire,tva) VALUES (?,?,?,?,?,?,?)');
            lignes.forEach(l => st.run(cid, l.beneficiaire_id, l.materiel_id, l.nom, l.quantite, l.prix_vente || 0, l.tva == null ? 20 : l.tva));
            st.finalize(e2 => e2 ? res.status(500).json({ error: e2.message }) : res.json({ success: true, id: cid }));
          });
      });
  });
});
app.get('/api/partner/commandes', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    db.all(`SELECT c.id,c.reference,c.statut,c.livraison_type,c.reste_a_charge,c.created_at,
              (SELECT COUNT(*) FROM commande_lignes WHERE commande_id=c.id) AS nb_lignes,
              (SELECT COALESCE(SUM(quantite*prix_unitaire*(1+tva/100.0)),0) FROM commande_lignes WHERE commande_id=c.id) AS total_ttc
            FROM commandes c WHERE c.partenaire_id=? ORDER BY c.created_at DESC`,
      [s.partenaire_id], (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows || []));
  });
});
app.get('/api/partner/commandes/:id', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    db.get('SELECT * FROM commandes WHERE id=? AND partenaire_id=?', [req.params.id, s.partenaire_id], (e, c) => {
      if (e)  return res.status(500).json({ error: e.message });
      if (!c) return res.status(404).json({ error: 'Commande introuvable' });
      db.all(`SELECT cl.*, b.code AS dossier_code, b.nom AS benef_nom, b.prenom AS benef_prenom
              FROM commande_lignes cl LEFT JOIN beneficiaires b ON b.id=cl.beneficiaire_id
              WHERE cl.commande_id=?`, [c.id], (e2, lignes) =>
        e2 ? res.status(500).json({ error: e2.message }) : res.json({ ...c, lignes: lignes || [] }));
    });
  });
});
app.put('/api/partner/commandes/:id/statut', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const neu = req.body.statut;
    if (!CMD_STATUTS.includes(neu)) return res.status(400).json({ error: 'Statut invalide' });
    db.get('SELECT statut,reference FROM commandes WHERE id=? AND partenaire_id=?', [req.params.id, s.partenaire_id], (e, c) => {
      if (e)  return res.status(500).json({ error: e.message });
      if (!c) return res.status(404).json({ error: 'Commande introuvable' });
      const consumes  = st => ['commandee','expediee','livree'].includes(st);
      const wasOut    = consumes(c.statut);
      const willOut   = consumes(neu);
      db.run('UPDATE commandes SET statut=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND partenaire_id=?',
        [neu, req.params.id, s.partenaire_id], err => {
          if (err) return res.status(500).json({ error: err.message });
          if (wasOut === willOut) return res.json({ success: true });
          // wasOut=false,willOut=true -> sortie ; wasOut=true,willOut=false -> entree
          const isSortie = willOut;
          db.all('SELECT materiel_id,quantite FROM commande_lignes WHERE commande_id=?', [req.params.id], (e2, ls) => {
            if (e2 || !ls) return res.json({ success: true });
            ls.forEach(l => {
              if (!l.materiel_id) return;
              const q = +l.quantite || 0;
              if (!q) return;
              const delta = isSortie ? -q : q;
              db.run('UPDATE materiel SET stock=stock+? WHERE id=?', [delta, l.materiel_id]);
              db.run(`INSERT INTO stock_mouvements (materiel_id,type,quantite,motif,commande_id)
                      VALUES (?,?,?,?,?)`,
                [l.materiel_id, isSortie ? 'sortie' : 'entree', delta,
                 (isSortie ? 'Commande ' : 'Annulation ') + (c.reference || '#' + req.params.id), req.params.id]);
            });
            res.json({ success: true });
          });
        });
    });
  });
});
app.put('/api/partner/commandes/:id', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const sets = [], vals = [];
    if (req.body.reste_a_charge !== undefined)    { sets.push('reste_a_charge=?');    vals.push(parseFloat(req.body.reste_a_charge) || 0); }
    if (req.body.livraison_adresse !== undefined) { sets.push('livraison_adresse=?'); vals.push(String(req.body.livraison_adresse || '')); }
    if (req.body.livraison_type !== undefined && LIV_TYPES.includes(req.body.livraison_type)) { sets.push('livraison_type=?'); vals.push(req.body.livraison_type); }
    if (!sets.length) return res.status(400).json({ error: 'Aucune modification' });
    sets.push('updated_at=CURRENT_TIMESTAMP');
    vals.push(req.params.id, s.partenaire_id);
    db.run(`UPDATE commandes SET ${sets.join(',')} WHERE id=? AND partenaire_id=?`, vals,
      err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
  });
});
app.delete('/api/partner/commandes/:id', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    db.get('SELECT statut FROM commandes WHERE id=? AND partenaire_id=?', [req.params.id, s.partenaire_id], (e, c) => {
      if (e)  return res.status(500).json({ error: e.message });
      if (!c) return res.status(404).json({ error: 'Commande introuvable' });
      if (c.statut !== 'preparee') return res.status(400).json({ error: 'Seule une commande préparée peut être supprimée' });
      db.run('DELETE FROM commande_lignes WHERE commande_id=?', [req.params.id], () => {
        db.run('DELETE FROM commandes WHERE id=?', [req.params.id],
          err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
      });
    });
  });
});

// Bon de commande / bon de livraison PDF
function renderCommandePdf(res, ctx) {
  const { type, c, lignes, org } = ctx;
  const INK = '#181c24', SOFT = '#5c6470', RULE = '#cdd2db', BAND = '#1f2632';
  const eur = n => (Math.round((+n||0)*100)/100).toLocaleString('fr-FR') + ' €';
  const today = new Date().toLocaleDateString('fr-FR');
  const M = 56, isBC = type === 'bc' || type === 'facture';
  const TITRE = type === 'bc' ? 'BON DE COMMANDE' : type === 'facture' ? 'FACTURE MATÉRIEL' : 'BON DE LIVRAISON';
  const LIV = { entrepot:'Entrepôt', beneficiaire:'Chez le bénéficiaire', partenaire:'Chez le partenaire', chantier:'Sur le chantier' };

  const doc = new PDFDocument({ size:'A4', margin:M, info:{ Title: TITRE + ' ' + c.reference, Author: org.nom || '' } });
  doc.pipe(res);
  const W = doc.page.width - 2 * M, R = M + W;

  doc.font('Helvetica-Bold').fontSize(13).fillColor(INK).text(org.nom || 'Émetteur', M, M, { width: W*0.56 });
  doc.font('Helvetica').fontSize(8.5).fillColor(SOFT);
  [org.adresse, [org.code_postal,org.ville].filter(Boolean).join(' '), org.siret && ('SIRET ' + org.siret), org.telephone]
    .filter(Boolean).forEach(l => doc.text(l, { width: W*0.56 }));
  const lb = doc.y;
  doc.font('Helvetica-Bold').fontSize(18).fillColor(INK).text(TITRE, M, M, { width: W, align:'right' });
  doc.font('Helvetica').fontSize(9).fillColor(SOFT);
  doc.text('Référence  ' + c.reference, { width: W, align:'right' });
  doc.text('Date  ' + today, { width: W, align:'right' });
  let y = Math.max(lb, doc.y) + 18;
  doc.moveTo(M, y).lineWidth(1).strokeColor(RULE).lineTo(R, y).stroke();
  y += 20;

  doc.font('Helvetica-Bold').fontSize(8).fillColor(SOFT).text('LIVRAISON', M, y); y = doc.y + 3;
  doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(LIV[c.livraison_type] || c.livraison_type || '—', M, y, { width: W }); y = doc.y;
  if (c.livraison_adresse) { doc.fontSize(8.5).fillColor(SOFT).text(c.livraison_adresse, M, y, { width: W }); y = doc.y; }
  y += 18;

  const w0 = isBC ? W*0.42 : W*0.66, w1 = isBC ? W*0.13 : W*0.34, w2 = W*0.16, w3 = W*0.10;
  const w4 = W - w0 - w1 - w2 - w3;
  const c1 = M+w0, c2 = c1+w1, c3 = c2+w2, c4 = c3+w3;
  doc.rect(M, y, W, 19).fill(BAND);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#ffffff');
  doc.text('DÉSIGNATION', M+7, y+6, { width: w0-10 });
  doc.text('QUANTITÉ', c1, y+6, { width: w1-7, align: isBC?'right':'left' });
  if (isBC) {
    doc.text('PRIX U. HT', c2, y+6, { width: w2-7, align:'right' });
    doc.text('TVA', c3, y+6, { width: w3-7, align:'right' });
    doc.text('TOTAL HT', c4, y+6, { width: w4-7, align:'right' });
  }
  y += 19;
  let totHT = 0, totTVA = 0;
  (lignes || []).forEach(l => {
    const lineHT = (+l.quantite||0) * (+l.prix_unitaire||0);
    totHT += lineHT; totTVA += lineHT * (+l.tva||0) / 100;
    doc.rect(M, y, W, 24).lineWidth(.6).strokeColor(RULE).stroke();
    doc.font('Helvetica').fontSize(8.5).fillColor(INK).text(l.nom || '—', M+7, y+8, { width: w0-12 });
    doc.text(String(l.quantite || 0), c1, y+8, { width: w1-7, align: isBC?'right':'left' });
    if (isBC) {
      doc.text(eur(l.prix_unitaire), c2, y+8, { width: w2-7, align:'right' });
      doc.text((+l.tva||0) + ' %', c3, y+8, { width: w3-7, align:'right' });
      doc.text(eur(lineHT), c4, y+8, { width: w4-7, align:'right' });
    }
    y += 24;
  });
  y += 16;

  if (type === 'bc' || type === 'facture') {
    const tw = W*0.46, tx = R-tw;
    const row = (lab, val, strong) => {
      if (strong) { doc.rect(tx, y, tw, 24).fill(BAND); }
      doc.font(strong?'Helvetica-Bold':'Helvetica').fontSize(strong?10:9).fillColor(strong?'#ffffff':INK);
      doc.text(lab, tx+10, y + (strong?8:2), { width: tw*0.62 });
      doc.text(val, tx+tw*0.38, y + (strong?8:2), { width: tw*0.62-10, align:'right' });
      y += strong ? 24 : 16;
    };
    if (type === 'bc') {
      row('Total HT', eur(totHT));
      row('TVA', eur(totTVA));
      row('TOTAL TTC', eur(totHT + totTVA), true);
    } else {
      const reste = +c.reste_a_charge || 0;
      row('Total matériel TTC', eur(totHT + totTVA));
      row('Pris en charge — Certificats d\'Économies d\'Énergie', eur(-(totHT + totTVA)));
      row('NET À PAYER', eur(0), true);
      y += 12;
      doc.font('Helvetica').fontSize(9).fillColor(INK)
        .text('Reste à charge partenaire : ' + eur(reste), M, y, { width: W }); y = doc.y + 6;
      doc.font('Helvetica').fontSize(8.5).fillColor(SOFT)
        .text("Matériel valorisé au titre du dispositif des Certificats d'Économies d'Énergie. Aucune somme n'est facturée au bénéficiaire.", M, y, { width: W, align:'justify', lineGap:2 });
    }
  } else {
    doc.font('Helvetica').fontSize(8.5).fillColor(SOFT).text('Réception — date et signature :', M, y); y = doc.y + 6;
    doc.rect(M, y, W*0.5, 72).lineWidth(.8).strokeColor(RULE).stroke();
  }

  const fy = doc.page.height - M - 24;
  doc.moveTo(M, fy).lineWidth(.7).strokeColor(RULE).lineTo(R, fy).stroke();
  const legal = [org.nom, org.siret && ('SIRET ' + org.siret), [org.code_postal,org.ville].filter(Boolean).join(' ')]
    .filter(Boolean).join('   —   ');
  doc.font('Helvetica').fontSize(7).fillColor(SOFT).text(legal || '', M, fy+6, { width: W, align:'center' });
  doc.end();
}
app.get('/api/partner/commandes/:id/document/:type', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const type = String(req.params.type || '').toLowerCase();
    if (!['bc','bl','facture'].includes(type)) return res.status(400).json({ error: 'Type de document inconnu' });
    db.get('SELECT * FROM commandes WHERE id=? AND partenaire_id=?', [req.params.id, s.partenaire_id], (e, c) => {
      if (e)  return res.status(500).json({ error: e.message });
      if (!c) return res.status(404).json({ error: 'Commande introuvable' });
      db.all('SELECT * FROM commande_lignes WHERE commande_id=?', [c.id], (e2, lignes) => {
        if (e2) return res.status(500).json({ error: e2.message });
        db.get('SELECT * FROM partenaires WHERE id=?', [s.partenaire_id], (e3, org) => {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${type}-${c.reference}.pdf"`);
          renderCommandePdf(res, { type, c, lignes: lignes || [], org: org || {} });
        });
      });
    });
  });
});

// ── Catalogue d'opérations (Admin Partenaire) ────────────────────────────────
app.get('/api/partner/operations', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    db.all(`SELECT id,code_fiche,nom,secteur,commission_mode,commission_valeur,actif
            FROM partenaire_operations WHERE partenaire_id=? ORDER BY secteur,code_fiche`,
      [s.partenaire_id], (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows || []));
  });
});
app.post('/api/partner/operations', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const { code_fiche, nom, secteur } = req.body;
    if (!code_fiche) return res.status(400).json({ error: 'Code fiche requis' });
    db.get('SELECT id FROM partenaire_operations WHERE partenaire_id=? AND code_fiche=?',
      [s.partenaire_id, code_fiche], (e, exist) => {
        if (exist) return res.status(409).json({ error: 'Opération déjà dans votre catalogue' });
        const cmode = COMMISSION_MODES.includes(req.body.commission_mode) ? req.body.commission_mode : 'pct';
        db.run(`INSERT INTO partenaire_operations (partenaire_id,code_fiche,nom,secteur,commission_mode,commission_valeur,actif)
                VALUES (?,?,?,?,?,?,1)`,
          [s.partenaire_id, String(code_fiche).toUpperCase(), nom || '', secteur || '', cmode, parseFloat(req.body.commission_valeur) || 0],
          function(err) { err ? res.status(500).json({ error: err.message }) : res.json({ success: true, id: this.lastID }); });
      });
  });
});
app.put('/api/partner/operations/:id', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    const sets = [], vals = [];
    if (req.body.commission_mode !== undefined)  { sets.push('commission_mode=?');  vals.push(COMMISSION_MODES.includes(req.body.commission_mode) ? req.body.commission_mode : 'pct'); }
    if (req.body.commission_valeur !== undefined){ sets.push('commission_valeur=?'); vals.push(parseFloat(req.body.commission_valeur) || 0); }
    if (req.body.actif !== undefined)            { sets.push('actif=?'); vals.push(req.body.actif ? 1 : 0); }
    if (!sets.length) return res.status(400).json({ error: 'Aucune modification' });
    vals.push(req.params.id, s.partenaire_id);
    db.run(`UPDATE partenaire_operations SET ${sets.join(',')} WHERE id=? AND partenaire_id=?`, vals,
      err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
  });
});
app.delete('/api/partner/operations/:id', requireRole('admin_partenaire'), (req, res) => {
  partnerScope(req, res, (s) => {
    db.run('DELETE FROM partenaire_operations WHERE id=? AND partenaire_id=?', [req.params.id, s.partenaire_id],
      err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
  });
});
// Opérations disponibles au dépôt — apporteur : les siennes ; admin_partenaire : catalogue actif
app.get('/api/partner/my-operations', requirePartner, (req, res) => {
  partnerScope(req, res, (s) => {
    db.all(`SELECT id,code_fiche,nom,secteur,commission_mode,commission_valeur
            FROM partenaire_operations WHERE partenaire_id=? AND actif=1 ORDER BY secteur,code_fiche`,
      [s.partenaire_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        rows = rows || [];
        if (s.role === 'apporteur') {
          let ids = []; try { ids = JSON.parse(s.operations || '[]'); } catch(e) {}
          rows = rows.filter(o => ids.includes(o.id));
        }
        res.json(rows);
      });
  });
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

// ── Lookup SIRET → raison sociale (proxy annuaire-entreprises.data.gouv.fr) ──
app.get('/api/siret/:siret', requireAdmin, (req, res) => {
  const siret = req.params.siret.replace(/\s/g, '');
  if (!/^\d{14}$/.test(siret)) return res.status(400).json({ error: 'SIRET invalide (14 chiffres requis)' });

  const url = `https://api.annuaire-entreprises.data.gouv.fr/api/v3/etablissement/${siret}`;
  const opts = { headers: { 'User-Agent': 'EchoWAI-CEE-Platform/2.0', 'Accept': 'application/json' } };

  https.get(url, opts, (resp) => {
    let data = '';
    resp.on('data', c => data += c);
    resp.on('end', () => {
      try {
        const json = JSON.parse(data);
        // Denomination : unite_legale.denomination ou nom_commercial ou fallback prenom/nom dirigeant
        const ul = json.unite_legale || {};
        const denomination =
          ul.denomination ||
          json.nom_commercial ||
          (ul.prenom_usuel && ul.nom ? `${ul.prenom_usuel} ${ul.nom}` : null) ||
          ul.nom ||
          null;
        if (!denomination) return res.status(404).json({ error: 'Aucune dénomination trouvée pour ce SIRET' });
        res.json({
          siret,
          denomination,
          siren: json.siren || siret.slice(0, 9),
          adresse: json.adresse_complete || '',
          code_postal: json.code_postal || '',
          ville: json.commune || '',
          activite_principale: json.activite_principale || ''
        });
      } catch(e) {
        res.status(500).json({ error: 'Réponse API invalide' });
      }
    });
  }).on('error', (e) => {
    // Fallback : essai via recherche-entreprises
    const url2 = `https://recherche-entreprises.api.gouv.fr/search?q=${siret}&page=1&per_page=1`;
    https.get(url2, opts, (resp2) => {
      let d2 = '';
      resp2.on('data', c => d2 += c);
      resp2.on('end', () => {
        try {
          const j2 = JSON.parse(d2);
          const r2 = j2.results?.[0];
          if (!r2) return res.status(404).json({ error: 'Entreprise non trouvée' });
          res.json({
            siret,
            denomination: r2.nom_raison_sociale || r2.nom_complet || '—',
            siren: r2.siren || '',
            adresse: r2.siege?.adresse_complete || '',
            code_postal: r2.siege?.code_postal || '',
            ville: r2.siege?.commune || '',
            activite_principale: r2.activite_principale || ''
          });
        } catch(e2) { res.status(500).json({ error: 'Service indisponible' }); }
      });
    }).on('error', () => res.status(503).json({ error: 'Service SIRET indisponible' }));
  });
});

// Endpoint pour patcher seulement la raison_sociale d'un bénéficiaire
app.patch('/api/admin/beneficiaires/:id/raison-sociale', requireAdmin, (req, res) => {
  const { raison_sociale } = req.body;
  if (!raison_sociale?.trim()) return res.status(400).json({ error: 'raison_sociale requis' });
  db.run(
    'UPDATE beneficiaires SET raison_sociale=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
    [raison_sociale.trim(), req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Bénéficiaire introuvable' });
      res.json({ ok: true, raison_sociale: raison_sociale.trim() });
    }
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

// ═══════════════════════════════════════════════════════════════════════════════
// ── ESPACE OBLIGÉ ─────────────────────────────────────────────────────────────
// Fournisseur d'énergie soumis à l'obligation CEE. Valide les primes proposées
// par les partenaires. Session dédiée : req.session.obligeId.
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/oblige/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  db.get(`SELECT * FROM obliges WHERE lower(email)=lower(?) AND actif=1`,
    [String(email).trim()], (err, o) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!o || !verifyPassword(password, o.password_hash))
        return res.status(401).json({ error: 'Identifiants incorrects' });
      resetLoginAttempts(ip);
      req.session.obligeId = o.id;
      db.run('UPDATE obliges SET last_login=CURRENT_TIMESTAMP WHERE id=?', [o.id]);
      res.json({ success: true, raison_sociale: o.raison_sociale });
    });
});
app.post('/api/oblige/logout',     (req, res) => { req.session.destroy(); res.json({ success: true }); });
app.get('/api/oblige/check-auth',  (req, res) => res.json({ authenticated: !!req.session.obligeId }));

app.get('/api/oblige/me', requireOblige, (req, res) => {
  db.get('SELECT id, raison_sociale, siret, type, email, contact_nom, contact_tel, kwhc_obligation_annuelle, prix_eur_mwhc, last_login, created_at FROM obliges WHERE id=?',
    [req.session.obligeId], (e, o) => {
      if (e || !o) return res.status(404).json({ error: 'Profil introuvable' });
      res.json(o);
    });
});

app.get('/api/oblige/stats', requireOblige, (req, res) => {
  // Agrège : nb de dossiers par statut, volume cumac total, prime totale.
  // Volume/prime viennent de cee_operations (1 dossier → N opérations).
  db.all(`SELECT b.oblige_statut AS s,
                 COUNT(DISTINCT b.id) AS n,
                 COALESCE(SUM(o.volume_kwh), 0) AS volume,
                 COALESCE(SUM(o.prime_negociee), 0) AS prime
          FROM beneficiaires b
          LEFT JOIN cee_operations o ON o.beneficiaire_id = b.id
          WHERE b.oblige_id = ? AND b.archived = 0
          GROUP BY b.oblige_statut`,
    [req.session.obligeId], (e, rows) => {
      if (e) return res.status(500).json({ error: e.message });
      const out = { total: 0, en_attente: 0, valide: 0, refuse: 0, volume_cumac_total: 0, prime_total: 0 };
      (rows || []).forEach(r => {
        out.total += r.n;
        out.volume_cumac_total += r.volume || 0;
        out.prime_total += r.prime || 0;
        if (r.s === 'en_attente') out.en_attente = r.n;
        if (r.s === 'valide')     out.valide     = r.n;
        if (r.s === 'refuse')     out.refuse     = r.n;
      });
      res.json(out);
    });
});

app.get('/api/oblige/dossiers', requireOblige, (req, res) => {
  const statut = req.query.statut || null;
  let sql = `SELECT b.id, b.code, b.nom, b.prenom, b.raison_sociale,
                    b.code_postal, b.ville, b.activite, b.partenaire,
                    b.oblige_statut, b.oblige_valide_at, b.oblige_motif_refus,
                    b.statut AS statut_dossier, b.created_at,
                    COALESCE(SUM(o.volume_kwh), 0)     AS volume_cumac,
                    COALESCE(SUM(o.prime_negociee), 0) AS subvention
             FROM beneficiaires b
             LEFT JOIN cee_operations o ON o.beneficiaire_id = b.id
             WHERE b.oblige_id = ? AND b.archived = 0`;
  const args = [req.session.obligeId];
  if (statut) { sql += ' AND b.oblige_statut = ?'; args.push(statut); }
  sql += ' GROUP BY b.id ORDER BY b.created_at DESC LIMIT 500';
  db.all(sql, args, (e, rows) => {
    if (e) return res.status(500).json({ error: e.message });
    res.json(rows || []);
  });
});

app.get('/api/oblige/dossiers/:id', requireOblige, (req, res) => {
  db.get(`SELECT b.*,
                 COALESCE(SUM(o.volume_kwh), 0)     AS volume_cumac,
                 COALESCE(SUM(o.prime_negociee), 0) AS subvention,
                 b.statut AS statut_dossier
          FROM beneficiaires b
          LEFT JOIN cee_operations o ON o.beneficiaire_id = b.id
          WHERE b.id = ? AND b.oblige_id = ?
          GROUP BY b.id`,
    [req.params.id, req.session.obligeId], (e, b) => {
      if (e) return res.status(500).json({ error: e.message });
      if (!b) return res.status(404).json({ error: 'Dossier introuvable' });
      res.json(b);
    });
});

app.post('/api/oblige/dossiers/:id/valider', requireOblige, (req, res) => {
  db.run(`UPDATE beneficiaires
          SET oblige_statut='valide', oblige_valide_at=CURRENT_TIMESTAMP, oblige_motif_refus=''
          WHERE id=? AND oblige_id=?`,
    [req.params.id, req.session.obligeId], function (e) {
      if (e) return res.status(500).json({ error: e.message });
      if (!this.changes) return res.status(404).json({ error: 'Dossier introuvable' });
      res.json({ success: true });
    });
});

app.post('/api/oblige/dossiers/:id/refuser', requireOblige, (req, res) => {
  const motif = String((req.body && req.body.motif) || '').slice(0, 500);
  db.run(`UPDATE beneficiaires
          SET oblige_statut='refuse', oblige_valide_at=CURRENT_TIMESTAMP, oblige_motif_refus=?
          WHERE id=? AND oblige_id=?`,
    [motif, req.params.id, req.session.obligeId], function (e) {
      if (e) return res.status(500).json({ error: e.message });
      if (!this.changes) return res.status(404).json({ error: 'Dossier introuvable' });
      res.json({ success: true });
    });
});

app.post('/api/oblige/change-password', requireOblige, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' });
  if (String(new_password).length < 6)    return res.status(400).json({ error: 'Nouveau mot de passe : 6 caractères minimum' });
  db.get('SELECT password_hash FROM obliges WHERE id=? AND actif=1', [req.session.obligeId], (e, o) => {
    if (e) return res.status(500).json({ error: e.message });
    if (!o) return res.status(401).json({ error: 'Session invalide' });
    if (!verifyPassword(current_password, o.password_hash))
      return res.status(403).json({ error: 'Mot de passe actuel incorrect' });
    db.run('UPDATE obliges SET password_hash=? WHERE id=?',
      [hashPassword(new_password), req.session.obligeId],
      err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
  });
});

// Admin : liste / création / activation des obligés
app.get('/api/admin/obliges', requireAdmin, (req, res) => {
  db.all('SELECT id, raison_sociale, siret, type, email, kwhc_obligation_annuelle, prix_eur_mwhc, actif, last_login, created_at FROM obliges ORDER BY raison_sociale',
    [], (e, rows) => e ? res.status(500).json({ error: e.message }) : res.json(rows || []));
});
app.post('/api/admin/obliges', requireAdmin, (req, res) => {
  const { raison_sociale, email, password, type, siret, kwhc_obligation_annuelle, prix_eur_mwhc, contact_nom, contact_tel } = req.body;
  if (!raison_sociale || !email || !password)
    return res.status(400).json({ error: 'raison_sociale, email et password requis' });
  db.run(`INSERT INTO obliges (raison_sociale, email, password_hash, type, siret, kwhc_obligation_annuelle, prix_eur_mwhc, contact_nom, contact_tel)
          VALUES (?,?,?,?,?,?,?,?,?)`,
    [raison_sociale, String(email).trim().toLowerCase(), hashPassword(password),
     type || 'energie', siret || '', parseFloat(kwhc_obligation_annuelle) || 0,
     parseFloat(prix_eur_mwhc) || 9.10, contact_nom || '', contact_tel || ''],
    function (e) {
      if (e) return res.status(400).json({ error: e.message });
      res.json({ success: true, id: this.lastID });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── ESPACE DÉLÉGATAIRE ────────────────────────────────────────────────────────
// Mandataire d'obligé : suit les dossiers que les apporteurs lui ont confiés,
// marque leur avancement (en traitement / soumis à l'obligé / validé / refusé).
// Session dédiée : req.session.delegataireId.
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/delegataire/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  db.get(`SELECT * FROM delegataires WHERE lower(email)=lower(?) AND compte_actif=1 AND actif=1`,
    [String(email).trim()], (err, d) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!d || !verifyPassword(password, d.password_hash))
        return res.status(401).json({ error: 'Identifiants incorrects' });
      resetLoginAttempts(ip);
      req.session.delegataireId = d.id;
      db.run('UPDATE delegataires SET last_login=CURRENT_TIMESTAMP WHERE id=?', [d.id]);
      res.json({ success: true, nom: d.nom });
    });
});
app.post('/api/delegataire/logout',     (req, res) => { req.session.destroy(); res.json({ success: true }); });
app.get('/api/delegataire/check-auth',  (req, res) => res.json({ authenticated: !!req.session.delegataireId }));

app.get('/api/delegataire/me', requireDelegataire, (req, res) => {
  db.get('SELECT id, nom, siret, email, contact_nom, contact_tel, last_login, created_at FROM delegataires WHERE id=?',
    [req.session.delegataireId], (e, d) => {
      if (e || !d) return res.status(404).json({ error: 'Profil introuvable' });
      res.json(d);
    });
});

app.get('/api/delegataire/stats', requireDelegataire, (req, res) => {
  db.all(`SELECT b.delegataire_statut AS s,
                 COUNT(DISTINCT b.id) AS n,
                 COALESCE(SUM(o.volume_kwh), 0) AS volume,
                 COALESCE(SUM(o.prime_negociee), 0) AS prime
          FROM beneficiaires b
          LEFT JOIN cee_operations o ON o.beneficiaire_id = b.id
          WHERE b.delegataire_id = ? AND b.archived = 0
          GROUP BY b.delegataire_statut`,
    [req.session.delegataireId], (e, rows) => {
      if (e) return res.status(500).json({ error: e.message });
      const out = { total: 0, en_traitement: 0, soumis: 0, valide: 0, refuse: 0, volume_cumac_total: 0, prime_total: 0 };
      (rows || []).forEach(r => {
        out.total += r.n;
        out.volume_cumac_total += r.volume || 0;
        out.prime_total += r.prime || 0;
        if (r.s === 'en_traitement') out.en_traitement = r.n;
        if (r.s === 'soumis')        out.soumis        = r.n;
        if (r.s === 'valide')        out.valide        = r.n;
        if (r.s === 'refuse')        out.refuse        = r.n;
      });
      res.json(out);
    });
});

app.get('/api/delegataire/dossiers', requireDelegataire, (req, res) => {
  const statut = req.query.statut || null;
  let sql = `SELECT b.id, b.code, b.nom, b.prenom, b.raison_sociale,
                    b.code_postal, b.ville, b.activite, b.partenaire,
                    b.delegataire_statut, b.delegataire_traite_at, b.delegataire_notes,
                    b.statut AS statut_dossier, b.created_at,
                    COALESCE(SUM(o.volume_kwh), 0)     AS volume_cumac,
                    COALESCE(SUM(o.prime_negociee), 0) AS subvention
             FROM beneficiaires b
             LEFT JOIN cee_operations o ON o.beneficiaire_id = b.id
             WHERE b.delegataire_id = ? AND b.archived = 0`;
  const args = [req.session.delegataireId];
  if (statut) { sql += ' AND b.delegataire_statut = ?'; args.push(statut); }
  sql += ' GROUP BY b.id ORDER BY b.created_at DESC LIMIT 500';
  db.all(sql, args, (e, rows) => {
    if (e) return res.status(500).json({ error: e.message });
    res.json(rows || []);
  });
});

app.get('/api/delegataire/dossiers/:id', requireDelegataire, (req, res) => {
  db.get(`SELECT b.*,
                 COALESCE(SUM(o.volume_kwh), 0)     AS volume_cumac,
                 COALESCE(SUM(o.prime_negociee), 0) AS subvention,
                 b.statut AS statut_dossier
          FROM beneficiaires b
          LEFT JOIN cee_operations o ON o.beneficiaire_id = b.id
          WHERE b.id = ? AND b.delegataire_id = ?
          GROUP BY b.id`,
    [req.params.id, req.session.delegataireId], (e, b) => {
      if (e) return res.status(500).json({ error: e.message });
      if (!b) return res.status(404).json({ error: 'Dossier introuvable' });
      res.json(b);
    });
});

// Mise à jour du statut côté délégataire (en_traitement → soumis → valide/refuse).
app.post('/api/delegataire/dossiers/:id/statut', requireDelegataire, (req, res) => {
  const { statut, notes } = req.body || {};
  const ALLOWED = ['en_traitement', 'soumis', 'valide', 'refuse'];
  if (!ALLOWED.includes(statut)) return res.status(400).json({ error: 'Statut invalide' });
  db.run(`UPDATE beneficiaires
          SET delegataire_statut = ?, delegataire_traite_at = CURRENT_TIMESTAMP,
              delegataire_notes = COALESCE(?, delegataire_notes)
          WHERE id = ? AND delegataire_id = ?`,
    [statut, notes != null ? String(notes).slice(0, 1000) : null, req.params.id, req.session.delegataireId],
    function (e) {
      if (e) return res.status(500).json({ error: e.message });
      if (!this.changes) return res.status(404).json({ error: 'Dossier introuvable' });
      res.json({ success: true });
    });
});

app.post('/api/delegataire/change-password', requireDelegataire, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' });
  if (String(new_password).length < 6)    return res.status(400).json({ error: 'Nouveau mot de passe : 6 caractères minimum' });
  db.get('SELECT password_hash FROM delegataires WHERE id=? AND compte_actif=1', [req.session.delegataireId], (e, d) => {
    if (e) return res.status(500).json({ error: e.message });
    if (!d) return res.status(401).json({ error: 'Session invalide' });
    if (!verifyPassword(current_password, d.password_hash))
      return res.status(403).json({ error: 'Mot de passe actuel incorrect' });
    db.run('UPDATE delegataires SET password_hash=? WHERE id=?',
      [hashPassword(new_password), req.session.delegataireId],
      err => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── ESPACE INSTALLATEUR ────────────────────────────────────────────────────────
// Entreprise RGE qui exécute les travaux. Voit ses dossiers, marque les étapes
// (devis → travaux → facture → AH). Session : req.session.installateurId
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/installateur/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Trop de tentatives.' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  db.get(`SELECT * FROM installateurs WHERE lower(email)=lower(?) AND actif=1`,
    [String(email).trim()], (err, i) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!i || !verifyPassword(password, i.password_hash))
        return res.status(401).json({ error: 'Identifiants incorrects' });
      resetLoginAttempts(ip);
      req.session.installateurId = i.id;
      db.run('UPDATE installateurs SET last_login=CURRENT_TIMESTAMP WHERE id=?', [i.id]);
      res.json({ success: true, raison_sociale: i.raison_sociale });
    });
});
app.post('/api/installateur/logout',     (req, res) => { req.session.destroy(); res.json({ success: true }); });
app.get('/api/installateur/check-auth',  (req, res) => res.json({ authenticated: !!req.session.installateurId }));
app.get('/api/installateur/me', requireInstallateur, (req, res) => {
  db.get('SELECT id, raison_sociale, siret, rge_numero, rge_organisme, rge_valid_until, email, contact_nom, contact_tel, last_login FROM installateurs WHERE id=?',
    [req.session.installateurId], (e, i) => e || !i ? res.status(404).json({ error: 'Profil introuvable' }) : res.json(i));
});
app.get('/api/installateur/stats', requireInstallateur, (req, res) => {
  db.all(`SELECT b.installateur_statut AS s,
                 COUNT(DISTINCT b.id) AS n,
                 COALESCE(SUM(o.volume_kwh), 0) AS volume,
                 COALESCE(SUM(o.prime_negociee), 0) AS prime
          FROM beneficiaires b
          LEFT JOIN cee_operations o ON o.beneficiaire_id = b.id
          WHERE b.installateur_id = ? AND b.archived = 0
          GROUP BY b.installateur_statut`,
    [req.session.installateurId], (e, rows) => {
      if (e) return res.status(500).json({ error: e.message });
      const out = { total: 0, devis_envoye: 0, devis_signe: 0, travaux_en_cours: 0, travaux_termines: 0, facture_emise: 0, ah_signee: 0, volume_cumac_total: 0, prime_total: 0 };
      (rows || []).forEach(r => {
        out.total += r.n;
        out.volume_cumac_total += r.volume || 0;
        out.prime_total += r.prime || 0;
        if (out.hasOwnProperty(r.s)) out[r.s] = r.n;
      });
      res.json(out);
    });
});
app.get('/api/installateur/dossiers', requireInstallateur, (req, res) => {
  const statut = req.query.statut || null;
  let sql = `SELECT b.id, b.code, b.nom, b.prenom, b.raison_sociale,
                    b.code_postal, b.ville, b.activite, b.partenaire,
                    b.installateur_statut, b.installateur_date_devis, b.installateur_date_facture,
                    b.statut AS statut_dossier, b.created_at,
                    COALESCE(SUM(o.volume_kwh), 0)     AS volume_cumac,
                    COALESCE(SUM(o.prime_negociee), 0) AS subvention
             FROM beneficiaires b
             LEFT JOIN cee_operations o ON o.beneficiaire_id = b.id
             WHERE b.installateur_id = ? AND b.archived = 0`;
  const args = [req.session.installateurId];
  if (statut) { sql += ' AND b.installateur_statut = ?'; args.push(statut); }
  sql += ' GROUP BY b.id ORDER BY b.created_at DESC LIMIT 500';
  db.all(sql, args, (e, rows) => e ? res.status(500).json({ error: e.message }) : res.json(rows || []));
});
app.post('/api/installateur/dossiers/:id/statut', requireInstallateur, (req, res) => {
  const { statut, notes } = req.body || {};
  const ALLOWED = ['devis_envoye', 'devis_signe', 'travaux_en_cours', 'travaux_termines', 'facture_emise', 'ah_signee'];
  if (!ALLOWED.includes(statut)) return res.status(400).json({ error: 'Statut invalide' });
  // Champs date mis à jour selon statut
  const dateField = statut === 'devis_signe' ? 'installateur_date_devis'
                  : statut === 'facture_emise' ? 'installateur_date_facture'
                  : null;
  const sets = ['installateur_statut = ?', 'installateur_notes = COALESCE(?, installateur_notes)'];
  const args = [statut, notes != null ? String(notes).slice(0, 1000) : null];
  if (dateField) { sets.push(dateField + ' = CURRENT_DATE'); }
  args.push(req.params.id, req.session.installateurId);
  db.run(`UPDATE beneficiaires SET ${sets.join(', ')} WHERE id = ? AND installateur_id = ?`,
    args, function (e) {
      if (e) return res.status(500).json({ error: e.message });
      if (!this.changes) return res.status(404).json({ error: 'Dossier introuvable' });
      res.json({ success: true });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── ESPACE CONTRÔLEUR ──────────────────────────────────────────────────────────
// Organisme accrédité COFRAC pour contrôles in-situ. Voit ses dossiers,
// programme visite, dépose rapport, conclut.
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/controleur/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Trop de tentatives.' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  db.get(`SELECT * FROM controleurs WHERE lower(email)=lower(?) AND actif=1`,
    [String(email).trim()], (err, c) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!c || !verifyPassword(password, c.password_hash))
        return res.status(401).json({ error: 'Identifiants incorrects' });
      resetLoginAttempts(ip);
      req.session.controleurId = c.id;
      db.run('UPDATE controleurs SET last_login=CURRENT_TIMESTAMP WHERE id=?', [c.id]);
      res.json({ success: true, raison_sociale: c.raison_sociale });
    });
});
app.post('/api/controleur/logout',     (req, res) => { req.session.destroy(); res.json({ success: true }); });
app.get('/api/controleur/check-auth',  (req, res) => res.json({ authenticated: !!req.session.controleurId }));
app.get('/api/controleur/me', requireControleur, (req, res) => {
  db.get('SELECT id, raison_sociale, siret, accreditation_no, accreditation_until, email, contact_nom, contact_tel, last_login FROM controleurs WHERE id=?',
    [req.session.controleurId], (e, c) => e || !c ? res.status(404).json({ error: 'Profil introuvable' }) : res.json(c));
});
app.get('/api/controleur/stats', requireControleur, (req, res) => {
  db.all(`SELECT b.controleur_statut AS s, COUNT(*) AS n
          FROM beneficiaires b WHERE b.controleur_id = ? AND b.archived = 0
          GROUP BY b.controleur_statut`,
    [req.session.controleurId], (e, rows) => {
      if (e) return res.status(500).json({ error: e.message });
      const out = { total: 0, non_planifie: 0, planifie: 0, controle_ok: 0, ecart_mineur: 0, non_conforme: 0 };
      (rows || []).forEach(r => { out.total += r.n; if (out.hasOwnProperty(r.s)) out[r.s] = r.n; });
      res.json(out);
    });
});
app.get('/api/controleur/dossiers', requireControleur, (req, res) => {
  const statut = req.query.statut || null;
  let sql = `SELECT b.id, b.code, b.nom, b.prenom, b.raison_sociale,
                    b.code_postal, b.ville, b.activite, b.partenaire,
                    b.controleur_statut, b.controleur_date_visite, b.controleur_rapport,
                    b.statut AS statut_dossier, b.created_at,
                    COALESCE(SUM(o.volume_kwh), 0) AS volume_cumac
             FROM beneficiaires b
             LEFT JOIN cee_operations o ON o.beneficiaire_id = b.id
             WHERE b.controleur_id = ? AND b.archived = 0`;
  const args = [req.session.controleurId];
  if (statut) { sql += ' AND b.controleur_statut = ?'; args.push(statut); }
  sql += ' GROUP BY b.id ORDER BY b.controleur_date_visite ASC, b.created_at DESC LIMIT 500';
  db.all(sql, args, (e, rows) => e ? res.status(500).json({ error: e.message }) : res.json(rows || []));
});
app.post('/api/controleur/dossiers/:id/statut', requireControleur, (req, res) => {
  const { statut, date_visite, rapport } = req.body || {};
  const ALLOWED = ['planifie', 'controle_ok', 'ecart_mineur', 'non_conforme'];
  if (!ALLOWED.includes(statut)) return res.status(400).json({ error: 'Statut invalide' });
  db.run(`UPDATE beneficiaires
          SET controleur_statut = ?,
              controleur_date_visite = COALESCE(?, controleur_date_visite),
              controleur_rapport     = COALESCE(?, controleur_rapport)
          WHERE id = ? AND controleur_id = ?`,
    [statut, date_visite || null, rapport != null ? String(rapport).slice(0, 2000) : null, req.params.id, req.session.controleurId],
    function (e) {
      if (e) return res.status(500).json({ error: e.message });
      if (!this.changes) return res.status(404).json({ error: 'Dossier introuvable' });
      res.json({ success: true });
    });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Plateforme CEE démarrée : http://localhost:${PORT}`);
  console.log(`   🔐 Mot de passe admin    : ${ADMIN_PASSWORD}`);
  console.log(`   🤖 Analyse IA (Claude)   : ${process.env.ANTHROPIC_API_KEY ? '✅ Activée' : '⚠️  Désactivée'}`);
  console.log(`   📧 Email (Nodemailer)    : ${process.env.SMTP_USER ? '✅ Activé → '+process.env.SMTP_USER : '⚠️  Désactivé'}\n`);
});
