// GW250114, two analyses: LVK's figure (an image, left, static) and
// silencio on the same axes (f in Hz, tau in ms), right, walking through
// start times t0 = 0 … 10 M: first with one damped sinusoid, then (→) with
// two. GR's 220, 221 and 440 (from the IMR posterior) are ringed, since at
// this scale they are dots. The walks are walk.js.
//
//   → while a walk plays jumps to its end; click the plot to replay
(function () {
  'use strict';

  var slide = document.getElementById('side250');
  var $ = function (s) { return slide.querySelector(s); };
  var BOX = { x0: 1180, x1: 1780, y0: 250, y1: 830 };

  var one = Walk({
    url: 'figures/gw250114-walk1.json', box: BOX,
    runs: $('.sd-one'), axes: $('.sd-axes'), gr: $('.sd-gr'), clip: $('.sd-box'), ring: true,
    grAt: { '220': [26, 8, 'start'], '221': [26, 30, 'start'], '440': [0, -26, 'middle'] },
    trail: false, tval: $('.sd-tval')
  });
  var two = Walk({
    url: 'figures/gw250114-walk2.json', box: BOX,
    runs: $('.sd-two'), trail: false, tval: $('.sd-tval')
  });

  function current() { return (+slide.dataset.s || 0) === 0 ? one : two; }

  // the deck marks the step on the slide: start the two-mode walk there
  var seen = 0;
  new MutationObserver(function () {
    var s = +slide.dataset.s || 0;
    if (s === seen) return;
    seen = s;
    if (s === 1) { one.stop(); two.play(); }
    else { two.stop(); one.finish(); }
  }).observe(slide, { attributes: true, attributeFilter: ['data-s'] });

  $('.sd-plot').addEventListener('click', function () { current().play(); });

  Deck.on('side250', {
    enter: function (sl, dir) {
      seen = dir < 0 ? 1 : 0;
      if (dir < 0) two.finish(); else one.play();
    },
    leave: function () { one.stop(); two.stop(); },
    next: function () {
      var w = current();
      if (w.done()) return false;
      w.finish();
      return true;
    }
  });
})();
