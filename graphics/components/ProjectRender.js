import {
  MeshBasicMaterial,
  Plane,
  ShaderMaterial,
  Uniform,
  Mesh,
  PlaneGeometry,
  Vector2,
} from "three";

import Input from "../Input";
import Device from "../pure/Device";

export default class {
  constructor(id) {
    this.id = -id * 1.5;
  }

  render(t) {}

  resize() {}

  setDebug(debug) {}
}
