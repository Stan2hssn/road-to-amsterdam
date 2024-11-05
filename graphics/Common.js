import Managers from "./pure/Managers.js";

import Device from "./pure/Device.js";
import DOM from "./DOM.js";
import { Pane } from "tweakpane";

class Common {
  constructor() {
    this.params = {
      sceneColor: 0x222222,
      cameraFov: 52,
      cameraNear: 0.1,
      cameraFar: 800.0,
    };

    this.stepManager = Managers.Step();
    this.sceneManager = Managers.Scene(this.params);
    this.cameraManager = Managers.Camera(this.params);
    this.rendererManager = Managers.Renderer();

    this.render = this.render.bind(this);
  }

  init({ canvas }) {
    this.rendererManager.initRender({ canvas });
    this.sceneManager.setupScenes();

    // Create Cameras
    this.cameraManager.createCameras();

    // Enregistrer les callbacks des steps dans le StepManager
    this.stepManager.addStepCallback(0, () => {
      console.log("Step 0 : Initialiser la caméra");
      this.cameraManager.animateToStep(0);
      if (DOM.Component.emotion.isSetup) {
        DOM.updateComponent(this.stepManager.currentStep);
      }
    });

    this.stepManager.addStepCallback(1, () => {
      console.log("Step 1 : Animer vers la position 1");
      this.cameraManager.animateToStep(1);
      if (DOM.Component.emotion.isSetup) {
        DOM.updateComponent(this.stepManager.currentStep);
      }
    });

    this.stepManager.addStepCallback(2, () => {
      console.log("Step 2 : Animer vers la position 2");
      this.cameraManager.animateToStep(2);
      if (DOM.Component.emotion.isSetup) {
        DOM.updateComponent(this.stepManager.currentStep);
      }
    });
  }

  render(t) {
    this.stepManager.render();
    this.cameraManager.render(t);
  }

  dispose() {
    if (this.rendererManager.renderer) {
      this.rendererManager.renderer.dispose();
    }
  }

  resize() {
    const parentElement =
      this.rendererManager.renderer.domElement.parentElement;
    Device.viewport.width = parentElement.offsetWidth;
    Device.viewport.height = parentElement.offsetHeight;
    Device.pixelRatio = window.devicePixelRatio;

    const aspectRatio = Device.viewport.width / Device.viewport.height;
    Device.aspectRatio = aspectRatio;

    this.cameraManager.resizeCameras(aspectRatio);
    this.rendererManager.resizeRenderer(aspectRatio);
  }

  setDebug() {
    this.debug = new Pane();
    this.cameraManager.setDebug(this.debug);

    // Add a debug button to change steps
    const stepButton = this.debug.addButton({ title: "Next Step" });
    stepButton.on("click", () => {
      const nextStep = (this.stepManager.currentStep + 1) % 3; // Assuming 3 steps
      this.stepManager.setCurrentStep(nextStep);
    });
  }
}

export default new Common();
