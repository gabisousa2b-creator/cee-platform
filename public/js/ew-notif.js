/* EchoWAI — Notification bell + dropdown (toutes plateformes).
   À inclure dans n'importe quel dashboard via <script src="/js/ew-notif.js" defer></script>
   Recherche un host #ew-notif-host (sinon ajoute au coin top-right body). */
(function () {
  if (window.__EW_NOTIF__) return;
  window.__EW_NOTIF__ = true;

  const STYLE = `
  .ew-notif-host { position: relative; display: inline-flex; align-items: center; }
  .ew-bell {
    position: relative; background: transparent; border: 0; cursor: pointer;
    width: 36px; height: 36px; border-radius: 8px; color: #475569;
    display: inline-flex; align-items: center; justify-content: center;
    transition: background .15s ease, color .15s ease;
  }
  .ew-bell:hover { background: rgba(10,31,61,.06); color: var(--accent, #2E7EF4); }
  .ew-bell svg { width: 18px; height: 18px; }
  .ew-bell-badge {
    position: absolute; top: 4px; right: 4px; min-width: 16px; height: 16px;
    border-radius: 999px; background: #dc2626; color: #fff;
    font-size: 10px; font-weight: 700; padding: 0 4px;
    display: none; align-items: center; justify-content: center;
    font-family: 'IBM Plex Mono', monospace;
  }
  .ew-bell-badge.on { display: inline-flex; }
  .ew-notif-panel {
    position: absolute; top: calc(100% + 10px); right: 0; width: 340px; max-height: 460px;
    background: #fff; border: 1px solid rgba(10,31,61,.10); border-radius: 12px;
    box-shadow: 0 24px 60px -22px rgba(10,31,61,.30);
    display: none; flex-direction: column; z-index: 200; overflow: hidden;
  }
  .ew-notif-panel.on { display: flex; }
  .ew-notif-head {
    padding: 12px 14px; display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(10,31,61,.08); font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: .12em; color: #94a3b8;
  }
  .ew-notif-head a { color: var(--accent, #2E7EF4); text-decoration: none; cursor: pointer; }
  .ew-notif-list { overflow-y: auto; max-height: 380px; }
  .ew-notif-item {
    padding: 12px 14px; border-bottom: 1px solid rgba(10,31,61,.05);
    display: flex; gap: 10px; cursor: pointer; transition: background .15s ease;
  }
  .ew-notif-item:hover { background: #f8fafc; }
  .ew-notif-item.unread { background: rgba(46,126,244,.04); }
  .ew-notif-item .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent, #2E7EF4); flex-shrink: 0; margin-top: 6px; }
  .ew-notif-item.read .dot { background: transparent; border: 1px solid #cbd5e1; }
  .ew-notif-item .body { flex: 1; min-width: 0; }
  .ew-notif-item .titre { font-size: 13px; font-weight: 600; color: var(--ink, #0a1f3d); line-height: 1.3; }
  .ew-notif-item .msg   { font-size: 12px; color: #475569; line-height: 1.4; margin-top: 2px; }
  .ew-notif-item .when  { font-size: 10.5px; color: #94a3b8; margin-top: 4px; font-family: 'IBM Plex Mono', monospace; }
  .ew-notif-empty { padding: 32px 14px; text-align: center; color: #94a3b8; font-size: 13px; }
  `;

  const style = document.createElement('style');
  style.textContent = STYLE;
  document.head.appendChild(style);

  // Trouve un host : .ew-notif-host, sinon crée flottant
  let host = document.querySelector('.ew-notif-host');
  if (!host) {
    host = document.createElement('div');
    host.className = 'ew-notif-host';
    host.style.cssText = 'position:fixed;top:14px;right:14px;z-index:300;';
    document.body.appendChild(host);
  }

  host.innerHTML = `
    <button class="ew-bell" id="ewBell" aria-label="Notifications" title="Notifications">
      <svg viewBox="0 0 24 24" fill="none"><path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span class="ew-bell-badge" id="ewBellBadge">0</span>
    </button>
    <div class="ew-notif-panel" id="ewNotifPanel">
      <div class="ew-notif-head">
        <span>Notifications</span>
        <a id="ewMarkAll">Tout marquer lu</a>
      </div>
      <div class="ew-notif-list" id="ewNotifList"></div>
    </div>`;

  const bell  = document.getElementById('ewBell');
  const badge = document.getElementById('ewBellBadge');
  const panel = document.getElementById('ewNotifPanel');
  const list  = document.getElementById('ewNotifList');
  const markAll = document.getElementById('ewMarkAll');

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m])); }
  function rel(d) {
    const t = (Date.now() - new Date(d + 'Z').getTime()) / 1000;
    if (t < 60)    return Math.round(t) + 's';
    if (t < 3600)  return Math.round(t / 60) + 'min';
    if (t < 86400) return Math.round(t / 3600) + 'h';
    return Math.round(t / 86400) + 'j';
  }

  async function load() {
    try {
      const r = await fetch('/api/notifications');
      if (!r.ok) return;
      const items = await r.json();
      const unread = items.filter(i => !i.lu).length;
      badge.textContent = unread;
      badge.classList.toggle('on', unread > 0);
      if (!items.length) {
        list.innerHTML = '<div class="ew-notif-empty">Aucune notification.</div>';
        return;
      }
      list.innerHTML = items.slice(0, 50).map(n => `
        <div class="ew-notif-item ${n.lu ? 'read' : 'unread'}" data-id="${n.id}" data-url="${esc(n.url || '')}">
          <span class="dot"></span>
          <div class="body">
            <div class="titre">${esc(n.titre)}</div>
            ${n.message ? `<div class="msg">${esc(n.message)}</div>` : ''}
            <div class="when">${rel(n.created_at)}</div>
          </div>
        </div>`).join('');
      list.querySelectorAll('.ew-notif-item').forEach(el => {
        el.addEventListener('click', async () => {
          const id = el.dataset.id;
          await fetch('/api/notifications/' + id + '/read', { method: 'POST' });
          if (el.dataset.url) location.href = el.dataset.url;
          else load();
        });
      });
    } catch (e) {}
  }

  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('on');
    if (panel.classList.contains('on')) load();
  });
  document.addEventListener('click', (e) => {
    if (!host.contains(e.target)) panel.classList.remove('on');
  });
  markAll.addEventListener('click', async (e) => {
    e.stopPropagation();
    await fetch('/api/notifications/read-all', { method: 'POST' });
    load();
  });

  load();
  setInterval(load, 90 * 1000); // refresh toutes les 90s
})();
