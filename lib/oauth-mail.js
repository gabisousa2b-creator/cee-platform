// ─────────────────────────────────────────────────────────────────────────────
// OAuth Gmail (gmail.send) + Microsoft Graph (Mail.Send) pour envoyer un email
// "depuis" l'adresse du partenaire / obligé / délégataire.
//
// Stockage : tokens chiffrés AES-256-GCM dans la DB.
// Variables d'environnement requises :
//   GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET
//   MICROSOFT_OAUTH_CLIENT_ID, MICROSOFT_OAUTH_CLIENT_SECRET
//   OAUTH_REDIRECT_BASE        (ex: https://echowai.com)
//   TOKEN_ENCRYPTION_KEY       (64 hex chars = 32 bytes ; sinon dérivé de SESSION_SECRET)
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

const crypto = require('crypto');
const https  = require('https');
const { URLSearchParams } = require('url');

// ── Chiffrement tokens ──────────────────────────────────────────────────────
function getKey() {
  const k = process.env.TOKEN_ENCRYPTION_KEY;
  if (k && /^[0-9a-fA-F]{64}$/.test(k)) return Buffer.from(k, 'hex');
  // Dérivation depuis SESSION_SECRET — moins idéal, mais fonctionnel
  const seed = process.env.SESSION_SECRET || 'echowai-default-secret-change-me';
  return crypto.createHash('sha256').update('oauth-mail|' + seed).digest();
}
function encryptToken(plain) {
  if (!plain) return '';
  const key = getKey();
  const iv  = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}
function decryptToken(b64) {
  if (!b64) return '';
  try {
    const key = getKey();
    const data = Buffer.from(b64, 'base64');
    const iv  = data.slice(0, 12);
    const tag = data.slice(12, 28);
    const enc = data.slice(28);
    const dec = crypto.createDecipheriv('aes-256-gcm', key, iv);
    dec.setAuthTag(tag);
    return Buffer.concat([dec.update(enc), dec.final()]).toString('utf8');
  } catch (e) {
    return '';
  }
}

