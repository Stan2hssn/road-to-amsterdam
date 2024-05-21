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
  LinearFilter,
} from "three";

class Common {
  // create a scene and the parameters for the scene
  Project = {};

  scene = new Scene();
  params = {
    sceneColor: 0xffffff,
    cameraFov: 20,
    cameraNear: 0.01,
    cameraFar: 100.0,
  };

  constructor() {
    this.step = 20; // this is the distance between the projects;
    // this.renderTexture = null;
  }

  getProject() {
    const projects = document.querySelectorAll(".project");

    projects.forEach((project) => {
      if (!projects) return;

      this.Project[project.id] = {};
      this.Project[project.id].id = project.id;
      this.Project[project.id].model = project.getAttribute("model");
      this.Project[project.id].size = project.getAttribute("size");
      this.Project[project.id].translate = project.getAttribute("translate");
      this.Project[project.id].camera = this.getCamera();
      this.Project[project.id].renderTexture = this.getRenderTexture();
      this.Project[project.id].renderTarget = this.getRenderTarget();
      this.Project[project.id].instance = {};
    });

    this.renderScene = this.getScene();
  }

  getScene() {
    const scene = new Scene();
    scene.background = new Color(this.params.sceneColor);
    return scene;
  }

  getCamera() {
    const camera = new PerspectiveCamera(
      this.params.cameraFov,
      Device.viewport.width / Device.viewport.height,
      this.params.cameraNear,
      this.params.cameraFar,
    );

    camera.position.set(0, 0.0, 9);
    camera.lookAt(0, 0, 0);

    return camera;
  }

  getRenderTexture() {
    const renderTexture = null;

    return renderTexture;
  }

  getRenderTarget() {
    const renderTarget = new WebGLRenderTarget(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height,
      {
        format: RGBAFormat,
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        anisotropy: 1,
      },
    );

    return renderTarget;
  }

  getFinalRender({ canvas }) {
    this.mainScene = new Scene();
    this.mainScene.background = new Color(0x000000);

    this.mainCamera = new PerspectiveCamera(
      50,
      Device.viewport.width / Device.viewport.height,
      0.01,
      100,
    );
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

    this.mainCamera.position.set(x / 8, y / 8 - -Device.scrollTop, 3);

    for (const project in this.Project) {
      const scrollAtenuation = (this.step * project) / (this.step / 2);

      this.Project[project].camera.position.set(
        this.step * project - -Device.scrollTop + scrollAtenuation - x / 4,
        // scrollAtenuation - x / 4 + this.step * project,
        -y / 4,
        this.Project[project].camera.position.z,
      );

      this.Project[project].camera.updateProjectionMatrix();

      this.renderer.setRenderTarget(this.Project[project].renderTarget);
      this.Project[project].renderTexture =
        this.Project[project].renderTarget.texture;

      this.renderer.render(this.renderScene, this.Project[project].camera);
    }
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

    Device.pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.aspect = Device.viewport.width / Device.viewport.height;

    this.mainCamera.aspect = this.aspect;
    this.mainCamera.updateProjectionMatrix();

    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
    this.renderer.setPixelRatio(Device.pixelRatio);
  }
}

export default new Common();
