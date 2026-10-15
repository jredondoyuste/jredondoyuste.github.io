// The quadratic scattering page (quadratic.html): pick two incoming waves and
// an outgoing harmonic, read Q from the packed table (tools/quadratic/pack.py),
// and draw it: the waves on spheres either side of the hole, and |Q|, arg Q as
// surfaces over the (w1, w2) grid.
//
// Q = s (-1)^(m1+m2) 3j(l1 l2 l'; m1 m2 -m') Qred, and only Qred is tabulated.
(function () {
  'use strict';

  var DATA = '/files/quadratic/';
  var SPEED = 15;          // animation time: M per second of wall clock
  var ERRMAX = 0.01;       // relative error above which a grid point is flagged
  var DIST = 60;           // spheres sit this many M from the hole
  var RSH = 3 * Math.sqrt(3); // shadow radius
  var NT = 513;            // theta samples of each harmonic
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (id) { return document.getElementById(id); };
  var ui = {
    l1: $('qq-l1'), m1: $('qq-m1'), k1: $('qq-k1'),
    l2: $('qq-l2'), m2: $('qq-m2'), k2: $('qq-k2'),
    lp: $('qq-lp'), fixed: $('qq-fixed'), big: $('qq-big'), readout: $('qq-readout'),
    play: $('qq-play'), time: $('qq-time-out'),
    stage: $('qq-stage'), sabs: $('qq-sabs'), sarg: $('qq-sarg')
  };
  if (!ui.stage) return;

  var state = {
    p1: 1, l1: 2, m1: 2, k1: 20,
    p2: 1, l2: 2, m2: 2, k2: 20,
    pp: 1, lp: 4, norm: 'in', pol: 'plus',
    t: 0, playing: !calm,
    sph: { el: 0.42, az: 0.5 },          // camera on the spheres
    surf: { el: 0.55, az: -0.75 }        // camera on the surfaces
  };
  var man = null, bins = {}, pending = {};

  // ---- colours from the page's tokens -----------------------------------

  var col = {};
  function rgb(c) {
    c = c.trim();
    if (c[0] === '#' && c.length === 4) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    var v = parseInt(c.slice(1), 16);
    return [v >> 16 & 255, v >> 8 & 255, v & 255];
  }
  function readColours() {
    var cs = getComputedStyle(document.documentElement);
    ['bg', 'panel', 'ink', 'muted', 'hair', 'accent', 'accent-2'].forEach(function (k) {
      col[k] = cs.getPropertyValue('--' + k).trim();
      col[k + 'R'] = rgb(col[k]);
    });
    col.dark = document.documentElement.dataset.theme === 'dark';
    col.holeR = col.dark ? [12, 9, 8] : col.inkR;
  }
  readColours();
  new MutationObserver(function () { readColours(); sphereDirty = true; surfDirty = true; })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ---- angular algebra ----------------------------------------------------

  var FACT = [1];
  for (var i = 1; i < 40; i++) FACT[i] = FACT[i - 1] * i;
  function fact(n) { return n < 0 ? NaN : FACT[n]; }
  function choose(n, k) { return k < 0 || k > n ? 0 : FACT[n] / (FACT[k] * FACT[n - k]); }

  // Wigner 3j by Racah's formula (integers only)
  function w3j(j1, j2, j3, m1, m2, m3) {
    if (m1 + m2 + m3 !== 0) return 0;
    if (Math.abs(m1) > j1 || Math.abs(m2) > j2 || Math.abs(m3) > j3) return 0;
    if (j3 < Math.abs(j1 - j2) || j3 > j1 + j2) return 0;
    var kmin = Math.max(0, j2 - j3 - m1, j1 - j3 + m2);
    var kmax = Math.min(j1 + j2 - j3, j1 - m1, j2 + m2);
    var sum = 0;
    for (var k = kmin; k <= kmax; k++) {
      sum += (k % 2 ? -1 : 1) / (fact(k) * fact(j1 + j2 - j3 - k) * fact(j1 - m1 - k) *
        fact(j2 + m2 - k) * fact(j3 - j2 + m1 + k) * fact(j3 - j1 - m2 + k));
    }
    var tri = fact(j1 + j2 - j3) * fact(j1 - j2 + j3) * fact(-j1 + j2 + j3) / fact(j1 + j2 + j3 + 1);
    var pre = Math.sqrt(tri * fact(j1 + m1) * fact(j1 - m1) * fact(j2 + m2) * fact(j2 - m2) *
      fact(j3 + m3) * fact(j3 - m3));
    return ((j1 - j2 - m3) % 2 ? -1 : 1) * pre * sum;
  }

  // theta part of the spin-weighted harmonic sY_lm (Goldberg et al. 1967),
  // so that sY_lm(theta, phi) = sylm(...) e^{i m phi}; -2Y_22 = sqrt(5/64pi)(1+cos)^2
  function sylm(s, l, m, th) {
    if (l < Math.abs(s) || l < Math.abs(m)) return 0;
    var c = Math.cos(th / 2), sn = Math.sin(th / 2), sum = 0;
    for (var r = 0; r <= l - s; r++) {
      var k = 2 * r + s - m;               // power of cot(theta/2)
      if (k < 0 || 2 * l - k < 0) continue;
      var b = choose(l - s, r) * choose(l + s, r + s - m);
      if (!b) continue;
      sum += b * ((l - r - s) % 2 ? -1 : 1) * Math.pow(c, k) * Math.pow(sn, 2 * l - k);
    }
    var n = Math.sqrt(fact(l + m) * fact(l - m) * (2 * l + 1) / (4 * Math.PI * fact(l + s) * fact(l - s)));
    return (m % 2 ? -1 : 1) * n * sum;
  }

  var ytab = {};
  function ytable(l, m) {
    var key = l + ',' + m;
    if (!ytab[key]) {
      var a = new Float32Array(NT);
      for (var j = 0; j < NT; j++) a[j] = sylm(-2, l, m, Math.PI * j / (NT - 1));
      ytab[key] = a;
    }
    return ytab[key];
  }

  // ---- the table ----------------------------------------------------------

  function omega(l, k) { return (k + 1) * man.dx * man.wqnm[l]; }
  function letter(p) { return p > 0 ? 'e' : 'o'; }

  // where the chosen channel lives in the table; null if it is not there
  function channel() {
    var a = state.l1, b = state.l2, p1 = letter(state.p1), p2 = letter(state.p2), pp = letter(state.pp);
    var swap = (p1 === 'o' && p2 === 'e') || (p1 === p2 && a > b);
    var sec = swap ? p2 + p1 + pp : p1 + p2 + pp;
    var la = swap ? b : a, lb = swap ? a : b;
    var list = man.sectors[sec] || [], idx = -1;
    for (var j = 0; j < list.length; j++) {
      if (list[j][0] === la && list[j][1] === lb && list[j][2] === state.lp) { idx = j; break; }
    }
    if (idx < 0) return null;
    return { sec: sec, idx: idx, swap: swap,
             sign: swap && (a + b + state.lp) % 2 ? -1 : 1 };
  }

  function loadSector(sec, then) {
    if (bins[sec]) return then();
    if (pending[sec]) { pending[sec].push(then); return; }
    pending[sec] = [then];
    ui.big.textContent = 'reading the table…';
    fetch(DATA + sec + '.bin').then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
      bins[sec] = new Float32Array(buf);
      var cbs = pending[sec]; delete pending[sec];
      cbs.forEach(function (f) { f(); });
    });
  }

  // Qred at grid point (k1, k2) of the chosen channel: [re, im, err] for the chosen norm
  function qred(ch, k1, k2) {
    var n = man.n, a = ch.swap ? k2 : k1, b = ch.swap ? k1 : k2;
    var o = ((ch.idx * n + a) * n + b) * 6 + (state.norm === 'out' ? 3 : 0);
    var d = bins[ch.sec];
    return [ch.sign * d[o], ch.sign * d[o + 1], d[o + 2]];
  }

  // ---- derived state --------------------------------------------------------

  var cur = null;   // everything the views need about the chosen channel
  function mprime() { return state.m1 + state.m2; }

  function allowed(lp) {
    var mp = mprime();
    if (lp < Math.max(2, Math.abs(mp), Math.abs(state.l1 - state.l2)) || lp > state.l1 + state.l2) return false;
    return ((state.l1 + state.l2 + lp) % 2 ? -1 : 1) === state.p1 * state.p2 * state.pp;
  }

  function pickLp() {
    if (allowed(state.lp)) return;
    var best = null;
    for (var lp = 2; lp <= 6; lp++) {
      if (allowed(lp) && (best === null || Math.abs(lp - state.lp) < Math.abs(best - state.lp))) best = lp;
    }
    if (best !== null) state.lp = best;
  }

  function same() {
    return state.p1 === state.p2 && state.l1 === state.l2 && state.m1 === state.m2;
  }

  function update() {
    pickLp();
    drawLpButtons();
    var ch = allowed(state.lp) ? channel() : null;
    var tj = ch ? w3j(state.l1, state.l2, state.lp, state.m1, state.m2, -mprime()) : 0;
    cur = { ch: ch, tj: tj, ang: (mprime() % 2 ? -1 : 1) * tj };
    syncControls();
    if (!ch) { cur.grid = null; render(); return; }
    loadSector(ch.sec, function () {
      if (cur.ch !== ch) return;
      var n = man.n, re = new Float64Array(n * n), im = new Float64Array(n * n), bad = new Uint8Array(n * n);
      for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) {
        var q = qred(ch, a, b), j = a * n + b;
        re[j] = cur.ang * q[0]; im[j] = cur.ang * q[1];
        bad[j] = q[2] > ERRMAX * Math.hypot(q[0], q[1]) ? 1 : 0;
      }
      cur.grid = { re: re, im: im, bad: bad };
      render();
    });
  }

  function value() {
    // Q at the chosen point, with the identical-parent factor
    if (!cur.ch || !cur.grid) return null;
    var q = qred(cur.ch, state.k1, state.k2);
    var s = same() && state.k1 === state.k2 ? 0.5 : 1;
    return { re: s * cur.ang * q[0], im: s * cur.ang * q[1], err: Math.abs(s * cur.ang) * q[2],
             red: q, s: s };
  }

  // ---- controls ---------------------------------------------------------------

  function fmtw(l, k) {
    return omega(l, k).toFixed(3) + ' (' + ((k + 1) * man.dx).toFixed(2) + ' Re ω)';
  }

  function syncControls() {
    ['1', '2'].forEach(function (w) {
      var l = state['l' + w], m = ui['m' + w];
      m.min = -l; m.max = l;
      if (state['m' + w] > l) state['m' + w] = l;
      if (state['m' + w] < -l) state['m' + w] = -l;
      m.value = state['m' + w];
      ui['l' + w].value = l; ui['k' + w].value = state['k' + w];
      $('qq-l' + w + '-out').textContent = l;
      $('qq-m' + w + '-out').textContent = state['m' + w];
      $('qq-k' + w + '-out').innerHTML = fmtw(l, state['k' + w]).replace(' (', ' <small>(') + '</small>';
    });
    document.querySelectorAll('[data-par]').forEach(function (b) {
      b.classList.toggle('on', +b.dataset.val === state['p' + (b.dataset.par === '3' ? 'p' : b.dataset.par)]);
    });
    document.querySelectorAll('[data-norm]').forEach(function (b) { b.classList.toggle('on', b.dataset.norm === state.norm); });
    document.querySelectorAll('[data-pol]').forEach(function (b) { b.classList.toggle('on', b.dataset.pol === state.pol); });
    var w = omega(state.l1, state.k1) + omega(state.l2, state.k2);
    ui.fixed.innerHTML = '<i>m</i>&prime; = ' + mprime() + ' &nbsp;·&nbsp; &omega;&prime; = ' + w.toFixed(3) +
      ' <small>(' + (w / man.wqnm[Math.min(6, Math.max(2, state.lp))]).toFixed(2) + ' Re ω<sub>&#8467;&prime;0</sub>)</small>';
  }

  function drawLpButtons() {
    var html = '';
    for (var lp = 2; lp <= 6; lp++) {
      var ok = allowed(lp);
      html += '<button type="button" data-lp="' + lp + '"' + (ok ? '' : ' disabled') +
        (lp === state.lp && ok ? ' class="on"' : '') + ' title="' + (ok ? '' : whyNot(lp)) + '">' + lp + '</button>';
    }
    ui.lp.innerHTML = html;
  }
  function whyNot(lp) {
    var mp = mprime();
    if (lp > state.l1 + state.l2 || lp < Math.abs(state.l1 - state.l2)) return 'outside the triangle |ℓ1 − ℓ2| ≤ ℓ′ ≤ ℓ1 + ℓ2';
    if (lp < Math.abs(mp)) return 'needs ℓ′ ≥ |m′|';
    return 'forbidden by parity: σ1σ2σ′ = (−1)^(ℓ1+ℓ2+ℓ′)';
  }

  ['l1', 'm1', 'k1', 'l2', 'm2', 'k2'].forEach(function (k) {
    ui[k].addEventListener('input', function () {
      if (!man) return;
      state[k] = +ui[k].value;
      if (k[0] === 'k') { syncControls(); render(); } else update();
    });
  });
  document.querySelector('.qq-controls').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || b.disabled) return;
    if (b.dataset.par) state[b.dataset.par === '3' ? 'pp' : 'p' + b.dataset.par] = +b.dataset.val;
    else if (b.dataset.lp) state.lp = +b.dataset.lp;
    else if (b.dataset.norm) state.norm = b.dataset.norm;
    else if (b.dataset.pol) { state.pol = b.dataset.pol; sphereDirty = true; }
    else return;
    update();
  });
  ui.play.addEventListener('click', function () {
    state.playing = !state.playing;
    ui.play.textContent = state.playing ? '[pause]' : '[play]';
    if (state.playing) kick();
  });
  ui.play.textContent = state.playing ? '[pause]' : '[play]';

  // ---- readout ----------------------------------------------------------------

  function fnum(x) {
    if (x === 0) return '0';
    var a = Math.abs(x);
    if (a >= 1e-3 && a < 1e3) return x.toPrecision(4).replace('-', '−');
    var e = Math.floor(Math.log10(a)), mnt = x / Math.pow(10, e);
    return mnt.toFixed(3).replace('-', '−') + '×10<sup>' + String(e).replace('-', '−') + '</sup>';
  }
  function fcx(re, im) { return fnum(re) + (im < 0 ? ' − ' : ' + ') + fnum(Math.abs(im)) + '<i>i</i>'; }

  function writeReadout() {
    var Q = state.norm === 'out' ? '𝒬<sub>out</sub>' : '𝒬';
    var rows = [];
    if (!allowed(state.lp)) {
      ui.big.innerHTML = Q + ' = 0 <small>no radiative &#8467;&prime; is allowed for this pair</small>';
      ui.readout.innerHTML = ''; return;
    }
    if (!cur.ch) {
      ui.big.innerHTML = '<small>this channel is not in the table (&#8467; &le; 6)</small>';
      ui.readout.innerHTML = ''; return;
    }
    if (!cur.grid) return;
    var v = value();
    if (cur.tj === 0) {
      ui.big.innerHTML = Q + ' = 0 <small>the 3<i>j</i> symbol vanishes for these <i>m</i></small>';
    } else {
      ui.big.innerHTML = Q + ' = ' + fcx(v.re, v.im);
    }
    var mag = Math.hypot(v.re, v.im), rel = mag ? v.err / mag : 0;
    rows.push(['|' + Q + '|', fnum(mag)]);
    rows.push(['arg', mag ? (Math.atan2(v.im, v.re)).toFixed(3).replace('-', '−') + ' rad' : '—']);
    rows.push(['error', '± ' + fnum(v.err) + (mag ? ' <small>(' + (100 * rel).toPrecision(2) + '%)</small>' : '') +
      (rel > ERRMAX ? ' <small class="qq-warn">not converged</small>' : '')]);
    rows.push(['reduced', fcx(v.red[0], v.red[1])]);
    rows.push(['3<i>j</i>', fnum(cur.tj) + ' <small>· (−1)<sup><i>m</i>&prime;</sup> = ' + (mprime() % 2 ? '−1' : '+1') + '</small>']);
    rows.push(['<i>s</i>', v.s === 1 ? '1' : '½ <small>(identical parents)</small>']);
    ui.readout.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
  }

  // ---- canvases -------------------------------------------------------------

  function fit(cv) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; return true; }
    return false;
  }
  function font(ctx, px, italic) {
    ctx.font = (italic ? 'italic ' : '') + px + 'px ETbb, Georgia, serif';
  }

  // ---- the spheres ------------------------------------------------------------
  // Each pixel of a sphere image knows its (theta, phi) and shading; per mode
  // we cache Y_lm e^{im phi} and Y_l,-m e^{-im phi} there, and a frame only
  // multiplies them by the time phases.

  var sphereDirty = true;
  var SP = { R: 0, px: null, img: [null, null], cache: [null, null], scale: [1, 1] };

  function sphereGeometry(R) {
    var n = 2 * R, el = state.sph.el, az = state.sph.az;
    var ce = Math.cos(el), se = Math.sin(el);
    var th = new Float32Array(n * n), ph = new Float32Array(n * n), sh = new Float32Array(n * n);
    var al = new Float32Array(n * n), front = -1, fz = -2;
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var u = (x + 0.5 - R) / R, v = (R - y - 0.5) / R, r2 = u * u + v * v, j = y * n + x;
      var edge = (1 - Math.sqrt(r2)) * R;
      al[j] = Math.max(0, Math.min(1, edge + 0.5));
      if (r2 >= 1) continue;
      var w = Math.sqrt(1 - r2);
      // screen right (1,0,0), up (0, se, ce), towards viewer (0, -ce, se)
      var X = u, Y = v * se - w * ce, Z = v * ce + w * se;
      th[j] = Math.acos(Math.max(-1, Math.min(1, Z)));
      ph[j] = Math.atan2(Y, X) + az;
      // light from the upper left, in front
      var lam = Math.max(0, -0.45 * u + 0.45 * v + 0.77 * w);
      sh[j] = 0.55 + 0.45 * lam;
      if (w > fz) { fz = w; front = j; }
    }
    return { n: n, th: th, ph: ph, sh: sh, al: al, front: front };
  }

  // modes: [{l, m, par, w, A:[re,im]}] -> per-pixel cached harmonics
  function sphereCache(modes) {
    var g = SP.px, N = g.n * g.n;
    return modes.map(function (md) {
      var yp = ytable(md.l, md.m), ym = ytable(md.l, -md.m);
      var c = new Float32Array(N * 4), peak = 0;
      for (var j = 0; j < N; j++) {
        if (!g.al[j]) continue;
        var f = g.th[j] / Math.PI * (NT - 1), i0 = Math.min(NT - 2, f | 0), t = f - i0;
        var a = yp[i0] + t * (yp[i0 + 1] - yp[i0]), b = ym[i0] + t * (ym[i0 + 1] - ym[i0]);
        var cp = Math.cos(md.m * g.ph[j]), sp = Math.sin(md.m * g.ph[j]);
        c[4 * j] = a * cp; c[4 * j + 1] = a * sp;          // Y_lm e^{im phi}
        c[4 * j + 2] = b * cp; c[4 * j + 3] = -b * sp;     // Y_l,-m e^{-im phi}
        var p = Math.abs(a) + Math.abs(b);
        if (p > peak) peak = p;
      }
      return { md: md, c: c, peak: peak };
    });
  }

  // h_+ - i h_x at pixel j and time t, summed over the cached modes
  function field(cache, j, t, out) {
    var hr = 0, hi = 0;
    for (var q = 0; q < cache.length; q++) {
      var md = cache[q].md, c = cache[q].c, Ar = md.A[0], Ai = md.A[1];
      var cw = Math.cos(md.w * t), sw = Math.sin(md.w * t);
      // A e^{-iwt}
      var er = Ar * cw + Ai * sw, ei = Ai * cw - Ar * sw;
      var sg = md.m % 2 ? -1 : 1;
      // A e^{-iwt} Y+  +  (-1)^m conj(A e^{-iwt}) Y-
      var zr = er * c[4 * j] - ei * c[4 * j + 1] + sg * (er * c[4 * j + 2] + ei * c[4 * j + 3]);
      var zi = er * c[4 * j + 1] + ei * c[4 * j] + sg * (er * c[4 * j + 3] - ei * c[4 * j + 2]);
      if (md.par < 0) { var tr = zr; zr = zi; zi = -tr; }   // times -i
      hr += zr; hi += zi;
    }
    out[0] = hr; out[1] = hi;
  }

  function sphereModes() {
    var w1 = omega(state.l1, state.k1), w2 = omega(state.l2, state.k2);
    var left = [{ l: state.l1, m: state.m1, par: state.p1, w: w1, A: [1, 0] },
                { l: state.l2, m: state.m2, par: state.p2, w: w2, A: [1, 0] }];
    var right = [];
    if (cur && cur.ch && cur.grid && allowed(state.lp)) {
      // the animation always uses the in-normalised Q (unit incoming parents)
      var keep = state.norm; state.norm = 'in';
      var v = value(); state.norm = keep;
      if (v && (v.re || v.im)) right.push({ l: state.lp, m: mprime(), par: state.pp, w: w1 + w2, A: [v.re, v.im] });
    }
    return [left, right];
  }

  function rebuildSpheres(R) {
    var geom = SP.R !== R || !SP.px || sphereDirty === 'geom';
    if (geom) { SP.R = R; SP.px = sphereGeometry(R); }
    var ms = sphereModes();
    var key = JSON.stringify(ms) + state.pol;
    if (!geom && SP.key === key && sphereDirty !== true) return;
    SP.key = key;
    for (var s = 0; s < 2; s++) {
      SP.cache[s] = sphereCache(ms[s]);
      var bound = 0;
      SP.cache[s].forEach(function (c) { bound += c.peak * Math.hypot(c.md.A[0], c.md.A[1]); });
      SP.scale[s] = bound ? 1 / bound : 0;
      SP.img[s] = SP.img[s] && SP.img[s].width === 2 * R ? SP.img[s] : new ImageData(2 * R, 2 * R);
    }
    sphereDirty = false;
  }

  var tmp = [0, 0];
  function paintSphere(s, t) {
    var g = SP.px, img = SP.img[s], d = img.data, cache = SP.cache[s], k = SP.scale[s] * 1.6;
    var base = col.panelR, pos = col.accentR, neg = col['accent-2R'];
    var cross = state.pol === 'cross';
    for (var j = 0, N = g.n * g.n; j < N; j++) {
      var a = g.al[j], o = 4 * j;
      if (!a) { d[o + 3] = 0; continue; }
      var v = 0;
      if (cache.length) { field(cache, j, t, tmp); v = (cross ? -tmp[1] : tmp[0]) * k; }
      v = Math.max(-1, Math.min(1, v));
      var tc = v >= 0 ? pos : neg, f = Math.pow(Math.abs(v), 0.75), sh = g.sh[j];
      d[o] = (base[0] + f * (tc[0] - base[0])) * sh;
      d[o + 1] = (base[1] + f * (tc[1] - base[1])) * sh;
      d[o + 2] = (base[2] + f * (tc[2] - base[2])) * sh;
      d[o + 3] = 255 * a;
    }
    return img;
  }

  var off = [document.createElement('canvas'), document.createElement('canvas')];

  // ---- the stage ----------------------------------------------------------------

  var traces = [[], []];   // strain at the front point, for the strips

  function drawStage() {
    var cv = ui.stage;
    fit(cv);
    var W = cv.width, H = cv.height, ctx = cv.getContext('2d');
    var dpr = W / cv.clientWidth;
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H * 0.42;
    var R = Math.max(20, Math.round(Math.min(W * 0.13, H * 0.3)));
    var sx = [W * 0.15, W * 0.85];
    var ppm = (sx[1] - cx) / DIST;              // pixels per M
    rebuildSpheres(Math.min(R, 170));
    var t = state.t;
    var w1 = omega(state.l1, state.k1), w2 = omega(state.l2, state.k2), wp = w1 + w2;
    var right = SP.cache[1].length ? SP.cache[1][0].md : null;

    // wavefronts: crests of e^{-iw(t + r)} coming in, e^{-iw'(t - r)} + arg Q going out
    ctx.lineCap = 'round';
    function crests(w, phase0, sgn, side, ink, alpha) {
      var r0 = RSH * 1.25, r1 = DIST - R / ppm - 2, lam = 2 * Math.PI / w;
      // crest radii: w (t + sgn r) + phase0 = 2 pi k  (sgn = +1 in, -1 out)
      var base = (phase0 + w * t) / w;    // r = sgn (2 pi k / w - base)
      var kmin = Math.floor((sgn * r0 + base) / lam) - 1, kmax = Math.ceil((sgn * r1 + base) / lam) + 1;
      if (kmin > kmax) { var tt = kmin; kmin = kmax; kmax = tt; }
      ctx.strokeStyle = ink;
      for (var k = kmin; k <= kmax; k++) {
        var r = sgn * (k * lam - base);
        if (r < r0 || r > r1) continue;
        var fade = Math.min(1, (r - r0) / 6, (r1 - r) / 6);
        ctx.globalAlpha = alpha * Math.max(0, fade);
        var spread = 0.55 * Math.min(1, (r / DIST) * 1.6 + 0.2);
        var a0 = side < 0 ? Math.PI - spread : -spread, a1 = side < 0 ? Math.PI + spread : spread;
        ctx.beginPath(); ctx.arc(cx, cy, r * ppm, a0, a1); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.lineWidth = 1.4 * dpr;
    crests(w1, 0, 1, -1, col.accent, 0.8);
    ctx.setLineDash([4 * dpr, 4 * dpr]);
    crests(w2, 0, 1, -1, col['accent-2'], 0.8);
    ctx.setLineDash([]);
    if (right) {
      ctx.lineWidth = 1.8 * dpr;
      crests(wp, -Math.atan2(right.A[1], right.A[0]), -1, 1, col.accent, 0.9);
    }

    // the hole: shadow, and a faint photon ring
    var rs = RSH * ppm;
    var glow = ctx.createRadialGradient(cx, cy, rs * 0.9, cx, cy, rs * 1.9);
    glow.addColorStop(0, 'rgba(' + col.accentR.join(',') + ',0.35)');
    glow.addColorStop(1, 'rgba(' + col.accentR.join(',') + ',0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, rs * 1.9, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = 'rgb(' + col.holeR.join(',') + ')';
    ctx.beginPath(); ctx.arc(cx, cy, rs, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = col.accent; ctx.globalAlpha = 0.6; ctx.lineWidth = 1 * dpr;
    ctx.beginPath(); ctx.arc(cx, cy, rs * 1.04, 0, 2 * Math.PI); ctx.stroke();
    ctx.globalAlpha = 1;

    // the spheres
    for (var s = 0; s < 2; s++) {
      var img = paintSphere(s, t), o = off[s];
      if (o.width !== img.width) { o.width = img.width; o.height = img.height; }
      o.getContext('2d').putImageData(img, 0, 0);
      ctx.drawImage(o, sx[s] - R, cy - R, 2 * R, 2 * R);
    }

    // labels
    ctx.fillStyle = col.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    font(ctx, Math.round(13 * dpr), true);
    var sig = function (p) { return p > 0 ? '+' : '−'; };
    ctx.fillText('(' + state.l1 + ', ' + state.m1 + ', ' + sig(state.p1) + ')  ⊗  (' +
      state.l2 + ', ' + state.m2 + ', ' + sig(state.p2) + ')', sx[0], cy + R + 6 * dpr);
    ctx.fillText(right ? '(' + state.lp + ', ' + mprime() + ', ' + sig(state.pp) + ')' : 'nothing scattered',
      sx[1], cy + R + 6 * dpr);
    font(ctx, Math.round(12 * dpr), false);
    ctx.fillText('in', sx[0], cy - R - 18 * dpr);
    ctx.fillText('out', sx[1], cy - R - 18 * dpr);

    // strain at the front point, over the last few periods
    var top = cy + R + 26 * dpr, h = H - top - 6 * dpr, half = Math.min(R * 1.25, W * 0.14);
    if (h > 12 * dpr) {
      var span = 4 * 2 * Math.PI / Math.min(w1, w2);
      for (s = 0; s < 2; s++) {
        var c = SP.cache[s];
        ctx.strokeStyle = col.hair; ctx.lineWidth = 1 * dpr;
        ctx.beginPath(); ctx.moveTo(sx[s] - half, top + h / 2); ctx.lineTo(sx[s] + half, top + h / 2); ctx.stroke();
        if (!c.length) continue;
        // each trace is scaled to the largest value its harmonics can reach there
        var jf = SP.px.front, npts = 160, k = 0;
        c.forEach(function (cc) {
          var o4 = 4 * jf;
          k += Math.hypot(cc.md.A[0], cc.md.A[1]) * (Math.hypot(cc.c[o4], cc.c[o4 + 1]) + Math.hypot(cc.c[o4 + 2], cc.c[o4 + 3]));
        });
        k = k ? 1 / k : 0;
        ctx.strokeStyle = s ? col.accent : col.ink; ctx.lineWidth = 1.3 * dpr;
        ctx.beginPath();
        for (var p = 0; p <= npts; p++) {
          var tp = t - span + span * p / npts;
          field(c, jf, tp, tmp);
          var vv = (state.pol === 'cross' ? -tmp[1] : tmp[0]) * k;
          var X = sx[s] - half + 2 * half * p / npts, Y = top + h / 2 - 0.9 * vv * h / 2;
          if (p) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
        }
        ctx.stroke();
      }
    }
  }

  // drag on the stage turns both spheres
  (function () {
    var drag = null;
    ui.stage.addEventListener('pointerdown', function (e) {
      drag = { x: e.clientX, y: e.clientY, az: state.sph.az, el: state.sph.el };
      ui.stage.setPointerCapture(e.pointerId);
    });
    ui.stage.addEventListener('pointermove', function (e) {
      if (!drag) return;
      state.sph.az = drag.az - (e.clientX - drag.x) * 0.01;
      state.sph.el = Math.max(-1.3, Math.min(1.3, drag.el + (e.clientY - drag.y) * 0.01));
      sphereDirty = 'geom'; kick();
    });
    ui.stage.addEventListener('pointerup', function () { drag = null; });
    ui.stage.addEventListener('pointercancel', function () { drag = null; });
  })();

  // ---- the surfaces ---------------------------------------------------------------

  var surfDirty = true;
  var proj = {};    // per canvas: projected vertices, for picking

  function unwrapPhase(re, im, n) {
    var a = new Float64Array(n * n), i, j;
    for (i = 0; i < n * n; i++) a[i] = Math.atan2(im[i], re[i]);
    function fix(prev, x) { while (x - prev > Math.PI) x -= 2 * Math.PI; while (x - prev < -Math.PI) x += 2 * Math.PI; return x; }
    for (i = 1; i < n; i++) a[i * n] = fix(a[(i - 1) * n], a[i * n]);
    for (i = 0; i < n; i++) for (j = 1; j < n; j++) a[i * n + j] = fix(a[i * n + j - 1], a[i * n + j]);
    var mean = 0;
    for (i = 0; i < n * n; i++) mean += a[i];
    var shift = 2 * Math.PI * Math.round(mean / (n * n) / (2 * Math.PI));
    for (i = 0; i < n * n; i++) a[i] -= shift;
    return a;
  }

  function niceTicks(lo, hi, want) {
    var step = Math.pow(10, Math.floor(Math.log10((hi - lo) / want)));
    [1, 2, 5, 10].some(function (f) { if ((hi - lo) / (step * f) <= want) { step *= f; return true; } return false; });
    var out = [];
    for (var v = Math.ceil(lo / step) * step; v <= hi + 1e-12; v += step) out.push(+v.toPrecision(6));
    return out;
  }

  function drawSurface(cv, Z, label, fmtZ) {
    fit(cv);
    var W = cv.width, H = cv.height, ctx = cv.getContext('2d'), dpr = W / cv.clientWidth;
    ctx.clearRect(0, 0, W, H);
    var n = man.n;
    if (!Z) {
      ctx.fillStyle = col.muted; font(ctx, Math.round(14 * dpr), true);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(cur && cur.ch && !cur.grid ? 'reading the table…' : 'no data for this channel', W / 2, H / 2);
      proj[cv.id] = null; return;
    }
    var bad = cur.grid.bad;
    var zmin = Infinity, zmax = -Infinity, i, j;
    for (i = 0; i < n * n; i++) { if (Z[i] < zmin) zmin = Z[i]; if (Z[i] > zmax) zmax = Z[i]; }
    if (label === 'abs') zmin = 0;
    if (zmax - zmin < 1e-30) zmax = zmin + 1;
    var w1 = function (k) { return omega(state.l1, k); }, w2 = function (k) { return omega(state.l2, k); };
    var X0 = w1(0), X1 = w1(n - 1), Y0 = w2(0), Y1 = w2(n - 1);
    var az = state.surf.az, el = state.surf.el, ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(el), se = Math.sin(el);
    // world box [-1,1]^2 x [0, 1.1]; orthographic view
    function P(x, y, z) {
      var xr = ca * x - sa * y, yr = sa * x + ca * y;
      return [xr, -(z * ce + yr * se), yr * ce - z * se];   // screen x, screen y (down), depth (towards viewer is smaller)
    }
    var corners = [], k;
    [-1, 1].forEach(function (x) { [-1, 1].forEach(function (y) { [0, 1.1].forEach(function (z) { corners.push(P(x, y, z)); }); }); });
    var mx = Infinity, Mx = -Infinity, my = Infinity, My = -Infinity;
    corners.forEach(function (c) { mx = Math.min(mx, c[0]); Mx = Math.max(Mx, c[0]); my = Math.min(my, c[1]); My = Math.max(My, c[1]); });
    var pad = 34 * dpr, sc = Math.min((W - 2 * pad) / (Mx - mx), (H - 2 * pad) / (My - my));
    var ox = W / 2 - sc * (mx + Mx) / 2, oy = H / 2 - sc * (my + My) / 2;
    function S(x, y, z) { var p = P(x, y, z); return [ox + sc * p[0], oy + sc * p[1], p[2]]; }
    var gx = function (a) { return -1 + 2 * a / (n - 1); };
    var hz = function (v) { return 1.1 * (v - zmin) / (zmax - zmin); };

    // floor and back walls: the three planes facing away from the viewer
    ctx.strokeStyle = col.hair; ctx.lineWidth = 1 * dpr;
    var xb = P(1, 0, 0)[2] > P(-1, 0, 0)[2] ? 1 : -1, yb = P(0, 1, 0)[2] > P(0, -1, 0)[2] ? 1 : -1;
    function line(a, b) { var p = S(a[0], a[1], a[2]), q = S(b[0], b[1], b[2]); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    line([-1, -1, 0], [1, -1, 0]); line([1, -1, 0], [1, 1, 0]); line([1, 1, 0], [-1, 1, 0]); line([-1, 1, 0], [-1, -1, 0]);
    line([xb, yb, 0], [xb, yb, 1.1]); line([xb, -yb, 0], [xb, -yb, 1.1]); line([-xb, yb, 0], [-xb, yb, 1.1]);
    line([xb, -yb, 1.1], [xb, yb, 1.1]); line([-xb, yb, 1.1], [xb, yb, 1.1]);

    // ticks
    ctx.fillStyle = col.muted; font(ctx, Math.round(11 * dpr), false);
    var ztk = niceTicks(zmin, zmax, 4);
    ztk.forEach(function (v) {
      var z = hz(v); if (z < 0 || z > 1.1) return;
      ctx.globalAlpha = 0.5; line([xb, -yb, z], [xb, yb, z]); line([-xb, yb, z], [xb, yb, z]); ctx.globalAlpha = 1;
      var p = S(-xb, yb, z); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(fmtZ(v), p[0] - 4 * dpr, p[1]);
    });
    var yEdge = -yb, xEdge = -xb;
    niceTicks(X0, X1, 4).forEach(function (v) {
      var x = -1 + 2 * (v - X0) / (X1 - X0), p = S(x, yEdge * 1.12, 0);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(v.toFixed(2), p[0], p[1]);
    });
    niceTicks(Y0, Y1, 4).forEach(function (v) {
      var y = -1 + 2 * (v - Y0) / (Y1 - Y0), p = S(xEdge * 1.12, y, 0);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(v.toFixed(2), p[0], p[1]);
    });
    font(ctx, Math.round(12 * dpr), true);
    var pl = S(0, yEdge * 1.32, 0); ctx.fillText('Mω₁', pl[0], pl[1]);
    pl = S(xEdge * 1.32, 0, 0); ctx.fillText('Mω₂', pl[0], pl[1]);

    // the surface, back to front
    var V = new Array(n * n);
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) V[i * n + j] = S(gx(i), gx(j), hz(Z[i * n + j]));
    proj[cv.id] = V;
    var quads = [];
    for (i = 0; i < n - 1; i++) for (j = 0; j < n - 1; j++) {
      var a0 = i * n + j, a1 = a0 + n, a2 = a1 + 1, a3 = a0 + 1;
      quads.push([a0, a1, a2, a3, (V[a0][2] + V[a1][2] + V[a2][2] + V[a3][2]) / 4]);
    }
    quads.sort(function (p, q) { return q[4] - p[4]; });
    var lo = col.panelR, hi = col.accentR, hiB = col['accent-2R'];
    ctx.lineWidth = 0.6 * dpr; ctx.lineJoin = 'round';
    quads.forEach(function (qd) {
      var zq = (Z[qd[0]] + Z[qd[1]] + Z[qd[2]] + Z[qd[3]]) / 4, f = (zq - zmin) / (zmax - zmin);
      var isBad = bad[qd[0]] || bad[qd[1]] || bad[qd[2]] || bad[qd[3]];
      var c;
      if (isBad) c = col.hairR;
      else if (label === 'abs') c = [0, 1, 2].map(function (m) { return Math.round(lo[m] + f * (hi[m] - lo[m])); });
      else c = [0, 1, 2].map(function (m) { return Math.round(f < 0.5 ? hiB[m] + 2 * f * (lo[m] - hiB[m]) : lo[m] + (2 * f - 1) * (hi[m] - lo[m])); });
      ctx.fillStyle = 'rgb(' + c.join(',') + ')';
      ctx.strokeStyle = col.dark ? 'rgba(0,0,0,0.35)' : 'rgba(36,28,20,0.22)';
      ctx.beginPath();
      ctx.moveTo(V[qd[0]][0], V[qd[0]][1]); ctx.lineTo(V[qd[1]][0], V[qd[1]][1]);
      ctx.lineTo(V[qd[2]][0], V[qd[2]][1]); ctx.lineTo(V[qd[3]][0], V[qd[3]][1]); ctx.closePath();
      ctx.fill(); ctx.stroke();
    });

    // resonance w1 + w2 = Re w_l'0, drawn on the surface
    var wr = man.wqnm[state.lp];
    function zAt(fa, fb) {      // bilinear in grid units
      var a = Math.min(n - 2, Math.floor(fa)), b = Math.min(n - 2, Math.floor(fb)), u = fa - a, v = fb - b;
      return (1 - u) * (1 - v) * Z[a * n + b] + u * (1 - v) * Z[(a + 1) * n + b] +
             (1 - u) * v * Z[a * n + b + 1] + u * v * Z[(a + 1) * n + b + 1];
    }
    ctx.strokeStyle = col.ink; ctx.setLineDash([5 * dpr, 4 * dpr]); ctx.lineWidth = 1.4 * dpr;
    ctx.beginPath();
    var started = false;
    for (i = 0; i <= 120; i++) {
      var a = X0 + (X1 - X0) * i / 120, b = wr - a;
      if (b < Y0 || b > Y1) { started = false; continue; }
      var fa = (n - 1) * (a - X0) / (X1 - X0), fb = (n - 1) * (b - Y0) / (Y1 - Y0);
      var q = S(gx(fa), gx(fb), hz(zAt(fa, fb)));
      if (started) ctx.lineTo(q[0], q[1]); else { ctx.moveTo(q[0], q[1]); started = true; }
    }
    ctx.stroke(); ctx.setLineDash([]);

    // the chosen point
    var jc = state.k1 * n + state.k2, top = V[jc], foot = S(gx(state.k1), gx(state.k2), 0);
    ctx.strokeStyle = col.ink; ctx.setLineDash([2 * dpr, 3 * dpr]); ctx.lineWidth = 1 * dpr;
    ctx.beginPath(); ctx.moveTo(foot[0], foot[1]); ctx.lineTo(top[0], top[1]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = col.ink; ctx.strokeStyle = col.bg; ctx.lineWidth = 2 * dpr;
    ctx.beginPath(); ctx.arc(top[0], top[1], 4.5 * dpr, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
  }

  function drawSurfaces() {
    var Za = null, Zp = null, n = man.n;
    if (cur && cur.grid) {
      Za = new Float64Array(n * n);
      for (var i = 0; i < n * n; i++) Za[i] = Math.hypot(cur.grid.re[i], cur.grid.im[i]);
      Zp = unwrapPhase(cur.grid.re, cur.grid.im, n);
    }
    var fa = function (v) { return v === 0 ? '0' : Math.abs(v) < 1e-2 || Math.abs(v) >= 1e3 ? v.toExponential(0) : String(+v.toPrecision(3)); };
    drawSurface(ui.sabs, Za, 'abs', fa);
    drawSurface(ui.sarg, Zp, 'arg', function (v) { return String(+v.toFixed(1)).replace('-', '−'); });
    surfDirty = false;
  }

  [ui.sabs, ui.sarg].forEach(function (cv) {
    var drag = null;
    cv.addEventListener('pointerdown', function (e) {
      drag = { x: e.clientX, y: e.clientY, az: state.surf.az, el: state.surf.el, moved: false };
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      if (!drag.moved) return;
      state.surf.az = drag.az + dx * 0.01;
      state.surf.el = Math.max(0.05, Math.min(1.5, drag.el + dy * 0.01));
      drawSurfaces();
    });
    cv.addEventListener('pointerup', function (e) {
      var d = drag; drag = null;
      if (!d || d.moved || !proj[cv.id]) return;
      var r = cv.getBoundingClientRect(), dpr = cv.width / r.width;
      var px = (e.clientX - r.left) * dpr, py = (e.clientY - r.top) * dpr, best = -1, bd = Infinity;
      proj[cv.id].forEach(function (v, j) {
        var dd = (v[0] - px) * (v[0] - px) + (v[1] - py) * (v[1] - py);
        if (dd < bd) { bd = dd; best = j; }
      });
      if (best < 0 || bd > Math.pow(30 * dpr, 2)) return;
      state.k1 = Math.floor(best / man.n); state.k2 = best % man.n;
      syncControls(); render();
    });
    cv.addEventListener('pointercancel', function () { drag = null; });
  });

  // ---- the loop -------------------------------------------------------------------

  function render() {
    writeReadout();
    if (!sphereDirty) sphereDirty = true;
    surfDirty = true;
    kick();
  }

  var raf = 0, last = 0, visible = true;
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    if (state.playing && last) state.t += Math.min(0.1, (now - last) / 1000) * SPEED;
    last = state.playing ? now : 0;
    if (surfDirty) drawSurfaces();
    drawStage();
    ui.time.textContent = 't = ' + state.t.toFixed(0) + 'M';
    if (state.playing && visible) kick();
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) { last = 0; kick(); }
    }).observe(ui.stage);
  }
  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { surfDirty = true; sphereDirty = 'geom'; kick(); }, 100);
  });

  // ---- start ------------------------------------------------------------------------

  fetch(DATA + 'index.json').then(function (r) { return r.json(); }).then(function (m) {
    man = m;
    var wq = {};
    Object.keys(m.wqnm).forEach(function (l) { wq[+l] = m.wqnm[l]; });
    man.wqnm = wq;
    update();
  }).catch(function () {
    ui.big.textContent = 'The table could not be loaded.';
  });

  window.QQ = { w3j: w3j, sylm: sylm };   // for the console and tests
})();
