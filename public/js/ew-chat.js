/* EchoWAI — Chat IA bulle flottante (bottom-right) sur tous les dashboards.
   Auto-détecte le rôle via session, contextualise les réponses via /api/ai/chat. */
(function () {
  if (window.__EW_CHAT__) return;
  window.__EW_CHAT__ = true;

  const CSS = `
  .ew-chat-bubble {
    position: fixed; bottom: 20px; right: 20px; z-index: 250;
    width: 54px; height: 54px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent, #2E7EF4), #5BA0FF);
    color: #fff; border: 0; cursor: pointer;
    box-shadow: 0 16px 32px -10px rgba(46,126,244,.55);
    display: flex; align-items: center; justify-content: center;
    transition: transform .25s ease, box-shadow .25s ease;
  }
  .ew-chat-bubble:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 20px 40px -10px rgba(46,126,244,.65); }
  .ew-chat-bubble svg { width: 22px; height: 22px; }
  .ew-chat-bubble .badge-new { position: absolute; top: -2px; right: -2px; background: #fff; color: var(--accent, #2E7EF4); font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 999px; box-shadow: 0 4px 10px -2px rgba(0,0,0,.15); }
  .ew-chat-panel {
    position: fixed; bottom: 86px; right: 20px; z-index: 251;
    width: 360px; max-width: calc(100vw - 30px); height: 520px; max-height: calc(100vh - 120px);
    background: #fff; border: 1px solid rgba(10,31,61,.10);
    border-radius: 16px; box-shadow: 0 30px 80px -28px rgba(10,31,61,.40);
    display: none; flex-direction: column; overflow: hidden;
  }
  .ew-chat-panel.on { display: flex; animation: ewChatRise .25s ease-out both; }
  @keyframes ewChatRise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .ew-chat-head {
    padding: 14px 18px; background: linear-gradient(135deg, var(--accent, #2E7EF4), #5BA0FF); color: #fff;
    display: flex; align-items: center; justify-content: space-between;
  }
  .ew-chat-head .title { font-weight: 600; font-size: 14px; }
  .ew-chat-head .sub { font-size: 11px; opacity: .85; font-family: 'IBM Plex Mono', monospace; }
  .ew-chat-head .close { background: rgba(255,255,255,.18); border: 0; color: #fff; cursor: pointer; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .ew-chat-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; background: #f8fafc; }
  .ew-msg { padding: 10px 14px; border-radius: 12px; font-size: 13.5px; line-height: 1.5; max-width: 85%; word-wrap: break-word; }
  .ew-msg.user { background: linear-gradient(135deg, var(--accent, #2E7EF4), #5BA0FF); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
  .ew-msg.assistant { background: #fff; color: var(--ink, #0a1f3d); border: 1px solid rgba(10,31,61,.08); align-self: flex-start; border-bottom-left-radius: 4px; }
  .ew-msg.assistant pre, .ew-msg.assistant code { font-family: 'IBM Plex Mono', monospace; font-size: 12px; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; }
  .ew-msg.typing { background: #e2e8f0; padding: 12px 16px; align-self: flex-start; display: inline-flex; gap: 4px; }
  .ew-msg.typing span { width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; animation: ewTypingDot 1.4s infinite both; }
  .ew-msg.typing span:nth-child(2) { animation-delay: .2s; } .ew-msg.typing span:nth-child(3) { animation-delay: .4s; }
  @keyframes ewTypingDot { 0%, 60%, 100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
  .ew-chat-input {
    padding: 12px; border-top: 1px solid rgba(10,31,61,.08); background: #fff;
    display: flex; gap: 8px; align-items: flex-end;
  }
  .ew-chat-input textarea {
    flex: 1; resize: none; border: 1px solid rgba(10,31,61,.12); border-radius: 10px;
    padding: 9px 12px; font-family: inherit; font-size: 13px; min-height: 38px; max-height: 100px;
    transition: border .15s ease;
  }
  .ew-chat-input textarea:focus { outline: none; border-color: var(--accent, #2E7EF4); box-shadow: 0 0 0 3px rgba(46,126,244,.15); }
  .ew-chat-input button {
    width: 38px; height: 38px; border-radius: 10px; border: 0; cursor: pointer;
    background: linear-gradient(135deg, var(--accent, #2E7EF4), #5BA0FF); color: #fff;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ew-chat-input button:disabled { opacity: .5; cursor: default; }
  `;
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <button class="ew-chat-bubble" id="ewChatBubble" aria-label="Assistant CEE">
      <svg viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span class="badge-new">IA</span>
    </button>
    <div class="ew-chat-panel" id="ewChatPanel">
      <div class="ew-chat-head">
        <div><div class="title">Assistant CEE</div><div class="sub">Claude — propulsé par Anthropic</div></div>
        <button class="close" id="ewChatClose">×</button>
      </div>
      <div class="ew-chat-body" id="ewChatBody"></div>
      <div class="ew-chat-input">
        <textarea id="ewChatInput" placeholder="Posez votre question…" rows="1"></textarea>
        <button id="ewChatSend"><i class="fas fa-paper-plane" style="font-size:13px"></i></button>
      </div>
    </div>`;
  document.body.appendChild(wrap);

  const bubble = document.getElementById('ewChatBubble');
  const panel  = document.getElementById('ewChatPanel');
  const body   = document.getElementById('ewChatBody');
  const input  = document.getElementById('ewChatInput');
  const send   = document.getElementById('ewChatSend');
  const close  = document.getElementById('ewChatClose');

  const HIST_KEY = 'ew-chat-hist';
  let history = [];
  try { history = JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); } catch(e) { history = []; }

  function esc(s) { return String(s).replace(/[&<>]/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[m])); }
  function render() {
    if (!history.length) {
      body.innerHTML = '<div class="ew-msg assistant">👋 Bonjour ! Je suis votre assistant CEE. Posez-moi n\'importe quelle question sur les fiches d\'opération, les obligations, vos dossiers, le dispositif réglementaire…</div>';
      return;
    }
    body.innerHTML = history.map(m => `<div class="ew-msg ${m.role}">${esc(m.content).replace(/\n/g, '<br>')}</div>`).join('');
    body.scrollTop = body.scrollHeight;
  }

  async function ask() {
    const txt = input.value.trim();
    if (!txt) return;
    input.value = ''; input.style.height = 'auto';
    history.push({ role: 'user', content: txt });
    render();
    body.insertAdjacentHTML('beforeend', '<div class="ew-msg typing"><span></span><span></span><span></span></div>');
    body.scrollTop = body.scrollHeight;
    send.disabled = true;
    try {
      const r = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Erreur IA');
      history.push({ role: 'assistant', content: j.content });
      localStorage.setItem(HIST_KEY, JSON.stringify(history.slice(-30)));
    } catch (e) {
      history.push({ role: 'assistant', content: '⚠ ' + (e.message || 'Erreur') });
    } finally {
      render(); send.disabled = false; input.focus();
    }
  }

  bubble.addEventListener('click', () => { panel.classList.toggle('on'); render(); if (panel.classList.contains('on')) input.focus(); });
  close.addEventListener('click', () => panel.classList.remove('on'));
  send.addEventListener('click', ask);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); }
    setTimeout(() => { input.style.height = 'auto'; input.style.height = Math.min(100, input.scrollHeight) + 'px'; }, 0);
  });
})();
