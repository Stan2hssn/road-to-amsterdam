import {
  Group,
  PlaneGeometry,
  Uniform,
  Vector2,
  ShaderMaterial,
  InstancedMesh,
  InstancedBufferAttribute,
  Object3D,
  DoubleSide,
} from "three";

import Common from "../Common";

import simulationVertex from "./simulation/glsl/vertex.glsl";
import simulationFragment from "./simulation/glsl/fragment.glsl";

export default class {
  constructor() {
    this.init();
  }

  setupMaterial() {
    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
      },
      vertexShader: simulationVertex,
      fragmentShader: simulationFragment,
      // wireframe: true,
      side: DoubleSide,
    });
  }

  setupHair() {
    this.geometry = new PlaneGeometry(0.01, 1, 1, 24);
    this.geometry.translate(0, 0.5, 0);

    this.iSize = 125;
    this.instances = this.iSize * this.iSize;

    this.instanceMesh = new InstancedMesh(
      this.geometry,
      this.material,
      this.instances,
    );

    let dummy = new Object3D();
    let w = 0.05;
    let z = 0.05;

    let instancedUv = new Float32Array(this.instances * 2);
    let instancedPosition = new Float32Array(this.instances * 3);
    let instancedScale = new Float32Array(this.instances * 3);

    for (let i = 0; i < this.iSize; i++) {
      for (let j = 0; j < this.iSize; j++) {
        instancedUv.set(
          [i / this.iSize, j / this.iSize],
          (i * this.iSize + j) * 2,
        );

        dummy.position.set(
          (i - this.iSize / 2) * w + Math.random() * 0.03,
          0,
          (j - this.iSize / 2) * z + Math.random() * 0.03,
        );

        instancedPosition.set(
          [dummy.position.x, dummy.position.y, dummy.position.z],
          (i * this.iSize + j) * 3,
        );

        instancedScale.set(
          [0, Math.random() * 0.9, 0],
          (i * this.iSize + j) * 3,
        );

        dummy.updateMatrix();
        this.instanceMesh.setMatrixAt(i * this.iSize + j, dummy.matrix);
      }
    }

    this.instanceMesh.instanceMatrix.needsUpdate = true;

    this.instanceMesh.geometry.setAttribute(
      "instancedUv",
      new InstancedBufferAttribute(instancedUv, 2),
    );

    this.instanceMesh.geometry.setAttribute(
      "instancedPosition",
      new InstancedBufferAttribute(instancedPosition, 3),
    );

    this.instanceMesh.geometry.setAttribute(
      "instancedScale",
      new InstancedBufferAttribute(instancedScale, 3),
    );

    console.log("this.instanceMesh", this.instanceMesh);

    Common.scene.add(this.instanceMesh);
    console.log("Common.scene", Common.scene.children);
  }

  init() {
    this.setupMaterial();
    this.setupHair();
  }

  dispose() {}

  render(t) {
    this.material.uniforms.uTime.value = t / 1000;
  }

  resize() {}
}
