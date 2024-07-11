import {
  BoxGeometry,
  IcosahedronGeometry,
  Mesh,
  MeshMatcapMaterial,
  PlaneGeometry,
  ShaderMaterial,
  SphereGeometry,
  CapsuleGeometry,
  TextureLoader,
  Uniform,
  Vector2,
  DodecahedronGeometry,
  Vector3,
  BackSide,
  FrontSide,
  Color,
} from "three";

import rugged from "/Texture/normal/rugged.webp";
import water from "/Texture/water.webp";
import noise from "/Texture/noise_light.jpg";
import noise_color from "/Texture/crystal_texture.jpg";

import vertexShader from "../glsl/vertex.glsl";
import fragmentShader from "../glsl/fragment.glsl";
import Common from "../../Common";
import Device from "../../pure/Device";

import { GLTFLoader } from "three/examples/jsm/Addons.js";

import { Pane } from "tweakpane";

export default class {
  params = {
    basic: 0,
    uIor: {
      x: 1.17,
      y: 1.15,
      z: 1.14,
    },
    uGlobalIor: 1,
    gltfScale: 0.6,
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    primaryColor: "#029E93",
    backgroudColor: Common.scene.background,
  };

  constructor(posX, posY, posZ) {
    this.pane = new Pane();

    this.frontTexture = null;
    this.backTexture = null;

    this.modelLoader = new GLTFLoader();
    this.loader = new TextureLoader();

    this.textures = {
      normal: this.loader.load(rugged),
      noise: this.loader.load(noise),
      noise_color: this.loader.load(noise_color),
      waterTexture: this.loader.load(water),
    };

    this.init(posX, posY, posZ);
    this.debug();
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.gltf = null;

    this.renderTexture = null;

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        winResolution: new Uniform(
          new Vector2(
            Device.viewport.width,
            Device.viewport.height,
          ).multiplyScalar(Device.pixelRatio),
        ),
        uTexture: new Uniform(null),
        uIor: new Uniform(
          new Vector3(
            this.params.uIor.x,
            this.params.uIor.y,
            this.params.uIor.z,
          ),
        ),
        normalTexture: new Uniform(this.textures.normal),
        noiseTexture: new Uniform(this.textures.noise),
        noiseColor: new Uniform(this.textures.noise_color),
        tWater: new Uniform(this.textures.waterTexture),
        uGlobalIor: new Uniform(this.params.uGlobalIor),
        uColor: new Uniform(new Color(this.params.primaryColor)),
        uBagroundColor: new Uniform(new Color(this.params.backgroudColor)),
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true,
    });

    this.modelLoader.load("/Models/Rock1.glb", (gltf) => {
      gltf.scene.scale.set(
        this.params.gltfScale,
        this.params.gltfScale,
        this.params.gltfScale,
      );
      // gltf.scene.rotation.set(0, 0, -0.3);

      gltf.scene.position.set(
        this.params.position.x,
        this.params.position.y,
        this.params.position.z,
      );

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = this.material;
          this.gltf = child;
        }
      });

      Common.scene.add(gltf.scene);
    });

    this.geometry = new SphereGeometry(1.5, 32, 32);
    // this.geometry = new IcosahedronGeometry(2);
    // this.geometry = new DodecahedronGeometry(2, 0);
    // this.geometry = new BoxGeometry(3, 3, 3);
    // this.geometry = new PlaneGeometry(3, 3);

    const { basic } = this.params;

    this.mesh = new Mesh(this.geometry, this.material);

    this.mesh.position.set(posX, posY, posZ);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    if (t * 0.0001 < 0.1) {
      return;
    }
    this.material.uniforms.uTime.value = t * 0.0001;

    this.gltf.rotation.y = t * 0.0001;

    this.mesh.visible = false;
    this.gltf.visible = false;

    Common.renderer.setRenderTarget(Common.backSide.fbo);
    Common.renderer.render(Common.scene, Common.camera);

    this.fboTexture = Common.backSide.fbo.texture;
    this.material.uniforms.uTexture.value = this.fboTexture;

    this.material.side = BackSide;

    this.mesh.visible = true;
    this.gltf.visible = true;

    Common.renderer.setRenderTarget(Common.frontSide.fbo);
    Common.renderer.render(Common.scene, Common.camera);

    this.fboTexture = Common.frontSide.fbo.texture;
    this.material.uniforms.uTexture.value = this.fboTexture;
    this.material.side = FrontSide;

    Common.renderer.setRenderTarget(null);
    Common.renderer.render(Common.scene, Common.camera);
  }

  resize() {
    this.material.uniforms.winResolution.value = new Vector2(
      Device.viewport.width,
      Device.viewport.height,
    ).multiplyScalar(Device.pixelRatio);
  }

  debug() {
    const { debug: pane } = this;

    this.debug = this.pane.addFolder({ title: "Scene", expanded: true });

    this.debug
      .addBinding(this.params, "uIor", {
        label: "Progress",
        step: 0.01,
        min: 0,
        max: 2,
      })
      .on("change", (value) => {
        this.material.uniforms.uIor.value = new Vector3(
          this.params.uIor.x,
          this.params.uIor.y,
          this.params.uIor.z,
        );
      });

    this.debug
      .addBinding(this.params, "uGlobalIor", {
        label: "global uIor",
        step: 0.01,
        min: -2,
        max: 10,
      })
      .on("change", (value) => {
        this.material.uniforms.uGlobalIor.value = this.params.uGlobalIor;
      });

    this.debug
      .addBinding(this.params, "gltfScale", {
        label: "gltf scale",
        step: 0.01,
        min: 0,
        max: 2,
      })
      .on("change", (value) => {
        this.gltf.scale.set(
          this.params.gltfScale,
          this.params.gltfScale,
          this.params.gltfScale,
        );
      });

    this.debug
      .addBinding(this.params, "position", {
        label: "position",
        step: 0.01,
        min: -10,
        max: 10,
      })
      .on("change", (value) => {
        this.gltf.position.set(
          this.params.position.x,
          this.params.position.y,
          this.params.position.z,
        );
      });
  }
}
