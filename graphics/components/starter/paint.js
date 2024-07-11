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

import noise from "/Texture/glass.png";
import water from "/Texture/water.png";
import reflect from "/Texture/reflect.png";
import Hdri from "/Texture/hdri.jpg";
import Hdri2 from "/Texture/hdri2.webp";

import fragment from "../glsl/backgroundFloor.frag";
import vertex from "../glsl/backgroundFloor.vert";

import { TextureLoader } from "three";

import Common from "../../Common";
import Device from "../../pure/Device";
import Powers from "../Powers";

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
      reflectTexture: this.loaderTexture.load(reflect),
      hdri: this.loaderTexture.load(Hdri),
      hdri2: this.loaderTexture.load(Hdri2),
    };
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.texture();
    this.ripplesGeometry = new PlaneGeometry(130, 50, 100, 100);

    this.material = new ShaderMaterial({
      uniforms: {
        uTexture: new Uniform(Common.reflectTexture),
        uReflect: new Uniform(this.textures.reflectTexture),
        uTime: new Uniform(0),
        tNoise: new Uniform(this.textures.noise),
        tWater: new Uniform(this.textures.waterTexture),
        tHdri: new Uniform(this.textures.hdri),
        tHdri2: new Uniform(this.textures.hdri2),
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
    this.sun = new Mesh(
      new SphereGeometry(1, 11, 11),
      new MeshBasicMaterial({
        color: 0xffffff,
      }),
    );
    this.wall = new Mesh(this.wallGeometry, this.material);

    this.sun.position.set(0, 10, -8);

    this.wall.position.set(0 + posX, -this.params.height / 2 + posY, 0 + posZ);

    // this.wall.rotation.set(Math.PI / , 0, 0);

    this.ripples.position.set(posX, posY, posZ);
    this.ripples.rotation.set(Math.PI / 2, Math.PI, -Math.PI);
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
