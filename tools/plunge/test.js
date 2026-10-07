// Tests for js/kerr-geodesic.js.   node tools/plunge/test.js
// No reference file: every check is against the metric, a closed form, or
// a symmetry, never against the module's own formulas.
'use strict';
var path = require('path');
var G = require(path.join(__dirname, '../../js/kerr-geodesic.js'));

var fails = 0, checks = 0;
function check(name, err, tol) {
  checks++;
  if (!(err <= tol)) { fails++; console.log('FAIL  ' + name + '  err=' + err.toExponential(2) + '  tol=' + tol); }
  return err;
}
function worst(label, v) { console.log(label.padEnd(62) + v.toExponential(2)); }

// 1. R(r) from its coefficients vs the defining expression.
(function () {
  var mx = 0;
  [[0.7, 1.1, 2.3, 5], [0.99, 0.93, -1.2, 0.4], [0, 1, 3, 2]].forEach(function (p) {
    var a = p[0], E = p[1], L = p[2], Q = p[3];
    [1.3, 2, 4.7, 31].forEach(function (r) {
      var D = r * r - 2 * r + a * a, P = E * (r * r + a * a) - a * L;
      var Rd = P * P - D * (r * r + (L - a * E) * (L - a * E) + Q);
      mx = Math.max(mx, check('R ' + p + ' r=' + r, Math.abs(G.R(a, E, L, Q, r) - Rd) / (1 + Math.abs(Rd)), 1e-13));
    });
  });
  worst('1. R(r): coefficients vs definition', mx);
})();

// 2. Trajectories carry the right E, L, Q and are unit timelike, judged
//    from the BL metric alone. u^mu = (dx^mu/dlambda)/Sigma with the
//    lambda-derivatives taken by finite differences of the interpolated
//    path, after converting (v, phit) back to (t, phi).
function conserved(tr, label) {
  var a = tr.a, mx = { E: 0, L: 0, Q: 0, n: 0 }, n = 0;
  var l0 = 0, l1 = tr.lamH !== null ? tr.lamH : tr.lamEnd;
  for (var i = 1; i < 40; i++) {
    var lam = l0 + (l1 - l0) * i / 40, s = tr.at(lam);
    if (!(s.r > tr.rp + 0.05) || s.r > 300) continue;   // BL t, phi diverge at r_+
    // 4th-order central differences: d(q) = dq/dlambda
    var hstep = 2e-3 * (l1 - l0) / 40, sp = tr.at(lam + hstep), sm = tr.at(lam - hstep);
    var sp2 = tr.at(lam + 2 * hstep), sm2 = tr.at(lam - 2 * hstep);
    var d = function (q) { return (8 * (q(sp) - q(sm)) - (q(sp2) - q(sm2))) / (12 * hstep); };
    var th = function (q) { return Math.acos(q.z); };
    var Sg = s.r * s.r + a * a * s.z * s.z;
    var u = {
      t: d(function (q) { return q.t; }) / Sg, r: d(function (q) { return q.r; }) / Sg,
      h: d(th) / Sg, p: d(function (q) { return q.phi; }) / Sg
    };
    var g = G.metricBL(a, s.r, s.z);
    var ut = g.tt * u.t + g.tp * u.p, up = g.tp * u.t + g.pp * u.p, uh = g.hh * u.h;
    var norm = ut * u.t + up * u.p + g.rr * u.r * u.r + uh * u.h;
    var s2 = 1 - s.z * s.z;
    var Qm = uh * uh + s.z * s.z * (a * a * (1 - tr.E * tr.E) + up * up / s2);
    mx.E = Math.max(mx.E, Math.abs(-ut - tr.E));
    mx.L = Math.max(mx.L, Math.abs(up - tr.L));
    mx.Q = Math.max(mx.Q, Math.abs(Qm - tr.Q) / (1 + tr.Q));
    mx.n = Math.max(mx.n, Math.abs(norm + 1));
    n++;
  }
  check(label + ' samples', n >= 10 ? 0 : 1, 0);
  ['E', 'L', 'Q', 'n'].forEach(function (k) { check(label + ' ' + k, mx[k], 1e-6); });
  return Math.max(mx.E, mx.L, mx.Q, mx.n);
}
(function () {
  var mx = 0;
  [[0.7, 1.05, 2.0, 4.0, 0.3], [0.9, 1.0, -3.0, 6.0, 1.2], [0.99, 1.2, 1.0, 0.0, 0],
   [0.5, 1.0, 0.0, 9.0, 2.0], [0.0, 1.1, 1.5, 3.0, 0.7], [0.95, 1.0, 1.5, 1.0, 2.9]].forEach(function (p) {
    if (!G.plunges(p[0], p[1], p[2], p[3])) { check('setup plunges ' + p, 1, 0); return; }
    var tr = G.trajectory(p[0], p[1], p[2], p[3], { r0: 400, chi0: p[4] });
    mx = Math.max(mx, conserved(tr, 'infinity ' + p));
  });
  worst('2. from infinity: max |dE|, |dL|, |dQ|/(1+Q), |u.u+1|', mx);
})();

