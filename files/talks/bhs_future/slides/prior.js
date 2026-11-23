// The amplitude prior, grown from the inspiral. Left: the binary in its
// orbital plane, sending out the l = m = 2, ..., 6 multipoles in the
// opening slide's colours (brightness ~ each harmonic's PN amplitude,
// compressed so the weak ones show at all). Right: the prior on each
// harmonic's QNM amplitude, from mqnm.prior.PNPrior (t24, e_OT = 10),
// tabulated along q for non-spinning binaries in figures/mq-prior-q.json.
// Each amplitude is a circular complex Gaussian, so |C| is Rayleigh: the
// bars run from its 5% to its 95% quantile, the tick is the median.
//
// Presses:
//   arrive  q = 1: the odd harmonics are silent, and their priors are zero
//   1       q -> 3: the 33 (and 55) switch on, in the waves and in the prior
//   2       the overtones: each n = 1 tied to its harmonic, ten times wider
//   3       the check against NR (figures/mq-p3-prior.png)
(function () {
  'use strict';
  var slide = document.getElementById('mq-prior');
  if (!slide) return;
  var svg = slide.querySelector('.pr-svg');
  var cv = slide.querySelector('.pr-field');
  var NS = 'http://www.w3.org/2000/svg';

  var HARM = [2, 3, 4, 5, 6];
  var D = null;                                       // widths along q
  var q = 1, qFrom = 1, qTo = 1, qT0 = 0, QDUR = 2600;
  var over = 0;                                       // overtone bars, 0 -> 1

  function widthAt(mode) {                            // linear in q on the table
    var Q = D.q, W = D.w[mode], i = 0;
    while (i < Q.length - 2 && Q[i + 1] < q) i++;
    var u = Math.max(0, Math.min(1, (q - Q[i]) / (Q[i + 1] - Q[i])));
    return W[i] + u * (W[i + 1] - W[i]);
  }
  function smooth(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }

  // ---- the field (canvas, quarter resolution) -------------------------------
  var CX = 500, CY = 575, RAD = 380, CELL = 4;        // panel centre and reach, px
  var GW = 2 * RAD / CELL, GH = 2 * RAD / CELL;
  cv.width = GW; cv.height = GH;
  cv.style.left = (CX - RAD) + 'px'; cv.style.top = (CY - RAD) + 'px';
  cv.style.width = 2 * RAD + 'px'; cv.style.height = 2 * RAD + 'px';
  var fctx = cv.getContext('2d'), img = fctx.createImageData(GW, GH);
  var Rr = new Float32Array(GW * GH), Ph = new Float32Array(GW * GH);
  for (var gy = 0, j = 0; gy < GH; gy++)
    for (var gx = 0; gx < GW; gx++, j++) {
      var X = (gx + 0.5) * CELL - RAD, Y = RAD - (gy + 0.5) * CELL;
      Rr[j] = Math.hypot(X, Y); Ph[j] = Math.atan2(Y, X);
    }
  var OMEGA = 2 * Math.PI / 2.6;                      // orbital angular frequency, rad / s
  var CW = 190 * OMEGA / Math.PI;                     // wave speed, px / s: the 22 has a 190 px wavelength
  var SEP = 64;                                       // separation, px
  var colours = null, themeSeen = null;
  function readColours() {
    var cs = getComputedStyle(slide), c = document.createElement('canvas').getContext('2d');
    colours = HARM.map(function (l) {
      c.fillStyle = cs.getPropertyValue('--m' + l + l).trim() || '#888';
      var h = c.fillStyle;
      return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    });
    themeSeen = document.documentElement.dataset.theme;
  }

  function drawField(time) {
    var w22 = widthAt('220');
    var amp = HARM.map(function (l) { return Math.pow(widthAt(l + '' + l + '0') / w22, 0.35); });
    var d = img.data;
    for (var j = 0; j < GW * GH; j++) {
      var r = Rr[j], o = 4 * j;
      var near = smooth((r - 50) / 60) * (1 - smooth((r - RAD + 70) / 70));
      if (near <= 0) { d[o + 3] = 0; continue; }
      var pr = 0, pg = 0, pb = 0, pa = 0;
      for (var k = HARM.length - 1; k >= 0; k--) {
        if (amp[k] < 0.02) continue;
        var m = HARM[k], v = amp[k] * Math.cos(m * (Ph[j] - OMEGA * (time - r / CW)));
        if (v <= 0) continue;
        var al = 0.9 * Math.tanh(4 * v * v) * near, c = colours[k];
        pr = c[0] * al + pr * (1 - al); pg = c[1] * al + pg * (1 - al); pb = c[2] * al + pb * (1 - al); pa = al + pa * (1 - al);
      }
      if (pa > 0) { d[o] = pr / pa; d[o + 1] = pg / pa; d[o + 2] = pb / pa; d[o + 3] = 255 * pa; }
      else d[o + 3] = 0;
    }
    fctx.putImageData(img, 0, 0);
  }

  // ---- svg: the holes, the bars ----------------------------------------------
  function el(tag, a, p) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; }
  var X0 = 1130, X1 = 1790, Y0 = 250, Y1 = 790, LO = -4, HI = 2;
  function y(v) { return Y1 - (Math.log10(Math.max(v, Math.pow(10, LO))) - LO) / (HI - LO) * (Y1 - Y0); }
  var Q3 = [Math.sqrt(-Math.log(0.95)), Math.sqrt(Math.LN2), Math.sqrt(Math.log(20))];
  var R = {};
  function build() {
    svg.innerHTML = '';
    R.h1 = el('circle', { class: 'pr-hole' }); R.h2 = el('circle', { class: 'pr-hole' });
    var g = el('g', { class: 'pr-chart' });
    el('line', { x1: X0, x2: X0, y1: Y0, y2: Y1, class: 'pr-axis' }, g);
    el('line', { x1: X0, x2: X1, y1: Y1, y2: Y1, class: 'pr-axis' }, g);
    for (var e = LO; e <= HI; e++) {
      el('line', { x1: X0 - 10, x2: X0, y1: y(Math.pow(10, e)), y2: y(Math.pow(10, e)), class: 'pr-axis' }, g);
      el('text', { x: X0 - 20, y: y(Math.pow(10, e)) + 9, class: 'pr-tick' }, g).textContent = e === 0 ? '1' : '10' + (e < 0 ? '⁻' : '') + '⁰¹²³⁴'[Math.abs(e)];
    }
    el('text', { x: X0 - 100, y: (Y0 + Y1) / 2, class: 'pr-ylab', transform: 'rotate(-90 ' + (X0 - 100) + ' ' + (Y0 + Y1) / 2 + ')' }, g).textContent = 'prior on |C|';
    var dx = (X1 - X0) / HARM.length;
    R.bars = HARM.map(function (l, i) {
      var cx = X0 + dx * (i + 0.5);
      el('text', { x: cx, y: Y1 + 48, class: 'pr-mode pr-c' + l }, g).textContent = l + '' + l;
      var gg = el('g', { class: 'pr-c' + l }, g);
      return {
        cx: cx,
        f: el('rect', { width: 34, rx: 17, class: 'pr-bar' }, gg),
        fm: el('line', { class: 'pr-med' }, gg),
        o: el('rect', { width: 34, rx: 17, class: 'pr-bar pr-ot' }, gg),
        om: el('line', { class: 'pr-med pr-ot' }, gg)
      };
    });
  }
  function bar(rect, med, cx, w, a) {
    var top = y(Q3[2] * w), bot = y(Q3[0] * w), vis = smooth((Math.log10(Math.max(w, 1e-9)) + 4.2) / 0.6) * a;
    rect.setAttribute('x', cx - 17); rect.setAttribute('y', top); rect.setAttribute('height', Math.max(0, bot - top));
    rect.style.opacity = vis;
    med.setAttribute('x1', cx - 24); med.setAttribute('x2', cx + 24);
    med.setAttribute('y1', y(Q3[1] * w)); med.setAttribute('y2', y(Q3[1] * w));
    med.style.opacity = vis;
  }

  // ---- the loop ----------------------------------------------------------------
  var raf = null, t0 = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!D) return;
    if (themeSeen !== document.documentElement.dataset.theme) readColours();
    q = qFrom + (qTo - qFrom) * smooth((now - qT0) / QDUR);
    var time = (now - t0) / 1000;
    drawField(time);

    // the holes: masses q/(1+q), 1/(1+q) about the centre of mass
    var m1 = q / (1 + q), m2 = 1 / (1 + q), ph = OMEGA * time;
    var c = Math.cos(ph), s = Math.sin(ph);
    R.h1.setAttribute('cx', CX + m2 * SEP * c); R.h1.setAttribute('cy', CY - m2 * SEP * s); R.h1.setAttribute('r', 15 * Math.sqrt(2 * m1));
    R.h2.setAttribute('cx', CX - m1 * SEP * c); R.h2.setAttribute('cy', CY + m1 * SEP * s); R.h2.setAttribute('r', 15 * Math.sqrt(2 * m2));

    var ot = smooth(over);
    R.bars.forEach(function (b, i) {
      var l = HARM[i];
      bar(b.f, b.fm, b.cx - 22, widthAt(l + '' + l + '0'), 1);
      bar(b.o, b.om, b.cx + 22, widthAt(l + '' + l + '1'), ot);
    });
    slide.querySelector('.pr-q').textContent = q.toFixed(1);
  }

  function setStep(s, animate) {
    var target = s >= 1 ? 3 : 1;
    if (target !== qTo) {
      qFrom = animate ? q : target; qTo = target; qT0 = performance.now();
    }
    over = s >= 2 ? 1 : 0;
  }

  fetch('figures/mq-prior-q.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
    D = d; build(); readColours();
  });
  var lastS = 0;
  Deck.on('mq-prior', {
    enter: function (sl) { lastS = +sl.dataset.s || 0; setStep(lastS, false); t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); },
    leave: function () { cancelAnimationFrame(raf); raf = null; }
  });
  new MutationObserver(function () {
    var s = +slide.dataset.s || 0;
    setStep(s, s > lastS); lastS = s;
  }).observe(slide, { attributes: true, attributeFilter: ['data-s'] });
})();
