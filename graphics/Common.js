import Device from './pure/Device.js';

import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';

class Common {
  // create a scene and the parameters for the scene
  scene = new Scene();
  params = {
    sceneColor: 0x222222,
    cameraFov: 70,
    cameraNear: 0.01,
    cameraFar: 10000.0,
  };

  constructor() {
    // this.scene.background = new Color(this.params.sceneColor);
    this.isCameraFixed = false;
    this.scale = 1;

    this.camera = new PerspectiveCamera(
      this.params.cameraFov,
      Device.viewport.width / Device.viewport.height,
      this.params.cameraNear,
      this.params.cameraFar,
    );

    this.z =
      (Device.viewport.height /
        Math.tan((this.params.cameraFov * Math.PI) / 360)) *
      0.5;

    this.cameraZ = 300;

    this.camera.position.set(0, 0, this.cameraZ);

    this.render = this.render.bind(this);
  }

  init({ canvas }) {
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      alpha: true,
      stencil: false,
      depth: false,
      powerPreference: 'high-performance',
      antialias: false,
    });

    this.renderer.physicallyCorrectLights = true;

    this.renderer.setPixelRatio(Device.pixelRatio);

    this.resize();
  }

  render(t) {
    this.camera.position.set(0, -Device.scrollTop, this.z);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }

  resize() {
    Device.viewport.width = this.renderer.domElement.parentElement.offsetWidth;
    Device.viewport.height = this.renderer.domElement.offsetHeight;

    this.scale = 1;

    this.camera.position.set(0, -Device.scrollTop, this.z);
    this.camera.aspect = Device.viewport.width / Device.viewport.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
  }
}

export default new Common();
