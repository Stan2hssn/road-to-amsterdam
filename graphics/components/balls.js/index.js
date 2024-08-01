import {
  ShaderMaterial,
  SphereGeometry,
  Mesh,
  Uniform,
  Object3D,
  Vector2,
} from "three";

import vertexShader from ".././glsl/balls/balls.vert";
import fragmentShader from ".././glsl/balls/balls.frag";

import Common from "../../Common";
import Device from "../../pure/Device";

export default class {
  constructor() {
    this.params = {
      debug: false,
    };
    this.Balls = [];
    this.ballPositions = [];
    this.ballScales = [];
    this.init();
  }

  defineBallAttributes() {
    const responsive = Math.min(Device.aspectRatio, 1.8);

    // Define positions and scales for each sphere
    this.ballPositions = [
      [-200 * responsive, 0, -100],
      [230 * responsive, -200 / 1.8, 100],
    ];

    this.ballScales = [
      [1.4, 1.4, 1.42],
      [responsive, responsive, responsive],
    ];
  }

  getBalls() {
    this.iSize = 2; // Number of spheres

    // Reuse geometry and material for all spheres
    this.ballGeometry = new SphereGeometry(50, 32, 32);
    this.ballMaterial = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        tTransmission: new Uniform(null),
        uResolution: new Uniform(
          new Vector2(
            Device.viewport.width,
            Device.viewport.height,
          ).multiplyScalar(Device.pixelRatio),
        ),
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    for (let i = 0; i < this.iSize; i++) {
      const ball = new Mesh(this.ballGeometry, this.ballMaterial);
      ball.position.set(...this.ballPositions[i]);
      ball.scale.set(...this.ballScales[i]);
      this.Balls.push(ball);
    }
  }

  init() {
    this.defineBallAttributes(); // Define initial positions and scales
    this.getBalls();
    this.Balls.forEach((ball) => {
      Common.scene.add(ball);
    });
  }

  dispose() {
    this.Balls.forEach((ball) => {
      Common.scene.remove(ball);
      ball.geometry.dispose();
      ball.material.dispose();
    });
  }

  render(t) {
    this.Balls.forEach((ball) => {
      ball.material.uniforms.uTime.value = t; // Update uTime uniform
    });
  }

  resize() {
    this.ballMaterial.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);

    this.defineBallAttributes(); // Update positions and scales based on the new responsive value

    this.Balls.forEach((ball, i) => {
      ball.position.set(...this.ballPositions[i]);
      ball.scale.set(...this.ballScales[i]);
    });
  }

  setDebug(debug) {
    this.params.debug = debug;
  }
}
