// The Kerr QNM page (kerr.html): sliders -> KerrQNM solve -> four views.
//
// The mode is  psi = Re[ e^{-i omega tau + i m phi} g(x) S(theta) ],  with
// g Leaver's radial series on x in [0,1] (horizon to null infinity) and S
// the spheroidal harmonic. Both are sampled into 1D textures; the volume
// and sphere shaders put the phase back per pixel.
(function () {
  'use strict';
  var K = window.KerrQNM;
  if (!K) return;

  var SPEED = 8;            // animation time: M per second of wall clock
  var NX = 2048, NT = 512;  // samples in x (radial plot) and theta
  var NR = 2048;            // samples in display radius (3D texture)
  var CAP = 1e4;            // |psi| clip, relative to the hyperboloidal peak
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (id) { return document.getElementById(id); };
  var ui = { l: $('q-l'), m: $('q-m'), n: $('q-n'), a: $('q-a'), i: $('q-i') };
  var state = { l: 2, m: 2, n: 0, a: 0.7, iota: 60 * Math.PI / 180, az: -0.6,
                tau: 0, playing: !calm, damped: false, bl: false, mirror: false };
  var md = null, G = null, Gw = null, S = null, S1 = null, V = null, Gmax = 1, Smax = 1;

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
    // the hole itself: near-black on either paper
    col.hole = col.dark ? [0.05, 0.035, 0.03] : hex(col.ink);
  }
  readColours();
  new MutationObserver(function () { readColours(); dirty = true; })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ---- the solve --------------------------------------------------------

  function solve() {
    md = K.mode(-2, state.l, state.m, state.n, state.a);
    var xs = new Float64Array(NX), i;
    for (i = 0; i < NX; i++) xs[i] = i / (NX - 1);
    G = K.radialProfile(md, xs);
    var cs = new Float64Array(NT);
    for (i = 0; i < NT; i++) cs[i] = Math.cos(Math.PI * i / (NT - 1));
    S1 = K.spheroidal(-2, state.m, md.ang, cs);
    // + mirror: the mode (l, -m, -conj w) has S' = conj S(pi - theta) and
    // g' = conj g (tools/kerr/test.js, check 8), and an equatorially
    // symmetric source excites it so that psi(pi - theta) = conj psi(theta).
    // Then Re psi of the pair is Re[e^{-i w tau + i m phi} g (S(theta) + S(pi - theta))],
    // so for everything drawn from Re psi the mirror is a symmetrised S.
    S = { re: new Float64Array(NT), im: new Float64Array(NT) };
    for (i = 0; i < NT; i++) {
      S.re[i] = S1.re[i] + (state.mirror ? S1.re[NT - 1 - i] : 0);
      S.im[i] = S1.im[i] + (state.mirror ? S1.im[NT - 1 - i] : 0);
    }
    // phase so that g(horizon) is real: a choice of the origin of tau
    var g0 = [G.re[0], G.im[0]], u = K.c.div([Math.hypot(g0[0], g0[1]), 0], g0);
    for (i = 0; i < NX; i++) {
      var z = K.c.mul([G.re[i], G.im[i]], u); G.re[i] = z[0]; G.im[i] = z[1];
    }
    Gmax = 0; Smax = 0;
    for (i = 0; i < NX; i++) Gmax = Math.max(Gmax, Math.hypot(G.re[i], G.im[i]));
    for (i = 0; i < NT; i++) Smax = Math.max(Smax, Math.hypot(S.re[i], S.im[i]));
    var sf = sliceFactor(), rr = radii();
    // the radial plot, in the chosen slicing, and how fast its phase turns
    // per sample (g's own winding plus the slice's, the latter analytic)
    Gw = new Float32Array(NX);
    for (i = 0; i < NX; i++) {
      var r1 = rr.r(xs[i]), f = clip(K.c.mul(sf(r1), [G.re[i], G.im[i]]));
      var drdx = (rr.rp - rr.rm) / Math.pow(Math.max(1 - xs[i], 1e-9), 2);
      Gw[i] = sf.rate(r1) * drdx / (NX - 1);
      G.re[i] = f[0]; G.im[i] = f[1];
    }
    // the 3D texture, uniform in display radius rho = r/(r + RL);
    // channel b: radians of phase per unit rho, so the shader can fade out
    // the winding at both ends of a t = const slice that it cannot resolve
    var rH = rr.rp / (rr.rp + RL), xr = new Float64Array(NR), rs = new Float64Array(NR);
    for (i = 0; i < NR; i++) {
      var rho = rH + (1 - rH) * i / (NR - 1);
      rs[i] = i === NR - 1 ? 1e7 : Math.max(RL * rho / (1 - rho), rr.rp * (1 + 1e-7));
      xr[i] = (rs[i] - rr.rp) / (rs[i] - rr.rm);
    }
    var gr = K.radialProfile(md, xr);
    V = new Float32Array(4 * NR);
    for (i = 0; i < NR; i++) {
      var z2 = clip(K.c.mul(sf(rs[i]), K.c.mul([gr.re[i], gr.im[i]], u)));
      V[4 * i] = z2[0] / Gmax; V[4 * i + 1] = z2[1] / Gmax;   // half floats: keep it O(1)
      V[4 * i + 2] = Math.min(sf.rate(rs[i]) * (rs[i] + RL) * (rs[i] + RL) / RL, 6e4);
    }
    vol.upload(); sph.upload();
    readout();
    planeDirty = true;
  }

  // x = (r - r+)/(r - r-) and back
  function radii() {
    var root = Math.sqrt(1 - state.a * state.a), rp = 1 + root, rm = 1 - root;
    return { root: root, rp: rp, rm: rm,
             r: function (x) { x = Math.min(Math.max(x, 1e-9), 1 - 1e-9); return (rp - x * rm) / (1 - x); } };
  }

  // Hyperboloidal: 1. Boyer-Lindquist t = const: psi picks up
  //   e^{i omega h(r) + i m r#},  h = r - (r+/k) ln(r - r+) + (r+/k + 2) ln(r - r-),
  //   r# = a/(2k) ln x,  k = sqrt(1 - a^2),
  // which is Leaver's prefactor without its power laws (r-r+)^-s (r-r-)^-1-s:
  // the change (t, phi) -> (tau, phi~) = (t - h, phi + r#). h runs like r* at
  // infinity and like -r* at the horizon, so the factor grows at both ends.
  // Constant of h: its minimum, so the factor is 1 where the slices touch.
  function sliceFactor() {
    if (!state.bl) {
      var one = function () { return [1, 0]; };
      one.rate = function () { return 0; };
      return one;
    }
    var rr = radii(), k = rr.root, a = state.a, w = md.omega, m = state.m;
    var h = function (r) { return r - rr.rp / k * Math.log(r - rr.rp) + (rr.rp / k + 2) * Math.log(r - rr.rm); };
    var hmin = Infinity;
    for (var e = -6; e <= 4; e += 0.01) hmin = Math.min(hmin, h(rr.rp + Math.pow(10, e)));
    var f = function (r) {
      var dh = h(r) - hmin, rs = a / (2 * k) * Math.log((r - rr.rp) / (r - rr.rm));
      return K.c.exp([-w[1] * dh, w[0] * dh + m * rs]);
    };
    // |d(phase)/dr| = |w_R h' + m r#'|
    f.rate = function (r) {
      var dh = 1 - rr.rp / k / (r - rr.rp) + (rr.rp / k + 2) / (r - rr.rm);
      var dr = a / (2 * k) * (1 / (r - rr.rp) - 1 / (r - rr.rm));
      return Math.abs(w[0] * dh + m * dr);
    };
    return f;
  }
  function clip(z) {
    var n = Math.hypot(z[0], z[1]);
    return n > CAP * Gmax ? [z[0] * CAP * Gmax / n, z[1] * CAP * Gmax / n] : z;
  }

  function fmt(x, d) { return (x < 0 ? '−' : '') + Math.abs(x).toFixed(d); }
  function readout() {
    var w = md.omega, A = md.A;
    var sgn = function (x) { return x < 0 ? ' − ' : ' + '; };
    $('q-readout').innerHTML =
      '<dt>Mω</dt><dd>' + fmt(w[0], 5) + sgn(w[1]) + Math.abs(w[1]).toFixed(5) + '<i>i</i></dd>' +
      '<dt>A</dt><dd>' + fmt(A[0], 4) + sgn(A[1]) + Math.abs(A[1]).toFixed(4) + '<i>i</i></dd>' +
      '<dt>period</dt><dd>' + (2 * Math.PI / w[0]).toFixed(2) + ' M</dd>' +
      '<dt>e-folding</dt><dd>' + (1 / Math.abs(w[1])).toFixed(2) + ' M</dd>' +
      '<dt>Q</dt><dd>' + (w[0] / (2 * Math.abs(w[1]))).toFixed(2) + '</dd>';
  }

  // ---- WebGL: shared plumbing -------------------------------------------

  var VS = '#version 300 es\nout vec2 vUv;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);vUv=p;gl_Position=vec4(p*2.-1.,0.,1.);}';

  var COMMON = [
    '#version 300 es', 'precision highp float;',
    'in vec2 vUv; out vec4 o;',
    'uniform sampler2D uG, uS;',
    'uniform vec2 uW; uniform float uM, uTau, uAmp, uAspect;',
    'uniform mat3 uRot;',
    'uniform vec3 uPos, uNeg, uBg, uHole, uInk;',
    'const float PI = 3.14159265;',
    'vec2 Sof(vec3 p){ float th = acos(clamp(p.z/length(p),-1.,1.)); return texture(uS, vec2(th/PI*(1.-1./512.)+.5/512., .5)).rg; }',
    'vec4 Gof(float u){ return texture(uG, vec2(u*(1.-1./2048.)+.5/2048., .5)); }',
    'float phase(vec3 p){ return uM*atan(p.y,p.x) - uW.x*uTau; }',
    'vec2 cmul(vec2 a, vec2 b){ return vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x); }',
    // orthographic camera looking at the origin
    'void ray(out vec3 ro, out vec3 rd){ vec2 q=(vUv*2.-1.)*vec2(uAspect,1.)*1.06; ro=uRot*vec3(q,3.); rd=-uRot[2]; }'
  ].join('\n');

  // Display radius rho = r/(r + RL): the horizon sits at r+/(r+ + RL), so it
  // shrinks as the hole spins up, and null infinity is the unit sphere.
  // Two translucent isosurfaces, Re psi = +-ISO of the peak, over a faint glow.
  var RL = 4, ISO = 0.3;
  var VOL_FS = COMMON + [
    '',
    'uniform vec2 uRpm; uniform float uRL, uIso, uPx, uBL; uniform int uN;',
    'float rH;',
    'vec4 radial(vec3 p){ return Gof(clamp((length(p)-rH)/(1.-rH),0.,1.)); }',
    'float field(vec3 p){ vec2 z=cmul(radial(p).rg,Sof(p)); float ph=phase(p); return uAmp*(z.x*cos(ph)-z.y*sin(ph)); }',
    'vec3 grad(vec3 p){ vec2 e=vec2(.004,0.);',
    '  return vec3(field(p+e.xyy)-field(p-e.xyy), field(p+e.yxy)-field(p-e.yxy), field(p+e.yyx)-field(p-e.yyx)); }',
    'void main(){',
    '  vec3 ro, rd; ray(ro, rd);',
    '  float b=dot(ro,rd), h=b*b-dot(ro,ro)+1.;',
    '  float d=sqrt(max(dot(ro,ro)-b*b,0.));',
    '  float edge=.45*(1.-smoothstep(0.,1.2*uPx,abs(d-1.)));',
    '  if(h<0.){ o=vec4(edge*uInk,edge); return; }',
    '  h=sqrt(h); float t0=-b-h, t1=-b+h;',
    '  rH=uRpm.x/(uRpm.x+uRL);',
    '  float hh=b*b-dot(ro,ro)+rH*rH; bool hit=hh>0.; float tE= hit ? -b-sqrt(hh) : t1;',
    // t = const: the equatorial plane as a disc, coloured by tanh(Re psi) in
    // units of the hyperboloidal peak, so the growth shows as saturation
    '  if(uBL>.5){',
    '    vec3 c=vec3(0.); float a=0.;',
    '    float tp= abs(rd.z)>1e-4 ? -ro.z/rd.z : 1e9; vec3 q=ro+rd*tp; float rq=length(q);',
    '    bool disc= tp>t0 && rq<1. && rq>rH && !(hit && tE<tp);',
    '    if(disc){',
    '      vec4 R=radial(q); vec2 z=cmul(R.rg,Sof(q)); float ph=phase(q);',
    '      float v=uAmp*(z.x*cos(ph)-z.y*sin(ph));',
    // one pixel on screen covers 1/|cos| of the disc: fade what it cannot resolve
    '      float res=1.-smoothstep(.8,1.6,R.b*uPx/max(abs(rd.z),.1));',
    '      float s=tanh(abs(v));',
    '      c=mix(uBg, v>0.?uPos:uNeg, s*res); a=.94; c*=a; }',
    '    if(hit){ vec3 p=ro+rd*tE; vec3 nrm=normalize(p);',
    '      float rim=pow(1.-max(dot(nrm,-rd),0.),3.);',
    '      c+=(1.-a)*mix(uHole, uInk, .25*rim); a=1.; }',
    '    c+=(1.-a)*edge*uInk; a+=(1.-a)*edge;',
    '    o=vec4(c,a); return; }',
    '  float dt=(tE-t0)/float(uN);',
    '  vec3 c=vec3(0.); float a=0.;',
    '  float vp=field(ro+rd*t0);',
    '  for(int i=1;i<=400;i++){',
    '    if(i>uN) break;',
    '    float t=t0+float(i)*dt; vec3 p=ro+rd*t; float v=field(p);',
    // fade what a ray step cannot resolve: > ~1 radian of phase per step
    '    float res=1.-smoothstep(.7,1.4,radial(p).b*dt);',
    '    float al=res*(1.-exp(-1.2*min(v*v,2.)*dt));',
    '    c+=(1.-a)*al*(v>0.?uPos:uNeg); a+=(1.-a)*al;',
    '    for(int k=0;k<2;k++){',
    '      float lv= k==0 ? uIso : -uIso;',
    '      if((vp-lv)*(v-lv)<0.){',
    '        float f=(vp-lv)/(vp-v); vec3 q=p-rd*dt*(1.-f);',
    '        vec3 nrm=normalize(grad(q)); if(dot(nrm,rd)>0.) nrm=-nrm;',
    '        float dif=.55+.45*max(dot(nrm,normalize(-rd+vec3(.3,.5,0.))),0.);',
    '        float rim=pow(1.-abs(dot(nrm,rd)),2.);',
    '        vec3 sc=(k==0?uPos:uNeg)*dif+.25*rim*uInk;',
    '        float sa=res*(.55+.3*rim);',
    '        c+=(1.-a)*sa*sc; a+=(1.-a)*sa; } }',
    '    vp=v;',
    '    if(a>.985) break; }',
    '  if(hit){ vec3 p=ro+rd*tE; vec3 nrm=normalize(p);',
    '    float rim=pow(1.-max(dot(nrm,-rd),0.),3.);',
    '    c+=(1.-a)*mix(uHole, uInk, .25*rim); a=1.; }',
    // null infinity: a hairline at the silhouette of the unit sphere
    '  c+=(1.-a)*edge*uInk; a+=(1.-a)*edge;',
    '  o=vec4(c,a); }'
  ].join('\n');

  var SPH_FS = COMMON + [
    '',
    'void main(){',
    '  vec3 ro, rd; ray(ro, rd);',
    '  float b=dot(ro,rd), h=b*b-dot(ro,ro)+1.;',
    '  if(h<0.){ o=vec4(0.); return; }',
    '  vec3 p=ro+rd*(-b-sqrt(h)); vec3 nrm=p;',
    '  vec2 z=Sof(p); float ph=phase(p); float v=uAmp*(z.x*cos(ph)-z.y*sin(ph));',
    '  vec3 c=mix(uBg, v>0.?uPos:uNeg, pow(min(abs(v),1.),.8));',
    '  float lam=.78+.22*dot(nrm,-rd); c*=lam;',
    // graticule: equator and the poles of the spin axis
    '  float th=acos(clamp(p.z,-1.,1.)); float w=fwidth(th);',
    '  float eq=1.-smoothstep(0.,1.5*w,abs(th-PI/2.));',
    '  float pole=1.-smoothstep(.035,.05,min(th,PI-th));',
    '  c=mix(c,uInk,.35*eq+.6*pole);',
    '  float aa=smoothstep(0.,.02,h);',
    '  o=vec4(c*aa,aa); }'
  ].join('\n');

  function glView(canvas, fs) {
    var gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false });
    if (!gl) {
      canvas.insertAdjacentHTML('afterend', '<p class="qnm-nogl">This view needs WebGL2.</p>');
      return { upload: function () {}, draw: function () {} };
    }
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr);
    gl.useProgram(pr);
    gl.bindVertexArray(gl.createVertexArray());
    var U = {};
    ['uG', 'uS', 'uW', 'uM', 'uTau', 'uAmp', 'uAspect', 'uRot', 'uPos', 'uNeg', 'uBg', 'uHole', 'uInk', 'uRpm', 'uRL', 'uIso', 'uPx', 'uN', 'uBL']
      .forEach(function (k) { U[k] = gl.getUniformLocation(pr, k); });
    function tex(unit) {
      var t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }
    var tG = tex(0), tS = tex(1);
    gl.uniform1i(U.uG, 0); gl.uniform1i(U.uS, 1);
    function put(unit, t, re, im, n) {
      var d = new Float32Array(2 * n);
      for (var i = 0; i < n; i++) { d[2 * i] = re[i]; d[2 * i + 1] = im[i]; }
      gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, n, 1, 0, gl.RG, gl.FLOAT, d);
    }
    function put4(unit, t, d, n) {
      gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, n, 1, 0, gl.RGBA, gl.FLOAT, d);
    }
    return {
      upload: function (sphereOnly) {
        if (fs === VOL_FS) put4(0, tG, V, NR);
        put(1, tS, S.re, S.im, NT);
      },
      draw: function (amp) {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        gl.viewport(0, 0, w, h);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(U.uW, md.omega[0], md.omega[1]);
        gl.uniform1f(U.uM, state.m);
        gl.uniform1f(U.uTau, state.tau);
        gl.uniform1f(U.uAmp, amp);
        gl.uniform1f(U.uAspect, w / h);
        gl.uniformMatrix3fv(U.uRot, false, camera());
        gl.uniform3fv(U.uPos, hex(col.accent));
        gl.uniform3fv(U.uNeg, hex(col['accent-2']));
        gl.uniform3fv(U.uBg, hex(col.panel));
        gl.uniform3fv(U.uHole, col.hole);
        gl.uniform3fv(U.uInk, hex(col.ink));
        var root = Math.sqrt(1 - state.a * state.a);
        gl.uniform2f(U.uRpm, 1 + root, 1 - root);
        gl.uniform1f(U.uRL, RL);
        gl.uniform1f(U.uPx, 2 * 1.06 / h);
        gl.uniform1i(U.uN, state.bl ? 360 : 180);
        gl.uniform1f(U.uBL, state.bl ? 1 : 0);
        gl.uniform1f(U.uIso, ISO);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };
  }

  // camera looking in from polar angle iota (from the spin axis), azimuth az;
  // columns: screen right, screen up, towards the viewer
  function camera() {
    var si = Math.sin(state.iota), ci = Math.cos(state.iota);
    var back = [si * Math.cos(state.az), si * Math.sin(state.az), ci];
    var right = [-Math.sin(state.az), Math.cos(state.az), 0];
    var up = [back[1] * right[2] - back[2] * right[1], back[2] * right[0] - back[0] * right[2], back[0] * right[1] - back[1] * right[0]];
    return new Float32Array(right.concat(up, back));
  }

  var vol = glView($('q-vol'), VOL_FS);
  var sph = glView($('q-sph'), SPH_FS);

  // ---- 2D canvases -------------------------------------------------------

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

  function damping() { return state.damped ? Math.exp(md.omega[1] * state.tau) : 1; }

  // radial profile: Re[g e^{-i omega tau}] with its envelope, x from 0 to 1
  function drawRadial() {
    var k = ctx2d($('q-rad')), c = k.c, w = k.w, h = k.h;
    var L = 14, R = w - 14, T = 26, B = h - 26, mid = (T + B) / 2, amp = (B - T) / 2 * 0.92;
    var X = function (x) { return L + (R - L) * x; };
    var root = Math.sqrt(1 - state.a * state.a), rp = 1 + root, rm = 1 - root;
    c.strokeStyle = col.hair; c.lineWidth = 1;
    c.beginPath(); c.moveTo(L, mid); c.lineTo(R, mid); c.stroke();
    // r ticks along the top
    c.fillStyle = col.muted; c.textAlign = 'center';
    var lastX = -1e9;
    [3, 4, 6, 10, 25].forEach(function (r) {
      var x = X((r - rp) / (r - rm));
      if (r <= rp || x - lastX < 34) return;
      lastX = x;
      c.beginPath(); c.moveTo(x, T - 6); c.lineTo(x, T - 1); c.stroke();
      c.fillText((r === 3 ? 'r = ' : '') + r + 'M', x, T - 10);
    });
    c.textAlign = 'left'; c.fillText('horizon', L, B + 18);
    c.textAlign = 'right'; c.fillText('null infinity', R, B + 18);
    var d = damping(), ph = [Math.cos(md.omega[0] * state.tau), -Math.sin(md.omega[0] * state.tau)];
    // On a t = const slice the mode grows without bound at both ends, so
    // the axis is asinh-compressed there; and where the phase winds faster
    // than the canvas can draw (> ~1 radian per pixel) the curve fades out.
    var n = NX, sy = function (v) { return v; }, i, x, al = new Float32Array(n);
    var perPx = (n - 1) / (R - L), top = 1;
    for (i = 0; i < n; i++) {
      al[i] = 1 - Math.min(Math.max((Gw[i] * perPx - 0.7) / 0.7, 0), 1);
      if (al[i] > 0) top = Math.max(top, d * Math.hypot(G.re[i], G.im[i]) / Gmax);
    }
    if (state.bl) {
      var s0 = Math.asinh(top);
      sy = function (v) { return Math.asinh(v) / s0; };
      c.fillStyle = col.muted; c.textAlign = 'left';
      c.fillText('asinh scale', L, T - 10);
    }
    // drawn in runs of equal (quantised) opacity, so dashes and joins survive
    function curve(val, style, lw, dash, alpha) {
      c.strokeStyle = style; c.lineWidth = lw; c.setLineDash(dash);
      var run = -1;
      for (i = 0; i < n; i++) {
        var b = Math.round(al[i] * 4);
        if (b !== run) {
          if (run > 0) { c.lineTo(X(i / (n - 1)), mid - amp * sy(val(i))); c.stroke(); }
          run = b;
          if (b > 0) { c.globalAlpha = alpha * b / 4; c.beginPath(); c.moveTo(X(i / (n - 1)), mid - amp * sy(val(i))); }
        } else if (b > 0) c.lineTo(X(i / (n - 1)), mid - amp * sy(val(i)));
      }
      if (run > 0) c.stroke();
      c.setLineDash([]); c.globalAlpha = 1;
    }
    var env = function (k) { return d * Math.hypot(G.re[k], G.im[k]) / Gmax; };
    curve(env, col.muted, 1, [2, 3], 0.5);
    curve(function (k) { return -env(k); }, col.muted, 1, [2, 3], 0.5);
    curve(function (k) { return (G.re[k] * ph[0] - G.im[k] * ph[1]) / Gmax * d; }, col.accent, 1.8, [], 1);
  }

  // waveform at the viewing angle: h+ - i hx  ~  S(iota) e^{i m az} e^{-i omega t}
  function drawWave() {
    var k = ctx2d($('q-wave')), c = k.c, w = k.w, h = k.h;
    var L = 8, R = w - 8, mid = h / 2, amp = h / 2 * 0.85;
    var th = state.iota, j = Math.round(th / Math.PI * (NT - 1));
    var phi = state.az + Math.PI;   // observer's azimuth
    var z = K.c.mul([S1.re[j], S1.im[j]], [Math.cos(state.m * phi), Math.sin(state.m * phi)]);
    // the mirror rings at -conj w: it adds conj S(pi - iota) e^{-i m phi} e^{+i w_R t}
    var zm = state.mirror ? K.c.mul([S1.re[NT - 1 - j], -S1.im[NT - 1 - j]], [Math.cos(state.m * phi), -Math.sin(state.m * phi)]) : [0, 0];
    var tmax = Math.min(Math.max(6 / Math.abs(md.omega[1]), 10), 120);   // six e-folds
    c.strokeStyle = col.hair; c.lineWidth = 1;
    c.beginPath(); c.moveTo(L, mid); c.lineTo(R, mid); c.stroke();
    [['accent', 0, 1.6], ['accent-2', 1, 1.1]].forEach(function (spec) {
      c.strokeStyle = col[spec[0]]; c.lineWidth = spec[2];
      c.beginPath();
      for (var i = 0; i <= 300; i++) {
        var t = tmax * i / 300, e = Math.exp(md.omega[1] * t);
        var cw = Math.cos(md.omega[0] * t), sw = -Math.sin(md.omega[0] * t);
        var re = (z[0] * cw - z[1] * sw + zm[0] * cw + zm[1] * sw) * e;
        var im = (z[0] * sw + z[1] * cw + zm[1] * cw - zm[0] * sw) * e;
        var y = mid - amp * (spec[1] ? -im : re) / Smax;
        var x = L + (R - L) * i / 300;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
    });
    // where the animation clock is, when ringing
    if (state.damped) {
      var tx = L + (R - L) * Math.min(state.tau / tmax, 1);
      c.strokeStyle = col.muted; c.globalAlpha = 0.6;
      c.beginPath(); c.moveTo(tx, 4); c.lineTo(tx, h - 4); c.stroke();
      c.globalAlpha = 1;
    }
    c.fillStyle = col.muted; c.textAlign = 'right';
    c.fillText(Math.round(tmax) + 'M', R, h - 4);
  }

  // complex frequency plane: Re omega across, damping down
  var planeDirty = true, siblings = {}, sibQueue = [], sibBusy = false;
  function queueSiblings() {
    sibQueue = [];
    for (var m = -state.l; m <= state.l; m++) {
      if (!siblings[[state.l, m, state.n].join(',')]) sibQueue.push([state.l, m, state.n]);
    }
    if (!sibBusy) idleSibling();
  }
  // one sequence per tick, so the animation keeps breathing
  function idleSibling() {
    sibBusy = sibQueue.length > 0;
    if (!sibBusy) return;
    setTimeout(function () {
      var q = sibQueue.shift();
      if (q) {
        siblings[q.join(',')] = K.sequence(-2, q[0], q[1], q[2], 0.99);
        planeDirty = true;
      }
      idleSibling();
    }, 30);
  }
  function nice(d) {
    var e = Math.pow(10, Math.floor(Math.log10(d))), f = d / e;
    return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * e;
  }
  function drawPlane() {
    var k = ctx2d($('q-om')), c = k.c, w = k.w, h = k.h;
    var L = 44, R = w - 18, T = 10, B = h - 34;
    // bounds from every sequence we have, padded, on a round grid
    var x0 = md.omega[0], x1 = x0, y0 = -md.omega[1], y1 = y0, m, sq;
    for (m = -state.l; m <= state.l; m++) {
      sq = siblings[[state.l, m, state.n].join(',')];
      if (sq) sq.forEach(function (p) {
        x0 = Math.min(x0, p.omega[0]); x1 = Math.max(x1, p.omega[0]);
        y0 = Math.min(y0, -p.omega[1]); y1 = Math.max(y1, -p.omega[1]);
      });
    }
    var dx = nice((x1 - x0) / 4), dy = nice((y1 - y0) / 3);
    x0 = Math.floor(x0 / dx - 0.3) * dx; x1 = Math.ceil(x1 / dx + 0.3) * dx;
    y0 = Math.max(0, Math.floor(y0 / dy - 0.3) * dy); y1 = Math.ceil(y1 / dy + 0.3) * dy;
    var X = function (v) { return L + (R - L) * (v - x0) / (x1 - x0); };
    var Y = function (v) { return T + (B - T) * (-v - y0) / (y1 - y0); };
    c.strokeStyle = col.hair; c.lineWidth = 1;
    c.strokeRect(L, T, R - L, B - T);
    c.fillStyle = col.muted; c.textAlign = 'center';
    var dec = function (d) { return Math.max(0, -Math.floor(Math.log10(d) + 1e-9)); }, v;
    for (v = x0; v <= x1 + 1e-9; v += dx) c.fillText(v.toFixed(dec(dx)), X(v), B + 15);
    c.fillText('Re Mω', (L + R) / 2, B + 30);
    c.textAlign = 'right';
    for (v = y0; v <= y1 + 1e-9; v += dy) c.fillText((v ? '−' : '') + v.toFixed(dec(dy)), L - 5, Y(-v) + 4);
    c.save(); c.translate(11, (T + B) / 2); c.rotate(-Math.PI / 2); c.textAlign = 'center';
    c.fillText('Im Mω', 0, 0); c.restore();
    c.save(); c.beginPath(); c.rect(L, T, R - L, B - T); c.clip();
    function path(seq, style, lw, alpha) {
      c.strokeStyle = style; c.lineWidth = lw; c.globalAlpha = alpha;
      c.beginPath();
      seq.forEach(function (p, i) { i ? c.lineTo(X(p.omega[0]), Y(p.omega[1])) : c.moveTo(X(p.omega[0]), Y(p.omega[1])); });
      c.stroke(); c.globalAlpha = 1;
    }
    for (m = -state.l; m <= state.l; m++) {
      sq = siblings[[state.l, m, state.n].join(',')];
      if (!sq || m === state.m) continue;
      path(sq, col.muted, 1, 0.8);
      var e = sq[sq.length - 1].omega;
      c.fillStyle = col.muted; c.textAlign = 'left';
      c.fillText((m < 0 ? '−' : '') + Math.abs(m), X(e[0]) + 4, Y(e[1]) + 4);
    }
    var mine = siblings[[state.l, state.m, state.n].join(',')];
    if (mine) path(mine, col.accent, 1.6, 0.9);
    // Schwarzschild point, and where we are
    var s0 = mine ? mine[0].omega : md.omega;
    c.strokeStyle = col.ink; c.lineWidth = 1;
    c.beginPath(); c.arc(X(s0[0]), Y(s0[1]), 4, 0, 2 * Math.PI); c.stroke();
    c.fillStyle = col.accent;
    c.beginPath(); c.arc(X(md.omega[0]), Y(md.omega[1]), 4.5, 0, 2 * Math.PI); c.fill();
    c.restore();
  }

  // ---- controls -----------------------------------------------------------

  function syncM() {
    var l = +ui.l.value;
    ui.m.min = -l; ui.m.max = l;
    if (+ui.m.value > l) ui.m.value = l;
    if (+ui.m.value < -l) ui.m.value = -l;
  }
  var pending = true, dirty = true;
  function onInput() {
    syncM();
    var l = +ui.l.value, m = +ui.m.value, n = +ui.n.value;
    if (l !== state.l || n !== state.n) { state.l = l; state.n = n; state.m = m; queueSiblings(); }
    state.m = m; state.a = +ui.a.value;
    state.iota = +ui.i.value * Math.PI / 180;
    $('q-l-out').textContent = l;
    $('q-m-out').textContent = (m < 0 ? '−' : '') + Math.abs(m);
    $('q-n-out').textContent = n;
    $('q-a-out').textContent = state.a.toFixed(3);
    $('q-i-out').textContent = ui.i.value + '°';
    pending = true;
  }
  Object.keys(ui).forEach(function (k) { ui[k].addEventListener('input', onInput); });

  // the hyperboloidal captions are whatever kerr.html says, so editing them
  // there is enough; only the t = const ones live here
  var CAPS = {
    hyp: $('q-rad-cap').textContent.trim(),
    bl: 'The same mode at constant Boyer\u2013Lindquist time: it grows towards both ends, and its phase winds into outgoing waves.',
    vol: $('q-vol-cap').textContent.trim(),
    volBl: 'Re \u03c8 in the equatorial plane at constant t, saturating as it grows: the spiral arms are outgoing wavefronts. Drag to turn.'
  };

  // Each switch shows both of its options, with the live one bracketed.
  // What to do after the flag changes:
  var onFlag = {
    playing: function () {},
    damped: function () { state.tau = 0; dirty = true; },
    bl: function () { pending = true; },
    mirror: function () { pending = true; }
  };
  var switches = [].slice.call(document.querySelectorAll('.qnm-switch button'));
  switches.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.flag, v = b.dataset.on === '1';
      if (state[f] === v) return;
      state[f] = v;
      onFlag[f]();
      labels();
    });
  });
  function labels() {
    switches.forEach(function (b) {
      var on = state[b.dataset.flag] === (b.dataset.on === '1');
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    $('q-rad-cap').textContent = state.bl ? CAPS.bl : CAPS.hyp;
    $('q-vol-cap').textContent = state.bl ? CAPS.volBl : CAPS.vol;
  }
  labels();

  // drag on either sphere to turn the view
  [$('q-vol'), $('q-sph')].forEach(function (cv) {
    var drag = null;
    cv.addEventListener('pointerdown', function (e) { drag = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var s = 3 / Math.max(cv.clientWidth, 1);
      state.az -= (e.clientX - drag[0]) * s;
      state.iota = Math.min(Math.PI, Math.max(0, state.iota - (e.clientY - drag[1]) * s));
      drag = [e.clientX, e.clientY];
      ui.i.value = Math.round(state.iota * 180 / Math.PI);
      $('q-i-out').textContent = ui.i.value + '°';
      dirty = true;
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { drag = null; }); });
  });

  // ---- loop ---------------------------------------------------------------

  var last = performance.now();
  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (pending) { pending = false; solve(); dirty = true; }
    if (state.playing) {
      state.tau += SPEED * dt;
      // when ringing, strike again once the mode has decayed by e^-4
      if (state.damped && state.tau * Math.abs(md.omega[1]) > 4) state.tau = 0;
      dirty = true;
    }
    if (dirty && md) {
      var d = damping();
      // on the t = const disc: in units of the hyperboloidal peak on the equator
      var jEq = (NT - 1) >> 1, sEq = Math.max(Math.hypot(S.re[jEq], S.im[jEq]), 0.05 * Smax);
      vol.draw(d / (state.bl ? sEq : Smax));
      sph.draw(d / Smax);
      drawRadial();
      drawWave();
      dirty = false;
    }
    if (planeDirty && md) { drawPlane(); planeDirty = false; }
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize', function () { dirty = true; planeDirty = true; });

  syncM();
  onInput();
  queueSiblings();
  requestAnimationFrame(frame);
})();
