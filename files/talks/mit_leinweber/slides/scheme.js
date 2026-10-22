// The perturbation scheme. It starts from the frame the binary slide's
// rewind lands on (binary.js paints it and says where the holes are), moved
// up to leave room for the equation, and marks two things on it:
//   the common horizon   a smooth peanut around both holes: the level set
//                        sum_i R_i^2 / |p - c_i|^2 = 1, with R_i the
//                        horizons padded by PAD
//   the final black hole the Kerr remnant the merger settles into, dashed
// What lights up at which step is all in scheme.css.
(function () {
  var LIFT = 130;        // px the merger frame is moved up
  var ZOOM = 105;        // px per M: closer in than where the rewind stopped
  var PAD = 0.22;        // the common horizon's margin round each hole, in hole radii

  var slide = document.getElementById('scheme');
  var gray = slide.querySelector('.sc-gray');
  var color = slide.querySelector('.sc-color');
  var common = slide.querySelector('.sc-common');
  var final = slide.querySelector('.sc-final');
  var labCommon = slide.querySelector('.sc-label-common');
  var labFinal = slide.querySelector('.sc-label-final');
  [gray, color].forEach(function (c) { c.width = 1920; c.height = 1080; });

  function copy(cv, m) {
    var g = cv.getContext('2d');
    g.clearRect(0, 0, 1920, 1080);
    g.drawImage(m.field, 0, 0, 1920, 1080);   // the waves are stored at low resolution
    g.drawImage(m.front, 0, 0);
  }

  // the peanut, traced along rays from the centre of mass by bisection
  function peanut(m) {
    var hs = m.holes.map(function (h) { return { x: h.x, y: h.y, R: h.r * (1 + PAD) }; });
    var cx = m.centre.x, cy = m.centre.y;
    function f(x, y) {
      return hs.reduce(function (s, h) {
        return s + h.R * h.R / ((x - h.x) * (x - h.x) + (y - h.y) * (y - h.y) + 1e-9);
      }, 0);
    }
    var d = '', top = { x: cx, y: Infinity };
    for (var k = 0; k < 180; k++) {
      var th = 2 * Math.PI * k / 180, ux = Math.cos(th), uy = Math.sin(th);
      var lo = 0, hi = 1000;
      for (var it = 0; it < 40; it++) {
        var mid = (lo + hi) / 2;
        if (f(cx + ux * mid, cy + uy * mid) > 1) lo = mid; else hi = mid;
      }
      var x = cx + ux * lo, y = cy + uy * lo;
      if (y < top.y) top = { x: x, y: y };
      d += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    common.setAttribute('d', d + 'Z');
    return top;
  }

  Deck.on('scheme', {
    enter: function () {
      if (!window.BinaryScene) return;
      var m = BinaryScene.merger(ZOOM, LIFT);
      copy(gray, m);
      copy(color, m);
      var top = peanut(m);
      var cx = m.centre.x, cy = m.centre.y;
      final.setAttribute('cx', cx);
      final.setAttribute('cy', cy);
      final.setAttribute('r', m.rf);

      // labels: the common horizon's above it, the final hole's down and to the right
      labCommon.style.left = (top.x - 120) + 'px';
      labCommon.style.top = (top.y - 70) + 'px';
      labFinal.style.left = (cx + m.rf * 0.9 + 40) + 'px';
      labFinal.style.top = (cy + m.rf * 0.6 + 20) + 'px';
    }
  });
})();
