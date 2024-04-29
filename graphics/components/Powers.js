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
  Mesh,
} from "three";

import Common from "../Common";

import simulationVertex from "./simulation/glsl/vertex.glsl";
import simulationFragment from "./simulation/glsl/fragment.glsl";

export default class {
  params = {
    width: 0.05,
    height: 0.5,
    w: 0.5,
    z: 0.02,
    xLength: 100,
    zLength: 100,
  };

  constructor() {
    this.width = this.params.width;
    this.height = this.params.height;
    this.xLength = this.params.xLength;
    this.zLength = this.params.zLength;
    this.w = this.params.w;
    this.z = this.params.z;

    this.normalizerX = (this.xLength / 2) * this.w;
    this.normalizerZ = (this.zLength / 2) * this.z;

    this.init();
  }

  setupMaterial() {
    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        uNorm: new Uniform(new Vector2(this.normalizerX, this.normalizerZ)),
      },
      vertexShader: simulationVertex,
      fragmentShader: simulationFragment,
      // wireframe: true,
      side: DoubleSide,
    });
  }

  setupHair() {
    this.geometry = new PlaneGeometry(this.width, this.height, 1, 24);
    this.geometry.translate(0, this.height / 2, 0);

    this.instances = this.xLength * this.xLength;

    this.instanceMesh = new InstancedMesh(
      this.geometry,
      this.material,
      this.instances,
    );

    let dummy = new Object3D();

    this.normalizerX = this.xLength * ((this.width / 2) * this.w);
    this.normalizerZ = this.zLength * ((this.width / 2) * this.z);

    let instancedUv = new Float32Array(this.instances * 2);
    let instancedPosition = new Float32Array(this.instances * 3);
    let instancedScale = new Float32Array(this.instances * 3);
    let instancedNorm = new Float32Array(this.instances * 3);

    for (let i = 0; i < this.xLength; i++) {
      for (let j = 0; j < this.zLength; j++) {
        instancedUv.set(
          [i / this.xLength, j / this.xLength],
          (i * this.xLength + j) * 2,
        );

        dummy.position.set(
          (i - this.xLength / 2 + Math.random()) * this.w,
          0,
          (j - this.zLength / 2) * this.z,
        );

        instancedScale.set(
          [1, j * 0.01, 1],
          // [1, 1, 1],
          (i * this.xLength + j) * 3,
        );

        instancedPosition.set(
          [dummy.position.x, dummy.position.y, dummy.position.z],
          (i * this.xLength + j) * 3,
        );

        instancedNorm.set(
          [this.normalizerX, 0, this.normalizerZ],
          (i * this.xLength + j) * 3,
        );

        dummy.updateMatrix();
        this.instanceMesh.setMatrixAt(i * this.xLength + j, dummy.matrix);
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

    this.debug = new PlaneGeometry(1, 1, 1, 1);
    this.debug.rotateX(-Math.PI * 0.5);

    this.debugMaterial = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {

          vec2 st = vUv;
          // st.x -= 0.5;
          
          float y = sin(st.x * 3.1415);
          y *= pow(cos(st.y * 1.5708), .5);
  
          float s = step(0.5, y);
          // vec3 color = mix(vec3(.9), vec3(0.914, 0.588, 0.757), 1. - s);
      
          gl_FragColor = vec4(vec3(s), 1.0);
        }
      `,
    });

    this.debugMesh = new Mesh(this.debug, this.debugMaterial);

    // Common.scene.add(this.debugMesh);
  }

  dispose() {}

  render(t) {
    this.material.uniforms.uTime.value = t / 1000;
  }

  resize() {}
}
