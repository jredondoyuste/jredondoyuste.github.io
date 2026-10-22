// The graveyard: every confident GWOSC event (GWTC-1 … GWTC-5), its two
// components joined to the remnant on a log mass axis, sorted by remnant
// mass. Then (→) the events LVK analysed with ringdown methods in their
// tests of GR (GW150914 to GWTC-5.0) light up.
(function () {
  'use strict';

  var BOX = { x0: 230, x1: 1690, y0: 165, y1: 860 };
  var M = [1, 300];           // M_sun, log axis
  var NS = 3;                 // below this, a component is drawn as a neutron star

  var slide = document.getElementById('grave');
  var $ = function (s) { return slide.querySelector(s); };

  function Y(m) { return BOX.y1 - (Math.log(m) - Math.log(M[0])) / (Math.log(M[1]) - Math.log(M[0])) * (BOX.y1 - BOX.y0); }

  function build(J) {
    var ev = J.events.filter(function (e) { return e.mf; })
                     .sort(function (a, b) { return a.mf - b.mf; });
    var n = ev.length, dx = (BOX.x1 - BOX.x0) / n;
    var a = '';
    [1, 3, 10, 30, 100, 300].forEach(function (m) {
      a += '<line x1="' + BOX.x0 + '" x2="' + BOX.x1 + '" y1="' + Y(m) + '" y2="' + Y(m) + '" class="gv-grid"/>';
      a += '<text x="' + (BOX.x0 - 18) + '" y="' + (Y(m) + 8) + '" text-anchor="end">' + m + '</text>';
    });
    a += '<text transform="translate(' + (BOX.x0 - 90) + ',' + (BOX.y0 + BOX.y1) / 2 + ') rotate(-90)" text-anchor="middle">mass  [M☉]</text>';
    $('.gv-axes').innerHTML = a;

    var h = '';
    ev.forEach(function (e, i) {
      var x = BOX.x0 + (i + 0.5) * dx, yf = Y(e.mf), cls = 'gv-ev' + (e.rd ? ' gv-rd' : '');
      h += '<g class="' + cls + '">';
      [e.m1, e.m2].forEach(function (m, k) {
        var xs = x + (k ? 1 : -1) * dx * 0.28;
        h += '<line x1="' + xs.toFixed(1) + '" y1="' + Y(m).toFixed(1) + '" x2="' + x.toFixed(1) + '" y2="' + yf.toFixed(1) + '"/>';
        h += '<circle class="' + (m < NS ? 'gv-ns' : 'gv-bh') + '" cx="' + xs.toFixed(1) + '" cy="' + Y(m).toFixed(1) + '" r="3.2"/>';
      });
      h += '<circle class="gv-final ' + (e.mf < NS ? 'gv-ns' : 'gv-bh') + '" cx="' + x.toFixed(1) + '" cy="' + yf.toFixed(1) + '" r="4.5"/>';
      h += '</g>';
    });
    $('.gv-events').innerHTML = h;
    $('.gv-n').textContent = n;
    $('.gv-nrd').textContent = ev.filter(function (e) { return e.rd; }).length;
  }

  fetch('figures/graveyard.json').then(function (r) { return r.json(); }).then(build);
})();
