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
  MeshBasicMaterial,
  Uniform,
  Color,
} from "three";

import gsap from "gsap";

import CustomEase from "gsap/CustomEase";
import ModelLoader from "./ModelLoader";

import ring from "/Models/anneau.glb";

import vertexModel from "./glsl/vertexModel.glsl";
import fragmentModel from "./glsl/fragmentModel.glsl";

import Common from "../Common";
import Device from "../pure/Device";
import cnoise from "./extends/cnoise";
import Input from "../Input";

export default class Powers {
  Ring = ring;

  FirstRing = {};

  Scale = {
    0: 1,
    1: 10,
    2: 100,
  };

  params = {
    position: { x: 0, y: 0, z: 0 },
    size: 10,
    factor: 1,
    length: 10,
    background: new Color(Common.params.sceneColor),
    primary: new Color(0x010446),
    secondary: new Color(0x9592b3),
    greyFilter: new Color(0.22, 0.19, 0.0),
  };

  constructor() {
    this.init();
  }

  ease(t) {
    function bezier(t, p0, p1, p2, p3) {
      const cX = 3 * (p1.x - p0.x);
      const bX = 3 * (p2.x - p1.x) - cX;
      const aX = p3.x - p0.x - cX - bX;

      const cY = 3 * (p1.y - p0.y);
      const bY = 3 * (p2.y - p1.y) - cY;
      const aY = p3.y - p0.y - cY - bY;

      const x = aX * t * t * t + bX * t * t + cX * t + p0.x;
      const y = aY * t * t * t + bY * t * t + cY * t + p0.y;

      return y;
    }

    return (
      1 -
      bezier(
        t,
        { x: 0, y: 0 },
        { x: 0, y: 0.8 },
        { x: 0.299, y: 0.891 },
        { x: 1, y: 1 },
      )
    );
  }

  clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  init() {
    gsap.registerPlugin(CustomEase);

    // this.setMaterial();
    this.setModel(this.Scale[0]);
    this.setModel(this.Scale[1]);
    this.setModel(this.Scale[2]);

    console.log("tl", this.tl);
  }

  setModel(scale) {
    this.group = new Group();

    this.FirstRing.xs = new ModelLoader(
      this.Ring,
      0,
      0,
      0,
      scale,
      scale,
      scale,
    );

    this.FirstRing.xs.load().then((gltfScene) => {
      gltfScene.children.forEach((cell, i) => {
        this.material = new ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uTexture: {
              value: new TextureLoader().load("/Models/ring_0.png"),
            },
            uPosition: {
              value: new Vector3(
                cell.position.x,
                cell.position.y,
                cell.position.z,
              ),
            },
            uModelPosition: {
              value: new Vector3(
                gltfScene.position.x,
                gltfScene.position.y,
                gltfScene.position.z,
              ),
            },
            uResolution: { value: new Vector2(Device.width, Device.height) },
            uFactor: { value: 0.0 },
            uId: new Uniform(),
            uPrimary: { value: this.params.primary },
            uSecondary: { value: this.params.secondary },
            uBackground: { value: this.params.background },
            uGrey: { value: this.params.greyFilter },
          },
          vertexShader: vertexModel,
          fragmentShader: fragmentModel,
        });

        cell.material = this.material;
      });
      this.group.add(gltfScene);
    });

    Common.scene.add(this.group);
  }

  dispose() {}

  render(t) {
    t /= 1000;

    const time = t * 0.25;
    const v = Math.max(Input.velocity * 50, -0.3);

    console.log("v", v);

    let s = this.ease((time / (-v + 1)) % 1) * 9 + 1;
    s = this.clamp(s, 1, 10);

    this.group.children.forEach((_, i) => {
      _.children.forEach((cell, j) => {
        cell.material.uniforms.uTime.value = s;
        cell.material.uniforms.uPosition.value = new Vector3(
          (cell.position.x / _.children.length) * this.Scale[i],
          (cell.position.y / _.children.length) * this.Scale[i],
          (cell.position.z / _.children.length) * this.Scale[i],
        );
        cell.material.uniforms.uId.value = i / _.children.length;
        cell.material.uniforms.uFactor.value = this.params.factor;
        cell.material.uniforms.uModelPosition.value = new Vector3(
          _.position.x,
          _.position.y,
          _.position.z,
        );
      });

      _.scale.set(this.Scale[i] * s, 1, this.Scale[i] * s);
    });
  }

  resize() {}

  debug(debug) {
    const { debug: pane } = this;

    debug.addBinding(this.params, "position", {
      min: -10,
      max: 10,
    });

    debug.addBinding(this.params, "factor", {
      min: 0,
      max: 10,
    });

    debug.addBinding(this.params, "greyFilter", {
      min: 0,
      max: 1,
      color: { type: "float" },
    });
    debug.addBinding(this.params, "primary", {
      min: 0,
      max: 1,
      color: { type: "float" },
    });
    debug.addBinding(this.params, "secondary", {
      min: 0,
      max: 1,
      color: { type: "float" },
    });
    debug.addBinding(this.params, "background", {
      min: 0,
      max: 1,
      color: { type: "float" },
    });
  }
}
