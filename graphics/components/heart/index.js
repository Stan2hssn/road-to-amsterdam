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
} from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Pane } from "tweakpane";

import Common from "../../Common";
import Device from "../..//pure/Device";

import vertexShader from "../glsl/heart/heart.vert";
import fragmentShader from "../glsl/heart/heart.frag";

export default class {
  params = {
    morphTargetInfluences: [0, 0, 0, 0, 0], // Array to match the morph targets in the shader
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
    uZoom: 2.4,
    uShiftY: 0.8,
    uShiftX: 2.35,
  };

  constructor(posX, posY, posZ) {
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
    console.log("video", video);

    this.video = new VideoTexture(video);
    this.video.colorSpace = SRGBColorSpace;

    console.log("this.textures.video", this.video);
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
        viewMatrixCamera: new Uniform(viewMatrixCamera),
        projectionMatrixCamera: new Uniform(projectionMatrixCamera),
        modelMatrixCamera: new Uniform(modelMatrixCamera),
        projPosition: new Uniform(projPosition),
        uTexture: new Uniform(null),
        uTransmission: new Uniform(0),
        uVideoTexture: new Uniform(this.video),
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
        uZoom: new Uniform(this.params.uZoom),
        uShiftY: new Uniform(this.params.uShiftY),
        uShiftX: new Uniform(this.params.uShiftX),
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true,
    });

    console.log(
      "projPosition",
      this.material.uniforms.viewMatrixCamera,
      this.material.uniforms.projectionMatrixCamera,
      this.material.uniforms.modelMatrixCamera,
      this.material.uniforms.projPosition,
    );

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

    this.dummy = new Mesh(new PlaneGeometry(1, 1), this.material);

    // Common.pages.About.scenes.story.add(this.dummy);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    this.elapsedTime = t - this.previousTime;
    this.previousTime = t;
    // this.material.uniforms.uTime.value = t * 0.001;

    // if (this.mixer) {
    //   this.mixer.update(this.elapsedTime * 0.001);

    //   // Update the morph target influences uniform
    //   this.material.uniforms.morphTargetInfluences.value =
    //     this.gltf.morphTargetInfluences.slice();
    // }
  }

  resize(scale, height, width) {
    this.scale = scale;
    this.height = height;
    this.width = width;

    this.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);

    if (!this.gltf) return;
    const rect = document.querySelector(".heart").getBoundingClientRect();
    const gltfScale = rect.width * 0.5;

    this.gltf.scale.set(gltfScale, gltfScale, gltfScale);

    this.gltf.position.y =
      -rect.top + Device.scrollTop - rect.height * 0.5 + this.height * 0.5;

    this.dummy.scale.set(rect.width, rect.width, 1);

    this.dummy.position.set(
      rect.left + rect.width * 0.5 - width * 0.5,
      -rect.top + Device.scrollTop - rect.height * 0.5 + height * 0.5,
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
  }
}
