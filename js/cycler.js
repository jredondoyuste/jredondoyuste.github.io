// One item at a time out of a list; click to swap in another. The order is
// reshuffled every visit, and we walk the shuffled deck rather than picking at
// random each click — so you never get the same item twice in a row, and you
// see them all before any repeats.
(function () {
  function shuffled(n) {
    const order = Array.from({ length: n }, function (_, i) { return i; });
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = order[i]; order[i] = order[j]; order[j] = t;
    }
    return order;
  }

  function init(el) {
    const items = el.querySelectorAll('.cycle-item');
    if (!items.length) return;

    let order = shuffled(items.length);
    let at = 0;

    function show() {
      items.forEach(function (it, i) { it.hidden = i !== order[at]; });
    }

    function next() {
      at++;
      if (at >= order.length) {
        // New deck, but never let it start on the item just shown.
        const last = order[order.length - 1];
        do { order = shuffled(items.length); } while (order.length > 1 && order[0] === last);
        at = 0;
      }
      show();
    }

    show();
    el.addEventListener('click', next);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-cycler]').forEach(init);
  });
})();
