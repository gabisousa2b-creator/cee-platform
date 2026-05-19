/* EchoWAI — cours EMMY (CEE) animé · marche aléatoire bornée à ±5% de la base.
   Sous-ligne discrète intégrée à chaque .ew-logo ; le point orbital réagit. */
(function () {
  var BASE = 9.10, LO = BASE * 0.95, HI = BASE * 1.05;
  var hist = [];
  for (var i = 0; i < 24; i++) hist.push(BASE + (Math.random() - 0.5) * 0.045 * BASE);
  var price = hist[hist.length - 1], prev = price, trend = 1;
  var tickers = [];

  function color(t) { return t > 0 ? '#2E8B57' : t < 0 ? '#C2410C' : '#2E7EF4'; }

  function build(logo) {
    if (logo.parentNode.querySelector('.ew-emmy')) return;
    var tk = document.createElement('span');
    tk.className = 'ew-emmy';
    tk.innerHTML =
      '<span class="ew-emmy-lab">EMMY</span>' +
      '<span class="ew-emmy-val">—</span>' +
      '<span class="ew-emmy-unit">€/MWh</span>' +
      '<span class="ew-emmy-arr"></span>';
    logo.parentNode.insertBefore(tk, logo.nextSibling);
    try {
      if (getComputedStyle(logo.parentNode).textAlign === 'center')
        tk.style.margin = '-3px auto 0';
    } catch (e) {}
    tickers.push({ tk: tk, logo: logo });
  }

  function render() {
    var c = color(trend), val = price.toFixed(2).replace('.', ','),
        arr = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
    for (var i = 0; i < tickers.length; i++) {
      var o = tickers[i];
      o.tk.querySelector('.ew-emmy-val').textContent = val;
      o.tk.querySelector('.ew-emmy-unit').style.color = c;
      var a = o.tk.querySelector('.ew-emmy-arr');
      a.textContent = arr; a.style.color = c;
      a.style.animation = 'none'; void a.offsetWidth; a.style.animation = 'ewTick .5s ease';
      var dot = o.logo.querySelector('i');
      if (dot) { dot.style.background = c; dot.style.boxShadow = '0 0 6px ' + c; }
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
