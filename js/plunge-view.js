// The plunge page (plunge.html): controls -> KerrGeo trajectory (here) and
// Teukolsky amplitudes Z(omega) for the chosen (l, m) (Web Workers,
// js/plunge-worker.js) -> the orbit and the mode's radiation in 3D, the
// waveform, the spectrum, the plunge region, and a few numbers.
(function () {
  'use strict';
  var G = window.KerrGeo, K = window.KerrQNM;
  if (!G || !K) return;

  var SPEED = 25;          // animation: M of Kerr-Schild time per second
  var DELTA_ISCO = 1e-4;   // the ISCO orbit is integrated from (1 - DELTA) r_isco (long enough a whirl)
  var FF_RATE = 0.01;      // fast-forward while |dr/dT| < FF_RATE ...
  var FF_MAX = 10;         // ... by FF_RATE/|dr/dT|, at most FF_MAX times
  var N_WHIRL = 3;         // ISCO plunges: followed from N_WHIRL orbits before they leave the ISCO
  var R_DEPART = 0.97;     // ... where leaving means passing R_DEPART r_isco
  var NB = 10;             // spherical harmonics kept in S_lm(theta; omega)
  var NU = 1024, NTH = 96; // the H(u, theta) texture
  var ISO = 0.18;          // isosurfaces at +-ISO of the peak |h|
  var RING = 10;           // the dashed ring, where the waveform marker is read
  var HP = 0.1;            // the 3D field is high-passed below HP omega_QNM
  var START_R = 6;         // the animation starts with the particle at START_R R (drawn at 0.86)
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (id) { return document.getElementById(id); };
  var ui = { a: $('p-a'), E: $('p-E'), L: $('p-L'), Q: $('p-Q'), i: $('p-i'), c: $('p-c'), l: $('p-l'), m: $('p-m') };
  var state = { from: 'inf', a: 0.7, E: 1.02, L: 2.2, Q: 6, iota: 40, chi0: 0, l: 2, m: 2,
                camI: 1.15, camAz: -0.5, RL: 6, clock: 0 };
  var tr = null, path = null, region = null, iscoCurve = null, consts = null, status = '';
  var dirty = true;

  // ---- colours from the page's tokens -----------------------------------

  var col = {};
  function hex(c) {
    c = c.trim();
    if (c[0] === '#' && c.length === 4) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    var v = parseInt(c.slice(1), 16);
    return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255];
  }
  function readColours() {
    var cs = getComputedStyle(document.documentElement);
    ['bg', 'panel', 'ink', 'muted', 'hair', 'accent', 'accent-2'].forEach(function (k) {
      col[k] = cs.getPropertyValue('--' + k).trim();
    });
    col.dark = document.documentElement.dataset.theme === 'dark';
    col.hole = col.dark ? [0.05, 0.035, 0.03] : hex(col.ink);
  }
  readColours();
  new MutationObserver(function () { readColours(); dirty = true; })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ---- geometry: Boyer-Lindquist radius -> display ------------------------

  function hz() { return G.horizons(state.a); }
  function rstar(r) { return G.rstar(state.a, r); }
  // a point at radius r is drawn at r/(r + R): the horizon small, infinity the unit sphere
  function rho(r) { return r / (r + state.RL); }

  // ---- the orbit ---------------------------------------------------------

  function solve() {
    var a = state.a;
    if (state.from === 'isco') {
      var s = G.isso(a, Math.cos(state.iota * Math.PI / 180));
      consts = s ? { E: s.E, L: s.L, Q: s.Q, r0: s.r * (1 - DELTA_ISCO), risco: s.r } : null;
    } else {
      consts = { E: state.E, L: state.L, Q: state.Q, r0: 1e5 };
    }
    tr = null; path = null; status = '';
    if (!consts) { status = 'no ISCO found'; return; }
    if (state.from === 'inf' && !G.plunges(a, consts.E, consts.L, consts.Q)) {
      status = 'turns around and escapes';
      return;
    }
    tr = G.trajectory(a, consts.E, consts.L, consts.Q, { r0: consts.r0, chi0: state.chi0 });
    if (state.from === 'isco') whirl();
    path = trace(tr, startLam());
  }

  // Boyer-Lindquist t at Mino time lam
  function tAt(lam) { var q = tr.at(lam); return q.v - rstar(q.r); }
  // The exact ISCO plunge has whirled forever (a line in the spectrum at
  // m Omega_ISCO). It is followed instead from N_WHIRL orbits before it
  // leaves the ISCO (passes R_DEPART r_isco), its source switched on smoothly
  // over the first of them: consts.on = { lam, t, T } (start, its t, one orbit).
  function whirl() {
    var q = tr.at(0), Dl = q.r * q.r - 2 * q.r + state.a * state.a;
    var dt = q.dlam.v - (q.r * q.r + state.a * state.a) / Dl * q.dlam.r, dphi = q.dlam.phit - state.a / Dl * q.dlam.r;
    var T = 2 * Math.PI / Math.abs(dphi / dt), lDep = tr.lamAt(R_DEPART * consts.risco) || 0;
    var t0 = tAt(0), tOn = Math.max(t0, tAt(lDep) - N_WHIRL * T), lo = 0, hi = lDep;
    for (var i = 0; i < 60; i++) { var mid = 0.5 * (lo + hi); if (tAt(mid) < tOn) lo = mid; else hi = mid; }
    consts.on = { lam: tOn > t0 ? 0.5 * (lo + hi) : 0, t: tOn, T: T };
  }
  // where the animation (and, from the ISCO, the source) starts
  function startLam() {
    if (state.from === 'isco') return consts.on.lam;
    return tr.lamAt(Math.min(START_R * state.RL, consts.r0 * 0.999)) || 0;
  }

  // Points along the path about evenly spaced on screen, each with the
  // animation time at which the particle passes it. The clock is Kerr-Schild
  // time T = v - r, sped up where the particle hardly moves inwards (the
  // whirl near the ISCO): f = clamp(FF_RATE/|dr/dT|, 1, FF_MAX).
  function trace(tr, lam0) {
    var out = [], L = tr.lam, i, j, last = null;
    function disp(s) {
      var n = Math.hypot(s.X, s.Y, s.Z) || 1, q = rho(s.r) / n;
      s.D = [s.X * q, s.Y * q, s.Z * q];
      s.T = s.v - s.r;
      return s;
    }
    function keep(s) {
      var dT = s.dlam.v - s.dlam.r, f = Math.min(Math.max(FF_RATE * dT / Math.max(-s.dlam.r, 1e-300), 1), FF_MAX);
      s.f = f;
      s.A = last ? last.A + (s.T - last.T) / (SPEED * 0.5 * (f + last.f)) : 0;
      out.push(s); last = s;
    }
    keep(disp(tr.at(lam0)));
    for (i = 0; i + 1 < L.length && L[i] < tr.lamEnd; i++) {
      for (j = 1; j <= 8; j++) {
        var lam = L[i] + (L[i + 1] - L[i]) * j / 8;
        if (lam <= lam0) continue;
        if (lam >= tr.lamEnd) break;
        var s = disp(tr.at(lam));
        if (Math.hypot(s.D[0] - last.D[0], s.D[1] - last.D[1], s.D[2] - last.D[2]) >= 0.004) keep(s);
      }
    }
    keep(disp(tr.at(tr.lamEnd)));
    return out;
  }

  // the animation clock A (seconds) -> Kerr-Schild time T, and the last path
  // point passed; after the particle is gone the clock runs on at SPEED
  function clockT(A) {
    var n = path.length - 1;
    if (A >= path[n].A) return { T: path[n].T + (A - path[n].A) * SPEED, i: n, fr: 0 };
    var lo = 0, hi = n;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (path[m].A > A) hi = m; else lo = m; }
    var fr = (A - path[lo].A) / (path[hi].A - path[lo].A);
    return { T: path[lo].T + fr * (path[hi].T - path[lo].T), i: lo, fr: fr };
  }
  // retarded time reaching radius r on the slice T
  function uAt(T, r) { return T + r - 2 * rstar(r); }

  function solveRegion() {
    region = G.plungeRegion(state.a, state.E, 161);
    iscoCurve = [];
    for (var d = 0; d <= 180; d += 2) {
      var s = G.isso(state.a, Math.cos(d * Math.PI / 180));
      if (s) iscoCurve.push(s);
    }
  }

  // ---- the radiation: Z(omega) from the workers, then h(u, theta) --------

  // Midpoint grid omega_i = (i - N + 1/2) d omega, i < 2N (2N a power of two,
  // so the grid is filled coarse-first: every 2N/8-th point, then halves).
  // The time series uses the finest stride s whose points are all in, so it
  // sharpens as the spectrum fills.
  var spec = null, job = 0, pool = [], qnm = null, td = null;
  try {
    var nw = Math.max(1, Math.min(6, (navigator.hardwareConcurrency || 4) - 1));
    for (var iw = 0; iw < nw; iw++) pool.push(new Worker('/js/plunge-worker.js'));
  } catch (e) { pool = []; }

  function qnmFreqs() {
    try {
      var w1 = K.mode(-2, state.l, state.m, 0, state.a).omega, w2 = K.mode(-2, state.l, -state.m, 0, state.a).omega;
      return [w1[0], -w2[0]];   // the mode and its mirror, -conj(omega_{l,-m})
    } catch (e) { return null; }
  }

  function startJob() {
    job++;
    spec = null; td = null; dirty = true;
    if (!tr || !pool.length) { readout(); return; }
    qnm = qnmFreqs();
    var wq = qnm ? Math.max(Math.abs(qnm[0]), Math.abs(qnm[1])) : 0.6;
    var wmax = Math.max(1.2, 1.8 * wq), N2 = state.from === 'isco' ? 512 : 256, N = N2 / 2, dw = 2 * wmax / N2;
    var order = [], seen = new Uint8Array(N2);
    for (var s = N2 / 8; s >= 1; s /= 2) for (var i = 0; i < N2; i += s) if (!seen[i]) { seen[i] = 1; order.push(i); }
    spec = { job: job, N2: N2, N: N, dw: dw, wmax: wmax, w: [], Z: [], b: [], lmin: Math.max(2, Math.abs(state.m)),
             got: new Uint8Array(N2), n: 0, order: order, next: 0, l: state.l, m: state.m, stride: N2 };
    for (i = 0; i < N2; i++) spec.w.push((i - N + 0.5) * dw);
    var orbit = { a: state.a, E: consts.E, L: consts.L, Q: consts.Q, chi0: state.chi0, from: state.from, r0: consts.r0,
                  on: consts.on || null };
    pool.forEach(function (wk) {
      wk.onmessage = function (e) {
        var d = e.data;
        if (!spec || d.job !== spec.job) return;
        var i = Math.round(d.omega / spec.dw + spec.N - 0.5);
        spec.Z[i] = d.Z; spec.b[i] = d.b; spec.got[i] = 1; spec.n++;
        dispatch(wk);
        if (spec.n === spec.N2) { synth(); state.clock = 0; runStatus(); readout(); }
        else progress();
      };
      dispatch(wk);
    });
    function dispatch(wk) {
      if (!spec || spec.next >= spec.order.length) return;
      var i = spec.order[spec.next++];
      wk.postMessage({ job: spec.job, orbit: orbit, l: state.l, m: state.m, omega: spec.w[i], on: consts.on || null, wmax: spec.wmax });
    }
    runStatus(); readout();
  }

  // the button and its status line; progress redrawn at most every 200 ms
  var progTimer = null;
  function progress() {
    if (progTimer) return;
    progTimer = setTimeout(function () { progTimer = null; runStatus(); drawSpec(); }, 200);
  }
  function runStatus() {
    var b = $('p-run'), st = $('p-run-status');
    if (!tr) { b.disabled = true; b.textContent = '[compute the radiation]'; st.textContent = status ? 'no plunge to compute' : ''; return; }
    if (spec && spec.n < spec.N2) {
      b.disabled = true; b.textContent = '[computing\u2026]';
      st.textContent = Math.round(100 * spec.n / spec.N2) + '% of ' + spec.N2 + ' frequencies';
    } else if (td) {
      b.disabled = false; b.textContent = '[compute again]'; st.textContent = '';
    } else {
      b.disabled = false; b.textContent = '[compute the radiation]';
      st.textContent = 'takes a few seconds; the orbit is shown meanwhile';
    }
  }

  // h_j(u) = -2 sum_i Z_i b_j(omega_i)/omega_i^2 e^{-i omega_i u} (s d omega) on
  // NU points of a window around the plunge, and H(u, theta) = sum_j h_j -2Y_jm(theta)
  function synth() {
    if (!spec || !path) return;
    var s = spec.N2;
    while (s > 1) {
      var all = true;
      for (var i = 0; i < spec.N2; i += s / 2) if (!spec.got[i]) { all = false; break; }
      if (!all) break;
      s /= 2;
    }
    var full = true;
    for (i = 0; i < spec.N2; i += s) if (!spec.got[i]) { full = false; break; }
    if (!full) return;
    spec.stride = s;
    // window: around when the particle passes r = 3M (from the ISCO, longer before)
    // anchor: the particle passing r_a, halfway from the horizon to 3M (or to
    // where it leaves the ISCO, if that is inside 3M) -- near the burst
    var rTop = state.from === 'isco' ? Math.min(3, R_DEPART * consts.risco) : 3;
    var la = tr.lamAt(hz().rp + 0.5 * (rTop - hz().rp)), p3 = tr.at(la !== null ? la : tr.lamEnd);
    var u3 = p3.v - 2 * rstar(p3.r), P = 2 * Math.PI / spec.dw;
    // while the grid is coarse (stride s) the series repeats every P/s: show one
    // period around the plunge, which is right, rather than its copies
    var u0, u1;
    if (state.from === 'isco') {
      // from just before the switch-on to well into the ringdown
      var uOn = consts.on.t - rstar(consts.risco);
      u1 = u3 + 200; u0 = Math.max(uOn - 60, u1 - P * 0.98 / s);
    } else {
      var W = Math.min(P * 0.98 / s, 650);
      u0 = u3 - 0.7 * W; u1 = u3 + 0.3 * W;
    }
    var du = (u1 - u0) / (NU - 1), nb = 0;
    for (i = 0; i < spec.N2; i += s) if (spec.b[i]) nb = Math.max(nb, spec.b[i].length / 2);
    var hS = { re: new Float64Array(NU), im: new Float64Array(NU) }, hj = [];
    for (var j = 0; j < nb; j++) hj.push({ re: new Float64Array(NU), im: new Float64Array(NU) });
    // the 3D field leaves out the slowest part (the drift before the burst and
    // the memory after it, for E > 1): its frequencies are weighted by
    // 1 - e^{-(omega/omega_c)^2}, omega_c = HP times the quasinormal frequency.
    // The waveform panel keeps everything.
    var wt = -2 * s * spec.dw, wc = HP * (qnm ? Math.max(Math.abs(qnm[0]), Math.abs(qnm[1])) : 0.5);
    for (i = 0; i < spec.N2; i += s) {
      var Z = spec.Z[i], w = spec.w[i];
      if (!Z || !isFinite(Z[0])) continue;
      var c = [Z[0] * wt / (w * w), Z[1] * wt / (w * w)], hp = 1 - Math.exp(-(w * w) / (wc * wc));
      // e^{-i w u_n} by recurrence from u0
      var pr = Math.cos(w * u0), pi = -Math.sin(w * u0), sr = Math.cos(w * du), si = -Math.sin(w * du);
      var b = spec.b[i];
      for (var n = 0; n < NU; n++) {
        var vr = c[0] * pr - c[1] * pi, vi = c[0] * pi + c[1] * pr;
        hS.re[n] += vr; hS.im[n] += vi;
        for (j = 0; j < nb; j++) {
          var br = b[2 * j] * hp, bi = b[2 * j + 1] * hp;
          hj[j].re[n] += vr * br - vi * bi; hj[j].im[n] += vr * bi + vi * br;
        }
        var t = pr * sr - pi * si; pi = pr * si + pi * sr; pr = t;
      }
    }
    // H(u, theta) on NTH polar angles
    var H = new Float32Array(2 * NU * NTH), hmax = 0, ys = [];
    for (var k = 0; k < NTH; k++) ys.push(K.swshColumn(-2, spec.m, spec.lmin + nb - 1, Math.cos(Math.PI * k / (NTH - 1))));
    for (k = 0; k < NTH; k++) for (n = 0; n < NU; n++) {
      var hr = 0, hi = 0;
      for (j = 0; j < nb; j++) { hr += hj[j].re[n] * ys[k][j]; hi += hj[j].im[n] * ys[k][j]; }
      // zero at the two ends of the window, so outside it the field is 0
      var edge = (n === 0 || n === NU - 1) ? 0 : 1;
      H[2 * (k * NU + n)] = hr * edge; H[2 * (k * NU + n) + 1] = hi * edge;
      hmax = Math.max(hmax, Math.hypot(hr, hi));
    }
    var smax = 0;
    for (n = 0; n < NU; n++) smax = Math.max(smax, Math.hypot(hS.re[n], hS.im[n]));
    td = { u0: u0, u1: u1, hS: hS, smax: smax, H: H, hmax: hmax || 1, nb: nb, s: s,
           energy: energyOf(s) };
    vol.upload(td);
    dirty = true;
  }
  // E_lm = (1/2) Int domega |Z|^2/omega^2 over both signs (units mu^2/M)
  function energyOf(s) {
    var E = 0;
    for (var i = 0; i < spec.N2; i += s) {
      var Z = spec.Z[i];
      if (Z && isFinite(Z[0])) E += 0.5 * (Z[0] * Z[0] + Z[1] * Z[1]) / (spec.w[i] * spec.w[i]) * s * spec.dw;
    }
    return E;
  }

  // ---- WebGL: the field Re[H(u, theta) e^{i m phi}] around the hole -------

  // camera at polar angle camI from the spin axis, azimuth camAz;
  // columns: screen right, screen up, towards the viewer
  function camera() {
    var si = Math.sin(state.camI), ci = Math.cos(state.camI);
    var back = [si * Math.cos(state.camAz), si * Math.sin(state.camAz), ci];
    var right = [-Math.sin(state.camAz), Math.cos(state.camAz), 0];
    var up = [back[1] * right[2] - back[2] * right[1], back[2] * right[0] - back[0] * right[2], back[0] * right[1] - back[1] * right[0]];
    return { right: right, up: up, back: back, mat: new Float32Array(right.concat(up, back)) };
  }
  var ZOOM = 1.06;   // the unit sphere fills the canvas with a margin
  var QUALITY = 0.75; // WebGL pixels per CSS pixel; adapted to the frame rate below

  var VS = '#version 300 es\nout vec2 vUv;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);vUv=p;gl_Position=vec4(p*2.-1.,0.,1.);}';
  // The field at a display point p: r from |p| = r/(r + R); u = T + r - 2 r_*
  // (the retarded time on a Kerr-Schild slice); phi = Boyer-Lindquist azimuth
  // (atan of the Kerr-Schild direction, less atan(a/r) and r_sharp). It is
  // faded inside 3 r_+, where the far-zone field is not the true one, and
  // where a ray step spans more than ~1 radian of its phase.
  var FS = [
    '#version 300 es', 'precision highp float;',
    'in vec2 vUv; out vec4 o;',
    'uniform sampler2D uH;',
    'uniform float uT, uU0, uU1, uM, uRL, uRp, uRm, uA, uAmp, uIso, uAspect, uPx, uWt, uOn;',
    'uniform int uN; uniform mat3 uRot;',
    'uniform vec3 uPos, uNeg, uHole, uInk;',
    'const float PI = 3.14159265;',
    'float rstar(float r){ float d=uRp-uRm; return r+2.*uRp/d*log((r-uRp)*.5)-2.*uRm/d*log((r-uRm)*.5); }',
    'float rsharp(float r){ return uA/(uRp-uRm)*log((r-uRp)/(r-uRm)); }',
    'float rate;',
    'float field(vec3 p){',
    '  float q=length(p); float r=uRL*q/(1.-q); rate=0.;',
    '  if(r<uRp*1.0001 || uOn<.5) return 0.;',
    '  float u=uT+r-2.*rstar(r); float x=(u-uU0)/(uU1-uU0);',
    '  if(x<0. || x>1.) return 0.;',
    '  float th=acos(clamp(p.z/q,-1.,1.));',
    '  vec2 H=texture(uH, vec2(x*(1.-1./1024.)+.5/1024., th/PI*(1.-1./96.)+.5/96.)).rg;',
    '  float ph=uM*(atan(p.y,p.x)-atan(uA,r)-rsharp(r));',
    '  rate=uWt*uRL/((1.-q)*(1.-q))*abs(1.-2.*(r*r+uA*uA)/((r-uRp)*(r-uRm)));',
    '  return uAmp*(H.x*cos(ph)-H.y*sin(ph))*smoothstep(3.*uRp,4.5*uRp,r);',
    '}',
    'vec3 grad(vec3 p){ vec2 e=vec2(.003,0.);',
    '  return vec3(field(p+e.xyy)-field(p-e.xyy), field(p+e.yxy)-field(p-e.yxy), field(p+e.yyx)-field(p-e.yyx)); }',
    'void main(){',
    '  vec2 q=(vUv*2.-1.)*vec2(uAspect,1.)*' + ZOOM.toFixed(2) + '; vec3 ro=uRot*vec3(q,3.), rd=-uRot[2];',
    '  float b=dot(ro,rd), h=b*b-dot(ro,ro)+1.;',
    '  float d=sqrt(max(dot(ro,ro)-b*b,0.));',
    '  float edge=.35*(1.-smoothstep(0.,1.2*uPx,abs(d-1.)));',
    '  if(h<0.){ o=vec4(edge*uInk,edge); return; }',
    '  h=sqrt(h); float t0=-b-h, t1=-b+h;',
    '  float rH=uRp/(uRp+uRL);',
    '  float hh=b*b-dot(ro,ro)+rH*rH; bool hit=hh>0.; float tE= hit ? -b-sqrt(hh) : t1;',
    '  if(uOn<.5){ vec3 c=vec3(0.); float a=0.;',
    '    if(hit){ vec3 p=ro+rd*tE; vec3 nrm=normalize(p); float rim=pow(1.-max(dot(nrm,-rd),0.),3.); c=mix(uHole,uInk,.25*rim); a=1.; }',
    '    c+=(1.-a)*edge*uInk; a+=(1.-a)*edge; o=vec4(c,a); return; }',
    '  float dt=(tE-t0)/float(uN);',
    '  vec3 c=vec3(0.); float a=0.;',
    '  float vp=field(ro+rd*t0);',
    '  for(int i=1;i<=320;i++){',
    '    if(i>uN) break;',
    '    float t=t0+float(i)*dt; vec3 p=ro+rd*t; float v=field(p);',
    '    float res=1.-smoothstep(.3,.65,rate*dt);',
    '    float al=res*(1.-exp(-.6*min(v*v,2.)*dt));',
    '    c+=(1.-a)*al*(v>0.?uPos:uNeg); a+=(1.-a)*al;',
    '    for(int k=0;k<2;k++){',
    '      float lv= k==0 ? uIso : -uIso;',
    '      if((vp-lv)*(v-lv)<0.){',
    '        float f=(vp-lv)/(vp-v); vec3 qq=p-rd*dt*(1.-f);',
    '        vec3 nrm=normalize(grad(qq)); if(dot(nrm,rd)>0.) nrm=-nrm;',
    '        float dif=.55+.45*max(dot(nrm,normalize(-rd+vec3(.3,.5,0.))),0.);',
    '        float rim=pow(1.-abs(dot(nrm,rd)),2.);',
    '        vec3 sc=(k==0?uPos:uNeg)*dif+.25*rim*uInk;',
    '        float sa=res*(.32+.28*rim);',
    '        c+=(1.-a)*sa*sc; a+=(1.-a)*sa; } }',
    '    vp=v;',
    '    if(a>.985) break; }',
    '  if(hit){ vec3 p=ro+rd*tE; vec3 nrm=normalize(p);',
    '    float rim=pow(1.-max(dot(nrm,-rd),0.),3.);',
    '    c+=(1.-a)*mix(uHole, uInk, .25*rim); a=1.; }',
    '  c+=(1.-a)*edge*uInk; a+=(1.-a)*edge;',
    '  o=vec4(c,a); }'
  ].join('\n');

  var vol = (function (canvas) {
    var gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false });
    if (!gl) {
      canvas.parentNode.insertAdjacentHTML('afterend', '<p class="qnm-nogl">The radiation needs WebGL2; the orbit is drawn without it.</p>');
      return { upload: function () {}, draw: function () {} };
    }
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindVertexArray(gl.createVertexArray());
    var U = {};
    ['uH', 'uT', 'uU0', 'uU1', 'uM', 'uRL', 'uRp', 'uRm', 'uA', 'uAmp', 'uIso', 'uAspect', 'uPx', 'uWt', 'uOn', 'uN', 'uRot',
     'uPos', 'uNeg', 'uHole', 'uInk'].forEach(function (k) { U[k] = gl.getUniformLocation(pr, k); });
    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U.uH, 0);
    var have = null;
    return {
      upload: function (t) {
        // half floats: keep the values O(1)
        var d = new Float32Array(t.H.length);
        for (var i = 0; i < d.length; i++) d[i] = t.H[i] / t.hmax;
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, NU, NTH, 0, gl.RG, gl.FLOAT, d);
        have = t;
      },
      draw: function (T) {
        // the field is drawn at reduced resolution (QUALITY, lowered while
        // frames are slow) and scaled up by the browser
        var w = Math.max(64, Math.round(canvas.clientWidth * QUALITY)), h = Math.max(64, Math.round(canvas.clientHeight * QUALITY));
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        gl.viewport(0, 0, w, h);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        var H = hz(), on = have && spec && have === td;
        gl.uniform1f(U.uT, T);
        gl.uniform1f(U.uU0, on ? have.u0 : 0); gl.uniform1f(U.uU1, on ? have.u1 : 1);
        gl.uniform1f(U.uOn, on ? 1 : 0);
        gl.uniform1f(U.uM, state.m);
        gl.uniform1f(U.uRL, state.RL);
        gl.uniform1f(U.uRp, H.rp); gl.uniform1f(U.uRm, H.rm); gl.uniform1f(U.uA, state.a);
        gl.uniform1f(U.uAmp, 1);
        gl.uniform1f(U.uIso, ISO);
        gl.uniform1f(U.uAspect, w / h);
        gl.uniform1f(U.uPx, 2 * ZOOM / h);
        gl.uniform1f(U.uWt, qnm ? Math.max(Math.abs(qnm[0]), Math.abs(qnm[1])) : 0.5);
        gl.uniform1i(U.uN, 150);
        gl.uniformMatrix3fv(U.uRot, false, camera().mat);
        gl.uniform3fv(U.uPos, hex(col.accent));
        gl.uniform3fv(U.uNeg, hex(col['accent-2']));
        gl.uniform3fv(U.uHole, col.hole);
        gl.uniform3fv(U.uInk, hex(col.ink));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };
  })($('p-vol'));

  // ---- 2D canvases ---------------------------------------------------------

  function ctx2d(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    var c = canvas.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    c.font = '13px ETbb, Georgia, serif';
    c.lineJoin = 'round';
    return { c: c, w: w, h: h };
  }

  // the orbit, on top of the WebGL view with the same camera
  function drawOverlay(now) {
    var k = ctx2d($('p-over')), c = k.c, w = k.w, h = k.h, cam = camera();
    var P = function (p) {
      var x = p[0] * cam.right[0] + p[1] * cam.right[1] + p[2] * cam.right[2];
      var y = p[0] * cam.up[0] + p[1] * cam.up[1] + p[2] * cam.up[2];
      return [(x / (ZOOM * w / h) + 1) / 2 * w, (1 - (y / ZOOM + 1) / 2) * h,
              p[0] * cam.back[0] + p[1] * cam.back[1] + p[2] * cam.back[2], Math.hypot(x, y)];
    };
    var rH = rho(hz().rp);
    // hidden behind the hole?
    var hidden = function (q) { return q[2] < 0 && q[3] < rH; };
    function ring(r, dash, alpha) {
      c.strokeStyle = col.muted; c.setLineDash(dash); c.globalAlpha = alpha; c.lineWidth = 1;
      c.beginPath();
      var R = rho(r), first = true;
      for (var i = 0; i <= 160; i++) {
        var f = 2 * Math.PI * i / 160, q = P([R * Math.cos(f), R * Math.sin(f), 0]);
        if (hidden(q)) { first = true; continue; }
        first ? c.moveTo(q[0], q[1]) : c.lineTo(q[0], q[1]); first = false;
      }
      c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
    }
    ring(2, [2, 3], 0.6);             // the ergosphere in the equator
    ring(RING, [6, 5], 0.45);         // where the waveform marker is read
    if (path) {
      var pts = path.map(function (s) { return P(s.D); });
      for (var pass = 0; pass < 2; pass++) {
        c.strokeStyle = pass ? col.ink : col.muted; c.lineWidth = pass ? 1.6 : 1;
        c.globalAlpha = pass ? 0.9 : 0.4;
        c.beginPath();
        var on = false, i0 = pass ? 0 : now.i, i1 = pass ? now.i + 1 : pts.length;
        for (var i = i0; i < i1; i++) {
          if (hidden(pts[i]) || path[i].r < hz().rp) { on = false; continue; }
          on ? c.lineTo(pts[i][0], pts[i][1]) : c.moveTo(pts[i][0], pts[i][1]);
          on = true;
        }
        c.stroke();
      }
      c.globalAlpha = 1;
      var a = path[now.i], b = path[Math.min(now.i + 1, path.length - 1)];
      if (a.r > hz().rp && now.i < path.length - 1) {
        var D = [0, 1, 2].map(function (j) { return a.D[j] + now.fr * (b.D[j] - a.D[j]); }), q = P(D);
        if (!hidden(q)) {
          c.fillStyle = col.ink;
          c.beginPath(); c.arc(q[0], q[1], 3.5, 0, 2 * Math.PI); c.fill();
          c.strokeStyle = col.bg; c.lineWidth = 1; c.stroke();
        }
      }
    }
    c.fillStyle = col.muted; c.textAlign = 'left';
    if (status) { c.font = 'italic 15px ETbb, Georgia, serif'; c.textAlign = 'center'; c.fillText(status, w / 2, h - 16); }
    else if (path && path[now.i].f > 1.5 && now.i < path.length - 1) {
      c.font = 'italic 14px ETbb, Georgia, serif'; c.fillText('fast-forward ×' + Math.round(path[now.i].f), 8, 18);
    }
    c.font = '13px ETbb, Georgia, serif'; c.textAlign = 'right';
    c.fillText('R = ' + state.RL.toFixed(state.RL < 10 ? 1 : 0) + 'M', w - 8, h - 8);
  }

  // the waveform of the mode, -2 Int Z/omega^2 e^{-i omega u}, with the marker
  // at the retarded time reaching the dashed ring
  function drawWave(now) {
    var k = ctx2d($('p-wave')), c = k.c, w = k.w, h = k.h;
    var L = 10, R = w - 10, mid = h / 2 - 6, amp = (h / 2 - 16);
    c.strokeStyle = col.hair; c.lineWidth = 1;
    c.beginPath(); c.moveTo(L, mid); c.lineTo(R, mid); c.stroke();
    if (!td) {
      c.fillStyle = col.muted; c.textAlign = 'center'; c.font = 'italic 14px ETbb, Georgia, serif';
      c.fillText(!tr ? '' : !pool.length ? 'needs Web Workers' : spec ? 'computing…' : 'press [compute the radiation]', w / 2, mid - 8);
      return;
    }
    var X = function (n) { return L + (R - L) * n / (NU - 1); };
    [['hS', 'im', col['accent-2'], 1, 0.7], ['hS', 're', col.accent, 1.6, 1]].forEach(function (sp) {
      c.strokeStyle = sp[2]; c.lineWidth = sp[3]; c.globalAlpha = sp[4];
      c.beginPath();
      for (var n = 0; n < NU; n++) {
        var y = mid - amp * td.hS[sp[1]][n] / td.smax;
        n ? c.lineTo(X(n), y) : c.moveTo(X(n), y);
      }
      c.stroke();
    });
    c.globalAlpha = 1;
    var u = uAt(now.T, RING), x = L + (R - L) * (u - td.u0) / (td.u1 - td.u0);
    if (x > L && x < R) {
      c.strokeStyle = col.muted; c.globalAlpha = 0.7;
      c.beginPath(); c.moveTo(x, 4); c.lineTo(x, h - 20); c.stroke(); c.globalAlpha = 1;
    }
    c.fillStyle = col.muted; c.font = '13px ETbb, Georgia, serif';
    c.textAlign = 'left'; c.fillText('peak ' + td.smax.toPrecision(3), L, h - 4);
    c.textAlign = 'right'; c.fillText(Math.round(td.u1 - td.u0) + 'M', R, h - 4);
  }

  // log |h~(omega)| = log |Z|/omega^2
  function drawSpec() {
    var k = ctx2d($('p-spec')), c = k.c, w = k.w, h = k.h;
    var L = 34, R = w - 10, T = 10, B = h - 22;
    c.strokeStyle = col.hair; c.lineWidth = 1;
    c.beginPath(); c.moveTo(L, B); c.lineTo(R, B); c.stroke();
    if (!spec) return;
    var X = function (wv) { return L + (R - L) * (wv + spec.wmax) / (2 * spec.wmax); };
    c.fillStyle = col.muted; c.textAlign = 'center'; c.font = '13px ETbb, Georgia, serif';
    var step = spec.wmax > 1.6 ? 1 : 0.5;
    for (var t = -Math.floor(spec.wmax / step) * step; t <= spec.wmax + 1e-9; t += step) {
      c.fillText((Math.abs(t) < 1e-9 ? 'Mω = 0' : t.toFixed(1)), X(t), B + 15);
      c.beginPath(); c.moveTo(X(t), B); c.lineTo(X(t), B + 3); c.stroke();
    }
    var pts = [], top = -Infinity;
    for (var i = 0; i < spec.N2; i++) if (spec.got[i] && spec.Z[i] && isFinite(spec.Z[i][0])) {
      var v = Math.log10(Math.hypot(spec.Z[i][0], spec.Z[i][1]) / (spec.w[i] * spec.w[i]) + 1e-300);
      pts.push([spec.w[i], v]); top = Math.max(top, v);
    }
    if (!pts.length) return;
    var dec = 6, Y = function (v) { return T + (B - T) * (top - v) / dec; };
    c.textAlign = 'right';
    for (var d = 0; d <= dec; d += 2) c.fillText(d ? '10⁻' + ['', '', '²', '', '⁴', '', '⁶'][d] : '1', L - 6, Y(top - d) + 4);
    if (qnm) qnm.forEach(function (wq) {
      c.strokeStyle = col.muted; c.setLineDash([3, 3]); c.globalAlpha = 0.7;
      c.beginPath(); c.moveTo(X(wq), T); c.lineTo(X(wq), B); c.stroke();
      c.setLineDash([]); c.globalAlpha = 1;
    });
    c.strokeStyle = col.accent; c.lineWidth = 1.5;
    c.beginPath();
    pts.forEach(function (p, j) { var y = Math.min(Y(p[1]), B); j ? c.lineTo(X(p[0]), y) : c.moveTo(X(p[0]), y); });
    c.stroke();
    if (spec.n < spec.N2) {
      c.fillStyle = col.muted; c.textAlign = 'right'; c.font = 'italic 13px ETbb, Georgia, serif';
      c.fillText(spec.n + ' of ' + spec.N2 + ' frequencies', R, T + 10);
    }
  }
  // the plunge region in (L, sqrt Q)
  var regionMap = null;
  function drawRegion() {
    var k = ctx2d($('p-region')), c = k.c, w = k.w, h = k.h;
    var Lmax = 7, Smax = Math.sqrt(40);
    var Lft = 30, Rt = w - 10, T = 10, B = h - 28;
    var X = function (L) { return Lft + (Rt - Lft) * (L + Lmax) / (2 * Lmax); };
    var Y = function (s) { return B - (B - T) * s / Smax; };
    regionMap = { L: function (px) { return (px - Lft) / (Rt - Lft) * 2 * Lmax - Lmax; },
                  S: function (py) { return (B - py) / (B - T) * Smax; } };
    // axes
    c.strokeStyle = col.hair; c.lineWidth = 1;
    c.beginPath(); c.moveTo(Lft, B); c.lineTo(Rt, B); c.moveTo(X(0), B); c.lineTo(X(0), T); c.stroke();
    c.fillStyle = col.muted; c.textAlign = 'center';
    [-6, -4, -2, 2, 4, 6].forEach(function (L) { c.fillText(L, X(L), B + 15); });
    c.fillText('L', Rt - 6, B - 6);
    c.textAlign = 'right';
    [2, 4, 6].forEach(function (s) { c.fillText(s, Lft - 5, Y(s) + 4); });
    c.save(); c.translate(12, (T + B) / 2); c.rotate(-Math.PI / 2); c.textAlign = 'center';
    c.fillText('√Q', 0, 0); c.restore();

    if (state.from === 'inf' && region) {
      c.fillStyle = col.accent; c.globalAlpha = 0.14;
      c.beginPath(); c.moveTo(X(region.Lretro), Y(0));
      region.edge.forEach(function (p) { c.lineTo(X(p.L), Y(Math.sqrt(p.Q))); });
      c.lineTo(X(region.Lpro), Y(0)); c.closePath(); c.fill();
      c.globalAlpha = 1; c.strokeStyle = col.accent; c.lineWidth = 1.2;
      c.beginPath();
      region.edge.forEach(function (p, i) { i ? c.lineTo(X(p.L), Y(Math.sqrt(p.Q))) : c.moveTo(X(p.L), Y(Math.sqrt(p.Q))); });
      c.stroke();
    }
    if (state.from === 'isco' && iscoCurve && iscoCurve.length) {
      c.strokeStyle = col.accent; c.lineWidth = 1.2;
      c.beginPath();
      iscoCurve.forEach(function (s, i) { i ? c.lineTo(X(s.L), Y(Math.sqrt(s.Q))) : c.moveTo(X(s.L), Y(Math.sqrt(s.Q))); });
      c.stroke();
    }
    if (consts) {
      var px = X(consts.L), py = Y(Math.sqrt(consts.Q));
      c.fillStyle = tr ? col.accent : col.bg; c.strokeStyle = col.accent; c.lineWidth = 1.5;
      c.beginPath(); c.arc(px, py, 4, 0, 2 * Math.PI); c.fill(); c.stroke();
    }
  }


  function readout() {
    var rows = [], f = function (x, n) { return x.toFixed(n === undefined ? 4 : n); };
    if (consts) {
      rows.push(['E', f(consts.E)], ['L', f(consts.L)], ['Q', f(consts.Q)]);
      if (consts.risco) rows.push(['r<sub>ISCO</sub>', f(consts.risco) + 'M']);
    }
    rows.push(['r<sub>+</sub>', f(hz().rp) + 'M']);
    if (tr) rows.push(['&theta;<sub>min</sub>', f(Math.acos(Math.min(tr.zm, 1)) * 180 / Math.PI, 1) + '&deg;']);
    else if (status) rows.push(['orbit', status]);
    if (qnm) rows.push(['M&omega;<sub>QNM</sub>', f(qnm[0], 4) + ', ' + f(qnm[1], 4)]);
    if (td) rows.push(['E<sub>&#8467;m</sub>', td.energy.toExponential(3) + ' &mu;<sup>2</sup>/M']);
    $('p-readout').innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
  }

  // ---- controls ----------------------------------------------------------

  function setOut(id, v) { $(id + '-out').innerHTML = v; }
  function syncControls() {
    setOut('p-a', state.a.toFixed(3)); setOut('p-E', state.E.toFixed(3));
    setOut('p-L', state.L.toFixed(2)); setOut('p-Q', state.Q.toFixed(2));
    setOut('p-i', state.iota + '&deg;'); setOut('p-c', state.chi0.toFixed(2));
    setOut('p-l', state.l); setOut('p-m', state.m);
    ui.L.value = state.L; ui.Q.value = state.Q;
    ui.m.min = -state.l; ui.m.max = state.l; ui.m.value = state.m;
    document.querySelectorAll('[data-from]').forEach(function (b) {
      b.classList.toggle('on', b.dataset.from === state.from);
    });
    document.querySelectorAll('.p-inf').forEach(function (el) { el.hidden = state.from !== 'inf'; });
    document.querySelectorAll('.p-isco').forEach(function (el) { el.hidden = state.from !== 'isco'; });
    $('p-region-cap').innerHTML = state.from === 'inf'
      ? 'At this <i>E</i> and spin, the orbits inside the shaded region plunge; the others turn around and escape. Click to choose (<i>L</i>, <i>Q</i>).'
      : 'The constants of the ISCO for every inclination, from prograde equatorial (right) through polar to retrograde (left).';
  }

  // a change of orbit or mode drops the computed radiation; it is computed
  // again only on request (the button)
  function update(regionToo) {
    if (regionToo) solveRegion();
    solve(); syncControls();
    spec = null; td = null; job++;
    runStatus(); readout(); dirty = true;
    state.clock = 0;
  }
  $('p-run').addEventListener('click', function () { if (tr) startJob(); });

  ui.a.addEventListener('input', function () { state.a = +ui.a.value; update(true); });
  ui.E.addEventListener('input', function () { state.E = +ui.E.value; update(true); });
  ui.L.addEventListener('input', function () { state.L = +ui.L.value; update(false); });
  ui.Q.addEventListener('input', function () { state.Q = +ui.Q.value; update(false); });
  ui.i.addEventListener('input', function () { state.iota = +ui.i.value; update(false); });
  ui.c.addEventListener('input', function () { state.chi0 = +ui.c.value; update(false); });
  ui.l.addEventListener('input', function () {
    state.l = +ui.l.value; state.m = Math.max(-state.l, Math.min(state.l, state.m)); update(false);
  });
  ui.m.addEventListener('input', function () { state.m = +ui.m.value; update(false); });
  document.querySelectorAll('[data-from]').forEach(function (b) {
    b.addEventListener('click', function () { state.from = b.dataset.from; update(false); });
  });

  $('p-region').addEventListener('click', function (e) {
    if (state.from !== 'inf' || !regionMap) return;
    var rect = e.target.getBoundingClientRect();
    var L = regionMap.L(e.clientX - rect.left), S = regionMap.S(e.clientY - rect.top);
    state.L = Math.round(Math.min(Math.max(L, -7), 7) * 100) / 100;
    state.Q = Math.round(Math.min(Math.max(S, 0), Math.sqrt(40)) ** 2 * 20) / 20;
    update(false);
  });

  // drag to turn, wheel to zoom (the display scale R)
  (function () {
    var cv = $('p-stage'), drag = null;
    cv.addEventListener('pointerdown', function (e) { drag = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) {
      if (!drag) return;
      state.camAz -= (e.clientX - drag[0]) * 0.01;
      state.camI = Math.min(Math.max(state.camI - (e.clientY - drag[1]) * 0.01, 0.01), Math.PI - 0.01);
      drag = [e.clientX, e.clientY]; dirty = true;
    });
    cv.addEventListener('pointerup', function () { drag = null; });
    cv.addEventListener('wheel', function (e) {
      e.preventDefault();
      state.RL = Math.min(Math.max(state.RL * Math.exp(e.deltaY * 0.001), 1.5), 40);
      if (tr) path = trace(tr, startLam());
      dirty = true;
    }, { passive: false });
  })();

  // ---- animation ---------------------------------------------------------

  // one loop: until the last of the window has passed the dashed ring, then a beat
  function loopEnd() {
    if (!path) return 1;
    var end = path[path.length - 1].A;
    if (td) end = Math.max(end, path[path.length - 1].A + (td.u1 - uAt(path[path.length - 1].T, RING)) / SPEED);
    return end + 1;
  }
  var onscreen = true;
  try {
    new IntersectionObserver(function (es) { onscreen = es[0].isIntersecting; if (onscreen) dirty = true; })
      .observe($('p-stage'));
  } catch (e) {}
  function drawAll() {
    var now = path ? clockT(state.clock) : { T: 0, i: 0, fr: 0 };
    if (onscreen) vol.draw(now.T);
    drawOverlay(now); drawWave(now); drawSpec(); drawRegion(); timeReadout(now);
    dirty = false;
  }
  // time controls: restart, pause/play, and a slider over one loop
  var playing = !calm, scrubbing = false;
  function setPlay(p) { playing = p; $('p-play').textContent = p ? '[pause]' : '[play]'; }
  setPlay(playing);
  $('p-restart').addEventListener('click', function () { state.clock = 0; setPlay(true); dirty = true; });
  $('p-play').addEventListener('click', function () { setPlay(!playing); });
  $('p-time').addEventListener('input', function () {
    scrubbing = true; setPlay(false);
    state.clock = +$('p-time').value / 1000 * loopEnd(); drawAll();
  });
  $('p-time').addEventListener('change', function () { scrubbing = false; });
  function timeReadout(now) {
    if (!path) { $('p-time-out').textContent = ''; return; }
    // T counted from the particle crossing the horizon
    var qH = tr.at(tr.lamH !== null ? tr.lamH : tr.lamEnd), TH = qH.v - qH.r;
    var p = path[now.i], txt = 'T = ' + (now.T - TH).toFixed(0) + 'M';
    if (now.i < path.length - 1 && p.r > hz().rp) {
      var q = path[now.i + 1], lam = p.lam + now.fr * (q.lam - p.lam), r = p.r + now.fr * (q.r - p.r);
      txt += ' \u00b7 \u03bb = ' + lam.toFixed(3) + ' \u00b7 r = ' + r.toFixed(2) + 'M';
    } else txt += ' \u00b7 the particle is inside the horizon';
    $('p-time-out').textContent = txt;
    if (!scrubbing) $('p-time').value = Math.round(1000 * state.clock / loopEnd());
  }

  var last = null, slow = 0;
  function frame(t) {
    var dt = last === null ? 0 : Math.min((t - last) / 1000, 0.1);
    last = t;
    // while the field is showing, lower its resolution if frames are slow
    if (td && onscreen && dt > 0) {
      slow = 0.9 * slow + 0.1 * (dt > 0.045 ? 1 : 0);
      if (slow > 0.6 && QUALITY > 0.35) { QUALITY *= 0.8; slow = 0; }
    }
    if (path && playing) {
      state.clock += dt;
      if (state.clock > loopEnd()) state.clock = 0;
      dirty = true;
    }
    if (dirty) drawAll();
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize', function () { dirty = true; });

  update(true);
  if (calm && path) state.clock = path[path.length - 1].A;
  requestAnimationFrame(frame);
})();
