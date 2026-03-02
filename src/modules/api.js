const WEATHER_API_FORECAST_URL = "https://api.weatherapi.com/v1/forecast.json";
const WEATHER_API_SEARCH_URL = "https://api.weatherapi.com/v1/search.json";
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export async function fetchAutocomplete(query) {
    if (!query || query.length < 3) return [];

    const url = `${WEATHER_API_SEARCH_URL}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Suche fehlgeschlagen");
        return await response.json();
    } catch (error) {
        console.error("Autocomplete Fehler:", error);
        return [];
    }
}

export async function fetchWeather(query, days = "3") {
    const q = typeof query === "number" ? `id:${query}` : query;
    const encodedCity = encodeURIComponent(q);
    const url = `${WEATHER_API_FORECAST_URL}?key=${WEATHER_API_KEY}&q=${encodedCity}&days=${days}&aqi=no&lang=de`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Server-Fehler: ${response.status}`);
    }

    return await response.json();
}