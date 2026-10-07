// Web Worker for the plunge page: the Teukolsky amplitude Z(l, m, omega) for
// one frequency per message (the page hands them out one at a time, so a
// new orbit simply stops the old stream).
//   in:  { job, orbit: { a, E, L, Q, chi0, from, r0, on }, l, m, omega, wmax }
// with on = { lam, t, T } for ISCO plunges: the source starts at Mino time
// lam (BL time t) and is switched on smoothly over T
//   out: { job, omega, Z: [re, im], b: [re0, im0, re1, im1, ...], lmin }
// with b the first NB coefficients of S_lm(theta; omega) in spin-weighted
// spherical harmonics -2Y_jm, j = lmin, lmin + 1, ...
/* global importScripts, KerrGeo, KerrPlunge */
importScripts('kerr-qnm.js', 'kerr-geodesic.js', 'kerr-gsn-data.js', 'kerr-gsn.js', 'kerr-plunge.js');

var NB = 10;
var cache = { key: null, tr: null, t0: 0, grid: null };
self.onmessage = function (e) {
  var d = e.data, o = d.orbit, P = KerrPlunge, w = d.omega, res = null;
  var key = JSON.stringify(o) + '|' + d.m;
  if (cache.key !== key) {
    // from infinity the orbit starts far enough out for any switch-on radius
    var tr = KerrGeo.trajectory(o.a, o.E, o.L, o.Q, { r0: o.from === 'inf' ? 1e5 : o.r0, chi0: o.chi0 });
    cache = { key: key, tr: tr, grid: null };
  }
  try {
    if (o.from === 'inf') {
      var sw = P.switchFor(cache.tr, w);
      var gr = P.grid(cache.tr, { wmax: Math.abs(w), mmax: Math.abs(d.m), lam0: cache.tr.lamAt(sw.rStart) || 0 });
      res = P.amplitude(gr, d.l, d.m, w, null, { window: sw.window });
    } else {
      // from the ISCO: one grid for all frequencies up to its wmax, from where
      // the source starts, switched on in coordinate time over one orbit
      var on = o.on;
      if (!cache.grid || cache.grid.wmax < Math.abs(w)) cache.grid = P.grid(cache.tr, { wmax: Math.max(Math.abs(w), d.wmax || 1), mmax: Math.abs(d.m), lam0: on.lam });
      res = P.amplitude(cache.grid, d.l, d.m, w, null, { window: function (n) { return P.smoothStep((n.t - on.t) / on.T); } });
    }
  } catch (err) { res = null; }
  var b = [], lmin = 0;
  if (res) {
    var ang = res.rad.mode.ang; lmin = ang.lmin;
    for (var j = 0; j < NB && j < ang.C.length; j++) b.push(ang.C[j][0], ang.C[j][1]);
  }
  self.postMessage({ job: d.job, omega: w, Z: res ? res.Z : [NaN, NaN], b: b, lmin: lmin });
};
