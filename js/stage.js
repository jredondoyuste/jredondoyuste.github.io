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

  // Figure carousels (.fig-carousel) live inside reveal content, which gets
  // CLONED onto the stage — cloned nodes lose their listeners, so the arrows
  // are handled by delegation: one document-level listener, state kept in
  // the DOM (.is-on). Works identically inline and on the stage.
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.fig-nav');
    if (!btn) return;
    const frames = btn.closest('.fig-carousel').querySelectorAll('.fig-frame');
    if (frames.length < 2) return;
    let at = 0;
    frames.forEach(function (f, i) { if (f.classList.contains('is-on')) at = i; });
    const d = btn.classList.contains('fig-prev') ? -1 : 1;
    frames[at].classList.remove('is-on');
    frames[(at + d + frames.length) % frames.length].classList.add('is-on');
  });

  // Links inside a <summary> (the journal / arXiv / INSPIRE line of a paper,
  // the slides behind a talk title) would otherwise fold the entry open or
  // shut on their way to the destination. Cancel the click and follow it
  // ourselves — again by delegation, since the stage works on clones.
  document.addEventListener('click', function (e) {
    const a = e.target.closest('summary a[href]');
    if (!a) return;
    e.preventDefault();
    if (a.target === '_blank') window.open(a.href, '_blank', 'noopener');
    else window.location.href = a.href;
  });

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

    // /research.html#nonlinear-dynamics opens that theme straight away — this
    // is what the fold-down menu under [research] in the nav links to
    function openFromHash() {
      const h = location.hash.slice(1);
      if (!h) return;
      const btn = document.querySelector('.stage-link[data-hash="' + h + '"]');
      if (btn && !btn.classList.contains('on-stage')) btn.click();
    }
    window.addEventListener('hashchange', openFromHash);
    setTimeout(openFromHash, 0); // after the triggers below are wired

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
