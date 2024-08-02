import { FrontSide, Group, WebGLRenderTarget, BackSide } from "three";

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
      bubbles: {
        backSide: this.getRenderTarget(),
        frontSide: this.getRenderTarget(),
      },
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

    Common.renderer.setRenderTarget(this.targets.bubbles.backSide);
    Common.renderer.render(Common.scene, Common.cameras.MainCamera);

    this.Component.Balls.ballMaterial.side = BackSide;

    this.Component.Balls.ballMaterial.uniforms.tTransmission.value =
      this.targets.bubbles.backSide.texture;

    this.Component.Balls.ballMaterial.visible = true;

    Common.renderer.setRenderTarget(this.targets.bubbles.frontSide);
    Common.renderer.render(Common.scene, Common.cameras.MainCamera);

    this.Component.Balls.ballMaterial.uniforms.tTransmission.value =
      this.targets.bubbles.frontSide.texture;

    this.Component.Balls.ballMaterial.side = FrontSide;

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
      if (this.targets[key].texture) {
        this.targets[key].setSize(
          Device.viewport.width * Device.pixelRatio,
          Device.viewport.height * Device.pixelRatio,
        );
      } else {
        Object.keys(this.targets[key]).forEach((subKey) => {
          this.targets[key][subKey].setSize(
            Device.viewport.width * Device.pixelRatio,
            Device.viewport.height * Device.pixelRatio,
          );
        });
      }
    });
  }

  debug(pane) {
    Object.keys(this.Component).forEach((key) => {
      this.Component[key].debug(pane);
    });
  }
}
