import {
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  ShaderMaterial,
  Vector4,
  BufferGeometry,
  BufferAttribute,
  Points,
} from "three";

import vertexParticles from "./glsl/vertexParticles.glsl";
import fragmentParticles from "./glsl/fragmentParticles.glsl";

export default class {
  constructor(size, count, dataTexture) {
    this.size = size;
    this.count = count;

    this.dataTexture = dataTexture;

    this.init();
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.createParticles();
  }

  createParticles() {
    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPositions: { value: null },
        uResolution: { value: new Vector4() },
      },
      vertexShader: vertexParticles,
      fragmentShader: fragmentParticles,
      transparent: true,
    });

    const geometry = new BufferGeometry();

    let positions = new Float32Array(this.count * 3);
    let uv = new Float32Array(this.count * 2);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        let index = i * this.size + j;
        positions[index * 3 + 0] = Math.random();
        positions[index * 3 + 1] = Math.random();
        positions[index * 3 + 2] = 0;
        uv[index * 2 + 0] = j / this.size;
        uv[index * 2 + 1] = i / this.size;
      }
    }

    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new BufferAttribute(uv, 2));

    this.material.uniforms.uPositions.value = this.dataTexture;

    this.particles = new Points(geometry, this.material);
    this.particles.frustumCulled = false;
  }

  render(time) {
    this.material.uniforms.uTime.value = time;
  }

  dispose() {
    this.points.points.dispose();
    this.points.material.dispose();
  }

  resize() {}
}
