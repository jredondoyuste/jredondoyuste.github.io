// The sky: a drifting star field on wide screens, and — rarely — a merger.
//
// Everything visual lives in style.css. This file does three things: it
// injects the layers (so no page carries decorative markup), it takes them
// away again below 1100px, and it schedules the merger.
//
// Cost when idle is one pending timer. The drift itself is pure CSS on the
// compositor. Nothing here runs at all on narrow screens, for readers who
// asked for reduced motion, or while the tab is in the background.
(function () {
  var WIDE   = window.matchMedia('(min-width: 1100px)');
  var CALM   = window.matchMedia('(prefers-reduced-motion: reduce)');

  // how long between mergers, in ms — long enough that it stays a surprise
  var GAP_MIN = 50000, GAP_VAR = 100000;

  var sky = null, timer = null, due = 0;

  function build() {
    if (sky || !WIDE.matches) return;
    sky = document.createElement('div');
    sky.className = 'sky';
    sky.setAttribute('aria-hidden', 'true');
    // four populations, each with its own heading and speed — see style.css
    sky.innerHTML = '<div class="sky-layer sky-a"></div>' +
                    '<div class="sky-layer sky-b"></div>' +
                    '<div class="sky-layer sky-c"></div>' +
                    '<div class="sky-layer sky-d"></div>';
    document.body.insertBefore(sky, document.body.firstChild);
    schedule();
  }

  function teardown() {
    if (sky) { sky.parentNode.removeChild(sky); sky = null; }
    clearTimeout(timer); timer = null;
  }

  // The countdown is a DEADLINE, not a fresh timer. Leaving the tab used to
  // clear the timeout and coming back used to start a brand new 50-150s
  // wait — so anyone who switches tabs while reading (i.e. everyone) could
  // go a whole session without ever seeing one. Now the clock keeps running
  // while you're away; if it came due, it fires shortly after you return.
  function schedule(ms) {
    clearTimeout(timer);
    if (!sky || CALM.matches) return;
    if (ms == null) ms = GAP_MIN + Math.random() * GAP_VAR;
    due = Date.now() + ms;
    timer = setTimeout(merge, ms);
  }

  function merge(force) {
    if (!sky || CALM.matches) return;
    // Re-check the width here rather than trusting that the media-query
    // 'change' listener fired. If it ever doesn't, the CSS still hides the
    // sky, and without this we'd animate into a display:none box forever.
    if (!WIDE.matches) { teardown(); return; }
    // don't spend a merger on a tab nobody is looking at — wait for focus
    if (document.hidden && !force) { schedule(); return; }

    var m = document.createElement('div');
    m.className = 'merger';
    // Right of the measure, so the inspiral never lands under the text —
    // but not so far left that the density mask dims it to nothing. Below
    // ~68vw the mask is still under half opacity and it reads as a smudge.
    m.style.left = (68 + Math.random() * 24) + 'vw';
    m.style.top  = (16 + Math.random() * 64) + 'vh';
    m.innerHTML = '<i class="m-a"></i><i class="m-b"></i>' +
                  '<i class="m-flash"></i><i class="m-ring"></i>';
    sky.appendChild(m);

    // 1.9s inspiral + 1.88s delay + 1.8s wavefront, plus a little slack
    setTimeout(function () {
      if (m.parentNode) m.parentNode.removeChild(m);
    }, 4200);

    schedule();
  }

  function sync() { WIDE.matches ? build() : teardown(); }

  // type merger() in the console to see one on demand — waiting a minute
  // or two for the real thing gets old while you're tuning it
  window.merger = function () {
    if (!WIDE.matches) return 'the sky only shows at 1100px and up';
    if (!sky) return 'no sky here';
    merge(true);
    return 'coalescing';
  };

  document.addEventListener('visibilitychange', function () {
    if (!sky) return;
    if (document.hidden) {
      // stop the drift and the pending merger, but KEEP the deadline
      sky.classList.add('is-idle');
      clearTimeout(timer);
      timer = null;
    } else {
      sky.classList.remove('is-idle');
      var left = due - Date.now();
      // if it fell due while you were away, show it soon — but not instantly,
      // which would look like the page was waiting to pounce
      schedule(left > 0 ? left : 2000 + Math.random() * 5000);
    }
  });

  if (WIDE.addEventListener) WIDE.addEventListener('change', sync);
  else if (WIDE.addListener) WIDE.addListener(sync);   // Safari < 14

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }
})();
