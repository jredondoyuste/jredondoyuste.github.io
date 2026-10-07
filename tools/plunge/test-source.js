// Tests for js/kerr-plunge.js (the point-particle source).   node tools/plunge/test-source.js
// Reference values: tools/plunge/make-reference-source.jl (GSN.jl bound-orbit modes).
'use strict';
var path = require('path'), fs = require('fs');
var G = require(path.join(__dirname, '../../js/kerr-geodesic.js'));
var W = require(path.join(__dirname, '../../js/kerr-gsn.js'));
var P = require(path.join(__dirname, '../../js/kerr-plunge.js'));
var c = W.c;
var refFile = path.join(__dirname, 'reference-source.json');
var ref = fs.existsSync(refFile) ? require(refFile) : null;

var fails = 0, checks = 0;
function check(name, err, tol) {
  checks++;
  if (!(err <= tol)) { fails++; console.log('FAIL  ' + name + '  err=' + (+err).toExponential(2) + '  tol=' + tol); }
  return err;
}
function worst(label, v) { console.log(label.padEnd(64) + (+v).toExponential(2)); }

// A circular orbit (inclination x, radius p) is periodic in Mino time with
// the theta period; its spectrum is lines at omega_k = (m Y_phi + k Y_theta)/Gamma,
// with Z_k = (2 pi / t(period)) times the integral over one period.
function circular(a, p, x, l, m, k) {
  var s = G.spherical(a, x, p), probe = G.trajectory(a, s.E, s.L, s.Q, { r0: p, fixR: true, lamMax: 50 });
  // one theta period: chi from 0 to 2 pi
  var Lt = 0, i;
  for (i = 1; i < probe.lam.length; i++) if (probe.y[i][1] >= 2 * Math.PI) break;
  var lo = probe.lam[i - 1], hi = probe.lam[i];
  for (var it = 0; it < 60; it++) { var mid = (lo + hi) / 2; if (probe.at(mid).chi < 2 * Math.PI) lo = mid; else hi = mid; }
  Lt = (lo + hi) / 2;
  if (s.Q < 1e-14) Lt = 1;   // equatorial: any span
  var tr = G.trajectory(a, s.E, s.L, s.Q, { r0: p, fixR: true, lamMax: Lt * 1.01 });
  var e1 = tr.at(Lt), Gam = e1.v / Lt, Yphi = e1.phit / Lt, Yth = 2 * Math.PI / Lt;
  var w = (m * Yphi + k * Yth) / Gam;
  var gr = P.grid(tr, { wmax: Math.abs(w), mmax: Math.abs(m), lamEnd: Lt });
  var Z = c.scl(P.amplitude(gr, l, m, w).Z, 2 * Math.PI / (Gam * Lt));
  return { w: w, Z: Z, flux: Math.pow(c.abs(Z), 2) / (4 * Math.PI * w * w) };
}

// 1b (below). Rotating a Schwarzschild orbit: a circular orbit tilted by
//    iota radiates in (l, m) what the equatorial one radiates in (l, m'),
//    reweighted by Wigner's |d^l_{m m'}(iota)|^2, line by line.

// 1. Schwarzschild circular orbits against post-Newtonian theory: the 22 flux
//    (m = +2 and -2 together) / (32/5 x^5) = 1 - (107/21) x + 4 pi x^{3/2} + O(x^2).
(function () {
  var mx = 0;
  [1000, 300].forEach(function (p) {
    var o = circular(0, p, 1, 2, 2, 0), x = 1 / p;
    var pn = 1 - 107 / 21 * x + 4 * Math.PI * Math.pow(x, 1.5);
    mx = Math.max(mx, check('PN p=' + p, Math.abs(2 * o.flux / (32 / 5 * Math.pow(x, 5)) - pn) / (x * x), 20));
  });
  worst('1. circular, a=0: (flux_22/Newtonian - PN)/x^2 (should be O(1))', mx);
})();

