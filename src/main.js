import "./main.scss";
import { fetchWeather } from "./modules/api";
import { saveFavoriteCity, deleteFavoriteCity, checkFavoriteCity } from "./modules/local-storage";
import { updateWeatherUI, renderWeatherScreen } from "./modules/ui-detail";
import { renderSearchScreen } from "./modules/ui-search";
import { removeSkeletons, setupHorizontalScroll } from "./modules/ui-utils";

document.addEventListener("DOMContentLoaded", () => {
  initSearch();
});

function initSearch() {
  const app = document.getElementById("app");
  if (app) {
    app.style.backgroundImage = "";
  }

  renderSearchScreen();

  const cityInput = document.getElementById("city-input");

  cityInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const city = cityInput.value.trim();
      if (city) {
        startWeatherFlow(city);
      }
    }
  });
}

export async function startWeatherFlow(city) {
  renderWeatherScreen();

  try {
    const weatherData = await fetchWeather(city);

    updateWeatherUI(weatherData);

    setupHorizontalScroll();

    const backButton = document.querySelector(".action-bar__icon--back");
    if (backButton) {
      backButton.addEventListener("click", () => {
        initSearch();
      });
    }

    const favoriteButton = document.querySelector(".action-bar__icon--favorite");
    if (favoriteButton) {
      favoriteButton.addEventListener("click", () => {
        const cityName = document.querySelector(".current-weather__city").textContent;

        if (checkFavoriteCity(cityName)) {
          deleteFavoriteCity(cityName);
          favoriteButton.classList.remove("is-favorite");
        } else {
          saveFavoriteCity(cityName);
          favoriteButton.classList.add("is-favorite");
        }
      });
    }

  } catch (error) {
    console.error(`Da ging was schief: ${error}`);
    alert(error);
    initSearch();
  } finally {
    removeSkeletons();
  }
}
