import {
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  ShaderMaterial,
  Uniform,
  Color,
  Vector2,
  Vector3,
  Sphere,
  SphereGeometry,
  TextureLoader,
} from "three";

import noise from "/Texture/normal_water.webp";
import water from "/Texture/reflect.webp";
import glass from "/Texture/noise_light.jpg";

import fragment from "./glsl/backgroundFloor.frag";
import vertex from "./glsl/backgroundFloor.vert";
import backgroundShader from "./glsl/background.vert";
import backgroundFragment from "./glsl/background.frag";
import glassVertex from "./glsl/glass/logo.vert";
import glassFragment from "./glsl/glass/logo.frag";

import { GLTFLoader } from "three/examples/jsm/Addons.js";

import Common from "../Common";
import Device from "../pure/Device";

import atelierLogo from "/Models/Latelier.glb?url";

export default class {
  model = {
    AtelierCO: atelierLogo,
  };

  constructor(params, model) {
    this.params = params;

    this.logo = new GLTFLoader();
    this.loaderTexture = new TextureLoader();

    this.init();
  }

  getTexture() {
    this.textures = {
      noise: this.loaderTexture.load(noise),
      waterTexture: this.loaderTexture.load(water),
      glass: this.loaderTexture.load(glass),
    };
  }

  setBackground() {
    this.background = new Mesh(
      new PlaneGeometry(200, 100, 1, 1),
      new ShaderMaterial({
        uniforms: {
          uTime: new Uniform(0),
          tNoise: new Uniform(this.textures.noise),
          tGlass: new Uniform(this.textures.waterTexture),
          uPrimary: new Uniform(this.params.primary),
          uSecondary: new Uniform(this.params.secondary),
          uThirdary: new Uniform(this.params.tertiary),
          uFourthary: new Uniform(this.params.fourthary),
          uBackground: new Uniform(new Color(this.params.background)),
          tRipples: new Uniform(this.textures.waterTexture),
          tLogo: new Uniform(null),
          uResolution: new Uniform(
            new Vector2(
              Device.viewport.width,
              Device.viewport.height,
            ).multiplyScalar(Device.pixelRatio),
          ),
        },
        vertexShader: backgroundShader,
        fragmentShader: backgroundFragment,
        side: 2,
        depthTest: true,
        depthWrite: true,
      }),
    );

    this.background.position.set(0, 0, -80);
  }

  setRipples() {
    this.ripples = new Mesh(
      new PlaneGeometry(500, 500, 1, 1),
      new ShaderMaterial({
        uniforms: {
          uTexture: new Uniform(Common.reflectTexture),
          uTime: new Uniform(0),
          tNoise: new Uniform(this.textures.noise),
          tWater: new Uniform(this.textures.waterTexture),
          tHdri: new Uniform(this.textures.hdri),
          uReflect: new Uniform(Common.reflectTexture),
          uPrimary: new Uniform(this.params.primary),
          uSecondary: new Uniform(this.params.secondary),
          uThirdary: new Uniform(this.params.tertiary),
          uFourthary: new Uniform(this.params.fourthary),
          uBackground: new Uniform(new Color(this.params.background)),
          uResolution: new Uniform(
            new Vector2(
              Device.viewport.width,
              Device.viewport.height,
            ).multiplyScalar(Device.pixelRatio),
          ),
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        side: 2,
      }),
    );

    this.ripples.position.set(0, -10, -100);
    // this.ripples.rotation.set(Math.PI / 4, 0, 0);
  }

  setRandom() {
    this.dummy = new Mesh(
      new PlaneGeometry(5, 5),
      new MeshBasicMaterial({
        color: 0x1111111,
      }),
    );

    this.dummy.position.set(0, -4, -5);
  }

  getModel(model) {
    this.frontTexture = null;
    this.backTexture = null;

    this.logoMaterial = new ShaderMaterial({
      uniforms: {
        uGrey: new Uniform(this.params.uGrey),
        uTransmissivity: new Uniform(this.params.uTransmissivity),
        uTime: new Uniform(0),
        uTransmission: new Uniform(null),
        tNoise: new Uniform(this.textures.glass),
        uResolution: new Uniform(
          new Vector2(
            Device.viewport.width,
            Device.viewport.height,
          ).multiplyScalar(Device.pixelRatio),
        ),
      },
      vertexShader: glassVertex,
      fragmentShader: glassFragment,
      transparent: true,
      side: 2,
    });

    this.logo.load(model, (gltf) => {
      gltf.scene.scale.set(1, 1, 1);
      gltf.scene.rotation.set(-0.1745329252, 0.3, -0.20943951024);
      gltf.scene.position.set(0, 0, Common.projectCameraZ);

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = this.logoMaterial;
          this.logoModel = child;
        }
      });

      Common.projectScene.add(gltf.scene);
    });
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.getTexture();
    this.setBackground();
    this.setRipples();
    this.setRandom();

    this.latelier = this.getModel(this.model.AtelierCO);

    console.log("Common.projectScene", Common.projectScene);
  }

  dispose() {
    this.ripples.ripplesGeometry.dispose();
    this.ripples.material.dispose();
  }

  render(t) {
    this.ripples.material.uniforms.uTime.value = t * 0.0001;
  }

  resize() {
    this.ripples.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);

    this.background.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);

    this.logoMaterial.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);
  }
}
