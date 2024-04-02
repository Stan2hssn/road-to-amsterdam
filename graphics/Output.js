import Controls from "./helpers/Controls";
import GridHelper from "./helpers/GridHelper";
import Particles from "./components/particles/index.js";
import Artemis from "./components/Artemis.js";
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
    // this.helpers.grid = new GridHelper(1, 10);
  }

  render(t) {
    const deltaTime = t.toFixed(3);
    this.lastRenderTime = t;

    this.component.particles.updateFBO(deltaTime);

    Object.keys(this.helpers).forEach((key) => {
      if (typeof this.helpers[key].render === "function") {
        this.helpers[key].render();
      }
    });

    Common.renderer.setRenderTarget(Common.fbo);
    Common.renderer.render(Common.fboScene, Common.fboCamera);

    Common.renderer.setRenderTarget(null);
    Common.renderer.render(Common.scene, Common.camera);

    const temp = Common.fbo;
    Common.fbo = Common.fbo1;
    Common.fbo1 = temp;
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
      if (typeof this.component[key].resize === "function") {
        this.component[key].resize();
      }
    });
  }
}
