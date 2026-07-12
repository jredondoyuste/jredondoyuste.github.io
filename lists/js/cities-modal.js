// Modal functionality for lists
const cityData = {
  "madrid": "The birthplace of many memories. A vibrant capital with endless tapas bars, world-class museums, and the energy of a city that never sleeps. Home to my childhood in Leganés and summer escapes to Monreal del Campo.",
  "manchester": "Where theatre met academia. A gritty, artistic city with a rich musical heritage and passionate people. Beautiful memories from 2019-20 with the Pantomime Society.",
  "copenhagen": "My adopted home during the PhD years. Cycling through Nørrebro, exploring hygge culture, and discovering hidden gems like Sinne Gas (pumpkin seed buns!) and Morgenstedet. A city that feels like home.",
  "barcelona": "Mediterranean charm and architectural wonders. Gaudí's masterpieces, the Gothic Quarter's winding streets, and beaches where the mountains meet the sea.",
  "berlin": "A city of history, creativity, and reinvention. World-class museums, vibrant nightlife, and an artistic spirit that permeates every corner.",
  "vienna": "Classical elegance meets imperial grandeur. Coffee houses, classical music, and Austro-Hungarian history at every turn.",
  "daejeon": "A modern South Korean city blending tradition and technology. Known for its science and technology focus, surrounded by natural beauty.",
  "seoul": "The pulsing heart of South Korea. Neon-lit nights, cutting-edge technology, delicious street food, and a chaotic energy unlike anywhere else.",
  "new york city": "The city that never sleeps. Towering skyscrapers, diverse neighborhoods, Broadway lights, and the feeling of infinite possibilities.",
  "boston": "Historic and academic. The cradle of American independence with a strong intellectual community and passionate sports fans.",
  "baltimore": "A city of resilience and culture. Inner Harbor beauty, great seafood, and a unique charm in the Mid-Atlantic.",
  "san francisco": "Tech hub meets natural beauty. Golden Gate Bridge, tech innovation, and views of the bay that take your breath away."
};

function openModal(cityName) {
  const modal = document.getElementById('city-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalText = document.getElementById('modal-text');
  
  modalTitle.textContent = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  modalText.textContent = cityData[cityName.toLowerCase()] || "No description available.";
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('city-modal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('city-modal');
  if (event.target === modal) {
    closeModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
});
