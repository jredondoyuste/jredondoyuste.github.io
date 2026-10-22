// The ringdown model. The signal from the modes slide, alone, drawn in on
// arrival; then, press by press (the text is in the HTML, the restyling in
// model.css):
//   1  the GR ringdown model: spheroidal harmonics and mirror modes
//   2  GR fixes every frequency: three of them typed out, digit by digit,
//      solved in the browser just now (/js/kerr-qnm.js) at a/M = A_SHOW
//   3  forget GR: free amplitudes and frequencies
(function () {
  'use strict';
  if (!window.BinaryScene || !window.KerrQNM) return;

  var A_SHOW = 0.7;            // the spin the digits are shown for
  var DIGITS = 14;             // decimals: the solver is stable to ~1e-15 here
  var TYPE_MS = 1600;          // how long the typing takes
  var TW = [-40, 90];          // the waveform's time window, M (t_mg = 0)
  var DRAW_MS = 1400;          // the waveform drawing itself in

  var slide = document.getElementById('model');
  var cv = slide.querySelector('.mo-wave');
  cv.width = 1640; cv.height = 300;
  var ctx = cv.getContext('2d');

  // ---- the digits ---------------------------------------------------------
  var spans = Array.prototype.slice.call(slide.querySelectorAll('.mo-w'));
  var texts = spans.map(function (el) {
    var q = el.dataset.mode.split('').map(Number);             // "220" -> l, m, n
    var w = KerrQNM.mode(-2, q[0], q[1], q[2], A_SHOW).omega;
    return w[0].toFixed(DIGITS) + ' − ' + (-w[1]).toFixed(DIGITS) + ' i';
  });
  slide.querySelector('.mo-spin').textContent = A_SHOW;

  var typing = null;
  function type(instant) {
    cancelAnimationFrame(typing);
    var t0 = performance.now();
    (function tick(now) {
      var u = instant ? 1 : Math.min(1, (now - t0) / TYPE_MS);
      spans.forEach(function (el, i) {
        var s = texts[i], k = Math.round(u * s.length);
        el.textContent = s.slice(0, k);
      });
      if (u < 1) typing = requestAnimationFrame(tick);
    })(t0);
  }
  function untype() { cancelAnimationFrame(typing); spans.forEach(function (el) { el.textContent = ''; }); }

  // ---- the waveform -------------------------------------------------------
  var drawing = null;
  function tx(t) { return 20 + (t - TW[0]) / (TW[1] - TW[0]) * (cv.width - 40); }

  function wave(u) {
    var cs = getComputedStyle(slide);
    var ink = cs.getPropertyValue('--ink').trim(), muted = cs.getPropertyValue('--muted').trim();
    var hair = cs.getPropertyValue('--hair').trim();
    var H = cv.height, y0 = H / 2 + 10, S = 105, tEnd = TW[0] + u * (TW[1] - TW[0]);
    ctx.clearRect(0, 0, cv.width, H);

    ctx.lineWidth = 1; ctx.strokeStyle = hair;
    ctx.beginPath(); ctx.moveTo(tx(TW[0]), y0); ctx.lineTo(tx(TW[1]), y0); ctx.stroke();

    var x = tx(0);                                      // t_mg
    ctx.setLineDash([8, 8]); ctx.lineWidth = 1.5; ctx.strokeStyle = muted;
    ctx.beginPath(); ctx.moveTo(x, 34); ctx.lineTo(x, H - 6); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = muted; ctx.textAlign = 'center';
    ctx.font = '30px ETbb, Georgia, serif'; ctx.fillText('t', x - 9, 26);
    ctx.font = '20px ETbb, Georgia, serif'; ctx.fillText('mg', x + 15, 32);
    ctx.textAlign = 'left'; ctx.font = '24px ETbb, Georgia, serif';
    ctx.fillText('ringdown →', x + 24, H - 12);

    [[TW[0], Math.min(0, tEnd), muted, 2.5], [0, tEnd, ink, 3.5]].forEach(function (seg) {
      if (seg[1] <= seg[0]) return;
      ctx.lineWidth = seg[3]; ctx.strokeStyle = seg[2];
      ctx.beginPath();
      for (var k = 0; k <= 400; k++) {
        var t = seg[0] + (seg[1] - seg[0]) * k / 400, y = y0 - S * BinaryScene.signal(t);
        if (k) ctx.lineTo(tx(t), y); else ctx.moveTo(tx(t), y);
      }
      ctx.stroke();
    });
  }

  function drawIn(instant) {
    cancelAnimationFrame(drawing);
    if (!BinaryScene.signal) return;                    // modes.js not loaded
    var t0 = performance.now();
    (function tick(now) {
      var u = instant ? 1 : Math.min(1, (now - t0) / DRAW_MS);
      wave(1 - Math.pow(1 - u, 2));
      if (u < 1) drawing = requestAnimationFrame(tick);
    })(t0);
  }

  // type the digits when the deck reaches step 2, clear them before it
  var shown = false;
  new MutationObserver(function () {
    var s = +slide.dataset.s || 0;
    if (s >= 2 && !shown) { shown = true; type(false); }
    if (s < 2 && shown) { shown = false; untype(); }
  }).observe(slide, { attributes: true, attributeFilter: ['data-s'] });

  new MutationObserver(function () {
    if (slide.classList.contains('active')) wave(1);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  Deck.on('model', {
    enter: function (sl, dir) {
      drawIn(dir < 0);
      if (dir < 0) { shown = true; type(true); }
      else { shown = false; untype(); }
    },
    leave: function () { cancelAnimationFrame(drawing); cancelAnimationFrame(typing); }
  });
})();
