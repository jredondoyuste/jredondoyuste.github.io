// Decomposing h^(1). Left two thirds: the outgoing ringdown around the
// remnant, seen from above, looping from t_mg. Right third: the waveform an
// observer records, with t_mg marked and a cursor at the loop's time.
//
//   step 0   one panel, all harmonics laid over one another; the signal
//   step 1   the panel splits into l = m = 2, 3, 4, each in its colour; on
//            the right, each harmonic's contribution under the signal
//   step 2   each harmonic splits into overtones n = 0, 1, 2, …
//
// The harmonics are the binary slide's waveform (binary.js); the overtone
// frequencies are solved live (/js/kerr-qnm.js) for the same remnant. The
// overtone panels are illustration only: each is one damped mode, scaled to
// its own peak, not a fit to the harmonic.
(function () {
  'use strict';
  if (!window.BinaryScene) return;
  var WV = BinaryScene.wave;

  var REL = [1, 0.4, 0.25];   // weights of 22, 33, 44 in the observed signal (illustrative)
  var NOT = 3;                // overtones drawn per harmonic: n = 0 … NOT-1
  var R_WORLD = 60;           // M from a panel's centre to its edge
  var LOOP = [-4, 70];        // the loop's clock, M (t_mg = 0)
  var SPEED = 18;             // M per second
  var HOLD = 0.8;             // s held at the end of each loop
  var TW = [-25, 80];         // the waveform's time window, M
  var CELL = 2, SAT = 4;      // field resolution (px per value) and saturation, as on the binary slide
  var TWEEN = 900;            // ms for panels to move between layouts
  var SHADE = [0, 0.38, 0.62];  // how far overtone n's colour is mixed toward the paper

  var slide = document.getElementById('modes');
  var field = slide.querySelector('.md-field');
  var front = slide.querySelector('.md-front');
  var GW = 1280 / CELL, GH = 1080 / CELL;
  field.width = GW; field.height = GH;
  front.width = 1920; front.height = 1080;
  var fctx = field.getContext('2d'), ctx = front.getContext('2d');
  var img = fctx.createImageData(GW, GH);

  // overtone frequencies of each harmonic, in units of the initial mass
  WV.modes.forEach(function (md) {
    md.ot = [];
    for (var n = 0; n < NOT; n++) {
      var w = KerrQNM.mode(-2, md.l, md.m, n, WV.AF).omega;
      md.ot.push({ wr: w[0] / WV.MF, wi: -w[1] / WV.MF });
    }
  });

  // Each harmonic's overtone amplitudes: a linear least-squares fit of
  // sum_n A_n e^(-i w_n t) to the harmonic over t in FIT (frequencies fixed
  // by GR, amplitudes free), so the shaded curves on the right add up to it.
  var FIT = [0, 60];          // M after t_mg
  function cmul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
  function cdiv(a, b) { var d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }
  function basis(q, t) { var e = Math.exp(-q.wi * t); return [e * Math.cos(q.wr * t), -e * Math.sin(q.wr * t)]; }
  WV.modes.forEach(function (md, i) {
    var G = [], r = [], j, k, t;
    for (j = 0; j < NOT; j++) { G.push([]); r.push([0, 0]); for (k = 0; k < NOT; k++) G[j].push([0, 0]); }
    for (t = FIT[0]; t <= FIT[1]; t += 0.5) {
      var L = WV.at(i, t), y = [L.a * Math.cos(L.ph), -L.a * Math.sin(L.ph)];   // a e^(-i ph)
      var b = md.ot.map(function (q) { return basis(q, t); });
      for (j = 0; j < NOT; j++) {
        var cj = [b[j][0], -b[j][1]];
        for (k = 0; k < NOT; k++) { var p = cmul(cj, b[k]); G[j][k][0] += p[0]; G[j][k][1] += p[1]; }
        var q2 = cmul(cj, y); r[j][0] += q2[0]; r[j][1] += q2[1];
      }
    }
    for (j = 0; j < NOT; j++) {                       // Gaussian elimination, NOT x NOT
      for (k = j + 1; k < NOT; k++) {
        var f = cdiv(G[k][j], G[j][j]);
        for (var c = j; c < NOT; c++) { var s = cmul(f, G[j][c]); G[k][c][0] -= s[0]; G[k][c][1] -= s[1]; }
        var s2 = cmul(f, r[j]); r[k][0] -= s2[0]; r[k][1] -= s2[1];
      }
    }
    md.fit = [];
    for (j = NOT - 1; j >= 0; j--) {
      var acc = r[j].slice();
      for (k = j + 1; k < NOT; k++) { var s3 = cmul(G[j][k], md.fit[k]); acc[0] -= s3[0]; acc[1] -= s3[1]; }
      md.fit[j] = cdiv(acc, G[j][j]);
    }
  });
  // overtone n of harmonic i, as it enters the signal
  function otContrib(i, n, t) {
    var A = WV.modes[i].fit[n], b = basis(WV.modes[i].ot[n], t);
    return REL[i] * (A[0] * b[0] - A[1] * b[1]);
  }

  function smooth(a, b, x) {
    var u = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return u * u * (3 - 2 * u);
  }

  // ---- what each panel shows, at a point (r in M, phi) and time t --------
  // ringdown only: the field is switched on for retarded times after t_mg
  function harm(i, r, phi, t) {
    var tr = t - r, L = WV.at(i, tr);
    return L.a * Math.cos(WV.modes[i].m * phi - L.ph) * smooth(-3, 2, tr);
  }
  function overtone(i, n, r, phi, t) {
    var tr = t - r, q = WV.modes[i].ot[n];
    if (tr < -2) return 0;
    var trc = Math.max(tr, 0);
    return Math.exp(-q.wi * trc) * Math.cos(WV.modes[i].m * phi - q.wr * trc + 1.3 * n) * smooth(-2, 1, tr);
  }

  // ---- layouts: where every panel, sign and plot row sits at each step ---
  // Panels: x, y, R (px), a (opacity). Rows (right): y and s (px per unit).
  var ROWS_Y = [385, 618, 851];
  function layout(step) {
    var L = {};
    L.sum = step === 0 ? { x: 640, y: 590, R: 320, a: 1 } : { x: 640, y: 590, R: 320, a: 0 };
    for (var i = 0; i < 3; i++) {
      if (step === 0) L['h' + i] = { x: 640, y: 590, R: 320, a: 0 };
      else if (step === 1) L['h' + i] = { x: [220, 640, 1060][i], y: 590, R: 175, a: 1 };
      else L['h' + i] = { x: 160, y: ROWS_Y[i], R: 86, a: 1 };
      for (var n = 0; n < NOT; n++) {
        L['o' + i + n] = step < 2 ? { x: L['h' + i].x, y: L['h' + i].y, R: L['h' + i].R, a: 0 }
                                  : { x: [430, 690, 950][n], y: ROWS_Y[i], R: 86, a: 1 };
      }
    }
    // the signs between panels
    L.p1 = { x: 430, y: 590, R: 0, a: step === 1 ? 1 : 0 };
    L.p2 = { x: 850, y: 590, R: 0, a: step === 1 ? 1 : 0 };
    for (i = 0; i < 3; i++) {
      [295, 560, 820, 1100].forEach(function (x, k) {
        L['s' + i + k] = { x: x, y: ROWS_Y[i], R: 0, a: step === 2 ? 1 : 0 };
      });
    }
    // the waveform rows: the signal, then one per harmonic
    L.rx = step === 0 ? { y: 590, R: 150, a: 1 } : { y: 300, R: 72, a: 1 };
    for (i = 0; i < 3; i++) {
      L['r' + i] = step === 0 ? { y: 590, R: 72, a: 0 } : { y: [500, 680, 860][i], R: 72, a: 1 };
    }
    return L;
  }

  var cur = layout(0), from = cur, to = cur, t0 = 0;
  function relayout(step, instant) {
    from = snapshot(performance.now());
    to = layout(step);
    t0 = instant ? -1e9 : performance.now();
  }
  function snapshot(now) {
    var u = Math.min(1, (now - t0) / TWEEN), e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    var S = {};
    Object.keys(to).forEach(function (k) {
      var a = from[k] || to[k], b = to[k];
      S[k] = { x: a.x + e * (b.x - a.x), y: a.y + e * (b.y - a.y), R: a.R + e * (b.R - a.R), a: a.a + e * (b.a - a.a) };
    });
    return S;
  }

  // ---- colours ------------------------------------------------------------
  var C = {};
  function rgb(css) {
    ctx.fillStyle = css; var h = ctx.fillStyle;
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  }
  function readColours() {
    var cs = getComputedStyle(slide);
    C.css = ['--m22', '--m33', '--m44'].map(function (k) { return cs.getPropertyValue(k).trim(); });
    C.rgb = C.css.map(rgb);
    // overtones: the harmonic's colour, paler with n (mixed toward the paper)
    var bg = rgb(cs.getPropertyValue('--bg').trim());
    C.shade = C.rgb.map(function (c) {
      return SHADE.map(function (f) {
        return [0, 1, 2].map(function (k) { return Math.round(c[k] + f * (bg[k] - c[k])); });
      });
    });
    C.shadeCss = C.shade.map(function (row) {
      return row.map(function (c) { return 'rgb(' + c.join(',') + ')'; });
    });
    C.ink = cs.getPropertyValue('--ink').trim();
    C.muted = cs.getPropertyValue('--muted').trim();
    C.hair = cs.getPropertyValue('--hair').trim();
    C.accent = cs.getPropertyValue('--accent').trim();
    C.dark = document.documentElement.dataset.theme === 'dark';
    C.hole = C.dark ? 'rgb(13, 9, 8)' : C.ink;   // as on the lab pages
  }

  // ---- the panels (left) --------------------------------------------------
  // layered crests, as on the binary slide: each layer [colour, value] adds
  // its crest over what is below
  function paintPanel(P, layers) {
    if (P.a < 0.01) return;
    var d = img.data, rc = P.R / CELL;
    var gx0 = Math.max(0, Math.floor((P.x - P.R) / CELL)), gx1 = Math.min(GW - 1, Math.ceil((P.x + P.R) / CELL));
    var gy0 = Math.max(0, Math.floor((P.y - P.R) / CELL)), gy1 = Math.min(GH - 1, Math.ceil((P.y + P.R) / CELL));
    for (var gy = gy0; gy <= gy1; gy++) {
      for (var gx = gx0; gx <= gx1; gx++) {
        var dx = (gx + 0.5) - P.x / CELL, dy = (gy + 0.5) - P.y / CELL, rr = Math.hypot(dx, dy);
        if (rr > rc) continue;
        var r = rr / rc * R_WORLD, phi = Math.atan2(-dy, dx), near = smooth(2.5, 7, r);
        var pr = 0, pg = 0, pb = 0, pa = 0;
        for (var q = 0; q < layers.length; q++) {
          var v = layers[q].f(r, phi);
          if (v <= 0) continue;
          var al = 0.92 * Math.tanh(SAT * v * v) * near * P.a * layers[q].k, c = layers[q].c;
          pr = c[0] * al + pr * (1 - al); pg = c[1] * al + pg * (1 - al);
          pb = c[2] * al + pb * (1 - al); pa = al + pa * (1 - al);
        }
        if (pa <= 0) continue;
        var o = 4 * (gy * GW + gx);
        d[o] = pr / pa; d[o + 1] = pg / pa; d[o + 2] = pb / pa; d[o + 3] = 255 * pa;
      }
    }
  }

  function rim(P, label, colour) {
    if (P.a < 0.01) return;
    ctx.globalAlpha = P.a;
    ctx.lineWidth = 1.5; ctx.strokeStyle = C.hair;
    ctx.beginPath(); ctx.arc(P.x, P.y, P.R, 0, 2 * Math.PI); ctx.stroke();
    ctx.fillStyle = C.hole;                           // the remnant, to scale but never invisible
    ctx.beginPath(); ctx.arc(P.x, P.y, Math.max(4, WV.rf / R_WORLD * P.R), 0, 2 * Math.PI); ctx.fill();
    if (label) {
      ctx.fillStyle = colour; ctx.textAlign = 'center';
      ctx.font = (P.R > 120 ? 34 : 26) + 'px ETbb, Georgia, serif';
      ctx.fillText(label, P.x, P.y + P.R + (P.R > 120 ? 46 : 34));
    }
    ctx.globalAlpha = 1;
  }

  function sign(P, text) {
    if (P.a < 0.01) return;
    ctx.globalAlpha = P.a; ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    ctx.font = '56px ETbb, Georgia, serif';
    ctx.fillText(text, P.x, P.y + 18);
    ctx.globalAlpha = 1;
  }

  // ---- the waveform (right) ----------------------------------------------
  var X0 = 1340, X1 = 1840;
  function tx(t) { return X0 + (t - TW[0]) / (TW[1] - TW[0]) * (X1 - X0); }
  function contrib(i, t) { var L = WV.at(i, t); return REL[i] * L.a * Math.cos(L.ph); }
  function signal(t) { return contrib(0, t) + contrib(1, t) + contrib(2, t); }
  BinaryScene.signal = signal;                        // the model slide plots the same one

  function row(P, f, colour, label) {
    if (P.a < 0.01) return;
    ctx.globalAlpha = P.a;
    ctx.lineWidth = 1; ctx.strokeStyle = C.hair;      // zero line
    ctx.beginPath(); ctx.moveTo(X0, P.y); ctx.lineTo(X1, P.y); ctx.stroke();
    // before t_mg in muted, after in the row's colour
    [[TW[0], 0, C.muted], [0, TW[1], colour]].forEach(function (seg) {
      ctx.lineWidth = 3; ctx.strokeStyle = seg[2];
      ctx.beginPath();
      for (var k = 0; k <= 200; k++) {
        var t = seg[0] + (seg[1] - seg[0]) * k / 200, y = P.y - P.R * f(t);
        if (k) ctx.lineTo(tx(t), y); else ctx.moveTo(tx(t), y);
      }
      ctx.stroke();
    });
    ctx.fillStyle = colour; ctx.textAlign = 'left';
    ctx.font = '24px ETbb, Georgia, serif';
    ctx.fillText(label, X0, P.y - P.R * 0.95 - 8);
    ctx.globalAlpha = 1;
  }

  function axes(S, t) {
    var top = S.rx.y - S.rx.R * 1.25, bottom = Math.max(S.rx.y + S.rx.R * 0.9, S.r2.a > 0.01 ? S.r2.y + 70 : 0);
    var x = tx(0);
    ctx.setLineDash([8, 8]); ctx.lineWidth = 1.5; ctx.strokeStyle = C.muted;
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.muted; ctx.textAlign = 'center';
    ctx.font = '28px ETbb, Georgia, serif'; ctx.fillText('t', x - 8, top - 12);
    ctx.font = '19px ETbb, Georgia, serif'; ctx.fillText('mg', x + 14, top - 6);
    if (t >= TW[0] && t <= TW[1]) {                    // where the panels are, in time
      ctx.globalAlpha = 0.7; ctx.lineWidth = 2; ctx.strokeStyle = C.accent;
      ctx.beginPath(); ctx.moveTo(tx(t), top); ctx.lineTo(tx(t), bottom); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.font = '22px ETbb, Georgia, serif';
    ctx.fillText('ringdown →', X1, bottom + 34);
  }

  // ---- the loop -----------------------------------------------------------
  var raf = null, last = 0, t = LOOP[0], held = 0, themeSeen = null, frozen = false;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (frozen) {}
    else if (t < LOOP[1]) t += dt * SPEED;
    else if ((held += dt) > HOLD) { t = LOOP[0]; held = 0; }
    draw(now);
  }

  function draw(now) {
    if (themeSeen !== document.documentElement.dataset.theme) { readColours(); themeSeen = document.documentElement.dataset.theme; }
    var S = snapshot(now);
    img.data.fill(0);

    // all harmonics laid over one another (44 first, so the 22 is on top)
    paintPanel(S.sum, [2, 1, 0].map(function (i) {
      return { c: C.rgb[i], k: 1, f: function (r, phi) { return harm(i, r, phi, t); } };
    }));
    for (var i = 0; i < 3; i++) {
      (function (i) {
        paintPanel(S['h' + i], [{ c: C.rgb[i], k: 1, f: function (r, phi) { return harm(i, r, phi, t); } }]);
        for (var n = 0; n < NOT; n++) (function (n) {
          paintPanel(S['o' + i + n], [{ c: C.shade[i][n], k: 1, f: function (r, phi) { return overtone(i, n, r, phi, t); } }]);
        })(n);
      })(i);
    }
    fctx.putImageData(img, 0, 0);

    ctx.clearRect(0, 0, 1920, 1080);
    rim(S.sum, null);
    for (i = 0; i < 3; i++) {
      var lab = 'ℓ = m = ' + (i + 2);
      rim(S['h' + i], S.o00.a > 0.5 ? null : lab, C.css[i]);
      for (var n = 0; n < NOT; n++) rim(S['o' + i + n], i === 2 ? 'n = ' + n : null, C.css[i]);
      // in the overtone layout the harmonic's name sits to its left
      if (S['o' + i + '0'].a > 0.01) {
        ctx.globalAlpha = S['o' + i + '0'].a; ctx.fillStyle = C.css[i]; ctx.textAlign = 'center';
        ctx.font = '26px ETbb, Georgia, serif';
        ctx.fillText(lab, S['h' + i].x, S['h' + i].y - S['h' + i].R - 14);
        ctx.globalAlpha = 1;
      }
      ['=', '+', '+', '+ …'].forEach(function (s, k) { sign(S['s' + i + k], s); });
    }
    sign(S.p1, '+'); sign(S.p2, '+');

    axes(S, t);
    row(S.rx, signal, C.ink, 'signal');
    for (i = 0; i < 3; i++) {
      (function (i) {
        // in the overtone layout, each overtone under its harmonic, in its shade
        var oa = S['o' + i + '0'].a, P = S['r' + i];
        if (oa > 0.01 && P.a > 0.01) {
          ctx.globalAlpha = oa * P.a;
          for (var n = NOT - 1; n >= 0; n--) {
            ctx.lineWidth = 2.5; ctx.strokeStyle = C.shadeCss[i][n];
            ctx.beginPath();
            for (var k = 0; k <= 200; k++) {
              var tt = TW[1] * k / 200, y = P.y - P.R * otContrib(i, n, tt);
              y = Math.max(P.y - 1.6 * P.R, Math.min(P.y + 1.6 * P.R, y));   // a big overtone stays in its row
              if (k) ctx.lineTo(tx(tt), y); else ctx.moveTo(tx(tt), y);
            }
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
        row(P, function (tt) { return contrib(i, tt); }, C.css[i], 'ℓ = m = ' + (i + 2));
      })(i);
    }
  }

  // the deck marks the step on the slide; follow it
  new MutationObserver(function () { relayout(+slide.dataset.s || 0); })
    .observe(slide, { attributes: true, attributeFilter: ['data-s'] });

  Deck.on('modes', {
    enter: function (sl) {
      relayout(+sl.dataset.s || 0, true);
      t = LOOP[0]; held = 0; frozen = false; last = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    },
    leave: function () { if (raf) cancelAnimationFrame(raf); raf = null; }
  });

  // modes(30) in the console freezes the clock at t = 30 M, for a look;
  // modes() lets it run again
  window.modes = function (tt) {
    if (tt == null) { frozen = false; return 'running'; }
    t = tt; frozen = true; draw(performance.now());
    return 't = ' + tt + ' M';
  };
})();
