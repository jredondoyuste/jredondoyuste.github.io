// Every event LVK has analysed for its ringdown, GW150914 to GWTC-5,
// in the order they arrived: whitened open data (GWOSC), one row per event,
// the whole signal in seconds, aligned at the peak. Each row starts where
// its signal enters the band, so heavy, short signals are short rows. The
// rows draw themselves in, top (2015) to bottom (2025).
//
// Built offline (figures/ringdowns.json, ringdowns.py): the events are the
// union of the LVK tests-of-GR ringdown lists; no fits or cuts of ours. Each
// is aligned at the peak of its whitened envelope, in the detector where
// that peak stands highest, and scaled to its own peak.
(function () {
  'use strict';

  var BOX = { x0: 420, x1: 1720, y0: 165, y1: 885 };
  var T = [-1, 0.05];          // s from the peak
  var AMP = 1.3;               // a trace's peak, in row heights: rows overlap a little
  var STAGGER = 25;            // ms between rows drawing in
  var CATS = [['GWTC-1', /GWTC-1/], ['GWTC-2', /GWTC-2/], ['GWTC-3', /GWTC-3/], ['GWTC-4', /GWTC-4/], ['GWTC-5', /GWTC-5/]];

  var slide = document.getElementById('rdall');
  var $ = function (s) { return slide.querySelector(s); };

  function X(t) { return BOX.x0 + (t - T[0]) / (T[1] - T[0]) * (BOX.x1 - BOX.x0); }

  function build(J) {
    var rows = J.traces, n = rows.length, dy = (BOX.y1 - BOX.y0) / n;
    var a = '<line class="rd-zero" x1="' + X(0) + '" x2="' + X(0) + '" y1="' + (BOX.y0 - 10) + '" y2="' + BOX.y1 + '"/>';
    [-1, -0.75, -0.5, -0.25, 0].forEach(function (t) {
      a += '<line x1="' + X(t) + '" x2="' + X(t) + '" y1="' + BOX.y1 + '" y2="' + (BOX.y1 + 10) + '"/>';
      a += '<text x="' + X(t) + '" y="' + (BOX.y1 + 40) + '" text-anchor="middle">' + (t ? t.toFixed(2).replace('-', '−') + ' s' : 'peak') + '</text>';
    });
    $('.rd-axes').innerHTML = a;

    var h = '', groups = {};
    rows.forEach(function (r, i) {
      var yc = BOX.y0 + (i + 0.5) * dy, top = 0, k;
      for (k = 0; k < r.x.length; k++) top = Math.max(top, Math.abs(r.x[k]));
      var s = AMP * dy / top, pre = '', post = '';
      for (k = 0; k < r.x.length; k++) {
        var t = r.t0 + k * r.dt;
        if (t < T[0] || t > T[1]) continue;
        var p = X(t).toFixed(1) + ' ' + (yc - s * r.x[k]).toFixed(1);
        if (t <= 0) pre += (pre ? 'L' : 'M') + p;
        if (t >= 0) post += (post ? 'L' : 'M') + p;
      }
      h += '<g class="rd-row" style="--i:' + i + '"><path class="rd-pre" pathLength="1" d="' + pre + '"/>' +
           '<path class="rd-post" pathLength="1" d="' + post + '"/></g>';
      var c = CATS.find(function (c) { return c[1].test(r.cat); });
      c = c ? c[0] : r.cat;
      (groups[c] = groups[c] || []).push(yc);
    });
    $('.rd-rows').innerHTML = h;

    // the catalogues, bracketed down the left
    var g = '';
    Object.keys(groups).forEach(function (c) {
      var ys = groups[c], y0 = ys[0] - dy / 2 + 2, y1 = ys[ys.length - 1] + dy / 2 - 2, x = BOX.x0 - 40;
      g += '<path class="rd-brace" d="M' + (x + 12) + ' ' + y0 + 'L' + x + ' ' + y0 + 'L' + x + ' ' + y1 + 'L' + (x + 12) + ' ' + y1 + '"/>';
      g += '<text class="rd-cat" x="' + (x - 16) + '" y="' + ((y0 + y1) / 2 + 9) + '" text-anchor="end">' + c + '</text>';
      g += '<text class="rd-catn" x="' + (x - 16) + '" y="' + ((y0 + y1) / 2 + 36) + '" text-anchor="end">' + ys.length + '</text>';
    });
    $('.rd-head').innerHTML = g;
    $('.rd-count').textContent = n;
    slide.style.setProperty('--stagger', STAGGER + 'ms');
  }

  function replay() {
    var g = $('.rd-rows');
    g.classList.remove('drawn');
    g.getBoundingClientRect();
    g.classList.add('drawn');
  }

  fetch('figures/ringdowns.json').then(function (r) { return r.json(); }).then(build);

  Deck.on('rdall', {
    enter: function (sl, dir) {
      if (dir < 0) { $('.rd-rows').classList.add('drawn', 'instant'); return; }
      $('.rd-rows').classList.remove('instant');
      setTimeout(replay, 300);
    }
  });
})();