// ── HTTP helpers ────────────────────────────────────────────────────────────
function httpJson(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, (resp) => {
      let buf = '';
      resp.on('data', c => buf += c);
      resp.on('end', () => {
        try {
          const j = buf ? JSON.parse(buf) : {};
          if (resp.statusCode >= 400) return reject(new Error(`${resp.statusCode}: ${j.error_description || j.error?.message || j.error || buf.slice(0, 200)}`));
          resolve(j);
        } catch (e) { reject(new Error(`Réponse non JSON (${resp.statusCode}): ${buf.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── Providers — config ──────────────────────────────────────────────────────
const PROVIDERS = {
  google: {
    name: 'google',
    auth_url:  'https://accounts.google.com/o/oauth2/v2/auth',
    token_url: 'https://oauth2.googleapis.com/token',
    scope:     'openid email profile https://www.googleapis.com/auth/gmail.send',
    user_info: { host: 'www.googleapis.com', path: '/oauth2/v3/userinfo' },
  },
  microsoft: {
    name: 'microsoft',
    auth_url:  'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    token_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    // offline_access requis pour refresh_token
    scope:     'openid email profile offline_access https://graph.microsoft.com/Mail.Send',
    user_info: { host: 'graph.microsoft.com', path: '/v1.0/me' },
  },
};

function envForProvider(p) {
  if (p === 'google') return {
    id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  };
  if (p === 'microsoft') return {
    id: process.env.MICROSOFT_OAUTH_CLIENT_ID,
    secret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET,
  };
  return {};
}

function getRedirectUri(provider) {
  const base = process.env.OAUTH_REDIRECT_BASE || 'http://localhost:3000';
  return `${base.replace(/\/+$/, '')}/api/oauth/${provider}/callback`;
}

function isConfigured(provider) {
  const e = envForProvider(provider);
  return !!(e.id && e.secret);
}

// ── Build authorize URL ─────────────────────────────────────────────────────
function buildAuthUrl(provider, state) {
  const p = PROVIDERS[provider];
  const e = envForProvider(provider);
  if (!p || !e.id) throw new Error('Provider non configuré');
  const params = new URLSearchParams({
    client_id: e.id,
    redirect_uri: getRedirectUri(provider),
    response_type: 'code',
    scope: p.scope,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return p.auth_url + '?' + params.toString();
}

// ── Token exchange + refresh ────────────────────────────────────────────────
async function exchangeCode(provider, code) {
  const p = PROVIDERS[provider];
  const e = envForProvider(provider);
  const body = new URLSearchParams({
    code,
    client_id: e.id,
    client_secret: e.secret,
    redirect_uri: getRedirectUri(provider),
    grant_type: 'authorization_code',
  }).toString();
  const url = new URL(p.token_url);
  return httpJson({
    method: 'POST', host: url.host, path: url.pathname,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
  }, body);
}

async function refreshAccessToken(provider, refreshToken) {
  const p = PROVIDERS[provider];
  const e = envForProvider(provider);
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: e.id,
    client_secret: e.secret,
    grant_type: 'refresh_token',
  }).toString();
  const url = new URL(p.token_url);
  return httpJson({
    method: 'POST', host: url.host, path: url.pathname,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
  }, body);
}

async function fetchUserInfo(provider, accessToken) {
  const p = PROVIDERS[provider];
  const r = await httpJson({
    method: 'GET', host: p.user_info.host, path: p.user_info.path,
    headers: { 'Authorization': 'Bearer ' + accessToken, 'Accept': 'application/json' },
  });
  // Google: { email, name }. MS Graph: { mail, userPrincipalName, displayName }.
  const email = r.email || r.mail || r.userPrincipalName || '';
  return { email, raw: r };
}

// ── Envoi email ─────────────────────────────────────────────────────────────
function buildRfc822({ fromName, fromEmail, to, subject, html, text }) {
  const boundary = '----echowai_boundary_' + crypto.randomBytes(8).toString('hex');
  const escSubject = '=?UTF-8?B?' + Buffer.from(subject || '').toString('base64') + '?=';
  const lines = [
    `From: "${(fromName || '').replace(/"/g, '')}" <${fromEmail}>`,
    `To: ${to}`,
    `Subject: ${escSubject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    text || (html ? html.replace(/<[^>]+>/g, '') : ''),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    html || `<pre>${(text || '').replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</pre>`,
    '',
    `--${boundary}--`,
    '',
  ];
  return lines.join('\r\n');
}

async function sendGmail({ accessToken, fromName, fromEmail, to, subject, html, text }) {
  const raw = buildRfc822({ fromName, fromEmail, to, subject, html, text });
  const body = JSON.stringify({ raw: Buffer.from(raw).toString('base64url') });
  return httpJson({
    method: 'POST',
    host: 'gmail.googleapis.com',
    path: '/gmail/v1/users/me/messages/send',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
}

async function sendGraph({ accessToken, fromName, fromEmail, to, subject, html, text }) {
  const body = JSON.stringify({
    message: {
      subject: subject || '',
      body: { contentType: 'HTML', content: html || (text || '') },
      toRecipients: [{ emailAddress: { address: to } }],
      // Note : Graph utilise toujours l'adresse du token comme From (MS ne permet pas spoof).
      // Le displayName est défini dans le profil Outlook de l'utilisateur.
    },
    saveToSentItems: true,
  });
  return httpJson({
    method: 'POST',
    host: 'graph.microsoft.com',
    path: '/v1.0/me/sendMail',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
}

// ── Helper haut niveau : récupérer un access token valide (refresh si besoin)
async function ensureAccessToken(account, updateAccountCb) {
  // account = { email_provider, oauth_access_token (chiffré), oauth_refresh_token (chiffré), oauth_expires_at }
  const provider = account.email_provider;
  const expiresAt = account.oauth_expires_at ? new Date(account.oauth_expires_at).getTime() : 0;
  const now = Date.now();
  // Marge 60s avant expiration
  if (account.oauth_access_token && expiresAt - 60_000 > now) {
    return decryptToken(account.oauth_access_token);
  }
  const refresh = decryptToken(account.oauth_refresh_token);
  if (!refresh) throw new Error('Aucun refresh_token — reconnectez votre compte mail');
  const tok = await refreshAccessToken(provider, refresh);
  const access = tok.access_token;
  const newExpires = new Date(now + (tok.expires_in || 3600) * 1000).toISOString();
  // Si nouveau refresh_token renvoyé (rare sauf Google avec prompt=consent), on remplace
  const newRefresh = tok.refresh_token || refresh;
  if (updateAccountCb) {
    await updateAccountCb({
      access_token_enc: encryptToken(access),
      refresh_token_enc: encryptToken(newRefresh),
      expires_at: newExpires,
    });
  }
  return access;
}

// Envoie un email via l'API OAuth (Gmail ou MS Graph)
async function sendOAuth(account, { fromName, to, subject, html, text }, updateAccountCb) {
  const accessToken = await ensureAccessToken(account, updateAccountCb);
  const payload = {
    accessToken, fromName: fromName || account.email_address,
    fromEmail: account.email_address, to, subject, html, text,
  };
  if (account.email_provider === 'google')    return sendGmail(payload);
  if (account.email_provider === 'microsoft') return sendGraph(payload);
  throw new Error('Provider mail inconnu : ' + account.email_provider);
}

module.exports = {
  PROVIDERS, isConfigured, getRedirectUri, buildAuthUrl,
  exchangeCode, refreshAccessToken, fetchUserInfo,
  encryptToken, decryptToken,
  ensureAccessToken, sendOAuth,
};
