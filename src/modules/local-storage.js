const STORAGE_KEY_FAVORITES = "wetter-app:favorite-cities";

export function saveFavoriteCity(cityObj) {
    const favorites = getAllCities();
    if (!checkFavoriteCity(cityObj.id)) {
        favorites.push(cityObj);
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

export function deleteFavoriteCity(cityId) {
    const favorites = getAllCities();
    const updatedFavorites = favorites.filter((fav) => fav.id !== cityId);
    saveAllFavorites(updatedFavorites);
}

export function checkFavoriteCity(cityId) {
    if (!cityId) return false;
    const favorites = getAllCities();
    return favorites.some((fav) => fav.id === cityId);
}

export function clearAllFavorites() {
    localStorage.removeItem(STORAGE_KEY_FAVORITES);
}