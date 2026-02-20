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
