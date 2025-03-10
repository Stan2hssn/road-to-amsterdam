import {
  FloatType,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  HalfFloatType,
} from "three";

import Device from "../../pure/Device";

import ExternalForce from "./simulations/ExternalForce";

class simulation {
  params = {
    iterations_poisson: 32,
    iterations_viscous: 32,
    mouse_force: 20,
    resolution: 0.5,
    cursor_size: 100,
    viscous: 30,
    isBounce: false,
    dt: 0.014,
    isViscous: false,
    BFECC: true,
  };

  constructor() {
    this.fboSize = new Vector2();
    this.cellScale = new Vector2();
    this.boundarySpace = new Vector2();

    this.fbos = {
      vel_0: null,
      vel_1: null,

      vel_viscous_0: null,
      vel_viscous_1: null,

      div: null,

      pressure_0: null,
      pressure_1: null,
    };

    this.options = {};

    this.init();
  }

  init() {
    this.calcSize();
    this.createAllFbos();
    this.createShaderPass();
  }

  calcSize() {
    const width = Math.round(Device.viewport.width * this.params.resolution);
    const height = Math.round(Device.viewport.height * this.params.resolution);

    const px = 1 / width;
    const py = 1 / height;

    this.cellScale.set(px, py);

    this.fboSize.set(width, height);
  }

  createAllFbos() {
    const type = /(iPad|iPhone|iPod)/g.test(navigator.userAgent)
      ? HalfFloatType
      : FloatType;

    Object.keys(this.fbos).forEach((key) => {
      this.fbos[key] = new WebGLRenderTarget(this.fboSize.x, this.fboSize.y, {
        type: type,
      });
    });
  }

  createShaderPass() {
    this.externalForce = new ExternalForce({
      cellScale: this.cellScale,
      cursorSize: this.cursorSize,
      dst: this.fbos.vel_1,
    });
  }

  dispose() {}

  render(t) {
    this.externalForce.update({
      cursor_size: this.params.cursor_size,
      mouse_force: this.params.mouse_force,
      cellScale: this.cellScale,
    });
  }

  resize() {
    this.calcSize();
    for (let key in this.fbos) {
      this.fbos[key].setSize(this.fboSize.x, this.fboSize.y);
    }
  }

  setDebug(debug) {}
}

export default simulation;
