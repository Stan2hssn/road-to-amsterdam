import {
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  TextureLoader,
  Uniform,
} from "three";

import vertexShader from "../glsl/vertex.glsl";
import fragmentShader from "../glsl/fragment.glsl";

export default class {
  params = {
    basic: 0,
  };

  constructor() {
    this.init();
  }

  init() {
    this.geometry = new PlaneGeometry(1, 1, 16, 16);

    const { basic } = this.params;

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        default: new Uniform(basic),
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true,
    });

    this.mesh = new Mesh(this.geometry, this.material);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    this.mesh.material.uniforms.uTime.value = t / 60;
  }

  resize() {}
}
