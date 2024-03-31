import { GridHelper } from "three";
import Common from "../Common";

export default class {
  constructor(size, divisions) {
    this.size = size || 10;
    this.divisions = divisions || 10;

    this.init();
  }

  init() {
    this.gridHelper = new GridHelper(this.size, this.divisions);

    this.gridHelper.traverseVisible((s) => {
      s.material.opacity = 0.25;
      s.material.transparent = true;
    });

    this.gridHelper.rotateX(Math.PI / 2);
    Common.scene.add(this.gridHelper);
  }
}
