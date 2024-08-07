import {
  FrontSide,
  Group,
  WebGLRenderTarget,
  BackSide,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Uniform,
  Mesh,
} from "three";

import Common from "../Common";
import Device from "../pure/Device.js";

import Content from "./content/index.js";
import Balls from "./balls/index.js";
import Panel from "./panel/index.js";
import Raycaster from "./raycast/index.js";

import pixelsVertex from "./glsl/pixels/about.vert";
import pixelsFragment from "./glsl/pixels/about.frag";

export default class {
  Component = {};

  constructor() {
    this.init();
  }

  init() {
    this.createScreen();
    this.setupPipeline();

    this.Component.raycaster = new Raycaster();

    this.ComponentGroup = new Group();

    this.Component.Panel = new Panel(
      this.Component.raycaster.raycasterCoords,
      this.Component.raycaster.objectId,
    );

    this.Component.Content = new Content();
    this.Component.Balls = new Balls();
  }

  getRenderTarget() {
    return new WebGLRenderTarget(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height * Device.pixelRatio,
    );
  }

  setupPipeline() {
    this.targets = {
      glassy: {
        backSide: this.getRenderTarget(),
        frontSide: this.getRenderTarget(),
      },
      blured: this.getRenderTarget(),
      about: this.getRenderTarget(),
    };
  }

  dispose() {
    Object.values(this.targets).forEach((target) => target.dispose());
  }

  renderHero() {
    // Ensure ballMaterial and texture are properly set up
    this.Component.Balls.ballMaterial.visible = false;

    Common.renderer.setRenderTarget(this.targets.glassy.backSide);
    Common.renderer.render(
      Common.pages.About.scenes.Main,
      Common.pages.About.cameras.Main,
    );

    this.Component.Balls.ballMaterial.side = BackSide;

    this.Component.Balls.ballMaterial.uniforms.tTransmission.value =
      this.targets.glassy.backSide.texture;

    this.Component.Balls.ballMaterial.visible = true;

    Common.renderer.setRenderTarget(this.targets.glassy.frontSide);
    Common.renderer.render(
      Common.pages.About.scenes.Main,
      Common.pages.About.cameras.Main,
    );

    this.Component.Balls.ballMaterial.uniforms.tTransmission.value =
      this.targets.glassy.frontSide.texture;

    this.Component.Balls.ballMaterial.side = FrontSide;
  }

  createScreen() {
    return new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        vertexShader: pixelsVertex,
        fragmentShader: pixelsFragment,
        uniforms: {
          uTime: new Uniform(0),
          uResolution: new Uniform(new Vector2()),
          tTransmission: new Uniform(null),
        },
      }),
    );
  }

  render(t) {
    Object.keys(this.Component).forEach((key) => {
      if (typeof this.Component[key].render === "function") {
        this.Component[key].render(t);
      }
    });

    this.renderHero();
    this.Component.Panel.Materials.blured.visible = false;

    Common.renderer.setRenderTarget(this.targets.blured);
    Common.renderer.render(
      Common.pages.About.scenes.Main,
      Common.pages.About.cameras.Main,
    );

    this.Component.Panel.Materials.blured.uniforms.tTransmission.value =
      this.targets.blured.texture;

    this.Component.Panel.Materials.blured.visible = true;

    // this.Component.Panel.Materials.glassy.visible = false;

    // Common.renderer.setRenderTarget(this.targets.glassy.frontSide);
    // Common.renderer.render(Common.scene, Common.cameras.Dom.MainCamera);

    // this.Component.Panel.Materials.glassy.uniforms.tTransmission.value =
    //   this.targets.glassy.frontSide.texture;

    // this.Component.Panel.Materials.glassy.visible = true;

    Common.renderer.setRenderTarget(null);
    Common.renderer.render(
      Common.pages.About.scenes.Main,
      Common.pages.About.cameras.Main,
    );
  }

  resize(scale, height, width) {
    Object.keys(this.Component).forEach((key) => {
      if (typeof this.Component[key].resize === "function") {
        this.Component[key].resize(scale, height, width);
      }
    });

    Object.keys(this.targets).forEach((key) => {
      if (this.targets[key].texture) {
        this.targets[key].setSize(
          Device.viewport.width * Device.pixelRatio,
          Device.viewport.height * Device.pixelRatio,
        );
      } else {
        Object.keys(this.targets[key]).forEach((subKey) => {
          this.targets[key][subKey].setSize(
            Device.viewport.width * Device.pixelRatio,
            Device.viewport.height * Device.pixelRatio,
          );
        });
      }
    });
  }

  debug(pane) {
    Object.keys(this.Component).forEach((key) => {
      this.Component[key].debug(pane);
    });
  }
}
