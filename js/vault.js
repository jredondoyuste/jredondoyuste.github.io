// The vault floor: items are reshuffled and lightly scattered on every
// visit; filter buttons show one kind at a time.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const floor = document.querySelector('.vault-floor');
    if (!floor) return;

    // shuffle
    for (let i = floor.children.length; i > 0; i--) {
      floor.appendChild(floor.children[Math.floor(Math.random() * i)]);
    }

    // scatter: small random rotation, vertical offset, and spacing
    floor.querySelectorAll('.vault-item').forEach(function (el) {
      el.style.setProperty('--rot', (Math.random() * 5 - 2.5).toFixed(2) + 'deg');
      el.style.setProperty('--dy', (Math.random() * 8 - 4).toFixed(1) + 'px');
      el.style.setProperty('--mx', (0.4 + Math.random() * 1.4).toFixed(2) + 'em');
    });

    // filters
    const filters = document.querySelectorAll('.vault-filter');
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) { b.classList.toggle('active', b === btn); });
        const kind = btn.dataset.kind;
        floor.querySelectorAll('.vault-item').forEach(function (it) {
          it.hidden = kind !== 'all' && it.dataset.kind !== kind;
        });
      });
    });
  });
})();
