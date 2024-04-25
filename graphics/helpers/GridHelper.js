import { GridHelper } from "three";
import Common from "../Common";

export default class {
  constructor(size, divisions) {
    this.size = size || 100;
    this.divisions = divisions || 100;

    this.init();
  }

  init() {
    this.gridHelper = new GridHelper(this.size, this.divisions);
    this.gridHelper.traverseVisible((s) => {
      s.material.opacity = 0.25;
      s.material.transparent = true;
    });

    Common.scene.add(this.gridHelper);
  }
}
