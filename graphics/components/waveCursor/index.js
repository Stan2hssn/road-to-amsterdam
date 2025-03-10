import {
  Uniform,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
  HalfFloatType,
  FloatType,
} from "three";

import Shaders from "../../pure/Shaders.js";
import Common from "../../Common.js";
import Device from "../../pure/Device.js";

import Library from "../../pure/TexturesLoader.js";
import Input from "../../Input.js";

class waveCursor {
  constructor(outputTarget) {
    this.fbos = {
      targetA: null,
      targetB: null,
    };

    this.output = null;
    this.outputTarget = outputTarget;

    this.init();
  }

  init() {
    this.createAllFbos();
    this.initOutput();
  }

  createAllFbos() {
    Object.keys(this.fbos).forEach((key) => {
      this.fbos[key] = new WebGLRenderTarget(512, 512, {
        type: FloatType,
        internalFormat: "RGBA16F",
      });
    });
  }

  initOutput() {
    this.output = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        uniforms: {
          uTime: new Uniform(0),
          tBuffer: new Uniform(this.fbos.targetA.texture),
          tAdvect: new Uniform(Library.Images.Normal.advect),
          uSplatCoords: new Uniform(new Vector2()),
          uPrevSplatCoords: new Uniform(new Vector2()),
          uSplatRadius: new Uniform(Input.mouseVelocity),
          uResolution: new Uniform(
            new Vector2(
              Device.viewport.width,
              Device.viewport.height,
            ).multiplyScalar(Device.pixelRatio),
          ),
          uScrollOffset: new Uniform(0),
          uSizeXFactor: new Uniform(1),
        },
        vertexShader: Shaders.waveCursor.vertex,
        fragmentShader: Shaders.waveCursor.fragment,
      }),
    );

    this.addScene();
  }

  addScene() {
    Common.pages.Postprocess.scenes.main.add(this.output);
  }

  dispose() {}

  render(t) {
    this.output.material.uniforms.uTime.value = t;
    this.output.material.uniforms.uSplatCoords.value.copy(Input.coords);
    this.output.material.uniforms.uPrevSplatCoords.value.copy(Input.prevCoords);
    this.output.material.uniforms.uSplatRadius.value = Input.mouseVelocity;
    this.output.material.uniforms.uScrollOffset.value = -Input.velocity * 0.001; // Negative because scrolling down increases scrollTop

    Common.renderer.setRenderTarget(this.fbos.targetA);
    Common.renderer.render(
      Common.pages.Postprocess.scenes.main,
      Common.pages.Postprocess.cameras.main,
    );
    this.output.material.uniforms.tBuffer.value = this.fbos.targetA.texture;
    this.outputTarget.texture = this.fbos.targetA.texture;

    Common.renderer.setRenderTarget(null);

    const target = this.fbos.targetA;
    this.fbos.targetA = this.fbos.targetB;
    this.fbos.targetB = target;
  }

  resize(scale, height, width) {
    this.output.material.uniforms.uResolution.value.set(width, height);

    const sizeFactor = Math.max(
      Device.viewport.width / Device.viewport.height - 0.7,
      0.4,
    );

    console.log("sizeFactor", sizeFactor);

    this.output.material.uniforms.uSizeXFactor.value = sizeFactor;
  }

  setDebug(debug) {}
}

export default waveCursor;
