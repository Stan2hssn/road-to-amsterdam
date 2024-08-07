import Common from "../Common";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class {
  constructor() {
    this.camera = Common.cameras.MainCamera;
    this.renderer = Common.renderer;
    this.init();
  }

  init() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  render() {
    this.controls.update();
  }

  dispose() {
    this.controls.dispose();
  }
}
