// The vault floor. "everything" is a dense chaotic scatter (reshuffled on
// every visit); picking a single category tidies it into an orderly wall.
(function () {
  let currentKind = 'all';

  function orderly(el) {
    el.style.setProperty('--rot', '0deg');
    el.style.setProperty('--dy', '0px');
    el.style.setProperty('--mx', '0.6em');
    el.style.setProperty('--my', '0');
  }

  function shuffle(floor) {
    for (let i = floor.children.length; i > 0; i--) {
      floor.appendChild(floor.children[Math.floor(Math.random() * i)]);
    }
  }

  // Dense scatter: every item drops to the highest spot where it fits.
  // Flex rows waste space (a photo makes its whole row tall, stranding the
  // text chips in whitespace), so "everything" packs items absolutely
  // instead: photos and chips interlock like an actual heap on a floor.
  // The tilt (±6°) makes corners kiss occasionally — the intended look.
  function pack(floor) {
    const items = Array.prototype.slice.call(floor.querySelectorAll('.vault-item'))
      .filter(function (it) { return !it.hidden; });
    floor.classList.add('packed');
    items.forEach(function (it) {
      it.style.left = '';
      it.style.top = '';
      it.style.setProperty('--dy', '0px');
      it.style.setProperty('--mx', '0');
      it.style.setProperty('--my', '0');
    });

    const W = floor.clientWidth;
    const gap = 4;                    // breathing room between boxes
    const placed = [];
    let maxBottom = 0;

    function collides(x, y, w, h) {
      for (let i = 0; i < placed.length; i++) {
        const p = placed[i];
        if (x < p.x + p.w + gap && p.x < x + w + gap &&
            y < p.y + p.h + gap && p.y < y + h + gap) return true;
      }
      return false;
    }

    items.forEach(function (it) {
      const w = it.offsetWidth;
      const h = it.offsetHeight;
      let x = 0, y = 0;
      // scan down in small steps; at each level probe random x positions
      search:
      for (y = 0; y < 30000; y += 10) {
        for (let k = 0; k < 24; k++) {
          const cx = Math.random() * Math.max(1, W - w);
          if (!collides(cx, y, w, h)) { x = cx; break search; }
        }
      }
      y += Math.random() * 5;         // so the "rows" never read as rows
      it.style.left = x.toFixed(1) + 'px';
      it.style.top = y.toFixed(1) + 'px';
      it.style.setProperty('--rot', (Math.random() * 12 - 6).toFixed(2) + 'deg');
      placed.push({ x: x, y: y, w: w, h: h });
      if (y + h > maxBottom) maxBottom = y + h;
    });

    floor.style.height = Math.ceil(maxBottom + 12) + 'px';
  }

  function unpack(floor) {
    floor.classList.remove('packed');
    floor.style.height = '';
    floor.querySelectorAll('.vault-item').forEach(function (it) {
      it.style.left = '';
      it.style.top = '';
    });
  }

  // Items marked data-fav get the star; adding the attribute is the whole API.
  function starFavourites(floor) {
    floor.querySelectorAll('.vault-item[data-fav]').forEach(function (it) {
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      star.setAttribute('class', 'la-icon la-fav');
      star.setAttribute('aria-hidden', 'true');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', '/files/la-sprite.svg#la-star');
      star.appendChild(use);
      it.appendChild(star);
    });
  }

  function notes(kind) {
    document.querySelectorAll('.vault-note').forEach(function (n) {
      n.hidden = n.dataset.kind !== kind;
    });
  }

  function apply(floor, kind) {
    currentKind = kind;
    const items = floor.querySelectorAll('.vault-item');
    notes(kind);
    if (kind === 'all') {
      shuffle(floor);
      floor.querySelectorAll('.vault-item').forEach(function (it) {
        it.hidden = false;
      });
      pack(floor);
    } else {
      unpack(floor);
      items.forEach(function (it) {
        it.hidden = it.dataset.kind !== kind;
        if (!it.hidden) orderly(it);
      });
    }
  }

  // The browser's own title tooltip works, but it waits ~1s and can't be
  // styled. Move title -> data-tip (which stops the native one) and draw our
  // own instantly, in the site's colours.
  function tooltips(floor) {
    const tip = document.createElement('div');
    tip.className = 'tip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);

    let on = null;

    function show(el) {
      const text = el.dataset.tip;
      if (!text) return;
      on = el;
      tip.textContent = text;
      tip.classList.add('is-on');
      const r = el.getBoundingClientRect();
      const t = tip.getBoundingClientRect();
      // centred above the item, nudged back inside if it would overflow
      let x = r.left + r.width / 2 - t.width / 2;
      x = Math.max(8, Math.min(x, window.innerWidth - t.width - 8));
      let y = r.top - t.height - 8;
      if (y < 8) y = r.bottom + 8;           // no room above: go below
      tip.style.left = x + 'px';
      tip.style.top = y + 'px';
    }

    function hide() { on = null; tip.classList.remove('is-on'); }

    floor.querySelectorAll('.vault-item[title]').forEach(function (el) {
      el.dataset.tip = el.getAttribute('title');
      el.removeAttribute('title');
      el.addEventListener('mouseenter', function () { show(el); });
      el.addEventListener('mouseleave', hide);
      el.addEventListener('focus', function () { show(el); });
      el.addEventListener('blur', hide);
    });

    window.addEventListener('scroll', function () { if (on) hide(); }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const floor = document.querySelector('.vault-floor');
    if (!floor) return;

    starFavourites(floor);
    tooltips(floor);
    apply(floor, 'all');

    const filters = document.querySelectorAll('.vault-filter');
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) { b.classList.toggle('active', b === btn); });
        apply(floor, btn.dataset.kind);
      });
    });

    // chip widths change when ETbb arrives, and on any resize — repack
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (currentKind === 'all') pack(floor);
      });
    }
    let rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (currentKind === 'all') pack(floor);
      }, 150);
    });
  });
})();
