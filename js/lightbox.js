// Clicking a photo props it up in place instead of opening the raw file:
// arrows (or the keyboard) walk through the roll, the cross closes it.
// The tiles keep their href, so middle-click / no-JS still open the image.
(function () {
  let tiles = [], at = 0;
  let box, imgEl, capEl, counterEl, lastFocus = null;

  function build() {
    box = document.createElement('div');
    box.className = 'lb';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML =
      '<button class="lb-close" aria-label="Close (Esc)">&#215;</button>' +
      '<button class="lb-nav lb-prev" aria-label="Previous photo">&#8249;</button>' +
      '<figure class="lb-stage">' +
        '<img class="lb-img" alt="">' +
        '<figcaption class="lb-cap"><span class="lb-text"></span>' +
        '<span class="lb-count"></span></figcaption>' +
      '</figure>' +
      '<button class="lb-nav lb-next" aria-label="Next photo">&#8250;</button>';
    document.body.appendChild(box);

    imgEl = box.querySelector('.lb-img');
    capEl = box.querySelector('.lb-text');
    counterEl = box.querySelector('.lb-count');

    box.querySelector('.lb-close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
    box.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); go(1); });
    // click the backdrop to dismiss, but not the photo itself
    box.addEventListener('click', function (e) { if (e.target === box || e.target.closest('.lb-stage') === null) close(); });
    box.querySelector('.lb-stage').addEventListener('click', function (e) { e.stopPropagation(); });
  }

  function preload(i) {
    if (i < 0 || i >= tiles.length) return;
    new Image().src = tiles[i].getAttribute('href');
  }

  function render() {
    const tile = tiles[at];
    imgEl.src = tile.getAttribute('href');
    const cap = tile.dataset.tip || tile.getAttribute('title') ||
                (tile.querySelector('img') || {}).alt || '';
    imgEl.alt = cap;
    capEl.textContent = cap;
    counterEl.textContent = (at + 1) + ' / ' + tiles.length;
    preload(at + 1); preload(at - 1);   // neighbours, so arrows feel instant
  }

  function open(i) {
    at = i;
    lastFocus = document.activeElement;
    render();
    box.classList.add('is-on');
    document.body.classList.add('lb-open');
    box.querySelector('.lb-close').focus();
  }

  function close() {
    box.classList.remove('is-on');
    document.body.classList.remove('lb-open');
    if (lastFocus) lastFocus.focus();
  }

  function go(d) {
    at = (at + d + tiles.length) % tiles.length;   // wraps around the roll
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    tiles = [].slice.call(document.querySelectorAll('.vault-photo'));
    if (!tiles.length) return;
    build();

    tiles.forEach(function (t, i) {
      t.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let
        e.preventDefault();                                                 // people
        open(i);                                                            // open in
      });                                                                   // a new tab
    });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-on')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    });
  });
})();
