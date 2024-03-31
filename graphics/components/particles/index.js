import {
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  DataTexture,
  RGBAFormat,
  FloatType,
  NearestFilter,
} from "three";

import Common from "../../Common";

import simVertex from "./glsl/simVertex.glsl";
import simFragment from "./glsl/simFragment.glsl";
import FBO from "./FBO";

export default class {
  params = {
    size: 256,
    count: 256 ** 2,
  };
  constructor() {
    this.init();
  }

  init() {
    this.data = new Float32Array(this.params.size * this.params.size * 4);

    for (let i = 0; i < this.params.size; i++) {
      // Loop through the size of the data array
      for (let j = 0; j < this.params.size; j++) {
        // Donut shape
        const index = (i * this.params.size + j) * 4;
        const theta = Math.random() * Math.PI * 2;
        const r = 0.5 + Math.random() * 0.5;

        // Push the x, y, z, and w values to the data array
        this.data[index + 0] = Math.cos(theta) * r;
        this.data[index + 1] = Math.sin(theta) * r;
        this.data[index + 2] = 1;
        this.data[index + 3] = 1;
      }
    }

    this.geometry = new PlaneGeometry(2, 2);

    this.dataTexture = new DataTexture(
      this.data,
      this.params.size,
      this.params.size,
      RGBAFormat,
      FloatType,
    );
    this.dataTexture.magFilter = NearestFilter;
    this.dataTexture.minFilter = NearestFilter;
    this.dataTexture.needsUpdate = true;

    this.setFBO();
  }

  setFBO() {
    this.particleMaterial = new ShaderMaterial({
      uniforms: {
        uPositions: { value: this.dataTexture },
        uTime: { value: 0 },
      },
      vertexShader: simVertex,
      fragmentShader: simFragment,
      side: 2,
    });

    this.mesh = new Mesh(this.geometry, this.particleMaterial);

    this.points = new FBO(
      this.params.size,
      this.params.count,
      this.dataTexture,
    );

    Common.fboScene.add(this.mesh);
    Common.scene.add(this.points.particles);

    Common.renderer.setRenderTarget(Common.fbo);
    Common.renderer.render(Common.fboScene, Common.fboCamera);

    Common.renderer.setRenderTarget(Common.fbo1);
    Common.renderer.render(Common.fboScene, Common.fboCamera);
  }

  dispose() {}

  updateFBO(t) {
    this.points.render(t);
    this.particleMaterial.uniforms.uTime.value = t;

    this.particleMaterial.uniforms.uPositions.value = Common.fbo1.texture;
    this.points.material.uniforms.uPositions.value = Common.fbo.texture;

    Common.renderer.setRenderTarget(Common.fbo);
    Common.renderer.render(Common.fboScene, Common.fboCamera);

    Common.renderer.setRenderTarget(null);
    Common.renderer.render(Common.scene, Common.camera);

    const temp = Common.fbo;
    Common.fbo = Common.fbo1;
    Common.fbo1 = temp;
  }

  resize() {}

  setDebug(debug) {}
}
