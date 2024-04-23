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
  }

  setDebug(debug) {
    this.instance.setDebug(debug);
  }
}
