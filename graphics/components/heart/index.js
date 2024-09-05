import {
  BoxGeometry,
  IcosahedronGeometry,
  Mesh,
  ShaderMaterial,
  PlaneGeometry,
  SphereGeometry,
  TextureLoader,
  Uniform,
  Vector2,
  Vector3,
  Color,
  AnimationMixer,
  DodecahedronGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  SRGBColorSpace,
  VideoTexture,
  Matrix3,
  Matrix4,
  WebGLRenderTarget,
} from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Pane } from "tweakpane";

import Common from "../../Common";
import Device from "../..//pure/Device";

import vertexShader from "../glsl/heart/heart.vert";
import fragmentShader from "../glsl/heart/heart.frag";
import { BackSide } from "three";
import { FrontSide } from "three";

export default class {
  params = {
    morphTargetInfluences: [0, 0, 0, 0, 0], // Array to match the morph targets in the shader
    uSaturation: 1,
    uRefractPower: 0.1,
    uChromaticAberration: 0.9,
    uFresnelPower: 7.0,
    uIorR: 1.16,
    uIorY: 1.15,
    uIorG: 1.14,
    uIorC: 1.22,
    uIorB: 1.22,
    uIorP: 1.22,
    uShininess: 40,
    uDiffuseness: 1,
    uLight: new Vector3(1, 1.9, 0.3),
    uZoom: 2.4,
    uShiftY: 0.8,
    uShiftX: 2.35,
  };

  constructor(target1, target2) {
    this.backSide = new WebGLRenderTarget(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height * Device.pixelRatio,
    );
    this.frontSide = target2;
    this.pane = new Pane();
    this.modelLoader = new GLTFLoader();
    this.loader = new TextureLoader();

    this.textures = {};

    this.loadTextures();
    this.init();
    // this.debug();
  }

  loadTextures() {
    this.textures = {
      video: this.loader.load("./Texture/Videos/memory.jpg"),
    };

    const video = document.getElementById("video");
    video.muted = true;
    video.play();

    this.video = new VideoTexture(video);
    this.video.colorSpace = SRGBColorSpace;
  }

