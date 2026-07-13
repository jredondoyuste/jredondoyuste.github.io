// Spine + stage: on wide screens, <details class="reveal"> content appears
// on the right-hand stage instead of expanding inline. On narrow screens
// (and without JS) the native <details> behavior is untouched.
(function () {
  const wide = () => window.matchMedia('(min-width: 1100px)').matches;
  let active = null;

  function stageBody() {
    return document.querySelector('.stage-body');
  }

  function clearStage() {
    const body = stageBody();
    if (body) body.innerHTML = '';
    if (active) active.classList.remove('on-stage');
    active = null;
  }

  function showOnStage(d) {
    const body = stageBody();
    const content = d.querySelector('.reveal-body');
    if (!body || !content) return;
    if (active) active.classList.remove('on-stage');
    body.innerHTML = '';
    const entry = document.createElement('div');
    entry.className = 'stage-entry';
    entry.innerHTML = content.innerHTML;
    body.appendChild(entry);
    d.classList.add('on-stage');
    active = d;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!stageBody()) return;
    document.querySelectorAll('details.reveal').forEach(function (d) {
      const summary = d.querySelector('summary');
      if (!summary) return;
      summary.addEventListener('click', function (e) {
        if (!wide()) return; // native <details> on narrow screens
        e.preventDefault();
        d.open = false;
        if (active === d) {
          clearStage();
        } else {
          showOnStage(d);
        }
      });
    });
  });
})();
