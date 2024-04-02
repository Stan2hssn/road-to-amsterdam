import {
  Raycaster,
  Vector2,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  SphereGeometry,
} from "three";

import Common from "../Common";
import Input from "../Input";

export default class Artemis {
  constructor() {
    this.raycaster = new Raycaster();

    this.init();
  }

  init() {}

  render() {
    // console.log("intersects", intersects);
  }
}
