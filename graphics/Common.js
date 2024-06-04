import Device from "./pure/Device.js";

import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  WebGLRenderTarget,
  LinearFilter,
  RGBAFormat,
} from "three";

class Common {
  // create a scene and the parameters for the scene
  scene = new Scene();
  params = {
    sceneColor: 0xdfdbd1,
    cameraFov: 50,
    cameraNear: 0.01,
    cameraFar: 100.0,
  };

  constructor() {
    this.scene.background = new Color(this.params.sceneColor);
  }

  getCamera() {
    const camera = new PerspectiveCamera(
      this.params.cameraFov,
      Device.viewport.width / Device.viewport.height,
      this.params.cameraNear,
      this.params.cameraFar,
    );

    camera.position.set(0, 1.5, 10.0);
    camera.lookAt(0, 1.5, 0);

    return camera;
  }

  setupFbo() {
    this.fbo = new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
    );

    this.fboScene = new Scene();
    this.fboScene.background = new Color(this.params.sceneColor);

    this.fboCamera = this.getCamera();
  }

  init({ canvas }) {
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      alpha: false,
      stencil: false,
      powerPreference: "high-performance",
      antialias: false,
    });

    this.renderer.physicallyCorrectLights = true;

    this.renderer.setPixelRatio(Device.pixelRatio);

    this.camera = this.getCamera();
    this.setupFbo();
  }

  render(t) {}

  dispose() {
    this.renderer.dispose();
  }

  resize() {
    Device.viewport.width = this.renderer.domElement.parentElement.offsetWidth;
    Device.viewport.height =
      this.renderer.domElement.parentElement.clientHeight;
    this.camera.aspect = Device.viewport.width / Device.viewport.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
  }
}

export default new Common();
