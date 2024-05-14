import Powers from "./components/Powers";
import Controls from "./helpers/Controls";
import GridHelper from "./helpers/GridHelper";
import postProcessing from "./post-processing";

export default class {
  component = {};
  helpers = {};
  processing = {};

  constructor() {
    this.init();
  }

  init() {
    this.component.powers = new Powers();
    // this.helpers.controls = new Controls();
    this.processing.postProcessing = new postProcessing();
    // this.helpers.grid = new GridHelper(10, 10);
  }

  render(t) {
    Object.keys(this.component).forEach((key) => {
      this.component[key].render(t);
    });

    Object.keys(this.processing).forEach((key) => {
      this.processing[key].render(t);
    });

    Object.keys(this.helpers).forEach((key) => {
      if (typeof this.helpers[key].render === "function") {
        this.helpers[key].render();
      }
    });
  }

  dispose() {
    Object.keys(this.component).forEach((key) => {
      this.component[key].dispose();
    });
    Object.keys(this.helpers).forEach((key) => {
      this.helpers[key].dispose();
    });

    Object.keys(this.processing).forEach((key) => {
      this.processing[key].dispose();
    });
  }

  resize() {
    Object.keys(this.component).forEach((key) => {
      this.component[key].resize();
    });

    Object.keys(this.processing).forEach((key) => {
      this.processing[key].resize();
    });
  }
}
