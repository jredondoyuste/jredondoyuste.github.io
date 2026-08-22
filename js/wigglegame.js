// The wiggle, unleashed: three quick clicks on the nav ringdown and it escapes
// into the page as a snake that eats the text. Mergers fire bursts that cut it
// and leave rival snakes behind. You are a GW event, your score is an SNR.
//
// Difficulty is one number, SNR_SCALE — mergers come faster and their wedges
// open wider, both measured against it. Everything else follows.
(function () {
  'use strict';

  var CELL = 18;            // grid pitch, px
  var TICK = 110;           // player step, ms
  var ETICK = 245;          // rival step, ms — must stay slower than TICK
  var MERGE_T0 = 10000;     // mean gap between mergers at SNR 0, ms
  var INSPIRAL = 1900;      // telegraph before a burst, ms
  var BURST = 380;          // how long the beam is lethal, ms
  var MAX_REMNANTS = 10;    // rivals alive at once
  var SNR_SCALE = 15;       // the score at which mergers double and the wedge half-opens
  var CONE_MAX = 0.62;      // widest half-angle a beam can flare to, rad (~35°)
  var GLYPH = 0.1;          // SNR per glyph; a rival is worth its length
  // null for a per-browser catalog; a URL for the shared one
  var REMOTE = 'https://wiggle-catalog.jaime-redondo-yuste.workers.dev';

  var root = null, canvas = null, ctx = null, hud = null, panel = null;
  var W = 0, H = 0, cols = 0, rows = 0;
  var colors = {};
  var waiting = false, over = false;
  var snake = [], dir = null, nextDirs = [], growth = 0;
  var food = {};            // "c,r" → { glyphs: n, rects: [..] or null for debris }
  var erased = [];          // rects painted paper-colour every frame
  var debrisCells = {};     // subset of food keys drawn as dots
  var enemies = [];         // { cells: [...], dir, phase }
  var mergers = [];         // { x, y, angle, t0, fired, remnant }
  var mergerCount = 0;
  var score = 0, eaten = 0, remnantsSeen = 0, remnantsEaten = 0;
  var eventName = '';
  var lastFrame = 0, acc = 0, eacc = 0, nextMergerIn = 0;
  var rafId = 0;
  var prevOverflow = '', navSvg = null;
  // the toggle stays reachable under the overlay; without this the paper
  // painted over eaten glyphs keeps the old theme's colour
  var themeWatch = new MutationObserver(function () { if (root) readColors(); });

  // ---------- names & catalog ----------

  // GWYYMMDD_HHMMSS, the LVK convention, from the UTC start time
  function claimName() {
    var d = new Date();
    function p(n) { return String(n).padStart(2, '0'); }
    return 'GW' + p(d.getUTCFullYear() % 100) + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) +
           '_' + p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds());
  }

  function loadCatalog() {
    try { return JSON.parse(localStorage.getItem('wiggle-catalog')) || []; }
    catch (e) { return []; }
  }

  function saveRun(entry) {
    var cat = loadCatalog();
    cat.push(entry);
    cat.sort(function (a, b) { return b.score - a.score; });
    cat = cat.slice(0, 50);
    try { localStorage.setItem('wiggle-catalog', JSON.stringify(cat)); } catch (e) {}
    if (REMOTE) {
      try {
        fetch(REMOTE, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(entry) });
      } catch (e) {}
    }
    return cat;
  }

  // ---------- harvesting the page ----------

  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    function v(name, fb) { var x = cs.getPropertyValue(name).trim(); return x || fb; }
    colors = {
      bg:     v('--bg', '#FFF8E7'),
      panel:  v('--panel', '#F6F0DF'),
      ink:    v('--ink', '#241C14'),
      muted:  v('--muted', '#7A6A55'),
      hair:   v('--hair', '#DAD4C5'),
      accent: v('--accent', '#C23649'),
      accent2: v('--accent-2', '#112A48')
    };
  }

  function cellKey(c, r) { return c + ',' + r; }

  function fmtSNR(s) { return (Math.round(s * 10) / 10).toFixed(1); }

  function harvest() {
    food = {};
    debrisCells = {};
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest('#wigglegame, script, style, noscript')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var range = document.createRange();
    var node, count = 0;
    while ((node = walker.nextNode()) && count < 6000) {
      var text = node.nodeValue;
      for (var i = 0; i < text.length; i++) {
        if (!text[i].trim()) continue;
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        var r = range.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (cx < 0 || cy < 0 || cx >= W || cy >= H) continue;
        var k = cellKey(Math.floor(cx / CELL), Math.floor(cy / CELL));
        if (!food[k]) food[k] = { glyphs: 0, rects: [] };
        food[k].glyphs += 1;
        food[k].rects.push({ x: r.left, y: r.top, w: r.width, h: r.height });
        count += 1;
      }
    }
  }

  // ---------- build / teardown ----------

  function build() {
    readColors();
    W = window.innerWidth;
    H = window.innerHeight;
    cols = Math.floor(W / CELL);
    rows = Math.floor(H / CELL);

    root = document.createElement('div');
    root.id = 'wigglegame';
    root.style.cssText = 'position:fixed;inset:0;z-index:9000;pointer-events:none;' +
      'font-family:var(--serif, Georgia, serif);';
    canvas = document.createElement('canvas');
    var dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    root.appendChild(canvas);

    hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;top:0.6rem;right:0.9rem;font-size:0.85rem;' +
      'color:' + colors.muted + ';letter-spacing:0.04em;text-align:right;';
    root.appendChild(hud);
    document.body.appendChild(root);

    prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    navSvg = document.querySelector('.ringdown');
    if (navSvg) navSvg.style.visibility = 'hidden';   // it's busy elsewhere
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function teardown() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    themeWatch.disconnect();
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = canvas = ctx = hud = panel = null;
    document.documentElement.style.overflow = prevOverflow;
    if (navSvg) { navSvg.style.visibility = ''; navSvg = null; }
  }

  // ---------- panels (intro / game over) ----------

  function showPanel(html) {
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    panel = document.createElement('div');
    panel.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
      'background:' + colors.panel + ';color:' + colors.ink + ';border:1px solid ' + colors.hair + ';' +
      'padding:1.4rem 1.8rem;max-width:26rem;pointer-events:auto;line-height:1.5;' +
      'box-shadow:0 8px 40px rgba(0,0,0,0.18);font-size:0.95rem;';
    panel.innerHTML = html;
    root.appendChild(panel);
  }

  function hidePanel() {
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    panel = null;
  }

  function intro() {
    var touch = ('ontouchstart' in window) && !window.matchMedia('(pointer:fine)').matches;
    showPanel(
      '<p style="margin:0 0 0.6rem;color:' + colors.muted + ';">You are <strong style="color:' +
      colors.ink + ';">' + eventName + '</strong>. ' +
      (touch ? 'Swipe to steer.' : 'Steer with the arrow keys.') +
      ' Can you eat this webpage? Beware the night sky ' +
      'and the terrors it leaves behind — a terror is worth far more than ' +
      'the page, but only ever taken head-on</p>' +
      '<p style="margin:0;color:' + colors.muted + ';font-size:0.85rem;">' +
      (touch ? 'Swipe' : 'Press any arrow to') + ' start · Press esc to quit</p>'
    );
  }

  function catalogRows(cat, current) {
    var rows_ = '';
    var top = cat.slice(0, 8);
    for (var i = 0; i < top.length; i++) {
      var e = top[i];
      // name+score, because the shared catalog stamps its own ts
      var me = current && (e.ts === current.ts ||
                           (e.name === current.name && e.score === current.score));
      rows_ += '<tr style="' + (me ? 'color:' + colors.accent + ';' : '') + '">' +
        '<td style="padding:0.1rem 0.8rem 0.1rem 0;text-align:right;color:' + colors.muted + ';">' + (i + 1) + '</td>' +
        '<td style="padding:0.1rem 0.8rem 0.1rem 0;">' + e.name + '</td>' +
        '<td style="padding:0.1rem 0;text-align:right;">' + fmtSNR(e.score) + '</td></tr>';
    }
    return rows_;
  }

  function gameOver(cause) {
    over = true;
    var entry = { name: eventName, score: Math.round(score * 10) / 10, ts: Date.now() };
    var cat = saveRun(entry);
    showPanel(
      '<p style="margin:0 0 0.2rem;font-size:1.1rem;">' + eventName +
      ' <span style="color:' + colors.muted + ';">· SNR ' + fmtSNR(score) + '</span></p>' +
      '<p style="margin:0 0 0.8rem;color:' + colors.muted + ';">' + cause +
      (remnantsEaten ? ' · bhs devoured: ' + remnantsEaten : '') + '</p>' +
      '<p data-cap style="margin:0 0 0.3rem;color:' + colors.muted + ';font-size:0.8rem;">' +
      (REMOTE ? 'the catalog' : 'this browser’s catalog') + '</p>' +
      '<table style="border-collapse:collapse;margin:0 0 1rem;width:100%;font-size:0.9rem;">' +
      '<thead><tr style="color:' + colors.muted + ';font-size:0.8rem;">' +
      '<th></th><th style="text-align:left;font-weight:normal;">event</th>' +
      '<th style="text-align:right;font-weight:normal;">SNR</th></tr></thead>' +
      '<tbody>' + catalogRows(cat, entry) + '</tbody></table>' +
      '<p style="margin:0;">' +
      '<a href="#" data-again style="color:' + colors.accent + ';text-decoration:none;">[play again]</a>' +
      '&nbsp;&nbsp;<a href="#" data-leave style="color:' + colors.muted + ';text-decoration:none;">[back to the page]</a></p>'
    );
    panel.querySelector('[data-again]').addEventListener('click', function (ev) {
      ev.preventDefault(); teardown(); start();
    });
    panel.querySelector('[data-leave]').addEventListener('click', function (ev) {
      ev.preventDefault(); quit();
    });
    if (REMOTE) {
      // the local catalog shows at once; the shared one replaces it if it arrives
      fetch(REMOTE).then(function (r) { return r.json(); }).then(function (list) {
        if (!panel || !over || !Array.isArray(list)) return;
        // KV is eventually consistent — our own POST may not be back yet
        var mine = list.some(function (e) { return e.name === entry.name && e.score === entry.score; });
        if (!mine) list.push(entry);
        list.sort(function (a, b) { return b.score - a.score; });
        var tb = panel.querySelector('tbody');
        if (tb) tb.innerHTML = catalogRows(list, entry);
        var cap = panel.querySelector('[data-cap]');
        if (cap) cap.textContent = 'the catalog · all observers';
      }).catch(function () {});
    }
  }

  // ---------- game setup ----------

  function resetState() {
    var c0 = Math.floor(cols / 2), r0 = Math.floor(rows / 2);
    snake = [];
    for (var i = 0; i < 5; i++) snake.push({ c: c0 - i, r: r0 });
    dir = { c: 1, r: 0 };
    nextDirs = [];
    growth = 0;
    erased = [];
    enemies = [];
    mergers = [];
    mergerCount = 0;
    score = 0; eaten = 0; remnantsSeen = 0; remnantsEaten = 0;
    acc = 0; eacc = 0;
    nextMergerIn = mergerGap();
    over = false;
    waiting = true;
    // clear food under the starting body so it doesn't eat where it stands
    for (var j = 0; j < snake.length; j++) delete food[cellKey(snake[j].c, snake[j].r)];
  }

  function mergerGap() {
    // 10s at SNR 0, ~5s at 15, ~3.3s at 30, jittered so it never feels metered
    return (MERGE_T0 / (1 + score / SNR_SCALE)) * (0.6 + Math.random() * 0.8);
  }

  function snakeHeadPx() {
    return { x: (snake[0].c + 0.5) * CELL, y: (snake[0].r + 0.5) * CELL };
  }

  // ---------- input ----------

  function pushDir(c, r) {
    var last = nextDirs.length ? nextDirs[nextDirs.length - 1] : dir;
    if (last.c === -c && last.r === -r) {
      // no 180s, except before the first step, where it just turns around
      if (waiting) {
        snake.reverse();
        dir = { c: c, r: r };
        nextDirs = [];
        waiting = false;
        hidePanel();
      }
      return;
    }
    if (last.c === c && last.r === r) return;
    if (nextDirs.length < 3) nextDirs.push({ c: c, r: r });
    if (waiting) { waiting = false; hidePanel(); }
  }

  function onKey(ev) {
    if (!root) return;
    if (ev.key === 'Escape') { ev.preventDefault(); quit(); return; }
    if (over) return;
    var map = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0]
    };
    var d = map[ev.key];
    if (d) { ev.preventDefault(); pushDir(d[0], d[1]); }
  }

  var touchStart = null;
  function onTouchStart(ev) { if (root) touchStart = ev.touches[0]; }
  function onTouchEnd(ev) {
    if (!root || !touchStart || over) return;
    var t = ev.changedTouches[0];
    var dx = t.clientX - touchStart.clientX, dy = t.clientY - touchStart.clientY;
    touchStart = null;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) pushDir(dx > 0 ? 1 : -1, 0);
    else pushDir(0, dy > 0 ? 1 : -1);
  }

  // ---------- mergers & bursts ----------

  function spawnMerger(now) {
    var head = snakeHeadPx();
    var x, y, tries = 0;
    do {
      x = 40 + Math.random() * (W - 80);
      y = 40 + Math.random() * (H - 80);
      tries += 1;
    } while (Math.hypot(x - head.x, y - head.y) < 140 && tries < 20);
    mergerCount += 1;
    mergers.push({
      x: x, y: y,
      angle: Math.random() * Math.PI,
      half: Math.random() * coneMax(),
      t0: now,
      fired: false,
      remnant: true          // cap is checked when it actually forms
    });
  }

  function coneMax() {
    // 0 at SNR 0, half of CONE_MAX at SNR_SCALE, approaching CONE_MAX after
    return CONE_MAX * (score / (score + SNR_SCALE));
  }

  // a line with a flare: always lethal within a hair of the axis, and within
  // ±half further out. Both lobes, so it reads as radiation off an inspiral.
  function inBeam(m, px, py) {
    var dx = px - m.x, dy = py - m.y;
    var nx = -Math.sin(m.angle), ny = Math.cos(m.angle);
    if (Math.abs(dx * nx + dy * ny) < CELL * 0.45) return true;
    if (!m.half) return false;
    // angle to the axis, taken as undirected → [0, π/2]
    var d = Math.atan2(dy, dx) - m.angle;
    d = Math.abs(((d + Math.PI * 1.5) % Math.PI) - Math.PI / 2);
    return d < m.half;
  }

  function dropDebris(cells) {
    for (var i = 0; i < cells.length; i++) {
      var k = cellKey(cells[i].c, cells[i].r);
      if (!food[k]) { food[k] = { glyphs: 1, rects: null }; debrisCells[k] = true; }
    }
  }

  function applyBurst(m) {
    // first body cell caught, counting from the head
    var i, hit = -1;
    for (i = 0; i < snake.length; i++) {
      if (inBeam(m, (snake[i].c + 0.5) * CELL, (snake[i].r + 0.5) * CELL)) { hit = i; break; }
    }
    if (hit === 0) { gameOver('caught in the burst'); return; }
    if (hit > 0) {
      var lost = snake.splice(hit);
      score = Math.max(0, score - lost.length);   // a point per severed segment
      dropDebris(lost);
      if (snake.length < 3) { gameOver('torn apart by the burst'); return; }
    }
    // a burst destroys rivals outright
    for (var e = enemies.length - 1; e >= 0; e--) {
      var body = enemies[e].cells, dead = false;
      for (i = 0; i < body.length; i++) {
        if (inBeam(m, (body[i].c + 0.5) * CELL, (body[i].r + 0.5) * CELL)) { dead = true; break; }
      }
      if (dead) { dropDebris(enemies[e].cells); enemies.splice(e, 1); }
    }
  }

  // ---------- remnant snakes ----------

  function spawnRemnant(m) {
    var c = Math.max(1, Math.min(cols - 2, Math.floor(m.x / CELL)));
    var r = Math.max(1, Math.min(rows - 2, Math.floor(m.y / CELL)));
    var cells = [];
    for (var i = 0; i < 6; i++) cells.push({ c: c, r: r });
    enemies.push({ cells: cells, dir: { c: 1, r: 0 }, phase: Math.random() * Math.PI * 2 });
    remnantsSeen += 1;
  }

  function nearestFood(from) {
    var best = null, bd = Infinity;
    for (var k in food) {
      var p = k.split(',');
      var d = Math.abs(p[0] - from.c) + Math.abs(p[1] - from.r);
      if (d < bd) { bd = d; best = { c: +p[0], r: +p[1] }; }
    }
    return best;
  }

  function stepEnemy(en) {
    var head = en.cells[0];
    var tgt = nearestFood(head);
    var opts = [];
    if (tgt) {
      if (tgt.c !== head.c) opts.push({ c: tgt.c > head.c ? 1 : -1, r: 0 });
      if (tgt.r !== head.r) opts.push({ c: 0, r: tgt.r > head.r ? 1 : -1 });
      if (opts.length === 2 && Math.random() < 0.5) opts.reverse();
    }
    opts.push({ c: 1, r: 0 }, { c: -1, r: 0 }, { c: 0, r: 1 }, { c: 0, r: -1 });
    var chosen = null;
    for (var i = 0; i < opts.length; i++) {
      var d = opts[i];
      if (d.c === -en.dir.c && d.r === -en.dir.r) continue;
      var nc = head.c + d.c, nr = head.r + d.r;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      chosen = d;
      break;
    }
    if (!chosen) chosen = { c: -en.dir.c, r: -en.dir.r };
    en.dir = chosen;
    var nh = { c: head.c + chosen.c, r: head.r + chosen.r };
    en.cells.unshift(nh);
    var k = cellKey(nh.c, nh.r);
    if (food[k]) {           // it eats your page and gives nothing back
      delete debrisCells[k];
      if (food[k].rects) erased = erased.concat(food[k].rects);
      delete food[k];
      if (en.cells.length > 16) en.cells.pop();  // grows, up to a point
    } else {
      en.cells.pop();
    }
  }

  // Strike a rival's head and you swallow it whole; touch it anywhere else and
  // its body is a wall you died against. Returns true for the fatal case.
  function touchRemnant() {
    var h = snake[0];
    for (var e = enemies.length - 1; e >= 0; e--) {
      var body = enemies[e].cells;
      for (var i = 0; i < body.length; i++) {
        if (body[i].c === h.c && body[i].r === h.r) {
          if (i > 0) return true;
          score += body.length;
          growth += body.length;
          remnantsEaten += 1;
          enemies.splice(e, 1);
          break;
        }
      }
    }
    return false;
  }

  // ---------- the player's step ----------

  function stepPlayer() {
    if (nextDirs.length) dir = nextDirs.shift();
    var h = snake[0];
    var nh = { c: h.c + dir.c, r: h.r + dir.r };
    if (nh.c < 0 || nh.r < 0 || nh.c >= cols || nh.r >= rows) { gameOver('propagated off the edge of the page'); return; }
    var stopAt = growth > 0 ? snake.length : snake.length - 1;
    for (var i = 0; i < stopAt; i++) {
      if (snake[i].c === nh.c && snake[i].r === nh.r) { gameOver('ate its own tail'); return; }
    }
    snake.unshift(nh);
    if (growth > 0) growth -= 1; else snake.pop();
    var k = cellKey(nh.c, nh.r);
    if (food[k]) {
      score += food[k].glyphs * GLYPH;
      eaten += food[k].glyphs;
      if (food[k].rects) erased = erased.concat(food[k].rects);
      delete debrisCells[k];
      delete food[k];
      growth += 1;
    }
    if (touchRemnant()) { gameOver('ran into a bh'); return; }
  }

  // ---------- drawing ----------

  function drawWave(cells, color, phase, ampMax) {
    if (cells.length < 2) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc((cells[0].c + 0.5) * CELL, (cells[0].r + 0.5) * CELL, 3, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    var pts = [];
    for (var i = 0; i < cells.length; i++) {
      pts.push({ x: (cells[i].c + 0.5) * CELL, y: (cells[i].r + 0.5) * CELL });
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    var s = 0, bodyLen = (cells.length - 1) * CELL;
    for (i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1];
      var seg = Math.hypot(b.x - a.x, b.y - a.y);
      if (!seg) continue;
      var ux = (b.x - a.x) / seg, uy = (b.y - a.y) / seg;
      var steps = Math.max(2, Math.floor(seg / 3));
      for (var j = 0; j <= steps; j++) {
        var t = j / steps;
        var x = a.x + ux * seg * t, y = a.y + uy * seg * t;
        var sl = s + seg * t;
        // the ringdown worn as a body: loud at the head, quiet at the tail
        var amp = ampMax * Math.exp(-sl / Math.max(bodyLen * 0.55, CELL));
        var off = amp * Math.sin(sl * 0.19 - phase);
        var px = x - uy * off, py = y + ux * off;
        if (i === 0 && j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      s += seg;
    }
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // the wedge the beam sweeps, both lobes, as a fillable path
  function conePath(m) {
    var len = 2400, a1 = m.angle - m.half, a2 = m.angle + m.half;
    ctx.beginPath();
    for (var s = -1; s <= 1; s += 2) {
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x + s * Math.cos(a1) * len, m.y + s * Math.sin(a1) * len);
      ctx.lineTo(m.x + s * Math.cos(a2) * len, m.y + s * Math.sin(a2) * len);
      ctx.closePath();
    }
  }

  function drawMerger(m, now) {
    var u = (now - m.t0) / INSPIRAL;
    if (u < 1) {
      // telegraph: the wedge, and the hairline at its heart
      if (m.half) {
        ctx.fillStyle = colors.accent;
        ctx.globalAlpha = 0.05 + 0.09 * u;
        conePath(m);
        ctx.fill();
      }
      ctx.strokeStyle = colors.accent;
      ctx.globalAlpha = 0.12 + 0.25 * u;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(m.x - Math.cos(m.angle) * 2000, m.y - Math.sin(m.angle) * 2000);
      ctx.lineTo(m.x + Math.cos(m.angle) * 2000, m.y + Math.sin(m.angle) * 2000);
      ctx.stroke();
      ctx.globalAlpha = 1;
      // the inspiral: two dots, tightening and quickening
      var sep = 13 * (1 - u * 0.9);
      var th = 14 * Math.pow(u, 2.4) + u * 6;
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      ctx.arc(m.x + Math.cos(th) * sep, m.y + Math.sin(th) * sep, 2.4, 0, Math.PI * 2);
      ctx.arc(m.x - Math.cos(th) * sep, m.y - Math.sin(th) * sep, 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      var v = Math.min((now - m.t0 - INSPIRAL) / BURST, 1);
      // flash, wedge, beam, and a ring rolling outward
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.8 * (1 - v);
      ctx.beginPath();
      ctx.arc(m.x, m.y, 6 + 10 * v, 0, Math.PI * 2);
      ctx.fill();
      if (m.half) {
        ctx.globalAlpha = 0.4 * (1 - v);
        conePath(m);
        ctx.fill();
      }
      ctx.globalAlpha = 0.9 - 0.6 * v;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(m.x - Math.cos(m.angle) * 2000, m.y - Math.sin(m.angle) * 2000);
      ctx.lineTo(m.x + Math.cos(m.angle) * 2000, m.y + Math.sin(m.angle) * 2000);
      ctx.stroke();
      ctx.globalAlpha = 0.35 * (1 - v);
      ctx.strokeStyle = colors.muted;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 10 + 220 * v, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    // paper over the departed glyphs
    if (erased.length) {
      ctx.fillStyle = colors.bg;
      ctx.beginPath();
      for (var i = 0; i < erased.length; i++) {
        var r = erased[i];
        ctx.rect(r.x - 1, r.y - 1, r.w + 2, r.h + 2);
      }
      ctx.fill();
    }
    // debris left by a severed waveform
    ctx.fillStyle = colors.muted;
    for (var k in debrisCells) {
      var p = k.split(',');
      ctx.beginPath();
      ctx.arc((+p[0] + 0.5) * CELL, (+p[1] + 0.5) * CELL, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    for (i = 0; i < mergers.length; i++) drawMerger(mergers[i], now);
    for (i = 0; i < enemies.length; i++) {
      drawWave(enemies[i].cells, colors.accent, now * 0.011 + enemies[i].phase, 3.4);
    }
    drawWave(snake, colors.ink, now * 0.013, 4.6);
    hud.textContent = eventName + ' · SNR ' + fmtSNR(score);
  }

  // ---------- the loop ----------

  function frame(now) {
    if (!root) return;
    rafId = requestAnimationFrame(frame);
    var dt = Math.min(now - lastFrame, 250);
    lastFrame = now;
    if (!over && !waiting && !document.hidden) {
      acc += dt; eacc += dt; nextMergerIn -= dt;
      while (acc >= TICK && !over) { acc -= TICK; stepPlayer(); }
      while (eacc >= ETICK && !over) {
        eacc -= ETICK;
        for (var e = 0; e < enemies.length; e++) stepEnemy(enemies[e]);
        if (!over && touchRemnant()) gameOver('ran into a bh');
      }
      if (nextMergerIn <= 0) { spawnMerger(now); nextMergerIn = mergerGap(); }
      for (var m = mergers.length - 1; m >= 0; m--) {
        var mg = mergers[m], age = now - mg.t0;
        if (age >= INSPIRAL && !mg.fired) {
          mg.fired = true;
          applyBurst(mg);
          if (!over && mg.remnant && enemies.length < MAX_REMNANTS) spawnRemnant(mg);
        }
        if (age >= INSPIRAL + BURST) mergers.splice(m, 1);
      }
    }
    draw(now);
  }

  // ---------- lifecycle ----------

  function start() {
    if (root) return;
    if (window.innerWidth < CELL * 16 || window.innerHeight < CELL * 12) return;  // too small to play
    eventName = claimName();
    build();
    harvest();
    resetState();
    intro();
    lastFrame = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function quit() {
    teardown();
  }

  window.addEventListener('keydown', onKey);
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('resize', function () {
    // the board was measured against the old viewport; ignore trifles
    // (scrollbars, zoom) and only give up on a real resize
    if (!root || over || waiting) return;
    if (Math.abs(window.innerWidth - W) < 64 && Math.abs(window.innerHeight - H) < 64) return;
    gameOver('the page shifted beneath you');
  });

  // console toys, in the tradition of window.merger()
  window.WiggleGame = {
    start: start,
    merge: function () {
      if (!root || over || waiting) return 'nothing is ringing';
      spawnMerger(performance.now());
      return 'coalescing';
    },
    state: function () {
      return { score: score, length: snake.length, rivals: enemies.length,
               cone: Math.round(coneMax() * 180 / Math.PI) + '°',
               food: Object.keys(food).length };
    }
  };
})();
