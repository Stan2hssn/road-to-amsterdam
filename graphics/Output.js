import { WebGLRenderTarget } from "three";

import Common from "./Common";
import Powers from "./components/Powers";
import DepthOfField from "./postProcessing/DepthOfField";

import Controls from "./helpers/Controls";
import GridHelper from "./helpers/GridHelper";

import Device from "./pure/Device";

export default class {
  component = {};
  postComponent = {};
  helpers = {};

  constructor() {
    this.init();
  }

  init() {
    this.getRenderTargets();
    this.component.powers = new Powers();
    this.helpers.grid = new GridHelper(1000, 1000);
    // this.helpers.controls = new Controls();
    this.postComponent.dephtOfField = new DepthOfField(
      this.targets.dephtOfField,
    );
  }

  getRenderTargets() {
    this.targets = {
      mainRender: new WebGLRenderTarget(
        Device.viewport.width * Device.pixelRatio,
        Device.viewport.height * Device.pixelRatio,
      ),
      dephtOfField: new WebGLRenderTarget(
        Device.viewport.width * Device.pixelRatio,
        Device.viewport.height * Device.pixelRatio,
      ),
    };
  }

  render(t) {
    Object.keys(this.component).forEach((key) => {
      this.component[key].render(t);
    });

    Object.keys(this.helpers).forEach((key) => {
      if (typeof this.helpers[key].render === "function") {
        this.helpers[key].render();
      }
    });

    Common.rendererManager.renderer.setRenderTarget(this.targets.mainRender);
    Common.rendererManager.renderer.render(
      Common.sceneManager.scenes.instanceScene,
      Common.cameraManager.cameras.instanceCamera,
    );

    if (!this.postComponent) {
      Common.rendererManager.renderer.render(
        Common.sceneManager.scenes.mainScene,
        Common.cameraManager.cameras.mainCamera,
      );
    } else {
      this.postComponent.dephtOfField.render(t);
    }

    Common.rendererManager.renderer.setRenderTarget(null);
    Common.rendererManager.renderer.render(
      Common.sceneManager.scenes.mainScene,
      Common.cameraManager.cameras.mainCamera,
    );

    Common.rendererManager.renderer.setRenderTarget(this.targets.mainRender);
    Common.rendererManager.renderer.render(
      Common.sceneManager.scenes.instanceScene,
      Common.cameraManager.cameras.instanceCamera,
    );
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

  debug(pane) {
    if (pane === null) return;

    Object.keys(this.component).forEach((key) => {
      this.component[key].debug(pane);
    });

    Object.keys(this.helpers).forEach((key) => {
      if (typeof this.helpers[key].debug === "function") {
        this.helpers[key].debug(pane);
      }
    });

    if (this.postComponent) {
      Object.keys(this.postComponent).forEach((key) => {
        if (typeof this.postComponent[key].debug === "function") {
          this.postComponent[key].debug(pane);
        }
      });
    }
  }
}
