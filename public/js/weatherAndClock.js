

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString("de-DE");
    document.getElementById("clock").innerText = time;
}
setInterval(updateClock, 1000);
updateClock();
function getWeatherInfo(code) {
    return WMO_CODES[code] || {
        text: "Unknown",
        icon: "❓"
    };
}


async function loadWeather() {
    fetch("/weather")
        .then(res => res.json())
        .then(data => {
            const weather = data.current_weather;

            const temp = Math.round(weather.temperature);
            const wind = Math.round(weather.windspeed);

            const info = getWeatherInfo(weather.weathercode);

            document.getElementById("weather").innerHTML =
                `${info.icon} ${info.text}<br>Temp: ${temp}°C · Wind: ${wind} km/h`;
        })
        .catch(err => {
            document.getElementById("weather").innerText = "Weather error";
            console.error(err);
        });
}

loadWeather();
setInterval(loadWeather, 600000);

function getKW(date) {
  const temp = new Date(date.getTime());
  temp.setHours(0,0,0,0);
  temp.setDate(temp.getDate() + 3 - (temp.getDay() + 6) % 7);
  const week1 = new Date(temp.getFullYear(), 0, 4);
  return 1 + Math.round(((temp - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function updateDateAndDay() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const kw = getKW(now);
    const weekday = now.toLocaleDateString("de-DE", { weekday: "long" });
    const dateStr = `${day}-${month}-${year} | ${weekday} | KW${kw}`;
    document.getElementById("date-display").innerText = dateStr;

    const key = `${month}-${day}`;
    const dayText = days[key] || "";
    const parts = dayText.split('\n');
    const formattedText = parts.length > 1 ? `<span class="accent">${parts[0]}</span><br>${parts.slice(1).join('<br>')}` : dayText;
    document.getElementById("day-info").innerHTML = formattedText;
}

updateDateAndDay();

function scheduleMidnightUpdate() {
  const now = new Date();

  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0); 

  const msUntilMidnight = nextMidnight - now;

  setTimeout(() => {
    updateDateAndDay();
    scheduleMidnightUpdate(); 
  }, msUntilMidnight + 100);
}

scheduleMidnightUpdate();
