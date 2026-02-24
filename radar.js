let map;

function initRadar(lat, lon) {

  if(map) {
    map.remove();
  }

  map = L.map('radarMap', {
    zoomControl: false
  }).setView([lat, lon], 7);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  L.tileLayer(
    'https://tilecache.rainviewer.com/v2/radar/latest/256/{z}/{x}/{y}/2/1_1.png',
    { opacity: 0.6 }
  ).addTo(map);

  // 🔥 FIX PENTING
  setTimeout(() => {
    map.invalidateSize();
  }, 300);
}
