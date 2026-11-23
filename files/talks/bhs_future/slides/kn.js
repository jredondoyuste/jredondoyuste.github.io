// Part iv.b: second order around Kerr-Newman (with D. Pereñiguez). Three slides,
// drawn in the jry-plots style: closed frames with inward ticks on all four
// sides, inkwell colours, the sunset map for signed fields, YlOrBr for moduli.
//
//   kn-algo   the pipeline, one stage per press, on one QNM (a = 0.557,
//             Q = 0.502, gravity-led 220): separated radial and angular functions
//             with omega and lambda (figures/kn-sep.json, from knpert.qnm); the
//             transport-equation fields; the gauge gluing; a quadratic term; the
//             2D spectral solve (figures/kn-recon.json, exported from knpert)
//   kn-qnms   l = m = 2, n = 0 over the family (figures/kn-qnm.json): Kerr;
//             → the charge on, line by line; → the EM-led family
//   kn-qqnm   |R| into (4,4) over (a, Q) (t21 scan, figures/kn-qqnm.json),
//             filling in as the charge grows: GW x GW; → GW x EM; → |R| against
//             a/M at fixed Q with the Kerr reference of KMY (figures/kn-lines.json)
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, a, p) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function smooth(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function stepper(slide, id, hooks) {
    var last = 0;
    function apply(s, fwd) { for (var i = 1; i <= 5; i++) slide.classList.toggle('s-on' + i, s >= i); if (hooks.step) hooks.step(s, fwd); }
    Deck.on(id, {
      enter: function (sl, dir) { last = +sl.dataset.s || 0; apply(last, false); if (hooks.enter) hooks.enter(dir, last); },
      leave: function () { if (hooks.leave) hooks.leave(); }
    });
    new MutationObserver(function () {
      var s = +slide.dataset.s || 0; if (s === last) return;
      var f = s > last; last = s; apply(s, f);
    }).observe(slide, { attributes: true, attributeFilter: ['data-s'] });
  }
  function loop(fn) {
    var raf = null, t0 = 0;
    return {
      start: function () { cancelAnimationFrame(raf); t0 = performance.now(); (function f(now) { raf = requestAnimationFrame(f); fn((now - t0) / 1000, now); })(t0); },
      stop: function () { cancelAnimationFrame(raf); raf = null; }
    };
  }
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  var SUNSET = ['#364B9A', '#4A7BB7', '#6EA6CD', '#98CAE1', '#C2E4EF', '#EAECCC', '#FEDA8B', '#FDB366', '#F67E4B', '#DD3D2D', '#A50026'].map(hex);
  var YLORBR = ['#FFFFE5', '#FFF7BC', '#FEE391', '#FEC44F', '#FB9A29', '#EC7014', '#CC4C02', '#993404', '#662506'].map(hex);
  function cmap(C, u) { u = Math.max(0, Math.min(1, u)) * (C.length - 1); var i = Math.min(C.length - 2, Math.floor(u)), f = u - i; return [0, 1, 2].map(function (k) { return C[i][k] + (C[i + 1][k] - C[i][k]) * f; }); }

  // a jry frame: closed box, inward major and minor ticks mirrored on all sides
  // o: {x0, x1, y0, y1, xt: [[value, px, label?]...], yt: same, minor: {x: [px], y: [px]}}
  function jframe(g, o) {
    el('rect', { x: o.x0, y: o.y0, width: o.x1 - o.x0, height: o.y1 - o.y0, class: 'jf-box' }, g);
    var MA = o.big || 14, MI = (o.big || 14) * 0.5;
    (o.xt || []).forEach(function (t) {
      el('line', { x1: t[1], x2: t[1], y1: o.y1, y2: o.y1 - MA, class: 'jf-tk' }, g);
      el('line', { x1: t[1], x2: t[1], y1: o.y0, y2: o.y0 + MA, class: 'jf-tk' }, g);
      if (t[2] != null) el('text', { x: t[1], y: o.y1 + 36, class: 'jf-num' }, g).textContent = t[2];
    });
    (o.yt || []).forEach(function (t) {
      el('line', { x1: o.x0, x2: o.x0 + MA, y1: t[1], y2: t[1], class: 'jf-tk' }, g);
      el('line', { x1: o.x1, x2: o.x1 - MA, y1: t[1], y2: t[1], class: 'jf-tk' }, g);
      if (t[2] != null) el('text', { x: o.x0 - 12, y: t[1] + 9, class: 'jf-num jf-end' }, g).textContent = t[2];
    });
    ((o.minor && o.minor.x) || []).forEach(function (x) {
      el('line', { x1: x, x2: x, y1: o.y1, y2: o.y1 - MI, class: 'jf-tk' }, g);
      el('line', { x1: x, x2: x, y1: o.y0, y2: o.y0 + MI, class: 'jf-tk' }, g);
    });
    ((o.minor && o.minor.y) || []).forEach(function (y) {
      el('line', { x1: o.x0, x2: o.x0 + MI, y1: y, y2: y, class: 'jf-tk' }, g);
      el('line', { x1: o.x1, x2: o.x1 - MI, y1: y, y2: y, class: 'jf-tk' }, g);
    });
  }
  function range(a, b, d) { var o = []; for (var v = a; v <= b + 1e-9; v += d) o.push(+v.toFixed(6)); return o; }

  // ======================================================================
  // kn-algo: one QNM (a = 0.557, Q = 0.502, gravity-led 220) through the pipeline
  //   0  the separated equations: radial f(sigma), angular chi_1, chi_2; omega and lambda
  //      (figures/kn-sep.json, knpert.qnm at this point)
  //   1  transport equations, marched from scri to the horizon: radiation-gauge fields
  //   2  the gauge: h_nn alone; the slice cut in three; IRG -> glued, with the
  //      equator profile (|h_nn| -> 0 at scri once glued) and the cut f(sigma)
  //   3  a quadratic term, at 2 omega
  //   4  the 2D solve: spectral patches in sigma, Gauss nodes in cos theta; R at scri
  (function () {
    var slide = document.getElementById('kn-algo'); if (!slide) return;
    var cv = slide.querySelector('.ka-cv'), svg = slide.querySelector('.ka-svg');
    var ctx = cv.getContext('2d');
    var CX0 = 120, CY0 = 170, CW = 1060, CH = 780;
    cv.style.left = CX0 + 'px'; cv.style.top = CY0 + 'px'; cv.style.width = CW + 'px'; cv.style.height = CH + 'px';
    cv.width = CW; cv.height = CH;
    var D = null, SP = null, NS_ = 0, NX = 0, step = 0, stepT = 0, built = false;
    function sub(b, i) { return b + '<tspan baseline-shift="sub" font-size="70%">' + i + '</tspan>'; }
    var COMPS = ['h_nn', 'h_ln', 'h_mm', 'A_m'];
    var LAB = { h_nn: sub('h', 'nn'), h_ln: sub('h', 'ℓn'), h_mm: sub('h', 'mm'), A_m: sub('A', 'm') };
    var SMALL = [[190, 250], [690, 250], [190, 560], [690, 560]].map(function (p) { return { x0: p[0], y0: p[1], x1: p[0] + 440, y1: p[1] + 230 }; });
    var GAUGE = { x0: 190, y0: 285, x1: 1130, y1: 570 };
    var STRIP = { x0: 190, y0: 640, x1: 760, y1: 830 };
    var BIG = { x0: 190, y0: 250, x1: 1130, y1: 790 };
    var RAD = { x0: 190, y0: 240, x1: 620, y1: 480 }, ANG = { x0: 720, y0: 240, x1: 1130, y1: 480 };
    var PL = { x0: 190, y0: 620, x1: 620, y1: 830 }, PRE = [0.40, 0.62], PIM = [0.0, 0.12];
    var off = document.createElement('canvas'), octx = off.getContext('2d'), oimg = null;

    function paintField(box, get, alpha) {
      if (!oimg) { off.width = NS_; off.height = NX; oimg = octx.createImageData(NS_, NX); }
      var d = oimg.data;
      for (var i = 0; i < NS_; i++) for (var j = 0; j < NX; j++) {
        var v = get(i, j), o = 4 * ((NX - 1 - j) * NS_ + i);
        if (v === null) { d[o + 3] = 0; continue; }
        var c = cmap(SUNSET, 0.5 + 0.5 * v); d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
      }
      octx.putImageData(oimg, 0, 0);
      ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = true;
      ctx.drawImage(off, box.x0 - CX0, box.y0 - CY0, box.x1 - box.x0, box.y1 - box.y0);
      ctx.globalAlpha = 1;
    }
    // sigma-cos(theta) frames: x is sigma = r_+/r from scri (0) to the horizon (1)
    function sframe(g, b, o) {
      var sx = function (s) { return b.x0 + s * (b.x1 - b.x0); }, xy = function (x) { return b.y1 - (x + 1) / 2 * (b.y1 - b.y0); };
      jframe(g, {
        x0: b.x0, x1: b.x1, y0: b.y0, y1: b.y1, big: 12,
        xt: [[0, sx(0), o.bottom ? '0' : null], [0.5, sx(0.5), o.bottom ? '0.5' : null], [1, sx(1), o.bottom ? '1' : null]],
        yt: o.y === false ? [] : [[-1, xy(-1), o.left ? '−1' : null], [0, xy(0), o.left ? '0' : null], [1, xy(1), o.left ? '1' : null]],
        minor: { x: [0.25, 0.75].map(sx), y: o.y === false ? [] : [-0.5, 0.5].map(xy) }
      });
      if (o.label) el('text', { x: b.x0 + 14, y: b.y0 + 34, class: 'ka-lab' }, g).innerHTML = o.label;
      if (o.bottom) {
        el('text', { x: (b.x0 + b.x1) / 2, y: b.y1 + 78, class: 'jf-lab' }, g).textContent = 'σ = r₊/r';
        el('text', { x: b.x0, y: b.y1 + 78, class: 'ka-end' }, g).textContent = '𝓘⁺';
        el('text', { x: b.x1, y: b.y1 + 78, class: 'ka-end' }, g).textContent = 'ℋ⁺';
      }
      if (o.left && o.y !== false) el('text', { x: b.x0 - 60, y: (b.y0 + b.y1) / 2, class: 'jf-lab', transform: 'rotate(-90 ' + (b.x0 - 60) + ' ' + (b.y0 + b.y1) / 2 + ')' }, g).textContent = 'cos θ';
    }
    var G = {};
    function build() {
      built = true; NS_ = D.NS; NX = D.x.length;
      svg.innerHTML = '';
      // ---- stage 0: the separated functions
      var g0 = G.s0 = el('g', { class: 'ka-g' }, svg);
      [[RAD, 'radial f(σ)'], [ANG, 'angular χ₁, χ₂']].forEach(function (p, k) {
        var b = p[0], X = k ? function (x) { return b.x0 + (x + 1) / 2 * (b.x1 - b.x0); } : function (s) { return b.x0 + s * (b.x1 - b.x0); };
        var Yv = function (v) { return (b.y0 + b.y1) / 2 - v * (b.y1 - b.y0) / 2.4; };
        jframe(g0, {
          x0: b.x0, x1: b.x1, y0: b.y0, y1: b.y1,
          xt: (k ? [-1, 0, 1] : [0, 0.5, 1]).map(function (v) { return [v, X(v), k ? (v < 0 ? '−1' : String(v)) : String(v)]; }),
          yt: [-1, 0, 1].map(function (v) { return [v, Yv(v), k ? null : (v < 0 ? '−1' : String(v))]; }),
          minor: { x: (k ? [-0.5, 0.5] : [0.25, 0.75]).map(X), y: [-0.5, 0.5].map(Yv) }
        });
        el('text', { x: b.x0 + 14, y: b.y0 + 34, class: 'ka-lab' }, g0).textContent = p[1];
        el('text', { x: (b.x0 + b.x1) / 2, y: b.y1 + 78, class: 'jf-lab' }, g0).textContent = k ? 'cos θ' : 'σ = r₊/r';
        if (!k) {
          el('text', { x: b.x0, y: b.y1 + 78, class: 'ka-end' }, g0).textContent = '𝓘⁺';
          el('text', { x: b.x1, y: b.y1 + 78, class: 'ka-end' }, g0).textContent = 'ℋ⁺';
        }
        b.X = X; b.Y = Yv;
      });
      G.rEnv = [el('path', { class: 'ka-env' }, g0), el('path', { class: 'ka-env' }, g0)];
      G.rRe = el('path', { class: 'ka-curve ka-cb' }, g0);
      G.a1 = el('path', { class: 'ka-curve ka-cb' }, g0); G.a2 = el('path', { class: 'ka-curve ka-cr' }, g0);
      el('text', { x: ANG.x1 - 16, y: ANG.y0 + 34, class: 'ka-key ka-kb' }, g0).textContent = 'Re χ₁';
      el('text', { x: ANG.x1 - 16, y: ANG.y0 + 64, class: 'ka-key ka-kr' }, g0).textContent = 'Re χ₂';
      // the root-finder in the complex omega plane (joint Newton on f, chi, omega, lambda)
      var PX = function (v) { return PL.x0 + (v - PRE[0]) / (PRE[1] - PRE[0]) * (PL.x1 - PL.x0); };
      var PY = function (v) { return PL.y1 - (v - PIM[0]) / (PIM[1] - PIM[0]) * (PL.y1 - PL.y0); };
      jframe(g0, {
        x0: PL.x0, x1: PL.x1, y0: PL.y0, y1: PL.y1, big: 10,
        xt: [0.45, 0.5, 0.55, 0.6].map(function (v) { return [v, PX(v), v.toFixed(2)]; }),
        yt: [0, 0.05, 0.1].map(function (v) { return [v, PY(v), v.toFixed(2)]; }),
        minor: { x: range(0.41, 0.62, 0.01).map(PX), y: range(0.01, 0.12, 0.01).map(PY) }
      });
      el('text', { x: (PL.x0 + PL.x1) / 2, y: PL.y1 + 76, class: 'jf-lab' }, g0).textContent = 'Re Mω';
      el('text', { x: PL.x0 - 92, y: (PL.y0 + PL.y1) / 2, class: 'jf-lab', transform: 'rotate(-90 ' + (PL.x0 - 92) + ' ' + (PL.y0 + PL.y1) / 2 + ')' }, g0).textContent = '−Im Mω';
      var wt = [SP.w[0], -SP.w[1]], it = [], z = [0.44, 0.02];
      for (var q = 0; q < 8; q++) {
        it.push(z.slice());
        var dx = wt[0] - z[0], dy = wt[1] - z[1];
        z = [wt[0] - 0.45 * (dx * Math.cos(0.9) - dy * Math.sin(0.9)), wt[1] - 0.45 * (dx * Math.sin(0.9) + dy * Math.cos(0.9))];
      }
      G.iter = it.map(function (p, k) {
        return [el('circle', { cx: PX(p[0]), cy: PY(p[1]), r: 6, class: 'ka-it' }, g0),
                k ? el('line', { x1: PX(it[k - 1][0]), y1: PY(it[k - 1][1]), x2: PX(p[0]), y2: PY(p[1]), class: 'ka-itl' }, g0) : null];
      });
      G.root = el('path', { transform: 'translate(' + PX(wt[0]) + ',' + PY(wt[1]) + ') scale(1.2)', d: 'M0 -13 L3.8 -4 L13 -4 L5.6 2 L8.2 12 L0 6 L-8.2 12 L-5.6 2 L-13 -4 L-3.8 -4 Z', class: 'ka-root' }, g0);
      G.NIT = it.length;
      // ---- stage 1: four components
      G.s1 = el('g', { class: 'ka-g' }, svg);
      SMALL.forEach(function (b, k) { sframe(G.s1, b, { label: LAB[COMPS[k]], bottom: k >= 2, left: k % 2 === 0 }); });
      G.sweep = el('line', { y1: SMALL[0].y0, y2: SMALL[2].y1, class: 'ka-sweep' }, svg);
      // ---- stage 2: the gauge
      G.s2 = el('g', { class: 'ka-g' }, svg);
      var REG = [[0, 0.25, 'AF-IRG'], [0.25, 0.75, 'cut'], [0.75, 1, 'IRG']];
      REG.forEach(function (r, k) {
        var x0 = GAUGE.x0 + r[0] * (GAUGE.x1 - GAUGE.x0), x1 = GAUGE.x0 + r[1] * (GAUGE.x1 - GAUGE.x0);
        el('rect', { x: x0, y: GAUGE.y0 - 46, width: x1 - x0, height: 34, class: 'ka-reg ka-reg' + k }, G.s2);
        el('text', { x: (x0 + x1) / 2, y: GAUGE.y0 - 21, class: 'ka-regt' }, G.s2).textContent = r[2];
        if (k) el('line', { x1: x0, x2: x0, y1: GAUGE.y0, y2: GAUGE.y1, class: 'ka-regl' }, G.s2);
        if (k) el('line', { x1: STRIP.x0 + r[0] * (STRIP.x1 - STRIP.x0), x2: STRIP.x0 + r[0] * (STRIP.x1 - STRIP.x0), y1: STRIP.y0, y2: STRIP.y1, class: 'ka-regl' }, G.s2);
      });
      sframe(G.s2, GAUGE, { label: sub('h', 'nn'), bottom: false, left: true });
      var sx = function (s) { return STRIP.x0 + s * (STRIP.x1 - STRIP.x0); }, syv = function (v) { return STRIP.y1 - v * (STRIP.y1 - STRIP.y0) / 1.1; };
      jframe(G.s2, {
        x0: STRIP.x0, x1: STRIP.x1, y0: STRIP.y0, y1: STRIP.y1, big: 10,
        xt: [[0, sx(0), '0'], [0.5, sx(0.5), '0.5'], [1, sx(1), '1']], yt: [[0, syv(0), '0'], [1, syv(1), '1']],
        minor: { x: [0.25, 0.75].map(sx), y: [0.5].map(syv) }
      });
      el('text', { x: (STRIP.x0 + STRIP.x1) / 2, y: STRIP.y1 + 78, class: 'jf-lab' }, G.s2).textContent = 'σ = r₊/r';
      el('text', { x: STRIP.x0, y: STRIP.y1 + 78, class: 'ka-end' }, G.s2).textContent = '𝓘⁺';
      el('text', { x: STRIP.x1, y: STRIP.y1 + 78, class: 'ka-end' }, G.s2).textContent = 'ℋ⁺';
      el('text', { x: STRIP.x1 - 14, y: STRIP.y0 + 30, class: 'ka-lab ka-sm ka-rt' }, G.s2).innerHTML = '|' + sub('h', 'nn') + '| at cos θ = 0';
      var j0 = 0; D.x.forEach(function (x, j) { if (Math.abs(x) < Math.abs(D.x[j0])) j0 = j; });
      var Z = D.zoom, irgL = '', cutL = '';
      G.eqIrg = []; G.eqGl = [];
      for (var i = 0; i < NS_; i++) {
        var pi = Z.irg[i * NX + j0], pg = Z.glued[i * NX + j0];
        G.eqIrg.push(Math.hypot(pi[0], pi[1])); G.eqGl.push(Math.hypot(pg[0], pg[1]));
        irgL += (i ? 'L' : 'M') + sx(D.sigma[i]).toFixed(1) + ' ' + syv(G.eqIrg[i]).toFixed(1);
        cutL += (i ? 'L' : 'M') + sx(D.sigma[i]).toFixed(1) + ' ' + syv(Z.cut[i]).toFixed(1);
      }
      el('path', { d: irgL, class: 'ka-curve ka-ck ka-dash' }, G.s2);
      el('path', { d: cutL, class: 'ka-curve ka-cr ka-dot' }, G.s2);
      G.eqLine = el('path', { class: 'ka-curve ka-cb' }, G.s2);
      el('text', { x: sx(0.36), y: syv(0.75), class: 'ka-key ka-kr ka-start' }, G.s2).textContent = 'f';
      el('text', { x: sx(0.02), y: syv(G.eqIrg[0]) - 12, class: 'ka-key ka-start' }, G.s2).textContent = 'IRG';
      G.glLab = el('text', { x: sx(0.12), y: syv(0) - 12, class: 'ka-key ka-kb ka-start' }, G.s2); G.glLab.textContent = 'glued';
      // ---- stages 3-4: one big panel
      G.s34 = el('g', { class: 'ka-g' }, svg);
      sframe(G.s34, BIG, { label: null, bottom: true, left: true });
      G.biglab = el('text', { x: BIG.x0 + 18, y: BIG.y0 + 40, class: 'ka-lab ka-halo' }, G.s34);
      G.biglab.innerHTML = sub('h', 'nn') + ' × ' + sub('h', 'nn') + ' at 2ω';
      G.grid = el('g', { class: 'ka-grid' }, svg);
      var edges = [0, 0.2, 0.6, 1], NP = 10;
      G.patches = edges.slice(0, 3).map(function (e0, p) {
        var gg = el('g', { class: 'ka-patch' }, G.grid), e1 = edges[p + 1];
        el('rect', { x: BIG.x0 + e0 * (BIG.x1 - BIG.x0), y: BIG.y0, width: (e1 - e0) * (BIG.x1 - BIG.x0), height: BIG.y1 - BIG.y0, class: 'ka-pfill ka-pf' + p }, gg);
        for (var k = 0; k <= NP; k++) {
          var s = e0 + (e1 - e0) * (1 - Math.cos(Math.PI * k / NP)) / 2, xx = BIG.x0 + s * (BIG.x1 - BIG.x0);
          for (var q = 1; q <= 14; q++) {
            var xg = Math.cos(Math.PI * (q - 0.5) / 14), yy = BIG.y1 - (xg + 1) / 2 * (BIG.y1 - BIG.y0);
            el('circle', { cx: xx, cy: yy, r: 3.2, class: 'ka-node' }, gg);
          }
        }
        if (p) el('line', { x1: BIG.x0 + e0 * (BIG.x1 - BIG.x0), x2: BIG.x0 + e0 * (BIG.x1 - BIG.x0), y1: BIG.y0, y2: BIG.y1, class: 'ka-pedge' }, gg);
        return gg;
      });
      G.read = el('g', { class: 'ka-read' }, svg);
      el('line', { x1: BIG.x0, x2: BIG.x0, y1: BIG.y0, y2: BIG.y1, class: 'ka-readl' }, G.read);
      var rb = el('g', {}, G.read);
      el('rect', { x: BIG.x0 + 30, y: (BIG.y0 + BIG.y1) / 2 - 50, width: 330, height: 100, class: 'ka-rbox' }, rb);
      el('text', { x: BIG.x0 + 195, y: (BIG.y0 + BIG.y1) / 2 + 16, class: 'ka-rval' }, rb).textContent = '𝓡 ≈ 0.123';
    }
    function draw(t, now) {
      ctx.clearRect(0, 0, CW, CH);
      var u = (now - stepT) / 1000, w = D.w[0], ph = w * t * 6;
      var c1 = Math.cos(ph), s1 = Math.sin(ph), c2 = Math.cos(2 * ph), s2 = Math.sin(2 * ph);
      function re(v, i, j) { if (!v) return 0; var p = v[i * NX + j]; return p[0] * c1 + p[1] * s1; }
      G.s0.style.opacity = step === 0 ? 1 : 0;
      G.s1.style.opacity = step === 1 ? 1 : 0;
      G.s2.style.opacity = step === 2 ? 1 : 0;
      G.s34.style.opacity = step >= 3 ? 1 : 0;
      G.biglab.style.opacity = step === 3 ? 1 : 0;
      G.grid.style.opacity = step === 4 ? 1 : 0;
      G.read.style.opacity = step === 4 ? smooth((u - 2.2) / 0.6) : 0;
      slide.classList.toggle('ka-show-g', step === 2);
      if (step === 0) {
        // the iterates land one by one; the profiles relax from a rough guess to the solution with them
        var itP = u / 0.45;
        G.iter.forEach(function (q, k) { var o = smooth((itP - k) / 0.6); q[0].style.opacity = o; if (q[1]) q[1].style.opacity = o; });
        var conv = smooth(itP / G.NIT), done = smooth((itP - G.NIT) / 1);
        G.root.style.opacity = done;
        slide.classList.toggle('ka-solved', done > 0.5);
        var dr = 1, F = SP.z1, mx = 0;
        F.forEach(function (p) { mx = Math.max(mx, Math.hypot(p[0], p[1])); });
        var dre = '', de1 = '', de2 = '', n = Math.max(2, Math.round(dr * F.length));
        for (var i = 0; i < n; i++) {
          var p0 = F[i], s = SP.sigma[i], dist = (1 - conv) * (0.7 * Math.sin(5 * s + 1) + 0.3), cs = Math.cos(dist), sn = Math.sin(dist);
          var p = [(p0[0] * cs - p0[1] * sn) * (1 + 0.5 * (1 - conv) * Math.cos(4 * s)), (p0[0] * sn + p0[1] * cs) * (1 + 0.5 * (1 - conv) * Math.cos(4 * s))];
          var m = Math.hypot(p[0], p[1]) / mx, v = (p[0] * c1 + p[1] * s1) / mx;
          var X = RAD.X(s).toFixed(1);
          dre += (i ? 'L' : 'M') + X + ' ' + RAD.Y(v).toFixed(1);
          de1 += (i ? 'L' : 'M') + X + ' ' + RAD.Y(m).toFixed(1); de2 += (i ? 'L' : 'M') + X + ' ' + RAD.Y(-m).toFixed(1);
        }
        G.rRe.setAttribute('d', dre); G.rEnv[0].setAttribute('d', de1); G.rEnv[1].setAttribute('d', de2);
        var da = 1, m1 = 0, m2 = 0, A1 = '', A2 = '', wob = 1 - conv;
        SP.chi1.forEach(function (p, k) { m1 = Math.max(m1, Math.abs(p[0])); m2 = Math.max(m2, Math.abs(SP.chi2[k][0])); });
        var na = Math.max(2, Math.round(da * SP.x.length));
        for (var k = 0; k < na; k++) {
          var X2 = ANG.X(SP.x[k]).toFixed(1);
          var gx = SP.x[k], f1 = 1 + 0.6 * wob * Math.sin(3 * gx + 0.5), f2 = 1 + 0.6 * wob * Math.cos(2.5 * gx);
          A1 += (k ? 'L' : 'M') + X2 + ' ' + ANG.Y(f1 * SP.chi1[k][0] / m1).toFixed(1);
          A2 += (k ? 'L' : 'M') + X2 + ' ' + ANG.Y(f2 * SP.chi2[k][0] / m2).toFixed(1);
        }
        G.a1.setAttribute('d', A1); G.a2.setAttribute('d', A2);
      }
      var sweepS = step === 1 ? Math.min(1, u / 2.6) : 1;
      G.sweep.style.opacity = step === 1 && sweepS < 1 ? 1 : 0;
      if (step === 1) {
        var xs = SMALL[0].x0 + sweepS * 440; G.sweep.setAttribute('x1', xs); G.sweep.setAttribute('x2', xs);
        COMPS.forEach(function (cp, k) {
          var a = D.irg[cp];
          paintField(SMALL[k], function (i, j) { return D.sigma[i] > sweepS ? null : (a ? re(a, i, j) : 0); }, 1);
        });
      }
      if (step === 2) {
        var mg = smooth((u - 1.2) / 2.2), Z = D.zoom;
        paintField(GAUGE, function (i, j) { var p = Z.irg[i * NX + j], q = Z.glued[i * NX + j]; return lerp(p[0] * c1 + p[1] * s1, q[0] * c1 + q[1] * s1, mg); }, 1);
        var sx = function (s) { return STRIP.x0 + s * (STRIP.x1 - STRIP.x0); }, syv = function (v) { return STRIP.y1 - v * (STRIP.y1 - STRIP.y0) / 1.1; };
        var d = '';
        for (var i2 = 0; i2 < NS_; i2++) d += (i2 ? 'L' : 'M') + sx(D.sigma[i2]).toFixed(1) + ' ' + syv(lerp(G.eqIrg[i2], G.eqGl[i2], mg)).toFixed(1);
        G.eqLine.setAttribute('d', d);
        G.glLab.style.opacity = mg;
      }
      if (step >= 3) {
        var b = D.glued.h_nn, k3 = step === 3 ? smooth(u / 1.2) : 1;
        paintField(BIG, function (i, j) {
          var p = b[i * NX + j], r = p[0] * p[0] - p[1] * p[1], im = 2 * p[0] * p[1];
          return r * c2 + im * s2;
        }, (step === 4 ? 0.3 : 1) * k3);
        if (step === 4) G.patches.forEach(function (pg, k) { pg.style.opacity = smooth((u - 0.5 * k) / 0.6); });
      }
    }
    var lp = loop(function (t, now) { if (D && SP) { if (!built) build(); draw(t, now); } });
    fetch('figures/kn-recon.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) { D = d; });
    fetch('figures/kn-sep.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) { SP = d; });
    stepper(slide, 'kn-algo', {
      enter: function (dir, s) { step = s; stepT = dir > 0 ? performance.now() : -1e9; lp.start(); },
      leave: function () { lp.stop(); },
      step: function (s, fwd) { step = s; stepT = fwd ? performance.now() : -1e9; }
    });
  })();

  // ======================================================================
  // kn-qnms
  (function () {
    var slide = document.getElementById('kn-qnms'); if (!slide) return;
    var svg = slide.querySelector('.kq-svg');
    var P = { x0: 230, x1: 1150, y0: 200, y1: 830 }, RE = [0.35, 0.85], IM = [0.045, 0.105];
    var X = function (v) { return P.x0 + (v - RE[0]) / (RE[1] - RE[0]) * (P.x1 - P.x0); };
    var Y = function (v) { return P.y1 - (v - IM[0]) / (IM[1] - IM[0]) * (P.y1 - P.y0); };
    var IN = { x0: 1330, y0: 560, s: 300 };              // the (a, Q) inset
    var ix = function (a) { return IN.x0 + a * IN.s; }, iy = function (q) { return IN.y0 + IN.s - q * IN.s; };
    var D = null, built = false, step = 0, stepT = 0, L = {};
    function build() {
      built = true; svg.innerHTML = '';
      var g = el('g', {}, svg);
      jframe(g, {
        x0: P.x0, x1: P.x1, y0: P.y0, y1: P.y1,
        xt: range(0.4, 0.8, 0.1).map(function (v) { return [v, X(v), v.toFixed(1)]; }),
        yt: range(0.05, 0.10, 0.01).map(function (v) { return [v, Y(v), v.toFixed(2)]; }),
        minor: { x: range(0.36, 0.85, 0.02).map(X), y: range(0.045, 0.105, 0.005).map(Y) }
      });
      el('text', { x: (P.x0 + P.x1) / 2, y: P.y1 + 80, class: 'jf-lab' }, g).textContent = 'Re Mω';
      el('text', { x: P.x0 - 110, y: (P.y0 + P.y1) / 2, class: 'jf-lab', transform: 'rotate(-90 ' + (P.x0 - 110) + ' ' + (P.y0 + P.y1) / 2 + ')' }, g).textContent = '−Im Mω';
      // the inset: the (a, Q) quarter disk, up to a^2 + Q^2 = 0.9
      var gi = el('g', {}, svg);
      jframe(gi, {
        x0: IN.x0, x1: IN.x0 + IN.s, y0: IN.y0, y1: IN.y0 + IN.s, big: 10,
        xt: [[0, ix(0), '0'], [0.5, ix(0.5), '0.5'], [1, ix(1), '1']], yt: [[0, iy(0), '0'], [0.5, iy(0.5), '0.5'], [1, iy(1), '1']],
        minor: { x: [0.25, 0.75].map(ix), y: [0.25, 0.75].map(iy) }
      });
      var arc = 'M' + ix(Math.sqrt(0.9)) + ' ' + iy(0) + ' A' + Math.sqrt(0.9) * IN.s + ' ' + Math.sqrt(0.9) * IN.s + ' 0 0 0 ' + ix(0) + ' ' + iy(Math.sqrt(0.9));
      el('path', { d: arc, class: 'kq-arc' }, gi);
      el('path', { d: 'M' + ix(1) + ' ' + iy(0) + ' A' + IN.s + ' ' + IN.s + ' 0 0 0 ' + ix(0) + ' ' + iy(1), class: 'kq-ext' }, gi);
      el('text', { x: IN.x0 + IN.s / 2, y: IN.y0 + IN.s + 66, class: 'jf-lab jf-sm' }, gi).textContent = 'a/M';
      el('text', { x: IN.x0 - 54, y: IN.y0 + IN.s / 2, class: 'jf-lab jf-sm', transform: 'rotate(-90 ' + (IN.x0 - 54) + ' ' + (IN.y0 + IN.s / 2) + ')' }, gi).textContent = 'Q/M';
      L.dot = el('circle', { r: 9, class: 'kq-dot' }, svg);
      L.idot = el('circle', { r: 6, class: 'kq-dot' }, svg);
      L.read = el('text', { x: IN.x0, y: IN.y0 - 24, class: 'kq-read' }, svg);
      // lines of constant Q: Kerr-like first, then charged, both families
      L.lines = [];
      ['grav', 'em'].forEach(function (fam) {
        D.families[fam].n0.forEach(function (ln, k) {
          var cls = fam === 'grav' ? (k === 0 ? 'kq-kerr' : 'kq-g') : 'kq-e';
          var path = el('path', { class: 'kq-line ' + cls, style: '--k:' + (k / (D.families[fam].n0.length - 1)).toFixed(2) }, svg);
          var ip = el('path', { class: 'kq-line kq-in ' + cls, style: '--k:' + (k / (D.families[fam].n0.length - 1)).toFixed(2) }, svg);
          L.lines.push({ fam: fam, k: k, ln: ln, path: path, ip: ip });
        });
      });
      var k0 = D.families.grav.n0[0];
      L.kerrlab = el('text', { x: X(k0.w[0][0]) + 6, y: Y(-k0.w[0][1]) - 22, class: 'kq-lab' }, svg); L.kerrlab.textContent = 'Kerr';
      var e0 = D.families.em.n0[0];
      L.emlab = el('text', { x: X(e0.w[0][0]) - 14, y: Y(-e0.w[0][1]) + 8, class: 'kq-lab kq-elab kq-end' }, svg); L.emlab.textContent = 'EM-led';
    }
    function partial(ln, f, map) {                    // polyline of the first fraction f, linear in the point index
      var n = ln.a.length, upto = f * (n - 1), d = '', last = null;
      for (var i = 0; i < n; i++) {
        if (i > upto + 1e-9) {
          var j = Math.floor(upto), r = upto - j;
          if (j < n - 1 && r > 0) { var p = map(ln, j, r); d += 'L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1); last = p; }
          break;
        }
        var q = map(ln, i, 0); d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); last = q;
      }
      return { d: d, end: last };
    }
    function mW(ln, i, r) { var a = ln.w[i], b = ln.w[Math.min(i + 1, ln.w.length - 1)]; return [X(lerp(a[0], b[0], r)), Y(-lerp(a[1], b[1], r))]; }
    function mA(ln, i, r) { var a = ln.a[i], b = ln.a[Math.min(i + 1, ln.a.length - 1)]; return [ix(lerp(a, b, r)), iy(ln.Q)]; }
    function paint(now) {
      var u = (now - stepT) / 1000, cur = null;
      var nG = D.families.grav.n0.length;
      L.lines.forEach(function (o) {
        var f;
        if (o.fam === 'grav' && o.k === 0) f = step === 0 ? Math.min(1, u / 3) : 1;
        else if (o.fam === 'grav') f = step === 1 ? Math.max(0, Math.min(1, (u - 0.45 * (o.k - 1)) / 0.9)) : (step >= 2 ? 1 : 0);
        else f = step === 2 ? Math.max(0, Math.min(1, (u - 0.35 * o.k) / 0.9)) : 0;
        var a = partial(o.ln, f, mW), b = partial(o.ln, f, mA);
        o.path.setAttribute('d', f > 0 ? a.d : ''); o.ip.setAttribute('d', f > 0 ? b.d : '');
        if (f > 0 && f < 1) cur = { o: o, a: a.end, b: b.end, f: f };
      });
      if (!cur) {                                     // rest on the Kerr line's end, or the last one drawn
        var o = L.lines[step === 2 ? L.lines.length - 1 : (step === 1 ? nG - 1 : 0)];
        cur = { o: o, a: mW(o.ln, o.ln.a.length - 1, 0), b: mA(o.ln, o.ln.a.length - 1, 0), f: 1 };
      }
      L.dot.setAttribute('cx', cur.a[0]); L.dot.setAttribute('cy', cur.a[1]);
      L.idot.setAttribute('cx', cur.b[0]); L.idot.setAttribute('cy', cur.b[1]);
      L.dot.setAttribute('class', 'kq-dot ' + (cur.o.fam === 'em' ? 'kq-dote' : ''));
      L.idot.setAttribute('class', 'kq-dot ' + (cur.o.fam === 'em' ? 'kq-dote' : ''));
      var ai = cur.o.ln.a, idx = Math.min(ai.length - 1, Math.round(cur.f * (ai.length - 1)));
      L.read.textContent = 'a/M = ' + ai[idx].toFixed(2) + ',  Q/M = ' + cur.o.ln.Q.toFixed(2);
      L.emlab.style.opacity = step >= 2 ? smooth(u / 0.8) : 0;
    }
    var lp = loop(function (t, now) { if (D) { if (!built) build(); paint(now); } });
    fetch('figures/kn-qnm.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) { D = d; });
    stepper(slide, 'kn-qnms', {
      enter: function (dir, s) { step = s; stepT = dir > 0 ? performance.now() : -1e9; lp.start(); },
      leave: function () { lp.stop(); },
      step: function (s, fwd) { step = s; stepT = fwd ? performance.now() : -1e9; }
    });
  })();

  // ======================================================================
  // kn-qqnm
  (function () {
    var slide = document.getElementById('kn-qqnm'); if (!slide) return;
    var svg = slide.querySelector('.kr-svg');
    var MAPS = [{ key: 'g22xg22_gw', x0: 230, lo: 0.09, hi: 0.14, ticks: [0.09, 0.11, 0.13] },
                { key: 'g22xe22_gw', x0: 1020, lo: 0, hi: 0.47, ticks: [0, 0.2, 0.4] }];
    var Y0 = 240, S = 480;
    var D = null, LN = null, built = false, step = 0, stepT = [0, 0], t2 = -1e9, G = {};
    var imgs = [];
    function build() {
      built = true; svg.innerHTML = '';
      MAPS.forEach(function (m, k) {
        var cv = slide.querySelector('.kr-m' + k), d = D[m.key], n = d.n;
        cv.width = n; cv.height = n;
        cv.style.left = m.x0 + 'px'; cv.style.top = Y0 + 'px'; cv.style.width = S + 'px'; cv.style.height = S + 'px';
        imgs[k] = { cv: cv, ctx: cv.getContext('2d'), n: n, d: d, m: m };
        var ax = function (a) { return m.x0 + a * S; }, ay = function (q) { return Y0 + S - q * S; };
        var g = el('g', { class: 'kr-g' + k }, svg);
        jframe(g, {
          x0: m.x0, x1: m.x0 + S, y0: Y0, y1: Y0 + S,
          xt: range(0, 1, 0.2).map(function (v) { return [v, ax(v), v.toFixed(1)]; }),
          yt: range(0, 1, 0.2).map(function (v) { return [v, ay(v), k ? null : v.toFixed(1)]; }),
          minor: { x: range(0.1, 0.9, 0.2).map(ax), y: range(0.1, 0.9, 0.2).map(ay) }
        });
        el('path', { d: 'M' + ax(1) + ' ' + ay(0) + ' A' + S + ' ' + S + ' 0 0 0 ' + ax(0) + ' ' + ay(1), class: 'kq-ext' }, g);
        el('text', { x: m.x0 + S / 2, y: Y0 + S + 80, class: 'jf-lab' }, g).textContent = 'a/M';
        if (!k) el('text', { x: m.x0 - 90, y: Y0 + S / 2, class: 'jf-lab', transform: 'rotate(-90 ' + (m.x0 - 90) + ' ' + (Y0 + S / 2) + ')' }, g).textContent = 'Q/M';
        el('text', { x: m.x0 + 16, y: Y0 + S - 18, class: 'kr-kerr' }, g).textContent = 'Kerr';
        // colour bar, framed, ticks inward
        var bx = m.x0 + S + 36, defs = el('defs', {}, g), gr = el('linearGradient', { id: 'kr-grad' + k, x1: 0, y1: 1, x2: 0, y2: 0 }, defs);
        YLORBR.forEach(function (c, i) { el('stop', { offset: i / (YLORBR.length - 1), 'stop-color': 'rgb(' + c.join(',') + ')' }, gr); });
        el('rect', { x: bx, y: Y0, width: 24, height: S, fill: 'url(#kr-grad' + k + ')' }, g);
        el('rect', { x: bx, y: Y0, width: 24, height: S, class: 'jf-box' }, g);
        m.ticks.forEach(function (v) {
          var yy = Y0 + S - (v - m.lo) / (m.hi - m.lo) * S;
          el('line', { x1: bx, x2: bx + 8, y1: yy, y2: yy, class: 'jf-tk' }, g);
          el('line', { x1: bx + 24, x2: bx + 16, y1: yy, y2: yy, class: 'jf-tk' }, g);
          el('text', { x: bx + 34, y: yy + 9, class: 'jf-num jf-start' }, g).textContent = v.toFixed(2);
        });
        el('text', { x: bx + 12, y: Y0 - 16, class: 'jf-num' }, g).textContent = '|𝓡|';
      });
    }
    function paint(k, qmax) {
      var I = imgs[k], n = I.n, d = I.d, m = I.m, im = I.ctx.createImageData(n, n);
      for (var j = 0; j < n; j++) {
        var q = j / (n - 1);
        for (var i = 0; i < n; i++) {
          var v = d.abs[j * n + i], o = 4 * ((n - 1 - j) * n + i);
          if (v === null || q > qmax) { im.data[o + 3] = 0; continue; }
          var c = cmap(YLORBR, (v - m.lo) / (m.hi - m.lo));
          im.data[o] = c[0]; im.data[o + 1] = c[1]; im.data[o + 2] = c[2]; im.data[o + 3] = 255;
        }
      }
      I.ctx.putImageData(im, 0, 0);
    }
    var lp = loop(function (t, now) {
      if (!D) return; if (!built) build();
      [0, 1].forEach(function (k) {
        var q = k === 1 && step < 1 ? -1 : Math.min(1.01, (now - stepT[k]) / 2600);
        paint(k, q);
      });
    });
    // the line plot (press 2): |R| against a/M at fixed Q, and the Kerr reference of KMY
    var LP = { x0: 330, x1: 1330, y0: 240, y1: 760 }, LY = [0.09, 0.14];
    var lx = function (a) { return LP.x0 + a * (LP.x1 - LP.x0); }, ly = function (v) { return LP.y1 - (v - LY[0]) / (LY[1] - LY[0]) * (LP.y1 - LP.y0); };
    function buildLines() {
      var g = G.lp = el('g', { class: 'kr-lp' }, svg);
      jframe(g, {
        x0: LP.x0, x1: LP.x1, y0: LP.y0, y1: LP.y1,
        xt: range(0, 1, 0.2).map(function (v) { return [v, lx(v), v.toFixed(1)]; }),
        yt: range(0.09, 0.14, 0.01).map(function (v) { return [v, ly(v), v.toFixed(2)]; }),
        minor: { x: range(0.1, 0.9, 0.2).map(lx), y: range(0.095, 0.135, 0.01).map(ly) }
      });
      el('text', { x: (LP.x0 + LP.x1) / 2, y: LP.y1 + 80, class: 'jf-lab' }, g).textContent = 'a/M';
      el('text', { x: LP.x0 - 110, y: (LP.y0 + LP.y1) / 2, class: 'jf-lab', transform: 'rotate(-90 ' + (LP.x0 - 110) + ' ' + (LP.y0 + LP.y1) / 2 + ')' }, g).textContent = '|𝓡|';
      var defs = el('defs', {}, g), cp = el('clipPath', { id: 'kr-lclip' }, defs);
      G.clip = el('rect', { x: LP.x0, y: LP.y0 - 10, width: 0, height: LP.y1 - LP.y0 + 20 }, cp);
      var cg = el('g', { 'clip-path': 'url(#kr-lclip)' }, g);
      LN.lines.forEach(function (L, k) {
        var d = ''; L.pts.forEach(function (p, i) { d += (i ? 'L' : 'M') + lx(p[0]).toFixed(1) + ' ' + ly(p[1]).toFixed(1); });
        el('path', { d: d, class: 'kr-line kr-s' + k }, cg);
        // gnuplot-style key, bottom left: the label, then a long line sample
        var ky = LP.y1 - 230 + 38 * k;
        el('text', { x: LP.x0 + 230, y: ky + 8, class: 'kr-llab kr-end' }, g).textContent = 'Q/M = ' + L.Q.toFixed(k ? 1 : 2);
        el('line', { x1: LP.x0 + 245, x2: LP.x0 + 335, y1: ky, y2: ky, class: 'kr-line kr-s' + k }, g);
      });
      LN.kmy.forEach(function (p, i) { if (i % 5 === 0) el('circle', { cx: lx(p[0]), cy: ly(p[1]), r: 7, class: 'kr-kmy' }, cg); });
      var ky2 = LP.y1 - 230 + 38 * LN.lines.length;
      el('text', { x: LP.x0 + 230, y: ky2 + 8, class: 'kr-llab kr-end' }, g).textContent = 'Kerr (KMY)';
      el('circle', { cx: LP.x0 + 290, cy: ky2, r: 7, class: 'kr-kmy' }, g);
    }
    fetch('figures/kn-qqnm.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) { D = d; });
    fetch('figures/kn-lines.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) { LN = d; });
    var lp2 = loop(function (t, now) {
      if (!LN || !built) return;
      if (!G.lp) buildLines();
      G.clip.setAttribute('width', step >= 2 ? (LP.x1 - LP.x0 + 260) * smooth((now - t2 - 500) / 2200) : 0);
    });
    stepper(slide, 'kn-qqnm', {
      enter: function (dir, s) { step = s; stepT = [dir > 0 && s === 0 ? performance.now() : -1e9, -1e9]; t2 = -1e9; lp.start(); lp2.start(); },
      leave: function () { lp.stop(); lp2.stop(); },
      step: function (s, fwd) { step = s; if (s >= 1 && stepT[1] < 0) stepT[1] = fwd ? performance.now() : -1e9; if (s >= 2) t2 = fwd ? performance.now() : -1e9; }
    });
  })();
})();
