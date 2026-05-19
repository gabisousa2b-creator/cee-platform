/* EchoWAI — cours EMMY (CEE) animé · marche aléatoire bornée à ±5% de la base.
   Injecte un ticker à côté de chaque .ew-logo et fait réagir le point orbital. */
(function () {
  var BASE = 9.10, LO = BASE * 0.95, HI = BASE * 1.05;
  var hist = [];
  for (var i = 0; i < 24; i++) hist.push(BASE + (Math.random() - 0.5) * 0.045 * BASE);
  var price = hist[hist.length - 1], prev = price, trend = 1;
  var tickers = [];

  function color(t) { return t > 0 ? '#2E8B57' : t < 0 ? '#C2410C' : '#2E7EF4'; }

  function sparkPoints() {
    var h = hist.slice(-12), mx = Math.max.apply(null, h), mn = Math.min.apply(null, h),
        rg = (mx - mn) || 1, s = [];
    for (var i = 0; i < h.length; i++)
      s.push((i / (h.length - 1) * 38).toFixed(1) + ',' + (13 - (h[i] - mn) / rg * 11).toFixed(1));
    return s.join(' ');
  }

  function build(logo) {
    if (logo.parentNode.querySelector('.ew-emmy')) return;
    var tk = document.createElement('span');
    tk.className = 'ew-emmy';
    tk.innerHTML =
      '<span class="ew-emmy-lab">EMMY · cours CEE</span>' +
      '<span class="ew-emmy-row">' +
        '<b class="ew-emmy-val">—</b>' +
        '<span class="ew-emmy-unit">€/MWh</span>' +
        '<svg class="ew-emmy-spark" viewBox="0 0 38 13" preserveAspectRatio="none" aria-hidden="true">' +
          '<polyline fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></polyline>' +
        '</svg>' +
        '<span class="ew-emmy-arr"></span>' +
      '</span>';
    logo.parentNode.insertBefore(tk, logo.nextSibling);
    tickers.push({ tk: tk, logo: logo });
  }

  function render() {
    var c = color(trend), pts = sparkPoints(), val = price.toFixed(2),
        arr = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
    for (var i = 0; i < tickers.length; i++) {
      var o = tickers[i];
      o.tk.querySelector('.ew-emmy-val').textContent = val;
      var a = o.tk.querySelector('.ew-emmy-arr');
      a.textContent = arr; a.style.color = c;
      a.style.animation = 'none'; void a.offsetWidth; a.style.animation = 'ewTick .5s ease';
      o.tk.querySelector('.ew-emmy-unit').style.color = c;
      var pl = o.tk.querySelector('.ew-emmy-spark polyline');
      pl.setAttribute('points', pts);
      pl.setAttribute('stroke', c);
      var dot = o.logo.querySelector('i');
      if (dot) { dot.style.background = c; dot.style.boxShadow = '0 0 7px ' + c; }
    }
  }

  function step() {
    prev = price;
    var d = -(price - BASE) * 0.16 + (Math.random() - 0.5) * 0.072 * BASE;
    price = Math.min(HI, Math.max(LO, price + d));
    trend = price > prev ? 1 : price < prev ? -1 : 0;
    hist = hist.slice(1).concat(price);
    render();
  }

  function init() {
    var logos = document.querySelectorAll('.ew-logo');
    for (var i = 0; i < logos.length; i++) build(logos[i]);
    render();
    setInterval(step, 2400);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
