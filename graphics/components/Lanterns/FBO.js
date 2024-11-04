import {
  BoxGeometry,
  Mesh,
  MeshMatcapMaterial,
  ShaderMaterial,
  TextureLoader,
  Uniform,
} from "three";

import Texture from "/Texture/texture.png";

import vertexShader from "../glsl/vertex.glsl";
import fragmentShader from "../glsl/fragment.glsl";

export default class {
  params = {
    basic: 0,
  };

  constructor(posX, posY, posZ) {
    this.loader = new TextureLoader();

    this.textures = {
      matcap: this.loader.load(Texture),
    };
    this.init(posX, posY, posZ);
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.geometry = new BoxGeometry(1, 1, 1);

    const { basic } = this.params;

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        default: new Uniform(basic),
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
    this.material.matcap = this.textures.matcap;

    this.mesh = new Mesh(this.geometry, this.material);

    this.mesh.position.set(posX, posY, posZ);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    this.mesh.material.uniforms.uTime.value = t / 60;
  }

  resize() {}
}