(function () {
  var p = 10, x = 0.6, cb = x, sb = Math.sqrt(1 - x * x), mx = 0;
  var F22 = circular(0, p, 1, 2, 2, 0).flux, F21 = circular(0, p, 1, 2, 1, 0).flux;
  var d2 = { 2: Math.pow((1 + cb) / 2, 2), 1: (1 + cb) * sb / 2, 0: Math.sqrt(3 / 8) * sb * sb, '-1': (1 - cb) * sb / 2, '-2': Math.pow((1 - cb) / 2, 2) };
  var d1 = { 2: (1 + cb) * sb / 2, 1: (2 * cb * cb + cb - 1) / 2, 0: Math.sqrt(1.5) * sb * cb, '-1': (-2 * cb * cb + cb + 1) / 2, '-2': (1 - cb) * sb / 2 };
  for (var m = -2; m <= 2; m++) {
    mx = Math.max(mx, check('Wigner 2 m=' + m, Math.abs(circular(0, p, x, 2, m, 2 - m).flux / (d2[m] * d2[m] * F22) - 1), 1e-6),
                  check('Wigner 1 m=' + m, Math.abs(circular(0, p, x, 2, m, 1 - m).flux / (d1[m] * d1[m] * F21) - 1), 1e-6));
  }
  worst('1b. a=0, tilted 53 deg: every (m, k) line vs Wigner d', mx);
})();

// 2. Kerr circular orbits, equatorial and inclined, against GSN.jl. (This
//    is what caught the misprint in D&H's A_nmb0: see js/kerr-plunge.js.)
if (ref) {
  var mw = 0, mf = 0;
  ref.modes.forEach(function (e) {
    var o = circular(e.a, e.p, e.x, e.l, e.m, e.k);
    var tag = 'a=' + e.a + ' p=' + e.p + ' x=' + e.x + ' l=' + e.l + ' m=' + e.m + ' k=' + e.k;
    // omega_mk from numerically integrated periods; GSN.jl's are analytic
    mw = Math.max(mw, check('omega ' + tag, Math.abs(o.w - e.omega) / Math.abs(e.omega), 1e-7));
    // the weakest polar harmonics (1e-4 of the k = 0 flux) are limited by R_in's ~1e-7
    mf = Math.max(mf, check('flux ' + tag, Math.abs(o.flux - e.EnergyFlux) / e.EnergyFlux, 5e-5));
  });
  worst('2. vs GSN.jl, ' + ref.modes.length + ' circular modes: omega_mk', mw);
  worst('   energy flux', mf);
} else console.log('2. (no reference-source.json: run julia tools/plunge/make-reference-source.jl)');

// Plunges from infinity, switched on smoothly (P.switchFor; opts override its choices).
function plungeZ(tr, l, m, w, opts) {
  var sw = P.switchFor(tr, w, opts);
  var gr = P.grid(tr, { wmax: Math.abs(w), mmax: Math.abs(m), lam0: tr.lamAt(sw.rStart) || 0 });
  return P.amplitude(gr, l, m, w, null, { window: sw.window }).Z;
}

// 3. Rotating a Schwarzschild plunge: (E, L, Q) is the equatorial plunge with
//    L' = sqrt(L^2 + Q), tilted, so at each omega sum_m |Z_lm|^2 agrees.
//    Once from infinity (E = 1.05) and once from the ISCO (inclination 50 deg).
(function () {
  var mx = 0;
  function sumM(tr, l, w) { var s = 0; for (var m = -l; m <= l; m++) s += Math.pow(c.abs(plungeZ(tr, l, m, w)), 2); return s; }
  var inc = G.trajectory(0, 1.05, 2, 5, { r0: 3e4, chi0: 0.7 }), eq = G.trajectory(0, 1.05, 3, 0, { r0: 3e4 });
  [0.15, 0.4].forEach(function (w) {
    mx = Math.max(mx, check('rotated plunge w=' + w, Math.abs(sumM(inc, 2, w) / sumM(eq, 2, w) - 1), 1e-6));
  });
  var si = G.isso(0, Math.cos(50 * Math.PI / 180)), se = G.isso(0, 1);
  var ti = G.trajectory(0, si.E, si.L, si.Q, { r0: 6 * (1 - 1e-3), chi0: 1.1 }), te = G.trajectory(0, se.E, se.L, se.Q, { r0: 6 * (1 - 1e-3) });
  // (an abrupt start breaks this at 1e-5: ISCO plunges are switched on too,
  //  here smoothly over the first 300 M of coordinate time)
  var on = { window: function (n) { return P.smoothStep(n.t / 300); } };
  [0.2, 0.5].forEach(function (w) {
    var gi = P.grid(ti, { wmax: w, mmax: 2 }), ge = P.grid(te, { wmax: w, mmax: 2 }), a = 0, b = 0;
    for (var m = -2; m <= 2; m++) { a += Math.pow(c.abs(P.amplitude(gi, 2, m, w, null, on).Z), 2); b += Math.pow(c.abs(P.amplitude(ge, 2, m, w, null, on).Z), 2); }
    mx = Math.max(mx, check('rotated ISCO plunge w=' + w, Math.abs(a / b - 1), 1e-6));
  });
  worst('3. a=0 plunges, tilted vs equatorial: sum_m |Z_2m|^2', mx);
})();

