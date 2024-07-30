import { Group } from "three";

import Common from "../Common";
import Content from "./content.js";
import Balls from "./balls.js";

export default class {
  Component = {};

  constructor() {
    this.init();
  }

  init() {
    this.ComponentGroup = new Group();
    this.Component.Content = new Content();
    this.Component.Balls = new Balls();

    // Common.scene.add(this.ComponentGroup);
  }

  dispose() {}

  render(t) {
    Object.keys(this.Component).forEach((key) => {
      this.Component[key].render(t);
    });
  }

  resize(scale, height, width) {
    Object.keys(this.Component).forEach((key) => {
      if (typeof this.Component[key].resize === "function") {
        this.Component[key].resize(scale, height, width);
      }
    });
  }
}
