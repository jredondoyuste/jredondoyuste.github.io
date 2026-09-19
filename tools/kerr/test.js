// Tests for js/kerr-qnm.js.   node tools/kerr/test.js
// Reference values: tools/kerr/make-reference.py (the `qnm` package).
'use strict';
var path = require('path');
var K = require(path.join(__dirname, '../../js/kerr-qnm.js'));
var ref = require('./reference.json');
var c = K.c;

var fails = 0, checks = 0;
function check(name, err, tol) {
  checks++;
  if (!(err <= tol)) { fails++; console.log('FAIL  ' + name + '  err=' + err.toExponential(2) + '  tol=' + tol); }
  return err;
}
function worst(label, v) { console.log(label.padEnd(58) + v.toExponential(2)); }

// 1. spin-weighted harmonics from the recurrence vs Goldberg's formula,
//    up to one sign per (l, m).
(function () {
  var mx = 0;
  ref.swsh.forEach(function (e) {
    var ys = ref.thetas.map(function (th) {
      var Y = K.swshColumn(-2, e.m, e.l, Math.cos(th));
      return Y[Y.length - 1];
    });
    var big = 0, err = 0;
    ys.forEach(function (y, i) { if (Math.abs(e.Y[i]) > Math.abs(e.Y[big])) big = i; });
    var sgn = Math.sign(ys[big] * e.Y[big]);
    ys.forEach(function (y, i) { err = Math.max(err, Math.abs(y * sgn - e.Y[i])); });
    mx = Math.max(mx, check('swsh l=' + e.l + ' m=' + e.m, err, 1e-11));
  });
  worst('1. -2Y_lm, l<=11: max |Y - Y_Goldberg|', mx);
})();

// 2. frequencies and separation constants vs qnm.
var byMode = {};
(function () {
  var mw = 0, mA = 0, t0 = Date.now();
  ref.modes.forEach(function (e) {
    var md = K.mode(-2, e.l, e.m, e.n, e.a);
    var ew = c.abs(c.sub(md.omega, e.w)), eA = c.abs(c.sub(md.A, e.A));
    var tag = 'l=' + e.l + ' m=' + e.m + ' n=' + e.n + ' a=' + e.a;
    mw = Math.max(mw, check('omega ' + tag, ew, 1e-9));
    mA = Math.max(mA, check('A ' + tag, eA / (1 + c.abs(e.A)), 1e-9));
    byMode[tag] = { md: md, e: e };
  });
  worst('2. omega vs qnm, ' + ref.modes.length + ' modes: max |dw|', mw);
  worst('   A vs qnm: max |dA|/(1+|A|)', mA);
  console.log('   (all spin sequences from a=0 in ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');
})();

// 3. Schwarzschild limit: S is exactly -2Y_lm; omega independent of m.
(function () {
  var mx = 0, md = 0;
  for (var l = 2; l <= 6; l++) for (var m = -l; m <= l; m++) {
    var mode = K.mode(-2, l, m, 0, 0);
    var xs = [-0.95, -0.3, 0.2, 0.7, 0.99];
    var S = K.spheroidal(-2, m, mode.ang, xs);
    xs.forEach(function (x, i) {
      var Y = K.swshColumn(-2, m, l, x);
      mx = Math.max(mx, Math.hypot(S.re[i] - Y[Y.length - 1], S.im[i]));
    });
    md = Math.max(md, c.abs(c.sub(mode.omega, K.mode(-2, l, 0, 0, 0).omega)));
  }
  worst('3. a=0: max |S - (-2Y_lm)|', check('a=0 S=Y', mx, 1e-12));
  worst('   a=0: max |omega_lm - omega_l0|', check('a=0 m-degeneracy', md, 1e-11));
})();

// 4. spheroidal harmonics vs qnm's, up to normalisation and phase.
(function () {
  var mx = 0;
  Object.keys(byMode).forEach(function (tag) {
    var md = byMode[tag].md, e = byMode[tag].e;
    var S = K.spheroidal(-2, e.m, md.ang, ref.thetas.map(Math.cos));
    // best complex ratio lambda minimising |S - lambda S_ref|
    var num = [0, 0], den = 0, nrm = 0, i, z, zr;
    for (i = 0; i < ref.thetas.length; i++) {
      z = [S.re[i], S.im[i]]; zr = e.S[i];
      num = c.add(num, c.mul([zr[0], -zr[1]], z)); den += zr[0] * zr[0] + zr[1] * zr[1];
    }
    var lam = c.scl(num, 1 / den), err = 0;
    for (i = 0; i < ref.thetas.length; i++) {
      err = Math.max(err, c.abs(c.sub([S.re[i], S.im[i]], c.mul(lam, e.S[i]))));
      nrm = Math.max(nrm, Math.hypot(S.re[i], S.im[i]));
    }
    mx = Math.max(mx, check('S ' + tag, err / nrm, 1e-8));
    check('|lambda|=1 ' + tag, Math.abs(c.abs(lam) - 1), 1e-8);
  });
  worst('4. S(theta) vs qnm, up to a phase: max rel. error', mx);
})();

