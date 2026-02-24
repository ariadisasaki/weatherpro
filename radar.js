// =====================
// RADAR.JS - MAP & LEGEND
// =====================

let map;  // hanya satu map global
let radarLayers = [];
let frameIndex = 0;
let animationTimer = null;

async function initRadar(lat, lon) {
  const container = document.getElementById("radarMap");
  container.innerHTML = "";

  if (map) {
    map.remove();
    map = null;
  }

  map = L.map("radarMap").setView([lat, lon], 6);

  // Base tile
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);
  L.marker([lat, lon]).addTo(map);

  // Ambil data radar
  const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
  const data = await res.json();
  const frames = data.radar.past.slice(-10);

  radarLayers = [];
  frames.forEach(frame => {
    const layer = L.tileLayer(
      `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`,
      { opacity: 0 }
    );
    layer.addTo(map);
    radarLayers.push(layer);
  });

  frameIndex = 0;
  showFrame(frameIndex);
  startAnimation();
  createControls(frames);
}

function showFrame(index) {
  radarLayers.forEach((layer, i) => layer.setOpacity(i === index ? 0.7 : 0));
}

function startAnimation() {
  animationTimer = setInterval(() => {
    frameIndex = (frameIndex + 1) % radarLayers.length;
    showFrame(frameIndex);
    const slider = document.getElementById("timeline");
    if (slider) slider.value = frameIndex;
  }, 700);
}

function stopAnimation() {
  clearInterval(animationTimer);
}

function toggleAnimation() {
  if (animationTimer) stopAnimation();
  else startAnimation();
}

function createControls(frames) {
  const controls = document.createElement("div");
  controls.id = "radarControls";
  controls.innerHTML = `
    <button onclick="toggleAnimation()">⏯</button>
    <input type="range" min="0" max="${frames.length-1}" value="0" id="timeline">
    <div class="legend">
      <span style="background:lime"></span> Ringan
      <span style="background:yellow"></span> Sedang
      <span style="background:orange"></span> Lebat
      <span style="background:red"></span> Sangat Lebat
    </div>
  `;

  document.getElementById("radarMap").appendChild(controls);

  const slider = document.getElementById("timeline");
  slider.addEventListener("input", e => {
    stopAnimation();
    frameIndex = parseInt(e.target.value);
    showFrame(frameIndex);
  });
}
