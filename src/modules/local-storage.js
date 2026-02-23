const STORAGE_KEY_FAVORITES = "wetter-app:favorite-cities";

export function saveFavoriteCity(city) {
    const favorites = getAllCities();
    if (!checkFavoriteCity(city)) {
        favorites.push(city);
        saveAllFavorites(favorites);
        return true;
    }
    return false;
}

export function saveAllFavorites(cities) {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(cities));
}

export function getAllCities() {
    const data = localStorage.getItem(STORAGE_KEY_FAVORITES);
    return data ? JSON.parse(data) : [];
}

export function deleteFavoriteCity(city) {
    const favorites = getAllCities();
    const updatedFavorites = favorites.filter((fav) => fav !== city);
    saveAllFavorites(updatedFavorites);
}

export function checkFavoriteCity(city) {
    const favorites = getAllCities();
    return favorites.includes(city);
}

export function clearAllFavorites() {
    localStorage.removeItem(STORAGE_KEY_FAVORITES);
}