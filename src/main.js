import "./main.scss";
import { fetchWeather } from "./modules/api";
import { saveFavoriteCity, deleteFavoriteCity, checkFavoriteCity } from "./modules/local-storage";
import { updateWeatherUI, renderWeatherScreen } from "./modules/ui-detail";
import { renderSearchScreen, setupSearchInput } from "./modules/ui-search";
import { removeSkeletons, setupHorizontalScroll } from "./modules/ui-utils";

document.addEventListener("DOMContentLoaded", () => {
  initSearch();
});

function initSearch() {
  const app = document.getElementById("app");
  if (app) {
    app.style.backgroundImage = "";
    app.classList.remove("has-overlay");
  }

  renderSearchScreen();

  setupSearchInput();
}

export async function startWeatherFlow(selection) {
  const app = document.getElementById("app");
  app.classList.add("has-overlay");
  renderWeatherScreen();

  try {
    const query = selection.id ? `id:${selection.id}` : selection;
    const weatherData = await fetchWeather(query);

    const cityContext = {
      id: weatherData.location.id || selection.id || weatherData.location.name,
      name: weatherData.location.name,
      country: weatherData.location.country
    };

    updateWeatherUI(weatherData);
    setupHorizontalScroll();
    setupActionButtons(cityContext);

  } catch (error) {
    console.error(`Fehler: ${error}`);
    alert("Ort konnte nicht gefunden werden.");
    initSearch();
  } finally {
    removeSkeletons();
  }
}

function setupActionButtons(cityContext) {
  const backBtn = document.querySelector(".action-bar__icon--back");
  const favBtn = document.querySelector(".action-bar__icon--favorite");

  if (backBtn) backBtn.onclick = () => initSearch();

  if (favBtn) {
    favBtn.classList.toggle("is-favorite", checkFavoriteCity(cityContext.id));

    favBtn.onclick = () => {
      if (checkFavoriteCity(cityContext.id)) {
        deleteFavoriteCity(cityContext.id);
        favBtn.classList.remove("is-favorite");
      } else {
        saveFavoriteCity(cityContext);
        favBtn.classList.add("is-favorite");
      }
    };
  }
}