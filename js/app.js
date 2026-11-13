const weatherStatus = document.getElementById("weather-status");
const weatherReading = document.getElementById("weather-reading");
const weatherIcon = document.getElementById("weather-icon");
const weatherTemperature = document.getElementById("weather-temperature");
const weatherCondition = document.getElementById("weather-condition");
const weatherRefresh = document.getElementById("weather-refresh");

function describeWeather(code, isDay) {
  if (code === 0) return { icon: isDay ? "☀️" : "🌙", description: isDay ? "Clear sky" : "Clear night" };
  if (code === 1) return { icon: isDay ? "🌤️" : "☁️", description: "Mostly clear" };
  if (code === 2) return { icon: "⛅", description: "Partly cloudy" };
  if (code === 3) return { icon: "☁️", description: "Overcast" };
  if (code === 45 || code === 48) return { icon: "🌫️", description: "Fog" };
  if (code >= 51 && code <= 57) return { icon: "🌦️", description: "Drizzle" };
  if (code >= 61 && code <= 67) return { icon: "🌧️", description: "Rain" };
  if (code === 71 || code === 73 || code === 75 || code === 77) return { icon: "❄️", description: "Snow" };
  if (code >= 80 && code <= 82) return { icon: "🌧️", description: "Rain showers" };
  if (code === 85 || code === 86) return { icon: "🌨️", description: "Snow showers" };
  if (code === 95 || code === 96 || code === 99) return { icon: "⛈️", description: "Thunderstorm" };
  return { icon: "🌡️", description: "Current conditions" };
}

function requestWeather() {
  weatherRefresh.disabled = true;
  weatherRefresh.textContent = "Finding your location…";
  weatherStatus.textContent = "Checking your location…";
  weatherReading.hidden = true;

  if (!navigator.geolocation) {
    weatherStatus.textContent = "Location isn’t available in this browser.";
    weatherRefresh.disabled = false;
    weatherRefresh.textContent = "Try again";
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: "temperature_2m,weather_code,is_day",
      temperature_unit: "fahrenheit",
      timezone: "auto"
    });

    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
      if (!response.ok) throw new Error(`Weather service returned ${response.status}`);

      const data = await response.json();
      const current = data.current;
      if (!current || !Number.isFinite(current.temperature_2m) ||
          !Number.isFinite(current.weather_code) || !Number.isFinite(current.is_day)) {
        throw new Error("Weather service returned incomplete current conditions");
      }

      const condition = describeWeather(current.weather_code, current.is_day === 1);
      weatherIcon.textContent = condition.icon;
      weatherTemperature.textContent = Math.round(current.temperature_2m).toString();
      weatherCondition.textContent = condition.description;
      weatherReading.hidden = false;
      weatherStatus.textContent = "Current conditions near you";
      weatherRefresh.textContent = "Refresh weather";
    } catch (error) {
      console.error("Unable to load current weather:", error);
      weatherStatus.textContent = "Weather couldn’t load. Check your connection and try again.";
      weatherRefresh.textContent = "Try again";
    } finally {
      weatherRefresh.disabled = false;
    }
  }, (error) => {
    if (error.code === 1) {
      weatherStatus.textContent = "Please enable location services to see your weather.";
    } else if (error.code === 3) {
      weatherStatus.textContent = "Your location request timed out. Try again.";
    } else {
      weatherStatus.textContent = "Your location couldn’t be determined. Try again.";
    }
    weatherRefresh.disabled = false;
    weatherRefresh.textContent = "Try again";
  }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
}

weatherRefresh.addEventListener("click", requestWeather);
requestWeather();
