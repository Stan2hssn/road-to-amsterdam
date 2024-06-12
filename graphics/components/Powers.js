import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  ShaderMaterial,
  TextureLoader,
  Mesh,
  Vector2,
  Vector3,
  Group,
  InstancedMesh,
  InstancedBufferAttribute,
} from "three";

import ModelLoader from "./ModelLoader";

import ring0 from "/Models/ring_0.glb";
import ring1 from "/Models/ring_1.glb";
import ring2 from "/Models/ring_2.glb";
import ring3 from "/Models/ring_3.glb";

import vertexModel from "./glsl/vertexModel.glsl";
import fragmentModel from "./glsl/fragmentModel.glsl";

import Common from "../Common";
import Device from "../pure/Device";
import { log } from "three/examples/jsm/nodes/Nodes.js";

export default class Powers {
  Ring = {
    0: ring0,
    1: ring1,
    2: ring2,
    3: ring3,
  };

  FirstRing = {};

  params = {
    position: { x: 0, y: 0, z: 0 },
    factor: 0,
  };

  constructor() {
    this.init();
  }

  init() {
    this.setMaterial();
    this.setModel(1);
    this.setModel(10);
    this.setModel(100);
  }

  setModel(scale) {
    this.instances = Object.keys(this.Ring).length;

    this.firstGroup = new Group();

    this.FirstRing.xs = new ModelLoader(
      this.Ring[0],
      0,
      0,
      0,
      scale,
      scale,
      scale,
    );
    this.FirstRing.md = new ModelLoader(
      this.Ring[1],
      0,
      0,
      0,
      scale,
      scale,
      scale,
    );

    this.FirstRing.lg = new ModelLoader(
      this.Ring[2],
      0,
      0,
      0,
      scale,
      scale,
      scale,
    );

    this.FirstRing.xl = new ModelLoader(
      this.Ring[3],
      0,
      0,
      0,
      scale,
      scale,
      scale,
    );

    let positions = [];
    let instanceCount = 0;

    Object.keys(this.FirstRing).forEach((key) => {
      this.FirstRing[key].load().then((gltfScene) => {
        gltfScene.traverse((child) => {
          if (child.isMesh) {
            this.geometry = child.geometry;

            this.mesh = new Mesh(this.geometry, this.material);
            positions.push(
              child.position.x,
              child.position.y,
              child.position.z,
            );

            const instancedPosition = new Float32Array(positions);

            this.mesh.geometry.setAttribute(
              "instancedPosition",
              new InstancedBufferAttribute(instancedPosition, 3),
            );

            this.mesh.position.set(
              child.position.x,
              child.position.y,
              child.position.z,
            );

            this.firstGroup.add(this.mesh);
          }
        });

        Common.scene.add(this.firstGroup);
      });
    });
  }

  setMaterial() {
    const { position } = this.params;

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTransformed: {
          value: new Vector3(position.x, position.y, position.z),
        },
        uTexture: {
          value: new TextureLoader().load("/Models/ring_0.png"),
        },
        uPosition: { value: new Vector3(0, 0, 0) },
        uResolution: { value: new Vector2(Device.width, Device.height) },
        uFactor: { value: 0.0 },
      },
      vertexShader: vertexModel,
      fragmentShader: fragmentModel,
    });
  }

  dispose() {}

  render(t) {
    t /= 1000;
    this.material.uniforms.uTime.value = t;
  }

  resize() {}

  debug(debug) {
    const { debug: pane } = this;

    debug
      .addBinding(this.params, "position", {
        min: -10,
        max: 10,
      })
      .on("change", (v) => {
        this.material.uniforms.uTransformed.value = new Vector3(
          this.params.position.x,
          this.params.position.y,
          this.params.position.z,
        );
      });

    debug
      .addBinding(this.params, "factor", {
        min: 0,
        max: 1,
      })
      .on("change", (v) => {
        this.material.uniforms.uFactor.value = this.params.factor;
      });
  }
}
