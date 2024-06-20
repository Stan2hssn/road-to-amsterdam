import Device from "./pure/Device.js";

import { Pane } from "tweakpane";

import { Scene, Color, PerspectiveCamera, WebGLRenderer } from "three";

class Common {
  // create a scene and the parameters for the scene
  scene = new Scene();
  params = {
    sceneColor: 0x1111111,
    cameraFov: 52,
    cameraNear: 0.01,
    cameraFar: 10000.0,
  };

  constructor() {
    this.scene.background = new Color(this.params.sceneColor);

    this.scale = 1;

    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraZ =
      (Device.viewport.height /
        Math.tan((this.params.cameraFov * Math.PI) / 360)) *
      0.5;

    this.z = 300;

    this.camera = new PerspectiveCamera(
      this.params.cameraFov,
      Device.viewport.width / Device.viewport.height,
      this.params.cameraNear,
      this.params.cameraFar,
    );

    this.render = this.render.bind(this);
  }

  init({ canvas, scrollContainer }) {
    this.scrollContainer = scrollContainer;
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      alpha: false,
      stencil: false,
      powerPreference: "high-performance",
      antialias: false,
    });

    this.debug = window.location.hash === "#debug" ? new Pane() : null;

    this.renderer.physicallyCorrectLights = true;

    this.renderer.setPixelRatio(Device.pixelRatio);
  }

  render(t) {
    this.cameraY = -Device.scrollTop;

    this.scrollContainer.style.transform = `translate3d(0, ${-Device.scrollTop}px, 0)`;
    this.camera.position.set(this.cameraX, this.cameraY, this.cameraZ);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }

  resize() {
    Device.viewport.width = this.renderer.domElement.parentElement.offsetWidth;
    Device.viewport.height =
      this.renderer.domElement.parentElement.offsetHeight;

    this.cameraZ =
      (Device.viewport.height /
        Math.tan((this.params.cameraFov * Math.PI) / 360)) *
      0.5;

    this.camera.position.set(this.cameraX, this.cameraY, this.cameraZ);

    this.camera.aspect = Device.viewport.width / Device.viewport.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
  }

  setDebug(debug) {
    const { debug: pane } = this;

    this.debug = pane.addFolder({ title: "Scene", expanded: true });
  }
}

export default new Common();
