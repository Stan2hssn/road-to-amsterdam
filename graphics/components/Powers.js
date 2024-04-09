import { Group } from "three";

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
    Object.keys(this.Instances).forEach((key) => {
      this.Instances[key].render(t);
    });
  }

  resize(scale, height, width) {
    Object.keys(this.Instances).forEach((key) => {
      this.Instances[key].resize(scale, height, width);
    });
  }
}
