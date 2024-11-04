import CameraManager from "../Managers/cameraManager";
import SceneManager from "../Managers/sceneManager";
import RendererManager from "../Managers/rendererManager";

const Managers = {
  Camera: (params) => new CameraManager(params),
  Scene: (params) => new SceneManager(params),
  Renderer: () => new RendererManager(),
};

export default Managers;
