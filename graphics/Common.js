import Device from "./pure/Device.js";

import { Scene, Color, WebGLRenderer, OrthographicCamera } from "three";

class Common {
  // create a scene and the parameters for the scene
  scene = new Scene();
  filterScene = new Scene();
  params = {
    sceneColor: 0x222222,
    cameraFov: 50,
    cameraNear: 0.01,
    cameraFar: 100.0,
  };

  constructor() {
    this.scene.background = new Color(this.params.sceneColor);
    this.filterScene.background = new Color(this.params.sceneColor);

    this.camera = new OrthographicCamera(
      -1, // left
      1, // right
      1, // top
      -1, // bottom
      0.1, // near
      10, // far
    );

    this.filterCamera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

    this.camera.position.set(0, 0, -1);
    this.filterCamera.position.set(0, 0, -1);

    this.camera.lookAt(0, 0, 0);
    this.filterCamera.lookAt(0, 0, 0);

    this.render = this.render.bind(this);
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

    this.camera.left = -1;
    this.camera.right = 1;
    this.camera.top = 1;
    this.camera.bottom = -1;

    this.filterCamera.left = -1;
    this.filterCamera.right = 1;
    this.filterCamera.top = 1;
    this.filterCamera.bottom = -1;

    this.camera.updateProjectionMatrix();
    this.filterCamera.updateProjectionMatrix();
    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
  }
}

export default new Common();
