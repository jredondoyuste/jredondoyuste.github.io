// A GW250114-like signal in the Einstein Telescope (a mock).
//
//   step 0  the same waveform in mock whitened noise twice: LIGO today,
//           ET tomorrow. The waveform is GWOSC's NR waveform for GW150914
//           (figures/gw150914-strain.json), a near twin of GW250114.
//   step 1  the ringdown on a log scale: the 220 and 221 decaying against
//           each detector's noise floor. Everything above a floor is
//           measurable; ET keeps both modes for longer.
//
// The two named choices:
//   PEAK_SIGMA  how far the peak of GW250114 stands above the noise in the
//               whitened LIGO data: 13.6 sigma in L1 (measured from the open
//               data, ringdowns.py)
//   ET_GAIN     ET's sensitivity over LIGO's near 250 Hz, roughly 10
// The 221 starts at the 220's amplitude (an illustrative choice); damping
// times are GW250114's GR values, 4.08 ms and 1.35 ms (silencio kerr9).
(function () {
  'use strict';

  var PEAK_SIGMA = 13.6, ET_GAIN = 10;
  var TAU220 = 4.08, TAU221 = 1.35, A221 = 1;           // ms, ms, relative to the 220
  var TW = [-0.12, 0.035];                              // s, the traces' window
  var TR = { x0: 330, x1: 1780 };                       // traces, px
  var ROW = [{ y: 330, label: 'LIGO, 2025' }, { y: 640, label: 'Einstein Telescope (mock)' }];
  var LOG = { x0: 330, x1: 1500, y0: 190, y1: 860, t: [0, 25], a: [1e-3, 1] };

  var slide = document.getElementById('et');
  var $ = function (s) { return slide.querySelector(s); };

  // a seeded Gaussian, so the noise is the same every time the slide shows
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function gauss() { return Math.sqrt(-2 * Math.log(rnd())) * Math.cos(2 * Math.PI * rnd()); }

  function traces(J) {
    var t = [], s = [];
    for (var i = 0; i < J.t.length; i++) if (J.t[i] >= TW[0] && J.t[i] <= TW[1]) { t.push(J.t[i]); s.push(J.nr[i]); }
    var peak = s.reduce(function (m, v) { return Math.max(m, Math.abs(v)); }, 0);
    var X = function (tt) { return TR.x0 + (tt - TW[0]) / (TW[1] - TW[0]) * (TR.x1 - TR.x0); };
    var h = '';
    ROW.forEach(function (row, k) {
      var sigma = peak / PEAK_SIGMA / (k ? ET_GAIN : 1);
      var n = s.map(gauss), d = '', w = '';
      // band-limit the noise a little, as whitened data looks
      for (var i = 1; i < n.length - 1; i++) n[i] = (n[i - 1] + 2 * n[i] + n[i + 1]) / Math.sqrt(6);
      var scale = 120 / peak;
      t.forEach(function (tt, i) {
        d += (i ? 'L' : 'M') + X(tt).toFixed(1) + ' ' + (row.y - scale * (s[i] + sigma * n[i])).toFixed(1);
        w += (i ? 'L' : 'M') + X(tt).toFixed(1) + ' ' + (row.y - scale * s[i]).toFixed(1);
      });
      h += '<path class="et-data" d="' + d + '"/><path class="et-sig" d="' + w + '"/>' +
           '<text class="et-row" x="' + TR.x0 + '" y="' + (row.y - 150) + '">' + row.label + '</text>';
    });
    $('.et-traces').innerHTML = h;
  }

  function logplot() {
    var L = LOG;
    function X(t) { return L.x0 + (t - L.t[0]) / (L.t[1] - L.t[0]) * (L.x1 - L.x0); }
    function Y(a) { return L.y1 - (Math.log10(a) - Math.log10(L.a[0])) / (Math.log10(L.a[1]) - Math.log10(L.a[0])) * (L.y1 - L.y0); }
    var h = '<rect class="et-box" x="' + L.x0 + '" y="' + L.y0 + '" width="' + (L.x1 - L.x0) + '" height="' + (L.y1 - L.y0) + '"/>';
    for (var t = 0; t <= L.t[1]; t += 5) {
      h += '<text class="et-tick" x="' + X(t) + '" y="' + (L.y1 + 40) + '" text-anchor="middle">' + t + '</text>';
    }
    [1e-3, 1e-2, 1e-1, 1].forEach(function (a) {
      h += '<text class="et-tick" x="' + (L.x0 - 18) + '" y="' + (Y(a) + 8) + '" text-anchor="end">' + (a === 1 ? '1' : '10' + '<tspan dy="-12" font-size="18">' + Math.log10(a) + '</tspan>') + '</text>';
    });
    h += '<text class="et-tick" x="' + (L.x0 + L.x1) / 2 + '" y="' + (L.y1 + 84) + '" text-anchor="middle">time after the peak  [ms]</text>';
    h += '<text class="et-tick" transform="translate(' + (L.x0 - 96) + ',' + (L.y0 + L.y1) / 2 + ') rotate(-90)" text-anchor="middle">amplitude / peak</text>';

    // noise floors: below them, nothing is measurable
    [[1 / PEAK_SIGMA, 'LIGO noise', 'et-floor-ligo'], [1 / PEAK_SIGMA / ET_GAIN, 'ET noise', 'et-floor-et']].forEach(function (f) {
      h += '<rect class="' + f[2] + '-band" x="' + L.x0 + '" y="' + Y(f[0]) + '" width="' + (L.x1 - L.x0) + '" height="' + (L.y1 - Y(f[0])) + '"/>';
      h += '<line class="' + f[2] + '" x1="' + L.x0 + '" x2="' + L.x1 + '" y1="' + Y(f[0]) + '" y2="' + Y(f[0]) + '"/>';
      h += '<text class="' + f[2] + '-label" x="' + (L.x1 + 18) + '" y="' + (Y(f[0]) + 9) + '">' + f[1] + '</text>';
    });

    // the two modes, straight lines on a log scale
    [[1, TAU220, 'et-m220', '220'], [A221, TAU221, 'et-m221', '221']].forEach(function (m) {
      var t1 = Math.min(L.t[1], m[1] * Math.log(m[0] / L.a[0]));
      h += '<line class="' + m[2] + '" x1="' + X(0) + '" y1="' + Y(m[0]) + '" x2="' + X(t1) + '" y2="' + Y(m[0] * Math.exp(-t1 / m[1])) + '"/>';
      // where each mode drops under each floor
      [1 / PEAK_SIGMA, 1 / PEAK_SIGMA / ET_GAIN].forEach(function (fl) {
        var tc = m[1] * Math.log(m[0] / fl);
        if (tc < L.t[1]) h += '<circle class="' + m[2] + '-dot" cx="' + X(tc) + '" cy="' + Y(fl) + '" r="7"/>';
      });
    });
    h += '<text class="et-m220-label" x="' + X(9) + '" y="' + Y(Math.exp(-9 / TAU220)) + '" dy="-18">220</text>';
    h += '<text class="et-m221-label" x="' + X(3.2) + '" y="' + Y(A221 * Math.exp(-3.2 / TAU221)) + '" dy="-18" text-anchor="end">221</text>';
    $('.et-log').innerHTML = h;
  }

  fetch('figures/gw150914-strain.json').then(function (r) { return r.json(); }).then(function (J) {
    traces(J); logplot();
  });
})();
