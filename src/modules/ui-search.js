import { getAllCities, deleteFavoriteCity, saveAllFavorites, clearAllFavorites } from "./local-storage";
import { fetchWeather } from "./api";
import { clearApp, formatTemp } from "./ui-utils";
import { startWeatherFlow } from "../main";
import { getConditionImagePath } from "./conditions";


export async function renderSearchScreen() {
    const app = clearApp();
    const favoriteCities = getAllCities();
    const hasFavorites = favoriteCities.length > 0;

    const searchHTML = `
        <section class="search-screen">
            <div class="search-header">
                <h1 class="search-header__headline">Wetter</h1>
                ${hasFavorites ? '<button id="favorites-edit" title="Favoriten Bearbeiten">Bearbeiten</button>' : ''}
            </div>
            
            <div class="search-box">
                <input type="text" id="city-input" placeholder="Nach Stadt suchen" autofocus>
            </div>
            
            <div class="favorites">
                <div class="favorites-list">
                    ${!hasFavorites ? '<p class="favorites-empty">Noch keine Favoriten</p>' : ''}
                </div>
            </div>
        </section>
    `;
    app.insertAdjacentHTML("beforeend", searchHTML);

    setupSearchInput();

    if (hasFavorites) {
        setupEditButton();
        const listContainer = app.querySelector(".favorites-list");
        setupFavoriteListInteractions(listContainer);

        await isFavoriteCities();
    }
}

export async function isFavoriteCities() {
    const favoriteCities = getAllCities();
    const listContainer = document.querySelector(".favorites-list");

    if (!favoriteCities || !listContainer) return;

    listContainer.innerHTML = "";

    for (const [index, city] of favoriteCities.entries()) {
        try {
            const weatherData = await fetchWeather(city, "1");
            const { location, current, forecast } = weatherData;

            const cityName = location.name;
            const temp = formatTemp(current.temp_c);
            const condition = current.condition.text;
            const high = formatTemp(forecast.forecastday[0].day.maxtemp_c);
            const low = formatTemp(forecast.forecastday[0].day.mintemp_c);

            const isFirst = index === 0;
            const isLast = index === favoriteCities.length - 1;

            const cardHTML = `
                <div class="favorite-item" data-city="${city}">
                    <div class="favorite-item__controls">
                        <button class="control-btn move-up" ${isFirst ? 'disabled' : ''} title="Stadt nach oben verschieben">▲</button>
                        <button class="control-btn delete-item" title="Stadt aus Favoriten löschen">🗑️</button>
                        <button class="control-btn move-down" ${isLast ? 'disabled' : ''} title="Stadt nach unten verschieben">▼</button>
                    </div>
                    <div class="favorite-card">
                        <div class="favorite-card__row">
                            <span class="favorite-card__city">${cityName}</span>
                            <span class="favorite-card__temp">${temp}°</span>
                        </div>
                        <div class="favorite-card__row">
                            <span class="favorite-card__condition">${condition}</span>
                            <span class="favorite-card__range">H: ${high}° L: ${low}°</span>
                        </div>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML("beforeend", cardHTML);

            const lastItem = listContainer.lastElementChild;
            const cardElement = lastItem.querySelector(".favorite-card");
            const backgroundImageUrl = getConditionImagePath(current.condition.code, current.is_day);

            if (backgroundImageUrl && cardElement) {
                cardElement.style.backgroundImage = `url("${backgroundImageUrl}")`;
                cardElement.style.backgroundSize = "cover";
                cardElement.style.backgroundPosition = "left";
                cardElement.style.backgroundRepeat = "no-repeat";
            }
        } catch (error) {
            console.error(`Fehler bei ${city}: ${error}`);
        }
    }
}

async function refreshAndKeepEditing() {
    const favorites = getAllCities();
    if (favorites.length === 0) {
        renderSearchScreen();
        return;
    }

    await isFavoriteCities();

    const favoritesSection = document.querySelector(".favorites");
    const editBtn = document.getElementById("favorites-edit");

    favoritesSection.classList.add("favorites--editing");
    if (editBtn) editBtn.textContent = "Fertig";
    toggleClearAllButton(true, favoritesSection);
}

function setupEditButton() {
    const editBtn = document.getElementById("favorites-edit");
    const favoritesSection = document.querySelector(".favorites");

    if (!editBtn || !favoritesSection) return;

    editBtn.addEventListener("click", () => {
        const isEditing = favoritesSection.classList.toggle("favorites--editing");
        editBtn.textContent = isEditing ? "Fertig" : "Bearbeiten";
        toggleClearAllButton(isEditing, favoritesSection);
    });
}

function toggleClearAllButton(show, container) {
    let clearBtn = document.getElementById("clear-all-favorites");
    if (show && !clearBtn) {
        clearBtn = document.createElement("button");
        clearBtn.id = "clear-all-favorites";
        clearBtn.className = "btn-clear-all";
        clearBtn.textContent = "Alle Favoriten löschen";
        clearBtn.onclick = async () => {
            if (confirm("Alle Favoriten löschen?")) {
                clearAllFavorites();
                renderSearchScreen();
            }
        };
        container.appendChild(clearBtn);
    } else if (!show && clearBtn) {
        clearBtn.remove();
    }
}

function setupFavoriteListInteractions(listContainer) {
    listContainer.addEventListener("click", async (event) => {
        const item = event.target.closest(".favorite-item");
        if (!item) return;

        const cityName = item.dataset.city;
        const favorites = getAllCities();
        const currentIndex = favorites.indexOf(cityName);

        if (event.target.closest(".delete-item")) {
            deleteFavoriteCity(cityName);
            await refreshAndKeepEditing();
            return;
        }

        const upBtn = event.target.closest(".move-up");
        const downBtn = event.target.closest(".move-down");

        if (upBtn || downBtn) {
            const targetIndex = upBtn ? currentIndex - 1 : currentIndex + 1;
            if (targetIndex >= 0 && targetIndex < favorites.length) {
                [favorites[currentIndex], favorites[targetIndex]] = [favorites[targetIndex], favorites[currentIndex]];
                saveAllFavorites(favorites);
                await refreshAndKeepEditing();
            }
            return;
        }

        if (event.target.closest(".favorite-card")) {
            startWeatherFlow(cityName);
        }
    });
}

function setupSearchInput() {
    const input = document.getElementById("city-input");
    if (!input) return;

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const city = input.value.trim();
            if (city) {
                startWeatherFlow(city);
            }
        }
    });
}