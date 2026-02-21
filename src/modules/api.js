const WEATHER_API_URL = "https://api.weatherapi.com/v1/forecast.json";
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

function createURL(city = "Berlin") {
    return `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${city}&days=3&aqi=no&lang=de`;
}

export async function fetchWeather(city) {
    let url = createURL(city);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Server-Fehler: ${response.status}`);
        }

        const weatherData = await response.json();
        return weatherData;
    } catch (error) {
        console.log(error.message);
        return null;
    }
}
