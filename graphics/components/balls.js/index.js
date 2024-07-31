import {
  ShaderMaterial,
  SphereGeometry,
  Mesh,
  InstancedMesh,
  Uniform,
  Matrix4,
} from "three";

import vertexShader from ".././glsl/balls/balls.vert";
import fragmentShader from ".././glsl/balls/balls.frag";

import vertexBufferShader from ".././glsl/balls/trajectory.vert";
import fragmentBufferShader from ".././glsl/balls/trajectory.frag";

import Common from "../../Common";

export default class {
  params = {
    debug: false,
  };

  Balls = null;

  constructor() {
    this.init();
  }

  getBalls() {
    const ball = this.getBall();

    const trajectoryMaterial = new ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
      },
      vertexShader: vertexBufferShader,
      fragmentShader: fragmentBufferShader,
      wireframe: true,
    });

    this.ballsNumber = 3;

    const ballsPosition = new Float32Array(3 * this.ballsNumber);
    const ballsUvs = new Float32Array(2 * this.ballsNumber);

    this.Balls = new InstancedMesh(
      ball.geometry,
      trajectoryMaterial,
      this.ballsNumber,
    );

    for (let i = 0; i < this.ballsNumber; i++) {
      ballsPosition[i * 3] = Math.random() * 100 - 50;
      ballsPosition[i * 3 + 1] = Math.random() * 100 - 50;
      ballsPosition[i * 3 + 2] = Math.random() * 100 - 50;

      ballsUvs[i * 2] = Math.random();
      ballsUvs[i * 2 + 1] = Math.random();

      const matrix = new Matrix4().setPosition(
        ballsPosition[i * 3],
        ballsPosition[i * 3 + 1],
        ballsPosition[i * 3 + 2],
      );
      this.Balls.setMatrixAt(i, matrix);
    }

    this.Balls.instanceMatrix.needsUpdate = true;

    console.log("this.Balls", this.Balls);

    Common.scene.add(this.Balls);
  }

  getBall() {
    const geometry = new SphereGeometry(32, 64, 64);

    const material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(1.0),
      },
      vertexShader,
      fragmentShader,
      wireframe: true,
    });

    return new Mesh(geometry, material);
  }

  init() {
    this.getBalls();
  }

  dispose() {}

  render(t) {
    this.Balls.material.uniforms.time.value = t;
    this.Balls.instanceMatrix.needsUpdate = true;
  }

  resize() {}

  setDebug(debug) {}
}
