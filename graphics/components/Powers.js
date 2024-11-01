import {
  Group,
  Mesh,
  ShaderMaterial,
  Vector2,
  PlaneGeometry,
  WebGLRenderTarget,
} from "three";

import Common from "../Common";

import Floor from "./Floor";
import Clouds from "./Clouds";
import FullScreenTriangles from "../helpers/FullScreenTriangles";

import BicubicUpscaleMaterial from "./shaders/extends/BicubicUpscaleMaterial";
import Device from "../pure/Device";

export default class {
  Components = {};
  Targets = {};

  constructor() {
    this.initTargets();
    this.init();
  }

  getRenderTexture() {
    return new WebGLRenderTarget(1, 1);
  }

  initTargets() {
    this.Targets.cloudsTarget = this.getRenderTexture();
  }

  initFilter() {
    this.screenGeometry = FullScreenTriangles();
    this.screenMaterial = new BicubicUpscaleMaterial();

    this.screen = new Mesh(this.screenGeometry, this.screenMaterial);

    Common.scene.add(this.screen);
  }

  initComponents() {
    this.ComponentsGroup = new Group();
    this.Clouds = new Clouds(0, 0, 1);
  }

  init() {
    this.initFilter();
    this.initComponents();
  }

  dispose() {}

  render(t) {
    // Update the clouds animation
    this.Clouds.render(t);

    Common.renderer.setRenderTarget(this.Targets.cloudsTarget);
    Common.renderer.render(Common.filterScene, Common.filterCamera);

    // Use the texture from cloudsTarget for full-screen upscaling
    this.screenMaterial.uniforms.uTexture.value =
      this.Targets.cloudsTarget.texture;

    // Render the final scene using the main camera
    Common.renderer.setRenderTarget(null);
    Common.renderer.render(Common.scene, Common.camera);
  }

  resize() {
    this.Clouds.resize();

    Object.values(this.Targets).forEach((target) => {
      target.setSize(
        Device.viewport.width * Device.cloudsResolution,
        Device.viewport.height * Device.cloudsResolution,
      );
    });
  }
}
