// Gravity is nonlinear, as a picture. The black hole rings in its 22 mode
// (crimson lobes, a two-armed spiral turning at the pattern speed Omega, so
// omega = 2 Omega); its square sources the 44 (blue): four arms, twice the
// frequency, half the wavelength, the same speed.
//
// Presses (the slide's data-s):
//   0  the 22 alone
//   1  the second-order equation; the source, (h1)^2, glows near the hole
//   2  the 44 leaves the source region and fills the picture
//   3  the 22 doubles; the 44 grows four times
(function () {
  'use strict';
  var slide = document.getElementById('nl-wave');
  if (!slide) return;
  var cv = slide.querySelector('.nw-field'), svg = slide.querySelector('.nw-svg');
  var NS = 'http://www.w3.org/2000/svg';

  var CX = 540, CY = 600, RAD = 420, CELL = 4;
  var GW = 2 * RAD / CELL;
  cv.width = GW; cv.height = GW;
  cv.style.left = (CX - RAD) + 'px'; cv.style.top = (CY - RAD) + 'px';
  cv.style.width = 2 * RAD + 'px'; cv.style.height = 2 * RAD + 'px';
  var ctx = cv.getContext('2d'), img = ctx.createImageData(GW, GW);
  var Rr = new Float32Array(GW * GW), Ph = new Float32Array(GW * GW);
  for (var gy = 0, j = 0; gy < GW; gy++)
    for (var gx = 0; gx < GW; gx++, j++) {
      var X = (gx + 0.5) * CELL - RAD, Y = RAD - (gy + 0.5) * CELL;
      Rr[j] = Math.hypot(X, Y); Ph[j] = Math.atan2(Y, X);
    }

  var OMEGA = 2 * Math.PI / 3.2;                 // pattern speed, rad / s
  var CW = 230 * OMEGA / Math.PI;                // px / s: the 22 has a 230 px wavelength
  var R_IN = 46, R_SRC = 125;                    // the hole; the edge of the source region
  function smooth(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }

  var col = null, themeSeen = null;
  function readColours() {
    var cs = getComputedStyle(slide), c = document.createElement('canvas').getContext('2d');
    col = ['--nw1', '--nw2'].map(function (v) {
      c.fillStyle = cs.getPropertyValue(v).trim() || '#888';
      var h = c.fillStyle;
      return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    });
    themeSeen = document.documentElement.dataset.theme;
  }

  // state
  var step = 0, eps = 1, epsFrom = 1, epsTo = 1, epsT0 = 0;
  var src = 0, front = -1, frontT0 = 0, t0 = 0, raf = null, last = 0;

  function draw(time) {
    var d = img.data, a1 = 0.55 * eps, a2 = 0.42 * eps * eps;
    for (var j = 0; j < GW * GW; j++) {
      var r = Rr[j], o = 4 * j;
      var edge = smooth((r - R_IN) / 30) * (1 - smooth((r - RAD + 80) / 80));
      if (edge <= 0) { d[o + 3] = 0; continue; }
      var ph = Ph[j], ret = time - r / CW;
      var pr = 0, pg = 0, pb = 0, pa = 0;
      // the 22
      var v1 = a1 * Math.cos(2 * (ph - OMEGA * ret)) * Math.pow(140 / Math.max(r, 140), 0.35);
      if (v1 > 0) {
        var al = 0.85 * Math.tanh(3 * v1 * v1) * edge, c = col[0];
        pr = c[0] * al; pg = c[1] * al; pb = c[2] * al; pa = al;
      }
      // the source: (h1)^2 near the hole, four lobes turning with the 22
      var v2 = 0;
      if (src > 0 && r < R_SRC + 40) v2 += src * 1.1 * a1 * a1 * Math.cos(4 * (ph - OMEGA * time)) * (1 - smooth((r - R_SRC) / 40));
      // the 44 it radiates, out to the front
      if (front > 0 && r > R_SRC - 30) {
        var fr = smooth((front - r) / 40) * smooth((r - R_SRC + 30) / 40);
        v2 += a2 * fr * Math.cos(4 * (ph - OMEGA * ret)) * Math.pow(160 / Math.max(r, 160), 0.35);
      }
      if (v2 > 0) {
        var al2 = 0.9 * Math.tanh(4 * v2 * v2) * edge, c2 = col[1];
        pr = c2[0] * al2 + pr * (1 - al2); pg = c2[1] * al2 + pg * (1 - al2); pb = c2[2] * al2 + pb * (1 - al2); pa = al2 + pa * (1 - al2);
      }
      if (pa > 0) { d[o] = pr / pa; d[o + 1] = pg / pa; d[o + 2] = pb / pa; d[o + 3] = 255 * pa; }
      else d[o + 3] = 0;
    }
    ctx.putImageData(img, 0, 0);
  }

  // svg: the hole, and the dashed source circle
  svg.innerHTML = '<circle class="nw-src" cx="' + CX + '" cy="' + CY + '" r="' + R_SRC + '"/>' +
    '<text class="nw-srclab" x="' + (CX + R_SRC * 0.72 + 14) + '" y="' + (CY - R_SRC * 0.72 - 10) + '">source</text>' +
    '<circle class="nw-hole" cx="' + CX + '" cy="' + CY + '" r="' + (R_IN - 8) + '"/>';

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var h = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    if (themeSeen !== document.documentElement.dataset.theme) readColours();
    var time = (now - t0) / 1000;
    src += ((step >= 1 ? 1 : 0) - src) * Math.min(1, h * 3);
    if (step >= 2) front = Math.min(RAD + 60, R_SRC - 30 + CW * (now - frontT0) / 1000);
    eps = epsFrom + (epsTo - epsFrom) * smooth((now - epsT0) / 1800);
    draw(time);
    slide.querySelector('.nw-a1').textContent = '×' + eps.toFixed(1).replace(/\.0$/, '');
    slide.querySelector('.nw-a2').textContent = '×' + (eps * eps).toFixed(1).replace(/\.0$/, '');
  }

  function setStep(s, animate) {
    step = s;
    for (var i = 1; i <= 3; i++) slide.classList.toggle('nw-on' + i, s >= i);
    if (s >= 2) { if (front < 0) { front = R_SRC - 30; frontT0 = animate ? performance.now() : -1e9; } }
    else front = -1;
    var target = s >= 3 ? 2 : 1;
    if (target !== epsTo) { epsFrom = animate ? eps : target; epsTo = target; epsT0 = performance.now(); }
    if (!animate) { src = s >= 1 ? 1 : 0; eps = epsTo; }
  }

  readColours();
  var lastS = 0;
  Deck.on('nl-wave', {
    enter: function (sl) { lastS = +sl.dataset.s || 0; setStep(lastS, false); t0 = last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); },
    leave: function () { cancelAnimationFrame(raf); raf = null; }
  });
  new MutationObserver(function () {
    var s = +slide.dataset.s || 0;
    setStep(s, s > lastS); lastS = s;
  }).observe(slide, { attributes: true, attributeFilter: ['data-s'] });
})();
