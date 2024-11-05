import CameraManager from "../Managers/cameraManager";
import SceneManager from "../Managers/sceneManager";
import RendererManager from "../Managers/rendererManager";
import StepManager from "../Managers/stepManager";

const Managers = {
  Camera: (params) => new CameraManager(params),
  Scene: (params) => new SceneManager(params),
  Renderer: () => new RendererManager(),
  Step: () => new StepManager(),
};

export default Managers;
