// Tests for js/kerr-gsn.js.   node tools/plunge/test-gsn.js
// Reference values: tools/plunge/make-reference.jl (GeneralizedSasakiNakamura.jl).
'use strict';
var path = require('path'), fs = require('fs');
var G = require(path.join(__dirname, '../../js/kerr-gsn.js'));
var c = G.c;
var refFile = path.join(__dirname, 'reference-gsn.json');
var ref = fs.existsSync(refFile) ? require(refFile) : null;

var fails = 0, checks = 0;
function check(name, err, tol) {
  checks++;
  if (!(err <= tol)) { fails++; console.log('FAIL  ' + name + '  err=' + (+err).toExponential(2) + '  tol=' + tol); }
  return err;
}
function worst(label, v) { console.log(label.padEnd(64) + (+v).toExponential(2)); }
function rel(x, y) { return c.abs(c.sub(x, y)) / Math.max(c.abs(y), 1e-300); }

var modes = [[2, 2, 0.7, 0.5], [2, -2, 0.99, 1.3], [3, 1, 0.3, 0.1], [2, 0, 0, 0.8], [4, 4, 0.9, 2.0]];
var sols = modes.map(function (p) { return G.radialIn(p[0], p[1], p[2], p[3]); });

// 1. The generated potentials make both expansions consistent: at the horizon
//    the indicial exponent 0 needs Q_0 = 0, at infinity q must be O(z^2).
(function () {
  var mx = 0;
  sols.forEach(function (R, i) {
    mx = Math.max(mx, check('Q0 ' + modes[i], c.abs(R.series.hor.Q0), 1e-12),
                  check('Teukolsky Q0 ' + modes[i], c.abs(R.series.teukHor.Q0), 1e-12),
                  check('Teukolsky b01 ' + modes[i], Math.max(R.series.teukOut.b01, R.series.teukIn.b01), 1e-12),
                  check('q01 ' + modes[i], Math.max(R.series.outInf.q01, R.series.inInf.q01), 1e-12));
  });
  worst('1. Frobenius/asymptotic consistency (GSN and Teukolsky, both ends)', mx);
})();

// 2. The Teukolsky equation itself: dR/dr from M21, M22 against a finite
//    difference of R from M11, M12, and d2R/dr2 from the equation against a
//    finite difference of dR/dr. Tests the generated matrix M.
(function () {
  var m1 = 0, m2 = 0;
  sols.forEach(function (R, i) {
    [R.mode.rp + 0.05, 2.5, 4, 8, 20, 60].forEach(function (r) {
      var h = 1e-3 * Math.min(r - R.mode.rp, 1);
      var p1 = R.R(r + h), m_1 = R.R(r - h), p2 = R.R(r + 2 * h), m_2 = R.R(r - 2 * h), o = R.R(r);
      var fd = function (k) { return c.scl(c.sub(c.scl(c.sub(p1[k], m_1[k]), 8), c.sub(p2[k], m_2[k])), 1 / (12 * h)); };
      m1 = Math.max(m1, check('dR ' + modes[i] + ' r=' + r, rel(fd('R'), o.dR), 1e-6));
      m2 = Math.max(m2, check('d2R ' + modes[i] + ' r=' + r, rel(fd('dR'), o.d2R), 1e-6));
    });
  });
  worst('2. dR/dr vs finite difference of R', m1);
  worst('   d2R/dr2 (Teukolsky equation) vs finite difference of dR/dr', m2);
})();

// 3. Near the horizon R_in comes from its own Frobenius series (R = M (X, X')
//    cancels there). The two must agree where both work, just inside the
//    switch-over, and the series must have the unit-transmission limit.
(function () {
  var mx = 0, mh = 0;
  sols.forEach(function (R, i) {
    var md = R.mode, xm = R.series.teukHor.xmax;
    [0.6, 0.8, 0.99].forEach(function (f) {
      var a1 = R.R(null, f * xm), b1 = R.R(null, f * xm, 'gsn');
      // 1e-6: at high spin r_+ - r_- is small and the M route loses digits here
      mx = Math.max(mx, check('series vs M ' + modes[i] + ' x=' + f + 'xmax', Math.max(rel(a1.R, b1.R), rel(a1.dR, b1.dR)), 1e-6));
    });
    var x = 1e-9, Dl = x * (x + md.rp - md.rm);
    var ref = c.scl(c.exp([0, -md.p * G.rstarX(md.a, x)]), Dl * Dl);
    mh = Math.max(mh, check('horizon ' + modes[i], rel(R.R(null, x).R, ref), 1e-8));
  });
  worst('3. near-horizon series vs R = M (X, X\'), x in (0.6, 1) x_switch', mx);
  worst('   R_in / (Delta^2 e^{-ipr*}) - 1 at r = r_+ + 1e-9', mh);
})();

