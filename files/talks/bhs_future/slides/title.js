// Title slide: the words arrive in turn, the painting develops, and the
// line under the title draws itself as a ringdown.
//
// The ringdown is a real one: the l = m = 2 fundamental mode of a Kerr
// black hole with a/M = 0.7 (about the GW150914 remnant), Mw = 0.5326 - 0.0808i,
// over the first 45M after the peak. Click it to strike the hole again.
(function () {
  var W = 560, H = 64;                   // the svg's viewBox
  var T = 45, WR = 0.5326, WI = 0.0808;  // duration (in M) and the mode

  var slide = document.getElementById('title');
  var svg = slide.querySelector('.title-ring');
  var path = svg.querySelector('path');

  var d = '';
  for (var i = 0; i <= 400; i++) {
    var t = T * i / 400;
    var y = Math.cos(WR * t) * Math.exp(-WI * t);
    d += (i ? 'L' : 'M') + (W * i / 400).toFixed(1) + ' ' + (H / 2 - y * (H / 2 - 3)).toFixed(1);
  }
  path.setAttribute('d', d);

  // draw the line from nothing, after `delay` seconds
  function ring(delay) {
    var len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.transition = 'none';
    path.style.strokeDashoffset = len;
    path.getBoundingClientRect();        // commit the reset before animating
    path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.25,.6,.3,1) ' + delay + 's';
    path.style.strokeDashoffset = 0;
  }

  svg.addEventListener('click', function () { ring(0); });

  Deck.on('title', {
    enter: function (sl, dir) {
      var back = dir < 0;
      sl.classList.remove('play');
      sl.classList.toggle('instant', back);
      sl.getBoundingClientRect();
      sl.classList.add('play');
      if (back) { path.style.transition = 'none'; path.style.strokeDashoffset = 0; }
      else ring(0.6);
    },
    leave: function (sl) { sl.classList.remove('play'); }
  });
})();
