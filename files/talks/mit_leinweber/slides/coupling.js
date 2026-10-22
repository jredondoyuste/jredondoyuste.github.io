// Gravity is nonlinear: h^(2) lights up, its equation appears, and then the
// complex frequency plane. The linear Kerr modes (solved live by
// /js/kerr-qnm.js at a/M = A) sit as dots; press by press, quadratic modes
// appear where two linear frequencies add, drawn head to tail:
//   220 + 220  lands by the 440: it oscillates like it, but decays twice
//              as fast as the 220
//   220 + 221, 220 + 330  the next ones
//   third order, in green: 220 + 220 - 220* lands by the 221 (same
//   oscillation as the 220, three times its damping)
(function () {
  'use strict';
  if (!window.KerrQNM) return;

  var A = 0.7;
  var BOX = { x0: 1000, x1: 1780, y0: 200, y1: 840 };
  var RE = [0, 1.5], IM = [0, 0.5];            // Re(M w) and -Im(M w), -Im drawn downwards
  var LINEAR = ['220', '221', '222', '330', '331', '440', '441'];

  var slide = document.getElementById('nonlin');
  var $ = function (s) { return slide.querySelector(s); };

  function w(lab) { var q = lab.split('').map(Number); return KerrQNM.mode(-2, q[0], q[1], q[2], A).omega; }
  function X(re) { return BOX.x0 + (re - RE[0]) / (RE[1] - RE[0]) * (BOX.x1 - BOX.x0); }
  function Y(im) { return BOX.y0 + (-im - IM[0]) / (IM[1] - IM[0]) * (BOX.y1 - BOX.y0); }

  var W = {};
  LINEAR.forEach(function (l) { W[l] = w(l); });

  var h = '<rect class="cp-box" x="' + BOX.x0 + '" y="' + BOX.y0 + '" width="' + (BOX.x1 - BOX.x0) + '" height="' + (BOX.y1 - BOX.y0) + '"/>';
  for (var r = 0; r <= RE[1] + 1e-9; r += 0.5) {
    h += '<text class="cp-tick" x="' + X(r) + '" y="' + (BOX.y0 - 16) + '" text-anchor="middle">' + r.toFixed(1) + '</text>';
  }
  for (var i = 0.1; i <= IM[1] + 1e-9; i += 0.1) {
    h += '<text class="cp-tick" x="' + (BOX.x0 - 16) + '" y="' + (Y(-i) + 8) + '" text-anchor="end">' + i.toFixed(1) + '</text>';
  }
  h += '<text class="cp-axis" x="' + (BOX.x0 + BOX.x1) / 2 + '" y="' + (BOX.y0 - 58) + '" text-anchor="middle">Re Mω</text>';
  h += '<text class="cp-axis" transform="translate(' + (BOX.x0 - 80) + ',' + (BOX.y0 + BOX.y1) / 2 + ') rotate(-90)" text-anchor="middle">−Im Mω</text>';
  LINEAR.forEach(function (l) {
    h += '<circle class="cp-lin" cx="' + X(W[l][0]) + '" cy="' + Y(W[l][1]) + '" r="8"/>' +
         '<text class="cp-lab" x="' + (X(W[l][0]) + 14) + '" y="' + (Y(W[l][1]) + 8) + '">' + l + '</text>';
  });
  $('.cp-plane').innerHTML = h;

  // the sums (their groups are in the HTML, with their steps, so the deck
  // counts them): each frequency carried to the tip of the one before, and a
  // star where the chain lands. A term '-220*' is minus the conjugate, -w*.
  function term(t) {
    var conj = /^-.*\*$/.test(t), lab = t.replace(/^-|\*$/g, ''), v = W[lab] || w(lab);
    return conj ? [-v[0], v[1]] : v;
  }
  slide.querySelectorAll('.cp-sum').forEach(function (g) {
    var s = g.dataset.sum.split(','), third = g.classList.contains('cp-third');
    var at = term(s[0]), h = '';
    for (var i = 1; i < s.length; i++) {
      var v = term(s[i]), to = [at[0] + v[0], at[1] + v[1]];
      h += '<line class="cp-arrow" x1="' + X(at[0]) + '" y1="' + Y(at[1]) + '" x2="' + X(to[0]) + '" y2="' + Y(to[1]) +
           '" marker-end="url(#' + (third ? 'cp-head3' : 'cp-head') + ')"/>';
      at = to;
    }
    var label = s.map(function (t) { return t.replace(/^-/, ''); }).join('×');
    var dx = third ? -22 : 18, anchor = third ? 'end' : 'start';
    h += '<path class="cp-star" transform="translate(' + X(at[0]) + ',' + Y(at[1]) + ')" d="M0 -13 L3.8 -4 L13 -4 L5.6 2 L8.2 12 L0 6 L-8.2 12 L-5.6 2 L-13 -4 L-3.8 -4 Z"/>' +
         '<text class="cp-qlab" x="' + (X(at[0]) + dx) + '" y="' + (Y(at[1]) + 34) + '" text-anchor="' + anchor + '">' + label + '</text>';
    g.innerHTML = h;
  });
})();