// B_ref can be 1e-10 of B_inc at high frequency (the barrier hardly
// reflects), and no double-precision solution carries it to better than
// ~1e-12 of B_inc: GSN.jl at its default tolerance is a few per cent off
// there. So B_ref is judged relative to max(|B_ref|, 1e-5 |B_inc|) -- with
// the 1e-6 tolerances below, known to 1e-11 of the incident wave -- and
// R_in at r, where B_ref r^3 dominates, relative to max(|R|, 1e-5 |B_inc| r^3).
function relB(x, y, Binc) { return c.abs(c.sub(x, y)) / Math.max(c.abs(y), 1e-5 * c.abs(Binc)); }

// 3b. Beyond rs_out R_in comes from Teukolsky's own asymptotic series with
//     B_inc, B_ref: it must continue R = M (X, X') across rs_out.
(function () {
  var mx = 0;
  sols.forEach(function (R, i) {
    [0.7, 0.9, 1.1, 1.5].forEach(function (f) {
      var r = R.rout * f, A = R.R(r), B = R.R(r, undefined, 'gsn');
      var sc = Math.max(c.abs(B.R), 1e-5 * c.abs(R.Binc) * r * r * r);
      mx = Math.max(mx, check('far series vs M ' + modes[i] + ' r=' + f + 'rout', c.abs(c.sub(A.R, B.R)) / sc, 1e-7));
    });
  });
  worst('3b. far-field series vs R = M (X, X\'), r in (0.7, 1.5) r_out', mx);
})();

// 4. Matching radii are a choice: moving them (here to r_* in [-50, 400],
//    with the package's ODE tolerance and other series lengths) must not
//    move B_inc, B_ref.
(function () {
  var mx = 0;
  modes.forEach(function (p, i) {
    var R2 = G.radialIn(p[0], p[1], p[2], p[3], { rsin: -50, rsout: 400, horOrder: 6, infOrder: 16, rtol: 1e-12 });
    mx = Math.max(mx, check('Binc vs radii ' + p, rel(R2.Binc, sols[i].Binc), 1e-8),
                  check('Bref vs radii ' + p, relB(R2.Bref, sols[i].Bref, sols[i].Binc), 1e-6));
  });
  worst('4. B_inc, B_ref: default matching radii vs r_* in [-50, 400]', mx);
})();

// 5. Against GeneralizedSasakiNakamura.jl.
if (ref) {
  var ml = 0, mb = 0, mr = 0, n = 0;
  ref.modes.forEach(function (e) {
    var tag = 'l=' + e.l + ' m=' + e.m + ' a=' + e.a + ' w=' + e.omega;
    var R = G.radialIn(e.l, e.m, e.a, e.omega);
    ml = Math.max(ml, check('lambda ' + tag, Math.abs(R.mode.lambda[0] - e.lambda) / (1 + Math.abs(e.lambda)), 1e-10));
    mb = Math.max(mb, check('Binc ' + tag, rel(R.Binc, e.Binc), 1e-8), check('Bref ' + tag, relB(R.Bref, e.Bref, e.Binc), 1e-6));
    e.r.forEach(function (r, k) {
      var o = R.R(r), r3 = r * r * r;
      var relR = function (x, y) { return c.abs(c.sub(x, y)) / Math.max(c.abs(y), 1e-5 * c.abs(e.Binc) * r3); };
      mr = Math.max(mr, check('R ' + tag + ' r=' + r, relR(o.R, e.R[k]), 1e-6), check('dR ' + tag + ' r=' + r, relR(o.dR, e.dR[k]), 1e-6));
    });
    n++;
  });
  worst('5. vs GSN.jl, ' + n + ' modes: lambda', ml);
  worst('   B_inc, and B_ref to max(|B_ref|, 1e-5 |B_inc|)', mb);
  worst('   R_in, dR_in/dr at 8 radii, to max(|R|, 1e-5 |B_inc| r^3)', mr);
} else console.log('5. (no reference-gsn.json: run julia tools/plunge/make-reference.jl)');

// 6. timing
(function () {
  var t0 = Date.now();
  for (var w = 0.05; w < 2; w += 0.05) G.radialIn(2, 2, 0.7, w);
  console.log('6. radialIn, defaults: ' + ((Date.now() - t0) / 39).toFixed(1) + ' ms per mode');
})();

console.log((fails ? fails + ' of ' : 'all ') + checks + ' checks ' + (fails ? 'FAILED' : 'passed'));
process.exit(fails ? 1 : 0);
