// Title slide: the words arrive in turn, and the line under the title draws
// itself as two ringdowns of the same black hole.
//
// Both are real: the l = m = 2, n = 0 modes of a Kerr-Newman black hole with
// a/M = 0.557, Q/M = 0.502 (knpert, t17 S7 run a0p557_Q0p502):
//   gravitational-led    M w = 0.51673 - 0.08281 i
//   electromagnetic-led  M w = 0.63595 - 0.08872 i
// over the first 32M. Click the lines to strike the hole again.
(function () {
  var W = 900, H = 90;            // the svg's viewBox
  var T = 32;                     // duration, in M
  var MODES = [
    { cls: 'ring-gw', wr: 0.51673, wi: 0.08281, amp: 1.0 },
    { cls: 'ring-em', wr: 0.63595, wi: 0.08872, amp: 0.62 }
  ];

  var slide = document.getElementById('title');
  var svg = slide.querySelector('.title-ring');
  var NS = 'http://www.w3.org/2000/svg';
  var X1 = W;                     // the lines run the full width

  var paths = MODES.map(function (m, k) {
    var d = '';
    for (var i = 0; i <= 500; i++) {
      var t = T * i / 500;
      var y = m.amp * Math.cos(m.wr * t) * Math.exp(-m.wi * t);
      d += (i ? 'L' : 'M') + (X1 * i / 500).toFixed(1) + ' ' + (H / 2 - y * (H / 2 - 3)).toFixed(1);
    }
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('class', m.cls);
    p.setAttribute('d', d);
    svg.appendChild(p);

    return p;
  });

  // draw the lines from nothing, after `delay` seconds
  function ring(delay) {
    paths.forEach(function (p, k) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.transition = 'none';
      p.style.strokeDashoffset = len;
      p.getBoundingClientRect();     // commit the reset before animating
      p.style.transition = 'stroke-dashoffset 2s cubic-bezier(.25,.6,.3,1) ' + (delay + 0.25 * k) + 's';
      p.style.strokeDashoffset = 0;
    });
  }

  svg.addEventListener('click', function () { ring(0); });

  Deck.on('title', {
    enter: function (sl, dir) {
      var back = dir < 0;
      sl.classList.remove('play');
      sl.classList.toggle('instant', back);
      sl.getBoundingClientRect();
      sl.classList.add('play');
      if (back) paths.forEach(function (p) { p.style.transition = 'none'; p.style.strokeDashoffset = 0; });
      else ring(0.6);
    },
    leave: function (sl) { sl.classList.remove('play'); }
  });
})();
