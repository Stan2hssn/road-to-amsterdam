import {
  PlaneGeometry,
  Mesh,
  TextureLoader,
  ShaderMaterial,
  Vector2,
  Uniform,
} from "three";

import Texture from "/Texture/texture.png";

import simulationVertex from "./glsl/wind.glsl";
import simulationFragment from "./glsl/fragment.glsl";

export default class {
  constructor(posX, posY, posZ) {
    this.loader = new TextureLoader();

    this.textures = {
      matcap: this.loader.load(Texture),
    };
    this.init(posX, posY, posZ);
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.geometry = new PlaneGeometry(5, 5, 32, 32);

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        uResolution: new Uniform(
          new Vector2(window.innerWidth, window.innerHeight),
        ),
      },
      vertexShader: simulationVertex,
      fragmentShader: simulationFragment,
      wireframe: true,
    });
    this.material.matcap = this.textures.matcap;

    this.mesh = new Mesh(this.geometry, this.material);

    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.set(posX, posY, posZ);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    this.material.uniforms.uTime.value = t / 60;
    // this.mesh.rotation.x = Math.sin(t / 500);
    // this.mesh.rotation.y = Math.cos(t / 500);
  }

  resize() {}
}
