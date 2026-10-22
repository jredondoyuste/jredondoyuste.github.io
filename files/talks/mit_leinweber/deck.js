// The deck: scaling, keys, steps, math, and the progress bar.
//
// The slides are the <section class="slide"> blocks in the page, in order,
// grouped into parts by <div class="part" data-name="…">. Nothing here
// needs editing to write a talk; the keys are:
//
//   → space PageDown   next step, then next slide (clickers send these)
//   ← PageUp           back
//   Home End           first / last slide
//   F                  full screen (also the corners icon, top right)
//   T                  light / dark (also the sun, top right)
//   B  .               blank the screen (press again to come back)
//   P                  hide / show the progress bar
//
// The address bar keeps the slide number (#7), so a reload stays put.
// Click or drag on the progress bar to jump.
(function () {
  'use strict';

  var deck, slides = [], parts = [], steps = [], beads = [];
  var cur = -1, s = 0;

  var NEXT = { ArrowRight: 1, ArrowDown: 1, ' ': 1, PageDown: 1 };
  var PREV = { ArrowLeft: 1, ArrowUp: 1, PageUp: 1 };

  function fit() {
    var k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var x = (window.innerWidth - 1920 * k) / 2;
    var y = (window.innerHeight - 1080 * k) / 2;
    deck.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + k + ')';
  }

  // [data-step] elements appear at their step; the slide itself carries the
  // current step as data-s, for CSS that restyles rather than reveals
  function showSteps() {
    slides[cur].dataset.s = s;
    slides[cur].querySelectorAll('[data-step]').forEach(function (el) {
      el.classList.toggle('shown', Number(el.dataset.step) <= s);
    });
  }

  // ----- slides that move ------------------------------------------------
  // A slide with an id can take hooks, from a script after deck.js:
  //
  //   Deck.on('lab', {
  //     enter: function (slide, dir) {…},  // arrived; dir is -1 coming back
  //     leave: function (slide) {…},       // stop timers here
  //     next:  function (slide) {…}        // return true to keep the slide
  //   });                                  //   (e.g. skip an animation to its end)

  var hooks = {};

  function hook(i, name, arg) {
    var h = slides[i] && hooks[slides[i].id];
    return h && h[name] ? h[name](slides[i], arg) : undefined;
  }

  window.Deck = {
    on: function (id, h) {
      hooks[id] = h;
      // registered after the deck already landed on this slide
      if (cur >= 0 && slides[cur].id === id) hook(cur, 'enter', 1);
    }
  };

  function go(i, step, dir) {
    if (i < 0 || i >= slides.length) return;
    if (i !== cur) {
      if (cur >= 0) {
        hook(cur, 'leave');
        slides[cur].classList.remove('active');
      }
      cur = i;
      slides[cur].classList.add('active');
      history.replaceState(null, '', '#' + (cur + 1));
      hook(cur, 'enter', dir || 1);
    }
    s = Math.max(0, Math.min(step, steps[cur]));
    showSteps();
    paintBar();
  }

  function next() {
    if (hook(cur, 'next')) return;
    if (s < steps[cur]) go(cur, s + 1);
    else go(cur + 1, 0);
  }

  function prev() {
    if (s > 0) go(cur, s - 1);
    else if (cur > 0) go(cur - 1, steps[cur - 1], -1);   // arrive with everything shown
  }

  // ----- the bar ----------------------------------------------------------

  function buildBar() {
    var bar = document.createElement('div');
    bar.className = 'deck-bar';
    bar.setAttribute('aria-hidden', 'true');

    parts.forEach(function (p) {
      var el = document.createElement('div');
      el.className = 'bar-part';
      el.style.setProperty('--n', p.slides.length);
      el.innerHTML = '<div class="bar-line"></div><div class="bar-fill"></div>' +
                     '<div class="bar-beads"></div><div class="bar-label"></div>';
      el.querySelector('.bar-label').textContent = p.name;
      p.slides.forEach(function () {
        var b = document.createElement('div');
        b.className = 'bar-bead';
        el.querySelector('.bar-beads').appendChild(b);
        beads.push(b);
      });
      p.el = el;
      bar.appendChild(el);
    });

    var count = document.createElement('div');
    count.className = 'deck-count';

    var blank = document.createElement('div');
    blank.className = 'deck-blank';

    deck.appendChild(bar);
    deck.appendChild(count);
    deck.appendChild(blank);

    // the bead nearest the pointer — measured on screen, so it works at any scale
    function nearest(e) {
      var best = 0, d = Infinity;
      beads.forEach(function (b, i) {
        var r = b.getBoundingClientRect();
        var dd = Math.abs(e.clientX - (r.left + r.width / 2));
        if (dd < d) { d = dd; best = i; }
      });
      return best;
    }

    bar.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      bar.setPointerCapture(e.pointerId);
      bar.classList.add('dragging');
      go(nearest(e), 0);
    });
    bar.addEventListener('pointermove', function (e) {
      if (!bar.hasPointerCapture(e.pointerId)) return;
      var i = nearest(e);
      if (i !== cur) go(i, 0);
    });
    function end(e) {
      bar.classList.remove('dragging');
      if (bar.hasPointerCapture(e.pointerId)) bar.releasePointerCapture(e.pointerId);
    }
    bar.addEventListener('pointerup', end);
    bar.addEventListener('pointercancel', end);
  }

  function paintBar() {
    beads.forEach(function (b, i) {
      b.classList.toggle('past', i < cur);
      b.classList.toggle('here', i === cur);
    });
    parts.forEach(function (p) {
      var first = p.start, n = p.slides.length;
      var here = cur >= first && cur < first + n;
      p.el.classList.toggle('here', here);
      // ink the line up to the current bead (beads sit at the centres of n equal cells)
      var f = cur >= first + n ? 1 : here ? (cur - first + 0.5) / n : 0;
      p.el.querySelector('.bar-fill').style.width = (100 * f) + '%';
    });
    deck.querySelector('.deck-count').textContent = (cur + 1) + ' / ' + slides.length;
  }

  // ----- setup ------------------------------------------------------------

  // "Cheung+ (2401.12345)" becomes a link to that paper's arXiv page
  function linkCites() {
    deck.querySelectorAll('.cite').forEach(function (c) {
      if (c.querySelector('a')) return;
      var ids = c.textContent.match(/\b\d{4}\.\d{4,5}\b/g);
      if (!ids || ids.length !== 1) return;
      var a = document.createElement('a');
      a.href = 'https://arxiv.org/abs/' + ids[0];
      a.target = '_blank';
      while (c.firstChild) a.appendChild(c.firstChild);
      c.appendChild(a);
    });
  }

  // each slide gets its part's name above the title
  function kickers() {
    parts.forEach(function (p) {
      p.slides.forEach(function (sl) {
        var h = sl.querySelector(':scope > h1.title');
        if (!h || !p.name || sl.querySelector('.kicker')) return;
        var k = document.createElement('div');
        k.className = 'kicker';
        k.textContent = p.name;
        sl.insertBefore(k, h);
      });
    });
  }

  function onKey(e) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    var k = e.key;
    if (NEXT[k]) next();
    else if (PREV[k]) prev();
    else if (k === 'Home') go(0, 0);
    else if (k === 'End') go(slides.length - 1, 0);
    else if (k === 'f' || k === 'F') deck.querySelector('.deck-full').click();
    else if (k === 't' || k === 'T') deck.querySelector('.deck-theme').click();
    else if (k === 'b' || k === 'B' || k === '.') deck.classList.toggle('blanked');
    else if (k === 'p' || k === 'P') deck.classList.toggle('bar-hidden');
    else return;
    e.preventDefault();
  }

  function start() {
    deck = document.querySelector('.deck');

    // parts: every <div class="part">; slides outside one form an unnamed part
    var start = 0;
    Array.prototype.forEach.call(deck.children, function (el) {
      var list = el.classList.contains('part') ? el.querySelectorAll('.slide')
               : el.classList.contains('slide') ? [el] : [];
      if (!list.length) return;
      var name = el.classList.contains('part') ? (el.dataset.name || '') : '';
      var last = parts[parts.length - 1];
      if (!name && last && !last.name && last.start + last.slides.length === start) {
        last.slides.push.apply(last.slides, list);
      } else {
        parts.push({ name: name, start: start, slides: Array.prototype.slice.call(list) });
      }
      start += list.length;
    });
    parts.forEach(function (p) { slides.push.apply(slides, p.slides); });

    steps = slides.map(function (sl) {
      var m = 0;
      sl.querySelectorAll('[data-step]').forEach(function (el) {
        m = Math.max(m, Number(el.dataset.step) || 0);
      });
      return m;
    });

    linkCites();
    kickers();

    if (window.renderMathInElement) {
      renderMathInElement(deck, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }

    buildBar();
    // light / dark, remembered apart from the site's own choice (see the
    // page head); the label names the mode you'd switch TO. Focus is
    // dropped after a click so the next space advances the slide instead.
    var themeBtn = deck.querySelector('.deck-theme');
    function themeLabel() {
      themeBtn.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? 'Switch to light' : 'Switch to dark');
    }
    themeBtn.addEventListener('click', function () {
      var root = document.documentElement;
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('jry-deck-theme', root.dataset.theme); } catch (err) {}
      themeLabel();

    // full screen, and back; the icon follows the state, however it changed
    var fullBtn = deck.querySelector('.deck-full');
    fullBtn.addEventListener('click', function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
      fullBtn.blur();
    });
    document.addEventListener('fullscreenchange', function () {
      deck.classList.toggle('is-full', !!document.fullscreenElement);
    });
      themeBtn.blur();
    });
    themeLabel();
    fit();
    window.addEventListener('resize', fit);
    document.addEventListener('keydown', onKey);

    var n = parseInt(location.hash.slice(1), 10);
    go(n >= 1 && n <= slides.length ? n - 1 : 0, 0);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
