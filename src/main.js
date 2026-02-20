import "./main.scss";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Wetter App 2026 geladen");
  // API-Calls
});

document.addEventListener("DOMContentLoaded", () => {
  const scrollList = document.querySelector(".today-forecast__list");

  if (scrollList) {
    scrollList.addEventListener("wheel", (event) => {
      if (event.deltaY !== 0) {
        event.preventDefault();
        scrollList.scrollLeft += event.deltaY;
      }
    });
  }
});

// @@WFA: Funktion für eine künstliche Verzögerung -- SPÄTER ENTFERNEN!
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function simulateLoading() {
  console.log("Wetterdaten werden geladen...");

  await sleep(3000);

  const loaders = document.querySelectorAll('.is-loading');
  loaders.forEach(el => el.classList.remove('is-loading'));
}
simulateLoading();