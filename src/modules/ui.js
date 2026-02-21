export function setupHorizontalScroll() {
    const scrollList = document.querySelector(".today-forecast__list");

    if (scrollList) {
        scrollList.addEventListener("wheel", (event) => {
            if (event.deltaY !== 0) {
                event.preventDefault();
                scrollList.scrollLeft += event.deltaY;
            }
        });
    }
};

export function removeSkeletons() {
    const loaders = document.querySelectorAll('.is-loading');
    loaders.forEach(el => el.classList.remove('is-loading'));
}

function convertTo24h(timeStr) {
    if (!timeStr) return "--:--";

    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }

    return `${hours}:${minutes}`;
}

export function updateHourForecast(weatherData) {
    const listContainer = document.querySelector(".today-forecast__list");
    if (!listContainer) return;

    listContainer.innerHTML = "";

    const forecastDays = weatherData.forecast.forecastday;

    const hoursToday = forecastDays[0].hour;
    const hoursTomorrow = forecastDays[1].hour;
    const combinedHours = [...hoursToday, ...hoursTomorrow];

    const currentHour = new Date().getHours();

    const next12Hours = combinedHours.slice(currentHour, currentHour + 12);

    next12Hours.forEach((hourData, index) => {
        const timeValue = hourData.time.split(" ")[1];
        const timeLabel = index === 0 ? "Jetzt" : timeValue;

        const temp = Math.round(hourData.temp_c);
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

    document.querySelector(".current-weather__city").textContent = location.name;
    document.querySelector(".current-weather__temp").textContent = `${Math.round(current.temp_c)}°`;
    document.querySelector(".current-weather__condition").textContent = current.condition.text;

    document.querySelector(".current-weather__high").textContent = `${Math.round(today.day.maxtemp_c)}°`;
    document.querySelector(".current-weather__low").textContent = `${Math.round(today.day.mintemp_c)}°`;

    document.querySelector(".today-forecast__title").textContent =
        `Heute ${current.condition.text.toLowerCase()}. Wind bis zu ${current.wind_kph} km/h.`;

    const statsCards = document.querySelectorAll(".mini-stats__card");

    statsCards[0].querySelector(".mini-stats__humidity").textContent = `${current.humidity}%`;
    statsCards[1].querySelector(".mini-stats__feelslike_c").textContent = `${current.feelslike_c.toLocaleString('de-DE')}°`;
    statsCards[2].querySelector(".mini-stats__sunrise").textContent = convertTo24h(today.astro.sunrise);
    statsCards[3].querySelector(".mini-stats__sunset").textContent = convertTo24h(today.astro.sunset);
    statsCards[4].querySelector(".mini-stats__precip_mm").textContent = `${current.precip_mm}mm`;
    statsCards[5].querySelector(".mini-stats__uv").textContent = current.uv;

    const forecastRows = document.querySelectorAll(".forecast__row");
    forecast.forecastday.forEach((day, index) => {
        if (forecastRows[index]) {
            const row = forecastRows[index];
            // Datum formatieren
            const date = new Date(day.date);
            const dayName = index === 0 ? "Heute" : date.toLocaleDateString('de-DE', { weekday: 'short' });

            row.querySelector(".forecast__day").textContent = dayName;
            row.querySelector(".high").textContent = `${Math.round(day.day.maxtemp_c)}°`;
            row.querySelector(".low").textContent = `${Math.round(day.day.mintemp_c)}°`;
            row.querySelector(".forecast__wind span").textContent = `${Math.round(day.day.maxwind_kph)} km/h`;
        }
    });

    updateHourForecast(weatherData);
}
