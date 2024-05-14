import {
  MeshBasicMaterial,
  Plane,
  ShaderMaterial,
  Uniform,
  Mesh,
  PlaneGeometry,
  Vector2,
} from "three";

import { TextureLoader } from "three/src/loaders/TextureLoader.js";

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import GDN8 from "/Models/GDN8.glb";
import ModelTexture from "/Texture/model.webp";
import Gain from "/Texture/gain.jpeg";

import vertex from "./glsl/vertex.glsl";
import fragment from "./glsl/fragment.glsl";

import vertexModel from "./glsl/vertexModel.glsl";
import fragmentModel from "./glsl/fragmentModel.glsl";

import Common from "../Common";
import Input from "../Input";
import Device from "../pure/Device";

export default class {
  constructor(id) {
    this.id = -id * 1.5;
    this.init();
  }

  setModel() {
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderConfig({ type: "js" });
    this.dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/v1/decoders/",
    );
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.gltfLoader.load(GDN8, (gltf) => {
      this.model = gltf.scene.children[0];
      this.model.material = this.material;

      let uv = this.model.geometry.attributes.uv.array;

      for (let i = 0; i < uv.length; i += 4) {
        uv[i] = 0;
        uv[i + 1] = 0;
        uv[i + 2] = 1;
        uv[i + 3] = 0;
      }

      this.model.geometry.attributes.uv.needsUpdate = true;

      this.model.position.set(0, -0.25, 0);
      this.model.scale.set(0.01, 0.01, 0.01);

      Common.scene.add(this.model);
    });
  }

  setMaterial() {
    this.texture = new TextureLoader().load(ModelTexture);
    this.texture.flipY = false;

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        uTexture: {
          value: this.texture,
        },
      },
      vertexShader: vertexModel,
      fragmentShader: fragmentModel,
    });
  }

  init() {
    this.gain = new TextureLoader().load(Gain);

    this.dummy = new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        uniforms: {
          uTime: new Uniform(0),
          uRender: new Uniform(this.renderTexture),
          uGain: new Uniform(this.gain),
          uResolution: new Uniform(
            new Vector2(Device.viewport.width, Device.viewport.height),
          ),
        },
        vertexShader: vertex,
        fragmentShader: fragment,
      }),
    );

    this.dummy.position.set(0, this.id, 0);

    Common.mainScene.add(this.dummy);

    this.setMaterial();
    this.setModel();
  }

  dispose() {}

  render(t) {
    const { x, y } = Input.coords;
    this.dummy.material.uniforms.uRender.value = Common.renderTarget.texture;

    // this.model.rotation.x = y / 2;
    // this.model.rotation.y = -x / 2;
  }

  resize() {
    this.dummy.material.uniforms.uRender.value = Common.renderTarget.texture;
  }

  setDebug(debug) {}
}
