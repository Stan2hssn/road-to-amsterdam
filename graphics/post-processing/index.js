import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { Uniform } from "three";

import Common from "../Common";
import Device from "../pure/Device";
import { Vector2 } from "three";

import vertex from "./glsl/vertex.glsl";
import fragment from "./glsl/postProcessing.glsl";

export default class {
  constructor() {
    this.init();
  }

  init() {
    const { width, height } = Device.viewport;

    this.composer = new EffectComposer(Common.renderer);
    this.composer.addPass(new RenderPass(Common.mainScene, Common.mainCamera));

    this.mainPass = new ShaderPass({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        tDiffuse: { value: null },
        resolution: {
          value: new Vector2(
            width * Device.pixelRatio,
            height * Device.pixelRatio,
          ),
        },
        uTime: new Uniform(0),
      },
    });

    this.composer.addPass(this.mainPass);
  }

  dispose() {
    this.composer.reset();
  }

  render(t) {
    this.mainPass.uniforms.uTime.value = t / 1000;

    this.composer.render();
  }

  resize() {
    this.composer.setSize(Device.viewport.width, Device.viewport.height);
    this.mainPass.uniforms.resolution.value.set(
      Device.viewport.width,
      Device.viewport.height,
    );
  }

  setDebug(debug) {}
}
