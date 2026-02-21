import "./main.scss";
import { fetchWeather } from "./modules/api";
import { removeSkeletons, setupHorizontalScroll, updateWeatherUI } from "./modules/ui";

let city = "Braunschweig";
let weatherData;

document.addEventListener("DOMContentLoaded", async () => {
  setupHorizontalScroll();

  try {
    weatherData = await fetchWeather(city);

    updateWeatherUI(weatherData);

    removeSkeletons();

  } catch (error) {
    console.error(`Da ging was schief: ${error}`);
  }
});
