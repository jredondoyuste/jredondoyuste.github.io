// Theory, two developments, one per press (two more on the next slide):
//   (i)   scattering off a black hole: the stage of the lab page
//         /quadratic.html (two waves in, one out), recorded as a loop, light and
//         dark (figures/qq-stage-*.mp4, made by rec/record.js in the scratchpad),
//         beside the 5-point Compton diagram it computes. A recording, not the
//         live page: the page animates without pause and was too heavy to run
//         inside the deck.
//   (ii)  cubic QNMs (Khera & Yang, 2610.20547)
(function () {
  'use strict';

  var slide = document.getElementById('theory');
  var vids = slide.querySelectorAll('.th-vid');

  // only the video for the current paper plays, and only on this slide
  function current() {
    return slide.querySelector(document.documentElement.dataset.theme === 'dark' ? '.th-vid-dark' : '.th-vid-light');
  }
  function play() {
    vids.forEach(function (v) { if (v !== current()) v.pause(); });
    var v = current(); if (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  }
  function pause() { vids.forEach(function (v) { v.pause(); }); }
  new MutationObserver(function () { if (slide.classList.contains('active')) play(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  Deck.on('theory', { enter: play, leave: pause });

  // The 5-point Compton diagram: the black hole as a heavy line, two
  // gravitons in, one out, through the blob that is the amplitude.
  function wavy(x1, y1, x2, y2, n, amp) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, d = '';
    for (var i = 0; i <= 120; i++) {
      var s = i / 120, w = amp * Math.sin(2 * Math.PI * n * s);
      d += (i ? 'L' : 'M') + (x1 + dx * s - uy * w).toFixed(1) + ' ' + (y1 + dy * s + ux * w).toFixed(1);
    }
    return d;
  }
  var C = [210, 190];                                         // the blob
  var g = '';
  g += '<line class="fd-heavy" x1="20" y1="' + (C[1] + 4) + '" x2="400" y2="' + (C[1] + 4) + '"/>';
  g += '<line class="fd-heavy" x1="20" y1="' + (C[1] - 4) + '" x2="400" y2="' + (C[1] - 4) + '"/>';
  [[40, 30, 'ω₁', -20, 0], [20, 105, 'ω₂', -6, -18], [390, 40, 'ω₁ + ω₂', -40, -14]].forEach(function (p, i) {
    var x2 = C[0] + (p[0] - C[0]) * 0.22, y2 = C[1] + (p[1] - C[1]) * 0.22;
    g += '<path class="fd-grav' + (i === 2 ? ' fd-out' : '') + '" d="' + wavy(p[0], p[1], x2, y2, 7, 6) + '"/>';
    g += '<text class="fd-lab' + (i === 2 ? ' fd-out' : '') + '" x="' + (p[0] + p[3]) + '" y="' + (p[1] + p[4]) + '">' + p[2] + '</text>';
  });
  g += '<circle class="fd-blob" cx="' + C[0] + '" cy="' + C[1] + '" r="34"/>';
  g += '<text class="fd-lab fd-bh" x="20" y="' + (C[1] + 44) + '">black hole</text>';
  slide.querySelector('.fd').innerHTML = g;
})();
