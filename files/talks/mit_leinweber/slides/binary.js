// The binary: two black holes spiral in, merge and ring down, and the waves
// they send out are drawn in the orbital plane, one colour per multipole.
// A few seconds in the view opens to show the waves reaching Earth, which
// stretches and squeezes (hugely exaggerated) as they pass. Then:
//
//   → while playing     jump to the end
//   → at the end        rewind to the merger and zoom into it
//   → once rewound      next slide
//
// Everything drawn is a function of one clock t (in M, t = 0 at the peak
// of the 22 mode), so rewinding is just running the clock backwards.
//
// THE WAVEFORM is a toy, stitched from two exact pieces:
//   inspiral   leading-order PN: Mw_orb = tau^(-3/8) / 8, tau = eta (TC - t) / 5,
//              h_lm ~ x^p e^(-i m Phi), x = (M w_orb)^(2/3)
//   ringdown   the l = m fundamental QNMs of the remnant, solved live by
//              /js/kerr-qnm.js
// handed over by a tanh of width W around t = 0. The choices are named
// below; each multipole is shown scaled to its own peak, so the 33 and 44
// are visible at all (for q = 1.4 the 33 is ~10% of the 22 in strain).
(function () {
  'use strict';

  // ---- the system (G = c = M = 1) ----------------------------------------
  var Q = 1.4;                          // mass ratio: not 1, so the odd-m modes (33) are there
  var M1 = Q / (1 + Q), M2 = 1 / (1 + Q), ETA = M1 * M2;
  // the remnant: spin from the non-spinning fit of Rezzolla+ (0710.3345);
  // radiated energy taken as 4.8% at equal mass, scaling as (4 eta)^2
  var AF = ETA * (2 * Math.sqrt(3) - 3.871 * ETA + 4.028 * ETA * ETA);
  var MF = 1 - 0.048 * 16 * ETA * ETA;
  var MODES = [                         // p: inspiral amplitude ~ x^p
    { l: 2, m: 2, p: 1,   css: '--m22' },
    { l: 3, m: 3, p: 1.5, css: '--m33' },
    { l: 4, m: 4, p: 2,   css: '--m44' }
  ];
  var TC = 8;                           // PN coalescence time: puts the 22 near 0.36/M at t = 0
  var W = 4;                            // width of the inspiral -> ringdown hand-over, M
  var DE = 160;                         // Earth's distance in the picture, M (not to scale!)

  // ---- the clock ----------------------------------------------------------
  var T_START = -240;                   // where the slide starts (separation ~7.5 M)
  var T_OPEN = -75;                     // when the view opens to show Earth (~5 s in)
  var T_END = DE + 70;                  // Earth has rung down
  // playback speed, M per second: brisk inspiral, slow merger, brisk again
  // while the last waves travel out to Earth
  function speed(t) {
    if (t < 30) return 35 + (13 - 35) * smooth(-70, -5, t);
    return 13 + (45 - 13) * smooth(30, 70, t);
  }
  var REWIND = 110;                     // M per second, backwards

  // ---- cameras: centre (M) and scale (px per M) on the 1920x1080 canvas ---
  var CAM_CLOSE  = { cx: 0,  k: 16 };   // the binary alone
  var CAM_OPEN   = { cx: 79, k: 6.7 };  // binary on the left, Earth on the right
  var CAM_MERGER = { cx: 0,  k: 46 };   // where the rewind lands
  var EXAGGERATE = 0.25;                // Earth's stretch at the peak of the wave
  var CELL = 4;                         // field resolution: one value per 4x4 px
  var SAT = 4;                          // how hard the crests saturate: higher, sharper bands

  function smooth(a, b, x) {
    var u = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return u * u * (3 - 2 * u);
  }

  // ---- the waveform, tabulated --------------------------------------------
  // The table starts well before T_START, so the whole screen is already
  // full of waves when the slide opens (no artificial wavefront).
  var T0 = T_START - 450, T1 = T_END + 20, DT = 0.25;
  var N = Math.round((T1 - T0) / DT) + 1;
  var xPeak = Math.pow(Math.pow(ETA * TC / 5, -3 / 8) / 8, 2 / 3);

  MODES.forEach(function (md) {
    var w = KerrQNM.mode(-2, md.l, md.m, 0, AF).omega;
    md.wr = w[0] / MF; md.wi = -w[1] / MF;          // in units of the initial M
    md.amp = new Float32Array(N);
    md.ph = new Float64Array(N);
  });

  (function tabulate() {
    for (var i = 0; i < N; i++) {
      var t = T0 + i * DT;
      var wo = Math.pow(Math.max(ETA * (TC - t) / 5, 1e-3), -3 / 8) / 8;
      var x = Math.pow(wo, 2 / 3);
      var s = 0.5 * (1 + Math.tanh(t / W));
      MODES.forEach(function (md) {
        var w = (1 - s) * Math.min(md.m * wo, md.wr) + s * md.wr;
        var a = (1 - s) * Math.pow(x, md.p) + s * Math.pow(xPeak, md.p) * Math.exp(-md.wi * Math.max(t, 0));
        md.amp[i] = a;
        md.ph[i] = i ? md.ph[i - 1] + w * DT : 0;
      });
    }
    MODES.forEach(function (md) {
      var top = 0;
      for (var i = 0; i < N; i++) top = Math.max(top, md.amp[i]);
      for (i = 0; i < N; i++) md.amp[i] /= top;
    });
  })();

  // amplitude and phase of a mode at time t, interpolated
  var look = { a: 0, ph: 0 };
  function at(md, t) {
    var f = (t - T0) / DT;
    if (f <= 0) { look.a = 0; look.ph = 0; return look; }
    if (f >= N - 1) f = N - 1.001;
    var i = f | 0, u = f - i;
    look.a = md.amp[i] + u * (md.amp[i + 1] - md.amp[i]);
    look.ph = md.ph[i] + u * (md.ph[i + 1] - md.ph[i]);
    return look;
  }

  // ---- the slide ----------------------------------------------------------
  var slide = document.getElementById('binary');
  var field = slide.querySelector('.bin-field');
  var front = slide.querySelector('.bin-front');
  var fctx = field.getContext('2d');
  var ctx = front.getContext('2d');
  var GW = 1920 / CELL, GH = 1080 / CELL;
  field.width = GW; field.height = GH;
  front.width = 1920; front.height = 1080;
  var img = fctx.createImageData(GW, GH);

  var state = 'idle', t = T_START, raf = null, last = 0;
  var cam = { cx: CAM_CLOSE.cx, cy: 0, k: CAM_CLOSE.k }, tween = null;
  var earthIn = 0, earthTween = null;

  function moveCam(to, ms) {
    tween = { from: { cx: cam.cx, k: cam.k }, to: to, t0: performance.now(), dur: ms };
  }
  function stepCam(now) {
    if (!tween) return;
    var u = Math.min(1, (now - tween.t0) / tween.dur);
    var e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    // the scale eases in log, so zooming feels even
    cam.k = Math.exp(Math.log(tween.from.k) + e * (Math.log(tween.to.k) - Math.log(tween.from.k)));
    cam.cx = tween.from.cx + e * (tween.to.cx - tween.from.cx);
    if (u >= 1) tween = null;
  }
  function setCam(c) { cam.cx = c.cx; cam.k = c.k; cam.cy = c.cy || 0; tween = null; }

  // world (M) -> canvas px
  function sx(X) { return 960 + (X - cam.cx) * cam.k; }
  function sy(Y) { return 540 - (Y - cam.cy) * cam.k; }

  // colours come from CSS (--m22 …), so they follow the theme
  var colours = null, themeSeen = null;
  function readColours() {
    var cs = getComputedStyle(slide);
    colours = MODES.map(function (md) {
      ctx.fillStyle = cs.getPropertyValue(md.css).trim() || '#888';
      var h = ctx.fillStyle;                          // normalised to #rrggbb
      return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    });
    themeSeen = document.documentElement.dataset.theme;
  }

  // ---- the waves: crests of each multipole, laid over one another --------
  var camSeen = null, R = new Float32Array(GW * GH), PHI = new Float32Array(GW * GH);
  function drawField() {
    var key = cam.cx.toFixed(3) + ',' + cam.cy.toFixed(3) + ',' + cam.k.toFixed(4);
    if (key !== camSeen) {                            // geometry only changes with the camera
      for (var gy = 0, j = 0; gy < GH; gy++) {
        var Y = cam.cy + (540 - (gy + 0.5) * CELL) / cam.k;
        for (var gx = 0; gx < GW; gx++, j++) {
          var X = cam.cx + ((gx + 0.5) * CELL - 960) / cam.k;
          R[j] = Math.hypot(X, Y); PHI[j] = Math.atan2(Y, X);
        }
      }
      camSeen = key;
    }
    var d = img.data, nm = MODES.length;
    for (j = 0; j < GW * GH; j++) {
      var r = R[j], near = smooth(2.5, 9, r), pr = 0, pg = 0, pb = 0, pa = 0;
      if (near > 0) {
        for (var q = nm - 1; q >= 0; q--) {           // 44 first, so the 22 lies on top
          var md = MODES[q], L = at(md, t - r);
          var v = L.a * Math.cos(md.m * PHI[j] - L.ph);
          if (v <= 0) continue;
          // saturating in tanh, as the lab pages do, so the crests read as bands
          var al = 0.92 * Math.tanh(SAT * v * v) * near, c = colours[q];
          pr = c[0] * al + pr * (1 - al); pg = c[1] * al + pg * (1 - al);
          pb = c[2] * al + pb * (1 - al); pa = al + pa * (1 - al);
        }
      }
      var o = 4 * j;
      if (pa > 0) { d[o] = pr / pa; d[o + 1] = pg / pa; d[o + 2] = pb / pa; d[o + 3] = 255 * pa; }
      else d[o + 3] = 0;
    }
    fctx.putImageData(img, 0, 0);
  }

  // ---- the black holes ----------------------------------------------------
  var r1 = 2 * M1, r2 = 2 * M2, rf = MF * (1 + Math.sqrt(1 - AF * AF));

  // separation: Kepler from the 22's frequency, closed to nothing over the merger
  function sepAt(tt) {
    var i = Math.min(N - 2, Math.max(0, ((tt - T0) / DT) | 0));
    var w22 = (MODES[0].ph[i + 1] - MODES[0].ph[i]) / DT;
    return Math.pow(w22 / 2, -2 / 3) * (1 - smooth(-8, 1, tt));
  }

  // the rewind stops where the two horizons first touch: the merger, drawn
  var T_TOUCH = (function () {
    for (var tt = -60; tt < 0; tt += 0.25) if (sepAt(tt) < r1 + r2 + 0.3) return tt;
    return 0;
  })();

  function drawHoles(hole, ink) {
    var L = at(MODES[0], t), phi = L.ph / 2;           // orbital phase follows the 22
    var merge = smooth(-8, 1, t);
    var d = sepAt(t);
    var c = Math.cos(phi), s = Math.sin(phi);
    var x1 = M2 * d * c, y1 = M2 * d * s, x2 = -M1 * d * c, y2 = -M1 * d * s;
    var px = function (r) { return Math.max(5, r * cam.k); };

    function disc(x, y, rx, ry, rot) {
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, 2 * Math.PI);
      ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = hole; ctx.strokeStyle = ink;
    if (merge < 1) {
      ctx.globalAlpha = 1 - smooth(0, 1, t);
      if (d < r1 + r2 + 1.5) {                        // the neck as they touch
        ctx.lineWidth = px(Math.min(r1, r2)) * 1.6 * smooth(r1 + r2 + 1.5, r1 + r2 - 0.5, d);
        ctx.strokeStyle = hole;
        ctx.beginPath(); ctx.moveTo(sx(x1), sy(y1)); ctx.lineTo(sx(x2), sy(y2)); ctx.stroke();
        ctx.strokeStyle = ink;
      }
      ctx.lineWidth = 1.5;
      disc(sx(x1), sy(y1), px(r1), px(r1), 0);
      disc(sx(x2), sy(y2), px(r2), px(r2), 0);
    }
    var born = smooth(-4, 1, t);
    if (born > 0) {                                    // the remnant, wobbling as it rings
      var wob = 0.14 * L.a * smooth(-2, 2, t);
      ctx.globalAlpha = born;
      ctx.lineWidth = 1.5;
      disc(sx(0), sy(0), px(rf) * (1 + wob), px(rf) * (1 - wob), -phi);
    }
    ctx.globalAlpha = 1;
  }

  // ---- Earth --------------------------------------------------------------
  function strainAtEarth(tt) {
    var L = at(MODES[0], tt - DE);
    return L.a * Math.cos(-L.ph);
  }

  // The globe: Natural Earth land (earth-land.js) in orthographic projection,
  // turning slowly, tilted to show the northern hemisphere a little.
  // Points on the far side are pushed onto the limb, which clips the land
  // well enough at this size.
  var SPIN = 8, TILT = 18 * Math.PI / 180;           // degrees per second; latitude of the centre
  function globe(Rad, ink) {
    var cs = getComputedStyle(slide);
    var lam0 = (-60 + SPIN * performance.now() / 1000) * Math.PI / 180;
    var s0 = Math.sin(TILT), c0 = Math.cos(TILT), DEG = Math.PI / 180;

    ctx.beginPath(); ctx.arc(0, 0, Rad, 0, 2 * Math.PI);
    ctx.fillStyle = cs.getPropertyValue('--earth-sea').trim(); ctx.fill();
    ctx.save(); ctx.clip();

    ctx.fillStyle = cs.getPropertyValue('--earth-land').trim();
    (window.EARTH_LAND || []).forEach(function (ring) {
      var any = false;
      ctx.beginPath();
      for (var k = 0; k < ring.length; k += 2) {
        var lam = ring[k] * DEG - lam0, phi = ring[k + 1] * DEG;
        var cp = Math.cos(phi), x = cp * Math.sin(lam);
        var y = c0 * Math.sin(phi) - s0 * cp * Math.cos(lam);
        if (s0 * Math.sin(phi) + c0 * cp * Math.cos(lam) < 0) {   // far side: onto the limb
          var n = Math.hypot(x, y) || 1; x /= n; y /= n;
        } else any = true;
        if (k) ctx.lineTo(Rad * x, -Rad * y); else ctx.moveTo(Rad * x, -Rad * y);
      }
      if (any) ctx.fill();
    });

    // light from the upper left, and a darker limb, so it reads as a sphere
    var g = ctx.createRadialGradient(-Rad * 0.35, -Rad * 0.4, Rad * 0.1, 0, 0, Rad);
    g.addColorStop(0, 'rgba(255,255,255,0.28)');
    g.addColorStop(0.6, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = g;
    ctx.fillRect(-Rad, -Rad, 2 * Rad, 2 * Rad);
    ctx.restore();

    ctx.lineWidth = 2; ctx.strokeStyle = ink;
    ctx.beginPath(); ctx.arc(0, 0, Rad, 0, 2 * Math.PI); ctx.stroke();
  }

  function drawEarth(ink, paper, muted) {
    if (earthIn <= 0) return;
    var X = sx(DE), Y = sy(0), Rad = 78, h = EXAGGERATE * strainAtEarth(t);
    ctx.globalAlpha = earthIn;

    ctx.save();
    ctx.translate(X, Y);
    ctx.scale(1 + h, 1 - h);
    globe(Rad, ink);
    ctx.restore();

    // the strain Earth has felt, last 120 M, under the globe
    var w = 300, top = Y + Rad + 70, amp = 34, span = 120;
    ctx.lineWidth = 2; ctx.strokeStyle = ink;
    ctx.beginPath();
    for (var k = 0; k <= 200; k++) {
      var tt = t - span + span * k / 200;
      var px = X - w / 2 + w * k / 200, py = top - amp * strainAtEarth(tt);
      if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = muted;
    ctx.font = '26px ETbb, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Earth', X, Y - Rad - 22);
    ctx.font = '22px ETbb, Georgia, serif';
    ctx.fillText('not to scale', (sx(0) + X) / 2, 1080 - 150);
    ctx.globalAlpha = 1;
  }

  // ---- the loop -----------------------------------------------------------
  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.1, (now - last) / 1000);
    last = now;

    if (state === 'play') {
      t += dt * speed(t);
      if (t >= T_OPEN && !earthTween) open();
      if (t >= T_END) { t = T_END; state = 'done'; }
    } else if (state === 'rewind') {
      t -= dt * REWIND;
      if (t <= T_TOUCH) { t = T_TOUCH; state = 'rewound'; slide.classList.remove('rewinding'); }
    }
    if (earthTween) {
      earthIn = earthTween.from + (earthTween.to - earthTween.from) *
                smooth(0, 1, (now - earthTween.t0) / earthTween.dur);
    }
    stepCam(now);
    render();
  }

  function render() {
    if (themeSeen !== document.documentElement.dataset.theme) readColours();
    var cs = getComputedStyle(slide);
    var ink = cs.getPropertyValue('--ink').trim(), paper = cs.getPropertyValue('--panel').trim();
    var muted = cs.getPropertyValue('--muted').trim();
    // the hole as on the lab pages (kerr.html, plunge.html): near-black on
    // either paper, with a faint ink rim
    var hole = themeSeen === 'dark' ? 'rgb(13, 9, 8)' : ink;
    drawField();
    ctx.clearRect(0, 0, 1920, 1080);
    drawEarth(ink, paper, muted);
    drawHoles(hole, ink);
  }

  function open() {
    moveCam(CAM_OPEN, 2200);
    earthTween = { from: earthIn, to: 1, t0: performance.now() + 600, dur: 1200 };
  }

  function start() { last = performance.now(); if (!raf) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }

  function toEnd() {
    t = T_END; state = 'done';
    setCam(CAM_OPEN); earthIn = 1; earthTween = { from: 1, to: 1, t0: 0, dur: 1 };
  }

  function rewound() {
    t = T_TOUCH; state = 'rewound';
    setCam(CAM_MERGER); earthIn = 0; earthTween = { from: 0, to: 0, t0: 0, dur: 1 };
    slide.classList.remove('rewinding');
    render();
  }

  // For the next slide (scheme.js): paint the frame the rewind lands on and
  // say where things are in it, in canvas px. Only call it while this slide
  // is not showing.
  window.BinaryScene = {
    // the waveform itself, for slides that plot or decompose it (modes.js):
    // at(i, t) is mode i's amplitude (1 at its peak) and phase at time t
    wave: {
      modes: MODES, AF: AF, MF: MF, rf: rf,
      at: function (i, tt) { var L = at(MODES[i], tt); return { a: L.a, ph: L.ph }; }
    },

    // k: px per M, if not the rewind's own; lift: px to move the merger up
    merger: function (k, lift) {
      rewound();
      if (k) { setCam({ cx: 0, k: k, cy: -(lift || 0) / k }); render(); }
      var phi = at(MODES[0], t).ph / 2, d = sepAt(t), c = Math.cos(phi), s = Math.sin(phi);
      return {
        field: field, front: front,
        holes: [
          { x: sx(M2 * d * c), y: sy(M2 * d * s), r: r1 * cam.k },
          { x: sx(-M1 * d * c), y: sy(-M1 * d * s), r: r2 * cam.k }
        ],
        centre: { x: sx(0), y: sy(0) },
        rf: rf * cam.k
      };
    }
  };

  // type binary(-100) in the console to see any moment (t in M, 0 = peak);
  // binary() alone says where the clock is
  window.binary = function (tt) {
    if (tt == null) return { t: +t.toFixed(1), state: state, cam: cam };
    t = Math.max(T_START, Math.min(T_END, tt));
    state = t >= T_END ? 'done' : 'play';
    if (t >= T_OPEN) { setCam(CAM_OPEN); earthIn = 1; earthTween = { from: 1, to: 1, t0: 0, dur: 1 }; }
    else { setCam(CAM_CLOSE); earthIn = 0; earthTween = null; }
    render();
    return 't = ' + t.toFixed(1) + ' M';
  };

  Deck.on('binary', {
    enter: function (sl, dir) {
      readColours();
      if (dir < 0) rewound();
      else {
        t = T_START; state = 'play';
        setCam(CAM_CLOSE); earthIn = 0; earthTween = null;
      }
      start();
    },
    leave: function () { stop(); slide.classList.remove('rewinding'); },
    next: function () {
      if (state === 'play') { toEnd(); return true; }
      if (state === 'done') {
        state = 'rewind';
        slide.classList.add('rewinding');
        moveCam(CAM_MERGER, 2000);
        earthTween = { from: earthIn, to: 0, t0: performance.now(), dur: 900 };
        return true;
      }
      if (state === 'rewind') { rewound(); return true; }
      return false;
    }
  });
})();
