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
    uGrey: new Color(0.23, 0.0, 0.0),
    uTransmissivity: 0.5,
    uIor: {
      x: 0.004,
      y: 0.002,
      z: 0.001,
    },
    uGlobalIor: 1,
    bubblesNumber: 200,
  };
  constructor() {
    this.init();
  }

  texture() {}

  init() {
    this.texture();
    this.StarterGroup = new Group();
    this.LettersGroup = new Group();

    this.Cristal = new Cristal(0, 0, 0);

    this.ProjectPage = new ProjectPage(this.params, this.model);

    Common.projectScene.add(
      this.ProjectPage.background,
      this.ProjectPage.ripples,
      this.ProjectPage.bubbles,
    );
  }

  dispose() {}

  render(t) {
    if (
      !this.ProjectPage ||
      !this.Cristal ||
      !Common.renderer ||
      !Common.projectScene ||
      !Common.projectCamera ||
      !Common.targets
    ) {
      console.error("One or more critical objects are not initialized.");
      return;
    }

    this.ProjectPage.render(t);
    this.Cristal.render(t);

    // Ensure uniforms exist before updating
    if (this.ProjectPage.background.material.uniforms.uTime) {
      this.ProjectPage.background.material.uniforms.uTime.value = t * 0.0001;
    }

    // Ripples Material
    this.ProjectPage.background.material.visible = true;
    this.ProjectPage.ripples.material.visible = false;
    this.ProjectPage.logoMaterial.visible = false;

    Common.renderer.setRenderTarget(Common.targets.ripplesTexture);
    Common.renderer.render(Common.projectScene, Common.projectCamera);

    if (this.ProjectPage.ripples.material.uniforms.uReflect) {
      this.ProjectPage.ripples.material.uniforms.uReflect.value =
        Common.targets.ripplesTexture.texture;
    }

    this.ProjectPage.background.material.visible = false;
    this.ProjectPage.ripples.material.visible = true;

    // Glass Material - BackSide
    this.ProjectPage.logoMaterial.visible = true;

    Common.renderer.setRenderTarget(Common.targets.backSide.LogoTexture);
    Common.renderer.render(Common.projectScene, Common.projectCamera);

    if (this.ProjectPage.logoMaterial.uniforms.uTransmissivity) {
      this.ProjectPage.logoMaterial.uniforms.uTransmissivity.value = 0;
    }

    if (this.ProjectPage.logoMaterial.uniforms.uTransmission) {
      this.ProjectPage.logoMaterial.uniforms.uTransmission.value =
        Common.targets.backSide.LogoTexture.texture;
    }

    this.ProjectPage.logoMaterial.side = BackSide;
    this.ProjectPage.logoMaterial.visible = true;

    // Glass Material - FrontSide
    Common.renderer.setRenderTarget(Common.targets.frontSide.LogoTexture);
    Common.renderer.render(Common.projectScene, Common.projectCamera);

    if (this.ProjectPage.logoMaterial.uniforms.uTransmissivity) {
      this.ProjectPage.logoMaterial.uniforms.uTransmissivity.value = 0.8;
    }

    if (this.ProjectPage.logoMaterial.uniforms.uTransmission) {
      this.ProjectPage.logoMaterial.uniforms.uTransmission.value =
        Common.targets.frontSide.LogoTexture.texture;
    }
    this.ProjectPage.logoMaterial.side = FrontSide;

    Common.renderer.setRenderTarget(Common.targets.bubblesRender);
    Common.renderer.render(Common.projectScene, Common.projectCamera);

    if (this.ProjectPage.bublesMaterial.uniforms.uTransmission) {
      this.ProjectPage.bublesMaterial.uniforms.uTransmission.value =
        Common.targets.bubblesRender.texture;
    }

    this.ProjectPage.bublesMaterial.visible = true;

    // Cristal
    // Render Project
    Common.renderer.setRenderTarget(Common.targets.projectRender);
    Common.renderer.render(Common.projectScene, Common.projectCamera);

    // Update the Cristal material
    this.Cristal.material.uniforms.uTexture.value =
      Common.targets.projectRender.texture;

    this.Cristal.material.side = BackSide;
    this.Cristal.material.uniforms.uTransmission.value = 0;
    this.Cristal.mesh.material.visible = true;

    // Step 2: Render the front side of the crystal
    Common.renderer.setRenderTarget(Common.targets.frontSide.Cristal);
    Common.renderer.render(Common.scene, Common.camera);

    // Update the texture uniform for the second pass
    this.Cristal.mesh.material.uniforms.uTexture.value =
      Common.targets.frontSide.Cristal.texture;

    // this.Cristal.mesh.material.visible = false;
    this.Cristal.material.side = FrontSide;
    this.Cristal.material.uniforms.uTransmission.value = 0.5;

    // Final Render: Render the entire scene to the screen
    Common.renderer.setRenderTarget(null);
    Common.renderer.render(Common.scene, Common.camera);
  }

  resize() {
    this.ProjectPage.background.scale.set(1, 1, 1);

    this.ProjectPage.resize();
    this.Cristal.resize();
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

    debug.addBinding(this.params, "uGrey", {
      label: "Grey",
      min: 0,
      max: 1,
      color: { type: "float" },
    });
  }
}
