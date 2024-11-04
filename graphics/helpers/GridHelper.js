import { GridHelper } from "three";
import Common from "../Common";

export default class {
  constructor(size, divisions) {
    this.size = size || 1000;
    this.divisions = divisions || 100;

    this.init();
  }

  init() {
    this.gridHelper = new GridHelper(this.size, this.divisions);
    this.gridHelper.traverseVisible((s) => {
      s.material.opacity = 1;
      s.material.transparent = true;
    });

    Common.sceneManager.scenes.instanceScene.add(this.gridHelper);
  }
}
