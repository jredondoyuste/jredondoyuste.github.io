// Light/dark toggle + palette picker. Loaded WITHOUT defer so the stored
// choice lands on <html> before anything paints — no flash of wrong theme.
// Palettes are defined in style.css; this only flips two attributes.
(function () {
  var root = document.documentElement;

  var theme = null, palette = null;
  try {
    theme = localStorage.getItem('jry-theme');
    palette = localStorage.getItem('jry-palette');
  } catch (e) { /* private browsing etc. — fall through to defaults */ }

  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }
  root.dataset.theme = theme;
  if (palette && palette !== 'baez') root.dataset.palette = palette;  // baez = the :root default

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    // nav toggle: the label names the mode you'd switch TO
    var btn = document.querySelector('.theme-toggle');
    function label() {
      if (btn) btn.textContent = root.dataset.theme === 'dark' ? '[light]' : '[dark]';
    }
    if (btn) {
      btn.addEventListener('click', function () {
        root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        save('jry-theme', root.dataset.theme);
        label();
      });
    }
    label();

    // colophon easter egg: which painting the colours come from
    var picks = document.querySelectorAll('[data-palette-pick]');
    function mark() {
      var current = root.dataset.palette || 'baez';
      picks.forEach(function (b) {
        b.classList.toggle('is-current', b.dataset.palettePick === current);
      });
    }
    picks.forEach(function (b) {
      b.addEventListener('click', function () {
        var p = b.dataset.palettePick;
        if (p === 'baez') delete root.dataset.palette;
        else root.dataset.palette = p;
        save('jry-palette', p);
        mark();
      });
    });
    mark();
  });
})();
