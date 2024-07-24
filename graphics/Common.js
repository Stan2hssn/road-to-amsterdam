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
import { Pane } from "tweakpane";
import Input from "./Input.js";

class Common {
  constructor() {
    this.scene = new Scene();
    this.params = {
      sceneColor: 0xe3e2e2,
      cameraFov: 50,
      cameraNear: 0.01,
      cameraFar: 200.0,
    };
    this.scene.background = new Color(this.params.sceneColor);
    this.cameraZ = 10;
  }

  createCamera() {
    const camera = new PerspectiveCamera(
      this.params.cameraFov,
      Device.viewport.width / Device.viewport.height,
      this.params.cameraNear,
      this.params.cameraFar,
    );
    camera.position.set(0, 0, this.cameraZ);
    return camera;
  }

  createRenderTarget() {
    return new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
      {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
      },
    );
  }

  setupFbo() {
    this.targets = {
      frontSide: {
        Cristal: this.createRenderTarget(),
        LogoTexture: this.createRenderTarget(),
      },
      backSide: {
        Cristal: this.createRenderTarget(),
        LogoTexture: this.createRenderTarget(),
      },
      projectRender: this.createRenderTarget(),
      bubblesRender: this.createRenderTarget(),
      ripplesTexture: this.createRenderTarget(),
    };

    this.reflectCamera = this.createCamera();
    this.reflectCamera.position.set(-0.2, 30, -8.9);
    this.reflectCamera.lookAt(-0.2, 0, -8.9);

    this.projectScene = new Scene();
    this.projectScene.background = new Color(this.params.sceneColor);
    this.projectCamera = this.createCamera();

    this.fboScene = new Scene();
    this.fboScene.background = new Color(this.params.sceneColor);

    this.fboCamera = this.createCamera();
  }

  init({ canvas }) {
    this.projectCameraZ = -10;

    this.renderer = new WebGLRenderer({
      canvas: canvas,
      alpha: false,
      stencil: false,
      powerPreference: "high-performance",
      antialias: false,
    });

    this.renderer.physicallyCorrectLights = true;
    this.renderer.setPixelRatio(Device.pixelRatio);

    this.camera = this.createCamera();
    this.setupFbo();

    this.pane = new Pane();
  }

  render(t) {
    const { x, y } = Input.coords;
    const z = Input.camZ;

    this.projectCamera.position.set(
      -x * 6,
      Input.cameraY * 2 - y - 0.5,
      -z * 2,
    );
    this.projectCamera.lookAt(0, Input.cameraY * 2 - 0.5, this.projectCameraZ);

    this.camera.position.set(-x, Input.cameraY - y - 0.5, -z + this.cameraZ);
    this.camera.lookAt(0, Input.cameraY, 0);
  }

  dispose() {
    this.renderer.dispose();
  }

  resizeRenderTarget(target) {
    target.setSize(Device.viewport.width, Device.viewport.height);
  }

  resize() {
    Device.viewport.width = this.renderer.domElement.parentElement.offsetWidth;
    Device.viewport.height =
      this.renderer.domElement.parentElement.clientHeight;

    this.camera.aspect = Device.viewport.width / Device.viewport.height;
    this.projectCamera.aspect = Device.viewport.width / Device.viewport.height;

    const resizeTargets = (target) => {
      if (target instanceof WebGLRenderTarget) {
        this.resizeRenderTarget(target);
      } else if (typeof target === "object") {
        Object.values(target).forEach(resizeTargets);
      }
    };

    Object.values(this.targets).forEach(resizeTargets);

    this.camera.updateProjectionMatrix();
    this.projectCamera.updateProjectionMatrix();
    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
  }

  debug() {}
}

export default new Common();
