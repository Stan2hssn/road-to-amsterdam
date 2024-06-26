import { Group, Vector2 } from "three";

import Common from "../Common";

import Instance from "./instances/index";

export default class {
  Instances = {};
  constructor() {
    const $target = null;
    this.init();
  }

  init() {
    this.InstancesGroup = new Group();

    this.$target = document.querySelectorAll(".object");

    this.$target.forEach((el, index) => {
      const geometryAttribut = el.getAttribute("geometry");

      this.instance = new Instance(this.$target[index], geometryAttribut);
      this.Instances[index] = this.instance;
    });

    Object.keys(this.Instances).forEach((_) => {
      this.InstancesGroup.add(this.Instances[_].mesh);
    });

    Common.scene.add(this.InstancesGroup);
  }

  dispose() {}

  render(t) {
    if (!t) return;

    Object.keys(this.Instances).forEach((key) => {
      this.Instances[key].render(t);
    });

    Common.renderer.setRenderTarget(Common.renderTarget);
    Common.renderer.render(Common.preScene, Common.preCamera);

    Common.renderer.setRenderTarget(Common.targetA);
    Common.renderer.render(Common.fboScene, Common.fboCamera);
    Common.fboMaterial.uniforms.tDiffuse.value = Common.renderTarget.texture;
    Common.fboMaterial.uniforms.tPrev.value = Common.targetA.texture;

    Common.renderer.setRenderTarget(null);
    Common.renderer.render(Common.preScene, Common.preCamera);
    Common.renderer.render(Common.fboScene, Common.fboCamera);
    // Common.renderer.render(Common.scene, Common.camera);

    let temp = Common.targetA;
    Common.targetA = Common.targetB;
    Common.targetB = temp;
  }

  resize(scale, height, width) {
    Object.keys(this.Instances).forEach((key) => {
      this.Instances[key].resize(scale, height, width);
    });
  }

  setDebug(debug) {
    Object.keys(this.Instances).forEach((key) => {
      this.Instances[key].setDebug(debug);
    });
  }
}
