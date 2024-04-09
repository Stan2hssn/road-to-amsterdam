import Common from "../Common";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class {
  constructor() {
    this.camera = Common.camera;
    this.renderer = Common.renderer;
    this.init();
  }

  init() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
  }

  render() {
    this.controls.update();
  }

  dispose() {
    this.controls.dispose();
  }
}
