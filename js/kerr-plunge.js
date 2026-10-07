// Gravitational waves at infinity from a particle on a plunging Kerr
// geodesic: the Teukolsky amplitudes Z(l, m, omega), in the conventions of
// Drasco & Hughes (gr-qc/0509101; one correction, at A_nmb0 below), and the
// strain they make.
//
// Units G = c = M = mu = 1. With R_in the ingoing solution of unit
// transmission (KerrGSN) and R_in -> B_inc r^-1 e^{-i omega r_*} at infinity,
//   Z = -1/(2 i omega B_inc) Int dlambda e^{i(omega t - m phi)} I(lambda),
//   I = (A_nn0 + A_nmb0 + A_mbmb0) R - (A_nmb1 + A_mbmb1) R' + A_mbmb2 R'',
// the A's of D&H Appendix B, with their C's multiplied by dt/dlambda since we
// integrate in Mino time. Then psi_4 -> r^-1 sum Int domega Z S e^{-i omega u + i m phi},
// and as psi_4 = (1/2) d^2/dt^2 (h_+ - i h_x),
//   h_+ - i h_x = -(2/r) sum_{lm} Int domega Z/omega^2 S(theta) e^{-i omega u + i m phi},
// E = (1/2) Int_{-inf}^{inf} domega sum |Z|^2/omega^2.
(function (root) {
  'use strict';
  var G = root.KerrGeo || (typeof require !== 'undefined' && require('./kerr-geodesic.js'));
  var W = root.KerrGSN || (typeof require !== 'undefined' && require('./kerr-gsn.js'));
  var Q = root.KerrQNM || (typeof require !== 'undefined' && require('./kerr-qnm.js'));
  var c = W.c, add = c.add, sub = c.sub, mul = c.mul, div = c.div, scl = c.scl;
  var SQ2 = Math.SQRT2;

  // 8-point Gauss-Legendre on [0, 1]
  var GL = (function () {
    var x = [0.1834346424956498, 0.5255324099163290, 0.7966664774136267, 0.9602898564975363];
    var w = [0.3626837833783620, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763];
    var X = [], Wt = [];
    for (var i = 3; i >= 0; i--) { X.push((1 - x[i]) / 2); Wt.push(w[i] / 2); }
    for (i = 0; i < 4; i++) { X.push((1 + x[i]) / 2); Wt.push(w[i] / 2); }
    return { x: X, w: Wt };
  })();

  // the orbit at Mino time lam, with what the source needs
  function node(tr, lam) {
    var s = tr.at(lam), a = tr.a, d = tr.rp - tr.rm, x = s.r - tr.rp;
    var st = Math.sqrt(Math.max(1 - s.z * s.z, 1e-24));
    var rs = W.rstarX(a, x), A = s.r * s.r + a * a, Dl = x * (x + d);
    return {
      lam: lam, r: s.r, x: x, z: s.z, st: st, rs: rs,
      t: s.v - rs, phi: s.phit - G.rsharp(a, s.r),
      dr: s.dlam.r, dth: tr.zm * Math.sin(s.chi) * s.dlam.chi / st,
      // rates for the panel size: dt/dlambda, |dr_*/dlambda|, dphi/dlambda, dchi/dlambda
      dt: s.dlam.v - A / Dl * s.dlam.r, drs: Math.abs(A / Dl * s.dlam.r),
      dphi: s.dlam.phit - a / Dl * s.dlam.r, dchi: s.dlam.chi
    };
  }

  // Quadrature nodes along the orbit, good for |omega| <= wmax, |m| <= mmax:
  // panels are halved until the integrand's phase (omega t - m phi, the
  // radial waves e^{+-i omega r_*}, and the polar oscillation) turns by less
  // than PANEL radians across each. Near the horizon that phase winds like
  // log(r - r_+) while the integrand stays finite, so the panels shrink
  // geometrically there; the orbit is cut at r - r_+ = xcut (r_+ - r_-).
  // lam0: where the source starts (a large r for plunges "from infinity");
  // lamEnd: where it stops, if not at the horizon (bound orbits, in tests).
  var PANEL = 1.0;
  function grid(tr, opts) {
    opts = opts || {};
    var wmax = opts.wmax, mmax = opts.mmax || 4, d = tr.rp - tr.rm;
    var lam0 = opts.lam0 || 0, lamCut = opts.lamEnd;
    if (lamCut === undefined) lamCut = tr.lamAt(tr.rp + (opts.xcut || 1e-7) * d);
    if (lamCut === null) lamCut = tr.lamH;
    var rate = function (n) { return wmax * (n.dt + n.drs) + mmax * Math.abs(n.dphi) + 6 * Math.abs(n.dchi); };
    var nodes = [], weights = [], panels = 0;
    function panel(l0, l1, n0, n1, depth) {
      var lm = 0.5 * (l0 + l1), nm = node(tr, lm);
      var turn = Math.max(rate(n0), rate(n1), rate(nm)) * (l1 - l0);
      if (turn > PANEL && depth < 60) { panel(l0, lm, n0, nm, depth + 1); panel(lm, l1, nm, n1, depth + 1); return; }
      for (var i = 0; i < 8; i++) { nodes.push(node(tr, l0 + GL.x[i] * (l1 - l0))); weights.push(GL.w[i] * (l1 - l0)); }
      panels++;
    }
    // start from the integrator's own steps, so the orbit itself is resolved
    var L = tr.lam, cuts = [lam0];
    for (var i = 0; i < L.length; i++) if (L[i] > lam0 && L[i] < lamCut) cuts.push(L[i]);
    cuts.push(lamCut);
    var prev = node(tr, cuts[0]);
    for (i = 1; i < cuts.length; i++) {
      var nx = node(tr, cuts[i]);
      panel(cuts[i - 1], cuts[i], prev, nx, 0);
      prev = nx;
    }
    return { tr: tr, nodes: nodes, w: weights, panels: panels, wmax: wmax, mmax: mmax, lam0: lam0, lamCut: lamCut };
  }

  // S, dS/dtheta, d2S/dtheta2 at the nodes' theta. S(theta) is entire, so it
  // is tabulated once per mode at 48 Chebyshev nodes in theta over the orbit's
  // range (derivatives by central differences of the spectral sum there) and
  // interpolated; S is real for real omega.
  function angularAt(ang, m, zs) {
    var zmax = 0;
    zs.forEach(function (z) { zmax = Math.max(zmax, Math.abs(z)); });
    var lo = Math.acos(Math.min(zmax, 1)), hi = Math.PI - lo, N = 48;
    if (hi - lo < 1e-9) { lo = Math.PI / 2 - 1e-6; hi = Math.PI / 2 + 1e-6; N = 4; }
    var th = W.chebNodes(lo, hi, N), h = 1e-3, xs = [];
    th.forEach(function (t) { [-2, -1, 0, 1, 2].forEach(function (k) { xs.push(Math.cos(t + k * h)); }); });
    var S = Q.spheroidal(-2, m, ang, xs).re, v0 = [], v1 = [], v2 = [];
    for (var i = 0; i < N; i++) {
      var f = function (k) { return S[5 * i + 2 + k]; };
      v0.push([f(0), 0]);
      v1.push([(8 * (f(1) - f(-1)) - (f(2) - f(-2))) / (12 * h), 0]);
      v2.push([(-(f(2) + f(-2)) + 16 * (f(1) + f(-1)) - 30 * f(0)) / (12 * h * h), 0]);
    }
    var c0 = W.chebFit(v0), c1 = W.chebFit(v1), c2 = W.chebFit(v2), out = { S: [], S1: [], S2: [] };
    zs.forEach(function (z) {
      var t = Math.acos(z);
      out.S.push(W.chebEval(c0, lo, hi, t)[0]); out.S1.push(W.chebEval(c1, lo, hi, t)[0]); out.S2.push(W.chebEval(c2, lo, hi, t)[0]);
    });
    return out;
  }

  // I at one node, times dt/dlambda (D&H 3.29, 3.31, B4)
  function integrand(n, R, S0, S1, S2, a, m, w, E, L) {
    var r = n.r, ct = n.z, st = n.st, cot = ct / st, d = 1 + Math.sqrt(1 - a * a) - (1 - Math.sqrt(1 - a * a));
    var Dl = n.x * (n.x + d), Sg = r * r + a * a * ct * ct, K = (r * r + a * a) * w - m * a;
    var rho = div([-1, 0], [r, -a * ct]), rhb = [rho[0], -rho[1]];
    var rho3i = div([1, 0], mul(rho, mul(rho, rho)));           // rho^-3
    var Pn = E * (r * r + a * a) - a * L + n.dr;                   // real
    var Mb = [n.dth, (a * E - L / (st * st)) * st];                // i(aE - L/sin^2) sin + dtheta/dlambda
    var Cnn = Pn * Pn / (4 * Sg * Sg);
    var Cnm = scl(mul(rho, Mb), Pn / (2 * SQ2 * Sg));
    var Cmm = scl(mul(mul(rho, rho), mul(Mb, Mb)), 0.5);
    var L1 = -m / st + a * w * st + cot, L2 = -m / st + a * w * st + 2 * cot;
    var L2p = m * ct / (st * st) + a * w * ct - 2 / (st * st);
    var L2S = S1 + L2 * S0, L1L2S = S2 + L2p * S0 + L2 * S1 + L1 * L2S;
    var KD = K / Dl, dKD = (2 * r * w * Dl - K * (2 * r - 2)) / (Dl * Dl);
    var rpr = add(rho, rhb), rmr = sub(rho, rhb);                  // rho + rhob (real), rho - rhob (imaginary)
    // A_nn0 = -2 rho^-3 rhob^-1 C_nn/Delta^2 (L1L2S + 2 i a rho L2S sin)
    var Ann0 = mul(scl(div(rho3i, rhb), -2 * Cnn / (Dl * Dl)), add([L1L2S, 0], mul([0, 2 * a * st * L2S], rho)));
    // A_nmb0 = -2 sqrt2 rho^-3 C_nmb/Delta [(iK/D - rho - rhob) L2S + (iK/D) i a (rho - rhob) S sin].
    // D&H's (B4b) prints (iK/D + rho + rhob) in the second term; with it,
    // inclined orbits miss GeneralizedSasakiNakamura.jl by ~1e-3 (and its
    // weak polar harmonics by tens of per cent), while iK/D alone, as in
    // Hughes (2000), agrees to 3e-8 (tools/plunge/test-source.js). The term
    // vanishes on the equator and at a = 0, where both forms pass.
    var pre1 = scl(mul(rho3i, Cnm), -2 * SQ2 / Dl);
    var Anm0 = mul(pre1, add(scl(sub([0, KD], rpr), L2S), mul([0, KD], mul([0, a * st * S0], rmr))));
    // A_mbmb0 = S rho^-3 rhob C_mbmb [(K/D)^2 + 2 i rho K/D + i d_r(K/D)]
    var pre2 = mul(mul(rho3i, rhb), Cmm);
    var Amm0 = mul(scl(pre2, S0), add([KD * KD, dKD], mul([0, 2 * KD], rho)));
    // A_nmb1 = -2 sqrt2 rho^-3 C_nmb/Delta [L2S + i a (rho - rhob) S sin]
    var Anm1 = mul(pre1, add([L2S, 0], mul([0, a * st * S0], rmr)));
    // A_mbmb1 = 2 S rho^-3 rhob C_mbmb (rho - iK/D);  A_mbmb2 = -S rho^-3 rhob C_mbmb
    var Amm1 = mul(scl(pre2, 2 * S0), sub(rho, [0, KD]));
    var Amm2 = scl(pre2, -S0);
    return add(sub(mul(add(add(Ann0, Anm0), Amm0), R.R), mul(add(Anm1, Amm1), R.dR)), mul(Amm2, R.d2R));
  }

  // Z for one (l, m, omega) on a grid; rad = KerrGSN.radialIn(l, m, a, omega)
  // (made here if not given). opts.window(node) multiplies the source.
  function amplitude(gr, l, m, w, rad, opts) {
    opts = opts || {};
    var tr = gr.tr, a = tr.a, E = tr.E, L = tr.L, N = gr.nodes.length;
    rad = rad || W.radialIn(l, m, a, w);
    var ang, equatorial = tr.zm < 1e-12;
    if (equatorial) {
      var one = angularAt(rad.mode.ang, m, [0]);
      ang = { S: [one.S[0]], S1: [one.S1[0]], S2: [one.S2[0]] };
    } else ang = angularAt(rad.mode.ang, m, gr.nodes.map(function (n) { return n.z; }));
    var sum = [0, 0];
    for (var i = 0; i < N; i++) {
      var n = gr.nodes[i], j = equatorial ? 0 : i;
      var R = rad.R(n.r, n.x);
      var I = integrand(n, R, ang.S[j], ang.S1[j], ang.S2[j], a, m, w, E, L);
      var ph = w * n.t - m * n.phi, f = gr.w[i] * (opts.window ? opts.window(n) : 1);
      sum = add(sum, scl(mul(I, [Math.cos(ph), Math.sin(ph)]), f));
    }
    return { Z: div(scl(sum, -1), mul([0, 2 * w], rad.Binc)), rad: rad };
  }

  // Plunges "from infinity" start at a finite radius, but the Teukolsky
  // integrand grows along an infalling orbit (the part of R_in ~ B_ref r^3),
  // so cutting it off sharply leaves a boundary term ~ r0 that swamps the
  // signal (tools/plunge/test-source.js, check 4). The source is switched on
  // smoothly instead, W(r) = (1 - tanh((r - rc)/sigma))/2, which is analytic,
  // so the boundary term falls exponentially, ~ e^{-pi S/2}, if sigma = S/(kappa omega)
  // with kappa the slowest phase rate of the integrand per unit r: that of the
  // growing part, e^{i omega (t + r_*)}, |d(t + r_*)/dr| (-> E/sqrt(E^2-1) - 1 at
  // infinity, -> sqrt(r/2) for E = 1). The source is untouched inside
  // rc - 12 sigma, which is put at R_FULL; the orbit starts at rc + 12 sigma.
  // (As E -> infinity, kappa -> 0 and no switch-on can work: the growing part
  // stops oscillating.)
  // choices, tuned in tools/plunge/test-source.js: S = 16 (e^{-pi S/2} ~ 1e-11),
  // sigma >= 20 M, source untouched inside r = 150 M. Against S = 30,
  // sigma >= 60 M, r = 300 M: 2e-6 for omega <= 1 at E in [1, 1.5].
  var SWITCH = { S: 16, Rfull: 150, sigmaMin: 20 };
  function switchOn(rc, sigma) { return function (n) { return 0.5 * (1 - Math.tanh((n.r - rc) / sigma)); }; }
  // kappa at radius r along this orbit
  function kappa(tr, r) {
    var n = node(tr, tr.lamAt(r) || 0);
    return Math.abs(n.dt - n.drs) / Math.max(Math.abs(n.dr), 1e-300);
  }
  // { rc, sigma, rStart, window } for frequency omega on this orbit
  function switchFor(tr, w, opts) {
    opts = opts || {};
    var S = opts.S || SWITCH.S, Rfull = opts.Rfull || SWITCH.Rfull, sigma = 1, rc = Rfull;
    for (var it = 0; it < 6; it++) {   // kappa depends (weakly) on where the switch sits
      var k = kappa(tr, Math.min(rc, tr.r0 * 0.999));
      sigma = Math.max(S / (Math.max(k, 1e-3) * Math.abs(w)), opts.sigmaMin || SWITCH.sigmaMin);
      rc = Rfull + 12 * sigma;
    }
    return { rc: rc, sigma: sigma, rStart: rc + 12 * sigma, window: switchOn(rc, sigma) };
  }

  function smoothStep(s) {   // C-infinity step on [0, 1], for switching on in time
    if (s <= 0) return 0;
    if (s >= 1) return 1;
    var e0 = Math.exp(-1 / s), e1 = Math.exp(-1 / (1 - s));
    return e0 / (e0 + e1);
  }

  var api = { GL: GL, node: node, grid: grid, angularAt: angularAt, integrand: integrand, amplitude: amplitude,
              smoothStep: smoothStep, switchOn: switchOn, switchFor: switchFor, kappa: kappa, SWITCH: SWITCH };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KerrPlunge = api;
})(this);
