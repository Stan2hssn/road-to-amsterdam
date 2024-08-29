import { Raycaster, Uniform, Vector2 } from "three";

import Input from "../../Input.js";
import Common from "../../Common.js";
import Device from "../../pure/Device.js";

export default class {
  constructor() {
    this.raycaster = new Raycaster();
    this.interactivesObjects = Common.pages.About.groups.main.children;
    this.raycasterCoords = new Vector2();
    this.objectId = new Uniform(null);
    this.isHovering = false;

    this.init();
  }

  init() {
    console.log("this.interactivesObjects", this.interactivesObjects);
  }

  dispose() {}

  render(t) {
    const pointer = Input.coords;
    this.raycaster.setFromCamera(pointer, Common.pages.About.cameras.main);

    const intersects = this.raycaster.intersectObjects(
      this.interactivesObjects,
      true,
    );

    if (intersects.length > 0) {
      const { x, y } = intersects[0].point;

      this.objectId.value = intersects[0].object.id;
      this.raycasterCoords.set(x, y);
      this.isHovering = true;
    } else {
      this.objectId.value = null;
      this.isHovering = false;
    }
  }

  resize() {}

  setDebug(debug) {}
}
