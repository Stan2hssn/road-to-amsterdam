import { Pane } from "tweakpane";

import Input from "./Input.js";
import Device from "./pure/Device.js";

import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  Vector2,
  Group,
} from "three";

class Common {
  scene = new Scene();
  params = {
    sceneColor: new Color(0xe3e2e2),
    cameraFov: 52,
    cameraNear: 0.01,
    cameraFar: 10000.0,
    depth: {
      fov: 70,
      near: 4,
      far: 8,
    },
  };

  mousePower = new Vector2(
    Device.viewport.width / Device.viewport.height,
    Device.viewport.height / Device.viewport.width,
  );

  pages = {
    About: {
      cameras: {
        main: null,
        hero: {},
        key: {},
        story: {},
        memory: {},
        depth: {},
      },
      scenes: {
        main: new Scene(),
        hero: new Scene(),
        key: new Scene(),
        memory: new Scene(),
        story: new Scene(),
        depth: new Scene(),
      },
      groups: {
        main: null,
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
  }

  setCamera() {
    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraZ =
      (Device.viewport.height /
        Math.tan((this.params.cameraFov * Math.PI) / 360)) *
      0.5;
    this.newCameraZ = this.cameraZ;

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
    this.pages.About.scenes.key = new Scene();
    this.pages.About.cameras.key.main = this.setCamera();
    this.pages.About.scenes.story = new Scene();
    this.pages.About.cameras.story.main = this.setCamera();
    this.pages.About.scenes.depth = new Scene();
    // this.pages.About.scenes.memory = new Scene();
    this.pages.About.cameras.memory.main = this.setCamera();

    this.pages.About.groups.main = new Group();

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
    const scrollZ = Input.scrollZ;
    const mousePowerIn = Input.mousePowerIn;

    this.cameraY =
      Device.scrollTop - y * 30 * ((this.mousePower.y * mousePowerIn) / 5);
    this.newCameraZ = this.cameraZ + Input.scrollZ;

    this.scrollContainer.style.transform = `translate3d(0, ${Device.scrollTop}px, 0)`;

    this.pages.About.cameras.hero.main.position.set(
      this.cameraX - x * 40 * this.mousePower.x,
      -y * 60 * this.mousePower.y,
      this.newCameraZ - z * 40,
    );
    this.pages.About.cameras.hero.main.lookAt(0, 0, 0);

    this.pages.About.cameras.main.position.set(
      this.cameraX - x * 1 * this.mousePower.x,
      this.cameraY,
      this.newCameraZ - z * 1,
    );

    this.pages.About.cameras.key.main.position.set(
      this.cameraX - x * 1 * this.mousePower.x,
      this.cameraY,
      this.newCameraZ - z * 1,
    );

    this.pages.About.cameras.story.main.position.set(
      (this.cameraX - x * this.mousePower.x) * mousePowerIn * 2,
      this.cameraY,
      this.newCameraZ - z * (mousePowerIn / 40),
    );

    this.pages.About.cameras.story.main.lookAt(0, this.cameraY, -200);
  }

  dispose() {
    this.renderer.dispose();
  }

  updateCamera(camera, depth = true) {
    const aspect = Device.viewport.width / Device.viewport.height;

    if (aspect > 1) {
      this.mousePower.set(1, Device.viewport.height / Device.viewport.width);
    } else {
      this.mousePower.set(Device.viewport.height / Device.viewport.width, 1);
    }

    if (depth) {
      this.cameraZ =
        (Device.viewport.height /
          Math.tan((this.params.cameraFov * Math.PI) / 360)) *
        0.5;
      camera.position.set(this.cameraX, this.cameraY, this.cameraZ);
      camera.aspect = aspect;
    } else {
      camera.aspect = aspect;
      camera.position.set(this.cameraX, 0, 0);
    }

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
            if (page.cameras[cameraKey].main.userData.depth) {
              this.updateCamera(camera[key], false);
            } else {
              this.updateCamera(camera[key]);
            }
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

    this.scale = this.cameraZ / this.z;

    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
    this.renderer.setPixelRatio(Device.pixelRatio);

    Device.scrollHeight =
      this.scrollContainer.clientHeight - Device.viewport.height;
  }

  setDebug(debug) {
    this.debug = new Pane();

    this.debug = this.debug.addFolder({ title: "Scene", expanded: true });
  }
}

export default new Common();
