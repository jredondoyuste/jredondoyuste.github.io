document.querySelectorAll('.map-pin').forEach(pin => {
  pin.addEventListener('mouseenter', function(e) {
    const tooltip = document.getElementById('friend-tooltip');
    tooltip.textContent = pin.dataset.name;
    tooltip.style.display = 'block';
    tooltip.style.left = (e.pageX - e.target.ownerSVGElement.getBoundingClientRect().left - 30) + 'px';
    tooltip.style.top = (e.pageY - e.target.ownerSVGElement.getBoundingClientRect().top - 40) + 'px';
  });
  pin.addEventListener('mouseleave', function() {
    document.getElementById('friend-tooltip').style.display = 'none';
  });
  pin.addEventListener('click', function() {
    if (pin.dataset.url) window.open(pin.dataset.url, '_blank');
  });
});