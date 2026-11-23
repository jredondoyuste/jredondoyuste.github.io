// The linear, Gaussian model, live, with two complex modes (the 220 and
// 221 of a chi_f = 0.69 remnant):
//
//   d(t) = A_220 e^{-i w_220 t} + A_221 e^{-i w_221 t} + n(t)
//   A_j ~ CN(0, sigma_j^2), independent;  n ~ CN(0, C), C circulant with PSD S
//   posterior: Sigma^-1 = Sigma_A^-1 + Z^H C^-1 Z,  mu = Sigma Z^H C^-1 d
//
// Each amplitude lives in its own complex plane. Its prior is a circular
// Gaussian (shaded disc); so is its marginal posterior.
//
// Presses (the slide's data-s):
//   0  the two planes and their priors, nothing else
//   1  the amplitudes wander through their priors (an Ornstein-Uhlenbeck
//      walk, so each moment is a fair prior draw and the motion is smooth);
//      each mode's ringdown and their sum follow on the right
//   2  noise from the PSD is added: the data
//   3  one observation: everything stops, and the priors contract to the
//      posteriors around the true amplitudes
//   4  four times louder: the posteriors contract further
(function () {
  'use strict';

  var slide = document.getElementById('mq-lgm');
  if (!slide) return;
  var svg = slide.querySelector('.lg-svg');
  var NS = 'http://www.w3.org/2000/svg';

  // ---- the model ---------------------------------------------------------
  var N = 128, T = 40, dt = T / N;
  var MODES = [                                      // Berti+ tables, a = 0.7
    { w: 0.5326, g: 0.0808, sig: 1.0, name: '220' },
    { w: 0.5194, g: 0.2440, sig: 1.6, name: '221' }
  ];
  var RHO0 = 10;                                      // SNR of a 1-sigma 220
  var tt = [], Z = [];                                // Z[j] = [re[], im[]]
  for (var k = 0; k < N; k++) tt[k] = k * dt;
  MODES.forEach(function (m) {
    var re = new Float64Array(N), im = new Float64Array(N);
    for (var k = 0; k < N; k++) {
      var e = Math.exp(-m.g * tt[k]);
      re[k] = e * Math.cos(m.w * tt[k]); im[k] = -e * Math.sin(m.w * tt[k]);
    }
    Z.push([re, im]);
  });

  // complex DFT, O(N^2) with tables
  var C = new Float64Array(N), Sn = new Float64Array(N);
  for (k = 0; k < N; k++) { C[k] = Math.cos(2 * Math.PI * k / N); Sn[k] = Math.sin(2 * Math.PI * k / N); }
  function dft(xr, xi, inv) {
    var R = new Float64Array(N), I = new Float64Array(N), sg = inv ? 1 : -1;
    for (var q = 0; q < N; q++) {
      var r = 0, i = 0;
      for (var n = 0; n < N; n++) {
        var m = (q * n) % N, c = C[m], s = sg * Sn[m];
        r += xr[n] * c - xi[n] * s; i += xr[n] * s + xi[n] * c;
      }
      R[q] = inv ? r / N : r; I[q] = inv ? i / N : i;
    }
    return [R, I];
  }
  // two-sided PSD in units of 1/M: a seismic-like wall below the band, a
  // floor in it, shot-noise-like rise above; a bucket on log-log axes
  function psd(f) { return 1 + Math.pow(0.05 / f, 4) + Math.pow(f / 0.4, 2); }
  var S = new Float64Array(N);
  for (k = 0; k < N; k++) {
    var q = k <= N / 2 ? k : N - k;
    S[k] = psd(Math.max(q, 0.5) / T);
  }
  var ZF = Z.map(function (z) { return dft(z[0], z[1]); });
  function inner(X, Y, scale) {                       // x^H C^-1 y, complex
    var r = 0, i = 0;
    for (var q = 0; q < N; q++) {
      r += (X[0][q] * Y[0][q] + X[1][q] * Y[1][q]) / S[q];
      i += (X[0][q] * Y[1][q] - X[1][q] * Y[0][q]) / S[q];
    }
    return [r / (N * scale), i / (N * scale)];
  }
  var SCALE0 = inner(ZF[0], ZF[0], 1)[0] * MODES[0].sig * MODES[0].sig / (RHO0 * RHO0);

  // ---- random numbers ------------------------------------------------------
  var seed = 11;
  function rand() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var r = Math.imul(seed ^ seed >>> 15, 1 | seed); r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; }
  function gauss() { var u = rand() || 1e-12, v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  // ---- state ----------------------------------------------------------------
  // amplitudes: complex, per-component variance sig^2 / 2
  var A = MODES.map(function (m) { return [m.sig * gauss() / Math.SQRT2, m.sig * gauss() / Math.SQRT2]; });
  var W = [new Float64Array(N), new Float64Array(N)];  // complex white noise, E|w|^2 = 1
  for (k = 0; k < N; k++) { W[0][k] = gauss() / Math.SQRT2; W[1][k] = gauss() / Math.SQRT2; }
  var TAU_A = 2.8, TAU_N = 1.8;                       // seconds: how fast the walks wander
  function ou(x, s, tau, h) { var a = Math.exp(-h / tau); return x * a + s * Math.sqrt(1 - a * a) * gauss(); }

  // ---- geometry -------------------------------------------------------------
  var UNIT = 70;                                       // px per unit amplitude
  var PL = [{ cx: 330, cy: 560 }, { cx: 780, cy: 560 }], HALF = 190;
  var PW = { x0: 1060, x1: 1780, y0: 360, y1: 640, yr: 3.0 };
  var PS = { x0: 1060, x1: 1360, y0: 720, y1: 880 };
  function wx(t) { return PW.x0 + t / T * (PW.x1 - PW.x0); }
  function wy(h) { return (PW.y0 + PW.y1) / 2 - Math.max(-PW.yr, Math.min(PW.yr, h)) / PW.yr * (PW.y1 - PW.y0) / 2; }
  var FMIN = 0.02, FMAX = 1.6, SMIN = 0.6, SMAX = 60;     // log-log
  function sx(f) { return PS.x0 + Math.log(f / FMIN) / Math.log(FMAX / FMIN) * (PS.x1 - PS.x0); }
  function sy(v) { return PS.y1 - Math.log(v / SMIN) / Math.log(SMAX / SMIN) * (PS.y1 - PS.y0); }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var a in attrs) e.setAttribute(a, attrs[a]);
    (parent || svg).appendChild(e);
    return e;
  }

  var R = {};
  function build() {
    svg.innerHTML = '';
    var defs = el('defs', {});
    MODES.forEach(function (m, j) {
      var gr = el('radialGradient', { id: 'lg-prior-' + j }, defs);
      // a Gaussian disc: opacity falls as exp(-r^2 / sigma_c^2), drawn out to 3 sigma
      for (var i = 0; i <= 10; i++) {
        var r = i / 10, z = 3 * r;
        el('stop', { offset: r, style: 'stop-color: var(--lg-c' + j + '); stop-opacity: ' + (0.42 * Math.exp(-z * z / 2)).toFixed(3) }, gr);
      }
    });

    R.planes = MODES.map(function (m, j) {
      var P = PL[j], g = el('g', { class: 'lg-plane lg-m' + j });
      el('line', { x1: P.cx - HALF, x2: P.cx + HALF, y1: P.cy, y2: P.cy, class: 'lg-axis' }, g);
      el('line', { x1: P.cx, x2: P.cx, y1: P.cy - HALF, y2: P.cy + HALF, class: 'lg-axis' }, g);
      el('text', { x: P.cx + HALF - 6, y: P.cy - 12, class: 'lg-ax-lab lg-end' }, g).textContent = 'Re';
      el('text', { x: P.cx + 12, y: P.cy - HALF + 22, class: 'lg-ax-lab lg-left' }, g).textContent = 'Im';
      var sc = m.sig / Math.SQRT2 * UNIT;              // 1 sigma per component, px
      var prior = el('circle', { cx: P.cx, cy: P.cy, r: 3 * sc, fill: 'url(#lg-prior-' + j + ')', class: 'lg-prior' }, g);
      el('text', { x: P.cx, y: P.cy + HALF + 58, class: 'lg-name' }, g).textContent = 'A' + ['₂₂₀', '₂₂₁'][j];
      var trail = el('g', { class: 'lg-trail' }, g);
      var post2 = el('circle', { cx: P.cx, cy: P.cy, r: 2 * sc, class: 'lg-post lg-post2' }, g);
      var post1 = el('circle', { cx: P.cx, cy: P.cy, r: sc, class: 'lg-post' }, g);
      var dot = el('circle', { cx: P.cx, cy: P.cy, r: 10, class: 'lg-dot' }, g);
      var tru = el('path', { class: 'lg-true' }, g);
      return { prior: prior, trail: trail, post1: post1, post2: post2, dot: dot, tru: tru, sc: sc, P: P };
    });

    // waveform
    var g = el('g', { class: 'lg-wave' });
    el('line', { x1: PW.x0, x2: PW.x1, y1: wy(0), y2: wy(0), class: 'lg-axis' }, g);
    el('line', { x1: PW.x0, x2: PW.x0, y1: PW.y0, y2: PW.y1, class: 'lg-axis' }, g);
    el('text', { x: PW.x1, y: wy(0) + 40, class: 'lg-ax-lab lg-end' }, g).textContent = 't / M';
    el('text', { x: PW.x0 + 14, y: PW.y0 + 10, class: 'lg-ax-lab lg-left' }, g).textContent = 'h₊';
    R.data = el('path', { class: 'lg-data' }, g);
    R.comp = [el('path', { class: 'lg-comp lg-c0' }, g), el('path', { class: 'lg-comp lg-c1' }, g)];
    R.sig = el('path', { class: 'lg-sig' }, g);
    R.legend = el('g', { class: 'lg-legend' }, g);
    var lg = [['lg-c0', '220'], ['lg-c1', '221'], ['lg-sigk', 'sum'], ['lg-datak', 'data']];
    lg.forEach(function (it, i) {
      var x = PW.x1 - 520 + i * 135, y = PW.y0 - 26;
      el('line', { x1: x, x2: x + 40, y1: y, y2: y, class: 'lg-key ' + it[0] }, R.legend);
      el('text', { x: x + 50, y: y + 8, class: 'lg-ax-lab lg-left lg-key-t ' + it[0] + '-t' }, R.legend).textContent = it[1];
    });

    // PSD
    g = el('g', { class: 'lg-psdp' });
    el('line', { x1: PS.x0, x2: PS.x1, y1: PS.y1, y2: PS.y1, class: 'lg-axis' }, g);
    el('line', { x1: PS.x0, x2: PS.x0, y1: PS.y0, y2: PS.y1, class: 'lg-axis' }, g);
    var d = '';
    for (k = 0; k <= 120; k++) { var ff = FMIN * Math.pow(FMAX / FMIN, k / 120); d += (k ? 'L' : 'M') + sx(ff).toFixed(1) + ' ' + sy(psd(ff)).toFixed(1); }
    el('path', { d: d, class: 'lg-psd' }, g);
    var f2 = MODES[0].w / (2 * Math.PI);
    el('line', { x1: sx(f2), x2: sx(f2), y1: PS.y0, y2: PS.y1, class: 'lg-axis lg-dash' }, g);
    el('text', { x: sx(f2) + 8, y: PS.y0 + 18, class: 'lg-ax-lab lg-left' }, g).textContent = 'f₂₂₀';
    el('text', { x: PS.x1, y: PS.y1 + 34, class: 'lg-ax-lab lg-end' }, g).textContent = 'f';
    el('text', { x: PS.x1, y: PS.y0 - 12, class: 'lg-ax-lab lg-end' }, g).textContent = 'noise PSD';
  }

  // ---- drawing --------------------------------------------------------------
  var stepNow = 0, scale = SCALE0, noiseOn = 0, raf = null, last = 0, dropT = 0;
  var post = null, postFrom = null, postT = 1;        // posterior animation
  var glide = 0, gTo = null;

  function series() {
    var comp = MODES.map(function (m, j) {
      var re = new Float64Array(N);
      for (var k = 0; k < N; k++) re[k] = A[j][0] * Z[j][0][k] - A[j][1] * Z[j][1][k];
      return re;
    });
    var n = dft.apply(null, (function () {
      var F = dft(W[0], W[1]);
      for (var q = 0; q < N; q++) { var a = Math.sqrt(S[q] * scale); F[0][q] *= a; F[1][q] *= a; }
      return [F[0], F[1], true];
    })());
    return { comp: comp, nRe: n[0], nIm: n[1] };
  }
  function path(y) {
    var s = '';
    for (var k = 0; k < N; k++) s += (k ? 'L' : 'M') + wx(tt[k]).toFixed(1) + ' ' + wy(y[k]).toFixed(1);
    return s;
  }
  function posterior(sr) {                            // exact, from the current data
    var dr = new Float64Array(N), di = new Float64Array(N);
    for (var k = 0; k < N; k++) {
      dr[k] = sr.nRe[k]; di[k] = sr.nIm[k];
      for (var j = 0; j < 2; j++) { dr[k] += A[j][0] * Z[j][0][k] - A[j][1] * Z[j][1][k]; di[k] += A[j][0] * Z[j][1][k] + A[j][1] * Z[j][0][k]; }
    }
    var DF = dft(dr, di);
    var F00 = inner(ZF[0], ZF[0], scale)[0], F11 = inner(ZF[1], ZF[1], scale)[0], F01 = inner(ZF[0], ZF[1], scale);
    // P = diag(1/sig^2) + F (Hermitian 2x2); Sigma = P^-1
    var a = F00 + 1 / (MODES[0].sig * MODES[0].sig), d = F11 + 1 / (MODES[1].sig * MODES[1].sig);
    var det = a * d - (F01[0] * F01[0] + F01[1] * F01[1]);
    var S00 = d / det, S11 = a / det, S01 = [-F01[0] / det, -F01[1] / det];     // Sigma_01 = -P_01 / det
    var b0 = inner(ZF[0], DF, scale), b1 = inner(ZF[1], DF, scale);
    function cm(x, y) { return [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]; }
    var S10 = [S01[0], -S01[1]];
    var m0 = cm([S00, 0], b0), t0 = cm(S01, b1), m1 = cm(S10, b0), t1 = cm([S11, 0], b1);
    return [{ mu: [m0[0] + t0[0], m0[1] + t0[1]], v: S00 }, { mu: [m1[0] + t1[0], m1[1] + t1[1]], v: S11 }];
  }

  function frame(now) {
    var h = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    var moving = stepNow >= 1 && stepNow <= 2;
    if (moving) {
      A.forEach(function (a, j) { var s = MODES[j].sig / Math.SQRT2; a[0] = ou(a[0], s, TAU_A, h); a[1] = ou(a[1], s, TAU_A, h); });
      if (stepNow === 2) for (var k = 0; k < N; k++) { W[0][k] = ou(W[0][k], Math.SQRT1_2, TAU_N, h); W[1][k] = ou(W[1][k], Math.SQRT1_2, TAU_N, h); }
    }
    noiseOn += ((stepNow >= 2 ? 1 : 0) - noiseOn) * Math.min(1, h * 5);
    var sr = series();
    var sum = new Float64Array(N), dat = new Float64Array(N);
    for (k = 0; k < N; k++) { sum[k] = sr.comp[0][k] + sr.comp[1][k]; dat[k] = sum[k] + noiseOn * sr.nRe[k]; }
    R.comp[0].setAttribute('d', path(sr.comp[0]));
    R.comp[1].setAttribute('d', path(sr.comp[1]));
    R.sig.setAttribute('d', path(sum));
    R.data.setAttribute('d', path(dat));

    // the amplitudes, and a trail of where they have been (the prior, sampled)
    dropT += h;
    R.planes.forEach(function (p, j) {
      var x = p.P.cx + A[j][0] * UNIT, y = p.P.cy - A[j][1] * UNIT;
      p.dot.setAttribute('cx', x.toFixed(1)); p.dot.setAttribute('cy', y.toFixed(1));
      p.tru.setAttribute('d', 'M' + (x - 11) + ' ' + (y - 11) + 'L' + (x + 11) + ' ' + (y + 11) + 'M' + (x - 11) + ' ' + (y + 11) + 'L' + (x + 11) + ' ' + (y - 11));
      if (moving && dropT > 0.44) {
        var c = el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 4 }, p.trail);
        if (p.trail.childNodes.length > 60) p.trail.removeChild(p.trail.firstChild);
        c.style.opacity = 0.55;
      }
    });
    if (dropT > 0.44) dropT = 0;

    // the observation: if the walk stopped on a faint 220, glide it out to
    // at least 1.1 sigma first, so the frozen data has rho_220 >~ 11
    if (glide > 0) {
      glide = Math.max(0, glide - h);
      var u = 1 - Math.exp(-h / 0.12);
      A.forEach(function (a, j) { a[0] += (gTo[j][0] - a[0]) * u; a[1] += (gTo[j][1] - a[1]) * u; });
      if (glide === 0) A = gTo.map(function (g) { return [g[0], g[1]]; });
    }
    // posterior discs
    if (stepNow >= 3 && glide === 0) {
      if (!post) { post = posterior(sr); }
      postT = Math.min(1, postT + h / 1.3);
      var e = postT < 0.5 ? 2 * postT * postT : 1 - Math.pow(-2 * postT + 2, 2) / 2;
      R.planes.forEach(function (p, j) {
        var from = postFrom ? postFrom[j] : { mu: [0, 0], v: MODES[j].sig * MODES[j].sig };
        var mx = from.mu[0] + (post[j].mu[0] - from.mu[0]) * e, my = from.mu[1] + (post[j].mu[1] - from.mu[1]) * e;
        // rings hold 68% and 95%: |A - mu|^2 / v ~ Exp(1), so r = sqrt(-ln(1 - p) v)
        var r = Math.sqrt(from.v) + (Math.sqrt(post[j].v) - Math.sqrt(from.v)) * e;
        [p.post1, p.post2].forEach(function (c, i) {
          c.setAttribute('cx', (p.P.cx + mx * UNIT).toFixed(1)); c.setAttribute('cy', (p.P.cy - my * UNIT).toFixed(1));
          c.setAttribute('r', ([1.067, 1.731][i] * r * UNIT).toFixed(1));
        });
      });
    }
    raf = requestAnimationFrame(frame);
  }

  function setStep(s) {
    var prev = stepNow;
    stepNow = s;
    for (var i = 0; i <= 4; i++) slide.classList.toggle('lg-s' + i, s >= i);
    slide.classList.toggle('lg-now1', s === 1);
    var newScale = s >= 4 ? SCALE0 / 16 : SCALE0;
    if (s >= 3 && prev < 3) {
      var r0 = Math.hypot(A[0][0], A[0][1]) / MODES[0].sig, rmin = 1.1;
      if (r0 < rmin) {
        var ang = r0 > 0.05 ? Math.atan2(A[0][1], A[0][0]) : 0.7;
        gTo = [[rmin * MODES[0].sig * Math.cos(ang), rmin * MODES[0].sig * Math.sin(ang)], [A[1][0], A[1][1]]];
        glide = 0.6;
      }
    }
    if (s < 3) glide = 0;
    if (s >= 3) {
      if (prev < 3 || newScale !== scale) {
        postFrom = prev >= 3 && post ? post : null;
        scale = newScale; post = null; postT = 0;
      }
    } else { post = null; postFrom = null; scale = SCALE0; }
    if (s < 1) R.planes.forEach(function (p) { p.trail.innerHTML = ''; });
  }

  build();
  Deck.on('mq-lgm', {
    enter: function (sl) { setStep(+sl.dataset.s || 0); last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); },
    leave: function () { cancelAnimationFrame(raf); raf = null; }
  });
  new MutationObserver(function () { setStep(+slide.dataset.s || 0); })
    .observe(slide, { attributes: true, attributeFilter: ['data-s'] });
})();
