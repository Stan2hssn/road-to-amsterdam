import { Pane } from "tweakpane";
import Device from "./pure/Device.js";
import Managers from "./pure/Managers.js";

class Common {
  constructor() {
    this.params = {
      sceneColor: 0x222222,
      cameraFov: 50,
      cameraNear: 0.1,
      cameraFar: 800.0,
    };

    this.sceneManager = Managers.Scene(this.params);
    this.cameraManager = Managers.Camera(this.params);
    this.rendererManager = Managers.Renderer();

    this.render = this.render.bind(this);
  }

  init({ canvas }) {
    this.rendererManager.initRender({ canvas });
    this.sceneManager.setupScenes();

    // Create Cameras
    this.cameraManager.createCameras();
  }

  render(t) {
    // Animation logic
  }

  dispose() {
    if (this.rendererManager.renderer) {
      this.rendererManager.renderer.dispose();
    }
  }

  resize() {
    if (this.rendererManager.renderer) {
      this.rendererManager.resizeRenderer();
    }
    this.cameraManager.resizeCameras();
  }

  setDebug() {
    this.debug = new Pane();

    this.debug = this.debug.addFolder({ title: "Scene", expanded: true });
    this.cameraManager.setDebug(this.debug);
  }
}

export default new Common();
