import {
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  DataTexture,
  RGBAFormat,
  FloatType,
  NearestFilter,
  Uniform,
  Vector2,
  Raycaster,
  MeshBasicMaterial,
  SphereGeometry,
} from "three";

import Common from "../../Common";
import Input from "../../Input";

import simVertex from "./glsl/simVertex.glsl";
import simFragment from "./glsl/simFragment.glsl";
import FBO from "./FBO";

import { Pane } from "tweakpane";

export default class {
  params = {
    size: 528,
    count: 528 ** 2,
    timeOffset: 100,
    mouseLength: 0.2,
  };
  constructor() {
    this.init();
  }

  init() {
    this.pane = new Pane();

    this.setDebug();
    this.setDataTexture();
    this.setInfoTexture();
    this.setRaycaster();

    this.setFBO();
  }

  setRaycaster() {
    this.raycaster = new Raycaster();

    this.dummy = new Mesh(
      new PlaneGeometry(100, 100, 1, 1),
      new MeshBasicMaterial({ color: 0xff0000 }),
    );

    this.ball = new Mesh(
      new SphereGeometry(0.1, 32, 32),
      new MeshBasicMaterial({ color: 0x00ff00 }),
    );
  }

  setDataTexture() {
    this.data = new Float32Array(this.params.size * this.params.size * 4);

    for (let i = 0; i < this.params.size; i++) {
      // Loop through the size of the data array
      for (let j = 0; j < this.params.size; j++) {
        // Donut shape
        const index = (i * this.params.size + j) * 4;
        const theta = Math.random() * Math.PI * 2;
        const r = 0.5 + Math.random() * 0;

        // Push the x, y, z, and w values to the data array
        this.data[index + 0] = Math.cos(theta) * r;
        this.data[index + 1] = Math.sin(theta) * r;
        this.data[index + 2] = 1;
        this.data[index + 3] = 1;
      }
    }

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
  }

  setInfoTexture() {
    this.info = new Float32Array(this.params.size * this.params.size * 4);

    for (let i = 0; i < this.params.size; i++) {
      // Loop through the size of the data array
      for (let j = 0; j < this.params.size; j++) {
        // Push the x, y, z, and w values to the data array
        const index = (i * this.params.size + j) * 4;

        this.info[index + 0] = 0.5 + Math.random();
        this.info[index + 1] = 0.5 + Math.random();
        this.info[index + 2] = 1;
        this.info[index + 3] = 1;
      }
    }

    this.infoTexture = new DataTexture(
      this.info,
      this.params.size,
      this.params.size,
      RGBAFormat,
      FloatType,
    );
    this.infoTexture.magFilter = NearestFilter;
    this.infoTexture.minFilter = NearestFilter;
    this.infoTexture.needsUpdate = true;
  }

  setFBO() {
    this.geometry = new PlaneGeometry(2, 2);

    this.particleMaterial = new ShaderMaterial({
      uniforms: {
        uInfo: { value: this.infoTexture },
        uPositions: { value: this.dataTexture },
        uMouse: new Uniform(new Vector2(Input.coords.x, Input.coords.y)),
        uTime: { value: this.params.timeOffset * 0.001 },
        mouseLength: new Uniform(this.params.mouseLength),
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
    if (!this.points) return;

    this.points.render(t * 0.01);

    const pointer = new Vector2(Input.coords.x, Input.coords.y);
    this.raycaster.setFromCamera(pointer, Common.camera);

    const intersects = this.raycaster.intersectObject(this.dummy, true);

    if (intersects.length > 0) {
      let { x, y } = intersects[0].point;
      this.ball.position.set(x / 1.25, y / 1.25, 1);

      this.particleMaterial.uniforms.uMouse.value = new Vector2(x, y);
    }

    this.particleMaterial.uniforms.uTime.value = t * 0.001;

    this.particleMaterial.uniforms.uPositions.value = Common.fbo1.texture;
    this.points.material.uniforms.uPositions.value = Common.fbo.texture;
  }

  resize() {}

  setDebug(debug) {
    const { debug: pane } = this;

    // this.pane.addFolder({
    //   title: "DaddyPane",
    //   expanded: false,
    // });

    // this.pane
    //   .addBinding(this.params, "mouseLength", {
    //     min: 0,
    //     max: 1,
    //     step: 0.01,
    //     label: "Size",
    //   })
    //   .on("change", (value) => {
    //     this.particleMaterial.uniforms.mouseLength.value = value;
    //     console.log("value", this.particleMaterial.uniforms.mouseLength.value);
    //   });
  }
}
