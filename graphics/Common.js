import Device from './pure/Device.js';

import { Scene, Color, PerspectiveCamera, WebGLRenderer } from 'three';

class Common {
  // create a scene and the parameters for the scene
  scene = new Scene();
  params = {
    sceneColor: 0x222222,
    cameraFov: 50,
    cameraNear: 0.01,
    cameraFar: 100.0,
  };

  constructor() {
    this.scene.background = new Color(this.params.sceneColor);

    this.camera = new PerspectiveCamera(
      this.params.cameraFov,
      Device.viewport.width / Device.viewport.height,
      this.params.cameraNear,
      this.params.cameraFar,
    );

    this.camera.position.set(2, 2.0, 9.0);
    this.camera.lookAt(0, 0, 0);
    this.render = this.render.bind(this);
  }

  init({ canvas }) {
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      alpha: false,
      stencil: false,
      depth: false,
      powerPreference: 'high-performance',
      antialias: false,
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
    this.camera.aspect = Device.viewport.width / Device.viewport.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
  }
}

export default new Common();
