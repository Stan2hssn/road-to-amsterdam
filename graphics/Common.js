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
import { sin } from "three/examples/jsm/nodes/Nodes.js";

class Common {
  // create a scene and the parameters for the scene
  scene = new Scene();
  params = {
    sceneColor: 0xe3e2e2,
    cameraFov: 50,
    cameraNear: 0.01,
    cameraFar: 200.0,
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

    camera.position.set(0, 0, 8.0);
    // camera.lookAt(0, 1.5, 0);

    return camera;
  }

  setupFbo() {
    this.reflectTexture = null;
    this.ripplesTexture = null;
    this.logoTexture = null;

    this.frontSide = {};
    this.backSide = {};

    this.frontSide.fbo = new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
    );

    this.projectRender = new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
    );

    this.reflectRender = new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
    );

    this.RipplesTexture = new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
    );

    this.frontSide.LogoTexture = new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
    );

    this.backSide.LogoTexture = new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
    );

    this.waterCompilerTexture = new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
    );

    this.reflectCamera = new PerspectiveCamera(
      this.params.cameraFov,
      Device.viewport.width / Device.viewport.height,
      this.params.cameraNear,
      this.params.cameraFar,
    );

    this.reflectCamera.position.set(-0.2, 30, -8.9);
    this.reflectCamera.lookAt(-0.2, 0, -8.9);
    // this.reflectCamera.rotation.x = Math.PI / 2;

    this.projectScene = new Scene();
    this.projectScene.background = new Color(this.params.sceneColor);
    this.projectCamera = new PerspectiveCamera(
      this.params.cameraFov,
      Device.viewport.width / Device.viewport.height,
      this.params.cameraNear,
      this.params.cameraFar,
    );

    this.fboScene = new Scene();
    this.fboScene.background = new Color(this.params.sceneColor);

    this.fboCamera = this.getCamera();

    this.backSide.fbo = new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
    );
  }

  init({ canvas }) {
    this.projectCameraZ = -8;

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

    this.pane = new Pane();
  }

  render(t) {
    const { x, y } = Input.coords;
    const z = Input.camZ;

    this.projectCamera.position.set(-x * 2, Input.cameraY + -y - 0.25, -z * 2);
    // console.log("this.projectCamera.position", this.projectCamera.position);

    this.projectCamera.lookAt(0, Input.cameraY, this.projectCameraZ);
  }

  dispose() {
    this.renderer.dispose();
  }

  resize() {
    Device.viewport.width = this.renderer.domElement.parentElement.offsetWidth;
    Device.viewport.height =
      this.renderer.domElement.parentElement.clientHeight;
    this.camera.aspect = Device.viewport.width / Device.viewport.height;
    this.projectCamera.aspect = Device.viewport.width / Device.viewport.height;

    this.camera.updateProjectionMatrix();
    this.projectCamera.updateProjectionMatrix();
    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
  }

  debug() {}
}

export default new Common();
