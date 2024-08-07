import { Pane } from "tweakpane";

import Input from "./Input.js";
import Device from "./pure/Device.js";

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

  pages = {
    About: {
      cameras: {
        Main: {},
        Hero: {},
        Body: {},
      },
      scenes: {
        Main: new Scene(),
        Hero: new Scene(),
        Body: new Scene(),
      },
    },

    Home: {
      cameras: {
        Main: {},
        Hero: {},
        Body: {},
      },
      scenes: {
        Main: new Scene(),
        Hero: new Scene(),
        Body: new Scene(),
      },
    },
  };

  constructor() {
    this.pages.About.scenes.Main.background = new Color(this.params.sceneColor);

    this.render = this.render.bind(this);
  }

  init({ canvas, scrollContainer }) {
    this.pages.Home.cameras.Main = this.setCamera();
    this.pages.About.cameras.Main = this.setCamera();

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

    this.scale = this.cameraZ / this.z;

    const camera = new PerspectiveCamera(
      this.params.cameraFov,
      Device.viewport.width / Device.viewport.height,
      this.params.cameraNear,
      this.params.cameraFar,
    );

    return camera;
  }

  setupPipeline() {
    this.pages.About.scenes.Hero = new Scene();
    this.pages.About.cameras.Hero = this.setCamera();
    this.pages.About.scenes.Body = new Scene();
    this.pages.About.cameras.Body = this.setCamera();

    this.pages.Home.scenes.Hero = new Scene();
    this.pages.Home.cameras.Hero = this.setCamera();
    this.pages.Home.scenes.Body = new Scene();
    this.pages.Home.cameras.Body = this.setCamera();
  }

  render(t) {
    if (!t) return;

    const { x, y } = Input.coords;
    const z = Input.camZ;

    this.cameraY = Device.scrollTop - y * 50;

    this.scrollContainer.style.transform = `translate3d(0, ${Device.scrollTop}px, 0)`;
    this.pages.About.cameras.Main.position.set(
      this.cameraX - x * 20,
      this.cameraY - y * 20,
      this.cameraZ - z * 20,
    );

    this.pages.About.cameras.Main.lookAt(0, Device.scrollTop, 0);
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
    this.pages.Home.cameras.Main.position.set(
      this.cameraX,
      this.cameraY,
      this.cameraZ,
    );
    this.pages.Home.cameras.Main.aspect = aspect;

    // Update projection matrices
    this.pages.Home.cameras.Main.updateProjectionMatrix();
  }

  resize() {
    const parentElement = this.renderer.domElement.parentElement;
    Device.viewport.width = parentElement.offsetWidth;
    Device.viewport.height = parentElement.offsetHeight;
    Device.pixelRatio = window.devicePixelRatio;

    Device.aspectRatio = Device.viewport.width / Device.viewport.height;

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
