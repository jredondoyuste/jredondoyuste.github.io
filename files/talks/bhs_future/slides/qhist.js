// How the quadratic amplitude ratio was measured: |R| of (220)x(220) -> (44)
// against remnant spin, built up one paper per press, in the order they
// appeared (the compilation of the review 2505.23895, Fig. 36).
//
// The numbers (figures/qqnm-ratio.json) come from each paper: the text where
// it states them, otherwise its vector figures, digitized to ~1e-5 in |R|.
// Each dataset's group is in the HTML (data-ds, data-step), so the deck counts
// the presses; this file draws into them.
(function () {
  'use strict';

  var BOX = { x0: 230, x1: 1230, y0: 190, y1: 850 };

  var slide = document.getElementById('qhist');
  var $ = function (s) { return slide.querySelector(s); };
  var XR, YR;

  function X(c) { return BOX.x0 + (c - XR[0]) / (XR[1] - XR[0]) * (BOX.x1 - BOX.x0); }
  function Y(r) { return BOX.y1 - (r - YR[0]) / (YR[1] - YR[0]) * (BOX.y1 - BOX.y0); }
  function f(v) { return v.toFixed(1); }

  function axes() {
    var h = '<rect class="qh-box" x="' + BOX.x0 + '" y="' + BOX.y0 + '" width="' + (BOX.x1 - BOX.x0) + '" height="' + (BOX.y1 - BOX.y0) + '"/>';
    for (var c = 0; c <= 1 + 1e-9; c += 0.2) {
      h += '<line class="qh-tickl" x1="' + X(c) + '" x2="' + X(c) + '" y1="' + BOX.y1 + '" y2="' + (BOX.y1 + 10) + '"/>';
      h += '<text class="qh-tick" x="' + X(c) + '" y="' + (BOX.y1 + 40) + '" text-anchor="middle">' + c.toFixed(1) + '</text>';
    }
    for (var r = 0.05; r <= YR[1] + 1e-9; r += 0.05) {
      h += '<line class="qh-tickl" x1="' + (BOX.x0 - 10) + '" x2="' + BOX.x0 + '" y1="' + Y(r) + '" y2="' + Y(r) + '"/>';
      h += '<text class="qh-tick" x="' + (BOX.x0 - 18) + '" y="' + (Y(r) + 8) + '" text-anchor="end">' + r.toFixed(2) + '</text>';
    }
    h += '<text class="qh-tick" x="' + (BOX.x0 + BOX.x1) / 2 + '" y="' + (BOX.y1 + 84) + '" text-anchor="middle">remnant spin  χ</text>';
    h += '<text class="qh-tick" transform="translate(' + (BOX.x0 - 110) + ',' + (BOX.y0 + BOX.y1) / 2 + ') rotate(-90)" text-anchor="middle">|ℛ|  for  220 × 220 → 44</text>';
    $('.qh-axes').innerHTML = h;
  }

  function points(d, r) {
    var h = '';
    d.x.forEach(function (x, i) {
      var y = d.y[i], lo = d.yerr_minus ? d.yerr_minus[i] : d.yerr ? d.yerr[i] : 0, hi = d.yerr_plus ? d.yerr_plus[i] : lo;
      if (lo || hi) h += '<line class="qh-err" x1="' + f(X(x)) + '" x2="' + f(X(x)) + '" y1="' + f(Y(y - lo)) + '" y2="' + f(Y(y + hi)) + '"/>';
      h += '<circle cx="' + f(X(x)) + '" cy="' + f(Y(y)) + '" r="' + r + '"/>';
    });
    return h;
  }

  function curve(xs, ys) {
    return '<path class="qh-curve" d="' + xs.map(function (x, i) { return (i ? 'L' : 'M') + f(X(x)) + ' ' + f(Y(ys[i])); }).join('') + '"/>';
  }

  function draw(d) {
    if (d.kind === 'band') {
      return '<rect class="qh-band" x="' + X(d.x[0]) + '" y="' + Y(d.y[1]) + '" width="' + (X(d.x[1]) - X(d.x[0])) + '" height="' + (Y(d.y[0]) - Y(d.y[1])) + '"/>';
    }
    if (d.kind === 'curve') return curve(d.x, d.y);
    var h = points(d, d.x.length > 1 ? 6 : 9);
    if (d.fit && d.fit.R0 != null) {               // R = R0 + (M kappa)^p, kappa the surface gravity
      var xs = [], ys = [];
      for (var c = 0; c <= 0.99; c += 0.01) {
        var s = Math.sqrt(1 - c * c), k = s / (2 * (1 + s));
        xs.push(c); ys.push(d.fit.R0 + Math.pow(k, d.fit.p));
      }
      h = curve(xs, ys) + h;
    }
    return h;
  }

  fetch('figures/qqnm-ratio.json').then(function (r) { return r.json(); }).then(function (J) {
    XR = [-0.03, 1.03]; YR = [0.05, 0.2];
    axes();
    slide.querySelectorAll('.qh-ds').forEach(function (g) {
      g.innerHTML = g.dataset.ds.split(',').map(function (i) { return draw(J.datasets[+i]); }).join('');
    });
  });
})();
