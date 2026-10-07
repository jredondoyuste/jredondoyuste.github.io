// Plunging timelike geodesics of Kerr, for the plunge page (plunge.html).
//
// Units G = c = M = mu = 1, Boyer-Lindquist (t, r, theta, phi), z = cos theta.
// Conserved: energy E, axial angular momentum L, Carter constant Q (>= 0
// here). In Mino time lambda (dtau = Sigma dlambda) the r and theta motions
// decouple:
//   (dr/dlambda)^2 = R(r) = [E(r^2+a^2) - aL]^2 - Delta [r^2 + (L-aE)^2 + Q]
//   (dz/dlambda)^2 = Q - z^2 (Q + L^2 + beta) + beta z^4,  beta = a^2 (1-E^2).
// A plunge has no radial turning point, so dr/dlambda = -sqrt(R) throughout.
// theta oscillates in [-z_m, z_m] and is followed through the angle chi,
// z = z_m cos chi, which never turns around.
//
// Time and azimuth are integrated in ingoing Kerr coordinates
//   v = t + r_*,   phit = phi + r_sharp,
// which stay finite through the future horizon, so the particle can be
// followed across r_+ (and the Kerr-Schild Cartesian picture is regular there).
(function (root) {
  'use strict';

  function horizons(a) {
    var s = Math.sqrt(1 - a * a);
    return { rp: 1 + s, rm: 1 - s };
  }

  // R(r) = c[4] r^4 + c[3] r^3 + c[2] r^2 + c[1] r + c[0]
  function radialCoeffs(a, E, L, Q) {
    var K = (L - a * E) * (L - a * E) + Q;
    return [-a * a * Q, 2 * K, a * a * (E * E - 1) - L * L - Q, 2, E * E - 1];
  }
  function horner(c, r) {
    var v = 0;
    for (var k = c.length - 1; k >= 0; k--) v = v * r + c[k];
    return v;
  }
  function R(a, E, L, Q, r) { return horner(radialCoeffs(a, E, L, Q), r); }

  // tortoise coordinate and its azimuthal partner (the r_sharp of kerr.html):
  //   dr_*/dr = (r^2 + a^2)/Delta,   dr_sharp/dr = a/Delta
  function rstar(a, r) {
    var h = horizons(a), d = h.rp - h.rm;
    if (d < 1e-12) return r + 2 * Math.log(Math.abs(r - 1)) - 2 / (r - 1);
    return r + 2 * h.rp / d * Math.log(Math.abs(r - h.rp) / 2) - 2 * h.rm / d * Math.log(Math.abs(r - h.rm) / 2);
  }
  function rsharp(a, r) {
    var h = horizons(a), d = h.rp - h.rm;
    if (d < 1e-12) return -a / (r - 1);
    return a / d * Math.log(Math.abs((r - h.rp) / (r - h.rm)));
  }

  // ---- which (E, L, Q) plunge from infinity -----------------------------

  // From infinity (E >= 1) the particle plunges iff R > 0 on all of
  // (r_+, infinity). R(r_+) = P(r_+)^2 >= 0 and R grows at infinity, so
  // this is R > 0 at every minimum outside the horizon; R = 0 at a minimum
  // is the separatrix (an unstable spherical orbit), which does not plunge.
  // The minima are found between the roots of R'' (a quadratic), where R'
  // is monotonic, so double roots of R near the separatrix cost nothing.
  function minR(a, E, L, Q) {
    var c = radialCoeffs(a, E, L, Q), rp = horizons(a).rp;
    var d1 = [c[1], 2 * c[2], 3 * c[3], 4 * c[4]];
    var A2 = 12 * c[4], B2 = 6 * c[3], C2 = 2 * c[2], cuts = [rp];
    if (Math.abs(A2) < 1e-14 * Math.abs(B2)) cuts.push(-C2 / B2);
    else {
      var dq = B2 * B2 - 4 * A2 * C2;
      if (dq > 0) {
        var q = -0.5 * (B2 + Math.sqrt(dq));
        cuts.push(q / A2, C2 / q);
      }
    }
    cuts = cuts.filter(function (x) { return x >= rp; }).sort(function (x, y) { return x - y; });
    var hi = 2 * cuts[cuts.length - 1] + 10;
    while (horner(d1, hi) <= 0 && hi < 1e12) hi *= 2;
    cuts.push(hi);
    var m = horner(c, rp);
    for (var k = 0; k + 1 < cuts.length; k++) {
      var lo = cuts[k], up = cuts[k + 1], flo = horner(d1, lo), fup = horner(d1, up);
      if (!(flo < 0 && fup > 0)) continue;   // a minimum needs R' to go - to +
      for (var i = 0; i < 100 && up - lo > 1e-14 * up; i++) {
        var mid = 0.5 * (lo + up);
        if (horner(d1, mid) < 0) lo = mid; else up = mid;
      }
      m = Math.min(m, horner(c, 0.5 * (lo + up)));
    }
    return m;
  }

  function plunges(a, E, L, Q) {
    if (E < 1 || Q < 0) return false;
    var rp = horizons(a).rp;
    if (E * (rp * rp + a * a) - a * L <= 0) return false;   // must reach r_+ forwards in time
    return minR(a, E, L, Q) > 0;
  }

  function bisect(f, lo, hi, n) {
    for (var i = 0; i < (n || 60); i++) {
      var mid = 0.5 * (lo + hi);
      if (f(mid)) lo = mid; else hi = mid;
    }
    return 0.5 * (lo + hi);
  }

  // the equatorial critical angular momenta, prograde (> 0) and retrograde (< 0)
  function Lcrit(a, E) {
    function edge(sgn) {
      var hi = 2;
      while (plunges(a, E, sgn * hi, 0)) hi *= 2;
      return sgn * bisect(function (L) { return plunges(a, E, sgn * L, 0); }, 0, hi);
    }
    return { pro: edge(1), retro: edge(-1) };
  }

  // Larger Q lowers R everywhere outside the horizon (dR/dQ = -Delta), so at
  // fixed L the plunges are 0 <= Q < Qcrit(L). Returns that edge on n points
  // across (L_retro, L_pro).
  function plungeRegion(a, E, n) {
    n = n || 121;
    var lc = Lcrit(a, E), out = [];
    for (var i = 0; i < n; i++) {
      var L = lc.retro + (lc.pro - lc.retro) * i / (n - 1), Qc = 0;
      if (i > 0 && i < n - 1) {
        var hi = 4;
        while (plunges(a, E, L, hi)) hi *= 2;
        Qc = bisect(function (Q) { return plunges(a, E, L, Q); }, 0, hi);
      }
      out.push({ L: L, Q: Qc });
    }
    return { Lpro: lc.pro, Lretro: lc.retro, edge: out };
  }

  // ---- spherical orbits and the ISSO ------------------------------------

  // Fix the turning point of theta through x = sin(theta_min) sign(L)
  // (x = +-1 equatorial, x = 0 polar), and write L = x l with l >= 0, so that
  // Q = (1 - x^2)(a^2 (1 - E^2) + l^2). Then
  //   R = F E^2 - 2 G E l - H l^2 - D,
  // F = r^4 + a^2 [r(r+2) + (1-x^2) Delta],  G = 2 a r x,
  // H = r^2 - 2r + (1-x^2) a^2,               D = (r^2 + a^2 (1-x^2)) Delta.
  // Index k is the k-th r-derivative.
  function FGHD(a, x, r) {
    var z2 = 1 - x * x, a2 = a * a, Dl = r * r - 2 * r + a2, u = r * r + a2 * z2;
    return {
      F: [r * r * r * r + a2 * (r * (r + 2) + z2 * Dl), 4 * r * r * r + a2 * (2 * r + 2 + z2 * (2 * r - 2)), 12 * r * r + a2 * (2 + 2 * z2)],
      G: [2 * a * r * x, 2 * a * x, 0],
      H: [r * r - 2 * r + z2 * a2, 2 * r - 2, 2],
      D: [u * Dl, 2 * r * Dl + u * (2 * r - 2), 2 * Dl + 4 * r * (2 * r - 2) + 2 * u]
    };
  }

  // E, L, Q of the spherical orbit at radius r with inclination x, from
  // R(r) = R'(r) = 0: linear in (E^2, E l, l^2), closed by (E l)^2 = E^2 l^2.
  function spherical(a, x, r) {
    var f = FGHD(a, x, r), F = f.F, G = f.G, H = f.H, D = f.D;
    var kap = D[0] * H[1] - H[0] * D[1], sig = G[0] * H[1] - H[0] * G[1];
    var rho = F[0] * H[1] - H[0] * F[1], eta = F[0] * G[1] - G[0] * F[1];
    var chi = F[1] * D[0] - F[0] * D[1];
    var qa = rho * rho + 4 * sig * eta, qb = 2 * (eta * kap - sig * chi), qc = -kap * chi;
    var disc = qb * qb - 4 * qa * qc;
    if (!(disc >= 0) || qa === 0) return null;
    // Each root B is shared by (E, l) and (-E, -l), the time reverse. With
    // E > 0 imposed, keep the root with l >= 0 whose motion runs forwards:
    // dt/dlambda > 0 at the equator and at the turning latitude.
    var sq = Math.sqrt(disc), q = -0.5 * (qb + (qb >= 0 ? sq : -sq)), best = null;
    [q / qa, q !== 0 ? qc / q : 0].forEach(function (B) {
      var E2 = (kap + 2 * sig * B) / rho;
      if (!(E2 > 0) || B < 0) return;
      var E = Math.sqrt(E2), l = B / E, L = x * l, a2 = a * a, Dl = r * r - 2 * r + a2;
      var P = E * (r * r + a2) - a * L, fwd = true;
      [1, x * x].forEach(function (s2) {
        if ((r * r + a2) * P / Dl - a * (a * E * s2 - L) <= 0) fwd = false;
      });
      if (!fwd) return;
      var s = { r: r, E: E, L: L, Q: (1 - x * x) * (a2 * (1 - E2) + l * l), x: x,
                R2: F[2] * E2 - 2 * G[2] * B - H[2] * l * l - D[2] };
      if (!best || s.E < best.E) best = s;
    });
    return best;
  }

  // innermost stable spherical orbit: where R'' of the spherical orbit
  // changes sign (negative = stable)
  function isso(a, x) {
    var r = 12, s, last = null;
    for (;;) {
      s = spherical(a, x, r);
      if (!s || s.R2 > 0) break;
      last = r; r *= 0.97;
      if (r < 1) return null;
    }
    var lo = r, hi = last;   // unstable (or no orbit) at lo, stable at hi
    for (var i = 0; i < 80; i++) {
      var mid = 0.5 * (lo + hi), sm = spherical(a, x, mid);
      if (sm && sm.R2 < 0) hi = mid; else lo = mid;
    }
    return spherical(a, x, hi);
  }

  // ---- the trajectory ---------------------------------------------------

  // y = [r, chi, v, phit, tau] as functions of Mino time.
  function rhs(o, y, dy) {
    var a = o.a, E = o.E, L = o.L, Q = o.Q;
    var r = y[0], z = o.zm * Math.cos(y[1]), z2 = z * z;
    var Rv = horner(o.c, r), sR = Math.sqrt(Math.max(Rv, 0));
    var r2a2 = r * r + a * a, P = E * r2a2 - a * L;
    var K = r * r + (L - a * E) * (L - a * E) + Q, w = K / (P + sR);   // (P - sqrt R)/Delta
    dy[0] = o.fixR ? 0 : -sR;
    dy[1] = Math.sqrt(Math.max(o.chiA - o.beta * o.zm * o.zm * Math.cos(y[1]) * Math.cos(y[1]), 0));
    dy[2] = r2a2 * w - a * a * E * (1 - z2) + a * L;
    dy[3] = a * w + (L === 0 ? 0 : L / (1 - z2)) - a * E;
    dy[4] = r * r + a * a * z2;
  }

  // Dormand-Prince 5(4), adaptive, keeping every step with Hairer's
  // 4th-order continuous extension for evaluation in between.
  var DP = {
    a: [[], [1 / 5], [3 / 40, 9 / 40], [44 / 45, -56 / 15, 32 / 9],
        [19372 / 6561, -25360 / 2187, 64448 / 6561, -212 / 729],
        [9017 / 3168, -355 / 33, 46732 / 5247, 49 / 176, -5103 / 18656],
        [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84]],
    e: [71 / 57600, 0, -71 / 16695, 71 / 1920, -17253 / 339200, 22 / 525, -1 / 40],
    d: [-12715105075 / 11282082432, 0, 87487479700 / 32700410799, -10690763975 / 1880347072,
        701980252875 / 199316789632, -1453857185 / 822651844, 69997945 / 29380423]
  };

  function integrate(o, y0, opts) {
    var N = y0.length, rtol = opts.rtol || 1e-12, atol = opts.atol || 1e-13;
    var lam = 0, y = y0.slice(), k = [], i, j, s;
    for (s = 0; s < 7; s++) k.push(new Float64Array(N));
    var tmp = new Float64Array(N), yn = new Float64Array(N);
    rhs(o, y, k[0]);
    var out = { lam: [0], y: [y.slice()], cont: [] };
    var h = opts.h0 || (k[0][0] ? 1e-3 * Math.abs(y[0] / k[0][0]) : 1e-3);
    for (var step = 0; step < 200000; step++) {
      for (s = 1; s < 7; s++) {
        for (i = 0; i < N; i++) {
          var acc = y[i];
          for (j = 0; j < s; j++) acc += h * DP.a[s][j] * k[j][i];
          tmp[i] = acc;
        }
        rhs(o, tmp, k[s]);
        if (s === 6) for (i = 0; i < N; i++) yn[i] = tmp[i];
      }
      var err = 0;
      for (i = 0; i < N; i++) {
        var e = 0;
        for (s = 0; s < 7; s++) e += DP.e[s] * k[s][i];
        var sc = atol + rtol * Math.max(Math.abs(y[i]), Math.abs(yn[i]));
        err = Math.max(err, Math.abs(h * e) / sc);
      }
      if (err <= 1) {
        var c = [y.slice(), [], [], [], []];
        for (i = 0; i < N; i++) {
          var dlt = yn[i] - y[i], b = h * k[0][i] - dlt, dd = 0;
          for (s = 0; s < 7; s++) dd += DP.d[s] * k[s][i];
          c[1].push(dlt); c[2].push(b); c[3].push(dlt - h * k[6][i] - b); c[4].push(h * dd);
        }
        out.cont.push(c);
        lam += h;
        for (i = 0; i < N; i++) { y[i] = yn[i]; k[0][i] = k[6][i]; }
        out.lam.push(lam); out.y.push(y.slice());
        if (y[0] <= opts.rEnd || lam >= opts.lamMax) break;
      }
      h *= Math.min(5, Math.max(0.2, 0.9 * Math.pow(err || 1e-10, -0.2)));
    }
    return out;
  }

  // y at fraction t of step i
  function dense(c, t) {
    var u = 1 - t;
    return c[0].map(function (y0, i) { return y0 + t * (c[1][i] + u * (c[2][i] + t * (c[3][i] + u * c[4][i]))); });
  }

  // Mino time at which r = rc (r falls monotonically)
  function crossing(sol, rc) {
    for (var i = 1; i < sol.lam.length; i++) {
      if (sol.y[i][0] <= rc) {
        var c = sol.cont[i - 1];
        var t = bisect(function (t) { return dense(c, t)[0] > rc; }, 0, 1);
        return sol.lam[i - 1] + t * (sol.lam[i] - sol.lam[i - 1]);
      }
    }
    return null;
  }

  // opts:
  //   r0    starting radius ("infinity" is a large r0; for ISSO plunges, just
  //         inside the ISSO, where the exact plunge has whirled forever)
  //   chi0  phase of the theta oscillation at r0: z = z_m cos(chi0)
  //   rEnd  where to stop (default a quarter of the way from r_+ to r_-)
  //   fixR, lamMax  hold r at r0 (a spherical orbit, for tests) until lamMax
  function trajectory(a, E, L, Q, opts) {
    opts = opts || {};
    var h = horizons(a), beta = a * a * (1 - E * E);
    var A = Q + L * L + beta, sq = Math.sqrt(Math.max(A * A - 4 * beta * Q, 0));
    // z_m^2 is the root of the theta quartic in [0, 1]; Q / z_m^2 is written
    // without the division so that the equatorial limit is regular
    var o = { a: a, E: E, L: L, Q: Q, beta: beta, c: radialCoeffs(a, E, L, Q),
              zm: A > 0 ? Math.sqrt(2 * Q / (A + sq)) : 0, chiA: 0.5 * (A + sq), fixR: !!opts.fixR };
    var rEnd = opts.rEnd !== undefined ? opts.rEnd : h.rp - 0.25 * (h.rp - h.rm);
    var r0 = opts.r0 || 1000, chi0 = opts.chi0 || 0;
    var sol = integrate(o, [r0, chi0, 0, 0, 0], { rEnd: rEnd, rtol: opts.rtol, atol: opts.atol, lamMax: opts.lamMax || Infinity });
    var res = {
      a: a, E: E, L: L, Q: Q, zm: o.zm, rp: h.rp, rm: h.rm, r0: r0, rEnd: rEnd, o: o,
      lam: sol.lam, y: sol.y, cont: sol.cont,
      lamH: crossing(sol, h.rp),                         // crosses the horizon
      lamEnd: crossing(sol, rEnd) || sol.lam[sol.lam.length - 1]
    };
    res.at = function (lam) { return at(res, lam); };
    res.lamAt = function (rc) { return rc >= r0 ? 0 : crossing(sol, rc); };
    return res;
  }

  // state at Mino time lam (clamped to [0, lamEnd]): r, z, v, phit, tau,
  // their lambda-derivatives, Boyer-Lindquist t and phi (outside the
  // horizon), and Kerr-Schild Cartesian X, Y, Z.
  function at(tr, lam) {
    var L = tr.lam, lo = 0, hi = L.length - 1;
    lam = Math.min(Math.max(lam, 0), tr.lamEnd);
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (L[mid] > lam) hi = mid; else lo = mid; }
    var h = L[hi] - L[lo];
    return state(tr, dense(tr.cont[lo], h > 0 ? (lam - L[lo]) / h : 0), lam);
  }

  function state(tr, y, lam) {
    var a = tr.a, r = y[0], z = tr.zm * Math.cos(y[1]), st = Math.sqrt(Math.max(1 - z * z, 0));
    var cp = Math.cos(y[3]), sp = Math.sin(y[3]);
    var s = { lam: lam, r: r, z: z, chi: y[1], v: y[2], phit: y[3], tau: y[4],
              X: st * (r * cp - a * sp), Y: st * (r * sp + a * cp), Z: r * z };
    var d = new Float64Array(5); rhs(tr.o, y, d);
    s.dlam = { r: d[0], chi: d[1], v: d[2], phit: d[3], tau: d[4] };
    if (r > tr.rp) { s.t = y[2] - rstar(a, r); s.phi = y[3] - rsharp(a, r); }
    return s;
  }

  // n samples from Mino time lam0 (default 0) to the end, evenly spaced in
  // Mino time or (by: 'v') in advanced time
  function sample(tr, n, by, lam0) {
    var out = [], i, L = tr.lam, l0 = lam0 || 0, l1 = tr.lamEnd;
    if (by !== 'v') {
      for (i = 0; i < n; i++) out.push(at(tr, l0 + (l1 - l0) * i / (n - 1)));
      return out;
    }
    // v grows monotonically along a future-directed path
    var v0 = at(tr, l0).v, v1 = at(tr, l1).v, j = 0;
    for (i = 0; i < n; i++) {
      var vt = v0 + (v1 - v0) * i / (n - 1);
      while (j < L.length - 2 && tr.y[j + 1][2] < vt) j++;
      var lam = bisect(function (lm) { return at(tr, lm).v < vt; }, L[j], Math.min(L[j + 1], l1), 50);
      out.push(at(tr, lam));
    }
    return out;
  }

  // ---- Boyer-Lindquist metric, for checking -----------------------------

  // g_{mu nu} at (r, theta), order (t, r, theta, phi); only the nonzero ones
  function metricBL(a, r, z) {
    var z2 = z * z, s2 = 1 - z2, Sg = r * r + a * a * z2, Dl = r * r - 2 * r + a * a;
    return {
      tt: -(1 - 2 * r / Sg), tp: -2 * a * r * s2 / Sg,
      pp: (r * r + a * a + 2 * a * a * r * s2 / Sg) * s2,
      rr: Sg / Dl, hh: Sg
    };
  }

  var api = {
    horizons: horizons, radialCoeffs: radialCoeffs, R: R, rstar: rstar, rsharp: rsharp,
    minR: minR, plunges: plunges, Lcrit: Lcrit, plungeRegion: plungeRegion,
    spherical: spherical, isso: isso,
    trajectory: trajectory, at: at, sample: sample, metricBL: metricBL
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KerrGeo = api;
})(this);
