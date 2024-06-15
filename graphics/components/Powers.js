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

  init() {
    gsap.registerPlugin(CustomEase);
    // this.setMaterial();
    this.setModel(this.Scale[0]);
    this.setModel(this.Scale[1]);
    this.setModel(this.Scale[2]);
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

      var tl = gsap.timeline({ repeat: -1 });

      tl.to(this.params, {
        size: 0.98,
        duration: 4,
        ease: CustomEase.create("custom", "M0,0 C0.18,0.411 0.299,0.791 1,1 "),
      });

      this.group.add(gltfScene);
    });

    Common.scene.add(this.group);
  }

  dispose() {}

  render(t) {
    t /= 1000;

    this.group.children.forEach((_, i) => {
      _.children.forEach((cell, j) => {
        cell.material.uniforms.uTime.value = this.params.size;
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

      _.scale.set(
        this.Scale[i] * this.params.size,
        1,
        this.Scale[i] * this.params.size,
      );

      // _.scale.set(this.Scale[i] * as, 1, this.Scale[i] * as);
    });
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
        max: 10,
      })
      .on("change", (v) => {
        this.material.uniforms.uFactor.value = this.params.factor;
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
