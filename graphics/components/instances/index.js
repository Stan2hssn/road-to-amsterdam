import { Uniform, Vector2 } from "three";

import Device from "../../pure/Device";
import Plane from "./instanceObject/Plane";

export default class {
  constructor($target, geometry) {
    this.$target = $target;
    this.geometry = geometry;

    this.scale = 1;

    this.geometryInstancer = {
      Plane: Plane,
    };

    this.init();
  }

  init() {
    const GeometryClass = this.geometryInstancer[this.geometry];

    if (GeometryClass) {
      this.instance = new GeometryClass();

      this.mesh = this.instance.mesh;
    } else {
      console.log("error, there's no geometry");
    }
  }

  dispose() {}

  render(t) {
    this.instance.render(t);
  }

  resize(scale, height, width) {
    const rect = this.$target.getBoundingClientRect();
    this.scale = scale;
    this.height = height;
    this.width = width;

    this.mesh.scale.set(
      rect.width * this.scale,
      rect.height * this.scale,
      rect.width * this.scale,
    );

    this.mesh.position.set(
      rect.left + rect.width * 0.5 - this.width * 0.5,
      -rect.top - Device.scrollTop - rect.height * 0.5 + this.height * 0.5,
      0,
    );

    this.mesh.material.uniforms.uResolution.value = new Uniform(
      new Vector2(Device.viewport.width, Device.viewport.height).multiplyScalar(
        Device.pixelRatio,
      ),
    );

    console.log(this.mesh.material.uniforms.uResolution.value);

    this.mesh.material.uniforms.uRes.value.set(this.width, this.height);

    Object.keys(this.instance).forEach((key) => {
      if (typeof this.instance[key].resize === "function") {
        this.instance[key].resize(scale, height, width);
      }
    });
  }

  setDebug(debug) {
    this.instance.setDebug(debug);
  }
}
