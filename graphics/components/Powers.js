import { Group, WebGLRenderTarget } from "three";

import Common from "../Common";
import Content from "./content.js";
import Balls from "./balls.js";
import Device from "../pure/Device.js";

export default class {
  Component = {};

  constructor() {
    this.init();
  }

  init() {
    this.setupPipeline();

    this.ComponentGroup = new Group();
    this.Component.Content = new Content();
    this.Component.Balls = new Balls();
  }

  getRenderTarget() {
    return new WebGLRenderTarget(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height * Device.pixelRatio,
    );
  }

  setupPipeline() {
    this.targets = {
      bubbles: this.getRenderTarget(),
    };
  }

  dispose() {
    Object.values(this.targets).forEach((target) => target.dispose());
  }

  render(t) {
    Object.keys(this.Component).forEach((key) => {
      if (typeof this.Component[key].render === "function") {
        this.Component[key].render(t);
      }
    });

    // Ensure ballMaterial and texture are properly set up
    this.Component.Balls.ballMaterial.visible = false;

    Common.renderer.setRenderTarget(this.targets.bubbles);
    Common.renderer.render(Common.scene, Common.cameras.MainCamera);

    this.Component.Balls.ballMaterial.uniforms.tTransmission.value =
      this.targets.bubbles.texture;

    this.Component.Balls.ballMaterial.visible = true;

    Common.renderer.setRenderTarget(null);
    Common.renderer.render(Common.scene, Common.cameras.MainCamera);
  }

  resize(scale, height, width) {
    Object.keys(this.Component).forEach((key) => {
      if (typeof this.Component[key].resize === "function") {
        this.Component[key].resize(scale, height, width);
      }
    });

    Object.keys(this.targets).forEach((key) => {
      this.targets[key].setSize(
        Device.viewport.width * Device.pixelRatio,
        Device.viewport.height * Device.pixelRatio,
      );
    });
  }
}
