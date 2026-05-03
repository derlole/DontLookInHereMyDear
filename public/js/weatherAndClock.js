

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