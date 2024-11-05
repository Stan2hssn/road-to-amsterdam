import {
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  ShaderMaterial,
  Uniform,
  Vector2,
  WebGLRenderTarget,
} from "three";

import Common from "../../Common";
import Shaders from "../../pure/Shaders";
import Library from "../../pure/Library";
import Device from "../../pure/Device";

export default class {
  constructor() {
    this.waterGeometry = null;
    this.waterMaterial = null;
    this.water = null;
    this.init();
  }

  initDummy() {
    this.dummy = new Mesh(
      new PlaneGeometry(0.6, 0.3, 1, 1),
      new MeshBasicMaterial({ color: 0xff0000, wireframe: true }),
    );
    this.dummy.rotation.x = -Math.PI / 2;
    this.dummy.position.set(0, 0.1, 29);
    Common.sceneManager.scenes.instanceScene.add(this.dummy);
  }

  initWater() {
    this.projCamera = Common.cameraManager.cameras.projectionCamera;

    this.waterGeometry = new PlaneGeometry(100, 100, 1, 1);
    this.waterMaterial = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: new Uniform(new Vector2()),
        tLogo: { value: Library.Images.Maps.homeScreen },
        tReflection: { value: null },
        viewMatrixCamera: {
          type: "m4",
          value: this.projCamera.matrixWorldInverse,
        },
        projMatrix: { type: "m4", value: this.projCamera.projectionMatrix },
      },
      vertexShader: Shaders.Components.water.vertex,
      fragmentShader: Shaders.Components.water.fragment,
    });

    this.water = new Mesh(this.waterGeometry, this.waterMaterial);

    this.water.rotation.x = -Math.PI / 2;

    Common.sceneManager.scenes.instanceScene.add(this.water);
  }

  getRenderTargets() {
    this.reflectionRenderTarget = new WebGLRenderTarget(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height * Device.pixelRatio,
    );
  }

  init() {
    this.getRenderTargets();
    this.initDummy();
    this.initWater();
  }

  dispose() {}

  render(t) {
    Common.rendererManager.renderer.setRenderTarget(
      this.reflectionRenderTarget,
    );
    Common.rendererManager.renderer.render(
      Common.sceneManager.scenes.instanceScene,
      Common.cameraManager.cameras.reflectionCamera,
    );

    this.waterMaterial.uniforms.tReflection.value =
      this.reflectionRenderTarget.texture;

    Common.rendererManager.renderer.setRenderTarget(null);
  }

  resize() {
    this.waterMaterial.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);

    this.projCamera = Common.cameraManager.cameras.projectionCamera;

    this.waterMaterial.uniforms.viewMatrixCamera.value =
      this.projCamera.matrixWorldInverse;
    this.waterMaterial.uniforms.projMatrix.value =
      this.projCamera.projectionMatrix;
  }

  setDebug(debug) {}
}
