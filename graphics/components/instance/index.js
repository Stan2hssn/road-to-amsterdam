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

  render(t) {}

  resize(scale) {
    const rect = this.$target.getBoundingClientRect();
    this.scale = scale;

    this.mesh.scale.set(rect.width * this.scale, rect.height * this.scale, 1.0);

    this.mesh.position.set(
      rect.left + rect.width * 0.5 - window.innerWidth / 2,
      -rect.top - rect.height / 2 + window.innerHeight / 2,
      0,
    );

    console.log(
      this.mesh.position.x,
      this.mesh.position.y,
      this.mesh.position.z,
    );
  }

  setDebug(debug) {}
}