// 3. Schwarzschild: the orbit stays in a plane through the origin, so the
//    Cartesian positions are all orthogonal to one normal.
(function () {
  var tr = G.trajectory(0, 1.05, 2.0, 5.0, { r0: 300, chi0: 0.8 });
  var pts = G.sample(tr, 200).filter(function (s) { return s.r > 2.01; });
  var p = pts[10], q = pts[pts.length - 10];
  var nrm = [p.Y * q.Z - p.Z * q.Y, p.Z * q.X - p.X * q.Z, p.X * q.Y - p.Y * q.X];
  var nn = Math.hypot(nrm[0], nrm[1], nrm[2]), mx = 0;
  pts.forEach(function (s) {
    var d = (s.X * nrm[0] + s.Y * nrm[1] + s.Z * nrm[2]) / nn / Math.hypot(s.X, s.Y, s.Z);
    mx = Math.max(mx, Math.abs(d));
  });
  worst('3. a=0, Q=5: max |n.x|/|x| (planar orbit)', check('planar', mx, 1e-7));
})();

// 4. The plunge region. At a = 0 it is L^2 + Q < Lc(E)^2, with Lc from the
//    peak of the Schwarzschild potential f (1 + L^2/r^2) (Lc(1) = 4).
(function () {
  function LcSchw(E) {
    function peak(L) {
      var r = (L * L - L * Math.sqrt(L * L - 12)) / 2, f = 1 - 2 / r;
      return f * (1 + L * L / r / r);
    }
    var lo = Math.sqrt(12), hi = 50;
    for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (peak(m) < E * E) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  var mx = 0;
  [1, 1.1, 1.4].forEach(function (E) {
    var reg = G.plungeRegion(0, E, 21), Lc = LcSchw(E);
    reg.edge.forEach(function (p) {
      mx = Math.max(mx, check('a=0 edge E=' + E, Math.abs(Math.sqrt(p.L * p.L + p.Q) - Lc), 1e-8));
    });
  });
  worst('4. a=0 region edge vs L^2+Q = Lc(E)^2', mx);
  check('Lc(1) = 4', Math.abs(LcSchw(1) - 4), 1e-10);
  // a != 0: on the edge R has a double root outside r_+, i.e. it touches 0
  var mt = 0;
  [[0.7, 1], [0.99, 1.2], [0.3, 1.05]].forEach(function (p) {
    var reg = G.plungeRegion(p[0], p[1], 15), rp = G.horizons(p[0]).rp;
    reg.edge.forEach(function (e) {
      // min of R/r^4 over r in (r_+, 50), on a fine grid then golden search
      var f = function (r) { return G.R(p[0], p[1], e.L, e.Q, r) / Math.pow(r, 4); };
      var best = rp, fb = Infinity;
      for (var r = rp + 1e-3; r < 50; r *= 1.002) if (f(r) < fb) { fb = f(r); best = r; }
      var lo = best / 1.002, hi = best * 1.002;
      for (var i = 0; i < 100; i++) {
        var m1 = lo + (hi - lo) * 0.382, m2 = lo + (hi - lo) * 0.618;
        if (f(m1) < f(m2)) hi = m2; else lo = m1;
      }
      mt = Math.max(mt, check('touch a=' + p[0] + ' E=' + p[1] + ' L=' + e.L.toFixed(3), Math.abs(f((lo + hi) / 2)), 1e-9));
    });
  });
  worst('   a!=0: min R/r^4 on the edge (should touch zero)', mt);
})();

// 5. ISSO. Equatorial: Bardeen-Press-Teukolsky r_isco and E = sqrt(1 - 2/(3 r)).
//    a = 0: r = 6, E^2 = 8/9, L^2 + Q = 12 for every inclination.
//    Everywhere: R = R' = R'' = 0 at r_isso.
(function () {
  function bpt(a, pro) {
    var z1 = 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
    var z2 = Math.sqrt(3 * a * a + z1 * z1);
    return 3 + z2 + (pro ? -1 : 1) * Math.sqrt((3 - z1) * (3 + z1 + 2 * z2));
  }
  var me = 0, m0 = 0, mr = 0;
  [0.1, 0.5, 0.9, 0.99].forEach(function (a) {
    [1, -1].forEach(function (x) {
      var s = G.isso(a, x), r = bpt(a, x > 0);
      me = Math.max(me, check('isco r a=' + a + ' x=' + x, Math.abs(s.r - r), 1e-8));
      me = Math.max(me, check('isco E a=' + a + ' x=' + x, Math.abs(s.E - Math.sqrt(1 - 2 / 3 / r)), 1e-8));
    });
  });
  [-1, -0.6, 0.001, 0.4, 1].forEach(function (x) {
    var s = G.isso(0, x);
    m0 = Math.max(m0, check('a=0 r', Math.abs(s.r - 6), 1e-8), check('a=0 E', Math.abs(s.E * s.E - 8 / 9), 1e-10),
                  check('a=0 L2+Q', Math.abs(s.L * s.L + s.Q - 12), 1e-8));
  });
  [0, 0.3, 0.7, 0.95, 0.998].forEach(function (a) {
    [-0.9, -0.3, 0, 0.2, 0.8].forEach(function (x) {
      var s = G.isso(a, x);
      if (!s) { check('isso exists a=' + a + ' x=' + x, 1, 0); return; }
      var c = G.radialCoeffs(a, s.E, s.L, s.Q), r = s.r;
      var R0 = ((c[4] * r + c[3]) * r + c[2]) * r * r + c[1] * r + c[0];
      var R1 = ((4 * c[4] * r + 3 * c[3]) * r + 2 * c[2]) * r + c[1];
      var R2 = (12 * c[4] * r + 6 * c[3]) * r + 2 * c[2];
      var sc = Math.pow(r, 4);
      mr = Math.max(mr, check('isso residual a=' + a + ' x=' + x, Math.max(Math.abs(R0) / sc, Math.abs(R1 * r) / sc, Math.abs(R2 * r * r) / sc), 1e-7));
      // and theta really turns at sin(theta_min) = |x|
      var beta = a * a * (1 - s.E * s.E), zm2 = 1 - x * x;
      var th = s.Q - zm2 * (s.Q + s.L * s.L + beta) + beta * zm2 * zm2;
      mr = Math.max(mr, check('theta turning a=' + a + ' x=' + x, Math.abs(th) / (1 + s.Q), 1e-10));
    });
  });
  worst('5. equatorial ISCO vs Bardeen-Press-Teukolsky (r, E)', me);
  worst('   a=0 ISSO: r=6, E^2=8/9, L^2+Q=12', m0);
  worst('   R, rR\', r^2R\'\' at r_isso (/r^4), and Theta(z_m)', mr);
})();

// 6. Plunges from just inside the ISSO: conserved quantities, and the
//    particle reaches and crosses r_+ with v, phit finite.
(function () {
  var mx = 0, mh = 0;
  [[0.7, 0.5], [0.95, -0.4], [0.3, 1], [0.99, 0.9]].forEach(function (p) {
    var s = G.isso(p[0], p[1]);
    var tr = G.trajectory(p[0], s.E, s.L, s.Q, { r0: s.r * (1 - 1e-3), chi0: 0.4 });
    mx = Math.max(mx, conserved(tr, 'isso ' + p));
    var end = tr.at(tr.lamEnd);
    var ok = tr.lamH !== null && tr.lamH < tr.lamEnd && Math.abs(end.r - tr.rEnd) < 1e-9 && isFinite(end.v) && isFinite(end.phit);
    mh = Math.max(mh, check('crosses r_+ ' + p, ok ? 0 : 1, 0));
  });
  worst('6. from the ISSO: max |dE|, |dL|, |dQ|/(1+Q), |u.u+1|', mx);
  worst('   reaches r_end inside r_+, v and phit finite (0 = yes)', mh);
})();

// 7. timing: what a slider drag costs
(function () {
  var t0 = Date.now(), n = 0;
  for (var E = 1; E < 1.3; E += 0.03) { G.trajectory(0.8, E, 1.5, 3, { r0: 1000 }); n++; }
  var t1 = Date.now();
  G.plungeRegion(0.8, 1.05, 121);
  var t2 = Date.now();
  console.log('7. trajectory from r0=1000: ' + ((t1 - t0) / n).toFixed(1) + ' ms;  plunge region (121 L): ' + (t2 - t1) + ' ms');
})();

console.log((fails ? fails + ' of ' : 'all ') + checks + ' checks ' + (fails ? 'FAILED' : 'passed'));
process.exit(fails ? 1 : 0);
