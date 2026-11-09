// Metric reconstruction, for one quasinormal mode of a Kerr-Newman black hole
// (a/M = 0.557, Q/M = 0.502, l = m = 2, n = 0, gravitationally led), over the
// whole slice: sigma from null infinity (0) to the horizon (1), and cos(theta).
//
// Each panel is one tetrad component B = sigma X of h_ab or A_a (the regular
// combination), divided by its own largest value, drawn as a ridgeline
// surface, one line per cos(theta), front to back. It oscillates as
// Re[B e^{-i Re(w) tau}] (the decay is left out, so it keeps ringing).
//
// Steps:
//   0  all 14 components from the direct reconstruction, in the ingoing
//      radiation gauge (IRG): most vanish, and the rest are not
//      asymptotically flat at null infinity
//   1  h_nn alone, large: the slice cut in three (AF-IRG near null infinity,
//      a smooth cut f, IRG near the horizon)
//   2  the gauge vector, switched on through the cut: h -> h + L_{f xi} g;
//      near null infinity B = dB/dsigma = 0, near the horizon nothing changes
//   3  all 14 components, glued: the gauge vector also lights up components
//      that IRG sets to zero, inside the cut
// Motion: the grid and the zoom do not overlap: the grid fades out, then the
// zoom fades in (and back), on a time constant, so the hidden-line fills of
// one never cut into the other. The morph IRG -> glued runs forward at step 2
// and backward when stepping back to 1; at step 3 the zoom stays glued while
// it fades out.
// Data: data/recon.json, exported by tasks/t25-dirac-geometry/S16/export_recon.py
// in the 2nd-kerr-newman repo.
(function () {
  'use strict';

  var slide = document.getElementById('recon');
  var cv = slide.querySelector('.rc-canvas');
  var ctx = cv.getContext('2d');

  // the panels: 5 + 5 metric components, then the 4 potentials
  var ROWS = [
    ['h_ll', 'h_ln', 'h_lm', 'h_lmb', 'h_nn'],
    ['h_nm', 'h_nmb', 'h_mm', 'h_mbmb', 'h_mmb'],
    ['A_l', 'A_n', 'A_m', 'A_mb']
  ];
  var X0 = 140, Y0 = 165, PW = 300, PH = 245, GX = 30;   // small panels
  var BIG = { x: 300, y: 170, w: 1100, h: 600 };          // the zoomed panel
  var SPEED = 4;                                         // tau, in M, per second
  var MORPH = 2.5;                                       // seconds, IRG -> glued in the zoom
  var REGIONS = [[0, 0.25], [0.25, 0.75], [0.75, 1]];   // AF-IRG, the cut, IRG (knpert.gauge patches)

  var data = null, raf = 0, t0 = 0, tPrev = 0, lastS = -1, zoom = 0, morph = 0;
  var TAU = 0.3;                                         // seconds: the zoom's time constant
  function smooth(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }

  function panels() {
    var out = [];
    ROWS.forEach(function (row, r) {
      row.forEach(function (c, k) {
        out.push({ c: c, x: X0 + k * (PW + GX) + (r === 2 ? (PW + GX) / 2 : 0), y: Y0 + r * PH, w: PW, h: PH });
      });
    });
    return out;
  }

  function size() {
    var k = window.devicePixelRatio || 1;
    cv.width = 1920 * k; cv.height = 1080 * k;
    ctx.setTransform(k, 0, 0, k, 0, 0);
  }

  // one ridgeline surface in the box p; val(i, j) -> [re, im] or null
  function surface(p, val, cr, sr, col, big, cut) {
    var NS = data.NS, NX = data.x.length;
    var bx = p.x + 10, by = p.y + p.h - (big ? 90 : 40);
    var W = p.w * 0.66, DX = p.w * 0.28, DY = p.h * 0.32, Z = p.h * (big ? 0.3 : 0.24);
    // the floor, a parallelogram, with its ends named
    ctx.strokeStyle = col.hair; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx, by); ctx.lineTo(bx + W, by); ctx.lineTo(bx + W + DX, by - DY); ctx.lineTo(bx + DX, by - DY); ctx.closePath();
    ctx.stroke();
    // the slice cut in three, shaded on the floor (zoom only)
    if (cut) {
      [[0, 0.25, col.accent], [0.25, 0.75, col.muted], [0.75, 1, col.accent2]].forEach(function (b) {
        ctx.globalAlpha = 0.14 * cut;
        ctx.fillStyle = b[2];
        ctx.beginPath();
        ctx.moveTo(bx + W * b[0], by); ctx.lineTo(bx + W * b[1], by);
        ctx.lineTo(bx + W * b[1] + DX, by - DY); ctx.lineTo(bx + W * b[0] + DX, by - DY); ctx.closePath();
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    ctx.save();
    ctx.translate(bx + DX / 2 - (big ? 24 : 14), by - DY / 2 - 4);
    ctx.rotate(-Math.atan2(DY, DX));
    ctx.textAlign = 'center'; ctx.font = (big ? 30 : 18) + 'px ETbb, Georgia, serif';
    ctx.fillStyle = col.muted;
    ctx.fillText('cos θ', 0, 0);
    ctx.restore();

    // back to front: each front line hides what is behind it
    for (var j = NX - 1; j >= 0; j--) {
      var d = j / (NX - 1), ox = bx + d * DX, oy = by - d * DY;
      var line = new Path2D();
      for (var i = 0; i < NS; i++) {
        var q = val(i, j), z = q ? q[0] * cr + q[1] * sr : 0;
        var X = ox + W * i / (NS - 1), Y = oy - z * Z;
        if (i) line.lineTo(X, Y); else line.moveTo(X, Y);
      }
      var under = new Path2D(line);
      under.lineTo(ox + W, oy + Z + 2); under.lineTo(ox, oy + Z + 2); under.closePath();
      ctx.fillStyle = col.bg; ctx.fill(under);
      ctx.globalAlpha = 0.35 + 0.65 * (1 - d);
      ctx.lineWidth = big ? 2 : 1.6;
      if (cut) {
        // the zoom: each line in the colour of its part of the slice
        REGIONS.forEach(function (rg, r) {
          var i0 = Math.round(rg[0] * (NS - 1)), i1 = Math.round(rg[1] * (NS - 1)), seg = new Path2D();
          for (var i = i0; i <= i1; i++) {
            var q = val(i, j), z = q ? q[0] * cr + q[1] * sr : 0;
            var X = ox + W * i / (NS - 1), Y = oy - z * Z;
            if (i > i0) seg.lineTo(X, Y); else seg.moveTo(X, Y);
          }
          ctx.strokeStyle = [col.accent, col.muted, col.accent2][r];
          ctx.stroke(seg);
        });
      } else {
        ctx.strokeStyle = col.line;
        ctx.stroke(line);
      }
      ctx.globalAlpha = 1;
    }

    // the zoom: where the parts of the slice meet, and their names on the floor
    if (cut) {
      ctx.globalAlpha = cut;
      ctx.strokeStyle = col.muted; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]);
      [0.25, 0.75].forEach(function (s) {
        ctx.beginPath();
        ctx.moveTo(bx + W * s, by + Z * 0.2); ctx.lineTo(bx + W * s + DX, by - DY - Z * 1.1);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.font = '28px ETbb, Georgia, serif'; ctx.textAlign = 'center';
      ['AF-IRG', 'cut', 'IRG'].forEach(function (name, r) {
        ctx.fillStyle = [col.accent, col.muted, col.accent2][r];
        ctx.fillText(name, bx + W * (REGIONS[r][0] + REGIONS[r][1]) / 2, by + Z + 76);
      });
      ctx.globalAlpha = 1;
    }

    // the ends of the slice, named after the surface so nothing covers them
    var fs = big ? 36 : 22;
    ctx.fillStyle = col.muted; ctx.font = 'italic ' + fs + 'px ETbb, Georgia, serif';
    ctx.textAlign = 'right'; ctx.fillText('ℐ⁺', bx - 8, by + Z * 0.6);
    ctx.textAlign = 'left'; ctx.fillText('ℋ⁺', bx + W + 8, by + Z * 0.6);

    // the cut f(sigma), drawn over the front edge (zoom only)
    if (cut && data.zoom.cut) {
      ctx.globalAlpha = cut;
      ctx.strokeStyle = col.accent; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
      ctx.beginPath();
      data.zoom.cut.forEach(function (f, i) {
        var X = bx + W * i / (NS - 1), Y = by + Z + 30 - 50 * f;
        if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
      });
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = col.accent; ctx.font = 'italic 30px ETbb, Georgia, serif'; ctx.textAlign = 'left';
      ctx.fillText('f', bx - 30, by + Z - 16);
      ctx.globalAlpha = 1;
    }
  }

  function draw(tau, s) {
    var css = getComputedStyle(slide);
    var get = function (v) { return css.getPropertyValue(v).trim(); };
    var col = { bg: get('--bg'), hair: get('--hair'), muted: get('--muted'), ink: get('--ink'), accent: get('--accent'), accent2: get('--accent-2'), line: get('--accent') };
    var NX = data.x.length;
    var cr = Math.cos(data.w[0] * tau), sr = Math.sin(data.w[0] * tau);   // e^{-i Re(w) tau} = cr - i sr
    ctx.clearRect(0, 0, 1920, 1080);

    // the grid of 14 fades out, then the zoom fades in: one at a time
    var aGrid = smooth(1 - 2 * zoom), aZoom = smooth(2 * zoom - 1);
    if (aGrid > 0.005) {
      var F = s >= 3 ? data.glued : data.irg;
      ctx.save();
      ctx.globalAlpha = aGrid;
      panels().forEach(function (p) {
        var v = F[p.c];
        surface(p, function (i, j) { return v ? v[i * NX + j] : null; }, cr, sr, col, false, 0);
      });
      ctx.restore();
    }
    if (aZoom > 0.005) {
      var Z = data.zoom, u = smooth(morph);
      ctx.save();
      ctx.globalAlpha = aZoom;
      surface({ x: BIG.x, y: BIG.y, w: BIG.w, h: BIG.h }, function (i, j) {
        var k = i * NX + j, a = Z.irg[k], b = Z.glued[k];
        return [a[0] + u * (b[0] - a[0]), a[1] + u * (b[1] - a[1])];
      }, cr, sr, col, true, aZoom);
      ctx.restore();
    }
  }

  function frame(t) {
    if (!t0) { t0 = t; tPrev = t; }
    var dt = Math.min(0.1, (t - tPrev) / 1000); tPrev = t;
    var s = Number(slide.dataset.s || 0);
    if (lastS < 0) { zoom = s === 1 || s === 2 ? 1 : 0; morph = s >= 2 ? 1 : 0; }   // arriving: no replay
    lastS = s;
    var target = s === 1 || s === 2 ? 1 : 0;
    zoom += (target - zoom) * (1 - Math.exp(-dt / TAU));
    if (Math.abs(target - zoom) < 1e-3) zoom = target;
    // the morph: forward at step 2 (once the zoom is in), held at 3, back at 0 and 1
    if (s === 2 && zoom > 0.98) morph = Math.min(1, morph + dt / MORPH);
    else if (s < 2) morph = Math.max(0, morph - dt / MORPH);
    else if (s >= 3) morph = 1;
    // labels: in IRG the zero components say so; in the glued field only h_mmb does
    slide.querySelectorAll('.rc-lab').forEach(function (l) {
      var F = s >= 3 ? data.glued : data.irg;
      l.classList.toggle('rc-zero', !F[l.dataset.c]);
      l.style.opacity = smooth(1 - 2 * zoom);
    });
    draw(SPEED * (t - t0) / 1000, s);
    raf = requestAnimationFrame(frame);
  }

  // the labels go in the HTML, placed here so they follow the panels
  function place() {
    var labs = slide.querySelectorAll('.rc-lab');
    panels().forEach(function (p, i) {
      if (!labs[i]) return;
      labs[i].dataset.c = p.c;
      labs[i].style.left = (p.x + 10) + 'px';
      labs[i].style.top = (p.y + 4) + 'px';
    });
  }

  size();
  place();
  window.addEventListener('resize', size);
  fetch('data/recon.json').then(function (r) { return r.json(); }).then(function (d) {
    data = d;
    draw(0, 0);
    Deck.on('recon', {
      enter: function () { t0 = 0; lastS = -1; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); },
      leave: function () { cancelAnimationFrame(raf); }
    });
  });
})();
