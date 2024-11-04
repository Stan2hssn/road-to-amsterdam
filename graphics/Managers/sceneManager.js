import { Scene, Color } from "three";

class SceneManager {
  constructor(params) {
    this.params = params;
    this.scenes = {
      instanceScene: new Scene(),
      mainScene: new Scene(),
    };
  }

  setupScenes() {
    this.scenes.instanceScene.background = new Color(this.params.sceneColor);
  }
}

export default SceneManager;
