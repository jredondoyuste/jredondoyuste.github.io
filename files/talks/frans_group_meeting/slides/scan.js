// Second order across Kerr-Newman: a quadratic coupling R, the amplitude of
// the l = m = 4 response per square of the l = m = 2 parent mode, over the
// (a, Q) quarter disk (the t21 bulk scan, down to a surface gravity of 0.05).
// Pick a black hole on the left (drag the point, or let it wander); the right
// shows R for the gravitational-wave output (top) and the electromagnetic
// output (bottom) in the complex plane: every black hole of the scan faint,
// this one as a dot with a short trail.
//
// One module, several slides: every <section class="slide sc2-slide"
// data-channel="…"> takes its channel from data/scan.json (exported by
// tasks/t25-dirac-geometry/S16/export_scan.py in the 2nd-kerr-newman repo;
// control there: the table at a = 0.2, Q = 0.4 matches an independent solve
// to 7e-7). Between the scan points: linear on the Delaunay triangles.
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var DISK = { x0: 170, y0: 880, k: 600 };
  var PLANES = [
    { out: 'gw', x0: 1060, x1: 1780, y0: 200, y1: 520, cls: 'sc2-gw', name: 'R_GW' },
    { out: 'em', x0: 1060, x1: 1780, y0: 600, y1: 920, cls: 'sc2-em', name: 'R_EM' }
  ];
  var TRAIL = 90;                                        // frames of trail

  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function poly(pts) {
    return pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('');
  }
  function ticks(lo, hi, n) {
    var span = Math.abs(hi - lo), raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw)));
    var step = [1, 2, 5, 10].map(function (m) { return m * p; }).find(function (s) { return s >= raw; });
    var out = [];
    for (var v = Math.ceil(lo / step) * step; v <= hi + 1e-12; v += step) out.push(Math.abs(v) < 1e-12 ? 0 : v);
    return { vals: out, dec: Math.max(0, -Math.floor(Math.log10(step) + 1e-9)) };
  }
  function num(v, d) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(d); }

  function setup(slide, C) {
    // each slide scales its own planes
    var PL = PLANES.map(function (p) { return Object.assign({}, p); });
    var svg = slide.querySelector('.sc2-svg');
    var A = C.a, Q = C.Q, at = { a: 0.557, Q: 0.502 }, wander = true, t0 = 0, raf = 0, trail = [];
    var rmax = Math.max.apply(null, A.map(function (a, i) { return Math.hypot(a, Q[i]); }));

    // R on the smooth lines of constant Q (Clough-Tocher, exported): linear
    // in a along a line, then linear between the two lines that bracket Q
    var CU = C.curves, QG = CU.Q, AG = CU.a, dQ = QG[1] - QG[0], dA = AG[1] - AG[0];
    // the last a with a value on each line: the edge of the scan at that Q
    var AMAX = CU.gw.map(function (row) { var j = row.length - 1; while (j > 0 && !row[j]) j--; return AG[j]; });
    function onLine(row, a) {
      var j = Math.min(AG.length - 2, Math.floor(a / dA)), f = a / dA - j;
      var p = row[j], q = row[j + 1] || p;
      while (!p && j > 0) { j--; p = row[j]; q = p; f = 0; }
      return [p[0] + f * (q[0] - p[0]), p[1] + f * (q[1] - p[1])];
    }
    function R(a, q) {
      var t = Math.min(QG.length - 1.000001, Math.max(0, (q - QG[0]) / dQ)), i = Math.floor(t), f = t - i;
      var out = {};
      ['gw', 'em'].forEach(function (o) {
        var u = onLine(CU[o][i], Math.min(a, AMAX[i])), v = onLine(CU[o][i + 1], Math.min(a, AMAX[i + 1]));
        out[o] = [u[0] + f * (v[0] - u[0]), u[1] + f * (v[1] - u[1])];
      });
      return out;
    }
    function amaxAt(q) {
      var t = Math.min(QG.length - 1.000001, Math.max(0, (q - QG[0]) / dQ)), i = Math.floor(t), f = t - i;
      return AMAX[i] + f * (AMAX[i + 1] - AMAX[i]);
    }

    function clamp(a, q) {
      q = Math.max(QG[0], Math.min(QG[QG.length - 1], q));
      return { a: Math.max(0, Math.min(a, amaxAt(q))), Q: q };
    }
    // the line of constant Q through the current point, sampled
    function lineAt(q, o) {
      var pts = [], am = amaxAt(q);
      for (var k = 0; k <= 60; k++) pts.push(R(am * k / 60, q)[o]);
      return pts;
    }
    var SHOW = QG.map(function (q, i) { return i; }).filter(function (i) { return Math.abs((QG[i] - 0.05) / 0.1 - Math.round((QG[i] - 0.05) / 0.1)) < 1e-6; });

    // each plane's window: all the scan's values, with a margin, square in scale
    PL.forEach(function (p) {
      var ws = C[p.out], re = ws.map(function (w) { return w[0]; }), im = ws.map(function (w) { return w[1]; });
      var r0 = Math.min.apply(null, re), r1 = Math.max.apply(null, re), i0 = Math.min.apply(null, im), i1 = Math.max.apply(null, im);
      var W = p.x1 - p.x0, H = p.y1 - p.y0;
      var sc = Math.max((r1 - r0) / W, (i1 - i0) / H) * 1.15;
      var rc = (r0 + r1) / 2, ic = (i0 + i1) / 2;
      p.re = [rc - sc * W / 2, rc + sc * W / 2]; p.im = [ic - sc * H / 2, ic + sc * H / 2];
      p.X = function (v) { return p.x0 + (v - p.re[0]) / (p.re[1] - p.re[0]) * W; };
      p.Y = function (v) { return p.y1 - (v - p.im[0]) / (p.im[1] - p.im[0]) * H; };
    });

    function dx(a) { return DISK.x0 + a * DISK.k; }
    function dy(q) { return DISK.y0 - q * DISK.k; }

    // ----- static parts ------------------------------------------------------
    var gStatic = el('g'), gLive = el('g'), handle;
    svg.appendChild(gStatic); svg.appendChild(gLive);
    var hit = el('rect', { 'class': 'sc2-hit', x: DISK.x0 - 20, y: dy(1.05), width: 1.1 * DISK.k, height: 1.1 * DISK.k });
    gStatic.appendChild(hit);
    gStatic.appendChild(el('path', { 'class': 'sc2-axis-line', d: 'M' + dx(0) + ' ' + dy(1.06) + 'V' + dy(0) + 'H' + dx(1.06) }));
    var arc = [];
    for (var i = 0; i <= 90; i++) { var th = Math.PI / 2 * i / 90; arc.push([dx(Math.cos(th)), dy(Math.sin(th))]); }
    gStatic.appendChild(el('path', { 'class': 'sc2-extremal', d: poly(arc) }));
    A.forEach(function (a, i) { gStatic.appendChild(el('circle', { 'class': 'sc2-node', cx: dx(a), cy: dy(Q[i]), r: 3 })); });
    // the lines of constant Q drawn on the right, here as horizontal segments
    SHOW.forEach(function (i) {
      gStatic.appendChild(el('path', { 'class': 'sc2-qline', d: 'M' + dx(0) + ' ' + dy(QG[i]) + 'H' + dx(AMAX[i]) }));
    });
    gStatic.appendChild(el('text', { 'class': 'sc2-axis', x: dx(0.5), y: dy(0) + 60, 'text-anchor': 'middle' }, 'a/M'));
    gStatic.appendChild(el('text', { 'class': 'sc2-axis', x: dx(0) - 70, y: dy(0.5), 'text-anchor': 'middle' }, 'Q/M'));
    gStatic.appendChild(el('text', { 'class': 'sc2-tick', x: dx(0), y: dy(0) + 38, 'text-anchor': 'middle' }, '0'));
    gStatic.appendChild(el('text', { 'class': 'sc2-tick', x: dx(1), y: dy(0) + 38, 'text-anchor': 'middle' }, '1'));
    gStatic.appendChild(el('text', { 'class': 'sc2-tick', x: dx(0) - 18, y: dy(1) + 8, 'text-anchor': 'end' }, '1'));

    PL.forEach(function (p) {
      gStatic.appendChild(el('rect', { 'class': 'sc2-box', x: p.x0, y: p.y0, width: p.x1 - p.x0, height: p.y1 - p.y0 }));
      var tr = ticks(p.re[0], p.re[1], 5), ti = ticks(p.im[0], p.im[1], 4);
      tr.vals.forEach(function (v) { gStatic.appendChild(el('text', { 'class': 'sc2-tick', x: p.X(v), y: p.y1 + 32, 'text-anchor': 'middle' }, num(v, tr.dec))); });
      ti.vals.forEach(function (v) { gStatic.appendChild(el('text', { 'class': 'sc2-tick', x: p.x0 - 14, y: p.Y(v) + 8, 'text-anchor': 'end' }, num(v, ti.dec))); });
      if (p.re[0] < 0 && p.re[1] > 0) gStatic.appendChild(el('line', { 'class': 'sc2-zero', x1: p.X(0), y1: p.y0, x2: p.X(0), y2: p.y1 }));
      if (p.im[0] < 0 && p.im[1] > 0) gStatic.appendChild(el('line', { 'class': 'sc2-zero', x1: p.x0, y1: p.Y(0), x2: p.x1, y2: p.Y(0) }));
      // R along lines of constant Q (every 0.1), faint
      SHOW.forEach(function (i) {
        var pts = CU[p.out][i].filter(Boolean).map(function (w) { return [p.X(w[0]), p.Y(w[1])]; });
        gStatic.appendChild(el('path', { 'class': 'sc2-curve ' + p.cls, d: poly(pts) }));
      });
    });

    // ----- live parts ----------------------------------------------------------
    function draw() {
      while (gLive.firstChild) gLive.removeChild(gLive.firstChild);
      var r = R(at.a, at.Q);
      trail.push(r); if (trail.length > TRAIL) trail.shift();
      // the current charge: its line on the disk and its curve in both planes
      gLive.appendChild(el('path', { 'class': 'sc2-qnow', d: 'M' + dx(0) + ' ' + dy(at.Q) + 'H' + dx(amaxAt(at.Q)) }));
      PL.forEach(function (p) {
        gLive.appendChild(el('path', { 'class': 'sc2-curnow ' + p.cls, d: poly(lineAt(at.Q, p.out).map(function (w) { return [p.X(w[0]), p.Y(w[1])]; })) }));
        gLive.appendChild(el('path', { 'class': 'sc2-trail ' + p.cls, d: poly(trail.map(function (t) { return [p.X(t[p.out][0]), p.Y(t[p.out][1])]; })) }));
        gLive.appendChild(el('circle', { 'class': 'sc2-dot ' + p.cls, cx: p.X(r[p.out][0]), cy: p.Y(r[p.out][1]), r: 11 }));
      });
      handle = el('circle', { 'class': 'sc2-handle', cx: dx(at.a), cy: dy(at.Q), r: 15 });
      gLive.appendChild(handle);
      var f = function (w) { return w[0].toFixed(4) + (w[1] < 0 ? ' − ' : ' + ') + Math.abs(w[1]).toFixed(4) + 'i'; };
      slide.querySelector('.sc2-read-aq').textContent = 'a/M = ' + at.a.toFixed(3) + ',  Q/M = ' + at.Q.toFixed(3);
      slide.querySelector('.sc2-read-gw').textContent = f(r.gw);
      slide.querySelector('.sc2-read-em').textContent = f(r.em);
    }

    function frame(t) {
      if (!t0) t0 = t;
      if (wander) {
        var u = (t - t0) / 1000;
        var rho = rmax * (0.55 + 0.4 * Math.sin(0.21 * u)), th = Math.PI / 4 + 0.72 * Math.sin(0.13 * u + 0.6);
        at = clamp(rho * Math.cos(th), rho * Math.sin(th));
      }
      draw();
      raf = requestAnimationFrame(frame);
    }

    function toCanvas(e) {
      var r = svg.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width * 1920, (e.clientY - r.top) / r.height * 1080];
    }
    var drag = false;
    function move(e) { var p = toCanvas(e); at = clamp((p[0] - DISK.x0) / DISK.k, (DISK.y0 - p[1]) / DISK.k); }
    hit.addEventListener('pointerdown', function (e) { wander = false; drag = true; hit.setPointerCapture(e.pointerId); move(e); });
    hit.addEventListener('pointermove', function (e) { if (drag) move(e); });
    hit.addEventListener('pointerup', function () { drag = false; });
    hit.addEventListener('pointercancel', function () { drag = false; });

    draw();
    Deck.on(slide.id, {
      enter: function () { wander = true; t0 = 0; trail = []; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); },
      leave: function () { cancelAnimationFrame(raf); }
    });
  }

  fetch('data/scan.json').then(function (r) { return r.json(); }).then(function (d) {
    document.querySelectorAll('.sc2-slide').forEach(function (s) { setup(s, d.channels[s.dataset.channel]); });
  });
})();
