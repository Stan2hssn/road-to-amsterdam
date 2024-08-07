import {
  ShaderMaterial,
  SphereGeometry,
  Mesh,
  Uniform,
  BufferAttribute,
  Object3D,
  Vector2,
  Vector3,
} from "three";

import vertexShader from ".././glsl/balls/balls.vert";
import fragmentShader from ".././glsl/balls/balls.frag";

import Common from "../../Common";
import Device from "../../pure/Device";

export default class {
  params = {
    uSaturation: 1,
    uRefractPower: 0.1,
    uChromaticAberration: 0.9,
    uFresnelPower: 10.0,
    uIorR: 1.16,
    uIorY: 1.15,
    uIorG: 1.14,
    uIorC: 1.22,
    uIorB: 1.22,
    uIorP: 1.22,
    uShininess: 30,
    uDiffuseness: 4,
    uLight: new Vector3(1, 1.9, 0.3),
  };

  constructor() {
    this.Balls = [];
    this.ballPositions = [];
    this.ballScales = [];
    this.init();
  }

  defineBallAttributes() {
    const responsive = Math.min(Device.aspectRatio, 1.8);

    // Define positions and scales for each sphere
    this.ballPositions = [
      [-200 * responsive, 50, -100],
      [200 * responsive, -200 / 1.8, 100],
      [-200 * responsive, -800 / 3.8, 50],
    ];

    this.ballScales = [
      [1.4, 1.4, 1.4],
      [responsive, responsive, responsive],
      [responsive * 0.6, responsive * 0.6, responsive * 0.6],
    ];
  }

  getBalls() {
    this.iSize = 3; // Number of spheres

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
        uSaturation: new Uniform(this.params.uSaturation),
        uRefractPower: new Uniform(this.params.uRefractPower),
        uChromaticAberration: new Uniform(this.params.uChromaticAberration),
        uFresnelPower: new Uniform(this.params.uFresnelPower),
        uIorR: new Uniform(this.params.uIorR),
        uIorY: new Uniform(this.params.uIorY),
        uIorG: new Uniform(this.params.uIorG),
        uIorC: new Uniform(this.params.uIorC),
        uIorB: new Uniform(this.params.uIorB),
        uIorP: new Uniform(this.params.uIorP),
        uShininess: new Uniform(this.params.uShininess),
        uDiffuseness: new Uniform(this.params.uDiffuseness),
        uLight: new Uniform(this.params.uLight),
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

  debug(debug) {
    debug
      .addBinding(this.params, "uSaturation", {
        label: "Saturation",
        min: 0,
        max: 2,
      })
      .on("change", () => {
        this.Balls.forEach((ball) => {
          ball.material.uniforms.uSaturation.value = this.params.uSaturation;
        });
      });

    debug
      .addBinding(this.params, "uRefractPower", {
        label: "Refract Power",
        min: 0,
        max: 1,
      })
      .on("change", () => {
        this.Balls.forEach((ball) => {
          ball.material.uniforms.uRefractPower.value =
            this.params.uRefractPower;
        });
      });

    debug
      .addBinding(this.params, "uChromaticAberration", {
        label: "Chromatic Aberration",
        min: 0,
        max: 1,
      })
      .on("change", () => {
        this.Balls.forEach((ball) => {
          ball.material.uniforms.uChromaticAberration.value =
            this.params.uChromaticAberration;
        });
      });

    debug
      .addBinding(this.params, "uFresnelPower", {
        label: "Fresnel Power",
        min: 0,
        max: 10,
      })
      .on("change", () => {
        this.Balls.forEach((ball) => {
          ball.material.uniforms.uFresnelPower.value =
            this.params.uFresnelPower;
        });
      });

    debug
      .addBinding(this.params, "uIorR", {
        label: "IorR",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.Balls.forEach((ball) => {
          ball.material.uniforms.uIorR.value = this.params.uIorR;
        });
      });

    debug
      .addBinding(this.params, "uIorY", {
        label: "IorY",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.Balls.forEach((ball) => {
          ball.material.uniforms.uIorY.value = this.params.uIorY;
        });
      });

    debug
      .addBinding(this.params, "uIorG", {
        label: "IorG",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.Balls.forEach((ball) => {
          ball.material.uniforms.uIorG.value = this.params.uIorG;
        });
      });

    debug
      .addBinding(this.params, "uIorC", {
        label: "IorC",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.Balls.forEach((ball) => {
          ball.material.uniforms.uIorC.value = this.params.uIorC;
        });
      });

    debug
      .addBinding(this.params, "uIorB", {
        label: "IorB",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.Balls.forEach((ball) => {
          ball.material.uniforms.uIorB.value = this.params.uIorB;
        });
      });

    debug
      .addBinding(this.params, "uIorP", {
        label: "IorP",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.Balls.forEach((ball) => {
          ball.material.uniforms.uIorP.value = this.params.uIorP;
        });
      });

    debug
      .addBinding(this.params, "uShininess", {
        label: "Shininess",
        min: 0,
        max: 30,
      })
      .on("change", () => {
        this.Balls.forEach((ball) => {
          ball.material.uniforms.uShininess.value = this.params.uShininess;
        });
      });

    debug
      .addBinding(this.params, "uDiffuseness", {
        label: "Diffuseness",
        min: 0,
        max: 15,
      })
      .on("change", () => {
        this.Balls.forEach((ball) => {
          ball.material.uniforms.uDiffuseness.value = this.params.uDiffuseness;
        });
      });

    debug.addBinding(this.params, "uLight", {
      label: "Light",
      x: { min: -10, max: 10 },
      y: { min: -10, max: 10 },
      z: { min: -10, max: 10 },
    });
  }
}
