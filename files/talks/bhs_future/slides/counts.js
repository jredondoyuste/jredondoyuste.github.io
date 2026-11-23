// How many modes, against loudness: the staircase of detected modes in ET
// for two sources, drawn as rho_220 sweeps from 1 to 5000 (data:
// figures/mq-counts.json, mqnm t24 S2d, e_OT = 10, expected LOO ln B >= 3).
//
// Presses:
//   arrive  the sweep, t0 = 10 M: both staircases climb, the q = 1 modes named
//   1       the logarithmic law, N = b ln(rho / rho_0)
//   2       the start time: the same sources from 5 M and from 20 M
(function () {
  'use strict';
  var slide = document.getElementById('mq-counts');
  if (!slide) return;
  var svg = slide.querySelector('.ct-svg');
  var NS = 'http://www.w3.org/2000/svg';
  var X0 = 300, X1 = 1480, Y0 = 240, Y1 = 830, RMAX = 5000, NMAX = 22, EVENT = 342;
  function x(r) { return X0 + Math.log10(Math.max(r, 1)) / Math.log10(RMAX) * (X1 - X0); }
  function y(n) { return Y1 - n / NMAX * (Y1 - Y0); }
  function el(tag, a, p) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; }

  var D = null, R = {}, raf = null, rho = 1, swept = false;
  var SRC = [{ key: 'q1', cls: 'ct-a', name: 'q = 1, χ_f = 0.69' }, { key: 'q3', cls: 'ct-b', name: 'q = 3, χ_f = 0.95' }];

  function stair(list, upto) {                        // staircase path up to rho = upto
    var d = 'M' + x(1) + ' ' + y(0), n = 0;
    for (var i = 0; i < list.length && list[i][0] <= upto; i++) {
      d += 'H' + x(list[i][0]).toFixed(1); n++; d += 'V' + y(n).toFixed(1);
    }
    return { d: d + 'H' + x(upto).toFixed(1), n: n };
  }
  function count(list, r) { var n = 0; while (n < list.length && list[n][0] <= r) n++; return n; }
  function band(src) {                                // steps of min and max over the three start times
    var K = 700, lo = [], hi = [];
    for (var k = 0; k <= K; k++) {
      var r = Math.pow(RMAX, k / K), ns = ['5', '10', '20'].map(function (t) { return count(src[t], r); });
      lo.push([r, Math.min.apply(null, ns)]); hi.push([r, Math.max.apply(null, ns)]);
    }
    var d = '';
    hi.forEach(function (p, k) {
      if (k) d += 'H' + x(p[0]).toFixed(1);
      d += (k ? 'V' : 'M' + x(p[0]).toFixed(1) + ' ') + y(p[1]).toFixed(1);
    });
    for (var k2 = lo.length - 1; k2 >= 0; k2--) d += 'V' + y(lo[k2][1]).toFixed(1) + 'H' + x(lo[Math.max(0, k2 - 1)][0]).toFixed(1);
    return d + 'Z';
  }
  function fit(list) {                                // N = b ln(rho / rho0), rho0 = 0.9 x first entry, least squares in b
    var r0 = 0.9 * list[0][0], num = 0, den = 0;
    for (var k = 0; k <= 200; k++) {
      var r = r0 * Math.pow(RMAX / r0, k / 200), n = 0;
      while (n < list.length && list[n][0] <= r) n++;
      var L = Math.log(r / r0); num += n * L; den += L * L;
    }
    var b = num / den;
    return 'M' + x(r0).toFixed(1) + ' ' + y(0) + 'L' + x(RMAX).toFixed(1) + ' ' + y(b * Math.log(RMAX / r0)).toFixed(1);
  }

  function build() {
    svg.innerHTML = '';
    var g = el('g', { class: 'ct-axes' });
    el('line', { x1: X0, x2: X1, y1: Y1, y2: Y1 }, g);
    el('line', { x1: X0, x2: X0, y1: Y0, y2: Y1 }, g);
    [1, 10, 100, 1000].forEach(function (r, i) {
      el('line', { x1: x(r), x2: x(r), y1: Y1, y2: Y1 + 10 }, g);
      el('text', { x: x(r), y: Y1 + 46, class: 'ct-tick' }, g).textContent = i ? '10' + '¹²³'[i - 1] : '1';
    });
    for (var n = 0; n <= 20; n += 5) {
      el('line', { x1: X0 - 10, x2: X0, y1: y(n), y2: y(n) }, g);
      el('text', { x: X0 - 20, y: y(n) + 9, class: 'ct-tick ct-end' }, g).textContent = n;
    }
    el('text', { x: (X0 + X1) / 2, y: Y1 + 92, class: 'ct-lab' }, g).textContent = 'ρ₂₂₀';
    el('text', { x: X0 - 80, y: (Y0 + Y1) / 2, class: 'ct-lab', transform: 'rotate(-90 ' + (X0 - 80) + ' ' + (Y0 + Y1) / 2 + ')' }, g).textContent = 'detected modes';
    var ev = el('g', { class: 'ct-event' });
    el('line', { x1: x(EVENT), x2: x(EVENT), y1: Y0, y2: Y1 }, ev);
    el('text', { x: x(EVENT), y: Y0 - 14, class: 'ct-evlab' }, ev).textContent = 'GW250114 in ET';

    R.ghost = el('g', { class: 'ct-ghost' });
    R.fit = el('g', { class: 'ct-fit' });
    R.lines = SRC.map(function (s) { return el('path', { class: 'ct-line ' + s.cls }); });
    R.names = el('g', { class: 'ct-names' });
    R.cursor = el('line', { x1: x(1), x2: x(1), y1: Y0, y2: Y1, class: 'ct-cursor' });

    // the start time: a band from the fewest to the most modes over t0 = 5 ... 20 M
    SRC.forEach(function (s) {
      el('path', { d: band(D[s.key]), class: 'ct-band ' + s.cls }, R.ghost);
      el('path', { d: fit(D[s.key]['10']), class: s.cls }, R.fit);
    });
  }

  function paint() {
    var counts = SRC.map(function (s, i) {
      var st = stair(D[s.key]['10'], rho);
      R.lines[i].setAttribute('d', st.d);
      return st.n;
    });
    // name the q = 1 modes as they enter
    var h = '', lastX = -1e9;
    D.q1['10'].forEach(function (e, i) {
      if (e[0] > rho) return;
      var lx = Math.max(x(e[0]) + 8, lastX + 48); lastX = lx;      // no two names on top of each other
      h += '<text x="' + lx.toFixed(1) + '" y="' + (y(i + 1) - 10).toFixed(1) + '">' + e[1] + '</text>';
    });
    R.names.innerHTML = h;
    R.cursor.setAttribute('x1', x(rho)); R.cursor.setAttribute('x2', x(rho));
    slide.querySelector('.ct-rho').textContent = rho < 10 ? rho.toFixed(1) : Math.round(rho);
    slide.querySelector('.ct-n1').textContent = counts[0];
    slide.querySelector('.ct-n3').textContent = counts[1];
  }

  function sweep() {
    cancelAnimationFrame(raf);
    var t0 = performance.now(), dur = 6500;
    rho = 1;
    (function tick(now) {
      var s = Math.min(1, (now - t0) / dur);
      rho = Math.pow(RMAX, s);
      paint();
      if (s < 1) raf = requestAnimationFrame(tick); else { raf = null; swept = true; }
    })(t0);
  }
  function finish() { cancelAnimationFrame(raf); raf = null; rho = RMAX; swept = true; paint(); }

  fetch('figures/mq-counts.json').then(function (r) { return r.json(); }).then(function (d) {
    D = d; build(); rho = RMAX; paint();
    if (slide.classList.contains('active')) sweep();
  });
  Deck.on('mq-counts', {
    enter: function (sl, dir) { if (!D) return; if (dir > 0 && !(+sl.dataset.s)) sweep(); else finish(); },
    leave: function () { cancelAnimationFrame(raf); raf = null; },
    next: function () { if (raf) { finish(); return true; } return false; }
  });
})();
