// Project notebook pages. A page is a <main id="project" data-slug data-hash
// data-sections [data-access="open"]>; each section "name" is loaded from
// ./name.md and shown as a [name] tab. Agents write plain markdown; this file
// turns headings into items whose details open on the right-hand stage
// (wide screens) or in place (narrow). The format is in projects/CLAUDE.md.
// The gate only keeps casual visitors out: the .md files are public in the repo.
(function () {
  var main = document.getElementById('project');
  if (!main) return;
  var slug = main.dataset.slug;
  var hash = main.dataset.hash;
  var open = main.dataset.access === 'open';
  var sections = JSON.parse(main.dataset.sections).filter(function (s) {
    return !(open && s === 'log');            // open projects keep no log
  });
  var key = 'jry-project-' + slug;
  var card = null;                            // this project's <li> on /projects/
  var wide = function () { return window.matchMedia('(min-width: 1100px)').matches; };

  function unlocked() {
    if (open) return true;
    try { return localStorage.getItem(key) === hash; } catch (e) { return false; }
  }

  async function sha256(text) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  // ---- markdown ---------------------------------------------------------

  var STATUS = {
    done: ['✓', 'done'], active: ['◐', 'live'], next: ['◐', 'live'],
    open: ['○', 'idle'], paused: ['○', 'idle'], planned: ['○', 'idle'],
    failed: ['✕', 'dead'], abandoned: ['✕', 'dead'], superseded: ['✕', 'dead'],
    dropped: ['✕', 'dead'], withdrawn: ['✕', 'dead']
  };

  // "### t07 — Population counts · done" and "- **S2** pools · active":
  // a trailing "· <status>" becomes a coloured mark.
  function statusMarks(src) {
    return src.replace(/ · (done|active|next|open|paused|planned|failed|abandoned|superseded|dropped|withdrawn)[ \t]*$/gm,
      function (m, s) {
        return ' <span class="st st-' + STATUS[s][1] + '">' + STATUS[s][0] + ' ' + s + '</span>';
      });
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
    src = statusMarks(src);
    src = src.replace(/%%C(\d+)%%/g, function (m, i) { return code[+i]; });
    var html = marked.parse(src);
    return html.replace(/%%M(\d+)%%/g, function (m, i) {
      return katex.renderToString(math[+i][0], {
        displayMode: math[+i][1], throwOnError: false
      });
    });
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function idOf(text) {
    return text.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9§.]+/g, '-')
      .replace(/^-+|-+$/g, '').slice(0, 48);
  }

  // Split rendered HTML at headings of one level: the blocks before the first
  // heading, then one {head, body[]} per heading.
  function split(html, level) {
    var box = el('div', null, html);
    var tag = 'H' + level, pre = [], items = [], cur = null;
    Array.from(box.childNodes).forEach(function (n) {
      if (n.nodeName === tag) { cur = { head: n, body: [] }; items.push(cur); }
      else if (cur) cur.body.push(n);
      else pre.push(n);
    });
    return { pre: pre, items: items };
  }

  function isBlock(n) { return n.nodeType === 1; }

  function htmlOf(nodes) {
    var d = el('div');
    nodes.forEach(function (n) { d.appendChild(n); });
    return d.innerHTML;
  }

  // ---- items and the stage ----------------------------------------------

  var onStage = null;

  function clearStage() {
    var body = document.querySelector('.stage-body');
    if (body) body.innerHTML = '';
    if (onStage) onStage.classList.remove('on-stage');
    onStage = null;
  }

  function reveal(item) {
    var detail = item.querySelector('.proj-detail');
    if (!wide()) {
      detail.hidden = !detail.hidden;
      item.classList.toggle('is-open', !detail.hidden);
      return;
    }
    if (onStage === item) { clearStage(); return; }
    clearStage();
    var body = document.querySelector('.stage-body');
    var entry = el('div', 'stage-entry', detail.innerHTML);
    entry.prepend(el('h2', 'stage-title', item.dataset.title));
    body.appendChild(entry);
    item.classList.add('on-stage');
    onStage = item;
    var stage = document.querySelector('.stage-inner');
    if (stage) stage.scrollTop = 0;
  }

  // One item: a clickable head, an optional short part that always shows,
  // and the detail that opens to the right. kind styles it (bar, fig, note).
  function item(kind, head, shortHtml, detailHtml, sec) {
    var it = el('div', 'proj-item proj-' + kind);
    var title = head.textContent.trim();
    it.dataset.title = title;
    it.id = sec + '/' + idOf(title);
    var hasDetail = /\S/.test(detailHtml.replace(/<[^>]*>/g, '')) || /<(img|video|iframe|table)/.test(detailHtml);
    var h = el(hasDetail ? 'button' : 'div', 'proj-head', head.innerHTML);
    if (hasDetail) h.type = 'button';
    it.appendChild(h);
    if (shortHtml) it.appendChild(el('div', 'proj-short', shortHtml));
    if (hasDetail) {
      if (kind !== 'bar') {
        var more = el('button', 'proj-more', '[more]');
        more.type = 'button';
        it.appendChild(more);
      }
      var d = el('div', 'proj-detail', detailHtml);
      d.hidden = true;
      it.appendChild(d);
    } else {
      it.classList.add('no-detail');
    }
    return it;
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.proj-item > .proj-head, .proj-item > .proj-more');
    if (b && b.tagName === 'BUTTON') reveal(b.parentNode);
  });

  // ---- section renderers --------------------------------------------------

  // ### headings inside a stage detail fold down, so a task opens into its
  // subtasks without leaving the stage.
  function foldSubs(nodes) {
    var s = split(htmlOf(nodes), 3);
    var out = htmlOf(s.pre);
    s.items.forEach(function (x) {
      out += '<details class="proj-sub"><summary>' + x.head.innerHTML + '</summary>' +
             htmlOf(x.body) + '</details>';
    });
    return out;
  }

  function count(nodes) {
    var n = split(htmlOf(nodes.map(function (x) { return x.cloneNode(true); })), 3).items.length;
    return n ? '<span class="proj-count">' + n + '</span>' : '';
  }

  // ## headings become bars (status, references): click opens the whole
  // group on the stage.
  function bars(sec, html) {
    var s = split(html, 2);
    s.pre.forEach(function (n) { sec.appendChild(n); });
    s.items.forEach(function (x) {
      var n = count(x.body);
      var it = item('bar', x.head, '', foldSubs(x.body), sec.dataset.name);
      it.querySelector('.proj-head').insertAdjacentHTML('beforeend', n);
      sec.appendChild(it);
    });
  }

  // heading + first block on the left, the rest on the stage (derivations,
  // results). shortWhat: 'p' takes the first block, 'figure' the first figure.
  function entries(sec, html, level, kind, shortWhat, keepPre) {
    var s = split(html, level);
    if (keepPre || !s.items.length) s.pre.forEach(function (n) { sec.appendChild(n); });
    s.items.forEach(function (x) {
      var blocks = x.body.filter(isBlock), short = null;
      if (shortWhat === 'figure') {
        short = blocks.find(function (n) { return n.nodeName === 'FIGURE' || n.querySelector('figure, video, iframe'); });
      }
      if (!short && blocks.length && blocks[0].nodeName !== 'H3' && blocks[0].nodeName !== 'H4') short = blocks[0];
      var rest = x.body.filter(function (n) { return n !== short; });
      sec.appendChild(item(kind, x.head, short ? short.outerHTML : '', htmlOf(rest), sec.dataset.name));
    });
  }

  // Log: one item per working day, and a timeline of the days on top.
  function log(sec, html) {
    var s = split(html, 3);
    s.pre.forEach(function (n) { sec.appendChild(n); });
    var days = [], byDate = {};
    s.items.forEach(function (x) {
      var m = x.head.textContent.match(/^\s*(\d{4}-\d{2}-\d{2})\s*[—–-]*\s*/);
      var date = m ? m[1] : x.head.textContent.trim();
      var gist = x.head.innerHTML.replace(/^\s*\d{4}-\d{2}-\d{2}\s*[—–-]*\s*/, '');
      if (!byDate[date]) { byDate[date] = { date: date, gists: [], body: '' }; days.push(byDate[date]); }
      var d = byDate[date];
      d.gists.push(gist);
      d.body += '<h3>' + gist + '</h3>' + htmlOf(x.body);
    });
    if (days.length > 1) sec.appendChild(timeline(days));
    days.forEach(function (d) {
      var head = el('h3', null, d.date);
      var short = '<p>' + d.gists.join(' · ') + '</p>';
      sec.appendChild(item('day', head, short, d.body, sec.dataset.name));
    });
  }

  function timeline(days) {
    var t = function (d) { return Date.parse(d.date + 'T12:00:00Z'); };
    var dated = days.filter(function (d) { return !isNaN(t(d)); });
    var wrap = el('div', 'proj-timeline');
    if (dated.length < 2) return wrap;
    var t0 = Math.min.apply(null, dated.map(t)), t1 = Math.max.apply(null, dated.map(t));
    var W = 1000, pad = 14, span = Math.max(t1 - t0, 864e5);
    var x = function (v) { return pad + (W - 2 * pad) * (v - t0) / span; };
    var svg = '<svg viewBox="0 0 ' + W + ' 46" preserveAspectRatio="none" aria-hidden="true">' +
              '<line x1="' + pad + '" x2="' + (W - pad) + '" y1="18" y2="18"/>';
    // a tick at each month start inside the span
    var m = new Date(t0); m.setUTCDate(1); m.setUTCMonth(m.getUTCMonth() + 1);
    var labels = '';
    for (; m.getTime() <= t1; m.setUTCMonth(m.getUTCMonth() + 1)) {
      var xm = x(m.getTime());
      svg += '<line class="tick" x1="' + xm + '" x2="' + xm + '" y1="12" y2="24"/>';
      labels += '<span style="left:' + (100 * xm / W) + '%">' +
                m.toLocaleString('en', { month: 'short', timeZone: 'UTC' }) + '</span>';
    }
    svg += '</svg>';
    wrap.innerHTML = svg + '<div class="proj-tl-labels">' + labels + '</div>';
    dated.forEach(function (d) {
      var b = el('button', 'proj-tl-day');
      b.type = 'button';
      b.style.left = (100 * x(t(d)) / W) + '%';
      var r = 3.5 + 1.5 * Math.sqrt(d.gists.length - 1);
      b.style.width = b.style.height = (2 * r) + 'px';
      b.title = d.date + ': ' + d.gists.map(function (g) { return g.replace(/<[^>]+>/g, ''); }).join(' · ');
      b.setAttribute('aria-label', d.date);
      b.dataset.date = d.date;
      wrap.appendChild(b);
    });
    return wrap;
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.proj-tl-day');
    if (!b) return;
    var target = document.getElementById('log/' + idOf(b.dataset.date));
    if (!target) return;
    if (!wide()) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (onStage !== target) reveal(target);
  });

  // ---- references from citations/used.bib ---------------------------------

  var ACC = { '"': '̈', "'": '́', '`': '̀', '^': '̂', '~': '̃',
              c: '̧', v: '̌', '=': '̄', '.': '̇', u: '̆', H: '̋' };

  function detex(s) {
    s = s.replace(/\\([\"'`^~=.uvHc])\s*\{?\\?([A-Za-z])\}?/g, function (m, a, c) {
      return (c + ACC[a]).normalize('NFC');
    });
    return s.replace(/\\(ss|o|O|aa|AA|ae|l|L)\b\s*/g, function (m, c) {
      return { ss: 'ß', o: 'ø', O: 'Ø', aa: 'å', AA: 'Å', ae: 'æ', l: 'ł', L: 'Ł' }[c];
    }).replace(/\\&/g, '&').replace(/---/g, '—').replace(/--/g, '–').replace(/~/g, ' ')
      .replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
  }

  function parseBib(text) {
    text = text.split('\n').filter(function (l) { return !/^\s*%/.test(l); }).join('\n');
    var out = [], re = /@(\w+)\s*\{\s*([^,\s]+)\s*,/g, m;
    while ((m = re.exec(text))) {
      if (/^(comment|string|preamble)$/i.test(m[1])) continue;
      var i = re.lastIndex, f = {}, depth = 1;
      while (i < text.length && depth > 0) {
        var fm = /^\s*([A-Za-z_-]+)\s*=\s*/.exec(text.slice(i));
        if (!fm) { if (text[i] === '}') depth--; i++; continue; }
        i += fm[0].length;
        var v = '', c = text[i];
        if (c === '{' || c === '"') {
          var close = c === '{' ? '}' : '"', d = 0, j = i + 1;
          for (; j < text.length; j++) {
            if (text[j] === '{') d++;
            else if (text[j] === '}' && d > 0) d--;
            else if (text[j] === close && d === 0) break;
          }
          v = text.slice(i + 1, j); i = j + 1;
        } else {
          var bm = /^[^,}\s]*/.exec(text.slice(i)); v = bm[0]; i += v.length;
        }
        f[fm[1].toLowerCase()] = v;
      }
      re.lastIndex = i;
      out.push({ type: m[1].toLowerCase(), key: m[2], f: f });
    }
    return out;
  }

  function authors(f) {
    if (f.collaboration && !f.author) return detex(f.collaboration) + ' Collaboration';
    // "Last, First Middle" or "First Middle Last" -> "F. M. Last"
    var a = (f.author || '').split(/\s+and\s+/).map(function (n) {
      n = detex(n);
      if (n === 'others') return '';
      var last, given;
      if (n.indexOf(',') >= 0) { last = n.split(',')[0].trim(); given = n.split(',').slice(1).join(' ').trim(); }
      else { var w = n.split(' '); last = w.pop(); given = w.join(' '); }
      var init = given.split(/\s+/).filter(Boolean).map(function (g) {
        return /\.$/.test(g) ? g : g.split('-').map(function (p) { return p[0] + '.'; }).join('-');
      }).join(' ');
      return (init ? init + ' ' : '') + last;
    }).filter(Boolean);
    var who = /others/.test(f.author || '') || a.length > 3 ? a[0] + ' et al.' : a.join(', ');
    return f.collaboration ? who + ' (' + detex(f.collaboration).replace(/ and /g, ', ') + ')' : who;
  }

  function refHtml(e) {
    var f = e.f, links = [];
    var venue = [f.journal, f.volume, f.pages].filter(Boolean).map(detex).join(' ');
    if (f.doi) links.push('<a href="https://doi.org/' + f.doi + '">' + (venue || 'doi:' + f.doi) + '</a>');
    else if (venue) links.push(venue);
    var ax = f.eprint || (/^\d{4}\.\d{4,5}/.test(f.arxiv || '') ? f.arxiv : '');
    if (ax) links.push('<a href="https://arxiv.org/abs/' + ax + '">arXiv:' + ax + '</a>');
    if (f.url && !f.doi) links.push('<a href="' + f.url + '">' + f.url.replace(/^https?:\/\//, '') + '</a>');
    if (f.version) links.push('version ' + detex(f.version));
    return links.join(', ');
  }

  function references(sec, bib, consulted) {
    parseBib(bib).forEach(function (e) {
      var f = e.f;
      var head = el('h3', null, '<span class="ref-who">' + authors(f) + '</span> ' +
                    (f.year ? '(' + f.year + ')' : ''));
      var short = '<p><em>' + detex(f.title || e.key) + '</em>' +
                  (f.usage ? '<span class="ref-usage">' + detex(f.usage) + '</span>' : '') + '</p>';
      var detail = '<p>' + refHtml(e) + '</p>' + (f.usage ? '<p><strong>How we use it.</strong> ' + detex(f.usage) + '</p>' : '') +
                   (f.abstract ? '<p>' + detex(f.abstract) + '</p>' : '') +
                   '<p class="ref-key"><code>' + e.key + '</code></p>';
      sec.appendChild(item('ref', head, short, detail, 'references'));
    });
    if (consulted) bars(sec, renderMarkdown('## Consulted, not used\n\n' + consulted.replace(/^#.*\n/, '')));
  }

  // ---- loading --------------------------------------------------------------

  async function text(name) {
    var r = await fetch(name, { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status);
    return r.text();
  }

  async function fill(sec, name) {
    sec.innerHTML = '';
    if (name === 'references') {
      var bib = null;
      try { bib = await text('references.bib'); } catch (e) {}
      if (bib) {
        var cons = null;
        try { cons = await text('consulted.md'); } catch (e) {}
        return references(sec, bib, cons);
      }
    }
    var html = renderMarkdown(await text(name + '.md'));
    if (name === 'status') {
      var beads = card && card.querySelector('.proj-progress');
      if (beads) sec.appendChild(beads.cloneNode(true));
      bars(sec, html);
    }
    else if (name === 'results') entries(sec, html, /<h3/.test(html) ? 3 : 2, 'fig', 'figure', false);
    else if (name === 'derivations') entries(sec, html, 2, 'note', 'p', true);
    else if (name === 'log') log(sec, html);
    else if (name === 'references' || name === 'plan') bars(sec, html);
    else sec.innerHTML = html;
  }

  function show(name) {
    var parts = name.split('/');
    if (sections.indexOf(parts[0]) < 0) parts = [sections[0]];
    clearStage();
    document.querySelectorAll('.proj-section').forEach(function (s) {
      s.hidden = s.id !== 'sec-' + parts[0];
    });
    document.querySelectorAll('.proj-tabs a').forEach(function (a) {
      if (a.dataset.name === parts[0]) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (parts.length > 1) {
      var it = document.getElementById(name);
      if (it) { reveal(it); it.scrollIntoView({ block: 'start' }); }
    }
  }

  async function load() {
    var tabs = el('nav', 'proj-tabs');
    var body = el('div', 'proj-body');
    sections.forEach(function (name) {
      var a = el('a', null, '[' + name + ']');
      a.href = '#' + name;
      a.dataset.name = name;
      tabs.appendChild(a);
      var s = el('section', 'proj-section', '<p class="muted">loading…</p>');
      s.id = 'sec-' + name;
      s.dataset.name = name;
      s.hidden = true;
      body.appendChild(s);
    });
    main.appendChild(tabs);
    main.appendChild(body);
    show(location.hash.slice(1));
    window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });

    await cardReady;
    await Promise.all(sections.map(async function (name) {
      var s = document.getElementById('sec-' + name);
      try { await fill(s, name); }
      catch (e) {
        s.innerHTML = '<p class="muted">could not load ' + name + ' (' + e.message + ')</p>';
      }
    }));
    if (location.hash.indexOf('/') > 0) show(location.hash.slice(1));
  }

  // The subtitle (collaborators, one-line description) comes from this
  // project's card on /projects/, so it is written once.
  var cardReady = fetch('/projects/', { cache: 'no-cache' }).then(function (r) { return r.text(); })
    .then(function (t) {
      var doc = new DOMParser().parseFromString(t, 'text/html');
      var a = doc.querySelector('.proj-list a[href="/projects/' + slug + '/"]');
      card = a && a.closest('li');
      if (!card) return;
      var put = function (sel, from) {
        var to = document.querySelector(sel), src = card.querySelector(from);
        if (to && src) to.innerHTML = src.innerHTML;
      };
      put('.page-project .proj-people', '.proj-people');
      put('.page-project .proj-meta', '.muted');
    }).catch(function () {});

  function gate() {
    var form = el('form', 'proj-gate',
      '<label for="proj-pw">password</label>' +
      '<input id="proj-pw" type="password" autocomplete="current-password" autofocus>' +
      '<button type="submit">[open]</button>' +
      '<p class="small" hidden>not quite.</p>');
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
