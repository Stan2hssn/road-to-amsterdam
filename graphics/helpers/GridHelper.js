import { GridHelper } from "three";
import Common from "../Common";

export default class {
  constructor(size, divisions) {
    size = size || 10;
    divisions = divisions || 10;

    this.init();
  }

  init() {
    this.gridHelper = new GridHelper(this.size, this.divisions);
    this.gridHelper.traverseVisible((s) => {
      s.material.opacity = 1;
      s.material.transparent = true;
    });

    this.gridHelper.position.set(0, -1, 0);
    // Common.pages.About.scenes.depth.add(this.gridHelper);
  }
}
