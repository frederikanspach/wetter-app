import { getAllCities } from "./local-storage";
import { fetchWeather } from "./api";
import { clearApp, formatTemp } from "./ui-utils";
import { startWeatherFlow } from "../main";


export function renderSearchScreen() {
    const app = clearApp();

    const searchHTML = `
        <section class="search-screen">
            <div class="search-header">
                <h1 class="search-header__headline">Wetter</h1>
                <button id="favorites-edit">Bearbeiten</button>
            </div>
            
            <div class="search-box">
                <input type="text" id="city-input" placeholder="Nach Stadt suchen" autofocus>
            </div>
            
            <div class="favorites">
                <div class="favorites-list">
                    <p class="favorites-empty">Noch keine Favoriten</p>
                    <!-- <div class="favorite-card" data-city="Braunschweig">
                        <div class="favorite-card__row">
                            <span class="favorite-card__city">Braunschweig</span>
                            <span class="favorite-card__temp">8°</span>
                        </div>

                        <div class="favorite-card__row">
                            <span class="favorite-card__condition">Leichter Regen</span>
                            <span class="favorite-card__range">H: 10° L: 4°</span>
                        </div>
                    </div> -->
                </div>
            </div>
        </section>
    `;
    app.insertAdjacentHTML("beforeend", searchHTML);

    isFavoriteCities();
}

export async function isFavoriteCities() {
    const favoriteCities = getAllCities();
    const listContainer = document.querySelector(".favorites-list");

    if (!favoriteCities || !listContainer) return;

    if (favoriteCities.length > 0) {
        listContainer.innerHTML = "";
    }

    for (const city of favoriteCities) {
        try {
            const weatherData = await fetchWeather(city, "1");

            const { location, current, forecast } = weatherData;

            const cityName = location.name;
            const temp = formatTemp(current.temp_c);
            const condition = current.condition.text;
            const high = formatTemp(forecast.forecastday[0].day.maxtemp_c);
            const low = formatTemp(forecast.forecastday[0].day.mintemp_c);

            const cardHTML = `
                <div class="favorite-card" data-city="${cityName}">
                    <div class="favorite-card__row">
                        <span class="favorite-card__city">${cityName}</span>
                        <span class="favorite-card__temp">${temp}°</span>
                    </div>

                    <div class="favorite-card__row">
                        <span class="favorite-card__condition">${condition}</span>
                        <span class="favorite-card__range">H: ${high}° L: ${low}°</span>
                    </div>
                </div>
            `;

            listContainer.insertAdjacentHTML("beforeend", cardHTML);
        } catch (error) {
            console.error(`Fehler bei ${city}: ${error}`);
        }
    }

    listContainer.addEventListener("click", (event) => {
        const card = event.target.closest(".favorite-card");
        if (card) {
            const selectedCity = card.dataset.city;
            console.log("Wechsle zu Stadt:", selectedCity);
            startWeatherFlow(selectedCity);
        }
    });
}