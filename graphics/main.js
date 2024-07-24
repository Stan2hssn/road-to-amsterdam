import App from "./index.js";

let app = null;

function onMounted() {
  const canvas = document.getElementById("web_gl");
  const scrollContainer = document.querySelector(".scroll-container");

  if (!canvas && !scrollContainer) {
    console.error("Canvas element not found");
    return;
  }

  app = new App({ canvas, scrollContainer }); // Ensure you're passing an object with a canvas property
  app.render();
}

document.addEventListener("DOMContentLoaded", onMounted, true);
