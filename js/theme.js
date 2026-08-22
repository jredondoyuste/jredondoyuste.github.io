// Light/dark toggle. Loaded WITHOUT defer so the stored choice lands on
// <html> before anything paints — no flash of wrong theme.
(function () {
  var root = document.documentElement;

  var theme = null;
  try {
    theme = localStorage.getItem('jry-theme');
  } catch (e) { /* private browsing etc. — fall through to defaults */ }

  // Dark is the default for a first visit — deliberately, not just when
  // the OS prefers it. The toggle still remembers whatever you pick.
  if (theme !== 'light' && theme !== 'dark') {
    theme = 'dark';
  }
  root.dataset.theme = theme;

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
  });
})();
