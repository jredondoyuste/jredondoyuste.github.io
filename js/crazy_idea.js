// Questions that keep me up at night.
//
// Open the section and the questions surface on their own, one every few
// seconds, scattered across the panel. Bring the cursor near one and it
// pops (a tap does the same on touch screens), leaving room for the next.
// Add or edit questions in the array below — nothing else needs changing.

const lines = [
  "Can we emit, and then trap gravitational waves in the lab?",
  "Can we form a black hole by focusing gravitational waves? Or by focusing light?",
  "Are near-extremal black holes stable?",
  "Is there a wave turbulence description for gravitational waves?",
  "Do gravitational waves get tired after a long journey?",
  "Is it possible to prove the existence of horizons?",
  "How fast can an accreting black hole spin? Is it 0.9998?",
  "Can we infer the progenitor properties from ringdown dominated signals?",
  "Do QNM frequencies shift by non-linear effects?",
  "When, and where, is each overtone excited?",
  "Is Kerr-AdS stable, or does it form some turbulent structure? What does this mean from the dual point of view?",
  "How much does a disk brighten when gravitational waves pass through?",
  "Can waves be reflected by a thin viscous bubble?",
  "Does the gravitational Compton amplitude know about QNMs?",
  "Are QNMs ever resonant?",
  "Can we use measure superradiance from GW lensing by supermassive black holes?",
  "Does asymptotically flat gravity have a fluid dual?",
  "How smooth is spacetime?",
  "Can we observe black hole evaporation in an experiment?",
  "Is there a maximum luminosity possible?",
  "Is the Hawking area theorem sharp?",
  "Why are BH mergers so good at generating entropy?",
  "Are there subsolar mass compact objects? What are they?",
  "How do BHs merge in dense environments?",
  "What is new about the 3-body problem in General Relativity?"
];

