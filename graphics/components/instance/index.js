import Device from '../../pure/Device';
import Box from './instances/Box';
import Sphere from './instances/Sphere';
import Torus from './instances/Torus';

export default class {
  constructor($target, geometry) {
    this.$target = $target;
    this.geometry = geometry;

    this.scale = 1;

    this.geometryInstancer = {
      Box: Box,
      Sphere: Sphere,
      Torus: Torus,
    };

    this.init();
  }

  init() {
    const GeometryClass = this.geometryInstancer[this.geometry];
    if (GeometryClass) {
      this.instance = new GeometryClass();
      this.mesh = this.instance.mesh;
    } else {
      console.error(this.geometry);
    }
  }

  dispose() {}

  render(t) {
    // this.mesh.rotation.x = Math.sin(t / 500);
    // this.mesh.rotation.y = Math.cos(t / 500);
  }

  resize(scale, height, width) {
    const rect = this.$target.getBoundingClientRect();
    this.scale = scale;
    this.height = height;
    this.width = width;

    this.mesh.scale.set(rect.width * this.scale, rect.height * this.scale, 1.0);

    this.mesh.position.set(
      rect.left + rect.width * 0.5 - this.width * 0.5,
      -rect.top - Device.scrollTop - rect.height * 0.5 + this.height * 0.5,
      0,
    );
  }

  setDebug(debug) {}
}
