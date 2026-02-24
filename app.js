const API_KEY = "9e537837d4fd4f8b90172312262402";
const BASE_URL = "https://api.weatherapi.com/v1/forecast.json?days=7&aqi=no&alerts=no";

let currentLang = "id";

async function getWeather(query) {
  const res = await fetch(`${BASE_URL}&key=${API_KEY}&q=${query}&lang=${currentLang}`);
  const data = await res.json();
  displayWeather(data);
  setBackground(data.current.condition.text);
  setTheme(data.location.localtime);
  initRadar(data.location.lat, data.location.lon);
}

function displayWeather(data) {
  const c = data.current;
  const l = data.location;

  document.getElementById("currentWeather").innerHTML = `
    <h2>${l.name}</h2>
    <img src="https:${c.condition.icon}">
    <h1>${c.temp_c}°C</h1>
    <p>${c.condition.text}</p>
  `;

  let html = "";
  data.forecast.forecastday.forEach(d => {
    html += `
      <div class="forecast-day">
        <p>${d.date}</p>
        <img src="https:${d.day.condition.icon}">
        <p>${d.day.maxtemp_c}° / ${d.day.mintemp_c}°</p>
      </div>
    `;
  });

  document.getElementById("forecast").innerHTML = html;
}

function setBackground(condition) {
  if(condition.toLowerCase().includes("rain")) {
    rainAnimation();
  } else if(condition.toLowerCase().includes("sun")) {
    clearAnimation();
  }
}

function setTheme(localtime) {
  const hour = parseInt(localtime.split(" ")[1].split(":")[0]);
  if(hour >= 18 || hour < 6) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.add("light");
  }
}

function toggleLang() {
  currentLang = currentLang === "id" ? "en" : "id";
  searchCity();
}

function searchCity() {
  const city = document.getElementById("cityInput").value;
  if(city) getWeather(city);
}

navigator.geolocation.getCurrentPosition(pos => {
  getWeather(`${pos.coords.latitude},${pos.coords.longitude}`);
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

const canvas = document.getElementById("weatherCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function rainAnimation() {
  let drops = [];
  for(let i=0;i<200;i++){
    drops.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height});
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="rgba(255,255,255,0.5)";
    drops.forEach(d=>{
      ctx.fillRect(d.x,d.y,2,10);
      d.y+=10;
      if(d.y>canvas.height)d.y=0;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

function clearAnimation(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
}
