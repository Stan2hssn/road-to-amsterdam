import Common from './Common';
import Powers from './components/Powers';
import GridHelper from './helpers/GridHelper';
import Device from './pure/Device';

export default class {
  component = {};
  helpers = {};

  constructor() {
    this.init();
  }

  init() {
    this.component.powers = new Powers();
    // this.helpers.controls = new Controls();
    this.helpers.grid = new GridHelper(10, 10);
  }

  render(t) {
    Object.keys(this.component).forEach((key) => {
      this.component[key].render(t);
    });

    Object.keys(this.helpers).forEach((key) => {
      if (typeof this.helpers[key].render === 'function') {
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
  }

  resize() {
    Object.keys(this.component).forEach((key) => {
      this.component[key].resize(
        Common.scale,
        Device.viewport.height,
        Device.viewport.width,
      );
    });
  }
}
