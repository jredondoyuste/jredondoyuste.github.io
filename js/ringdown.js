function drawWigglyLine() {
  const svg = document.querySelector('.ringdown');
  const header = document.querySelector('.header');
  const width = svg.clientWidth;
  const height = svg.clientHeight;
  if (!width || !height) {
    setTimeout(drawWigglyLine, 50);
    return;
  }

  const f = parseFloat(getComputedStyle(header).getPropertyValue('--f'));
  const t = parseFloat(getComputedStyle(header).getPropertyValue('--t'));
  if (isNaN(f)) f = 30;
  if (isNaN(t)) t = 0.35;

  let path = '';
  const steps = 600;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = Math.cos(f * (x / width) * 2 * Math.PI) * Math.exp(-x / (width * t));
    const yPos = height / 2 - (y * (height / 2)); 
    path += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + yPos.toFixed(2) + ' ';
  }

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.innerHTML = `<path d="${path}" stroke="#6E6E73" fill="none" stroke-width="1"/>`;
}

window.addEventListener('resize', drawWigglyLine);
window.addEventListener('load', drawWigglyLine);
