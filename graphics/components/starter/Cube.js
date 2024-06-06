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
import noise from "/Texture/noise_light.jpg";
import noise_cache from "/Texture/noise_cache.webp";
import frosted from "/Texture/veronoi_texture.png";
import normalModel from "/Texture/normal/Rock.webp";

import vertexShader from "../glsl/vertex.glsl";
import fragmentShader from "../glsl/fragment.glsl";
import Common from "../../Common";
import Device from "../../pure/Device";

import { GLTFLoader } from "three/examples/jsm/Addons.js";

export default class {
  params = {
    basic: 0,
  };

  constructor(posX, posY, posZ) {
    this.modelLoader = new GLTFLoader();
    this.loader = new TextureLoader();

    this.textures = {
      normal: this.loader.load(rugged),
      gain: this.loader.load(gain),
      mag: this.loader.load(mag),
      noise: this.loader.load(noise),
      noise_cache: this.loader.load(noise_cache),
      frosted: this.loader.load(frosted),
      normalModel: this.loader.load(normalModel),
    };
    this.textures.normalModel.flipY = false;

    this.init(posX, posY, posZ);
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.gltf = null;

    this.renderTexture = null;

    this.modelLoader.load("/Models/Rock.glb", (gltf) => {
      gltf.scene.scale.set(0.26, 0.26, 0.26);

      const material = new ShaderMaterial({
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
          uIor: new Uniform(new Vector3(1.14, 1.16, 1.2)),
          noiseTexture: new Uniform(this.textures.noise),
          noiseCache: new Uniform(this.textures.noise_cache),
          frostedTexture: new Uniform(this.textures.frosted),
          normalModel: new Uniform(this.textures.normalModel),
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        // wireframe: true,
      });

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = material;
          this.gltf = child;
        }
      });

      Common.scene.add(gltf.scene);
    });

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
        uIor: new Uniform(new Vector3(1.14, 1.16, 1.2)),
        noiseTexture: new Uniform(this.textures.noise),
        noiseCache: new Uniform(this.textures.noise_cache),
        frostedTexture: new Uniform(this.textures.frosted),
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
    if (t * 0.0001 < 0.1) {
      return;
    }

    this.mesh.rotation.y = t * 0.0001;
    this.gltf.rotation.y = t * 0.0001;

    this.mesh.visible = false;
    this.gltf.visible = false;
    Common.renderer.setRenderTarget(Common.fbo);
    Common.renderer.render(Common.scene, Common.camera);

    this.fboTexture = Common.fbo.texture;
    this.material.uniforms.uTexture.value = this.fboTexture;
    this.gltf.material.uniforms.uTexture.value = this.fboTexture;

    this.mesh.visible = true;
    this.gltf.visible = true;
    Common.renderer.setRenderTarget(null);
    Common.renderer.render(Common.scene, Common.camera);
  }

  resize() {}
}
