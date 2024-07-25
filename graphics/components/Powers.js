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
  WebGLRenderTarget,
  LinearFilter,
  RGBAFormat,
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

  createRenderTarget() {
    return new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
      {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
      },
    );
  }

  texture() {
    this.targets = {
      frontSide: {
        Cristal: this.createRenderTarget(),
        LogoTexture: this.createRenderTarget(),
      },
      backSide: {
        Cristal: this.createRenderTarget(),
        LogoTexture: this.createRenderTarget(),
      },
      projectRender: this.createRenderTarget(),
      bubblesRender: this.createRenderTarget(),
      ripplesTexture: this.createRenderTarget(),
    };
  }

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
      !this.targets
    ) {
      console.error("One or more critical objects are not initialized.");
      return;
    }

    this.ProjectPage.render(t);
    this.Cristal.render(t);

    // Ensure uniforms exist before updating
    this.ProjectPage.background.material.uniforms.uTime.value = t * 0.0001;

    // Ripples Material
    this.ProjectPage.background.material.visible = true;
    this.ProjectPage.ripples.material.visible = false;
    this.ProjectPage.logoMaterial.visible = false;

    Common.renderer.setRenderTarget(this.targets.ripplesTexture);
    Common.renderer.render(Common.projectScene, Common.projectCamera);

    this.ProjectPage.ripples.material.uniforms.uReflect.value =
      this.targets.ripplesTexture.texture;

    this.ProjectPage.background.material.visible = false;
    this.ProjectPage.ripples.material.visible = true;

    // Glass Material - BackSide
    this.ProjectPage.logoMaterial.visible = false;

    Common.renderer.setRenderTarget(this.targets.backSide.LogoTexture);
    Common.renderer.render(Common.projectScene, Common.projectCamera);

    this.ProjectPage.logoMaterial.uniforms.uTransmissivity.value = 0;

    this.ProjectPage.logoMaterial.uniforms.uTransmission.value =
      this.targets.backSide.LogoTexture.texture;

    this.ProjectPage.logoMaterial.side = BackSide;
    this.ProjectPage.logoMaterial.visible = true;

    // Glass Material - FrontSide
    Common.renderer.setRenderTarget(this.targets.frontSide.LogoTexture);
    Common.renderer.render(Common.projectScene, Common.projectCamera);

    this.ProjectPage.logoMaterial.uniforms.uTransmissivity.value = 0.8;

    this.ProjectPage.logoMaterial.uniforms.uTransmission.value =
      this.targets.frontSide.LogoTexture.texture;

    this.ProjectPage.logoMaterial.side = FrontSide;

    Common.renderer.setRenderTarget(this.targets.bubblesRender);
    Common.renderer.render(Common.projectScene, Common.projectCamera);

    this.ProjectPage.bublesMaterial.uniforms.uTransmission.value =
      this.targets.bubblesRender.texture;

    this.ProjectPage.bublesMaterial.visible = true;

    // Cristal
    // Render Project
    Common.renderer.setRenderTarget(this.targets.projectRender);
    Common.renderer.render(Common.projectScene, Common.projectCamera);

    // Update the Cristal material
    this.Cristal.material.uniforms.uTexture.value =
      this.targets.projectRender.texture;

    this.Cristal.material.side = BackSide;
    this.Cristal.material.uniforms.uTransmission.value = 1;
    this.Cristal.mesh.material.visible = true;

    // Step 2: Render the front side of the crystal
    Common.renderer.setRenderTarget(this.targets.frontSide.Cristal);
    Common.renderer.render(Common.scene, Common.camera);

    // Update the texture uniform for the second pass
    this.Cristal.material.uniforms.uTexture.value =
      this.targets.frontSide.Cristal.texture;

    this.Cristal.mesh.material.visible = false;
    this.Cristal.material.side = FrontSide;
    this.Cristal.material.uniforms.uTransmission.value = 0;

    // Final Render: Render the entire scene to the screen
    Common.renderer.setRenderTarget(null);
    Common.renderer.render(Common.scene, Common.camera);
  }

  resizeRenderTarget(target) {
    target.setSize(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height * Device.pixelRatio,
    );
  }

  resize() {
    Object.values(this.targets).forEach((target) => {
      if (target.setSize) {
        this.resizeRenderTarget(target);
      } else {
        Object.values(target).forEach((t) => {
          this.resizeRenderTarget(t);
        });
      }
    });

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
