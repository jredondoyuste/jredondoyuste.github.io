// The mode ladder: which QNMs a ringdown seen by ET detects as it gets
// louder. One cell per prograde mode (l, m, n), n = 0, 1, 2 side by side,
// as in the paper's mode diagram (figures/mq-p1-modes.png). A cell lights
// up when rho_220 passes the SNR at which the mode's expected leave-one-out
// ln B reaches 3 (data: figures/mq-modes.json, from mqnm t24 S2c,
// e_OT = 10, t0 = 10 M, ET-D, iota = 0.78).
//
// Presses:
//   arrive    q = 1, chi_f = 0.7: rho_220 sweeps 1 -> 342 (GW250114 in ET)
//   1         ... on to 10^4
//   2         q = 2, chi_f = 0.95: sweeps 1 -> 342
//   3         ... on to 10^4
// Pressing → mid-sweep jumps to the end of that sweep.
(function () {
  'use strict';

  var slide = document.getElementById('ladder');
  if (!slide) return;
  var svg = slide.querySelector('.ld-svg');
  var NS = 'http://www.w3.org/2000/svg';

  // canvas layout
  var CELL = 66, X0 = [190, 650, 1110], Y_TOP = 230, LMAX = 7;
  var RHO_MIN = 1, RHO_MAX = 1e4, RHO_EVENT = 342;
  var AX = { x0: 190, x1: 1506, y: 850 };          // the rho_220 axis

  // the three sources of the paper figure; we show rows 0 and 2
  var SOURCES = [
    { row: 0, label: '$q = 1,\\ \\chi_f = 0.7$', sub: 'equal masses, no spins: GW250114-like', sym: true },
    { row: 2, label: '$q = 2,\\ \\chi_f = 0.95$', sub: 'unequal masses, high aligned spins', sym: false }
  ];

  var modes = [], cells = {}, cur = 0, rho = 1, target = 1, raf = null, t0 = 0, from = 1;

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  }
  function lx(r) {                                   // rho -> x on the axis
    return AX.x0 + (AX.x1 - AX.x0) * Math.log10(r / RHO_MIN) / Math.log10(RHO_MAX / RHO_MIN);
  }
  function fmt(r) {
    if (r < 1000) return String(Math.round(r));
    return (r / 1000).toFixed(r < 1e4 ? 1 : 0).replace(/\.0$/, '') + 'k';
  }

  function build() {
    svg.innerHTML = '';
    var g = el('g', { class: 'ld-grid' });
    for (var n = 0; n < 3; n++) {
      el('text', { x: X0[n] + 3 * CELL, y: Y_TOP - 22, class: 'ld-head' }, g).textContent = 'n = ' + n;
      for (var l = 2; l <= LMAX; l++) {
        for (var m = 0; m <= l; m++) {
          var x = X0[n] + (l - 2) * CELL, y = Y_TOP + (LMAX - m) * CELL * 0.72;
          var r = el('rect', { x: x + 2, y: y + 2, width: CELL - 4, height: CELL * 0.72 - 4, rx: 4, class: 'ld-cell' }, g);
          var t = el('text', { x: x + CELL / 2, y: y + CELL * 0.36 + 8, class: 'ld-lab' }, g);
          cells[l + ',' + m + ',' + n] = { r: r, t: t };
        }
      }
      // axis labels under each panel
      for (l = 2; l <= LMAX; l++)
        el('text', { x: X0[n] + (l - 2) * CELL + CELL / 2, y: Y_TOP + 8 * CELL * 0.72 + 30, class: 'ld-tick' }, g).textContent = l;
      el('text', { x: X0[n] + 3 * CELL, y: Y_TOP + 8 * CELL * 0.72 + 64, class: 'ld-tick ld-it' }, g).textContent = 'ℓ';
    }
    for (m = 0; m <= LMAX; m++)
      el('text', { x: X0[0] - 22, y: Y_TOP + (LMAX - m) * CELL * 0.72 + CELL * 0.36 + 8, class: 'ld-tick' }, g).textContent = m;
    el('text', { x: X0[0] - 62, y: Y_TOP + 4 * CELL * 0.72, class: 'ld-tick ld-it' }, g).textContent = 'm';

    // the rho_220 axis
    var a = el('g', { class: 'ld-axis' });
    el('line', { x1: AX.x0, x2: AX.x1, y1: AX.y, y2: AX.y }, a);
    for (var d = 0; d <= 4; d++) {
      var xx = lx(Math.pow(10, d));
      el('line', { x1: xx, x2: xx, y1: AX.y - 10, y2: AX.y + 10 }, a);
      el('text', { x: xx, y: AX.y + 44, class: 'ld-tick' }, a).textContent = d === 0 ? '1' : '10' + '⁰¹²³⁴'[d];
    }
    var ev = el('g', { class: 'ld-event' }, a);
    el('line', { x1: lx(RHO_EVENT), x2: lx(RHO_EVENT), y1: AX.y - 26, y2: AX.y + 26 }, ev);
    el('text', { x: lx(RHO_EVENT), y: AX.y - 36, class: 'ld-evlab' }, ev).textContent = 'GW250114 in ET';
    el('text', { x: AX.x1 + 30, y: AX.y + 12, class: 'ld-tick ld-left' }, a).textContent = 'ρ₂₂₀';
    el('path', { class: 'ld-fill', d: '' }, a);
    el('path', { class: 'ld-fill ld-fill2', d: '' }, a);
    el('circle', { class: 'ld-dot', r: 11, cx: lx(1), cy: AX.y }, a);
  }

  function paint() {
    var src = SOURCES[cur], count = 0;
    Object.keys(cells).forEach(function (k) {
      var c = cells[k], p = k.split(','), l = +p[0], m = +p[1], hatched = src.sym && m % 2 === 1;
      c.r.setAttribute('class', 'ld-cell' + (hatched ? ' ld-off' : ''));
      c.t.textContent = '';
      c.r.style.removeProperty('--a');
    });
    modes.forEach(function (md) {
      if (md[0] !== src.row || md[4] !== 0) return;      // row; prograde only
      var c = cells[md[1] + ',' + md[2] + ',' + md[3]];
      if (!c) return;
      if (md[5] <= rho) {
        count++;
        // later entries are paler: one step per decade, as in the paper
        var a = 1 - 0.17 * Math.max(0, Math.floor(Math.log10(md[5])));
        c.r.setAttribute('class', 'ld-cell ld-on' + (md[5] > RHO_EVENT ? ' ld-beyond' : ''));
        c.r.style.setProperty('--a', a.toFixed(2));
        c.t.textContent = fmt(md[5]);
        c.t.setAttribute('class', 'ld-lab ld-lab-on');
      } else {
        c.t.setAttribute('class', 'ld-lab');
      }
    });
    slide.querySelector('.ld-rho').textContent = rho < 10 ? rho.toFixed(1) : fmt(rho);
    slide.querySelector('.ld-count').textContent = count;
    slide.querySelector('.ld-src').innerHTML = src.label;
    slide.querySelector('.ld-sub').textContent = src.sub;
    if (window.renderMathInElement) renderMathInElement(slide.querySelector('.ld-src'), { delimiters: [{ left: '$', right: '$', display: false }] });
    var x = lx(Math.max(rho, 1));
    svg.querySelector('.ld-dot').setAttribute('cx', x);
    var xe = lx(RHO_EVENT);
    svg.querySelector('.ld-fill').setAttribute('d', 'M' + AX.x0 + ' ' + AX.y + 'H' + Math.min(x, xe));
    svg.querySelector('.ld-fill2').setAttribute('d', x > xe ? 'M' + xe + ' ' + AX.y + 'H' + x : '');
    svg.querySelector('.ld-dot').classList.toggle('ld-dot2', x > xe);
    slide.querySelector('.ld-rho').classList.toggle('ld-far', rho > RHO_EVENT * 1.001);
  }

  function sweep(to) {
    cancelAnimationFrame(raf);
    from = rho; target = to; t0 = performance.now();
    var dur = 900 * Math.log10(to / from) + 400;          // ~0.9 s per decade
    (function tick(now) {
      var s = Math.min(1, (now - t0) / dur), e = s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2;
      rho = from * Math.pow(target / from, e);
      paint();
      if (s < 1) raf = requestAnimationFrame(tick);
      else raf = null;
    })(t0);
  }
  function finish() { cancelAnimationFrame(raf); raf = null; rho = target; paint(); }

  // phase within the slide, driven by the deck's step count
  function show(step, animate) {
    cur = step >= 2 ? 1 : 0;
    var to = step % 2 === 0 ? RHO_EVENT : RHO_MAX;
    if (!animate) { cancelAnimationFrame(raf); rho = target = to; paint(); return; }
    if (step % 2 === 0) { rho = 1; }
    sweep(to);
  }

  fetch('figures/mq-modes.json').then(function (r) { return r.json(); }).then(function (d) {
    modes = d.modes;
    build();
    paint();
    if (slide.classList.contains('active')) show(+slide.dataset.s || 0, true);
  });

  var last = 0;
  Deck.on('ladder', {
    enter: function (sl, dir) {
      last = +sl.dataset.s || 0;
      if (modes.length) show(last, dir > 0);
    },
    leave: function () { cancelAnimationFrame(raf); raf = null; },
    next: function () {
      if (raf) { finish(); return true; }               // → mid-sweep: jump to its end
      return false;
    }
  });
  // follow the deck's steps (data-s on the slide)
  new MutationObserver(function () {
    var s = +slide.dataset.s || 0;
    if (s === last || !modes.length) return;
    var fwd = s > last; last = s;
    show(s, fwd);
  }).observe(slide, { attributes: true, attributeFilter: ['data-s'] });
})();
