let map = null;
let radarLayer = null;

function initRadar(lat, lon) {

  const mapContainer = document.getElementById("radarMap");

  // Bersihkan container total
  mapContainer.innerHTML = "";

  if (map !== null) {
    map.remove();
    map = null;
  }

  map = L.map("radarMap", {
    center: [lat, lon],
    zoom: 6,
    zoomControl: true
  });

  // Base map
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18
  }).addTo(map);

  // Radar layer
  radarLayer = L.tileLayer(
    "https://tilecache.rainviewer.com/v2/radar/latest/256/{z}/{x}/{y}/2/1_1.png",
    {
      opacity: 0.6
    }
  ).addTo(map);

  // Marker lokasi
  L.marker([lat, lon]).addTo(map);

  // 🔥 SUPER FIX
  setTimeout(() => {
    map.invalidateSize(true);
  }, 500);

  // Resize fix jika window berubah
  window.addEventListener("resize", () => {
    setTimeout(() => {
      map.invalidateSize(true);
    }, 200);
  });
}
