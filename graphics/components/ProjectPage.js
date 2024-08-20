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
  BufferGeometry,
  BufferAttribute,
  Points,
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
import vertexBubbles from "./glsl/glass/bubbles.vert";
import fragmentBubbles from "./glsl/glass/bubbles.frag";

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

    this.background.position.set(0, -30, -60);

    this.background.rotation.set(Math.PI / 4, 0, 0);
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

    this.ripples.position.set(0, -30, -60);
    this.ripples.rotation.set(Math.PI / 3.5, 0, 0);
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

  setBubbles() {
    this.bublesMaterial = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        uTransmission: new Uniform(null),
        uResolution: new Uniform(
          new Vector2(
            Device.viewport.width,
            Device.viewport.height,
          ).multiplyScalar(Device.pixelRatio),
        ),
      },
      vertexShader: vertexBubbles,
      fragmentShader: fragmentBubbles,
      side: 2,
    });

    this.bubblesNumber = this.params.bubblesNumber;

    this.bublesGeometry = new BufferGeometry();
    this.bubblePositions = new Float32Array(this.bubblesNumber * 3);
    this.bubblesRandom = new Float32Array(this.bubblesNumber * 3);
    this.bubblesUv = new Float32Array(this.bubblesNumber);

    for (let i = 0; i < this.bubblesNumber; i++) {
      this.bubblePositions[i * 3] = Math.random() * 40 - 20;
      this.bubblePositions[i * 3 + 1] = Math.random() * 100 - 50;
      this.bubblePositions[i * 3 + 2] = Math.random() * 20 - 30;

      this.bubblesRandom[i * 3] = Math.random();
      this.bubblesRandom[i * 3 + 1] = Math.random();
      this.bubblesRandom[i * 3 + 2] = Math.random();

      this.bubblesUv[i] = Math.random();
    }

    this.bublesGeometry.setAttribute(
      "position",
      new BufferAttribute(this.bubblePositions, 3),
    );

    this.bublesGeometry.setAttribute(
      "aRandom",
      new BufferAttribute(this.bubblesRandom, 3),
    );

    this.bublesGeometry.setAttribute(
      "uvs",
      new BufferAttribute(this.bubblesUv, 1),
    );

    this.bubbles = new Points(this.bublesGeometry, this.bublesMaterial);
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
        uIor: new Uniform(
          new Vector3(
            this.params.uIor.x,
            this.params.uIor.y,
            this.params.uIor.z,
          ),
        ),
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
      gltf.scene.scale.set(1.3, 1.3, 1.3);
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
    this.setBubbles();

    this.latelier = this.getModel(this.model.AtelierCO);
  }

  dispose() {
    this.ripples.ripplesGeometry.dispose();
    this.ripples.material.dispose();
  }

  render(t) {
    this.ripples.material.uniforms.uTime.value = t * 0.0001;
    this.bublesMaterial.uniforms.uTime.value = t * 0.0001;
    this.logoMaterial.uniforms.uTime.value = t * 0.0001;
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

    this.bublesMaterial.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);
  }
}
