import { Group } from "three";

import Common from "../Common";

import Lanterns from "./Lanterns/index";
import Water from "./Water/index";

export default class {
  Component = {};

  constructor() {
    this.init();
  }

  init() {
    this.Component.water = new Water();
    this.Component.Lanterns = new Lanterns();
  }

  dispose() {}

  render(t) {
    Object.keys(this.Component).forEach((key) => {
      if (typeof this.Component[key].render === "function") {
        this.Component[key].render(t);
      }
    });
  }

  resize() {}

  debug(pane) {
    Object.keys(this.Component).forEach((key) => {
      if (typeof this.Component[key].debug === "function") {
        this.Component[key].debug(pane);
      }
    });
  }
}
