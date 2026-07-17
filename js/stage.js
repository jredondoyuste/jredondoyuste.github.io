// Spine + stage. Two kinds of triggers reveal content on the right-hand
// stage (wide screens) or inline (narrow screens / no JS):
//   • <details class="reveal">  — bar-style sections (publications, …)
//   • <button class="stage-link" data-reveal="ID"> — accent words in prose
//     that point to a hidden <div class="reveal-source" id="ID">.
(function () {
  const wide = () => window.matchMedia('(min-width: 1100px)').matches;
  let active = null; // trigger element currently shown on the stage

  function stageBody() {
    return document.querySelector('.stage-body');
  }

  function clearStage() {
    const body = stageBody();
    if (body) body.innerHTML = '';
    if (active) active.classList.remove('on-stage');
    active = null;
  }

  function showContent(html, trigger, title) {
    const body = stageBody();
    if (!body) return;
    if (active) active.classList.remove('on-stage');
    body.innerHTML = '';
    const entry = document.createElement('div');
    entry.className = 'stage-entry';
    entry.innerHTML = html;
    if (title) {
      const h = document.createElement('h2');
      h.className = 'stage-title';
      h.textContent = title;
      entry.prepend(h);
    }
    body.appendChild(entry);
    trigger.classList.add('on-stage');
    active = trigger;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!stageBody()) return;

    // bar-style sections
    document.querySelectorAll('details.reveal').forEach(function (d) {
      const summary = d.querySelector('summary');
      if (!summary) return;
      summary.addEventListener('click', function (e) {
        if (!wide()) return; // native <details> on narrow screens
        e.preventDefault();
        d.open = false;
        const content = d.querySelector('.reveal-body');
        if (active === d) {
          clearStage();
        } else {
          // title on the stage: data-stage-title wins (e.g. left bar says
          // "Publications" but the stage says "Selected publications"),
          // otherwise the summary text
          showContent(content ? content.innerHTML : '', d,
                      d.dataset.stageTitle || summary.textContent.trim());
        }
      });
    });

    // inline accent-word triggers
    document.querySelectorAll('.stage-link').forEach(function (btn) {
      const src = document.getElementById(btn.dataset.reveal);
      if (!src) return;
      btn.addEventListener('click', function (e) {
        if (!wide()) { // inline fallback: reveal the source in place
          src.hidden = !src.hidden;
          return;
        }
        e.preventDefault();
        if (active === btn) {
          clearStage();
        } else {
          // inline reveals usually carry their own heading; a title only
          // if the trigger asks for one explicitly
          showContent(src.innerHTML, btn, btn.dataset.stageTitle || '');
        }
      });
    });
  });
})();
