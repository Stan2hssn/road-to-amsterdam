import {
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
  Vector2,
  TextureLoader,
  RepeatWrapping,
  NearestMipmapLinearFilter,
} from "three";

import Device from "../pure/Device";
import Shaders from "./shaders/Shaders.js";
import Common from "../Common.js";

export default class {
  params = {
    basic: 0,
  };

  constructor(posX, posY, posZ) {
    this.loader = new TextureLoader();
    this.textures = {
      uNoise: this.loader.load("./Texture/noise.png"),
      uBlueNoise: this.loader.load("./Texture/blue-noise.png"),
      uDiffuse: this.loader.load("./Texture/test.jpg"),
    };

    Object.values(this.textures).forEach((key) => {
      key.wrapS = RepeatWrapping;
      key.wrapT = RepeatWrapping;
    });

    this.init(posX, posY, posZ);
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.clouds(posX, posY, posZ);
  }

  clouds(posX, posY, posZ) {
    this.geometry = new PlaneGeometry(2, 2, 1, 1);

    const { basic } = this.params;

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        uResolution: new Uniform(new Vector2()),
        tNoise: new Uniform(this.textures.uNoise),
        tBlueNoise: new Uniform(this.textures.uBlueNoise),
        tDiffuse: new Uniform(this.textures.uDiffuse),
        uFrame: new Uniform(0),
      },
      vertexShader: Shaders.glsl.Clouds.vertex,
      fragmentShader: Shaders.glsl.Clouds.fragment,
      transparent: true,
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.rotation.x = Math.PI;

    this.mesh.position.set(posX, posY, posZ);

    Common.filterScene.add(this.mesh);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    this.mesh.material.uniforms.uTime.value = t / 1000;
    this.mesh.material.uniforms.uFrame.value += 1;
  }

  resize() {
    this.mesh.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.cloudsResolution);
  }
}
