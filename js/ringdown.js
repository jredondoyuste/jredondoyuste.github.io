// Nav ringdown: h(t) ~ cos(2π f x) · exp(-x/τ).
// Clicking it perturbs the black hole — it rings up, then rings down again.
(function () {
  let clicks = 0;
  let lastClick = 0;
  let animating = false;
  // Current waveform parameters (start from the header's CSS vars).
  let cf = null;
  let ct = null;

  function readParams() {
    const header = document.querySelector('.header');
    if (!header) return { f: 30, t: 0.35 };
    let f = parseFloat(getComputedStyle(header).getPropertyValue('--f'));
    let t = parseFloat(getComputedStyle(header).getPropertyValue('--t'));
    if (isNaN(f)) f = 30;
    if (isNaN(t)) t = 0.35;
    return { f: f, t: t };
  }

  function drawPath(svg, f, t, amp) {
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    if (!width || !height) return false;
    let path = '';
    const steps = 600;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const y = amp * Math.cos(f * (x / width) * 2 * Math.PI) * Math.exp(-x / (width * t));
      // clamp so a perturbed waveform stays inside the svg
      const yc = Math.max(-1, Math.min(1, y));
      const yPos = height / 2 - yc * (height / 2 - 0.5);
      path += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + yPos.toFixed(2) + ' ';
    }
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.innerHTML = '<path d="' + path + '" stroke="currentColor" fill="none" stroke-width="1"/>';
    return true;
  }

  function drawWigglyLine() {
    const svg = document.querySelector('.ringdown');
    if (!svg) return;
    if (cf === null) {
      const p = readParams();
      cf = p.f;
      ct = p.t;
    }
    if (!drawPath(svg, cf, ct, 1)) {
      setTimeout(drawWigglyLine, 50);
    }
  }

  // Third quick click (each within 2.5s of the last) → the wiggle escapes.
  // The game script only loads at that moment; nobody else pays for it.
  function summon() {
    if (window.WiggleGame) { window.WiggleGame.start(); return; }
    const s = document.createElement('script');
    s.src = '/js/wigglegame.js';
    s.onload = function () { if (window.WiggleGame) window.WiggleGame.start(); };
    document.head.appendChild(s);
  }

  function perturb() {
    const now = performance.now();
    if (now - lastClick > 2500) clicks = 0;
    clicks += 1;
    lastClick = now;
    if (clicks >= 3) { clicks = 0; summon(); return; }
    if (animating) return;
    const svg = document.querySelector('.ringdown');
    if (!svg || !svg.clientWidth) return;
    animating = true;
    const f = 12 + Math.random() * 40;
    const t = 0.15 + Math.random() * 0.55;
    const start = performance.now();
    const dur = 1200;
    function frame(now) {
      const u = Math.min((now - start) / dur, 1);
      // sharp excitation, exponential relaxation back to amp = 1
      const amp = 1 + 2.2 * Math.min(u / 0.12, 1) * Math.exp(-Math.max(u - 0.12, 0) * 5);
      drawPath(svg, f, t, amp);
      if (u < 1) {
        requestAnimationFrame(frame);
      } else {
        cf = f;
        ct = t;
        animating = false;
        drawWigglyLine();
      }
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', drawWigglyLine);
  window.addEventListener('load', function () {
    drawWigglyLine();
    const svg = document.querySelector('.ringdown');
    if (svg) svg.addEventListener('click', perturb);
  });

  console.log(
    '%ch(t) ∼ e^{−t/τ} cos(ωt + φ) — hi, curious one. say hi back: jredondo@princeton.edu',
    'font-family: Georgia, serif; font-size: 13px; color: #1F5765;'
  );
})();
