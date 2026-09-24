// Project notebook pages: soft password gate, then markdown + KaTeX sections.
// A page is a <main id="project" data-slug data-hash data-sections>; each
// section "name" is loaded from ./name.md and shown as a [name] tab.
// The gate only keeps casual visitors out: the .md files are public in the repo.
(function () {
  var main = document.getElementById('project');
  if (!main) return;
  var slug = main.dataset.slug;
  var hash = main.dataset.hash;
  var sections = JSON.parse(main.dataset.sections);
  var key = 'jry-project-' + slug;

  function unlocked() {
    try { return localStorage.getItem(key) === hash; } catch (e) { return false; }
  }

  async function sha256(text) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  // Stash code and math before marked sees them, so _ and \\ survive.
  function renderMarkdown(src) {
    var code = [], math = [];
    src = src.replace(/```[\s\S]*?```|`[^`\n]*`/g, function (m) {
      code.push(m); return '%%C' + (code.length - 1) + '%%';
    });
    src = src.replace(/\$\$([\s\S]+?)\$\$/g, function (m, t) {
      math.push([t, true]); return '%%M' + (math.length - 1) + '%%';
    });
    src = src.replace(/(^|[^\\$])\$([^$\n]+?)\$/g, function (m, pre, t) {
      math.push([t, false]); return pre + '%%M' + (math.length - 1) + '%%';
    });
    src = src.replace(/%%C(\d+)%%/g, function (m, i) { return code[+i]; });
    var html = marked.parse(src);
    return html.replace(/%%M(\d+)%%/g, function (m, i) {
      return katex.renderToString(math[+i][0], {
        displayMode: math[+i][1], throwOnError: false
      });
    });
  }

  function show(name) {
    if (sections.indexOf(name) < 0) name = sections[0];
    document.querySelectorAll('.proj-section').forEach(function (s) {
      s.hidden = s.id !== 'sec-' + name;
    });
    document.querySelectorAll('.proj-tabs a').forEach(function (a) {
      if (a.dataset.name === name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  async function load() {
    var tabs = document.createElement('nav');
    tabs.className = 'proj-tabs';
    var body = document.createElement('div');
    body.className = 'proj-body';
    sections.forEach(function (name) {
      var a = document.createElement('a');
      a.href = '#' + name;
      a.dataset.name = name;
      a.textContent = '[' + name + ']';
      tabs.appendChild(a);
      var s = document.createElement('section');
      s.className = 'proj-section';
      s.id = 'sec-' + name;
      s.hidden = true;
      s.innerHTML = '<p class="muted">loading…</p>';
      body.appendChild(s);
    });
    main.appendChild(tabs);
    main.appendChild(body);
    show(location.hash.slice(1));
    window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });

    await Promise.all(sections.map(async function (name) {
      var s = document.getElementById('sec-' + name);
      try {
        var r = await fetch(name + '.md', { cache: 'no-cache' });
        if (!r.ok) throw new Error(r.status);
        s.innerHTML = renderMarkdown(await r.text());
      } catch (e) {
        s.innerHTML = '<p class="muted">could not load ' + name + '.md (' + e.message + ')</p>';
      }
    }));
  }

  function gate() {
    var form = document.createElement('form');
    form.className = 'proj-gate';
    form.innerHTML =
      '<label for="proj-pw">password</label>' +
      '<input id="proj-pw" type="password" autocomplete="current-password" autofocus>' +
      '<button type="submit">[open]</button>' +
      '<p class="small" hidden>not quite.</p>';
    main.appendChild(form);
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      var h = await sha256(form.querySelector('input').value);
      if (h === hash) {
        try { localStorage.setItem(key, hash); } catch (e) {}
        form.remove();
        load();
      } else {
        form.querySelector('.small').hidden = false;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (unlocked()) load(); else gate();
  });
})();
