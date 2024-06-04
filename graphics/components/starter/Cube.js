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
} from "three";

import rugged from "/Texture/normal/rugged.webp";
import gain from "/Texture/normal/gain_2.jpeg";
import mag from "/Texture/mag.webp";

import vertexShader from "../glsl/vertex.glsl";
import fragmentShader from "../glsl/fragment.glsl";
import { log } from "three/examples/jsm/nodes/Nodes.js";
import Common from "../../Common";
import Device from "../../pure/Device";

export default class {
  params = {
    basic: 0,
  };

  constructor(posX, posY, posZ) {
    this.loader = new TextureLoader();

    this.textures = {
      normal: this.loader.load(rugged),
      gain: this.loader.load(gain),
      mag: this.loader.load(mag),
    };

    this.init(posX, posY, posZ);
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.renderTexture = null;

    this.geometry = new SphereGeometry(2, 32, 32);
    // this.geometry = new IcosahedronGeometry(2);
    // this.geometry = new DodecahedronGeometry(2, 0);
    // this.geometry = new BoxGeometry(3, 3, 3);
    // this.geometry = new PlaneGeometry(10, 10);

    const { basic } = this.params;

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
        normalTexture: new Uniform(this.textures.normal),
        gainTexture: new Uniform(this.textures.gain),
        magTexture: new Uniform(this.textures.mag),
        uIor: new Uniform(new Vector3(1.15, 1.16, 1.18)),
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true,
    });

    this.mesh = new Mesh(this.geometry, this.material);

    this.mesh.position.set(posX, posY, posZ);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    this.mesh.rotation.y = t * 0.001;

    this.mesh.visible = false;
    Common.renderer.setRenderTarget(Common.fbo);
    Common.renderer.render(Common.scene, Common.camera);

    this.fboTexture = Common.fbo.texture;
    this.material.uniforms.uTexture.value = this.fboTexture;

    this.mesh.visible = true;
    Common.renderer.setRenderTarget(null);
    Common.renderer.render(Common.scene, Common.camera);
  }

  resize() {}
}
