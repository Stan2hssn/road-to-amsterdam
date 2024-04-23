import {
  BufferGeometry,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  TextureLoader,
  Uniform,
  Float32BufferAttribute,
  Color,
  SRGBColorSpace,
} from "three";

import vertexShader from "../glsl/vertex.glsl";
import fragmentShader from "../glsl/fragment.glsl";
import CustomPlaneGeometry from "./CustomPlaneGeometry";
import Device from "../../../pure/Device";

export default class {
  params = {
    speed: 0,
    influence: 2,
  };

  constructor() {
    this.init();
  }

  init() {
    const geometry = new CustomPlaneGeometry(1, 1, 10).geometry;
    // const geometry = new PlaneGeometry(1, 1, 10, 10);
    console.log("this.geometry", geometry);

    const { speed, influence } = this.params;

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        uSpeed: new Uniform(speed),
        uInfluence: new Uniform(influence),
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true,
    });

    this.mesh = new Mesh(geometry, this.material);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    const newTimeValue = t / 60;
    if (this.mesh.material.uniforms.uTime.value !== newTimeValue) {
      this.mesh.material.uniforms.uTime.value = newTimeValue;
    }

    this.mesh.material.uniforms.uSpeed.value = Device.velocity;
  }

  resize() {}

  setDebug(debug) {
    debug
      .addBinding(this.params, "influence", {
        label: "Influence",
        min: -4,
        max: 4,
        step: 0.01,
      })
      .on("change", () => {
        this.material.uniforms.uInfluence.value = this.params.influence;
      });
  }
}
