const STORAGE_KEY_FAVORITES = "wetter-app:favorite-cities";

export function saveFavoriteCity(city) {
    const favorites = getAllCities();
    if (!checkFavoriteCity(city)) {
        favorites.push(city);
        writeToLocalStorage(favorites);
        return true;
    }
    return false;
}

export function getAllCities() {
    const data = localStorage.getItem(STORAGE_KEY_FAVORITES);
    return data ? JSON.parse(data) : [];
}

export function deleteFavoriteCity(city) {
    const favorites = getAllCities();
    const updatedFavorites = favorites.filter((fav) => fav !== city);
    writeToLocalStorage(updatedFavorites);
}

export function checkFavoriteCity(city) {
    const favorites = getAllCities();
    return favorites.includes(city);
}

function writeToLocalStorage(cities) {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(cities));
}
