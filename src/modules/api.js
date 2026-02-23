const WEATHER_API_FORECAST_URL = "https://api.weatherapi.com/v1/forecast.json";
// const WEATHER_API_CURRENT_URL = "https://api.weatherapi.com/v1/current.json";
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

function createForecastURL(city, days) {
    const encodedCity = encodeURIComponent(city);
    return `${WEATHER_API_FORECAST_URL}?key=${WEATHER_API_KEY}&q=${encodedCity}&days=${days}&aqi=no&lang=de`;
}

export async function fetchWeather(city, days = "3") {
    let url = createForecastURL(city, days);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Server-Fehler: ${response.status}`);
    }

    const weatherData = await response.json();
    return weatherData;
}
