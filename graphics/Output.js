import Powers from "./components/Powers";
import Controls from "./helpers/Controls";
import GridHelper from "./helpers/GridHelper";
import Particles from "./components/particles/index.js";
import Common from "./Common.js";

export default class {
  component = {};
  helpers = {};

  constructor() {
    this.init();
  }

  init() {
    this.component.particles = new Particles();

    this.helpers.controls = new Controls();
    this.helpers.grid = new GridHelper(1, 10);
  }

  render(t) {
    Object.keys(this.helpers).forEach((key) => {
      if (typeof this.helpers[key].render === "function") {
        this.helpers[key].render();
      }
    });

    this.component.particles.updateFBO(t);
  }

  dispose() {
    Object.keys(this.component).forEach((key) => {
      this.component[key].dispose();
    });

    Object.keys(this.helpers).forEach((key) => {
      this.helpers[key].dispose();
    });
  }

  resize() {
    Object.keys(this.component).forEach((key) => {
      this.component[key].resize();
    });
  }
}
