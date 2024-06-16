import Input from "./Input.js";
import Device from "./pure/Device.js";

import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  OrthographicCamera,
  WebGLRenderTarget,
  RGBAFormat,
  LinearFilter,
} from "three";

import { Pane } from "tweakpane";

class Common {
  // create a scene and the parameters for the scene
  Project = {};

  scene = new Scene();
  params = {
    sceneColor: 0xdfdbd1,
    cameraFov: 20,
    cameraNear: 0.01,
    cameraFar: 100.0,
  };

  constructor() {}

  init({ canvas }) {
    this.scene = new Scene();
    this.scene.background = new Color(this.params.sceneColor);

    this.camera = new PerspectiveCamera(
      50,
      Device.viewport.width / Device.viewport.height,
      0.01,
      10000,
    );

    this.camera.position.set(0, 25, 25);
    this.camera.rotation.set(-0.55, 0.02, 0.01);
    // this.camera.lookAt(0, 2, 0);

    this.renderer = new WebGLRenderer({
      canvas: canvas,
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });

    this.renderer.physicallyCorrectLights = true;

    this.renderer.setPixelRatio(Device.pixelRatio);
  }

  render(t) {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }

  resize() {
    Device.viewport.width = this.renderer.domElement.parentElement.offsetWidth;
    Device.viewport.height =
      this.renderer.domElement.parentElement.clientHeight;

    Device.pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.aspect = Device.viewport.width / Device.viewport.height;

    this.camera.aspect = this.aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
    this.renderer.setPixelRatio(Device.pixelRatio);
  }

  debug() {
    this.pane = new Pane();

    const { debug = pane } = this;
  }
}

export default new Common();
