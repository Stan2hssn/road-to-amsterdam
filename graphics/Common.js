import Device from "./pure/Device.js";

import { Pane } from "tweakpane";

import Input from "./Input.js";

import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  Raycaster,
  Vector2,
  PlaneGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Mesh,
  SphereGeometry,
  WebGLRenderTarget,
  OrthographicCamera,
  ShaderMaterial,
  Uniform,
  RGBAFormat,
  LinearFilter,
} from "three";

class Common {
  scene = new Scene();
  params = {
    sceneColor: 0xe3e2e2,
    cameraFov: 52,
    cameraNear: 0.01,
    cameraFar: 10000.0,
  };

  constructor() {
    this.scene.background = new Color(this.params.sceneColor);

    this.render = this.render.bind(this);
  }

  init({ canvas, scrollContainer }) {
    this.camera = this.setCamera();
    this.scrollContainer = scrollContainer;

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: false,
      stencil: false,
      powerPreference: "high-performance",
      antialias: false,
    });

    this.renderer.physicallyCorrectLights = true;
    this.renderer.setPixelRatio(Device.pixelRatio);
    this.debug = window.location.hash === "#debug" ? new Pane() : null;
  }

  setCamera() {
    this.scale = 1;

    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraZ =
      (Device.viewport.height /
        Math.tan((this.params.cameraFov * Math.PI) / 360)) *
      0.5;

    this.z = 300;

    const camera = new PerspectiveCamera(
      this.params.cameraFov,
      Device.viewport.width / Device.viewport.height,
      this.params.cameraNear,
      this.params.cameraFar,
    );

    return camera;
  }

  render(t) {
    if (!t) return;

    this.cameraY = -Device.scrollTop;
    this.scrollContainer.style.transform = `translate3d(0, ${-Device.scrollTop}px, 0)`;
    this.camera.position.set(this.cameraX, this.cameraY, this.cameraZ);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }

  updateCamera() {
    const aspect = Device.viewport.width / Device.viewport.height;

    this.aspect = aspect;
    this.frustumSize = 0.1;

    // Update perspective camera
    this.cameraZ =
      (Device.viewport.height /
        Math.tan((this.params.cameraFov * Math.PI) / 360)) *
      0.5;
    this.camera.position.set(this.cameraX, this.cameraY, this.cameraZ);
    this.camera.aspect = aspect;

    // Update projection matrices
    this.camera.updateProjectionMatrix();
  }

  resize() {
    const parentElement = this.renderer.domElement.parentElement;
    Device.viewport.width = parentElement.offsetWidth;
    Device.viewport.height = parentElement.offsetHeight;

    this.updateCamera();

    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
    this.renderer.setPixelRatio(Device.pixelRatio);
  }

  setDebug(debug) {
    if (this.debug) {
      this.debug = this.debug.addFolder({ title: "Scene", expanded: true });
    }
  }
}

export default new Common();
