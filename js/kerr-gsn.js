// Homogeneous solutions of the s = -2 Teukolsky radial equation for real
// frequency, through the generalised Sasaki-Nakamura (GSN) equation
// (R. K. L. Lo, 2306.16469, as in GeneralizedSasakiNakamura.jl).
//
// Units G = c = M = 1. The GSN function X(r_*) obeys
//   X'' - F X' - U X = 0,      ' = d/dr_*,
// with F and U short-ranged, so X is a pair of plane waves at both ends:
//   X_in -> e^{-i p r_*}                          (horizon, p = omega - m Omega_H)
//   X_in -> B_ref e^{i omega r_*} + B_inc e^{-i omega r_*}   (infinity).
// F, U, the matrix M taking (X, X') to the Teukolsky (R, dR/dr), and the
// amplitude conversion factors are generated data (js/kerr-gsn-data.js).
// The asymptotic series at both ends are derived here from F and U alone:
// with X = e^{i sigma k r_*} f and g = dr_*/dr^-1 = Delta/(r^2 + a^2),
//   f_rr + p(r) f_r + q(r) f = 0,
//   p = (2 i sigma k + g_r - F)/g,   q = (-k^2 - i sigma k F - U)/g^2,
// solved as a Frobenius series in x = r - r_+ at the horizon (k = p) and
// as an asymptotic series in z = 1/r at infinity (k = omega).
//
// R_in is normalised to unit Teukolsky transmission, R_in -> Delta^2 e^{-i p r_*},
// and at infinity R_in -> B_inc r^{-1} e^{-i omega r_*} + B_ref r^3 e^{i omega r_*}.
(function (root) {
  'use strict';
  var D = root.KerrGSNData || (typeof require !== 'undefined' && require('./kerr-gsn-data.js'));
  var Q = root.KerrQNM || (typeof require !== 'undefined' && require('./kerr-qnm.js'));
  var S_SPIN = -2;

  // ---- complex numbers as [re, im] ---------------------------------------

  function add(x, y) { return [x[0] + y[0], x[1] + y[1]]; }
  function sub(x, y) { return [x[0] - y[0], x[1] - y[1]]; }
  function mul(x, y) { return [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]; }
  function scl(x, k) { return [x[0] * k, x[1] * k]; }
  function div(x, y) {
    var d = y[0] * y[0] + y[1] * y[1];
    return [(x[0] * y[0] + x[1] * y[1]) / d, (x[1] * y[0] - x[0] * y[1]) / d];
  }
  function cexp(x) { var e = Math.exp(x[0]); return [e * Math.cos(x[1]), e * Math.sin(x[1])]; }
  function abs(x) { return Math.hypot(x[0], x[1]); }
  var I = [0, 1];

  // ---- the generated rational functions ----------------------------------

  // coefficient lists of monomials [re, im, e_a, e_m, e_w, e_lam, e_q, e_rp]
  // -> Float64Arrays of re, im per power of r
  function coeffs(list, P) {
    var n = list.length, re = new Float64Array(n), im = new Float64Array(n);
    for (var j = 0; j < n; j++) {
      var cr = 0, ci = 0;
      list[j].forEach(function (t) {
        var real = Math.pow(P.a, t[2]) * Math.pow(P.m, t[3]) * Math.pow(P.q, t[6]) * Math.pow(P.rp, t[7]);
        var z = mul(P.wp[t[4]], P.lp[t[5]]);
        cr += real * (t[0] * z[0] - t[1] * z[1]);
        ci += real * (t[0] * z[1] + t[1] * z[0]);
      });
      re[j] = cr; im[j] = ci;
    }
    return { re: re, im: im };
  }
  function rational(name, P) {
    var d = D[name];
    return { k: d.k, num: coeffs(d.num, P), den: coeffs(d.den, P) };
  }
  // complex polynomial at real r, Horner
  function horner(c, r) {
    var re = 0, im = 0;
    for (var j = c.re.length - 1; j >= 0; j--) { re = re * r + c.re[j]; im = im * r + c.im[j]; }
    return [re, im];
  }
  function evalRat(f, r, a) {
    var v = div(horner(f.num, r), horner(f.den, r));
    return f.k ? scl(v, Math.pow(Math.sqrt(r * r + a * a), f.k)) : v;
  }

  // ---- truncated power series (arrays of [re, im]) -----------------------

  function sZero(K) { var s = []; for (var i = 0; i < K; i++) s.push([0, 0]); return s; }
  function sAdd(x, y) { return x.map(function (v, i) { return add(v, y[i]); }); }
  function sScl(x, c) { return x.map(function (v) { return mul(v, c); }); }
  function sMul(x, y) {
    var K = x.length, o = sZero(K);
    for (var i = 0; i < K; i++) for (var j = 0; i + j < K; j++) o[i + j] = add(o[i + j], mul(x[i], y[j]));
    return o;
  }
  function sDiv(x, y) {
    var K = x.length, o = sZero(K);
    for (var i = 0; i < K; i++) {
      var t = x[i];
      for (var j = 1; j <= i; j++) t = sub(t, mul(y[j], o[i - j]));
      o[i] = div(t, y[0]);
    }
    return o;
  }
  function sDer(x) {
    var o = x.slice(1).map(function (v, i) { return scl(v, i + 1); });
    o.push([0, 0]);
    return o;
  }
  function sConst(c, K) { var s = sZero(K); s[0] = c; return s; }
  function sReal(arr, K) { var s = sZero(K); arr.forEach(function (v, i) { if (i < K) s[i] = [v, 0]; }); return s; }

  // polynomial c (re/im arrays in r) as a series in x = r - r0 (Taylor shift)
  function shiftSeries(c, r0, K) {
    var n = c.re.length, re = Array.from(c.re), im = Array.from(c.im), o = sZero(K);
    for (var k = 0; k < n; k++) {
      // synthetic division by (r - r0): the remainder is the k-th coefficient
      for (var j = n - 2; j >= k; j--) { re[j] += r0 * re[j + 1]; im[j] += r0 * im[j + 1]; }
      if (k < K) o[k] = [re[k], im[k]];
    }
    return o;
  }
  // polynomial c in r as a series in z = 1/r, times z^shift
  function invSeries(c, shift, K) {
    var n = c.re.length, o = sZero(K);
    for (var j = 0; j < n; j++) {
      var i = shift + (n - 1 - j);
      if (i >= 0 && i < K) o[i] = [c.re[j], c.im[j]];
    }
    return o;
  }

  // ---- Chebyshev interpolation (complex values on [lo, hi]) --------------

  function chebNodes(lo, hi, N) {
    var x = [];
    for (var j = 0; j < N; j++) x.push(0.5 * (lo + hi) + 0.5 * (hi - lo) * Math.cos(Math.PI * (j + 0.5) / N));
    return x;
  }
  // coefficients from values (arrays of [re, im]) at chebNodes
  function chebFit(vals) {
    var N = vals.length, c = [];
    for (var k = 0; k < N; k++) {
      var re = 0, im = 0;
      for (var j = 0; j < N; j++) {
        var t = Math.cos(Math.PI * k * (j + 0.5) / N);
        re += vals[j][0] * t; im += vals[j][1] * t;
      }
      c.push([re * 2 / N, im * 2 / N]);
    }
    c[0] = scl(c[0], 0.5);
    return c;
  }
  function chebEval(c, lo, hi, x) {
    var u = (2 * x - lo - hi) / (hi - lo), b1r = 0, b1i = 0, b2r = 0, b2i = 0;
    for (var k = c.length - 1; k >= 1; k--) {
      var tr = 2 * u * b1r - b2r + c[k][0], ti = 2 * u * b1i - b2i + c[k][1];
      b2r = b1r; b2i = b1i; b1r = tr; b1i = ti;
    }
    return [u * b1r - b2r + c[0][0], u * b1i - b2i + c[0][1]];
  }

  // ---- the mode ----------------------------------------------------------

  function horizons(a) { var s = Math.sqrt(1 - a * a); return { rp: 1 + s, rm: 1 - s, q: s }; }

  function rstar(a, r) { return rstarX(a, r - horizons(a).rp); }
  // the same from x = r - r_+
  function rstarX(a, x) {
    var h = horizons(a), d = h.rp - h.rm;
    return h.rp + x + 2 * h.rp / d * Math.log(x / 2) - 2 * h.rm / d * Math.log((x + d) / 2);
  }
  // inverse of rstar: x = r - r_+ (kept separately so that it does not
  // lose its digits against r_+ near the horizon)
  function xFromRstar(a, rs) {
    var h = horizons(a), u, i;
    if (rs <= 2) {
      // Newton on u = log(r - r_+)
      u = Math.min(0, (rs - h.rp) * (h.rp - h.rm) / (2 * h.rp));
      for (i = 0; i < 100; i++) {
        var x = Math.exp(u), r = h.rp + x;
        var du = -(rstarX(a, x) - rs) / ((r * r + a * a) / (r - h.rm));
        u += Math.max(-5, Math.min(5, du));
        if (Math.abs(du) < 1e-15) break;
      }
      return Math.exp(u);
    }
    var rr = rs;
    for (i = 0; i < 100; i++) {
      var dr = -(rstar(a, rr) - rs) * ((rr - h.rp) * (rr - h.rm)) / (rr * rr + a * a);
      rr = Math.max(rr + dr, h.rp + 1e-12);
      if (Math.abs(dr) < 1e-14 * rr) break;
    }
    return rr - h.rp;
  }
  function rFromRstar(a, rs) { return horizons(a).rp + xFromRstar(a, rs); }

  // The spheroidal harmonic for real c = a omega (KerrQNM's spectral
  // solve, continued in c from Schwarzschild so that the right eigenvalue is
  // followed) and Teukolsky's lambda = A + c^2 - 2 m c
  function angularSolve(l, m, c) {
    var A = [l * (l + 1) - S_SPIN * (S_SPIN + 1), 0], n = Math.max(1, Math.ceil(Math.abs(c) / 0.25)), ang;
    for (var i = 1; i <= n; i++) { ang = Q.angular(S_SPIN, l, m, [c * i / n, 0], A); A = ang.A; }
    return { ang: ang, lambda: [A[0] + c * c - 2 * m * c, A[1]] };
  }
  function eigenvalue(l, m, c) { return angularSolve(l, m, c).lambda; }

  function setup(l, m, a, omega, opts) {
    var h = horizons(a), as = angularSolve(l, m, a * omega);
    var lambda = opts.lambda !== undefined ? [opts.lambda, 0] : as.lambda;
    var w = [omega, 0], wp = [[1, 0]], lp = [[1, 0]];
    for (var i = 1; i <= 12; i++) { wp.push(mul(wp[i - 1], w)); lp.push(mul(lp[i - 1], lambda)); }
    var P = { a: a, m: m, q: h.q, rp: h.rp, wp: wp, lp: lp };
    var md = { s: S_SPIN, l: l, m: m, a: a, omega: omega, lambda: lambda, ang: as.ang, rp: h.rp, rm: h.rm,
               p: omega - m * a / (2 * h.rp) };
    ['F', 'U', 'M11', 'M12', 'M21', 'M22', 'eta', 'Btrans', 'Binc', 'Ctrans'].forEach(function (k) { md[k] = rational(k, P); });
    return md;
  }

  // ---- asymptotic series --------------------------------------------------

  // horizon: X = e^{i sigma p r_*} f(x), f = sum c_n x^n, c_0 = 1
  function horizonSeries(md, sigma, N) {
    var K = N + 1, a = md.a, rp = md.rp, rm = md.rm, k = [sigma * md.p, 0];
    var F = sDiv(shiftSeries(md.F.num, rp, K), shiftSeries(md.F.den, rp, K));
    var U = sDiv(shiftSeries(md.U.num, rp, K), shiftSeries(md.U.den, rp, K));
    // h = g/x = (x + r_+ - r_-)/((r_+ + x)^2 + a^2);  g = x h,  g_r = h + x h'
    var h = sDiv(sReal([rp - rm, 1], K), sReal([rp * rp + a * a, 2 * rp, 1], K));
    var xh1 = sDer(h); xh1.unshift([0, 0]); xh1.pop();
    var gr = sAdd(h, xh1);
    var Pm = sDiv(sAdd(sAdd(sConst(mul([0, 2], k), K), gr), sScl(F, [-1, 0])), h);
    var Qm = sDiv(sAdd(sAdd(sConst(scl(mul(k, k), -1), K), sScl(F, scl(mul(I, k), -1))), sScl(U, [-1, 0])), sMul(h, h));
    var c = [[1, 0]];
    for (var n = 1; n <= N; n++) {
      var t = [0, 0];
      for (var j = 0; j < n; j++) t = add(t, mul(c[j], add(scl(Pm[n - j], j), Qm[n - j])));
      c.push(div(scl(t, -1), add([n * (n - 1), 0], add(scl(Pm[0], n), Qm[0]))));
    }
    return { sigma: sigma, k: k, c: c, Q0: Qm[0] };
  }

  // infinity: X = e^{i sigma omega r_*} f(z), f = sum c_n z^n, c_0 = 1
  function infinitySeries(md, sigma, N) {
    var K = N + 3, a = md.a, k = [sigma * md.omega, 0];
    var nF = md.F.num.re.length - 1, dF = md.F.den.re.length - 1;
    var nU = md.U.num.re.length - 1, dU = md.U.den.re.length - 1;
    var F = sDiv(invSeries(md.F.num, dF - nF, K), invSeries(md.F.den, 0, K));
    var U = sDiv(invSeries(md.U.num, dU - nU, K), invSeries(md.U.den, 0, K));
    var g = sDiv(sReal([1, -2, a * a], K), sReal([1, 0, a * a], K));
    var gr = sDer(g); gr.unshift([0, 0], [0, 0]); gr.length = K; gr = sScl(gr, [-1, 0]);   // -z^2 dg/dz
    var p = sDiv(sAdd(sAdd(sConst(mul([0, 2], k), K), gr), sScl(F, [-1, 0])), g);
    var q = sDiv(sAdd(sAdd(sConst(scl(mul(k, k), -1), K), sScl(F, scl(mul(I, k), -1))), sScl(U, [-1, 0])), sMul(g, g));
    return { sigma: sigma, k: k, c: zRecursion(p, q, N), q01: Math.max(abs(q[0]), abs(q[1])) };
  }

  // f = sum c_n z^n, c_0 = 1, solving z^2 f_zz + (2z - p) f_z + (q/z^2) f = 0
  // (p, q series in z, q = O(z^2)): the form both the GSN equation and the
  // Teukolsky equation take at infinity once the plane wave is factored out
  function zRecursion(p, q, N) {
    var Qz = q.slice(2), c = [[1, 0]];
    for (var n = 0; n < N; n++) {
      var t = scl(c[n], n * (n + 1));
      for (var j = 1; j <= n; j++) t = sub(t, scl(mul(p[j], c[n + 1 - j]), n + 1 - j));
      for (j = 0; j <= n; j++) t = add(t, mul(Qz[j], c[n - j]));
      c.push(div(t, scl(p[0], n + 1)));
    }
    return c;
  }

  // The Teukolsky R itself at infinity: R = r^pw e^{i sigma omega r_*} h(z),
  // pw = -1 (ingoing), 3 (outgoing). With L = (r^pw e^{i sigma omega r_*})'/(...)
  // and R'' + P R' + Q_T R = 0, h_rr + A h_r + B h = 0 with A = 2L + P,
  // B = L' + L^2 + P L + Q_T, all series in z = 1/r with D = 1 - 2z + a^2 z^2:
  //   L = pw z + i sigma omega (1 + a^2 z^2)/D,   P = 2(s+1)(z - z^2)/D,
  //   Q_T = -[lambda z^2 - 4 i s omega z - k^2/D + 2 i s (1 - z) k z/D]/D,
  //   k = omega (1 + a^2 z^2) - m a z^2   (K = r^2 k).
  // Used beyond rs_out, where R = M (X, X') would cancel ever more as r grows.
  function teukInfinitySeries(md, sigma, pw, N) {
    var K = N + 3, a = md.a, s = S_SPIN, w = md.omega;
    var D = sReal([1, -2, a * a], K), G = sDiv(sReal([1, 0, a * a], K), D);
    var L = sAdd(sReal([0, pw], K), sScl(G, [0, sigma * w]));
    var P = sDiv(sReal([0, 2 * (s + 1), -2 * (s + 1)], K), D);
    var kz = sReal([w, 0, w * a * a - md.m * a], K);
    var lin = sZero(K); lin[1] = [0, -4 * s * w];                                  // -4 i s omega z
    var inner = sAdd(sAdd(sAdd(sScl(sReal([0, 0, 1], K), md.lambda), lin),               // lambda z^2
                          sScl(sDiv(sMul(kz, kz), D), [-1, 0])),                         // - k^2/D
                     sDiv(sScl(sMul(sMul(sReal([1, -1], K), kz), sReal([0, 1], K)), [0, 2 * s]), D));   // + 2is(1-z)kz/D
    var QT = sScl(sDiv(inner, D), [-1, 0]);
    var dL = sDer(L); dL.unshift([0, 0], [0, 0]); dL.length = K; dL = sScl(dL, [-1, 0]);   // L' = -z^2 dL/dz
    var A = sAdd(sScl(L, [2, 0]), P), B = sAdd(sAdd(sAdd(dL, sMul(L, L)), sMul(P, L)), QT);
    return { sigma: sigma, pw: pw, c: zRecursion(A, B, N), b01: Math.max(abs(B[0]), abs(B[1])) };
  }
  // r^pw e^{i sigma omega r_*} h and its r-derivative, at r (r_* = rs)
  function teukInfinityR(md, ser, r, rs) {
    var z = 1 / r, a = md.a, n = ser.c.length, h = [0, 0], dh = [0, 0], sw = ser.sigma * md.omega;
    for (var j = n - 1; j >= 0; j--) { dh = add(scl(dh, z), scl(ser.c[j], j)); h = add(scl(h, z), ser.c[j]); }
    dh = scl(dh, 1 / z);                                    // dh/dz
    var Dl = r * r - 2 * r + a * a;
    var L = add([ser.pw / r, 0], [0, sw * (r * r + a * a) / Dl]);
    var pre = scl(cexp([0, sw * rs]), Math.pow(r, ser.pw));
    return { R: mul(pre, h), dR: mul(pre, add(mul(L, h), scl(dh, -z * z))) };
  }

  // The Teukolsky R_in itself near the horizon, where R = M (X, X') cancels
  // (R ~ Delta^2 while M grows like inverse powers of Delta):
  //   R = e^{-i p r_*} Delta^2 h(x),  h = sum d_n x^n,  d_0 = 1,
  // the unit-transmission normalisation. With L = phi'/phi for the
  // prefactor phi and the equation R'' + P_T R' + Q_T R = 0,
  //   h'' + (2L + P_T) h' + (L' + L^2 + P_T L + Q_T) h = 0,
  // a Frobenius series converging out to x = r_+ - r_- (the inner horizon).
  function teukHorizonSeries(md, N) {
    var K = N + 1, a = md.a, s = S_SPIN, w = md.omega, rp = md.rp, d = md.rp - md.rm, ip = [0, md.p];
    var xpd = sReal([d, 1], K), A = sReal([rp * rp + a * a, 2 * rp, 1], K), Dp = sReal([2 * (rp - 1), 2], K);
    var Kk = sReal([(rp * rp + a * a) * w - md.m * a, 2 * rp * w, w], K), rx = sReal([0, rp, 1], K);
    var xL = sDiv(sAdd(sScl(A, scl(ip, -1)), sScl(Dp, [-s, 0])), xpd);
    var xPT = sDiv(sScl(Dp, [s + 1, 0]), xpd);
    var xs = sReal([0, 1], K);
    var xVT = sAdd(sAdd(sScl(xs, md.lambda), sScl(rx, [0, -4 * s * w])),
                   sScl(sDiv(sAdd(sMul(Kk, Kk), sScl(sMul(sReal([rp - 1, 1], K), Kk), [0, -2 * s])), xpd), [-1, 0]));
    var x2QT = sScl(sDiv(xVT, xpd), [-1, 0]);
    var dxL = sDer(xL); dxL.unshift([0, 0]); dxL.pop();     // x (xL)'
    var Pf = sAdd(sScl(xL, [2, 0]), xPT);
    var Qf = sAdd(sAdd(sAdd(sAdd(dxL, sScl(xL, [-1, 0])), sMul(xL, xL)), sMul(xPT, xL)), x2QT);
    var c = [[1, 0]];
    for (var n = 1; n <= N; n++) {
      var t = [0, 0];
      for (var j = 0; j < n; j++) t = add(t, mul(c[j], add(scl(Pf[n - j], j), Qf[n - j])));
      c.push(div(scl(t, -1), add([n * (n - 1), 0], add(scl(Pf[0], n), Qf[0]))));
    }
    return { c: c, Q0: Qf[0], xmax: 0.5 * d };   // halfway to r_-: terms fall like 2^-n
  }
  // R, dR/dr from that series at x
  function teukHorizonR(md, ser, x) {
    var a = md.a, r = md.rp + x, d = md.rp - md.rm, Dl = x * (x + d), h = [0, 0], dh = [0, 0];
    for (var j = ser.c.length - 1; j >= 0; j--) { dh = add(scl(dh, x), scl(ser.c[j], j)); h = add(scl(h, x), ser.c[j]); }
    dh = scl(dh, 1 / x);
    var xL = div(sub(scl([0, md.p], -(r * r + a * a)), [S_SPIN * 2 * (r - 1), 0]), [x + d, 0]);
    var pre = scl(cexp([0, -md.p * rstarX(a, x)]), Dl * Dl);
    return { R: mul(pre, h), dR: mul(pre, add(scl(mul(xL, h), 1 / x), dh)) };
  }

  // X and dX/dr_* from a series at x = r - r_+ (r_* = rs)
  function seriesX(md, ser, x, rs, where) {
    var a = md.a, n = ser.c.length, f = [0, 0], df = [0, 0], r = md.rp + x;
    var g = x * (x + md.rp - md.rm) / (r * r + a * a);
    var v = where === 'hor' ? x : 1 / r, fr;
    for (var j = n - 1; j >= 0; j--) { df = add(mul(df, [v, 0]), scl(ser.c[j], j)); f = add(mul(f, [v, 0]), ser.c[j]); }
    // df holds sum j c_j v^j; divide by v for d/dv
    df = v !== 0 ? scl(df, 1 / v) : ser.c[1] || [0, 0];
    fr = where === 'hor' ? df : scl(df, -v * v);           // d/dr
    var e = cexp(mul(I, scl(ser.k, rs)));
    var X = mul(e, f), dX = mul(e, add(mul(mul(I, ser.k), f), scl(fr, g)));
    return [X, dX];
  }

  // ---- integration in r_* -------------------------------------------------

  var DP = {
    a: [[], [1 / 5], [3 / 40, 9 / 40], [44 / 45, -56 / 15, 32 / 9],
        [19372 / 6561, -25360 / 2187, 64448 / 6561, -212 / 729],
        [9017 / 3168, -355 / 33, 46732 / 5247, 49 / 176, -5103 / 18656],
        [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84]],
    e: [71 / 57600, 0, -71 / 16695, 71 / 1920, -17253 / 339200, 22 / 525, -1 / 40],
    d: [-12715105075 / 11282082432, 0, 87487479700 / 32700410799, -10690763975 / 1880347072,
        701980252875 / 199316789632, -1453857185 / 822651844, 69997945 / 29380423]
  };

  // y = [u, Re X, Im X, Re X', Im X'] with u = log(r - r_+), which keeps
  // r - r_+ to full relative accuracy near the horizon (carrying r itself
  // would blur r - r_+ ~ 1e-5 there, which shifts the barrier against the
  // horizon boundary condition and puts a phase error on B_ref)
  function rhs(md, y, dy) {
    var a = md.a, x = Math.exp(y[0]), r = md.rp + x, A = r * r + a * a;
    var F = evalRat(md.F, r, a), U = evalRat(md.U, r, a);
    dy[0] = (x + md.rp - md.rm) / A;
    dy[1] = y[3]; dy[2] = y[4];
    dy[3] = F[0] * y[3] - F[1] * y[4] + U[0] * y[1] - U[1] * y[2];
    dy[4] = F[0] * y[4] + F[1] * y[3] + U[0] * y[2] + U[1] * y[1];
  }

  function integrate(md, t0, y0, t1, rtol, atol) {
    var N = 5, t = t0, y = y0.slice(), k = [], i, j, s;
    for (s = 0; s < 7; s++) k.push(new Float64Array(N));
    var tmp = new Float64Array(N), yn = new Float64Array(N);
    rhs(md, y, k[0]);
    var out = { t: [t0], y: [y.slice()], cont: [] };
    var h = 0.05, dir = t1 > t0 ? 1 : -1;
    for (var step = 0; step < 1e6 && dir * (t1 - t) > 0; step++) {
      if (dir * (t + h * dir - t1) > 0) h = Math.abs(t1 - t);
      var hh = h * dir;
      for (s = 1; s < 7; s++) {
        for (i = 0; i < N; i++) {
          var acc = y[i];
          for (j = 0; j < s; j++) acc += hh * DP.a[s][j] * k[j][i];
          tmp[i] = acc;
        }
        rhs(md, tmp, k[s]);
        if (s === 6) for (i = 0; i < N; i++) yn[i] = tmp[i];
      }
      // error on the wave only, relative to its local size
      var amp = Math.max(Math.hypot(y[1], y[2]), Math.hypot(y[3], y[4]), 1e-300), err = 0;
      for (i = 0; i < N; i++) {
        var e = 0;
        for (s = 0; s < 7; s++) e += DP.e[s] * k[s][i];
        var sc = i === 0 ? rtol : atol * amp + rtol * amp;
        err = Math.max(err, Math.abs(hh * e) / sc);
      }
      if (err <= 1) {
        var c = [y.slice(), [], [], [], []];
        for (i = 0; i < N; i++) {
          var dlt = yn[i] - y[i], b = hh * k[0][i] - dlt, dd = 0;
          for (s = 0; s < 7; s++) dd += DP.d[s] * k[s][i];
          c[1].push(dlt); c[2].push(b); c[3].push(dlt - hh * k[6][i] - b); c[4].push(hh * dd);
        }
        out.cont.push(c);
        t += hh;
        for (i = 0; i < N; i++) { y[i] = yn[i]; k[0][i] = k[6][i]; }
        out.t.push(t); out.y.push(y.slice());
      }
      h *= Math.min(5, Math.max(0.2, 0.9 * Math.pow(err || 1e-10, -0.2)));
    }
    return out;
  }
  function dense(c, t) {
    var u = 1 - t;
    return c[0].map(function (y0, i) { return y0 + t * (c[1][i] + u * (c[2][i] + t * (c[3][i] + u * c[4][i]))); });
  }

  // ---- the solution --------------------------------------------------------

  // R_in for (l, m, a, omega), omega real and nonzero.
  // opts: rsin, rsout (matching radii in r_*), horOrder, infOrder (series
  //       lengths), rtol (ODE), lambda (to override the eigenvalue).
  // The defaults are choices, tuned against GeneralizedSasakiNakamura.jl at
  // tight tolerance (tools/plunge/test-gsn.js): start where r - r_+ is 3% of
  // r_+ - r_- with 12 horizon terms, stop at r_* = max(60, 30/|omega|) with
  // 24 terms at infinity, ODE tolerance 1e-10. About 3.5 ms per mode.
  var DEFAULTS = { xin: 0.03, horOrder: 12, rsoutMin: 60, rsoutOmega: 30, infOrder: 24, rtol: 1e-10 };
  function radialIn(l, m, a, omega, opts) {
    opts = opts || {};
    var hz = horizons(a), dd = hz.rp - hz.rm;
    var rsin = opts.rsin !== undefined ? opts.rsin : rstarX(a, DEFAULTS.xin * dd);
    var rsout = opts.rsout !== undefined ? opts.rsout : Math.max(DEFAULTS.rsoutMin, DEFAULTS.rsoutOmega / Math.abs(omega));
    var md = setup(l, m, a, omega, opts);
    var hin = horizonSeries(md, -1, opts.horOrder || DEFAULTS.horOrder), thor = teukHorizonSeries(md, 48);
    var iout = infinitySeries(md, 1, opts.infOrder || DEFAULTS.infOrder), iin = infinitySeries(md, -1, opts.infOrder || DEFAULTS.infOrder);
    var x0 = xFromRstar(a, rsin), X0 = seriesX(md, hin, x0, rsin, 'hor');
    var sol = integrate(md, rsin, [Math.log(x0), X0[0][0], X0[0][1], X0[1][0], X0[1][1]], rsout, opts.rtol || DEFAULTS.rtol, 1e-14);
    var yN = sol.y[sol.y.length - 1], x1 = Math.exp(yN[0]);
    // match X = Bref X_out + Binc X_in at rs_out
    var Xo = seriesX(md, iout, x1, rsout, 'inf'), Xi = seriesX(md, iin, x1, rsout, 'inf');
    var C1 = [yN[1], yN[2]], C2 = [yN[3], yN[4]];
    var det = sub(mul(Xo[0], Xi[1]), mul(Xi[0], Xo[1]));
    var BrefSN = div(sub(mul(C1, Xi[1]), mul(Xi[0], C2)), det);
    var BincSN = div(sub(mul(Xo[0], C2), mul(C1, Xo[1])), det);
    var Bt = evalRat(md.Btrans, 1, a), Bi = evalRat(md.Binc, 1, a), Ct = evalRat(md.Ctrans, 1, a);
    // beyond rs_out, R_in = B_ref (outgoing series) + B_inc (ingoing series), directly
    var tOut = teukInfinitySeries(md, 1, 3, opts.infOrder || DEFAULTS.infOrder);
    var tIn = teukInfinitySeries(md, -1, -1, opts.infOrder || DEFAULTS.infOrder);
    var BrefT = div(mul(Ct, BrefSN), Bt), BincT = div(mul(Bi, BincSN), Bt);
    function farR(r) {
      var rs = rstar(a, r), o = teukInfinityR(md, tOut, r, rs), i = teukInfinityR(md, tIn, r, rs);
      return { R: add(mul(BrefT, o.R), mul(BincT, i.R)), dR: add(mul(BrefT, o.dR), mul(BincT, i.dR)) };
    }
    var res = {
      mode: md, rsin: rsin, rsout: rsout, rin: md.rp + x0, rout: md.rp + x1, steps: sol.t.length,
      BincSN: BincSN, BrefSN: BrefSN,
      Binc: div(mul(Bi, BincSN), Bt), Bref: div(mul(Ct, BrefSN), Bt),
      series: { hor: hin, outInf: iout, inInf: iin, teukHor: thor, teukOut: tOut, teukIn: tIn }
    };
    // GSN X and dX/dr_* at r_* = rs (x = r - r_+ optional, saves an inversion)
    res.X = function (rs, x) {
      if (rs < rsin) return seriesX(md, hin, x !== undefined ? x : xFromRstar(a, rs), rs, 'hor');
      if (rs > rsout) {
        x = x !== undefined ? x : xFromRstar(a, rs);
        var o = seriesX(md, iout, x, rs, 'inf'), i = seriesX(md, iin, x, rs, 'inf');
        return [add(mul(BrefSN, o[0]), mul(BincSN, i[0])), add(mul(BrefSN, o[1]), mul(BincSN, i[1]))];
      }
      var T = sol.t, lo = 0, hi = T.length - 1;
      while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (T[mid] > rs) hi = mid; else lo = mid; }
      var y = dense(sol.cont[lo], (rs - T[lo]) / (T[hi] - T[lo]));
      return [[y[1], y[2]], [y[3], y[4]]];
    };
    // Teukolsky R_in, dR/dr and d2R/dr2 at r > r_+ (or at x = r - r_+,
    // to be given instead near the horizon). route 'gsn' forces R = M (X, X')
    // everywhere (no near-horizon series, no far-field table).
    res.R = function (r, x, route) {
      x = x !== undefined ? x : r - md.rp; r = md.rp + x;
      var R, dR;
      if (x < thor.xmax && route !== 'gsn') {
        var hz = teukHorizonR(md, thor, x); R = hz.R; dR = hz.dR;
      } else if (x > x1 && route !== 'gsn') {
        var fz = farR(r); R = fz.R; dR = fz.dR;
      } else {
        var XX = res.X(rstarX(a, x), x);
        R = div(add(mul(evalRat(md.M11, r, a), XX[0]), mul(evalRat(md.M12, r, a), XX[1])), Bt);
        dR = div(add(mul(evalRat(md.M21, r, a), XX[0]), mul(evalRat(md.M22, r, a), XX[1])), Bt);
      }
      var Dl = x * (x + md.rp - md.rm), K = (r * r + a * a) * omega - m * a;
      // V_T = lambda - 4 i s omega r - (K^2 - 2 i s (r - 1) K)/Delta
      var VT = sub(sub(md.lambda, [0, 4 * S_SPIN * omega * r]), [(K * K) / Dl, -2 * S_SPIN * (r - 1) * K / Dl]);
      var d2R = scl(sub(mul(VT, R), scl(dR, 2 * (S_SPIN + 1) * (r - 1))), 1 / Dl);
      return { R: R, dR: dR, d2R: d2R };
    };
    return res;
  }

  var api = {
    radialIn: radialIn, DEFAULTS: DEFAULTS, chebNodes: chebNodes, chebFit: chebFit, chebEval: chebEval, eigenvalue: eigenvalue, angularSolve: angularSolve, rstar: rstar, rstarX: rstarX, rFromRstar: rFromRstar, xFromRstar: xFromRstar,
    setup: setup, horizonSeries: horizonSeries, infinitySeries: infinitySeries, evalRat: evalRat,
    c: { add: add, sub: sub, mul: mul, div: div, scl: scl, exp: cexp, abs: abs }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KerrGSN = api;
})(this);
