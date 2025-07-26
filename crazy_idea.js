const lines = [
  "Can we emit, and then trap gravitational waves in the lab?",
  "Can we form a black hole by focusing gravitational waves? Or by focusing light?",
  "Are near-extremal black holes really stable?",
  "Is there a wave turbulence description for gravitational waves?",
  "Do gravitational waves get tired after a long journey?",
  "Is it possible to prove the existence of horizons?",
  "How fast can an accreting black hole spin? Is it just 0.9998?",
  "Can we infer the progenitor properties from ringdown dominated signals?",
  "Do QNM frequencies get thickened by non-linear effects?",
  "When, and where, is each overtone excited?",
  "Is Kerr-AdS stable, or does it form some turbulent structure? What does this mean from the CFT?",
  "How much does a disk brighten when gravitational waves pass through?",
  "Can viscosity help make stars more compact?",
  "Can waves be reflected by a thin viscous bubble?",
  "Does the graviton-graviton scattering amplitude on a black hole background know about QNMs?",
  "Are quadratic qnms ever resonant? In any dimension, in any topology?",
  "Can we use measure superradiance from GW lensing by supermassive black holes?",
  "Does asymptotically flat gravity have a fluid dual?",
  "What is the physical significance of higher order norms?",
  "How smooth is spacetime?"
];

function getRandomLine() {
  const randomIndex = Math.floor(Math.random() * lines.length);
  return lines[randomIndex];
}

function updateLine() {
  const paragraph = document.getElementById("random-line");
  paragraph.style.opacity = 0;

  setTimeout(() => {
    paragraph.textContent = getRandomLine();
    paragraph.style.opacity = 1;
  }, 500); // matches the CSS transition duration
}

window.onload = updateLine;