// 4-5. A sharp cutoff at r0 does not converge: |Z| grows like r0. The
//      smooth switch-on converges (default choices vs much more cautious
//      ones, at E = 1, 1.1, 1.5), and for radial infall from rest (a = 0,
//      E = 1, L = 0) matches the RWZ spectrum of 2308.14823 where those data
//      are reliable (omega <~ 0.3; above, the two RWZ data sets disagree with
//      each other) -- if the BHPlunges.jl data are on this machine.
(function () {
  var tr = G.trajectory(0, 1, 0, 0, { r0: 3e4 }), w = 0.3;
  var hard = function (r0) { var gr = P.grid(tr, { wmax: w, mmax: 2, lam0: tr.lamAt(r0) }); return c.abs(P.amplitude(gr, 2, 2, w).Z); };
  var g = hard(500) / hard(250);
  check('sharp cutoff grows like r0', Math.abs(g - 2) , 0.3);
  worst('4. sharp cutoff: |Z(r0=500)| / |Z(r0=250)| (diverges ~ r0: 2)', g);
  var m5 = 0, cautious = { S: 30, sigmaMin: 60, Rfull: 300 };
  [[0, 1, 0, 0], [0, 1.1, 2, 0], [0.7, 1.5, 2, 3]].forEach(function (o) {
    var t = G.trajectory(o[0], o[1], o[2], o[3], { r0: 1e5 });
    [0.05, 0.3, 1.0].forEach(function (w) {
      var z1 = plungeZ(t, 2, 2, w), z2 = plungeZ(t, 2, 2, w, cautious);
      m5 = Math.max(m5, check('switch-on ' + o + ' w=' + w, Math.abs(c.abs(z1) / c.abs(z2) - 1), 1e-5));
    });
  });
  worst('5. smooth switch-on: default vs cautious choices', m5);
  var f = path.join(process.env.HOME, 'Documents/Projects/gbf_plunges/BHPlunges.jl/plunge_for_yi_et_al/data/LLz_0em4_l_2_to_6/l2_m2_rsc_500_wpc_25.dat');
  if (!fs.existsSync(f)) { console.log('   (no RWZ data on this machine)'); return; }
  var rwz = {}, mr = 0;
  fs.readFileSync(f, 'utf8').trim().split('\n').forEach(function (L) { var v = L.trim().split(/\s+/).map(Number); rwz[v[3].toFixed(3)] = v[4]; });
  [0.05, 0.1, 0.2, 0.3].forEach(function (w) {
    var dE = Math.pow(c.abs(plungeZ(tr, 2, 2, w)), 2) / (w * w);
    mr = Math.max(mr, check('vs RWZ w=' + w, Math.abs(dE / rwz[w.toFixed(3)] - 1), 1e-3));
  });
  worst('   radial infall, dE_22/domega vs RWZ, omega in [0.05, 0.3]', mr);
})();

console.log((fails ? fails + ' of ' : 'all ') + checks + ' checks ' + (fails ? 'FAILED' : 'passed'));
process.exit(fails ? 1 : 0);
