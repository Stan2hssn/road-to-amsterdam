import {
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  ShaderMaterial,
  Uniform,
  Color,
  Vector2,
  Sphere,
  SphereGeometry,
} from "three";

import noise from "/Texture/normal_water.webp";
import water from "/Texture/reflect.webp";
import hdri from "/Texture/hdri.jpg";

import fragment from "../glsl/backgroundFloor.frag";
import vertex from "../glsl/backgroundFloor.vert";

import { TextureLoader } from "three";

import Common from "../../Common";
import Device from "../../pure/Device";
import { Vector3 } from "three";

export default class {
  constructor(posX, posY, posZ, params) {
    this.params = params;
    this.init(posX, posY, posZ);
  }

  texture() {
    this.loaderTexture = new TextureLoader();

    this.textures = {
      noise: this.loaderTexture.load(noise),
      waterTexture: this.loaderTexture.load(water),
      hdri: this.loaderTexture.load(hdri),
    };
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.texture();
    this.ripplesGeometry = new PlaneGeometry(120, 60, 1, 1);

    this.material = new ShaderMaterial({
      uniforms: {
        uIor: new Uniform(
          new Vector3(
            this.params.uIor.x,
            this.params.uIor.y,
            this.params.uIor.z,
          ),
        ),
        uGlobalIor: new Uniform(this.params.uGlobalIor),
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
    });

    this.ripples = new Mesh(this.ripplesGeometry, this.material);

    // this.wall.position.set(0 + posX, -this.params.height / 2 + posY, 0 + posZ);

    // this.wall.rotation.set(Math.PI / , 0, 0);

    this.ripples.position.set(posX, posY, posZ);
    // this.ripples.rotation.set(Math.PI / 4, 0, 0);
  }

  dispose() {
    this.ripples.ripplesGeometry.dispose();
    this.ripples.material.dispose();
  }

  render(t) {
    this.ripples.material.uniforms.uTime.value = t * 0.0001;
  }

  resize() {
    this.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);
  }
}
