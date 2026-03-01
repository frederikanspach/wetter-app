import { getAllCities, deleteFavoriteCity, saveAllFavorites, clearAllFavorites } from "./local-storage";
import { fetchWeather } from "./api";
import { clearApp, formatTemp } from "./ui-utils";
import { startWeatherFlow } from "../main";
import { getConditionImagePath } from "./conditions";

function renderFavoriteSkeletons(container, cityCount) {
    container.innerHTML = "";
    for (let i = 0; i < cityCount; i++) {
        const skeletonHTML = `
            <div class="favorite-item">
                <div class="favorite-card is-loading">
                    <div class="favorite-card__row">
                        <div class="favorite-card__location-group">
                            <div class="favorite-card__city" style="width: 120px; height: 1.4rem; background: rgba(255,255,255,0.1); border-radius: 4px;"></div>
                            <div class="favorite-card__country" style="width: 80px; height: 0.8rem; margin-top: 4px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                        </div>
                        <div class="favorite-card__temp" style="width: 45px; height: 2rem; background: rgba(255,255,255,0.1); border-radius: 4px;"></div>
                    </div>
                    <div class="favorite-card__row">
                        <div class="favorite-card__condition" style="width: 90px; height: 1rem; background: rgba(255,255,255,0.1); border-radius: 4px;"></div>
                        <div class="favorite-card__range" style="width: 70px; height: 1rem; background: rgba(255,255,255,0.1); border-radius: 4px;"></div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", skeletonHTML);
    }
}

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

        renderFavoriteSkeletons(listContainer, favoriteCities.length);

        await loadFavoriteDataSequentially(listContainer, favoriteCities);
    }
}

async function loadFavoriteDataSequentially(container, cities) {
    const skeletonItems = container.querySelectorAll(".favorite-item");

    // .forEach wartet nicht aus await!
    for (const [index, city] of cities.entries()) {
        try {
            const weather = await fetchWeather(city);
            const itemSlot = skeletonItems[index];

            if (!itemSlot) continue;

            const isDay = weather.current.is_day;
            const bgImage = getConditionImagePath(weather.current.condition.code, isDay);

            const isFirst = index === 0;
            const isLast = index === cities.length - 1;

            const cardHTML = `
                <div class="favorite-item__controls">
                </div>
                <div class="favorite-card" style="background-image: url('${bgImage}'); background-size: cover; background-position: left;">
                    <div class="favorite-card__row">
                        <div class="favorite-card__location-group">
                            <span class="favorite-card__city">${weather.location.name}</span>
                            <span class="favorite-card__country">${weather.location.country}</span>
                        </div>
                        <span class="favorite-card__temp">${formatTemp(weather.current.temp_c)}°</span>
                    </div>
                    <div class="favorite-card__row">
                        <span class="favorite-card__condition">${weather.current.condition.text}</span>
                        <span class="favorite-card__range">H:${formatTemp(weather.forecast.forecastday[0].day.maxtemp_c)}° L:${formatTemp(weather.forecast.forecastday[0].day.mintemp_c)}°</span>
                    </div>
                </div>
            `;

            itemSlot.innerHTML = cardHTML;
            itemSlot.dataset.city = city;

        } catch (error) {
            console.error(`Fehler beim Laden von ${city}:`, error);
            const slot = skeletonItems[index];
            if (slot) slot.remove();
        }
    }
}

async function renderFavoritesForEditing(container, cities) {
    container.innerHTML = "";

    for (let i = 0; i < cities.length; i++) {
        const itemHTML = `<div class="favorite-item" data-city="${cities[i]}"></div>`;
        container.insertAdjacentHTML("beforeend", itemHTML);
    }

    await loadFavoriteDataSequentially(container, cities);
}

async function refreshAndKeepEditing() {
    const favorites = getAllCities();
    const favoritesSection = document.querySelector(".favorites");
    const listContainer = document.querySelector(".favorites-list");
    const editBtn = document.getElementById("favorites-edit");

    if (favorites.length === 0) {
        renderSearchScreen();
        return;
    }

    await renderFavoritesForEditing(listContainer, favorites);

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