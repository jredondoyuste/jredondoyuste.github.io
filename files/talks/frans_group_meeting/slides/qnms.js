// Kerr-Newman quasinormal modes, l = m = 2: pick a black hole in the (a, Q)
// quarter disk on the left (drag the point, or let it wander), and watch its
// gravitationally-led and electromagnetically-led frequencies move in the
// complex plane on the right.
//
// The frequencies are not solved here: they come from data/qnm.json
// (exported by tasks/t25-dirac-geometry/S16/export_qnm.py in the
// 2nd-kerr-newman repo): a knpert.qnm table on 9 lines of fixed Q x 17 values
// of a, up to a^2 + Q^2 = 0.9 (n = 0 and n = 1), interpolated with natural
// cubic splines in a along each line, then across the lines in Q; the
// near-extremal ladder on Q = 0.6; the exceptional point EP0 of t20.
//
// Steps:
//   0  fundamental modes, n = 0
//   1  first overtones, n = 1 (the plane opens up)
//   2  towards extremality on Q = 0.6: both panels zoom in; the zero-damped
//      ladder falls onto the real axis, the light-ring modes stay damped
//      (only if the table has the near-extremal series)
//   3  an exceptional point: the two gravitational modes n = 0, 1 approach,
//      then, around a small loop in (a, Q), trade places
//
// Motion: the views ease towards their targets with a time constant (TAU),
// so the zooms take the same time at any frame rate; the disk zooms about
// its centre, so the point of interest stays in view on the way in. When a
// stage changes, the right panel fades out with the old stage and in with
// the new one (FADE_OUT, FADE_IN), and the point glides to its new place.
(function () {
  'use strict';

  var slide = document.getElementById('qnms');
  var svg = slide.querySelector('.qn-svg');
  var NS = 'http://www.w3.org/2000/svg';

  // the two panels, on the 1920x1080 canvas
  var DISK = { x0: 170, y0: 880, x1: 800, y1: 250 };     // screen box of the left panel
  var PLANE = { x0: 1000, x1: 1780, y0: 250, y1: 880 };
  var FULL_D = { a0: 0, Q0: 0, k: 600 };                  // (a, Q) at the box's bottom-left corner, px per unit
  var FULL_P0 = { re: [0.3, 0.9], im: [0, -0.12] };
  var FULL_P1 = { re: [0.3, 0.9], im: [0, -0.32] };

  var data = null, interp = {}, hasN1 = false, hasNE = false;
  var at = { a: 0.557, Q: 0.502 };                       // the black hole of the title slide
  var wander = true, t0 = 0, tStep = 0, lastS = -1, raf = 0;
  var vd = clone(FULL_D), vp = clone(FULL_P0);           // current views, tweened towards targets
  var scene = null;                                      // what the scripted steps draw
  var TAU = 0.35, FADE_OUT = 0.25, FADE_IN = 0.45;      // seconds: view easing, stage crossfade
  var tPrev = 0, pending = -1, tFade = 0, alpha = 1;    // the stage crossfade
  var n1a = 0;                                           // opacity of the n = 1 modes, eased
  var hp = null;                                         // the handle as drawn (glides after a stage switch)

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // ----- natural cubic splines on complex values [re, im] ------------------

  function spline(xs, ys) {
    var n = xs.length, M = [[], []];
    for (var c = 0; c < 2; c++) {
      var y = ys.map(function (v) { return v[c]; });
      var a = new Array(n).fill(0), b = new Array(n).fill(0), d = new Array(n).fill(0), m = new Array(n).fill(0);
      for (var i = 1; i < n - 1; i++) {
        var h0 = xs[i] - xs[i - 1], h1 = xs[i + 1] - xs[i];
        a[i] = h0; b[i] = 2 * (h0 + h1); d[i] = h1;
        m[i] = 6 * ((y[i + 1] - y[i]) / h1 - (y[i] - y[i - 1]) / h0);
      }
      for (i = 2; i < n - 1; i++) { var k = a[i] / b[i - 1]; b[i] -= k * d[i - 1]; m[i] -= k * m[i - 1]; }
      var z = new Array(n).fill(0);
      for (i = n - 2; i >= 1; i--) z[i] = (m[i] - d[i] * z[i + 1]) / b[i];
      M[c] = z;
    }
    return function (x) {
      var i = 0;
      while (i < n - 2 && x > xs[i + 1]) i++;
      var h = xs[i + 1] - xs[i], u = (xs[i + 1] - x) / h, v = (x - xs[i]) / h;
      return [0, 1].map(function (c) {
        var y0 = ys[i][c], y1 = ys[i + 1][c], z0 = M[c][i], z1 = M[c][i + 1];
        return u * y0 + v * y1 + ((u * u * u - u) * z0 + (v * v * v - v) * z1) * h * h / 6;
      });
    };
  }

  function family(lines) {
    var Qs = lines.map(function (l) { return l.Q; });
    var fs = lines.map(function (l) {
      var amax = l.a[l.a.length - 1];
      return spline(l.a.map(function (a) { return a / amax; }), l.w);
    });
    return function (a, Q) {
      var s = Math.min(1, a / Math.sqrt(data.Qmax2 - Q * Q));
      return spline(Qs, fs.map(function (f) { return f(s); }))(Q);
    };
  }

  // ----- views -------------------------------------------------------------

  function dx(a) { return DISK.x0 + (a - vd.a0) * vd.k; }
  function dy(Q) { return DISK.y0 - (Q - vd.Q0) * vd.k; }
  function px(re) { return PLANE.x0 + (re - vp.re[0]) / (vp.re[1] - vp.re[0]) * (PLANE.x1 - PLANE.x0); }
  function py(im) { return PLANE.y0 + (im - vp.im[0]) / (vp.im[1] - vp.im[0]) * (PLANE.y1 - PLANE.y0); }

  // a disk view that puts (a, Q) at the box centre with `k` px per unit
  function diskAt(a, Q, k) {
    return { a0: a - (DISK.x1 - DISK.x0) / 2 / k, Q0: Q - (DISK.y0 - DISK.y1) / 2 / k, k: k };
  }
  // a plane view around a set of frequencies, with a margin
  function planeAround(ws, pad) {
    var re = ws.map(function (w) { return w[0]; }), im = ws.map(function (w) { return w[1]; });
    var r0 = Math.min.apply(null, re), r1 = Math.max.apply(null, re), i0 = Math.max.apply(null, im), i1 = Math.min.apply(null, im);
    var span = Math.max(r1 - r0, i0 - i1) * (1 + pad);
    var rc = (r0 + r1) / 2, ic = (i0 + i1) / 2;
    return { re: [rc - span / 2, rc + span / 2], im: [ic + span / 2, ic - span / 2] };
  }

  // tween views by a fraction f: geometric in the scale, linear in the centre
  // (the disk's corner (a0, Q0) is converted to its centre and back, so a
  // zoom does not swing the target out of the box on the way)
  var HW = (DISK.x1 - DISK.x0) / 2, HH = (DISK.y0 - DISK.y1) / 2;
  function easeDisk(v, t, f) {
    var ca = v.a0 + HW / v.k, cq = v.Q0 + HH / v.k;
    ca += (t.a0 + HW / t.k - ca) * f; cq += (t.Q0 + HH / t.k - cq) * f;
    v.k = Math.exp(Math.log(v.k) + (Math.log(t.k) - Math.log(v.k)) * f);
    v.a0 = ca - HW / v.k; v.Q0 = cq - HH / v.k;
  }
  function easePlane(v, t, f) {
    ['re', 'im'].forEach(function (k) {
      var c = (v[k][0] + v[k][1]) / 2, w = v[k][1] - v[k][0];
      var tc = (t[k][0] + t[k][1]) / 2, tw = t[k][1] - t[k][0];
      c += (tc - c) * f;
      w = Math.sign(tw) * Math.exp(Math.log(Math.abs(w)) + (Math.log(Math.abs(tw)) - Math.log(Math.abs(w))) * f);
      v[k] = [c - w / 2, c + w / 2];
    });
  }

  function clamp(a, Q) {
    var ls = data.families.grav.n0, qmin = ls[0].Q, qmax = ls[ls.length - 1].Q;
    Q = Math.max(qmin, Math.min(qmax, Q));
    a = Math.max(0, Math.min(a, Math.sqrt(data.Qmax2 - Q * Q)));
    return { a: a, Q: Q };
  }

  // ----- drawing helpers ------------------------------------------------------

  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function poly(pts) {
    return pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('');
  }
  // tick values at a round step covering [lo, hi]
  function ticks(lo, hi, n) {
    var span = Math.abs(hi - lo), raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw)));
    var step = [1, 2, 5, 10].map(function (m) { return m * p; }).find(function (s) { return s >= raw; });
    var out = [], a = Math.min(lo, hi), b = Math.max(lo, hi);
    for (var v = Math.ceil(a / step) * step; v <= b + 1e-12; v += step) out.push(v);
    return { vals: out, dec: Math.max(0, -Math.floor(Math.log10(step) + 1e-9)) };
  }

  var gDisk, gPlane, handle, gDiskArt, gDiskTicks;

  function build() {
    var clipD = el('clipPath', { id: 'qn-clip-d' });
    clipD.appendChild(el('rect', { x: DISK.x0 - 20, y: DISK.y1 - 40, width: DISK.x1 - DISK.x0 + 60, height: DISK.y0 - DISK.y1 + 60 }));
    var clipP = el('clipPath', { id: 'qn-clip-p' });
    clipP.appendChild(el('rect', { x: PLANE.x0, y: PLANE.y0, width: PLANE.x1 - PLANE.x0, height: PLANE.y1 - PLANE.y0 }));
    svg.appendChild(clipD); svg.appendChild(clipP);
    gDisk = el('g', { 'class': 'qn-disk' });
    gDisk.appendChild(el('rect', { 'class': 'qn-hit', x: DISK.x0 - 20, y: DISK.y1 - 40, width: DISK.x1 - DISK.x0 + 60, height: DISK.y0 - DISK.y1 + 60 }));
    gDiskArt = el('g', { 'clip-path': 'url(#qn-clip-d)' });
    gDisk.appendChild(gDiskArt);
    gDiskTicks = el('g', { 'class': 'qn-ticks' });          // outside the clip, so the 0 and 1 show
    gDisk.appendChild(gDiskTicks);
    gDisk.appendChild(el('text', { 'class': 'qn-axis', x: (DISK.x0 + DISK.x1) / 2, y: DISK.y0 + 60, 'text-anchor': 'middle' }, 'a/M'));
    gDisk.appendChild(el('text', { 'class': 'qn-axis', x: DISK.x0 - 70, y: (DISK.y0 + DISK.y1) / 2, 'text-anchor': 'middle' }, 'Q/M'));
    svg.appendChild(gDisk);
    gPlane = el('g', { 'class': 'qn-plane' });
    svg.appendChild(gPlane);
  }

  // ----- the left panel -------------------------------------------------------

  function drawDisk() {
    while (gDiskArt.firstChild) gDiskArt.removeChild(gDiskArt.firstChild);
    var g = gDiskArt;
    // the visible window, to sample the arcs finely where they show
    var aLo = vd.a0, aHi = vd.a0 + (DISK.x1 - DISK.x0) / vd.k, qLo = vd.Q0, qHi = vd.Q0 + (DISK.y0 - DISK.y1) / vd.k;
    function arc(rho, cls) {
      var t0 = Math.atan2(Math.max(qLo, 0), Math.min(aHi, rho)), t1 = Math.atan2(Math.min(qHi, rho), Math.max(aLo, 0));
      var lo = Math.max(0, Math.min(t0, t1) - 0.02), hi = Math.min(Math.PI / 2, Math.max(t0, t1) + 0.02), p = [];
      for (var i = 0; i <= 300; i++) { var t = lo + (hi - lo) * i / 300; p.push([dx(rho * Math.cos(t)), dy(rho * Math.sin(t))]); }
      g.appendChild(el('path', { 'class': cls, d: poly(p) }));
    }
    g.appendChild(el('path', { 'class': 'qn-axis-line', d: 'M' + dx(0) + ' ' + dy(1.06) + 'V' + dy(0) + 'H' + dx(1.06) }));
    arc(1, 'qn-extremal');
    arc(Math.sqrt(data.Qmax2), 'qn-edge');
    if (vd.k < 2000) data.families.grav.n0.forEach(function (l) {
      l.a.forEach(function (a) { g.appendChild(el('circle', { 'class': 'qn-node', cx: dx(a), cy: dy(l.Q), r: 3 })); });
    });
    // ticks at full view, fading as the disk zooms in
    while (gDiskTicks.firstChild) gDiskTicks.removeChild(gDiskTicks.firstChild);
    var ta = Math.max(0, Math.min(1, (900 - vd.k) / 300));
    if (ta > 0) {
      gDiskTicks.setAttribute('opacity', ta);
      gDiskTicks.appendChild(el('text', { 'class': 'qn-tick', x: dx(0), y: dy(0) + 38, 'text-anchor': 'middle' }, '0'));
      gDiskTicks.appendChild(el('text', { 'class': 'qn-tick', x: dx(1), y: dy(0) + 38, 'text-anchor': 'middle' }, '1'));
      gDiskTicks.appendChild(el('text', { 'class': 'qn-tick', x: dx(0) - 18, y: dy(1) + 8, 'text-anchor': 'end' }, '1'));
    }
    if (scene && scene.drawDisk) scene.drawDisk(g);
    var h = hp || at;
    handle = el('circle', { 'class': 'qn-handle', r: 15, cx: dx(h.a), cy: dy(h.Q) });
    g.appendChild(handle);
  }

  // ----- the right panel ------------------------------------------------------

  var MODES = [
    { fam: 'grav', n: 'n0', cls: 'qn-gw', label: 'gravitational' },
    { fam: 'em',   n: 'n0', cls: 'qn-em', label: 'electromagnetic' },
    { fam: 'grav', n: 'n1', cls: 'qn-gw qn-over', label: '' },
    { fam: 'em',   n: 'n1', cls: 'qn-em qn-over', label: '' }
  ];

  function drawPlane(showN1) {
    while (gPlane.firstChild) gPlane.removeChild(gPlane.firstChild);
    gPlane.setAttribute('opacity', alpha);
    var B = PLANE;
    gPlane.appendChild(el('rect', { 'class': 'qn-box', x: B.x0, y: B.y0, width: B.x1 - B.x0, height: B.y1 - B.y0 }));
    // a scene with axes of its own (the log axis of the near-extremal stage)
    if (scene && scene.ownAxes) {
      var own = el('g', { 'clip-path': 'url(#qn-clip-p)' });
      gPlane.appendChild(own);
      scene.drawPlane(own, gPlane);
      return;
    }
    var tr = ticks(vp.re[0], vp.re[1], 6), ti = ticks(vp.im[1], vp.im[0], 6);
    tr.vals.forEach(function (r) {
      gPlane.appendChild(el('text', { 'class': 'qn-tick', x: px(r), y: B.y0 - 16, 'text-anchor': 'middle' }, r.toFixed(tr.dec)));
    });
    ti.vals.forEach(function (i) {
      if (Math.abs(i) < 1e-12) return;
      gPlane.appendChild(el('text', { 'class': 'qn-tick', x: B.x0 - 16, y: py(i) + 8, 'text-anchor': 'end' }, '−' + (-i).toFixed(ti.dec)));
    });
    gPlane.appendChild(el('text', { 'class': 'qn-axis', x: (B.x0 + B.x1) / 2, y: B.y0 - 60, 'text-anchor': 'middle' }, 'Re[Mω]'));
    gPlane.appendChild(el('text', { 'class': 'qn-axis', transform: 'translate(' + (B.x0 - 120) + ',' + (B.y0 + B.y1) / 2 + ') rotate(-90)', 'text-anchor': 'middle' }, 'Im[Mω]'));

    var inner = el('g', { 'clip-path': 'url(#qn-clip-p)' });
    gPlane.appendChild(inner);
    if (scene && scene.drawPlane) { scene.drawPlane(inner); return; }

    MODES.forEach(function (m) {
      if (m.n === 'n1' && !(showN1 && n1a > 0.01)) return;
      var f = interp[m.fam + m.n];
      if (!f) return;
      var gm = inner;
      if (m.n === 'n1') { gm = el('g', { opacity: n1a }); inner.appendChild(gm); }   // the overtones fade in
      data.families[m.fam][m.n].forEach(function (l) {
        gm.appendChild(el('path', { 'class': 'qn-mesh ' + m.cls, d: poly(l.w.map(function (w) { return [px(w[0]), py(w[1])]; })) }));
      });
      var amax = Math.sqrt(data.Qmax2 - at.Q * at.Q), pts = [];
      for (var k = 0; k <= 60; k++) { var w = f(amax * k / 60, at.Q); pts.push([px(w[0]), py(w[1])]); }
      gm.appendChild(el('path', { 'class': 'qn-sweep ' + m.cls, d: poly(pts) }));
      var w0 = f(at.a, at.Q);
      gm.appendChild(el('circle', { 'class': 'qn-dot ' + m.cls, cx: px(w0[0]), cy: py(w0[1]), r: 11 }));
      if (m.label) {
        gPlane.appendChild(el('text', { 'class': 'qn-lab ' + m.cls, x: px(w0[0]) + 20, y: py(w0[1]) + (m.fam === 'em' ? 44 : -18) }, m.label));
      }
    });
  }

  function readout(txt, html) { var r = slide.querySelector('.qn-read'); if (html) r.innerHTML = txt; else r.textContent = txt; }
  function fmtw(w) { return w[0].toFixed(4) + ' − ' + (-w[1]).toFixed(4) + 'i'; }

  // ----- step 2: towards extremality on Q = 0.6 -----------------------------

  function kappaOf(a, Q) { var s = Math.sqrt(Math.max(1 - a * a - Q * Q, 0)); return s / ((1 + s) * (1 + s) + a * a); }

  function nearScene() {
    var ne = data.nearext, S = ne.series, Q = ne.Q;
    // the kappa grid of the longest series; time runs in log kappa
    var ref = S.reduce(function (b, s) { return s.kappa.length > b.kappa.length ? s : b; }, S[0]);
    var ks = ref.kappa;
    var lk0 = Math.log(ks[0]), lk1 = Math.log(ks[ks.length - 1]);
    var aEnd = ref.a[ref.a.length - 1];
    var all = []; S.forEach(function (s) { all.push.apply(all, s.w); });
    var u = 0;
    function valAt(s, lk) {
      // linear in log kappa between the series' points; null outside its range
      var L = s.kappa.map(Math.log);
      if (lk > L[0] || lk < L[L.length - 1]) return null;
      for (var i = 0; i < L.length - 1; i++) if (lk <= L[i] && lk >= L[i + 1]) {
        var f = (lk - L[i]) / (L[i + 1] - L[i]);
        return { w: [s.w[i][0] + f * (s.w[i + 1][0] - s.w[i][0]), s.w[i][1] + f * (s.w[i + 1][1] - s.w[i][1])],
                 a: s.a[i] + f * (s.a[i + 1] - s.a[i]) };
      }
      return { w: s.w[0], a: s.a[0] };
    }
    // fixed axes: Re linear, -Im on a log scale (the ladder sits at
    // -Im ~ (k + 1/2) kappa, so it falls in equal steps); kappa is the colour
    var RE = [0.74, 1.0], LIM = [Math.log10(3e-4), Math.log10(0.5)];
    var B = PLANE, W = B.x1 - B.x0, H = B.y1 - B.y0;
    function X(re) { return B.x0 + (re - RE[0]) / (RE[1] - RE[0]) * W; }
    function Y(im) { return B.y0 + (Math.log10(Math.max(-im, 1e-9)) - LIM[0]) / (LIM[1] - LIM[0]) * H; }
    // viridis, sampled: kappa = 0.1 (yellow) -> 1e-3 (purple)
    var VIR = [[253, 231, 37], [94, 201, 98], [33, 145, 140], [59, 82, 139], [68, 1, 84]];
    function kcol(kap) {
      var t = Math.min(1, Math.max(0, (Math.log10(0.1) - Math.log10(kap)) / 2)) * (VIR.length - 1);
      var i = Math.min(VIR.length - 2, Math.floor(t)), f = t - i;
      return 'rgb(' + [0, 1, 2].map(function (c) { return Math.round(VIR[i][c] + f * (VIR[i + 1][c] - VIR[i][c])); }).join(',') + ')';
    }
    function mOmega(a) { var s0 = Math.sqrt(Math.max(1 - a * a - Q * Q, 0)); return 2 * a / ((1 + s0) * (1 + s0) + a * a); }
    return {
      ownAxes: true,
      // a fixed view of the disk around the end of the line
      target: function () { return { d: diskAt(0.79, Q, 6000), p: vp }; },
      tick: function (t) { u = Math.min(1, t / 12); },    // 12 s from kappa = 0.1 to 1e-3, then hold
      drawDisk: function (g) {
        var lk = lk0 + (lk1 - lk0) * u, cur = valAt(ref, lk);
        if (cur) at = { a: cur.a, Q: Q };
        var p = ref.a.map(function (a) { return [dx(a), dy(Q)]; });
        g.appendChild(el('path', { 'class': 'qn-ray', d: poly(p) }));
      },
      drawPlane: function (inner, outer) {
        var lk = lk0 + (lk1 - lk0) * u;
        // axes
        [0.75, 0.8, 0.85, 0.9, 0.95, 1.0].forEach(function (r) {
          outer.appendChild(el('text', { 'class': 'qn-tick', x: X(r), y: B.y0 - 16, 'text-anchor': 'middle' }, r.toFixed(2)));
        });
        [-3, -2, -1].forEach(function (e) {
          outer.appendChild(el('text', { 'class': 'qn-tick', x: B.x0 - 16, y: Y(-Math.pow(10, e)) + 8, 'text-anchor': 'end' }, '−10' + ['⁻³', '⁻²', '⁻¹'][e + 3]));
          inner.appendChild(el('line', { 'class': 'qn-grid', x1: B.x0, y1: Y(-Math.pow(10, e)), x2: B.x1, y2: Y(-Math.pow(10, e)) }));
        });
        outer.appendChild(el('text', { 'class': 'qn-axis', x: (B.x0 + B.x1) / 2, y: B.y0 - 60, 'text-anchor': 'middle' }, 'Re[Mω]'));
        outer.appendChild(el('text', { 'class': 'qn-axis', transform: 'translate(' + (B.x0 - 120) + ',' + (B.y0 + B.y1) / 2 + ') rotate(-90)', 'text-anchor': 'middle' }, 'Im[Mω]  (log scale)'));
        // the colour bar: kappa from 0.1 (top) to 1e-3 (bottom), the current kappa marked
        var cbx = B.x1 + 30;
        for (var c = 0; c < 40; c++) {
          var k0 = Math.pow(10, -1 - 2 * c / 40);
          outer.appendChild(el('rect', { x: cbx, y: B.y0 + H * c / 40, width: 18, height: H / 40 + 1, fill: kcol(k0) }));
        }
        [-1, -2, -3].forEach(function (e, i) {
          outer.appendChild(el('text', { 'class': 'qn-tick', x: cbx + 26, y: B.y0 + H * i / 2 + 8 }, '10' + ['⁻¹', '⁻²', '⁻³'][i]));
        });
        outer.appendChild(el('text', { 'class': 'qn-axis', x: cbx + 9, y: B.y0 - 52, 'text-anchor': 'middle' }, 'κ'));
        outer.appendChild(el('path', { 'class': 'qn-cbmark', d: 'M' + (cbx - 8) + ' ' + (B.y0 + H * (Math.log10(0.1) - lk / Math.LN10) / 2) + 'h34' }));
        // m Omega_H now, a vertical dashed line
        var v0 = valAt(ref, lk), mOm = mOmega(v0 ? v0.a : aEnd);
        inner.appendChild(el('line', { 'class': 'qn-mom', x1: X(mOm), y1: B.y0, x2: X(mOm), y2: B.y1 }));
        var lab = el('text', { 'class': 'qn-axis', x: X(mOm) - 10, y: B.y1 - 16, 'text-anchor': 'end' }, 'mΩ');
        lab.appendChild(el('tspan', { dy: 7, 'font-size': '20px' }, 'H'));
        outer.appendChild(lab);
        // the tracks so far, each segment coloured by its kappa; the dot coloured by family
        S.forEach(function (s) {
          for (var i = 0; i < s.kappa.length - 1 && Math.log(s.kappa[i]) >= lk; i++) {
            var w1 = Math.log(s.kappa[i + 1]) >= lk ? s.w[i + 1] : valAt(s, lk).w;
            inner.appendChild(el('line', { 'class': 'qn-track', x1: X(s.w[i][0]), y1: Y(s.w[i][1]), x2: X(w1[0]), y2: Y(w1[1]),
                                           stroke: kcol(Math.sqrt(s.kappa[i] * Math.max(s.kappa[i + 1], Math.exp(lk)))) }));
          }
          var v = valAt(s, lk);
          if (v) inner.appendChild(el('circle', { 'class': 'qn-dot ' + (s.family === 'em' ? 'qn-em' : 'qn-gw'), cx: X(v.w[0]), cy: Y(v.w[1]), r: 9 }));
        });
        readout('Q/M = ' + Q.toFixed(1) + ',   κ = ' + Math.exp(lk).toExponential(1) +
                '      <span class="qn-kgw">●</span> gravitational-led   <span class="qn-kem">●</span> electromagnetic-led', true);
      }
    };
  }

  // ----- step 3: the exceptional point EP0 ------------------------------------

  function epScene() {
    var E = data.ep, c = E.centre, P = E.path, L = E.loop, t = 0;
    var all = [c.w];
    P.forEach(function (p) { all.push(p.w1, p.w2); });
    L.forEach(function (p) { all.push(p.w1, p.w2); });
    var TA = 4, TL = 6;                                    // seconds: the approach, one turn of the loop
    function state() {
      if (t < TA) {                                        // the approach: one path point after the other
        var i = Math.min(P.length - 1, Math.floor(P.length * t / TA));
        return { a: P[i].a, Q: P[i].Q, w1: P[i].w1, w2: P[i].w2, k: -1, i: i };
      }
      var f = ((t - TA) % TL) / TL, j = Math.min(L.length - 1, Math.floor(f * L.length));
      return { a: L[j].a, Q: L[j].Q, w1: L[j].w1, w2: L[j].w2, k: j, turn: Math.floor((t - TA) / TL) };
    }
    return {
      target: function () { return { d: diskAt(c.a, c.Q, 1.2e5), p: planeAround(all, 0.25) }; },
      tick: function (s) { t = s; },
      drawDisk: function (g) {
        var s = state();
        at = { a: s.a, Q: s.Q };
        g.appendChild(el('path', { 'class': 'qn-loop', d: poly(L.map(function (p) { return [dx(p.a), dy(p.Q)]; })) + 'Z' }));
        g.appendChild(el('circle', { 'class': 'qn-ep', cx: dx(c.a), cy: dy(c.Q), r: 8 }));
      },
      drawPlane: function (inner) {
        var s = state();
        inner.appendChild(el('circle', { 'class': 'qn-ep', cx: px(c.w[0]), cy: py(c.w[1]), r: 8 }));
        if (s.k < 0) {
          // the two modes close in on each other as the point nears the EP
          var t1 = [], t2 = [];
          for (var i = 0; i <= s.i; i++) { t1.push([px(P[i].w1[0]), py(P[i].w1[1])]); t2.push([px(P[i].w2[0]), py(P[i].w2[1])]); }
          inner.appendChild(el('path', { 'class': 'qn-pts qn-gw', d: t1.map(function (p) { return 'M' + p[0] + ' ' + p[1] + 'h0.01'; }).join('') }));
          inner.appendChild(el('path', { 'class': 'qn-pts qn-gw qn-b2', d: t2.map(function (p) { return 'M' + p[0] + ' ' + p[1] + 'h0.01'; }).join('') }));
        } else {
          // around the loop each mode moves onto the other's place: the trails
          // keep their colour, so after one turn the filled dot sits where the open one began
          var a1 = [], a2 = [], flip = s.turn % 2 === 1;
          for (var j = 0; j <= s.k; j++) { a1.push([px(L[j].w1[0]), py(L[j].w1[1])]); a2.push([px(L[j].w2[0]), py(L[j].w2[1])]); }
          if (flip) { var tmp = a1; a1 = a2; a2 = tmp; }
          inner.appendChild(el('path', { 'class': 'qn-sweep qn-gw', d: poly(a1) }));
          inner.appendChild(el('path', { 'class': 'qn-sweep qn-gw qn-b2', d: poly(a2) }));
        }
        var w1 = s.w1, w2 = s.w2;
        if (s.k >= 0 && s.turn % 2 === 1) { var tw = w1; w1 = w2; w2 = tw; }
        inner.appendChild(el('circle', { 'class': 'qn-dot qn-gw', cx: px(w1[0]), cy: py(w1[1]), r: 11 }));
        inner.appendChild(el('circle', { 'class': 'qn-dot qn-gw qn-over', cx: px(w2[0]), cy: py(w2[1]), r: 11 }));
        readout('a/M = ' + s.a.toFixed(5) + ',  Q/M = ' + s.Q.toFixed(5));
      }
    };
  }

  // ----- motion ---------------------------------------------------------------

  // the step numbers of the scripted scenes (the near-extremal step is dropped
  // when the table has no near-extremal series, and the EP step moves up)
  function stepOf(s) {
    if (s <= 1) return s;
    if (!hasNE) return s >= 2 ? 3 : s;
    return s;
  }

  function sceneOf(s) { return s === 2 ? nearScene() : s === 3 ? epScene() : null; }

  function frame(t) {
    if (!t0) { t0 = t; tPrev = t; }
    var dt = Math.min(0.1, (t - tPrev) / 1000); tPrev = t;
    var s = stepOf(Number(slide.dataset.s || 0));
    // a new stage: the old one fades out first, unless nothing scripted is on
    // either side (steps 0 <-> 1 only open the plane, no fade needed)
    if (lastS < 0) { lastS = s; tStep = t; scene = sceneOf(s); alpha = 1; pending = -1; }
    else if (s !== lastS && s !== pending) {
      if (!scene && s <= 1) { lastS = s; tStep = t; }
      else { pending = s; tFade = t; }
    }
    if (pending >= 0) {
      var uo = (t - tFade) / 1000 / FADE_OUT;
      alpha = Math.max(0, 1 - uo);
      if (uo >= 1) { lastS = pending; pending = -1; tStep = t; scene = sceneOf(lastS); hp = { a: at.a, Q: at.Q }; }
    } else alpha = Math.min(1, alpha + dt / FADE_IN);
    var sv = lastS;
    var T = scene ? scene.target() : { d: FULL_D, p: sv >= 1 && hasN1 ? FULL_P1 : FULL_P0 };
    var f = 1 - Math.exp(-dt / (scene ? 1.6 * TAU : TAU));
    easeDisk(vd, T.d, f); easePlane(vp, T.p, f);
    n1a += ((sv >= 1 && hasN1 ? 1 : 0) - n1a) * (1 - Math.exp(-dt / TAU));
    if (scene && pending < 0) scene.tick((t - tStep) / 1000);
    else if (wander) {
      var u = (t - t0) / 1000;
      var rho = Math.sqrt(data.Qmax2) * (0.55 + 0.4 * Math.sin(0.23 * u)), th = Math.PI / 4 + 0.75 * Math.sin(0.15 * u + 0.6);
      at = clamp(rho * Math.cos(th), rho * Math.sin(th));
    }
    // the handle glides to the stage's point for a moment after a switch, then follows it exactly
    if (hp) {
      var g2 = 1 - Math.exp(-dt / 0.2);
      hp.a += (at.a - hp.a) * g2; hp.Q += (at.Q - hp.Q) * g2;
      if ((t - tStep) > 1200 && pending < 0) hp = null;
    }
    drawDisk();
    drawPlane(sv >= 1 && hasN1);
    if (!scene) {
      var g = interp.gravn0(at.a, at.Q), e = interp.emn0(at.a, at.Q);
      readout('a/M = ' + at.a.toFixed(3) + ',  Q/M = ' + at.Q.toFixed(3) + '      ' + fmtw(g) + '      ' + fmtw(e));
    }
    raf = requestAnimationFrame(frame);
  }

  function toCanvas(e) {
    var r = svg.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width * 1920, (e.clientY - r.top) / r.height * 1080];
  }

  function bindDrag() {
    var drag = false;
    function move(e) {
      var p = toCanvas(e);
      at = clamp(vd.a0 + (p[0] - DISK.x0) / vd.k, vd.Q0 + (DISK.y0 - p[1]) / vd.k);
    }
    gDisk.addEventListener('pointerdown', function (e) {
      if (scene) return;
      wander = false; drag = true;
      gDisk.setPointerCapture(e.pointerId);
      move(e);
    });
    gDisk.addEventListener('pointermove', function (e) { if (drag) move(e); });
    gDisk.addEventListener('pointerup', function () { drag = false; });
    gDisk.addEventListener('pointercancel', function () { drag = false; });
  }

  function ready() {
    ['grav', 'em'].forEach(function (f) {
      ['n0', 'n1'].forEach(function (n) {
        if (data.families[f][n]) interp[f + n] = family(data.families[f][n]);
      });
    });
    hasN1 = !!(interp.gravn1 && interp.emn1);
    hasNE = !!data.nearext;
    build();
  }

  fetch('data/qnm.json').then(function (r) { return r.json(); }).then(function (d) {
    data = d;
    ready();
    Deck.on('qnms', {
      enter: function () { wander = true; t0 = 0; lastS = -1; hp = null; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); },
      leave: function () { cancelAnimationFrame(raf); }
    });
  });
})();
