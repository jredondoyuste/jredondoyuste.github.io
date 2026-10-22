// GW150914: the H1 data (GWOSC, the PRL's Fig. 1: 35-350 Hz bandpass), then
// the NR waveform over it, then the crop: a cut sweeps from the left edge to
// t_mg (the waveform's peak) while the SNR left after it is counted down,
// and the view closes in on what is left, the ringdown.
//
// The SNR curve is built offline (figures/gw150914-strain.json): the
// fraction of the NR waveform's energy after the cut, for white noise in
// band, scaled so the full signal has the published H1 value, 20.
(function () {
  'use strict';

  var X0 = 140, X1 = 1780;            // plot, px
  var YC = 400, YS = 210;             // centre line and px per unit strain (x 1e-21)
  var SNR_Y0 = 900, SNR_YS = 7;       // the SNR strip: baseline and px per unit SNR
  var SWEEP_MS = 2600, ZOOM_MS = 1300;
  var VIEW_ALL = [-0.17, 0.05];       // s from the peak
  var VIEW_RD = [-0.012, 0.045];      // the ringdown, after the crop

  var slide = document.getElementById('gw150914');
  var $ = function (s) { return slide.querySelector(s); };
  var D = null;                       // the data, once fetched
  var view = VIEW_ALL.slice(), cut = null, raf = null;

  function X(t) { return X0 + (t - view[0]) / (view[1] - view[0]) * (X1 - X0); }
  function Y(h) { return YC - YS * h; }

  function path(ts, ys, from, to) {
    var d = '', first = true;
    for (var i = 0; i < ts.length; i++) {
      if (ts[i] < Math.max(from, view[0]) || ts[i] > Math.min(to, view[1])) continue;
      d += (first ? 'M' : 'L') + X(ts[i]).toFixed(1) + ' ' + Y(ys[i]).toFixed(1);
      first = false;
    }
    return d;
  }

  function rhoAt(t0) {
    var s = D.snr, n = s.t0.length;
    if (t0 <= s.t0[0]) return s.rho[0];
    if (t0 >= s.t0[n - 1]) return s.rho[n - 1];
    for (var i = 1; i < n; i++) if (s.t0[i] >= t0) {
      var u = (t0 - s.t0[i - 1]) / (s.t0[i] - s.t0[i - 1]);
      return s.rho[i - 1] + u * (s.rho[i] - s.rho[i - 1]);
    }
  }

  function axes() {
    var g = $('.g1-axes'), h = '';
    h += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + YC + '" y2="' + YC + '"/>';
    var step = view[1] - view[0] > 0.1 ? 0.05 : 0.01;
    for (var t = Math.ceil(view[0] / step) * step; t <= view[1] + 1e-9; t += step) {
      var x = X(t).toFixed(1), lab = Math.abs(t) < 1e-9 ? '0' : (t > 0 ? '+' : '−') + Math.abs(t).toFixed(2) + ' s';
      h += '<line x1="' + x + '" x2="' + x + '" y1="' + (YC + 250) + '" y2="' + (YC + 262) + '"/>';
      h += '<text x="' + x + '" y="' + (YC + 292) + '">' + lab + '</text>';
    }
    g.innerHTML = h;
  }

  function draw() {
    if (!D) return;
    axes();
    var c = cut == null ? -Infinity : cut;
    $('.g1-data-off').setAttribute('d', cut == null ? '' : path(D.t, D.data, -Infinity, c));
    $('.g1-data').setAttribute('d', path(D.t, D.data, c, Infinity));
    $('.g1-nr').setAttribute('d', path(D.t, D.nr, c, Infinity));

    var line = $('.g1-cut'), snr = $('.g1-snr');
    if (cut == null) { line.style.display = 'none'; snr.style.display = 'none'; return; }
    line.style.display = ''; snr.style.display = '';
    var xc = Math.max(X0, X(cut));
    line.setAttribute('x1', xc); line.setAttribute('x2', xc);
    line.setAttribute('y1', YC - 245); line.setAttribute('y2', SNR_Y0 + 10);

    // the SNR left, as a curve under the plot, drawn up to the cut
    var s = D.snr, d = '', first = true;
    for (var i = 0; i < s.t0.length; i++) {
      var t0 = s.t0[i];
      if (t0 < view[0] || t0 > Math.min(cut, view[1])) continue;
      d += (first ? 'M' : 'L') + X(t0).toFixed(1) + ' ' + (SNR_Y0 - SNR_YS * s.rho[i]).toFixed(1);
      first = false;
    }
    $('.g1-snr-curve').setAttribute('d', d);
    var r = rhoAt(cut);
    $('.g1-snr-dot').setAttribute('cx', xc);
    $('.g1-snr-dot').setAttribute('cy', SNR_Y0 - SNR_YS * r);
    $('.g1-rho').textContent = r.toFixed(1);
  }

  function tween(ms, fn, done) {
    cancelAnimationFrame(raf);
    var t0 = performance.now();
    (function tick(now) {
      var u = Math.min(1, (now - t0) / ms), e = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
      fn(e); draw();
      if (u < 1) raf = requestAnimationFrame(tick); else if (done) done();
    })(t0);
  }

  // the crop: sweep the cut to t_mg, then close in on the ringdown
  function crop(instant) {
    if (instant) { cut = 0; view = VIEW_RD.slice(); draw(); return; }
    view = VIEW_ALL.slice();
    tween(SWEEP_MS, function (e) { cut = VIEW_ALL[0] + e * (0 - VIEW_ALL[0]); }, function () {
      tween(ZOOM_MS, function (e) {
        view = [VIEW_ALL[0] + e * (VIEW_RD[0] - VIEW_ALL[0]), VIEW_ALL[1] + e * (VIEW_RD[1] - VIEW_ALL[1])];
      });
    });
  }

  function uncrop() { cancelAnimationFrame(raf); cut = null; view = VIEW_ALL.slice(); draw(); }

  var cropped = false;
  new MutationObserver(function () {
    var s = +slide.dataset.s || 0;
    if (s >= 2 && !cropped) { cropped = true; crop(false); }
    if (s < 2 && cropped) { cropped = false; uncrop(); }
  }).observe(slide, { attributes: true, attributeFilter: ['data-s'] });

  fetch('figures/gw150914-strain.json').then(function (r) { return r.json(); }).then(function (j) {
    D = j; draw();
  });

  Deck.on('gw150914', {
    enter: function (sl, dir) {
      if (dir < 0) { cropped = true; crop(true); }
      else { cropped = false; uncrop(); }
    },
    leave: function () { cancelAnimationFrame(raf); }
  });
})();
