// The vault floor: items are reshuffled and scattered on every visit,
// and re-scattered every time a filter is pressed — the vault never
// looks the same way twice.
(function () {
  function scatter(el) {
    el.style.setProperty('--rot', (Math.random() * 14 - 7).toFixed(2) + 'deg');
    el.style.setProperty('--dy', (Math.random() * 26 - 13).toFixed(1) + 'px');
    el.style.setProperty('--mx', (0.2 + Math.random() * 2.4).toFixed(2) + 'em');
    el.style.setProperty('--my', (Math.random() * 1.4).toFixed(2) + 'em');
  }

  function shuffle(floor) {
    for (let i = floor.children.length; i > 0; i--) {
      floor.appendChild(floor.children[Math.floor(Math.random() * i)]);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const floor = document.querySelector('.vault-floor');
    if (!floor) return;

    shuffle(floor);
    floor.querySelectorAll('.vault-item').forEach(scatter);

    const filters = document.querySelectorAll('.vault-filter');
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) { b.classList.toggle('active', b === btn); });
        const kind = btn.dataset.kind;
        shuffle(floor);
        floor.querySelectorAll('.vault-item').forEach(function (it) {
          it.hidden = kind !== 'all' && it.dataset.kind !== kind;
          if (!it.hidden) scatter(it);
        });
      });
    });
  });
})();
