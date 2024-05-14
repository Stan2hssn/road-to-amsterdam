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
  NearestFilter,
} from "three";

class Common {
  // create a scene and the parameters for the scene
  scene = new Scene();
  params = {
    sceneColor: 0xffffff,
    cameraFov: 50,
    cameraNear: 0.01,
    cameraFar: 100.0,
  };

  constructor() {
    // this.renderTexture = null;
  }

  getRenderTarget({ canvas }) {
    this.scene.background = new Color(this.params.sceneColor);

    this.camera = new PerspectiveCamera(
      this.params.cameraFov,
      Device.viewport.width / Device.viewport.height,
      this.params.cameraNear,
      this.params.cameraFar,
    );

    this.camera.position.set(0, 0.0, 2.2);
    this.camera.lookAt(0, 0, 0);

    // this.render = this.render.bind(this);
    this.renderTexture = null;

    this.renderTarget = new WebGLRenderTarget(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height * Device.pixelRatio,
      {
        format: RGBAFormat,
        minFilter: NearestFilter,
        magFilter: NearestFilter,
      },
    );
  }

  getFinalRender({ canvas }) {
    this.mainScene = new Scene();
    this.mainScene.background = new Color(0x000000);

    this.mainCamera = new OrthographicCamera(
      -1 * this.camera.aspect,
      1 * this.camera.aspect,
      1,
      -1,
      0,
      100,
    );

    this.mainCamera.position.z = 2;
  }

  init({ canvas }) {
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });

    this.renderer.physicallyCorrectLights = true;

    this.renderer.setPixelRatio(Device.pixelRatio);

    this.getRenderTarget({ canvas });
    this.getFinalRender({ canvas });
  }

  render(t) {
    const { x, y } = Input.coords;
    this.mainCamera.position.set(x / 8, y / 8 - Device.scrollTop, 0);

    this.camera.position.set(Device.scrollTop - x / 4, -y / 4, 2.2);

    this.renderer.setRenderTarget(this.renderTarget);
    this.renderTexture = this.renderTarget.texture;
    this.renderer.render(this.scene, this.camera);

    this.renderer.setRenderTarget(null);

    this.renderer.render(this.mainScene, this.mainCamera);
  }

  dispose() {
    this.renderer.dispose();
  }

  resize() {
    Device.viewport.width = this.renderer.domElement.parentElement.offsetWidth;
    Device.viewport.height =
      this.renderer.domElement.parentElement.clientHeight;

    Device.pixelRatio =
      Math.min(Device.viewport.width / Device.viewport.height, 2) > 2.0
        ? Device.viewport.height / Device.viewport.width
        : Device.viewport.width / Device.viewport.height;

    this.camera.aspect = Device.pixelRatio;

    this.mainCamera.left = -1 * this.camera.aspect;
    this.mainCamera.right = 1 * this.camera.aspect;

    this.camera.updateProjectionMatrix();
    this.mainCamera.updateProjectionMatrix();

    this.renderTarget.setSize(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height,
    );

    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
    this.renderer.setPixelRatio(Device.pixelRatio);
  }
}

export default new Common();
