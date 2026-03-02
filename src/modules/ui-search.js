import { getAllCities, deleteFavoriteCity, saveAllFavorites, clearAllFavorites } from "./local-storage";
import { clearApp, formatTemp } from "./ui-utils";
import { startWeatherFlow } from "../main";
import { getConditionImagePath } from "./conditions";
import { fetchWeather, fetchAutocomplete } from "./api";

function renderFavoriteSkeletons(container, cities) {
    container.innerHTML = "";
    cities.forEach(cityObj => {
        const skeletonHTML = `
            <div class="favorite-item" data-id="${cityObj.id}">
                <div class="favorite-card is-loading">
                    <div class="favorite-card__row">
                        <div class="favorite-card__location-group">
                            <div class="favorite-card__city">${cityObj.name}</div>
                            <div class="favorite-card__country">${cityObj.country}</div>
                        </div>
                        <div class="favorite-card__temp">--°</div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", skeletonHTML);
    });
}

export async function renderSearchScreen() {
    const app = clearApp();
    const favoriteCities = getAllCities();
    const hasFavorites = favoriteCities.length > 0;

    const searchHTML = `
        <section class="search-screen">
            <div class="search-header">
                <h1 class="search-header__headline">Wetter</h1>
                ${hasFavorites ? '<button id="favorites-edit">Bearbeiten</button>' : ''}
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

        renderFavoriteSkeletons(listContainer, favoriteCities);

        await loadFavoriteDataSequentially(listContainer, favoriteCities);
    }
}

async function loadFavoriteDataSequentially(container, cities) {
    const items = container.querySelectorAll(".favorite-item");

    for (const [index, cityObj] of cities.entries()) {
        try {
            const weather = await fetchWeather(cityObj.id);
            const itemSlot = items[index];

            if (!itemSlot) continue;

            const isDay = weather.current.is_day;
            const bgImage = getConditionImagePath(weather.current.condition.code, isDay);
            const isFirst = index === 0;
            const isLast = index === cities.length - 1;

            const cardHTML = `
                <div class="favorite-item__controls">
                    <button class="control-btn move-up" ${isFirst ? 'disabled' : ''} title="Nach oben">
                        <svg class="icon-arrow icon-arrow--up" viewBox="0 -960 960 960"><path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/></svg>
                    </button>
                    <button class="control-btn delete-item" title="Löschen">
                        <svg class="icon-trash" viewBox="0 -960 960 960"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                    </button>
                    <button class="control-btn move-down" ${isLast ? 'disabled' : ''} title="Nach unten">
                        <svg class="icon-arrow icon-arrow--down" viewBox="0 -960 960 960"><path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/></svg>
                    </button>
                </div>
                <div class="favorite-card" style="background-image: url('${bgImage}');">
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
            itemSlot.classList.remove('is-loading');
            itemSlot.dataset.id = cityObj.id;

        } catch (error) {
            console.error(`Fehler bei ${cityObj.name}:`, error);
            items[index]?.remove();
        }
    }
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

    renderFavoriteSkeletons(listContainer, favorites);
    await loadFavoriteDataSequentially(listContainer, favorites);

    favoritesSection.classList.add("favorites--editing");
    if (editBtn) editBtn.textContent = "Fertig";
    toggleClearAllButton(true, favoritesSection);
}

function setupFavoriteListInteractions(listContainer) {
    listContainer.addEventListener("click", async (event) => {
        const item = event.target.closest(".favorite-item");
        if (!item) return;

        const cityId = Number(item.dataset.id);
        const favorites = getAllCities();
        const currentIndex = favorites.findIndex(f => f.id === cityId);

        if (event.target.closest(".delete-item")) {
            deleteFavoriteCity(cityId);
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
            startWeatherFlow(favorites[currentIndex]);
        }
    });
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

export function setupSearchInput() {
    const input = document.getElementById("city-input");
    if (!input) return;

    let debounceTimer;

    document.addEventListener("click", (event) => {
        const searchBox = document.querySelector(".search-box");
        const list = document.querySelector(".search-results-list");
        if (list && !searchBox.contains(event.target)) {
            list.classList.add("is-hidden");
        }
    });

    input.addEventListener("focus", () => {
        const list = document.querySelector(".search-results-list");
        if (list && list.children.length > 0) {
            list.classList.remove("is-hidden");
        }
    });

    input.addEventListener("input", (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);

        if (query.length >= 3) {
            debounceTimer = setTimeout(async () => {
                const results = await fetchAutocomplete(query);
                renderAutocompleteResults(results);
                const list = document.querySelector(".search-results-list");
                if (list) list.classList.remove("is-hidden");
            }, 300);
        } else {
            const list = document.querySelector(".search-results-list");
            if (list) list.remove();
        }
    });

    input.addEventListener("keydown", async (event) => {
        if (event.key === "Enter") {
            const query = input.value.trim();
            if (!query) return;

            clearTimeout(debounceTimer);

            const list = document.querySelector(".search-results-list");
            if (list) list.remove();

            try {
                const results = await fetchAutocomplete(query);

                if (results && results.length > 0) {
                    const bestMatch = {
                        id: results[0].id,
                        name: results[0].name,
                        country: results[0].country
                    };
                    startWeatherFlow(bestMatch);
                } else {
                    startWeatherFlow(query);
                }
            } catch (error) {
                console.error("Fehler bei der ID-Ermittlung:", error);
                startWeatherFlow(query);
            }
        }
    });
}

export function renderAutocompleteResults(results) {
    let listContainer = document.querySelector(".search-results-list");

    if (!results || results.length === 0) {
        if (listContainer) listContainer.remove();
        return;
    }

    if (!listContainer) {
        const searchBox = document.querySelector(".search-box");
        listContainer = document.createElement("div");
        listContainer.className = "search-results-list";
        searchBox.appendChild(listContainer);
    }

    if (results.length === 0) {
        listContainer.innerHTML = "";
        return;
    }

    listContainer.innerHTML = results.map(city => `
        <div class="search-result-item" 
             data-id="${city.id}" 
             data-name="${city.name}" 
             data-country="${city.country}">
            <span class="search-result-item__name">${city.name}</span>
            <span class="search-result-item__region">${city.region}, ${city.country}</span>
        </div>
    `).join("");

    listContainer.querySelectorAll(".search-result-item").forEach(item => {
        item.addEventListener("click", () => {
            const selection = {
                id: Number(item.dataset.id),
                name: item.dataset.name,
                country: item.dataset.country
            };
            listContainer.innerHTML = "";
            startWeatherFlow(selection);
        });
    });
}

function setupClickAway() {
    document.addEventListener("click", (event) => {
        const searchBox = document.querySelector(".search-box");
        const listContainer = document.querySelector(".search-results-list");

        if (listContainer && searchBox && !searchBox.contains(event.target)) {
            listContainer.remove();
        }
    });
}