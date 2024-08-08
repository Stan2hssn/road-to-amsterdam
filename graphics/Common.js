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
    sceneColor: new Color(0xe3e2e2),
    cameraFov: 52,
    cameraNear: 0.01,
    cameraFar: 10000.0,
  };

  mousePower = new Vector2(
    Device.viewport.width / Device.viewport.height,
    Device.viewport.height / Device.viewport.width,
  );

  pages = {
    About: {
      cameras: {
        hero: {},
        story: {},
      },
      scenes: {
        main: new Scene(),
        hero: new Scene(),
        story: new Scene(),
      },
    },

    Home: {
      cameras: {
        main: {},
        hero: {},
        body: {},
      },
      scenes: {
        main: new Scene(),
        hero: new Scene(),
        body: new Scene(),
      },
    },
  };

  constructor() {
    this.pages.About.scenes.main.background = new Color(this.params.sceneColor);

    this.render = this.render.bind(this);
  }

  init({ canvas, scrollContainer }) {
    this.pages.About.cameras.main = this.setCamera();
    this.pages.Home.cameras.main = this.setCamera();

    this.setupPipeline();

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
    this.pages.About.scenes.hero = new Scene();
    this.pages.About.cameras.hero.main = this.setCamera();
    this.pages.About.scenes.story = new Scene();
    this.pages.About.cameras.story.main = this.setCamera();

    Object.keys(this.pages).forEach((pageKey) => {
      const page = this.pages[pageKey];
      if (page.scenes) {
        Object.keys(page.scenes).forEach((sceneKey) => {
          const scene = page.scenes[sceneKey];
          if (scene instanceof Scene) {
            scene.background = new Color(this.params.sceneColor);
          }
        });
      }
    });
  }

  render(t) {
    if (!t) return;

    const { x, y } = Input.coords;
    const z = Input.camZ;

    this.cameraY = Device.scrollTop - y * 30 * this.mousePower.y;

    this.scrollContainer.style.transform = `translate3d(0, ${Device.scrollTop}px, 0)`;

    this.pages.About.cameras.hero.main.position.set(
      this.cameraX - x * 20 * this.mousePower.x,
      -y * 30 * this.mousePower.y,
      this.cameraZ - z * 20,
    );
    this.pages.About.cameras.hero.main.lookAt(0, 0, 0);

    this.pages.About.cameras.main.position.set(
      this.cameraX,
      Device.scrollTop,
      this.cameraZ,
    );

    this.pages.About.cameras.story.main.position.set(
      this.cameraX,
      Device.scrollTop,
      this.cameraZ,
    );

    // console.log("this.cameraY", this.cameraY - y * this.mousePower.y);
  }

  dispose() {
    this.renderer.dispose();
  }

  updateCamera(camera) {
    const aspect = Device.viewport.width / Device.viewport.height;

    if (aspect > 1) {
      this.mousePower.set(1, Device.viewport.height / Device.viewport.width);
    } else {
      this.mousePower.set(Device.viewport.height / Device.viewport.width, 1);
    }

    this.cameraZ =
      (Device.viewport.height /
        Math.tan((this.params.cameraFov * Math.PI) / 360)) *
      0.5;
    camera.position.set(this.cameraX, this.cameraY, this.cameraZ);
    camera.aspect = aspect;

    camera.updateProjectionMatrix();
  }

  updateCameras() {
    for (const pageKey in this.pages) {
      const page = this.pages[pageKey];
      for (const cameraKey in page.cameras) {
        const camera = page.cameras[cameraKey];
        if (camera instanceof PerspectiveCamera) {
          this.updateCamera(camera);
        } else {
          for (const key in camera) {
            this.updateCamera(camera[key]);
          }
        }
      }
    }
  }

  resize() {
    const parentElement = this.renderer.domElement.parentElement;
    Device.viewport.width = parentElement.offsetWidth;
    Device.viewport.height = parentElement.offsetHeight;
    Device.pixelRatio = window.devicePixelRatio;

    Device.aspectRatio = Device.viewport.width / Device.viewport.height;

    this.updateCameras();

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
