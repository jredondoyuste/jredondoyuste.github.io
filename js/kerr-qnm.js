// Kerr quasinormal modes, solved in the browser.
//
// Units G = c = M = 1, time dependence e^{-i omega t + i m phi}.
// Radial: Leaver's continued fraction, in the form of Cook & Zalutskiy,
//   PRD 90, 124021 (2014), Eqs. (31)-(44). Angular: their spectral method,
//   Eqs. (50)-(55), in a basis of spin-weighted spherical harmonics.
// The two are coupled through the separation constant A(a omega); a
// complex secant iteration drives the continued fraction to zero, and
// spin sequences are continued outward from the Schwarzschild values.
// Checked against the Python `qnm` package (Stein 2019) by
// tools/kerr/test.js.
(function (root) {
  'use strict';

  // ---- complex arithmetic on [re, im] pairs -----------------------------

  function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function mul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
  function scl(a, k) { return [a[0] * k, a[1] * k]; }
  function div(a, b) {
    var d = b[0] * b[0] + b[1] * b[1];
    return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
  }
  function abs(a) { return Math.hypot(a[0], a[1]); }
  function cexp(a) { var e = Math.exp(a[0]); return [e * Math.cos(a[1]), e * Math.sin(a[1])]; }
  function clog(a) { return [Math.log(abs(a)), Math.atan2(a[1], a[0])]; }
  function csqrt(a) {
    var r = abs(a), re = Math.sqrt((r + a[0]) / 2), im = Math.sqrt(Math.max(0, (r - a[0]) / 2));
    return [re, a[1] < 0 ? -im : im];
  }
  var I = [0, 1];

  // ---- radial: Leaver's continued fraction ------------------------------

  // Characteristic exponents and D_0..D_4 of CZ Eqs. (31), for the choice
  // ingoing at r+, outgoing at infinity.
  function Dcoeffs(w, a, s, m, A) {
    var root = Math.sqrt(1 - a * a), rp = 1 + root, rm = 1 - root;
    var sp = scl(sub(scl(w, 2 * rp), [m * a, 0]), 1 / (2 * root));
    var sm = scl(sub(scl(w, 2 * rm), [m * a, 0]), 1 / (2 * root));
    var zeta = mul(I, w);
    var xi = sub([-s, 0], mul(I, sp));
    var eta = scl(mul(I, sm), -1);
    var p = scl(zeta, root);
    var alpha = add(add([1 + 2 * s, 0], add(xi, eta)), scl(zeta, -2));
    var gamma = add([1 + s, 0], scl(eta, 2));
    var delta = add([1 + s, 0], scl(xi, 2));
    var gd = scl(add(gamma, delta), 0.5);
    var w2 = mul(w, w);
    var sigma = add(add(add(A, scl(w2, a * a - 8)),
      mul(p, sub(add(scl(alpha, 2), gamma), delta))),
      mul(sub([1 + s, 0], gd), add([s, 0], gd)));
    return [
      delta,
      sub(sub(add(scl(p, 4), gamma), add(scl(alpha, 2), delta)), [2, 0]),
      add(sub(scl(alpha, 2), gamma), [2, 0]),
      sub(mul(alpha, sub(scl(p, 4), delta)), sigma),
      mul(alpha, add(sub(alpha, gamma), [1, 0]))
    ];
  }

  // Three-term recurrence  al_k a_{k+1} + be_k a_k + ga_k a_{k-1} = 0.
  function al(D, k) { return add([k * k + k, 0], scl(add(D[0], [0, 0]), k + 1)); }
  function be(D, k) { return add([-2 * k * k + 2 * k, 0], add(scl(D[1], k), D[3])); }
  function ga(D, k) { return add([k * k - 3 * k + 2, 0], add(scl(D[2], k - 1), D[4])); }

  // The n-th inversion of the continued fraction (CZ Eq. 44); zero at a QNM.
  function leaver(w, a, s, m, A, n) {
    var D = Dcoeffs(w, a, s, m, A);
    var q = [0, 0], k;                       // q_k = a_{k-1}/a_k
    for (k = 0; k < n; k++) q = scl(div(al(D, k), add(be(D, k), mul(ga(D, k), q))), -1);
    // tail r_n = a_{n+1}/a_n = -ga_{n+1}/(be_{n+1} + A_2/(be_{n+2} + ...)),
    // A_j = -al_{n+j-1} ga_{n+j}; the denominator by modified Lentz
    var tiny = 1e-300, f = be(D, n + 1), Cl, Dl = [0, 0], j, Aj, Bj, d;
    if (abs(f) === 0) f = [tiny, 0];
    Cl = f;
    for (j = 2; j < 200000; j++) {
      Bj = be(D, n + j);
      Aj = scl(mul(al(D, n + j - 1), ga(D, n + j)), -1);
      Dl = add(Bj, mul(Aj, Dl)); if (abs(Dl) === 0) Dl = [tiny, 0];
      Cl = add(Bj, div(Aj, Cl)); if (abs(Cl) === 0) Cl = [tiny, 0];
      Dl = div([1, 0], Dl);
      d = mul(Cl, Dl);
      f = mul(f, d);
      if (abs(sub(d, [1, 0])) < 1e-15) break;
    }
    var r = scl(div(ga(D, n + 1), f), -1);
    // normalised by the size of be_n so the secant sees an O(1) function
    var F = add(add(be(D, n), mul(ga(D, n), q)), mul(al(D, n), r));
    return div(F, be(D, n));
  }

  // ---- angular: spectral decomposition ----------------------------------

  function lmin(s, m) { return Math.max(Math.abs(s), Math.abs(m)); }
  function calF(s, l, m) {
    if (s === 0 && l + 1 === 0) return 0;
    return Math.sqrt(((l + 1) * (l + 1) - m * m) / (2 * l + 3) / (2 * l + 1)) *
      Math.sqrt(((l + 1) * (l + 1) - s * s) / ((l + 1) * (l + 1)));
  }
  function calG(s, l, m) {
    if (l === 0) return 0;
    return Math.sqrt((l * l - m * m) / (4 * l * l - 1)) * Math.sqrt(1 - s * s / l / l);
  }
  function calH(s, l, m) { return (l === 0 || s === 0) ? 0 : -m * s / l / (l + 1); }

  function Mmatrix(s, c, m, lmax) {
    var l0 = lmin(s, m), N = lmax - l0 + 1, M = [], i, j, l, lp, c2 = mul(c, c), cs = scl(c, 2 * s), e;
    for (i = 0; i < N; i++) {
      M.push([]);
      for (j = 0; j < N; j++) {
        l = l0 + i; lp = l0 + j; e = [0, 0];
        if (lp === l - 2) e = scl(c2, -calF(s, lp, m) * calF(s, lp + 1, m));
        else if (lp === l - 1) e = add(scl(c2, -calF(s, lp, m) * (calH(s, lp + 1, m) + calH(s, lp, m))), scl(cs, calF(s, lp, m)));
        else if (lp === l) e = add([l * (l + 1) - s * (s + 1), 0], add(scl(c2, -(calF(s, lp, m) * calG(s, lp + 1, m) + calG(s, lp, m) * calF(s, lp - 1, m) + Math.pow(calH(s, lp, m), 2))), scl(cs, calH(s, lp, m))));
        else if (lp === l + 1) e = add(scl(c2, -calG(s, lp, m) * (calH(s, lp - 1, m) + calH(s, lp, m))), scl(cs, calG(s, lp, m)));
        else if (lp === l + 2) e = scl(c2, -calG(s, lp, m) * calG(s, lp - 1, m));
        M[i].push(e);
      }
    }
    return M;
  }

  // Solve (M - sigma) y = b by Gaussian elimination with partial pivoting.
  function shiftedSolve(M, sigma, b) {
    var N = M.length, Aug = [], i, j, k, p, t, f;
    for (i = 0; i < N; i++) {
      Aug.push(M[i].slice());
      Aug[i][i] = sub(Aug[i][i], sigma);
      Aug[i].push(b[i]);
    }
    for (k = 0; k < N; k++) {
      p = k;
      for (i = k + 1; i < N; i++) if (abs(Aug[i][k]) > abs(Aug[p][k])) p = i;
      t = Aug[k]; Aug[k] = Aug[p]; Aug[p] = t;
      if (abs(Aug[k][k]) === 0) Aug[k][k] = [1e-300, 0];
      for (i = k + 1; i < N; i++) {
        f = div(Aug[i][k], Aug[k][k]);
        if (f[0] === 0 && f[1] === 0) continue;
        for (j = k; j <= N; j++) Aug[i][j] = sub(Aug[i][j], mul(f, Aug[k][j]));
      }
    }
    var y = new Array(N);
    for (i = N - 1; i >= 0; i--) {
      t = Aug[i][N];
      for (j = i + 1; j < N; j++) t = sub(t, mul(Aug[i][j], y[j]));
      y[i] = div(t, Aug[i][i]);
    }
    return y;
  }

  function matvec(M, x) {
    return M.map(function (row) {
      var t = [0, 0];
      for (var j = 0; j < row.length; j++) t = add(t, mul(row[j], x[j]));
      return t;
    });
  }
  function dot(x, y) {  // conj(x) . y
    var t = [0, 0];
    for (var i = 0; i < x.length; i++) t = add(t, mul([x[i][0], -x[i][1]], y[i]));
    return t;
  }
  function normalise(x) {
    var n = Math.sqrt(dot(x, x)[0]);
    return x.map(function (z) { return scl(z, 1 / n); });
  }

  // Eigenvalue of M closest to A0 and its eigenvector, by Rayleigh-quotient
  // iteration. C is phased so the coefficient of l itself is real positive,
  // which makes S continuous with sY_lm at a = 0.
  function angular(s, l, m, c, A0, lmax) {
    lmax = lmax || Math.max(l + 14, 20);
    // shifts are nudged off the eigenvalue so the solve never goes singular
    var nudge = function (z) { return add(z, [1e-9 * (1 + abs(z)), 1e-9 * (1 + abs(z))]); };
    var M = Mmatrix(s, c, m, lmax), N = M.length, l0 = lmin(s, m), x = [], i, sig = nudge(A0), lam = A0, Mx;
    for (i = 0; i < N; i++) x.push(i === l - l0 ? [1, 0] : [1e-3, 0]);
    for (var it = 0; it < 40; it++) {
      x = normalise(shiftedSolve(M, sig, x));
      Mx = matvec(M, x);
      var lamNew = dot(x, Mx);
      var res = 0;
      for (i = 0; i < N; i++) res += Math.pow(abs(sub(Mx[i], mul(lamNew, x[i]))), 2);
      lam = lamNew;
      if (Math.sqrt(res) < 1e-13 * (1 + abs(lam))) break;
      // only move the shift once we are clearly on the right eigenvalue
      if (it > 1) sig = nudge(lam);
    }
    var ph = x[l - l0], u = scl([ph[0], -ph[1]], 1 / abs(ph));
    return { A: lam, C: x.map(function (z) { return mul(z, u); }), lmin: l0, lmax: lmax };
  }

  // sY_lm(theta) for l = lmin..lmax at one x = cos(theta), by upward
  // recurrence on  x sY_l = F_l sY_{l+1} + H_l sY_l + G_l sY_{l-1},
  // which fixes the relative signs to the basis the matrix above uses.
  function swshColumn(s, m, lmax, x) {
    var l0 = lmin(s, m), p = Math.abs(m - s), q = Math.abs(m + s);
    var ch = Math.sqrt(Math.max(0, (1 + x) / 2)), sh = Math.sqrt(Math.max(0, (1 - x) / 2));
    var lf = logFact(p + q + 1) - logFact(p) - logFact(q);
    var Y = [Math.exp(0.5 * lf) / Math.sqrt(4 * Math.PI) * Math.pow(ch, p) * Math.pow(sh, q)];
    for (var l = l0; l < lmax; l++) {
      var prev = l > l0 ? Y[l - l0 - 1] : 0;
      Y.push(((x - calH(s, l, m)) * Y[l - l0] - calG(s, l, m) * prev) / calF(s, l, m));
    }
    return Y;
  }
  function logFact(n) { var t = 0; for (var i = 2; i <= n; i++) t += Math.log(i); return t; }

  // S(theta) on the given cos(theta) grid: arrays of re, im.
  function spheroidal(s, m, ang, xs) {
    var re = new Float64Array(xs.length), im = new Float64Array(xs.length);
    for (var i = 0; i < xs.length; i++) {
      var Y = swshColumn(s, m, ang.lmax, xs[i]);
      for (var j = 0; j < Y.length; j++) { re[i] += ang.C[j][0] * Y[j]; im[i] += ang.C[j][1] * Y[j]; }
    }
    return { re: re, im: im };
  }

  // ---- the coupled problem ----------------------------------------------

  function residual(w, a, s, l, m, n, Aguess) {
    var ang = angular(s, l, m, scl(w, a), Aguess);
    return { F: leaver(w, a, s, m, ang.A, n), ang: ang };
  }

  // Secant iteration in complex omega from a starting guess.
  function refine(w0, a, s, l, m, n, A0) {
    var w1 = add(w0, scl(w0, 1e-6)), r0 = residual(w0, a, s, l, m, n, A0), r1 = residual(w1, a, s, l, m, n, r0.ang.A), w2;
    for (var it = 0; it < 60; it++) {
      var dF = sub(r1.F, r0.F);
      if (abs(r1.F) < 1e-14 || abs(dF) === 0) break;
      w2 = sub(w1, mul(r1.F, div(sub(w1, w0), dF)));
      if (!isFinite(w2[0] + w2[1])) break;
      w0 = w1; r0 = r1; w1 = w2;
      r1 = residual(w1, a, s, l, m, n, r0.ang.A);
      if (abs(sub(w1, w0)) < 1e-14 * (1 + abs(w1))) break;
    }
    return { omega: w1, A: r1.ang.A, ang: r1.ang, F: abs(r1.F), iters: it };
  }

  // Schwarzschild s = -2 frequencies, l = 2..6, n = 0..3 (from qnm), which
  // seed every spin sequence.
  var SCHW = {
    2: [[0.373671684418, -0.088962315689], [0.346710996879, -0.273914875291], [0.301053454613, -0.478276983223], [0.251504962226, -0.705148202442]],
    3: [[0.599443288437, -0.092703047945], [0.582643803033, -0.281298113435], [0.551684900778, -0.479092750967], [0.511961911058, -0.690337095969]],
    4: [[0.809178377532, -0.094163960989], [0.796631532035, -0.284334349405], [0.772709532607, -0.479908175121], [0.739836730006, -0.683924319018]],
    5: [[1.012295312135, -0.094870516082], [1.002221027891, -0.285817381772], [0.982695760808, -0.480328456014], [0.955004006118, -0.680556908650]],
    6: [[1.212009820652, -0.095265845842], [1.203573974389, -0.286649925114], [1.187073674602, -0.480564492781], [1.163270061851, -0.678590980983]]
  };

  // Spin grid used for continuation: fine near extremality.
  var GRID = (function () {
    var g = [], a;
    for (a = 0; a < 0.9 - 1e-9; a += 0.02) g.push(+a.toFixed(4));
    for (a = 0.9; a < 0.99 - 1e-9; a += 0.005) g.push(+a.toFixed(4));
    for (a = 0.99; a <= 0.9995 + 1e-9; a += 0.001) g.push(+a.toFixed(4));
    return g;
  })();
  var AMAX = GRID[GRID.length - 1];

  var sequences = {};

  // Solve at spin aT from the last point p1 (and p2 before it), predicting
  // by linear extrapolation. A prediction that misses by more than a tenth
  // of the step it took means the sequence is turning fast or we landed on
  // a neighbouring root: halve the step and try again.
  function step(p1, p2, aT, s, l, m, n, depth) {
    var gW = p1.omega, gA = p1.A, t;
    if (p2) {
      t = (aT - p1.a) / (p1.a - p2.a);
      gW = add(p1.omega, scl(sub(p1.omega, p2.omega), t));
      gA = add(p1.A, scl(sub(p1.A, p2.A), t));
    }
    var sol = refine(gW, aT, s, l, m, n, gA);
    sol.a = aT;
    var miss = abs(sub(sol.omega, gW)), took = abs(sub(gW, p1.omega));
    var ok = p2 ? miss <= 0.1 * took + 1e-10 : miss < 0.01;
    if ((ok && sol.F < 1e-9) || depth > 14) return [sol];
    var mid = step(p1, p2, (p1.a + aT) / 2, s, l, m, n, depth + 1);
    var last = mid[mid.length - 1], before = mid.length > 1 ? mid[mid.length - 2] : p1;
    return mid.concat(step(last, before, aT, s, l, m, n, depth + 1));
  }

  // One mode on its spin sequence at spin a: continued from a = 0 through
  // GRID (cached, with any bisection points) and finished with one step to a.
  function mode(s, l, m, n, a) {
    if (s !== -2) throw new Error('only s = -2 is seeded');
    a = Math.min(Math.max(a, 0), AMAX);
    var key = [s, l, m, n].join(','), seq = sequences[key];
    if (!seq) {
      seq = sequences[key] = [refine(SCHW[l][n], 0, s, l, m, n, [l * (l + 1) - s * (s + 1), 0])];
      seq[0].a = 0;
      seq.next = 1;
    }
    while (seq.next < GRID.length && seq[seq.length - 1].a < a) {
      var p1 = seq[seq.length - 1], p2 = seq.length > 1 ? seq[seq.length - 2] : null;
      Array.prototype.push.apply(seq, step(p1, p2, GRID[seq.next++], s, l, m, n, 0));
    }
    var i = 0;
    while (i + 1 < seq.length && seq[i + 1].a <= a) i++;
    var out = seq[i].a === a ? seq[i] : step(seq[i], i > 0 ? seq[i - 1] : null, a, s, l, m, n, 0).pop();
    return withMeta(out, s, l, m, n);
  }
  // The cached spin sequence up to amax, as [{a, omega}].
  function sequence(s, l, m, n, amax) {
    mode(s, l, m, n, amax);
    return sequences[[s, l, m, n].join(',')].filter(function (p) { return p.a <= amax; })
      .map(function (p) { return { a: p.a, omega: p.omega }; });
  }
  function withMeta(sol, s, l, m, n) {
    return { s: s, l: l, m: m, n: n, a: sol.a, omega: sol.omega, A: sol.A, ang: sol.ang, F: sol.F };
  }

  // ---- radial eigenfunction ---------------------------------------------

  // Coefficients a_k of the minimal solution: forward up to n, then the
  // ratios a_{k+1}/a_k by backward recurrence, which is stable for it.
  function radialSeries(md) {
    var D = Dcoeffs(md.omega, md.a, md.s, md.m, md.A), n = md.n, K = 400, coef, k;
    for (;;) {
      coef = [[1, 0]];
      var q = [0, 0];
      for (k = 0; k < n; k++) {
        q = scl(div(al(D, k), add(be(D, k), mul(ga(D, k), q))), -1);
        coef.push(div(coef[k], q));
      }
      var r = new Array(K + 1); r[K] = [1, 0];
      for (k = K - 1; k >= n; k--) r[k] = scl(div(ga(D, k + 1), add(be(D, k + 1), mul(al(D, k + 1), r[k + 1]))), -1);
      for (k = n; k < K; k++) coef.push(mul(coef[k], r[k]));
      var big = 0;
      for (k = 0; k <= K; k++) big = Math.max(big, abs(coef[k]));
      if (abs(coef[K]) < 1e-13 * big || K >= 64000) break;
      K *= 2;
    }
    return coef;
  }

  // g(x) = sum a_k x^k on x in [0,1]: x = (r - r+)/(r - r-), horizon to
  // null infinity. This is R(r) with its singular horizon and asymptotic
  // factors stripped (see radialR), i.e. the mode on a horizon-penetrating,
  // hyperboloidal slice.
  function radialProfile(md, xs, coef) {
    coef = coef || radialSeries(md);
    var re = new Float64Array(xs.length), im = new Float64Array(xs.length);
    for (var i = 0; i < xs.length; i++) {
      var x = xs[i], sr = 0, si = 0;
      for (var k = coef.length - 1; k >= 0; k--) {   // Horner
        var tr = sr * x + coef[k][0], ti = si * x + coef[k][1];
        sr = tr; si = ti;
      }
      re[i] = sr; im[i] = si;
    }
    return { re: re, im: im };
  }

  // The Teukolsky radial function in Boyer-Lindquist r (for testing):
  // R = e^{i w r} (r-r+)^{-s-i sigma+} (r-r-)^{-1-s+i sigma+ + 2 i w} g(x).
  function radialR(md, r, coef) {
    var a = md.a, s = md.s, w = md.omega, root = Math.sqrt(1 - a * a), rp = 1 + root, rm = 1 - root;
    var sp = scl(sub(scl(w, 2 * rp), [md.m * a, 0]), 1 / (2 * root));
    var xi = sub([-s, 0], mul(I, sp));
    var pw = add(add([-1 - s, 0], mul(I, sp)), mul(I, scl(w, 2)));
    var g = radialProfile(md, [(r - rp) / (r - rm)], coef);
    var pref = cexp(add(add(mul(I, scl(w, r)), mul(xi, [Math.log(r - rp), 0])), mul(pw, [Math.log(r - rm), 0])));
    return mul(pref, [g.re[0], g.im[0]]);
  }

  var api = {
    mode: mode, sequence: sequence, refine: refine, leaver: leaver, angular: angular,
    spheroidal: spheroidal, swshColumn: swshColumn,
    radialSeries: radialSeries, radialProfile: radialProfile, radialR: radialR,
    AMAX: AMAX, LMAX: 6, NMAX: 3,
    c: { add: add, sub: sub, mul: mul, div: div, scl: scl, abs: abs, exp: cexp, log: clog, sqrt: csqrt }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KerrQNM = api;
})(this);
