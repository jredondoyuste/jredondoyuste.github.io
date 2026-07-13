// The vault floor. "everything" is a chaotic scatter (reshuffled on every
// visit); picking a single category tidies it into an orderly wall.
(function () {
  function scatter(el) {
    el.style.setProperty('--rot', (Math.random() * 14 - 7).toFixed(2) + 'deg');
    el.style.setProperty('--dy', (Math.random() * 26 - 13).toFixed(1) + 'px');
    el.style.setProperty('--mx', (0.2 + Math.random() * 2.4).toFixed(2) + 'em');
    el.style.setProperty('--my', (Math.random() * 1.4).toFixed(2) + 'em');
  }

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

  function apply(floor, kind) {
    const items = floor.querySelectorAll('.vault-item');
    if (kind === 'all') {
      shuffle(floor);
      floor.querySelectorAll('.vault-item').forEach(function (it) {
        it.hidden = false;
        scatter(it);
      });
    } else {
      items.forEach(function (it) {
        it.hidden = it.dataset.kind !== kind;
        if (!it.hidden) orderly(it);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const floor = document.querySelector('.vault-floor');
    if (!floor) return;

    apply(floor, 'all');

    const filters = document.querySelectorAll('.vault-filter');
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) { b.classList.toggle('active', b === btn); });
        apply(floor, btn.dataset.kind);
      });
    });
  });
})();
