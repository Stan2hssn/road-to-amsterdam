import {
  Group,
  Mesh,
  SphereGeometry,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  MeshBasicMaterial,
  TextureLoader,
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
  Color,
  BoxGeometry,
  Vector2,
  BackSide,
  FrontSide,
} from "three";

import Common from "../Common";
import Device from "../pure/Device";
import Input from "../Input";

import ProjectPage from "./ProjectPage.js";
import Cristal from "./Cristal.js";

export default class {
  Starter = {};
  Letters = {};

  params = {
    height: 30,
    background: new Color(0xfff2e6),
    primary: new Color(0x459392),
    secondary: new Color(0x0c4e68),
    tertiary: new Color(0x0c4e68),
    fourthary: new Color(0x083947),
    uGrey: new Color(0.22, 0.19, 0.0),
    uTransmissivity: 0.5,
    uIor: {
      x: 1.17,
      y: 1.15,
      z: 1.14,
    },
    uGlobalIor: 1,
  };
  constructor() {
    this.init();
  }

  texture() {}

  init() {
    this.texture();
    this.StarterGroup = new Group();
    this.LettersGroup = new Group();

    // this.Starter.Cristal = new Cube(0, 0, 0);

    this.ProjectPage = new ProjectPage(this.params, this.model);

    Common.projectScene.add(
      this.ProjectPage.background,
      this.ProjectPage.ripples,
    );
  }

  dispose() {}

  render(t) {
    this.ProjectPage.render(t);

    this.ProjectPage.background.material.uniforms.uTime.value = t * 0.0001;

    // Ripples Material
    this.ProjectPage.background.material.visible = true;
    this.ProjectPage.ripples.material.visible = false;
    this.ProjectPage.logoMaterial.visible = false;

    Common.renderer.setRenderTarget(Common.RipplesTexture);
    Common.renderer.render(Common.projectScene, Common.projectCamera);

    this.ProjectPage.ripples.material.uniforms.uReflect.value =
      Common.RipplesTexture.texture;

    this.ProjectPage.background.material.visible = false;
    this.ProjectPage.ripples.material.visible = true;

    // Glass Material

    // BackSide
    Common.renderer.setRenderTarget(Common.backSide.LogoTexture);
    Common.renderer.render(Common.projectScene, Common.projectCamera);
    this.ProjectPage.logoMaterial.uniforms.uTransmissivity.value = 0;

    this.ProjectPage.logoMaterial.uniforms.uTransmission.value =
      Common.backSide.LogoTexture.texture;

    this.ProjectPage.logoMaterial.side = BackSide;
    this.ProjectPage.logoMaterial.visible = true;

    // FrontSide
    Common.renderer.setRenderTarget(Common.frontSide.LogoTexture);
    Common.renderer.render(Common.projectScene, Common.projectCamera);

    this.ProjectPage.logoMaterial.uniforms.uTransmissivity.value = 0.2;
    this.ProjectPage.logoMaterial.uniforms.uTransmission.value =
      Common.frontSide.LogoTexture.texture;
    this.ProjectPage.logoMaterial.side = FrontSide;

    // Render
    Common.renderer.setRenderTarget(null);
    Common.renderer.render(Common.projectScene, Common.projectCamera);
  }

  resize() {
    Object.keys(this.Starter).forEach((key) => {
      this.Starter[key].resize();
    });

    this.ProjectPage.background.scale.set(1, 1, 1);

    this.ProjectPage.resize();
  }

  debug(debug) {
    const { debug: pane } = this;

    debug.addBinding(this.params, "secondary", {
      label: "Secondary",
      min: 0,
      max: 0xffffff,
      color: { type: "float" },
    });

    debug.addBinding(this.params, "tertiary", {
      label: "Tertiary",
      min: 0,
      max: 0xffffff,
      color: { type: "float" },
    });

    debug.addBinding(this.params, "fourthary", {
      label: "Fourthary",
      min: 0,
      max: 0xffffff,
      color: { type: "float" },
    });
  }
}
