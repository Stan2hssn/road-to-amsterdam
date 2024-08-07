import { Raycaster, Uniform, Vector2 } from "three";

import Input from "../../Input.js";
import Common from "../../Common.js";

export default class {
  constructor() {
    this.raycaster = new Raycaster();
    this.interactivesObjects = Common.scene.children;
    this.raycasterCoords = new Vector2();
    this.objectId = new Uniform(null);

    this.init();
  }

  init() {}

  dispose() {}

  render(t) {
    const pointer = Input.coords;
    this.raycaster.setFromCamera(pointer, Common.pages.About.cameras.Main);

    const intersects = this.raycaster.intersectObjects(
      this.interactivesObjects,
      true,
    );

    if (intersects.length > 0) {
      const { x, y } = intersects[0].point;

      this.objectId.value = intersects[0].object.id;
      this.raycasterCoords.set(x, y);
    } else {
      this.objectId.value = null;
    }
  }

  resize() {}

  setDebug(debug) {}
}
