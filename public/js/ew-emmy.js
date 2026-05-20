/* EchoWAI — Logo widget injector (platform pages)
   Replaces every <span class="ew-logo">…</span> with an iframe pointing at /logo/.
   The iframe contains React+lab JSX that rotates 13 logos every 15 min and
   renders the EMMY cours sub-line (base réévaluée chaque jour, walk live ±5%).

   This file used to inject a vanilla EMMY ticker — now superseded by /logo/. */
(function () {
  if (window.__EW_LOGO_INIT__) return;
  window.__EW_LOGO_INIT__ = true;

  function pickTheme(el) {
    // Explicit override
    var attr = el.getAttribute('data-theme');
    if (attr === 'dark' || attr === 'light') return attr;
    // Heuristic: walk up to find background color
    var node = el;
    while (node && node !== document.documentElement) {
      var bg = getComputedStyle(node).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        // parse rgb(r, g, b…) and compute luminance
        var m = bg.match(/rgba?\(([^)]+)\)/);
        if (m) {
          var p = m[1].split(',').map(parseFloat);
          var lum = (0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]) / 255;
          return lum < 0.55 ? 'dark' : 'light';
        }
      }
      node = node.parentNode;
    }
    return 'light';
  }

  function pickScale(el) {
    // Map element font-size to widget scale (28px ≈ scale 1)
    var fs = parseFloat(getComputedStyle(el).fontSize) || 21;
    return Math.max(0.55, Math.min(2.2, fs / 21));
  }

  function buildIframe(el) {
    var theme = pickTheme(el);
    var scale = pickScale(el);
    var params = new URLSearchParams({ theme: theme, scale: String(scale.toFixed(2)) });
    var ifr = document.createElement('iframe');
    ifr.src = '/logo/?' + params.toString();
    ifr.title = 'EchoWAI';
    ifr.setAttribute('aria-label', 'Logo EchoWAI');
    ifr.loading = 'eager';
    ifr.style.cssText =
      'display:block;border:0;background:transparent;color-scheme:normal;' +
      'width:' + Math.round(280 * scale) + 'px;' +
      'max-width:100%;' +
      'height:' + Math.round(64 * scale) + 'px;' +
      'vertical-align:middle;';
    return ifr;
  }

  // Centralized listener for size messages — match iframe by event.source.
  // - kind:"reset" (new slot): apply the size as-is so the iframe shrinks
  //   if the new slot is narrower than the previous one.
  // - kind:"grow" (animation mid-slot): only grow, never shrink.
  var IFRAMES = [];
  window.addEventListener('message', function (ev) {
    var d = ev.data;
    if (!d || d.source !== 'ew-logo-size') return;
    var reset = d.kind === 'reset';
    for (var i = 0; i < IFRAMES.length; i++) {
      var ifr = IFRAMES[i];
      if (ifr.contentWindow !== ev.source) continue;
      if (typeof d.height === 'number') {
        var nh = Math.max(28, Math.min(220, d.height));
        if (reset || nh > ifr.offsetHeight) ifr.style.height = nh + 'px';
      }
      if (typeof d.width === 'number') {
        var nw = Math.max(80, Math.min(520, d.width));
        if (reset || nw > ifr.offsetWidth) ifr.style.width = nw + 'px';
      }
      break;
    }
  });

  function mount(el) {
    if (el.dataset.ewMounted === '1') return;
    el.dataset.ewMounted = '1';
    // Clear the text "echo<b>wai</b><i></i>" — iframe takes over
    el.textContent = '';
    el.style.padding = '0';
    el.style.lineHeight = '0';
    el.style.background = 'transparent';
    el.style.overflow = 'visible';
    var ifr = buildIframe(el);
    IFRAMES.push(ifr);
    el.appendChild(ifr);
  }

  function init() {
    var logos = document.querySelectorAll('.ew-logo');
    for (var i = 0; i < logos.length; i++) mount(logos[i]);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  // Re-mount on dynamically inserted .ew-logo
  var mo = new MutationObserver(function (muts) {
    for (var j = 0; j < muts.length; j++) {
      var added = muts[j].addedNodes;
      for (var k = 0; k < added.length; k++) {
        var n = added[k];
        if (n.nodeType !== 1) continue;
        if (n.classList && n.classList.contains('ew-logo')) mount(n);
        var inner = n.querySelectorAll && n.querySelectorAll('.ew-logo');
        if (inner) for (var l = 0; l < inner.length; l++) mount(inner[l]);
      }
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
