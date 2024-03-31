import { Group } from "three";

import Common from "../Common";

import Points from "./particles/index.js";
// import Cube from "./Points/Cube";

export default class {
  Points = {};

  constructor() {
    this.init();
  }

  init() {
    this.PointsGroup = new Group();

    this.Points.points = new Points();
    // this.Points.Cube = new Cube(0, 1.2, 0);

    Object.keys(this.Points).forEach((key) => {
      this.PointsGroup.add(this.Points[key].instance);
    });

    Common.scene.add(this.PointsGroup);
  }

  dispose() {}

  render(t) {
    Object.keys(this.Points).forEach((key) => {
      this.Points[key].render(t);
    });
  }

  resize() {}
}
