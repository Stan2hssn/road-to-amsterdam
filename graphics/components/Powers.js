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
import Input from "../Input";

import Water from "/Texture/water.webp";
import Noise from "/Texture/veronoi_color.jpg";

export default class Powers {
  Ring = ring;

  Images = {
    water: Water,
    noise: Noise,
  };

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
    primary: new Color(0x011123),
    secondary: new Color(0x155f5a),
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
    this.getImages();
    this.setModel(this.Scale[0]);
    this.setModel(this.Scale[1]);
    this.setModel(this.Scale[2]);

    console.log("tl", this.tl);
  }

  getImages() {
    this.loader = new TextureLoader();

    this.textures = {
      water: this.loader.load(this.Images.water),
      noise: this.loader.load(this.Images.noise),
    };
    this.textures.flipY = false;
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
            uLinearTime: { value: 0 },
            uWater: {
              value: this.textures.water,
            },
            uNoise: {
              value: this.textures.noise,
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
            winResolution: new Uniform(
              new Vector2(
                Device.viewport.width,
                Device.viewport.height,
              ).multiplyScalar(Device.pixelRatio),
            ),
            uFactor: { value: 0.0 },
            uId: new Uniform(),
            uPrimary: { value: this.params.primary },
            uSecondary: { value: this.params.secondary },
            uBackground: { value: this.params.background },
            uGrey: { value: this.params.greyFilter },
            uMouse: { value: new Vector2(0, 0) },
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

    const normalizedTime = 0.25; // A constant rate factor for time progression

    // Normalize velocity to be within a fixed range of -0.3 to 0.5
    const v = Math.max(Math.min(Input.velocity * 100, 1), -0.3) + 1;

    // Calculate a constant time influence factor that doesn't grow with t
    const constantTimeInfluence = (t * normalizedTime + v * 4) % 1;

    let s = Math.min(this.ease(constantTimeInfluence), 1) * 9 + 1;
    s = this.clamp(s, 1, 10);

    // s = 1;

    this.group.children.forEach((_, i) => {
      _.children.forEach((cell, j) => {
        cell.material.uniforms.uTime.value = s;
        cell.material.uniforms.uLinearTime.value = constantTimeInfluence * 10;
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
        cell.material.uniforms.uMouse.value = new Vector2(
          Input.coords.x,
          Input.coords.y,
        );
      });

      _.scale.set(this.Scale[i] * s, 1, this.Scale[i] * s);
    });
  }

  resize() {
    this.group.children.forEach((_, i) => {
      _.children.forEach((cell, j) => {
        cell.material.uniforms.winResolution.value = new Vector2(
          Device.viewport.width,
          Device.viewport.height,
        ).multiplyScalar(Device.pixelRatio);
      });
    });
  }

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
