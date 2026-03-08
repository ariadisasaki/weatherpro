// =====================
// app.js - Weather Pro
// =====================

const API_KEY = "3d7067c694814da1be2160519260803";
const BASE_URL = "https://api.weatherapi.com/v1/forecast.json?days=7&aqi=no&alerts=no";

let currentLang = "id";
let animationId = null;
let lastQuery = "Jakarta";

// =====================
// Loading
// =====================
function showLoading(){ document.getElementById("loading").style.display="block"; }
function hideLoading(){ document.getElementById("loading").style.display="none"; }

// =====================
// Canvas hujan
// =====================
const canvas = document.getElementById("weatherCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function setBackground(condition){
  clearAnimation();
  if(condition.toLowerCase().includes("rain")) rainAnimation();
}

function rainAnimation(){
  if(animationId) cancelAnimationFrame(animationId);
  const dropsCount = window.innerWidth<768?100:200;
  let drops = [];
  for(let i=0;i<dropsCount;i++) drops.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height});
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    drops.forEach(d=>{ctx.fillRect(d.x,d.y,2,10); d.y+=10; if(d.y>canvas.height)d.y=0;});
    animationId = requestAnimationFrame(draw);
  }
  draw();
}

function clearAnimation(){ if(animationId) cancelAnimationFrame(animationId); ctx.clearRect(0,0,canvas.width,canvas.height); }

// =====================
// Dark/Light theme
// =====================
function setTheme(localtime){
  const hour=parseInt(localtime.split(" ")[1].split(":")[0]);
  document.body.classList.remove("dark","light");
  document.body.classList.add(hour>=18||hour<6?"dark":"light");
}

// =====================
// Display Weather
// =====================
function displayWeather(data){
  const c = data.current, l = data.location;
  document.getElementById("widget").innerHTML=`
    <h3>${l.name}</h3>
    <h2>${c.temp_c}°C</h2>
    <p>${c.condition.text}</p>
  `;
  document.getElementById("currentWeather").innerHTML=`
    <h2>${l.name}, ${l.country}</h2>
    <img src="https:${c.condition.icon}" alt="${c.condition.text}">
    <h1>${c.temp_c}°C</h1>
    <p>${c.condition.text}</p>
  `;
  let html="";
  data.forecast.forecastday.forEach(d=>{
    html+=`
      <div class="forecast-day">
        <p>${d.date}</p>
        <img src="https:${d.day.condition.icon}" alt="${d.day.condition.text}">
        <p>${d.day.maxtemp_c}° / ${d.day.mintemp_c}°</p>
      </div>
    `;
  });
  document.getElementById("forecast").innerHTML=html;
}

// =====================
// Search
// =====================
function searchCity(){
  const city=document.getElementById("cityInput").value.trim();
  if(city){ lastQuery=city; getWeather(city); }
}

// =====================
// Toggle Language
// =====================
async function toggleLang(){
  currentLang = currentLang==="id"?"en":"id";
  updateUIText();        // update label / button
  await getWeather(lastQuery); // cuaca bahasa baru
  if(typeof updateRadarLegend === "function")
    updateRadarLegend(); // legend radar bahasa baru
}

function updateUIText(){
  const btn = document.getElementById("langBtn");
  btn.textContent = currentLang==="id" ? "🌐 ID" : "🌐 EN";
}

// =====================
// Fetch Weather
// =====================
async function getWeather(query){
  showLoading();
  try{
    const res = await fetch(`${BASE_URL}&key=${API_KEY}&q=${query}&lang=${currentLang}`);
    const data = await res.json();
    if(data.error){ alert("Kota tidak ditemukan"); return; }
    displayWeather(data);
    setTheme(data.location.localtime);
    setBackground(data.current.condition.text);
    if(typeof initRadar==="function")
      initRadar(data.location.lat, data.location.lon);
  }catch(err){ console.error(err); alert("Gagal mengambil data cuaca"); }
  finally{ hideLoading(); }
}

// =====================
// Event Listeners
// =====================
document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("searchBtn").addEventListener("click",searchCity);
  document.getElementById("langBtn").addEventListener("click",toggleLang);

  // Auto cuaca lokasi user
  navigator.geolocation.getCurrentPosition(
    pos=>{ lastQuery=`${pos.coords.latitude},${pos.coords.longitude}`; getWeather(lastQuery); },
    ()=>getWeather(lastQuery)
  );
});

// Resize canvas
window.addEventListener("resize",()=>{
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
});

let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
  installBtn.hidden = true;

  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("Aplikasi diinstall");
    } else {
      console.log("Install dibatalkan");
    }

    deferredPrompt = null;
  }
});

window.addEventListener("appinstalled", () => {
  installBtn.hidden = true;
});

window.addEventListener("appinstalled", () => {
  console.log("Aplikasi berhasil diinstall");
  installBtn.style.display = "none";
});
