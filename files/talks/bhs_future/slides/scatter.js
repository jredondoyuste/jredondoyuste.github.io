// Second-order scattering off a Schwarzschild black hole (Bucciotti,
// Redondo-Yuste, Zhong, Kuntz & Cardoso, 2609.20934): five slides.
//
//   sc-setup   the linear scattering state (Regge-Wheeler, l = 2, M omega = 0.3,
//              computed for this slide: figures/sc-states.json) over its
//              potential; → the second-order wave at 2 omega, l = 4, from an
//              illustrative source (V_2 psi^2); → the definition of Q
//   sc-method  the three steps; the third accumulates the Green's-function
//              integral up to a radius R (same illustrative source), against a
//              source that does not decay
//   sc-res     self-couplings (l,l) x (l,l) -> (2l,2l) (the paper's Fig. 4),
//              against M omega'; → time-domain points; → in units of Re omega;
//              → an inset at low frequencies: six channels (Fig. 2), the omega'^2 law
//   sc-map     |Q| over (omega_1, omega_2) for (2,2) x (2,2) -> (4,4) (Fig. 7);
//              → the resonance line; → back to the ringdown
// The paper's data: figures/sc-data.json.
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, a, p) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function smooth(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
  function lg(v) { return Math.log10(v); }
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function pow10(e) { return e === 0 ? '1' : '10' + String(e).split('').map(function (c) { return SUP[c]; }).join(''); }

  // every slide here: classes s-on1, s-on2, ... follow data-s; cb(s, forward)
  function stepper(slide, id, hooks) {
    var last = 0;
    function apply(s, fwd) {
      for (var i = 1; i <= 4; i++) slide.classList.toggle('s-on' + i, s >= i);
      if (hooks.step) hooks.step(s, fwd);
    }
    Deck.on(id, {
      enter: function (sl, dir) { last = +sl.dataset.s || 0; apply(last, false); if (hooks.enter) hooks.enter(dir, last); },
      leave: function () { if (hooks.leave) hooks.leave(); }
    });
    new MutationObserver(function () {
      var s = +slide.dataset.s || 0; if (s === last) return;
      var f = s > last; last = s; apply(s, f);
    }).observe(slide, { attributes: true, attributeFilter: ['data-s'] });
  }
  function loop(fn) {                                  // a rAF loop that can be stopped
    var raf = null, t0 = 0;
    return {
      start: function () { cancelAnimationFrame(raf); t0 = performance.now(); (function f(now) { raf = requestAnimationFrame(f); fn((now - t0) / 1000, now); })(t0); },
      stop: function () { cancelAnimationFrame(raf); raf = null; }
    };
  }

  var ST = null, DA = null;
  var ready = Promise.all([
    fetch('figures/sc-states.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }),
    fetch('figures/sc-data.json', { cache: 'no-cache' }).then(function (r) { return r.json(); })
  ]).then(function (v) { ST = v[0]; DA = v[1]; });

  // ======================================================================
  // sc-setup
  (function () {
    var slide = document.getElementById('sc-setup'); if (!slide) return;
    var svg = slide.querySelector('.sc-svg');
    var X0 = 170, X1 = 1250, XA = -50, XB = 130;
    var LANES = [{ y: 390, h: 115 }, { y: 750, h: 115 }];
    function px(x) { return X0 + (x - XA) / (XB - XA) * (X1 - X0); }
    var R = {}, reveal = 0, revealOn = false, revealT0 = 0;

    function build() {
      svg.innerHTML = '';
      var idx = []; ST.x.forEach(function (x, i) { if (x >= XA && x <= XB) idx.push(i); });
      R.idx = idx;
      LANES.forEach(function (L, k) {
        var g = el('g', { class: 'sc-lane sc-lane' + k }, svg);
        var V = k ? ST.V4 : ST.V, vmax = Math.max.apply(null, V);
        var d = 'M' + px(XA) + ' ' + (L.y + L.h);
        idx.forEach(function (i) { d += 'L' + px(ST.x[i]).toFixed(1) + ' ' + (L.y + L.h - V[i] / vmax * 1.15 * L.h).toFixed(1); });
        el('path', { d: d + 'L' + px(XB) + ' ' + (L.y + L.h) + 'Z', class: 'sc-pot' }, g);
        el('line', { x1: X0, x2: X1, y1: L.y, y2: L.y, class: 'sc-zero' }, g);
        el('text', { x: X0, y: L.y - L.h - 18, class: 'sc-lab sc-lab' + k }, g).textContent = k ? 'at second order, ψ⁽²⁾ at frequency 2ω' : 'ψ⁽¹⁾ at frequency ω';
        if (k) {
          el('text', { x: X0, y: L.y + L.h + 38, class: 'sc-end' }, svg).textContent = '← horizon';
          el('text', { x: X1, y: L.y + L.h + 38, class: 'sc-end sc-r' }, svg).textContent = 'infinity →';
        }
        el('text', { x: px(2), y: L.y + L.h + 38, class: 'sc-end sc-mid' }, g).textContent = k ? 'potential, ℓ = 4' : 'potential, ℓ = 2';
        if (k) {
          var s = ST.s, smax = Math.max.apply(null, s), ds = 'M' + px(XA) + ' ' + L.y;
          idx.forEach(function (i) { ds += 'L' + px(ST.x[i]).toFixed(1) + ' ' + (L.y - s[i] / smax * 0.55 * L.h).toFixed(1); });
          idx.slice().reverse().forEach(function (i) { ds += 'L' + px(ST.x[i]).toFixed(1) + ' ' + (L.y + s[i] / smax * 0.55 * L.h).toFixed(1); });
          R.src = el('path', { d: ds + 'Z', class: 'sc-srcfill' }, g);
          el('text', { x: px(-14), y: L.y - 0.62 * L.h, class: 'sc-srclab' }, g).textContent = 'source ∝ ψ⁽¹⁾ψ⁽¹⁾';
        }
        L.path = el('path', { class: 'sc-wave sc-wave' + k }, g);
      });
      // arrows: in and out at infinity, and into the horizon
      R.arr = el('g', { class: 'sc-arrows' }, svg);
      [[0, 'in', -1, 0], [0, 'out', 1, 1], [1, 'out', 1, 1], [1, 'in', -1, -1]].forEach(function (a) {
        var L = LANES[a[0]], left = a[3] < 0, x = left ? X0 + 20 : X1 - 150, y = a[3] < 0 ? L.y + 0.62 * L.h : L.y - L.h + 6 + (a[1] === 'out' && a[0] === 0 ? 46 : 0);
        var g = el('g', { class: 'sc-arr sc-arr' + a[0] }, R.arr);
        var xa = x, xb = x + 120; if (a[2] < 0) { xa = x + 120; xb = x; }
        el('line', { x1: xa, x2: xb, y1: y, y2: y, 'marker-end': 'url(#sc-head)' }, g);
        el('text', { x: x + 60, y: y - 12, class: 'sc-arrlab' }, g).textContent = a[1];
      });
      var defs = el('defs', {}, svg), mk = el('marker', { id: 'sc-head', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
      el('path', { d: 'M0 0 L10 5 L0 10 Z', class: 'sc-headp' }, mk);
    }
    var W = 0.3, TS = (2 * Math.PI / W) / 2.6;       // a linear period lasts 2.6 s
    function draw(t) {
      var tm = t * TS, c1 = Math.cos(W * tm), s1 = Math.sin(W * tm), c2 = Math.cos(2 * W * tm), s2 = Math.sin(2 * W * tm);
      var L0 = LANES[0], L1 = LANES[1], d0 = '', d1 = '', k0 = L0.h * 0.95 / 2.3, k1 = L1.h * 0.95 / 0.6;
      R.idx.forEach(function (i, n) {
        var x = ST.x[i], p = ST.p[i], q = ST.q[i];
        d0 += (n ? 'L' : 'M') + px(x).toFixed(1) + ' ' + (L0.y - (p[0] * c1 + p[1] * s1) * k0).toFixed(1);
        var m = smooth((reveal - Math.abs(x - 2)) / 12);
        d1 += (n ? 'L' : 'M') + px(x).toFixed(1) + ' ' + (L1.y - m * (q[0] * c2 + q[1] * s2) * k1).toFixed(1);
      });
      L0.path.setAttribute('d', d0); L1.path.setAttribute('d', d1);
    }
    var lp = loop(function (t, now) {
      if (!ST) return;
      if (!R.idx) build();
      if (revealOn) reveal = Math.min(200, (now - revealT0) / 1000 * 45); else reveal = 0;
      draw(t);
    });
    stepper(slide, 'sc-setup', {
      enter: function (dir, s) { ready.then(function () { if (!R.idx) build(); revealOn = s >= 1; revealT0 = -1e9; lp.start(); }); },
      leave: function () { lp.stop(); },
      step: function (s, fwd) { if (s >= 1 && !revealOn) { revealOn = true; revealT0 = fwd ? performance.now() : -1e9; } if (s < 1) revealOn = false; }
    });
  })();

  // ======================================================================
  // sc-method
  (function () {
    var slide = document.getElementById('sc-method'); if (!slide) return;
    var v1 = slide.querySelector('.sm-v1'), s2 = slide.querySelector('.sm-s2'), sp = slide.querySelector('.sm-sp');
    var R = {}, spT = -1;

    function buildV1() {
      v1.innerHTML = '';
      var XA = -40, XB = 110, px = function (x) { return 20 + (x - XA) / (XB - XA) * 480; };
      var idx = []; ST.x.forEach(function (x, i) { if (x >= XA && x <= XB) idx.push(i); });
      var vmax = Math.max.apply(null, ST.V), d = 'M20 230';
      idx.forEach(function (i) { d += 'L' + px(ST.x[i]).toFixed(1) + ' ' + (230 - ST.V[i] / vmax * 170).toFixed(1); });
      el('path', { d: d + 'L500 230Z', class: 'sc-pot' }, v1);
      el('line', { x1: 20, x2: 500, y1: 130, y2: 130, class: 'sc-zero' }, v1);
      R.v1 = el('path', { class: 'sc-wave sc-wave0' }, v1); R.v1idx = idx; R.v1px = px;
      el('text', { x: 20, y: 256, class: 'sm-ax' }, v1).textContent = 'horizon';
      el('text', { x: 500, y: 256, class: 'sm-ax sc-r' }, v1).textContent = 'r* →';
    }
    function buildS2() {
      s2.innerHTML = '';
      el('line', { x1: 20, x2: 500, y1: 120, y2: 120, class: 'sc-zero' }, s2);
      R.bare = el('path', { class: 'sm-bare-l' }, s2); R.reg = el('path', { class: 'sm-good-l' }, s2);
      el('text', { x: 500, y: 236, class: 'sm-ax sc-r' }, s2).textContent = 'r →';
      el('text', { x: 500, y: 30, class: 'sm-tag sm-bare-t sc-r' }, s2).textContent = 'bare';
      el('text', { x: 500, y: 200, class: 'sm-tag sm-good-t sc-r' }, s2).textContent = 'regularized';
    }
    // card 3: the integral from the horizon out to a radius R, as R grows
    var SX0 = 40, SX1 = 500, SY0 = 20, SY1 = 260;
    function buildSp() {
      sp.innerHTML = '';
      var c = ST.spiral.c, b = ST.spiral.b, xs = ST.spiral.x;
      R.sx = function (x) { return SX0 + (x - xs[0]) / (xs[xs.length - 1] - xs[0]) * (SX1 - SX0); };
      R.mg = c.map(function (v) { return Math.hypot(v[0], v[1]); });
      var bm = b.map(function (v) { return Math.hypot(v[0], v[1]); }), half = bm[xs.findIndex(function (x) { return x >= 200; })];
      R.mb = bm.map(function (v) { return v * 1.35 / half; });
      R.sy = function (v) { return SY1 - v / 1.6 * (SY1 - SY0); };
      el('line', { x1: SX0, x2: SX1, y1: SY1, y2: SY1, class: 'sc-zero' }, sp);
      el('line', { x1: SX0, x2: SX0, y1: SY0, y2: SY1, class: 'sc-zero' }, sp);
      el('line', { x1: SX0, x2: SX1, y1: R.sy(1), y2: R.sy(1), class: 'sm-goal' }, sp);
      el('text', { x: SX1, y: 290, class: 'sm-ax sc-r' }, sp).textContent = 'R →';
      el('text', { x: SX0 - 8, y: R.sy(1) + 6, class: 'sm-ax sc-r' }, sp).textContent = '𝒬';
      el('text', { x: 250, y: 40, class: 'sm-tag sm-bare-t' }, sp).textContent = 'bare';
      el('text', { x: SX1, y: R.sy(1) - 12, class: 'sm-tag sm-good-t sc-r' }, sp).textContent = 'regularized';
      var defs = el('defs', {}, sp), cp = el('clipPath', { id: 'sm-spclip' }, defs);
      el('rect', { x: 0, y: SY0, width: 520, height: SY1 - SY0 + 4 }, cp);
      var g = el('g', { 'clip-path': 'url(#sm-spclip)' }, sp);
      R.spB = el('path', { class: 'sm-bare-l' }, g); R.spG = el('path', { class: 'sm-good-l' }, g);
      R.dotB = el('circle', { r: 7, class: 'sm-bare-d' }, g); R.dotG = el('circle', { r: 8, class: 'sm-good-d' }, g);
    }
    function drawSp(u) {
      var xs = ST.spiral.x, n = Math.max(2, Math.floor(u * xs.length)), dg = '', db = '';
      for (var i = 0; i < n; i++) {
        var X = R.sx(xs[i]).toFixed(1);
        dg += (i ? 'L' : 'M') + X + ' ' + R.sy(R.mg[i]).toFixed(1);
        db += (i ? 'L' : 'M') + X + ' ' + R.sy(R.mb[i]).toFixed(1);
      }
      R.spG.setAttribute('d', dg); R.spB.setAttribute('d', db);
      R.dotG.setAttribute('cx', R.sx(xs[n - 1])); R.dotG.setAttribute('cy', R.sy(R.mg[n - 1]));
      R.dotB.setAttribute('cx', R.sx(xs[n - 1])); R.dotB.setAttribute('cy', R.sy(R.mb[n - 1]));
    }
    var lp = loop(function (t) {
      if (!ST) return;
      if (!R.v1) { buildV1(); buildS2(); buildSp(); }
      // card 1: the scattering state, oscillating
      var w = 0.3, tm = t * (2 * Math.PI / w) / 2.6, c1 = Math.cos(w * tm), s1 = Math.sin(w * tm), d = '';
      R.v1idx.forEach(function (i, n) { var p = ST.p[i]; d += (n ? 'L' : 'M') + R.v1px(ST.x[i]).toFixed(1) + ' ' + (130 - (p[0] * c1 + p[1] * s1) * 42).toFixed(1); });
      R.v1.setAttribute('d', d);
      // card 2: a source that keeps its size at large r, against one that decays (schematic)
      var db = '', dr = '';
      for (var j = 0; j <= 160; j++) {
        var x = j / 160, r = 2 + 38 * x, ph = 1.3 * r - 5 * t;
        var env = 1 - Math.exp(-(r - 2) / 1.5);
        db += (j ? 'L' : 'M') + (20 + 480 * x).toFixed(1) + ' ' + (120 - 80 * env * Math.cos(ph)).toFixed(1);
        dr += (j ? 'L' : 'M') + (20 + 480 * x).toFixed(1) + ' ' + (120 - 95 * env * Math.pow(3 / (r + 1), 2) * Math.cos(ph)).toFixed(1);
      }
      R.bare.setAttribute('d', db); R.reg.setAttribute('d', dr);
      // card 3: the integral
      if (spT >= 0) drawSp(smooth(Math.min(1, (performance.now() - spT) / 5000)));
      else drawSp(0);
    });
    stepper(slide, 'sc-method', {
      enter: function (dir, s) { ready.then(function () { spT = s >= 2 ? performance.now() - 6000 : -1; lp.start(); }); },
      leave: function () { lp.stop(); },
      step: function (s, fwd) { if (s >= 2 && spT < 0) spT = fwd ? performance.now() : performance.now() - 6000; if (s < 2) spT = -1; }
    });
  })();

  // ======================================================================
  // the 5-point Compton diagram (sc-res, at low frequencies)
  function compton(svgEl) {
    function wavy(x1, y1, x2, y2, n, amp) {
      var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, d = '';
      for (var i = 0; i <= 120; i++) {
        var s = i / 120, w = amp * Math.sin(2 * Math.PI * n * s);
        d += (i ? 'L' : 'M') + (x1 + dx * s - uy * w).toFixed(1) + ' ' + (y1 + dy * s + ux * w).toFixed(1);
      }
      return d;
    }
    var C = [210, 190], g = '';
    g += '<line class="fd-heavy" x1="20" y1="' + (C[1] + 4) + '" x2="400" y2="' + (C[1] + 4) + '"/>';
    g += '<line class="fd-heavy" x1="20" y1="' + (C[1] - 4) + '" x2="400" y2="' + (C[1] - 4) + '"/>';
    [[40, 30, 'ω₁', -20, 0], [20, 105, 'ω₂', -6, -18], [390, 40, 'ω₁ + ω₂', -40, -14]].forEach(function (p, i) {
      var x2 = C[0] + (p[0] - C[0]) * 0.22, y2 = C[1] + (p[1] - C[1]) * 0.22;
      g += '<path class="fd-grav' + (i === 2 ? ' fd-out' : '') + '" d="' + wavy(p[0], p[1], x2, y2, 7, 6) + '"/>';
      g += '<text class="fd-lab' + (i === 2 ? ' fd-out' : '') + '" x="' + (p[0] + p[3]) + '" y="' + (p[1] + p[4]) + '">' + p[2] + '</text>';
    });
    g += '<circle class="fd-blob" cx="' + C[0] + '" cy="' + C[1] + '" r="34"/>';
    g += '<text class="fd-lab fd-bh" x="20" y="' + (C[1] + 44) + '">black hole</text>';
    svgEl.innerHTML = g;
  }

  // a log-y plot frame; returns mappers
  function frame(g, o) {
    el('rect', { x: o.X0, y: o.Y0, width: o.X1 - o.X0, height: o.Y1 - o.Y0, class: 'pl-box' }, g);
    for (var e = o.ylo; e <= o.yhi; e++) {
      var yy = o.y(Math.pow(10, e));
      el('line', { x1: o.X0, x2: o.X0 + 12, y1: yy, y2: yy, class: 'pl-tk' }, g);
      el('text', { x: o.X0 - 14, y: yy + 9, class: 'pl-tick pl-end' }, g).textContent = pow10(e);
    }
    el('text', { x: o.X0 - 110, y: (o.Y0 + o.Y1) / 2, class: 'pl-lab', transform: 'rotate(-90 ' + (o.X0 - 110) + ' ' + (o.Y0 + o.Y1) / 2 + ')' }, g).textContent = '|𝒬|';
  }

  // ======================================================================
  // sc-res
  (function () {
    var slide = document.getElementById('sc-res'); if (!slide) return;
    var svg = slide.querySelector('.sr-svg');
    var X0 = 260, X1 = 1200, Y0 = 190, Y1 = 810, YL = -3, YH = 0;
    var A0 = 0, A1 = 2.8, B0 = 0.25, B1 = 1.15, CUT = 1.12;
    function xa(w) { return X0 + (w - A0) / (A1 - A0) * (X1 - X0); }
    function xb(u) { return X0 + (u - B0) / (B1 - B0) * (X1 - X0); }
    function y(q) { return Y1 - (lg(Math.max(q, 1e-4)) - YL) / (YH - YL) * (Y1 - Y0); }
    var R = {}, built = false, mix = 0, mixFrom = 0, mixTo = 0, mixT = 0, draw = 1, drawT = 0, tdOn = 0;
    var zoomOn = false, zoomT = 0;
    compton(slide.querySelector('.fd'));

    // the inset: low frequencies, log-log (the paper's Fig. 2), in the empty lower right
    var IX0 = 760, IX1 = 1180, IY0 = 560, IY1 = 790, LXL = -3, LXH = lg(0.7), LYL = -8, LYH = 0;
    function lx(w) { return IX0 + (lg(w) - LXL) / (LXH - LXL) * (IX1 - IX0); }
    function ly(q) { return IY1 - (lg(Math.max(q, 1e-9)) - LYL) / (LYH - LYL) * (IY1 - IY0); }
    function buildLow(gl) {
      el('rect', { x: IX0 - 70, y: IY0 - 50, width: IX1 - IX0 + 85, height: IY1 - IY0 + 100, class: 'sr-inbg' }, gl);
      el('rect', { x: IX0, y: IY0, width: IX1 - IX0, height: IY1 - IY0, class: 'pl-box' }, gl);
      [-8, -4, 0].forEach(function (e) {
        el('text', { x: IX0 - 10, y: ly(Math.pow(10, e)) + 7, class: 'sr-itick pl-end' }, gl).textContent = pow10(e);
      });
      [-3, -2, -1].forEach(function (e) {
        el('text', { x: lx(Math.pow(10, e)), y: IY1 + 26, class: 'sr-itick' }, gl).textContent = pow10(e);
      });
      el('text', { x: IX0 + 12, y: IY0 - 16, class: 'sr-ilab' }, gl).textContent = 'low frequencies';
      DA.low.forEach(function (c, i) {
        var d = '';
        c.w.forEach(function (w, n) { d += (n ? 'L' : 'M') + lx(w).toFixed(1) + ' ' + ly(c.Q[n]).toFixed(1); });
        el('path', { d: d, class: 'sr-iline sr-c' + Math.min(4, Math.round(i * 4 / 5)) }, gl);
      });
      el('path', { class: 'sr-ilaw', d: 'M' + lx(1e-3) + ' ' + ly(0.049e-6) + 'L' + lx(0.3) + ' ' + ly(0.049 * 0.09) }, gl);
      el('text', { x: lx(0.012), y: ly(0.049 * 1.44e-4) + 36, class: 'sr-ilab' }, gl).textContent = '∝ (Mω′)²';
    }

    function build() {
      svg.innerHTML = ''; built = true;
      var top = svg;
      svg = el('g', {}, top);
      R.gLow = el('g', { class: 'sr-low' }, top); buildLow(R.gLow);
      var g = el('g', { class: 'pl-axes' }, svg);
      frame(g, { X0: X0, X1: X1, Y0: Y0, Y1: Y1, ylo: YL, yhi: YH, y: y });
      R.tA = el('g', { class: 'sr-ticks' }, g); R.tB = el('g', { class: 'sr-ticks' }, g);
      [0, 0.5, 1, 1.5, 2, 2.5].forEach(function (v) {
        el('text', { x: xa(v), y: Y1 + 42, class: 'pl-tick' }, R.tA).textContent = v;
      });
      el('text', { x: (X0 + X1) / 2, y: Y1 + 92, class: 'pl-lab' }, R.tA).textContent = 'Mω′';
      [0.4, 0.6, 0.8, 1].forEach(function (v) {
        el('text', { x: xb(v), y: Y1 + 42, class: 'pl-tick' }, R.tB).textContent = v;
      });
      el('text', { x: (X0 + X1) / 2, y: Y1 + 92, class: 'pl-lab' }, R.tB).innerHTML = 'ω′ / Re ω<tspan baseline-shift="sub" font-size="70%">ℓ′0</tspan>';
      var defs = el('defs', {}, svg), cp = el('clipPath', { id: 'sr-clip' }, defs);
      el('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0 }, cp);
      var cg = el('g', { 'clip-path': 'url(#sr-clip)' }, svg);
      R.curves = DA.res.map(function (c, i) {
        var keep = []; c.w.forEach(function (w, n) { if (w / c.reW <= CUT) keep.push(n); });
        var tk = []; c.tw.forEach(function (w, n) { if (w / c.reW <= CUT && w / c.reW >= B0) tk.push(n); });
        var gg = el('g', { class: 'sr-c' + i }, cg);
        var o = {
          c: c, keep: keep, tk: tk,
          vline: el('line', { y1: Y0, y2: Y1, class: 'sr-res' }, gg),
          path: el('path', { class: 'pl-line' }, gg),
          dots: tk.map(function () { return el('circle', { r: 7, class: 'sr-tdp' }, gg); }),
          lab: el('text', { class: 'sr-lab' }, svg)
        };
        o.lab.setAttribute('class', 'sr-lab sr-c' + i);
        o.lab.textContent = 'ℓ′ = ' + 2 * c.l;
        return o;
      });
    }
    function lerp(a, b, u) { return a + (b - a) * u; }
    function paint(now) {
      var u = smooth((now - mixT) / 1600); mix = mixFrom + (mixTo - mixFrom) * u;
      R.gLow.style.opacity = zoomOn ? smooth((now - zoomT - 700) / 700) : 0;
      var dr = Math.min(1, (now - drawT) / 3500 * draw);
      R.tA.style.opacity = 1 - mix; R.tB.style.opacity = mix;
      R.curves.forEach(function (o, i) {
        var c = o.c, f = Math.max(0, Math.min(1, dr * 5 - i * 0.9)), d = '', n = Math.max(1, Math.round(o.keep.length * f));
        function X(w) { return (1 - mix) * xa(w) + mix * xb(w / c.reW); }
        for (var k = 0; k < n; k++) { var j = o.keep[k]; d += (k ? 'L' : 'M') + X(c.w[j]).toFixed(1) + ' ' + y(c.Q[j]).toFixed(1); }
        o.path.setAttribute('d', f > 0 ? d : '');
        var xr = X(c.reW); o.vline.setAttribute('x1', xr); o.vline.setAttribute('x2', xr); o.vline.style.opacity = f > 0.2 ? 1 : 0;
        o.dots.forEach(function (dt, k) { var j = o.tk[k]; dt.setAttribute('cx', X(c.tw[j])); dt.setAttribute('cy', y(c.tQ[j])); dt.style.opacity = tdOn; });
        // label at the peak
        var jm = o.keep.reduce(function (a, j) { return c.Q[j] > c.Q[a] ? j : a; }, o.keep[0]);
        o.lab.setAttribute('x', X(c.w[jm]) + (mix > 0.5 ? 0 : 0)); o.lab.setAttribute('y', y(c.Q[jm]) - 20 - (mix > 0.5 ? i * 0 : 0));
        o.lab.style.opacity = f >= 1 ? (1 - mix) : 0;
      });
    }
    var lp = loop(function (t, now) { if (DA) { if (!built) build(); paint(now); } });
    stepper(slide, 'sc-res', {
      enter: function (dir, s) {
        ready.then(function () {
          if (!built) build();
          drawT = dir > 0 && s === 0 ? performance.now() : -1e9;
          tdOn = s >= 1 ? 1 : 0; mixFrom = mixTo = s === 2 ? 1 : 0; mixT = 0;
          zoomOn = s >= 3; zoomT = -1e9; lp.start();
        });
      },
      leave: function () { lp.stop(); },
      step: function (s, fwd) {
        tdOn = s >= 1 ? 1 : 0;
        var tgt = s === 2 ? 1 : 0;
        if (tgt !== mixTo) { mixFrom = mix; mixTo = tgt; mixT = performance.now(); }
        if (s >= 3 && !zoomOn) { zoomOn = true; zoomT = fwd ? performance.now() : -1e9; }
        if (s < 3) zoomOn = false;
      }
    });
  })();

  // ======================================================================
  // sc-map: three channels, one per press, then the code
  (function () {
    var slide = document.getElementById('sc-map'); if (!slide) return;
    var svg = slide.querySelector('.sm2-svg');
    var PX = [190, 760, 1330], PY = 250, PS = 430, ZL = -3.4, ZH = -0.3;
    var VIR = [[68, 1, 84], [72, 40, 120], [62, 74, 137], [49, 104, 142], [38, 130, 142], [31, 158, 137], [53, 183, 121], [109, 205, 89], [180, 222, 44], [253, 231, 37]];
    function cmap(u) { u = Math.max(0, Math.min(1, u)) * (VIR.length - 1); var i = Math.min(VIR.length - 2, Math.floor(u)), f = u - i; return VIR[i].map(function (c, k) { return c + (VIR[i + 1][k] - c) * f; }); }
    var SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆'];
    var built = false;
    function build() {
      built = true; svg.innerHTML = '';
      DA.maps.forEach(function (m, k) {
        var cv = slide.querySelector('.sm2-m' + k), n = m.n, X0 = PX[k];
        cv.width = n; cv.height = n;
        cv.style.left = X0 + 'px'; cv.style.top = PY + 'px'; cv.style.width = PS + 'px'; cv.style.height = PS + 'px';
        var c = cv.getContext('2d'), im = c.createImageData(n, n);
        for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
          var z = m.z[j * n + i], o = 4 * ((n - 1 - j) * n + i);
          if (z === null) { im.data[o + 3] = 0; continue; }
          var rgb = cmap((z - ZL) / (ZH - ZL));
          im.data[o] = rgb[0]; im.data[o + 1] = rgb[1]; im.data[o + 2] = rgb[2]; im.data[o + 3] = 255;
        }
        c.putImageData(im, 0, 0);
        function X(w) { return X0 + w / m.xhi * PS; }
        function Y(w) { return PY + PS - w / m.yhi * PS; }
        var g = el('g', { class: 'sm2-panel sm2-pan' + k }, svg), L = m.l, Lp = L + 2;
        el('rect', { x: X0, y: PY, width: PS, height: PS, class: 'pl-box' }, g);
        el('text', { x: X0 + PS / 2, y: PY - 26, class: 'sm2-title' }, g).textContent = '(2,2) × (' + L + ',' + L + ') → (' + Lp + ',' + Lp + ')';
        var step = m.xhi > 0.7 ? 0.2 : 0.1;
        for (var v = step; v < m.xhi - 1e-6; v += step) el('text', { x: X(v), y: PY + PS + 36, class: 'pl-tick' }, g).textContent = +v.toFixed(1);
        el('text', { x: X0 + PS / 2, y: PY + PS + 80, class: 'pl-lab' }, g).textContent = 'Mω' + SUB[L] + SUB[L];
        if (k === 0) {
          [0.1, 0.2, 0.3, 0.4, 0.5].forEach(function (v) { el('text', { x: X0 - 12, y: Y(v) + 9, class: 'pl-tick pl-end' }, g).textContent = v; });
          el('text', { x: X0 - 90, y: PY + PS / 2, class: 'pl-lab', transform: 'rotate(-90 ' + (X0 - 90) + ' ' + (PY + PS / 2) + ')' }, g).textContent = 'Mω₂₂';
        }
        // resonance: omega_x + omega_y = Re omega_{l'0}, clipped to the box
        var pts = [];
        [[0, m.reW], [m.xhi, m.reW - m.xhi], [m.reW, 0], [m.reW - m.yhi, m.yhi]].forEach(function (p) {
          if (p[0] >= -1e-9 && p[0] <= m.xhi + 1e-9 && p[1] >= -1e-9 && p[1] <= m.yhi + 1e-9) pts.push(p);
        });
        if (pts.length >= 2) el('line', { x1: X(pts[0][0]), y1: Y(pts[0][1]), x2: X(pts[1][0]), y2: Y(pts[1][1]), class: 'sm2-line' }, g);
      });
      // colour bar
      var bx = PX[2] + PS + 30, defs = el('defs', {}, svg), gr = el('linearGradient', { id: 'sm2-grad', x1: 0, y1: 1, x2: 0, y2: 0 }, defs);
      VIR.forEach(function (c, i) { el('stop', { offset: i / (VIR.length - 1), 'stop-color': 'rgb(' + c.join(',') + ')' }, gr); });
      el('rect', { x: bx, y: PY, width: 22, height: PS, fill: 'url(#sm2-grad)' }, svg);
      [-3, -2, -1].forEach(function (e) {
        el('text', { x: bx + 32, y: PY + PS - (e - ZL) / (ZH - ZL) * PS + 8, class: 'pl-tick pl-start' }, svg).textContent = pow10(e);
      });
      el('text', { x: bx + 11, y: PY - 16, class: 'pl-tick' }, svg).textContent = '|𝒬|';
    }
    stepper(slide, 'sc-map', { enter: function () { ready.then(function () { if (!built) build(); }); } });
  })();
})();
