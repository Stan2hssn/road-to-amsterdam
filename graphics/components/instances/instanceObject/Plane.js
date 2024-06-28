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
import NoiseTexture from "/Texture/noise.png";
import NoiseFlowTexture from "/Texture/noiseFlow.jpg";

import vertexShader from "../../glsl/displacement/vertex.vert";
import fragmentShader from "../../glsl/displacement/fragment.frag";

import textVertex from "../../glsl/simulation/textVertex.vert";
import textFragment from "../../glsl/simulation/textFragment.frag";

import CustomPlaneGeometry from "./CustomPlaneGeometry";
import Device from "../../../pure/Device";
import Input from "../../../Input";

export default class {
  params = {
    speed: 0,
    influence: 2,
    step: 0.7,
  };

  constructor() {
    this.init();
  }

  texture() {
    this.loader = new TextureLoader();
    this.texture = {
      textTexture: this.loader.load(TextTexture),
      noiseTexture: this.loader.load(NoiseTexture),
      noiseFlowTexture: this.loader.load(NoiseFlowTexture),
    };
  }

  init() {
    this.texture();
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
        uShift: new Uniform(0),
        uStep: new Uniform(this.params.step),
        uNoise: new Uniform(this.texture.noiseTexture),
        uNoiseFlow: new Uniform(this.texture.noiseFlowTexture),
        tDiffuse: { value: null },
        tPrev: { value: null },
        uResolution: {
          value: new Vector2(
            Device.viewport.width,
            Device.viewport.height,
          ).multiplyScalar(Device.pixelRatio),
        },
      },
      vertexShader: textVertex,
      fragmentShader: textFragment,
      // vertexShader: vertexShader,
      // fragmentShader: fragmentShader,
      // wireframe: true,
      transparent: true,
    });

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

    this.mesh.material.uniforms.uShift.value = Device.scrollTop;
  }

  resize(scale, height, width) {}

  setDebug(debug) {
    debug
      .addBinding(this.params, "step", {
        label: "Step",
        min: 0,
        max: 1,
      })
      .on("change", (v) => {
        this.mesh.material.uniforms.uStep.value = this.params.step;
      });
  }
}
