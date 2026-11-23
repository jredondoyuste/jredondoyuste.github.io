// The no-hair test on GW250114. Each measured number of the ringdown, the
// frequency and damping time of the 220 and of the 221, is matched by a
// whole curve of Kerr black holes (M, chi): the line through the posterior's
// median, in a 68% band. Press by press the four lines draw themselves in,
// and last the remnant the full (IMR) signal infers: they cross there.
//
// The bands are built offline (figures/gw250114-nohair.json) from the
// silencio two-mode posterior at t0 = 6 M and QNM frequencies solved by
// /js/kerr-qnm.js: for each spin chi, the median and 16-84% over samples of
// M = Re w(chi) / (2 pi f)  or  M = -Im w(chi) tau.
(function () {
  'use strict';

  var BOX = { x0: 300, x1: 1240, y0: 175, y1: 880 };

  var slide = document.getElementById('nohair');
  var $ = function (s) { return slide.querySelector(s); };
  var MB, CB;

  function X(m) { return BOX.x0 + (m - MB[0]) / (MB[1] - MB[0]) * (BOX.x1 - BOX.x0); }
  function Y(c) { return BOX.y1 - (c - CB[0]) / (CB[1] - CB[0]) * (BOX.y1 - BOX.y0); }
  function line(pts) {
    return pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join('');
  }

  function build(J) {
    MB = J.box.M; CB = J.box.chi;
    var r = $('.nh-box');
    r.setAttribute('x', BOX.x0); r.setAttribute('y', BOX.y0);
    r.setAttribute('width', BOX.x1 - BOX.x0); r.setAttribute('height', BOX.y1 - BOX.y0);

    // axes: numbers close to the box, names further out
    var h = '<rect x="' + BOX.x0 + '" y="' + BOX.y0 + '" width="' + (BOX.x1 - BOX.x0) + '" height="' + (BOX.y1 - BOX.y0) + '"/>';
    var ms = MB[1] - MB[0] > 40 ? 10 : 5;            // a tick every 10 M_sun on the wide axes
    for (var m = Math.ceil(MB[0] / ms) * ms; m <= MB[1]; m += ms) {
      h += '<line x1="' + X(m) + '" x2="' + X(m) + '" y1="' + BOX.y1 + '" y2="' + (BOX.y1 + 10) + '"/>';
      h += '<text x="' + X(m) + '" y="' + (BOX.y1 + 42) + '" text-anchor="middle">' + m + '</text>';
    }
    var cs = CB[1] - CB[0] > 0.7 ? 0.2 : 0.1;
    for (var c = Math.ceil(CB[0] / cs - 1e-9) * cs; c <= CB[1] + 1e-9; c += cs) {
      h += '<line x1="' + (BOX.x0 - 10) + '" x2="' + BOX.x0 + '" y1="' + Y(c) + '" y2="' + Y(c) + '"/>';
      h += '<text x="' + (BOX.x0 - 18) + '" y="' + (Y(c) + 9) + '" text-anchor="end">' + c.toFixed(1) + '</text>';
    }
    h += '<text x="' + (BOX.x0 + BOX.x1) / 2 + '" y="' + (BOX.y1 + 92) + '" text-anchor="middle">remnant mass  (1+z) M  [M☉]</text>';
    h += '<text transform="translate(' + (BOX.x0 - 100) + ',' + (BOX.y0 + BOX.y1) / 2 + ') rotate(-90)" text-anchor="middle">remnant spin  χ</text>';
    $('.nh-axes').innerHTML = h;

    // the bands (their groups are in the HTML, so the deck counts their
    // steps): a fill and its two edges, which draw themselves in
    J.bands.forEach(function (b, i) {
      var g = $('.nh-b' + i);
      g.querySelector('.nh-fill').setAttribute('d', line(b.lo) + line(b.hi.slice().reverse()).replace(/^M/, 'L') + 'Z');
      g.querySelector('.nh-lo').setAttribute('d', line(b.lo));
      g.querySelector('.nh-hi').setAttribute('d', line(b.hi));
      g.querySelector('.nh-mid').setAttribute('d', line(b.mid));
    });

    var imr = J.imr;
    $('.nh-imr path').setAttribute('d', imr.c90.map(function (p) { return line(p) + 'Z'; }).join(''));
    var ring = $('.nh-ring');
    ring.setAttribute('cx', X(imr.maxl[0])); ring.setAttribute('cy', Y(imr.maxl[1]));
  }

  fetch('figures/gw250114-nohair.json').then(function (r) { return r.json(); }).then(build);
})();