// 5. the angular Teukolsky equation, by finite differences in theta:
//  (sin S')'/sin + (c^2 cos^2 - 2cs cos - (m + s cos)^2/sin^2 + s + A) S = 0
(function () {
  var mx = 0;
  ['l=2 m=2 n=0 a=0.9', 'l=3 m=-2 n=1 a=0.7', 'l=4 m=1 n=3 a=0.99', 'l=6 m=6 n=0 a=0.99'].forEach(function (tag) {
    var md = byMode[tag].md, s = -2, m = byMode[tag].e.m, cc = c.scl(md.omega, md.a), h = 1e-4;
    var grid = [], i;
    for (i = 0; i <= 200; i++) grid.push(Math.cos(Math.PI * i / 200));
    var Sg = K.spheroidal(s, m, md.ang, grid), peak = 0;
    for (i = 0; i <= 200; i++) peak = Math.max(peak, Math.hypot(Sg.re[i], Sg.im[i]));
    [0.4, 1.1, 1.9, 2.7].forEach(function (th) {
      var S = K.spheroidal(s, m, md.ang, [Math.cos(th - h), Math.cos(th), Math.cos(th + h)]);
      var v = function (i) { return [S.re[i], S.im[i]]; };
      var d1 = c.scl(c.sub(v(2), v(0)), 1 / (2 * h));
      var d2 = c.scl(c.add(c.sub(v(2), c.scl(v(1), 2)), v(0)), 1 / (h * h));
      var ct = Math.cos(th), st = Math.sin(th);
      var pot = c.add(c.add(c.scl(c.mul(cc, cc), ct * ct), c.scl(cc, -2 * s * ct)),
        c.add([-Math.pow(m + s * ct, 2) / (st * st) + s, 0], md.A));
      var res = c.add(c.add(d2, c.scl(d1, ct / st)), c.mul(pot, v(1)));
      mx = Math.max(mx, c.abs(res) / peak);
    });
  });
  worst('5. angular Teukolsky eq. residual / max|S| (FD, h=1e-4)', check('angular ODE', mx, 1e-6));
})();

// 6. the radial Teukolsky equation, by finite differences in r, for the
//    function assembled from Leaver's series:
//  Delta^-s (Delta^{s+1} R')' + ((K^2 - 2is(r-1)K)/Delta + 4is w r - lambda) R = 0
//  K = (r^2+a^2) w - a m,  lambda = A + a^2 w^2 - 2 a m w.
(function () {
  var mx = 0;
  ['l=2 m=2 n=0 a=0.7', 'l=2 m=2 n=0 a=0.99', 'l=3 m=-2 n=1 a=0.7', 'l=4 m=1 n=3 a=0.9', 'l=2 m=0 n=2 a=0'].forEach(function (tag) {
    var md = byMode[tag].md, s = -2, m = md.m, a = md.a, w = md.omega, coef = K.radialSeries(md);
    var rp = 1 + Math.sqrt(1 - a * a), h = 1e-4;
    [rp + 0.3, rp + 1.5, 6, 15].forEach(function (r) {
      var R = [K.radialR(md, r - h, coef), K.radialR(md, r, coef), K.radialR(md, r + h, coef)];
      var D = function (x) { return x * x - 2 * x + a * a; };
      var dm = Math.pow(D(r - h / 2), s + 1), dp = Math.pow(D(r + h / 2), s + 1);
      var kin = c.scl(c.sub(c.scl(c.sub(R[2], R[1]), dp), c.scl(c.sub(R[1], R[0]), dm)), Math.pow(D(r), -s) / (h * h));
      var Kr = c.sub(c.scl(w, r * r + a * a), [a * m, 0]);
      var lam = c.add(c.add(md.A, c.scl(c.mul(w, w), a * a)), c.scl(w, -2 * a * m));
      var pot = c.sub(c.add(c.scl(c.sub(c.mul(Kr, Kr), c.mul([0, 2 * s * (r - 1)], Kr)), 1 / D(r)), c.scl(c.mul([0, 4 * s * r], w), 1)), lam);
      var res = c.add(kin, c.mul(pot, R[1]));
      mx = Math.max(mx, c.abs(res) / (c.abs(R[1]) * (1 + c.abs(pot))));
    });
  });
  worst('6. radial Teukolsky eq. residual (FD, h=1e-4)', check('radial ODE', mx, 1e-6));
})();

