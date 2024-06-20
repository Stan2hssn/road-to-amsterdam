import {
  BufferGeometry,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  TextureLoader,
  Uniform,
  Float32BufferAttribute,
  Color,
  SRGBColorSpace,
  Vector2,
} from "three";

import TextTexture from "/Texture/text.jpg";

import vertexShader from "./glsl/vertex.glsl";
import fragmentShader from "./glsl/fragment.glsl";

import textVertex from "./glsl/textVertex.glsl";
import textFragment from "./glsl/textFragment.glsl";

import CustomPlaneGeometry from "./CustomPlaneGeometry";
import Device from "../../../pure/Device";
import Input from "../../../Input";

export default class {
  params = {
    speed: 0,
    influence: 2,
  };

  constructor() {
    this.init();
  }

  texture() {
    this.loader = new TextureLoader();
    this.texture = {
      textTexture: this.loader.load(TextTexture),
    };
  }

  init() {
    this.texture();
    ``;
    // const geometry = new CustomPlaneGeometry(1, 1, 10).geometry;
    const geometry = new PlaneGeometry(1, 1, 10, 10);

    const { speed, influence } = this.params;

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        uSpeed: new Uniform(speed),
        uInfluence: new Uniform(influence),
        uText: new Uniform(this.texture.textTexture),
        uRes: new Uniform(new Vector2(0, 0)),
        uMouse: new Uniform(new Vector2(0, 0)),
      },
      vertexShader: textVertex,
      fragmentShader: textFragment,
      // vertexShader: vertexShader,
      // fragmentShader: fragmentShader,
      // wireframe: true,
      transparent: true,
    });

    console.log("this.material", this.material);

    this.mesh = new Mesh(geometry, this.material);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    let newTimeValue = t / 1000;
    // newTimeValue *= 0.25;

    if (this.mesh.material.uniforms.uTime.value !== newTimeValue) {
      this.mesh.material.uniforms.uTime.value = newTimeValue;
    }

    this.mesh.material.uniforms.uMouse.value = new Vector2(
      Input.coords.x,
      Input.coords.y,
    );

    this.mesh.material.uniforms.uSpeed.value = Device.velocity;
  }

  resize() {}

  setDebug(debug) {
    debug
      .addBinding(this.params, "influence", {
        label: "Influence",
        min: -4,
        max: 4,
        step: 0.01,
      })
      .on("change", () => {
        this.material.uniforms.uInfluence.value = this.params.influence;
      });
  }
}
