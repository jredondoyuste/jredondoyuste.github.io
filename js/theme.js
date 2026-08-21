// Light/dark toggle. Loaded WITHOUT defer so the stored choice lands on
// <html> before anything paints — no flash of wrong theme.
// The palette picker is retired (one ink, in style.css); the code below is
// kept because it costs nothing and reviving the easter egg is two edits.
(function () {
  var root = document.documentElement;

  var theme = null, palette = null;
  try {
    theme = localStorage.getItem('jry-theme');
    palette = localStorage.getItem('jry-palette');
  } catch (e) { /* private browsing etc. — fall through to defaults */ }

  // Dark is the default for a first visit — deliberately, not just when
  // the OS prefers it. The toggle still remembers whatever you pick.
  if (theme !== 'light' && theme !== 'dark') {
    theme = 'dark';
  }
  root.dataset.theme = theme;
  // The picker is retired — the site has one ink (El Greco), in :root.
  // Drop any palette saved by an older visit so it can't linger.
  if (palette) { try { localStorage.removeItem('jry-palette'); } catch (e) {} }

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

    // colophon easter egg: which painting the ink comes from
    var picks = document.querySelectorAll('[data-palette-pick]');
    function mark() {
      var current = root.dataset.palette || 'hokusai';
      picks.forEach(function (b) {
        b.classList.toggle('is-current', b.dataset.palettePick === current);
      });
    }
    picks.forEach(function (b) {
      b.addEventListener('click', function () {
        var p = b.dataset.palettePick;
        if (p === 'hokusai') delete root.dataset.palette;
        else root.dataset.palette = p;
        save('jry-palette', p);
        mark();
      });
    });
    mark();
  });
})();