// 7. the radial profile is finite at both ends and the series converged.
(function () {
  var worstTail = 0;
  Object.keys(byMode).forEach(function (tag) {
    var md = byMode[tag].md, coef = K.radialSeries(md), big = 0;
    coef.forEach(function (z) { big = Math.max(big, c.abs(z)); });
    worstTail = Math.max(worstTail, c.abs(coef[coef.length - 1]) / big);
    var g = K.radialProfile(md, [0, 0.5, 1], coef);
    for (var i = 0; i < 3; i++) if (!isFinite(g.re[i]) || !isFinite(g.im[i])) check('finite g ' + tag, Infinity, 0);
  });
  worst('7. Leaver series: max |a_K|/max|a_k| at truncation', check('series tail', worstTail, 1e-12));
})();

// 8. mirror modes: solving independently at (l, -m, -conj(omega)) gives a
//    QNM with A' = conj(A), S'(theta) = conj(S(pi - theta)) and g' = conj(g),
//    all up to a constant. kerr-view.js builds the mirror from these.
(function () {
  var mw = 0, mS = 0, mg = 0;
  ['l=2 m=2 n=0 a=0.7', 'l=2 m=2 n=0 a=0.99', 'l=3 m=-2 n=1 a=0.9', 'l=4 m=1 n=3 a=0.7', 'l=5 m=5 n=0 a=0.3'].forEach(function (tag) {
    var md = byMode[tag].md, s = -2;
    var guess = [-md.omega[0] * (1 + 1e-4), md.omega[1]];
    var mi = K.refine(guess, md.a, s, md.l, -md.m, md.n, [md.A[0], -md.A[1]]);
    mw = Math.max(mw, c.abs(c.sub(mi.omega, [-md.omega[0], md.omega[1]])), c.abs(c.sub(mi.A, [md.A[0], -md.A[1]])));
    var xs = [-0.9, -0.4, 0.1, 0.5, 0.95];
    var S1 = K.spheroidal(s, -md.m, mi.ang, xs), S0 = K.spheroidal(s, md.m, md.ang, xs.map(function (x) { return -x; }));
    var mdm = { s: s, l: md.l, m: -md.m, n: md.n, a: md.a, omega: mi.omega, A: mi.A };
    var g1 = K.radialProfile(mdm, xs.map(function (x) { return (x + 1) / 2; }));
    var g0 = K.radialProfile(md, xs.map(function (x) { return (x + 1) / 2; }));
    function ratioSpread(re1, im1, re0, im0) {   // max |z1 - lambda conj(z0)| / max|z1|
      var num = [0, 0], den = 0, i, big = 0, err = 0;
      for (i = 0; i < xs.length; i++) { num = c.add(num, c.mul([re0[i], im0[i]], [re1[i], im1[i]])); den += re0[i] * re0[i] + im0[i] * im0[i]; }
      var lam = c.scl(num, 1 / den);
      for (i = 0; i < xs.length; i++) {
        err = Math.max(err, c.abs(c.sub([re1[i], im1[i]], c.mul(lam, [re0[i], -im0[i]]))));
        big = Math.max(big, Math.hypot(re1[i], im1[i]));
      }
      return err / big;
    }
    mS = Math.max(mS, ratioSpread(S1.re, S1.im, S0.re, S0.im));
    mg = Math.max(mg, ratioSpread(g1.re, g1.im, g0.re, g0.im));
  });
  worst('8. mirror mode: |omega\' + conj(omega)|, |A\' - conj(A)|', check('mirror omega', mw, 1e-10));
  worst('   S\'(theta) vs conj S(pi - theta), up to a constant', check('mirror S', mS, 1e-10));
  worst('   g\'(x) vs conj g(x), up to a constant', check('mirror g', mg, 1e-10));
})();

console.log('\n' + (checks - fails) + '/' + checks + ' checks passed');
process.exit(fails ? 1 : 0);
