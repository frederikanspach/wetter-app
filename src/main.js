import "./main.scss";
import { fetchWeather } from "./modules/api";
import { removeSkeletons, renderSearchScreen, renderWeatherScreen, setupHorizontalScroll, updateWeatherUI } from "./modules/ui";

document.addEventListener("DOMContentLoaded", () => {
  initSearch();
});

function initSearch() {
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

async function startWeatherFlow(city) {
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

  } catch (error) {
    console.error(`Da ging was schief: ${error}`);
    alert("Stadt nicht gefunden!");
    initSearch();
  } finally {
    removeSkeletons();
  }
}
