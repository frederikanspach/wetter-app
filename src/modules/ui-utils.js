export function setupHorizontalScroll() {
    const scrollList = document.querySelector(".today-forecast__list");

    if (scrollList) {
        scrollList.addEventListener("wheel", (event) => {
            if (event.deltaY !== 0) {
                event.preventDefault();
                scrollList.scrollLeft += event.deltaY;
            }
        });
    }
};

export function clearApp() {
    const app = document.getElementById("app");
    app.innerHTML = "";
    return app;
}

export function formatTemp(temp) {
    return `${Math.round(temp)}`;
}

export function removeSkeletons() {
    const loaders = document.querySelectorAll('.is-loading');
    loaders.forEach(el => el.classList.remove('is-loading'));
}

export function convertTo24h(timeStr) {
    if (!timeStr) return "--:--";

    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    let h = parseInt(hours, 10);

    if (modifier === 'PM' && h < 12) {
        h += 12;
    } else if (modifier === 'AM' && h === 12) {
        h = 0;
    }

    return `${h.toString().padStart(2, '0')}:${minutes}`;
}
