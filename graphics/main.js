import App from './index.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('#web_gl');
  const app = new App({ canvas });
  app.render();
});
