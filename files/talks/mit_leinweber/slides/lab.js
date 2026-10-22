// "If I had a black hole in the lab": the questions pop up one at a time,
// in the order they sit in the HTML, then the verdict lights up the ones
// ringdown can answer. → while they're still popping skips to the end;
// → after that moves on. Coming back with ← shows the end straight away.
(function () {
  var GAP_MIN = 1000, GAP_VAR = 800;  // ms between questions: 1.0–1.8 s
  var FIRST = 900;                    // let the comic land first
  var VERDICT = 1600;                 // pause after the last one

  var slide = document.getElementById('lab');
  var comic = slide.querySelector('.lab-comic');
  var bubbles = Array.prototype.slice.call(slide.querySelectorAll('.bubble'));
  var timer = null, shown = 0, done = false;

  // Each bubble's tail: a wedge from its edge toward the comic's centre.
  // The wedge's base sits a little inside the bubble, so its fill covers
  // the border there and the two read as one outline.
  function tails() {
    var cx = comic.offsetLeft + comic.offsetWidth / 2;
    var cy = comic.offsetTop + comic.offsetHeight / 2;
    bubbles.forEach(function (b) {
      var w = b.offsetWidth, h = b.offsetHeight, r = 44;
      var ux = cx - (b.offsetLeft + w / 2), uy = cy - (b.offsetTop + h / 2);
      var n = Math.hypot(ux, uy); ux /= n; uy /= n;

      // where the ray from the bubble's centre leaves it, kept off the corners
      var t = Math.min(Math.abs(w / 2 / ux), Math.abs(h / 2 / uy));
      var px = w / 2 + ux * t, py = h / 2 + uy * t;
      if (Math.abs(w / 2 / ux) <= Math.abs(h / 2 / uy)) py = Math.max(r, Math.min(h - r, py));
      else px = Math.max(r, Math.min(w - r, px));

      var L = 56, half = 15, inset = 7;
      var ax = px + ux * L - uy * 10, ay = py + uy * L + ux * 10;   // a little askew, like a drawn one
      var b1x = px - ux * inset - uy * half, b1y = py - uy * inset + ux * half;
      var b2x = px - ux * inset + uy * half, b2y = py - uy * inset - ux * half;

      var svg = b.querySelector('.bubble-tail');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'bubble-tail');
        svg.setAttribute('aria-hidden', 'true');
        svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
        b.appendChild(svg);
      }
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      svg.firstChild.setAttribute('d',
        'M' + b1x.toFixed(1) + ' ' + b1y.toFixed(1) +
        'L' + ax.toFixed(1) + ' ' + ay.toFixed(1) +
        'L' + b2x.toFixed(1) + ' ' + b2y.toFixed(1));
      // pop out of the tail's tip, as if said from the comic
      b.style.transformOrigin = ax.toFixed(0) + 'px ' + ay.toFixed(0) + 'px';
    });
  }

  function stop() { clearTimeout(timer); timer = null; }

  function popNext() {
    if (shown < bubbles.length) {
      bubbles[shown++].classList.add('on');
      timer = setTimeout(popNext, shown < bubbles.length ? GAP_MIN + Math.random() * GAP_VAR : VERDICT);
    } else {
      slide.classList.add('judged');
      done = true;
      timer = null;
    }
  }

  function reset() {
    stop();
    shown = 0; done = false;
    slide.classList.remove('judged');
    bubbles.forEach(function (b) { b.classList.remove('on'); });
  }

  function finish() {
    stop();
    shown = bubbles.length;
    bubbles.forEach(function (b) { b.classList.add('on'); });
    slide.classList.add('judged');
    done = true;
  }

  Deck.on('lab', {
    enter: function (sl, dir) {
      sl.classList.add('instant');      // reset without the bubbles shrinking away
      reset();
      tails();
      sl.getBoundingClientRect();
      if (dir < 0) { finish(); return; }
      sl.classList.remove('instant');
      timer = setTimeout(popNext, FIRST);
    },
    leave: function () { stop(); },
    next: function () {
      if (done) return false;
      slide.classList.remove('instant');
      finish();
      return true;
    }
  });
})();