(function () {
  const SPAWN_MS = 3000;   
  const REFILL_MS = 2000;  
  const MAX_ON_SCREEN = 5;
  const POP_DIST = 26;     
  const NEAR_DIST = 80;    

  let deck = [];
  function nextQuestion() {
    if (!deck.length) {
      deck = lines.slice();
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }
    return deck.pop();
  }

  function gapToRect(x, y, r) {
    const dx = Math.max(r.x - x, x - (r.x + r.w), 0);
    const dy = Math.max(r.y - y, y - (r.y + r.h), 0);
    return Math.hypot(dx, dy);
  }

  function gapBetween(a, b) {
    const dx = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w), 0);
    const dy = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h), 0);
    return Math.hypot(dx, dy);
  }

  const started = new WeakSet(); // NOT a data attribute: those survive cloning

  // One field of questions. The research reveal is CLONED onto the stage on
  // wide screens, so a field can appear (and vanish) at any moment and its
  // listeners live on the node itself — they go when the node goes.
  function runField(field) {
    if (started.has(field)) return;
    started.add(field);
    // a stage copy is cloned markup: any bubbles in it are dead pixels
    field.querySelectorAll(".question-bubble, .question-ring").forEach(function (el) { el.remove(); });

    const host = field.closest("details");
    const bubbles = [];
    let timer = null;
    let live = false;      // the field is on screen and populated
    let pointer = null;    // last cursor position, in field coordinates

    function schedule(ms) {
      clearTimeout(timer);
      timer = setTimeout(tick, ms);
    }

    function tick() {
      if (!field.isConnected) return; // stage cleared: let it all go
      if (live && bubbles.length < MAX_ON_SCREEN) spawn();
      schedule(SPAWN_MS);
    }

    // where to put a bubble of this size: sample a few spots and keep the
    // one that sits furthest from the bubbles already up (and from the
    // cursor, so a question never appears right under it)
    function findSpot(w, h) {
      const fw = field.clientWidth, fh = field.clientHeight;
      if (w > fw || h > fh) return null;
      let best = null, bestGap = -1;
      for (let i = 0; i < 40; i++) {
        const spot = {
          x: Math.random() * (fw - w),
          y: Math.random() * (fh - h),
          w: w, h: h
        };
        let gap = Infinity;
        bubbles.forEach(function (b) { gap = Math.min(gap, gapBetween(spot, b)); });
        if (pointer) {
          gap = Math.min(gap, Math.max(0, gapToRect(pointer.x, pointer.y, spot) - 60));
        }
        if (gap > bestGap) { bestGap = gap; best = spot; }
      }
      return bestGap >= 8 ? best : null;
    }

    function spawn() {
      const fw = field.clientWidth;
      if (!fw || !field.clientHeight) return;

      const el = document.createElement("p");
      el.className = "question-bubble";
      el.textContent = nextQuestion();
      el.style.width = Math.round(Math.min(fw - 8, Math.max(170, fw * (0.58 + Math.random() * 0.34)))) + "px";
      el.style.visibility = "hidden";
      field.appendChild(el);

      const spot = findSpot(el.offsetWidth, el.offsetHeight);
      if (!spot) { el.remove(); return; }

      el.style.left = Math.round(spot.x) + "px";
      el.style.top = Math.round(spot.y) + "px";
      el.style.setProperty("--tilt", (Math.random() * 4 - 2).toFixed(2) + "deg");
      el.style.setProperty("--drift", (9 + Math.random() * 6).toFixed(1) + "s");
      el.style.setProperty("--drift-delay", (-Math.random() * 6).toFixed(1) + "s");
      el.style.visibility = "";
      void el.offsetWidth;          // settle the "small and invisible" state…
      el.classList.add("is-in");    // …so this fades and swells into place

      spot.el = el;
      bubbles.push(spot);
    }

    function pop(b) {
      const i = bubbles.indexOf(b);
      if (i < 0) return;
      bubbles.splice(i, 1);
      b.el.classList.remove("is-near");
      b.el.classList.add("is-pop");
      setTimeout(function () { b.el.remove(); }, 420);

      const ring = document.createElement("span");
      ring.className = "question-ring";
      ring.style.left = Math.round(b.x + b.w / 2) + "px";
      ring.style.top = Math.round(b.y + b.h / 2) + "px";
      ring.style.setProperty("--ring", Math.round(Math.max(b.w, b.h) * 0.55) + "px");
      field.appendChild(ring);
      setTimeout(function () { ring.remove(); }, 620);

      if (live) schedule(REFILL_MS);
    }

    function clearAll() {
      clearTimeout(timer);
      bubbles.splice(0).forEach(function (b) { b.el.remove(); });
      field.querySelectorAll(".question-ring").forEach(function (r) { r.remove(); });
    }

    // opening flourish: three questions in quick succession, then the
    // steady drip
    function open() {
      spawn();
      setTimeout(function () { if (live) spawn(); }, 700);
      setTimeout(function () { if (live) spawn(); }, 1600);
      schedule(SPAWN_MS);
    }

    // Is the field on screen? On narrow screens it waits inside a <details>
    // that the reader opens; on wide screens the stage hands us a fresh copy,
    // already visible, and this same check starts it as it is built.
    function check() {
      if (!field.isConnected) { // a discarded stage copy: stop holding on to it
        window.removeEventListener("resize", check);
        live = false;
        clearAll();
        return;
      }
      // a closed <details> still reports a size in some browsers, so ask it
      // directly; the stage copy has no <details> around it and is always on
      const on = (!host || host.open) &&
                 field.clientWidth > 0 && field.clientHeight > 0;
      if (on === live) return;
      live = on;
      if (on) open(); else clearAll();
    }

    if (host) host.addEventListener("toggle", check);
    window.addEventListener("resize", check);
    check();

    field.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return; // a tap pops instead, below
      const r = field.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      bubbles.slice().forEach(function (b) {
        const d = gapToRect(pointer.x, pointer.y, b);
        if (d < POP_DIST) pop(b);
        else b.el.classList.toggle("is-near", d < NEAR_DIST);
      });
    });

    field.addEventListener("pointerleave", function () {
      pointer = null;
      bubbles.forEach(function (b) { b.el.classList.remove("is-near"); });
    });

    field.addEventListener("click", function (e) {
      const el = e.target.closest(".question-bubble");
      if (!el) return;
      bubbles.slice().forEach(function (b) { if (b.el === el) pop(b); });
    });
  }

  function scan() {
    document.querySelectorAll(".question-field").forEach(runField);
  }

  document.addEventListener("DOMContentLoaded", function () {
    scan();
    // the stage builds its copy of the reveal after the fact
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  });
})();
