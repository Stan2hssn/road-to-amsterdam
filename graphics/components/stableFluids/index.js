import { Uniform, Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from "three";
import simulation from "./simulation.js";

import Shaders from "../glsl/Shaders.js";
import Common from "../../Common.js";

class stableFluids {
  constructor() {
    this.init();
  }

  init() {
    this.simulation = new simulation();

    this.output = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        uniforms: {
          uTime: new Uniform(0),
          velocity: new Uniform(this.simulation.fbos.vel_1.texture),
          boundarySpace: { value: new Vector2() },
        },
        vertexShader: Shaders.simulation.face,
        fragmentShader: Shaders.simulation.color,
      }),
    );

    this.addScene();
  }

  addScene() {
    Common.pages.Postprocess.scenes.main.add(this.output);
  }

  dispose() {}

  render(t) {
    this.simulation.render(t);
    this.output.material.uniforms.uTime.value = t;
  }

  resize() {
    this.simulation.resize();
  }

  setDebug(debug) {}
}

export default stableFluids;
