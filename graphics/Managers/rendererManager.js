import { WebGLRenderer } from "three";
import Device from "../pure/Device.js";

class RendererManager {
  constructor() {
    this.renderer = null;
  }

  initRender({ canvas }) {
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: false,
      stencil: false,
      powerPreference: "high-performance",
      antialias: false,
    });

    this.renderer.physicallyCorrectLights = true;
    this.renderer.setPixelRatio(Device.pixelRatio);
  }

  resizeRenderer() {
    Device.viewport.width = this.renderer.domElement.parentElement.offsetWidth;
    Device.viewport.height =
      this.renderer.domElement.parentElement.clientHeight;
    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
  }
}

export default RendererManager;
