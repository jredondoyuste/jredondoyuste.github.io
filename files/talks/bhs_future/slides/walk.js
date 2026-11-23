// A start-time walk: silencio's posteriors for t0 = 0 … 10 M after the peak,
// in (f, tau), one start time after another, with GR's predictions under
// them. Shared by the "data is messy" slide (messy.js) and the GW250114
// side-by-side (side250.js).
//
//   var w = Walk({
//     url:   'figures/….json',   contours built offline (make_walk.py)
//     box:   {x0, x1, y0, y1},   the plot on the slide, px
//     runs:  <g>,                where the posteriors are drawn
//     clip:  <rect> or null,     the clipPath rect the runs are clipped to
//     axes:  <g> or null,        draw the axes here (once per plot)
//     gr:    <g> or null,        draw GR's predictions here
//     grAt:  {'220': [dx, dy, anchor], …},  where each GR label goes
//     ring:  true,               ring GR's regions (when they are dots)
//     trail: true,               keep passed start times as fading outlines
//     tval:  element,            gets the current t0
//     beads: element or null,    one bead per start time
//   });
//   w.play()  w.finish()  w.stop()  w.done()  w.show(k)
(function () {
  'use strict';

  var STEP_MS = 900;     // per start time
  var FIRST_MS = 700;    // before the first
  var FADE = 0.72;       // each older outline keeps this much of the last

  window.Walk = function (o) {
    var J = null, k = 0, timer = null, isDone = false, pending = null, B = o.box;
    var F, T;
    function X(f) { return B.x0 + (f - F[0]) / (F[1] - F[0]) * (B.x1 - B.x0); }
    function Y(t) { return B.y1 - (t - T[0]) / (T[1] - T[0]) * (B.y1 - B.y0); }
    function d(polys) {
      return polys.map(function (p) {
        return p.map(function (q, i) { return (i ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1); }).join('') + 'Z';
      }).join('');
    }

    function axes() {
      // numbers just outside the box, the names well outside: they never meet
      var h = '<rect x="' + B.x0 + '" y="' + B.y0 + '" width="' + (B.x1 - B.x0) + '" height="' + (B.y1 - B.y0) + '"/>';
      var fs = F[1] - F[0] > 300 ? 100 : 50;
      for (var f = Math.ceil(F[0] / fs) * fs; f <= F[1]; f += fs) {
        h += '<line x1="' + X(f) + '" x2="' + X(f) + '" y1="' + B.y1 + '" y2="' + (B.y1 + 10) + '"/>';
        h += '<text x="' + X(f) + '" y="' + (B.y1 + 40) + '" text-anchor="middle">' + f + '</text>';
      }
      for (var t = Math.ceil(T[0] / 2) * 2; t <= T[1]; t += 2) {
        h += '<line x1="' + (B.x0 - 10) + '" x2="' + B.x0 + '" y1="' + Y(t) + '" y2="' + Y(t) + '"/>';
        h += '<text x="' + (B.x0 - 18) + '" y="' + (Y(t) + 8) + '" text-anchor="end">' + t + '</text>';
      }
      h += '<text x="' + (B.x0 + B.x1) / 2 + '" y="' + (B.y1 + 84) + '" text-anchor="middle">f  [Hz]</text>';
      h += '<text transform="translate(' + (B.x0 - 80) + ',' + (B.y0 + B.y1) / 2 + ') rotate(-90)" text-anchor="middle">τ  [ms]</text>';
      o.axes.innerHTML = h;
    }

    function gr() {
      var g = '';
      Object.keys(J.gr).forEach(function (key) {
        var b = J.gr[key], x = X(b.maxl[0]), y = Y(b.maxl[1]), p = (o.grAt || {})[key] || [24, 8, 'start'];
        g += '<path d="' + d(b.c90) + '"/>';
        if (o.ring) g += '<circle cx="' + x + '" cy="' + y + '" r="11"/>';
        g += '<text x="' + (x + p[0]) + '" y="' + (y + p[1]) + '" text-anchor="' + p[2] + '">GR ' + key + '</text>';
      });
      o.gr.innerHTML = g;
    }

    function build() {
      F = J.box.f; T = J.box.tau;
      if (o.clip) {                                 // the clipPath's rect: the plot box
        o.clip.setAttribute('x', B.x0); o.clip.setAttribute('y', B.y0);
        o.clip.setAttribute('width', B.x1 - B.x0); o.clip.setAttribute('height', B.y1 - B.y0);
      }
      if (o.axes) axes();
      if (o.gr) gr();
      o.runs.innerHTML = J.runs.map(function (r) {
        return '<g class="wk-run" style="opacity:0">' + r.modes.map(function (m, i) {
          return '<g class="wk-m' + i + '"><path class="c90" d="' + d(m.c90) + '"/><path class="c50" d="' + d(m.c50) + '"/></g>';
        }).join('') + '</g>';
      }).join('');
      if (o.beads) o.beads.innerHTML = J.runs.map(function (r) { return '<span class="wk-bead">' + r.t + '</span>'; }).join('');
    }

    function show(n) {
      k = n;
      var gs = o.runs.querySelectorAll('.wk-run'), bs = o.beads ? o.beads.querySelectorAll('.wk-bead') : [];
      for (var i = 0; i < gs.length; i++) {
        gs[i].classList.toggle('past', i < n);
        gs[i].style.opacity = i > n ? 0 : i === n ? 1 : o.trail ? 0.55 * Math.pow(FADE, n - i - 1) : 0;
        if (bs[i]) { bs[i].classList.toggle('past', i < n); bs[i].classList.toggle('here', i === n); }
      }
      if (o.tval) o.tval.textContent = J.runs[n].t;
    }

    function stop() { clearTimeout(timer); timer = null; }

    function play() {
      if (!J) { pending = play; return; }
      stop(); isDone = false; show(0);
      var first = true;
      (function step() {
        timer = setTimeout(function () {
          first = false;
          if (k + 1 < J.runs.length) { show(k + 1); step(); }
          else { isDone = true; timer = null; }
        }, first ? FIRST_MS : STEP_MS);
      })();
    }

    function finish() {
      if (!J) { pending = finish; return; }
      stop(); show(J.runs.length - 1); isDone = true;
    }

    fetch(o.url).then(function (r) { return r.json(); }).then(function (j) {
      J = j; build();
      if (pending) { var p = pending; pending = null; p(); }
    });

    return { play: play, finish: finish, stop: stop, show: show, done: function () { return isDone; } };
  };
})();
