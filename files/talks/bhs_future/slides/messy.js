// Data is messy: one damped sinusoid fitted to GW150914 from t0 = 0 to
// 10 M after the peak (silencio; Cheung & Redondo-Yuste, to appear). The
// posterior walks; passed start times stay as fading outlines. The walk
// itself is walk.js.
//
//   → while it plays jumps to the end; click the plot to replay
//   messy(4) in the console shows t0 = 4 M and stops there
(function () {
  'use strict';

  var slide = document.getElementById('messy');
  var $ = function (s) { return slide.querySelector(s); };

  var w = Walk({
    url: 'figures/gw150914-walk1.json',
    box: { x0: 200, x1: 1120, y0: 175, y1: 860 },
    runs: $('.ms-runs'), axes: $('.ms-axes'), gr: $('.ms-gr'), clip: $('.ms-box'),
    grAt: { '220': [36, 10, 'start'], '221': [36, 10, 'start'] },
    trail: true, tval: $('.ms-tval'), beads: $('.ms-beads')
  });

  $('.ms-plot').addEventListener('click', w.play);

  Deck.on('messy', {
    enter: function (sl, dir) { if (dir < 0) w.finish(); else w.play(); },
    leave: function () { w.stop(); },
    next: function () {
      if (w.done()) return false;
      w.finish();
      return true;
    }
  });

  window.messy = function (n) { w.stop(); w.show(n); return 't0 = ' + n + ' M'; };
})();
