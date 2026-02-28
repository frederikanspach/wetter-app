import { checkFavoriteCity } from "./local-storage";
import { formatTemp, convertTo24h } from "./ui-utils";
import { getConditionImagePath } from "./conditions";

export function renderWeatherScreen() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="action-bar">
        <div class="action-bar_link">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f" class="action-bar__icon action-bar__icon--back">
            <title>Zurück</title>
            <path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"></path>
          </svg>
        </div>

        <div class="action-bar_link">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="action-bar__icon action-bar__icon--favorite">
            <title>Als Favorit speichern</title>
            <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"></path>
          </svg>
        </div>
      </section>

      <section class="current-weather">
        <h1 class="current-weather__city is-loading">&nbsp;</h1>

        <span class="current-weather__temp is-loading">&nbsp;</span>
        <p class="current-weather__condition is-loading">&nbsp;</p>

        <div class="current-weather__range">
          <div class="current-weather__range-item">
            <svg class="current-weather__icon current-weather__icon--high" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
              <path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z"></path>
            </svg>
            <span class="current-weather__high">&nbsp;</span>
          </div>

          <div class="current-weather__range-item">
            <svg class="current-weather__icon current-weather__icon--low" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
              <path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"></path>
            </svg>
            <span class="current-weather__low">&nbsp;</span>
          </div>
        </div>
      </section>

      <section class="today-forecast">
        <div class="today-forecast__header">
          <h2 class="today-forecast__title is-loading">&nbsp;</h2>
        </div>

        <div class="today-forecast__list no-scrollbar">
            <div class="forecast-card is-loading">
                <span class="forecast-card__time">&nbsp;</span>
                <span class="forecast-card__temp">&nbsp;</span>
            </div>
            <div class="forecast-card is-loading">
                <span class="forecast-card__time">&nbsp;</span>
                <span class="forecast-card__temp">&nbsp;</span>
            </div>
            <div class="forecast-card is-loading">
                <span class="forecast-card__time">&nbsp;</span>
                <span class="forecast-card__temp">&nbsp;</span>
            </div>
            <div class="forecast-card is-loading">
                <span class="forecast-card__time">&nbsp;</span>
                <span class="forecast-card__temp">&nbsp;</span>
            </div>
            <div class="forecast-card is-loading">
                <span class="forecast-card__time">&nbsp;</span>
                <span class="forecast-card__temp">&nbsp;</span>
            </div>
        </div>
      </section>

      <section class="forecast">
        <h3 class="forecast__title">Nächste 3 Tage</h3>

        <div class="forecast__container">
          <div class="forecast__row is-loading">
            <span class="forecast__day">&nbsp;</span>
            <span class="forecast__icon"></span>
            <div class="forecast__details">
              <div class="forecast__temp-group">
                <span class="high">&nbsp;</span>
                <span class="low">&nbsp;</span>
              </div>
              <div class="forecast__wind">
                <span>&nbsp;</span>
              </div>
            </div>
          </div>
          <div class="forecast__row is-loading">
            <span class="forecast__day">&nbsp;</span>
            <span class="forecast__icon"></span>
            <div class="forecast__details">
              <div class="forecast__temp-group">
                <span class="high">&nbsp;</span>
                <span class="low">&nbsp;</span>
              </div>
              <div class="forecast__wind">
                <span>&nbsp;</span>
              </div>
            </div>
          </div>
          <div class="forecast__row is-loading">
            <span class="forecast__day">&nbsp;</span>
            <span class="forecast__icon"></span>
            <div class="forecast__details">
              <div class="forecast__temp-group">
                <span class="high">&nbsp;</span>
                <span class="low">&nbsp;</span>
              </div>
              <div class="forecast__wind">
                <span>&nbsp;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mini-stats">
        <div class="mini-stats__card is-loading">
          <span class="mini-stats__label">Feuchtigkeit</span>
          <span class="mini-stats__humidity mini-stats__value">&nbsp;</span>
        </div>

        <div class="mini-stats__card is-loading">
          <span class="mini-stats__label">Gefühlt</span>
          <span class="mini-stats__feelslike_c mini-stats__value">&nbsp;</span>
        </div>

        <div class="mini-stats__card is-loading">
          <span class="mini-stats__label">Sonnenaufgang</span>
          <span class="mini-stats__sunrise mini-stats__value">&nbsp;</span>
        </div>

        <div class="mini-stats__card is-loading">
          <span class="mini-stats__label">Sonnenuntergang</span>
          <span class="mini-stats__sunset mini-stats__value">&nbsp;</span>
        </div>

        <div class="mini-stats__card is-loading">
          <span class="mini-stats__label">Niederschlag</span>
          <span class="mini-stats__precip_mm mini-stats__value">&nbsp;</span>
        </div>

        <div class="mini-stats__card is-loading">
          <span class="mini-stats__label">UV-Index</span>
          <span class="mini-stats__uv mini-stats__value">&nbsp;</span>
        </div>
      </section>`;
}

export function updateHourForecast(weatherData) {
  const listContainer = document.querySelector(".today-forecast__list");
  if (!listContainer) return;

  listContainer.innerHTML = "";

  const forecastDays = weatherData.forecast.forecastday;
  const hoursToday = forecastDays[0].hour;
  const hoursTomorrow = forecastDays[1].hour;
  const combinedHours = [...hoursToday, ...hoursTomorrow];

  const localTimeEpoch = weatherData.location.localtime_epoch;

  const startIndex = combinedHours.findIndex(hour => hour.time_epoch >= (localTimeEpoch - 1800));

  const actualStart = startIndex !== -1 ? startIndex : 0;

  const next24Hours = combinedHours.slice(actualStart, actualStart + 24);

  next24Hours.forEach((hourData, index) => {
    const timeValue = hourData.time.split(" ")[1];
    const timeLabel = index === 0 ? "Jetzt" : timeValue;

    const temp = formatTemp(hourData.temp_c);
    const iconUrl = `https:${hourData.condition.icon}`;

    const cardHTML = `
            <div class="forecast-card ${index === 0 ? 'forecast-card--active' : ''}">
                <span class="forecast-card__time">${timeLabel}</span>
                <img src="${iconUrl}" alt="${hourData.condition.text}" class="forecast-card__icon">
                <span class="forecast-card__temp">${temp}°</span>
            </div>
        `;

    listContainer.insertAdjacentHTML("beforeend", cardHTML);
  });
}

export function updateWeatherUI(weatherData) {
  if (!weatherData) return;

  const { location, current, forecast } = weatherData;
  const today = forecast.forecastday[0];

  const backgroundImageUrl = getConditionImagePath(current.condition.code, current.is_day);
  const appElement = document.getElementById("app");

  if (backgroundImageUrl) {
    appElement.style.backgroundImage = `url("${backgroundImageUrl}")`;
    appElement.style.backgroundSize = "cover";
    appElement.style.backgroundPosition = "center center";
    appElement.style.backgroundRepeat = "no-repeat";
  }

  document.querySelector(".current-weather__city").textContent = location.name;
  document.querySelector(".current-weather__temp").textContent = `${formatTemp(current.temp_c)}°`;
  document.querySelector(".current-weather__condition").textContent = current.condition.text;

  document.querySelector(".current-weather__high").textContent = `${formatTemp(today.day.maxtemp_c)}°`;
  document.querySelector(".current-weather__low").textContent = `${formatTemp(today.day.mintemp_c)}°`;

  document.querySelector(".today-forecast__title").textContent =
    `Heute ${current.condition.text.toLowerCase()}. Wind bis zu ${current.wind_kph.toLocaleString('de-DE')} km/h.`;

  const statsCards = document.querySelectorAll(".mini-stats__card");

  statsCards[0].querySelector(".mini-stats__humidity").textContent = `${current.humidity}%`;
  statsCards[1].querySelector(".mini-stats__feelslike_c").textContent = `${current.feelslike_c.toLocaleString('de-DE')}°`;
  statsCards[2].querySelector(".mini-stats__sunrise").textContent = convertTo24h(today.astro.sunrise);
  statsCards[3].querySelector(".mini-stats__sunset").textContent = convertTo24h(today.astro.sunset);
  statsCards[4].querySelector(".mini-stats__precip_mm").textContent = `${current.precip_mm.toLocaleString('de-DE')} mm`;
  statsCards[5].querySelector(".mini-stats__uv").textContent = current.uv.toLocaleString('de-DE');

  const forecastRows = document.querySelectorAll(".forecast__row");
  forecast.forecastday.forEach((day, index) => {
    if (forecastRows[index]) {
      const row = forecastRows[index];
      const date = new Date(day.date);
      const dayName = index === 0 ? "Heute" : date.toLocaleDateString('de-DE', { weekday: 'short' });

      row.querySelector(".forecast__day").textContent = dayName;
      row.querySelector(".forecast__icon").innerHTML = `<img src="https:${day.day.condition.icon}" alt="" class="forecast-card__icon"></img>`;
      row.querySelector(".high").textContent = `${formatTemp(day.day.maxtemp_c)}°`;
      row.querySelector(".low").textContent = `${formatTemp(day.day.mintemp_c)}°`;
      row.querySelector(".forecast__wind span").textContent = `Wind: ${Math.round(day.day.maxwind_kph)} km/h`;
    }
  });

  updateHourForecast(weatherData);

  const favoriteButton = document.querySelector(".action-bar__icon--favorite");

  if (checkFavoriteCity(location.name)) {
    favoriteButton.classList.add("is-favorite");
  } else {
    favoriteButton.classList.remove("is-favorite");
  }
}