  init() {
    this.gltf = null;
    this.renderTexture = null;

    const camera = Common.pages.About.cameras.memory.main;

    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    camera.updateWorldMatrix();

    const viewMatrixCamera = camera.matrixWorldInverse.clone();
    const projectionMatrixCamera = camera.projectionMatrix.clone();
    const modelMatrixCamera = camera.matrixWorld.clone();
    const projPosition = camera.position.clone();

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        uResolution: new Uniform(
          new Vector2(
            Device.viewport.width,
            Device.viewport.height,
          ).multiplyScalar(Device.pixelRatio),
        ),

        // Camera
        viewMatrixCamera: new Uniform(viewMatrixCamera),
        projectionMatrixCamera: new Uniform(projectionMatrixCamera),
        modelMatrixCamera: new Uniform(modelMatrixCamera),
        projPosition: new Uniform(projPosition),

        // Textures
        uTexture: new Uniform(null),
        uVideoTexture: new Uniform(this.video),

        // Transition
        uTransmission: new Uniform(0),

        // Refraction
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

        // Focus
        uZoom: new Uniform(this.params.uZoom),
        uShiftY: new Uniform(this.params.uShiftY),
        uShiftX: new Uniform(this.params.uShiftX),

        // Add the morph target influences uniform for animation
        morphTargetInfluences: new Uniform(this.params.morphTargetInfluences),
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true,
    });

    this.modelLoader.load("/Models/Heart_V3.glb", (gltf) => {
      gltf.scene.position.set(0, 0, -200);
      gltf.scene.rotation.set(0, -Math.PI * 0.5, 0);

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = this.material;
          //   child.material = new MeshBasicMaterial({
          //     color: 0x333333,
          //   });
          this.gltf = child;
        }
      });

      if (gltf.animations.length > 0) {
        this.mixer = new AnimationMixer(gltf.scene);
        this.mixer.clipAction(gltf.animations[0]).play();

        if (this.gltf.geometry.morphAttributes.position.length > 0) {
          this.gltf.geometry.attributes.morphTarget0 =
            this.gltf.geometry.morphAttributes.position[0];
          this.gltf.geometry.attributes.morphTarget1 =
            this.gltf.geometry.morphAttributes.position[1];
          this.gltf.geometry.attributes.morphTarget2 =
            this.gltf.geometry.morphAttributes.position[2];
          this.gltf.geometry.attributes.morphTarget3 =
            this.gltf.geometry.morphAttributes.position[3];
          this.gltf.geometry.attributes.morphTarget4 =
            this.gltf.geometry.morphAttributes.position[4];
        }
      }

      Common.pages.About.scenes.story.add(gltf.scene);
      this.resize(Common.scale, Device.viewport.height, Device.viewport.width);
    });

    this.dummy = new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
        fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform vec2 uResolution;
        void main() {
            vec2 winUv = gl_FragCoord.xy / uResolution.xy;
          vec4 texture = texture2D(uTexture, vUv);

          gl_FragColor = vec4(winUv, 1.0, 1.0);
          gl_FragColor = texture;
        }
        `,
        uniforms: {
          uResolution: new Uniform(
            new Vector2(
              Device.viewport.width,
              Device.viewport.height,
            ).multiplyScalar(Device.pixelRatio),
          ),
          uTexture: new Uniform(null),
        },
      }),
    );

    // Common.pages.About.scenes.story.add(this.dummy);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    this.elapsedTime = t - this.previousTime;
    this.previousTime = t;
    this.material.uniforms.uTime.value = t * 0.001;

    if (this.mixer) {
      this.mixer.update(this.elapsedTime * 0.001);
      this.material.uniforms.morphTargetInfluences.value =
        this.gltf.morphTargetInfluences.slice();
    }

    if (!this.gltf) return;

    // this.material.uniforms.uTransmission.value = 0;
    // this.gltf.material.side = BackSide;

    // // Glass Material - FrontSide
    // Common.renderer.setRenderTarget(this.backSide);
    // Common.renderer.render(
    //   Common.pages.About.scenes.story,
    //   Common.pages.About.cameras.main,
    // );
    // this.gltf.material.uniforms.uTexture.value = this.backSide.texture;
    // // this.dummy.material.uniforms.uTexture.value = this.backSide.texture;

    // this.gltf.material.uniforms.uTransmission.value = 1;

    // this.gltf.material.side = FrontSide;
  }

  resize(scale, height, width) {
    this.scale = scale;
    this.height = height;
    this.width = width;

    this.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);

    this.dummy.material.uniforms.uResolution.value =
      this.material.uniforms.uResolution.value;

    if (!this.gltf) return;
    const rect = document.querySelector(".heart").getBoundingClientRect();
    const gltfScale = rect.width * 0.5;

    this.gltf.scale.set(gltfScale, gltfScale, gltfScale);

    this.gltf.position.y =
      -rect.top + Device.scrollTop - rect.height * 0.5 + this.height * 0.5;

    this.dummy.scale.set(rect.width, rect.width, 1);

    this.dummy.position.set(
      rect.left + rect.width * 0.5 - width * 0.5,
      -rect.top + Device.scrollTop - rect.height * 0.5 + height * 0.5 + 500,
      0,
    );

    Common.pages.About.cameras.memory.main.position.set(
      0,
      this.gltf.position.y,
      Common.cameraZ,
    );

    Common.pages.About.cameras.memory.main.lookAt(0, this.gltf.position.y, 0);

    this.material.uniforms.projPosition.value =
      Common.pages.About.cameras.memory.main.position;
    this.material.uniforms.viewMatrixCamera.value =
      Common.pages.About.cameras.memory.main.matrixWorldInverse;
    this.material.uniforms.projectionMatrixCamera.value =
      Common.pages.About.cameras.memory.main.projectionMatrix;
    this.material.uniforms.modelMatrixCamera.value = this.gltf.matrixWorld;
  }

  debug(debug) {
    debug
      .addBinding(this.params, "uZoom", {
        label: "Zoom",
        min: 0,
        max: 10,
      })
      .on("change", () => {
        this.material.uniforms.uZoom.value = this.params.uZoom;
      });
    debug
      .addBinding(this.params, "uShiftY", {
        label: "Shift Y",
        min: -2,
        max: 10,
      })
      .on("change", () => {
        this.material.uniforms.uShiftY.value = this.params.uShiftY;
      });
    debug
      .addBinding(this.params, "uShiftX", {
        label: "Shift X",
        min: -2,
        max: 10,
      })
      .on("change", () => {
        this.material.uniforms.uShiftX.value = this.params.uShiftX;
      });

    debug
      .addBinding(this.params, "uSaturation", {
        label: "Saturation",
        min: 0,
        max: 2,
      })
      .on("change", () => {
        this.material.uniforms.uSaturation.value = this.params.uSaturation;
      });

    debug
      .addBinding(this.params, "uRefractPower", {
        label: "Refract Power",
        min: 0,
        max: 1,
      })
      .on("change", () => {
        this.material.uniforms.uRefractPower.value = this.params.uRefractPower;
      });

    debug
      .addBinding(this.params, "uChromaticAberration", {
        label: "Chromatic Aberration",
        min: 0,
        max: 1,
      })
      .on("change", () => {
        this.material.uniforms.uChromaticAberration.value =
          this.params.uChromaticAberration;
      });

    debug
      .addBinding(this.params, "uFresnelPower", {
        label: "Fresnel Power",
        min: 0,
        max: 10,
      })
      .on("change", () => {
        this.material.uniforms.uFresnelPower.value = this.params.uFresnelPower;
      });

    debug
      .addBinding(this.params, "uIorR", {
        label: "IorR",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.material.uniforms.uIorR.value = this.params.uIorR;
      });

    debug
      .addBinding(this.params, "uIorY", {
        label: "IorY",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.material.uniforms.uIorY.value = this.params.uIorY;
      });

    debug
      .addBinding(this.params, "uIorG", {
        label: "IorG",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.material.uniforms.uIorG.value = this.params.uIorG;
      });

    debug
      .addBinding(this.params, "uIorC", {
        label: "IorC",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.material.uniforms.uIorC.value = this.params.uIorC;
      });

    debug
      .addBinding(this.params, "uIorB", {
        label: "IorB",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.material.uniforms.uIorB.value = this.params.uIorB;
      });

    debug
      .addBinding(this.params, "uIorP", {
        label: "IorP",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.material.uniforms.uIorP.value = this.params.uIorP;
      });

    debug
      .addBinding(this.params, "uShininess", {
        label: "Shininess",
        min: 0,
        max: 100,
      })
      .on("change", () => {
        this.material.uniforms.uShininess.value = this.params.uShininess;
      });

    debug
      .addBinding(this.params, "uDiffuseness", {
        label: "Diffuseness",
        min: 0,
        max: 1,
      })
      .on("change", () => {
        this.material.uniforms.uDiffuseness.value = this.params.uDiffuseness;
      });
  }
}
