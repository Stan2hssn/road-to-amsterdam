import { PlaneGeometry, MeshBasicMaterial, Mesh } from "three";

import Common from "../../Common";

export default class {
  constructor() {
    this.waterGeometry = null;
    this.waterMaterial = null;
    this.water = null;
    this.init();
  }

  initWater() {
    this.waterGeometry = new PlaneGeometry(100, 100, 1, 1);
    this.waterMaterial = new MeshBasicMaterial({
      color: 0x0000ff,
      // map:
    });

    this.water = new Mesh(this.waterGeometry, this.waterMaterial);

    this.water.rotation.x = -Math.PI / 2;

    Common.sceneManager.scenes.instanceScene.add(this.water);
  }

  init() {
    this.initWater();
  }

  dispose() {}

  render(t) {}

  resize() {}

  setDebug(debug) {}
}
