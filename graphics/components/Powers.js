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
  TextureLoader,
  BoxGeometry,
} from "three";

import Common from "../Common";
import Device from "../pure/Device.js";

import Content from "./content/index.js";
import Balls from "./balls/index.js";
import Panel from "./panel/index.js";
import Raycaster from "./raycast/index.js";

import pixelsVertex from "./glsl/pixels/pixel.vert";
import pixelsFragment from "./glsl/pixels/pixel.frag";

import backgroundGlassFragment from "./glsl/pixels/backgroundGlass.frag";
import backgroundGlassVertex from "./glsl/pixels/backgroundGlass.vert";

import Input from "../Input.js";
import backLink from "./backLink/index.js";
import heart from "./heart/index.js";

export default class {
  Component = {};
  Background = {};
  Helpers = {};
  Screens = {};
  Groups = {};

  constructor() {
    this.loader = new TextureLoader();

    this.loadTextures();
    this.init();
  }

  loadTextures() {
    this.textures = {
      frostedGlass: this.loader.load("./Texture/frostedGlass.jpg"),
      noiseTexture: this.loader.load("./Texture/noise_light.jpg"),
    };
  }

  init() {
    this.setupRenderTarget();

    this.Screens.hero = this.createScreen("hero");
    this.Screens.key = this.createScreen("key", true);
    this.Screens.story = this.createScreen("story");
    // this.Screens.memory = this.createScreen("memory");

    this.setBackgroundGlass();

    // this.Helpers.raycaster = new Raycaster();

    this.Component.Panel = new Panel();

    this.Component.backLink = new backLink();
    this.Component.Content = new Content();
    this.Component.Balls = new Balls();
    this.Component.heart = new heart();
    this.addObjects();
  }

  addObjects() {
    Object.keys(this.Screens).forEach((key) => {
      Common.pages.About.scenes.main.add(this.Screens[key]);
    });
  }

  setBackgroundGlass() {
    this.Background.glass = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        vertexShader: backgroundGlassVertex,
        fragmentShader: backgroundGlassFragment,
        uniforms: {
          uTime: new Uniform(0),
          uResolution: new Uniform(
            new Vector2(
              Device.viewport.width,
              Device.viewport.height,
            ).multiplyScalar(Device.pixelRatio),
          ),
          uTexture: new Uniform(null),
          frostedGlass: new Uniform(this.textures.frostedGlass),
          noiseTexture: new Uniform(this.textures.noiseTexture),
          uShift: new Uniform(0),
          uCoords: new Uniform(Input.coords),
          uBackground: new Uniform(Common.params.sceneColor),
        },
      }),
    );

    Common.pages.About.scenes.key.add(this.Background.glass);
  }

  getRenderTarget() {
    return new WebGLRenderTarget(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height * Device.pixelRatio,
    );
  }

  setupRenderTarget() {
    this.targets = {
      glassy: {
        backSide: this.getRenderTarget(),
        frontSide: this.getRenderTarget(),
      },
      blured: this.getRenderTarget(),
      about: {
        hero: this.getRenderTarget(),
        key: this.getRenderTarget(),
        story: this.getRenderTarget(),
        memory: this.getRenderTarget(),
      },
    };
  }

  dispose() {
    Object.values(this.targets).forEach((target) => target.dispose());
  }

  createScreen(className, border) {
    border === true ? (border = 1) : (border = 0);

    const mesh = new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        vertexShader: pixelsVertex,
        fragmentShader: pixelsFragment,
        uniforms: {
          uTime: new Uniform(0),
          uResolution: new Uniform(
            new Vector2(
              Device.viewport.width,
              Device.viewport.height,
            ).multiplyScalar(Device.pixelRatio),
          ),
          uTexture: new Uniform(null),
          uBoolean: new Uniform(border),
        },
      }),
    );

    mesh.userData.class = `.${className}`;

    return mesh;
  }

  renderHero() {
    // Ensure ballMaterial and texture are properly set up
    this.Component.Balls.ballMaterial.visible = false;

    Common.renderer.setRenderTarget(this.targets.glassy.backSide);
    Common.renderer.render(
      Common.pages.About.scenes.hero,
      Common.pages.About.cameras.hero.main,
    );

    this.Component.Balls.ballMaterial.side = BackSide;

    this.Component.Balls.ballMaterial.uniforms.tTransmission.value =
      this.targets.glassy.backSide.texture;

    this.Component.Balls.ballMaterial.visible = true;

    Common.renderer.setRenderTarget(this.targets.glassy.frontSide);
    Common.renderer.render(
      Common.pages.About.scenes.hero,
      Common.pages.About.cameras.hero.main,
    );

    this.Component.Balls.ballMaterial.uniforms.tTransmission.value =
      this.targets.glassy.frontSide.texture;

    this.Component.Balls.ballMaterial.side = FrontSide;

    Common.renderer.setRenderTarget(this.targets.about.hero);
    Common.renderer.render(
      Common.pages.About.scenes.hero,
      Common.pages.About.cameras.hero.main,
    );

    this.Screens.hero.material.uniforms.uTexture.value =
      this.targets.about.hero.texture;

    this.Background.glass.material.uniforms.uTexture.value =
      this.targets.about.hero.texture;
  }

  renderKey() {
    Common.renderer.setRenderTarget(this.targets.about.key);
    Common.renderer.render(
      Common.pages.About.scenes.key,
      Common.pages.About.cameras.key.main,
    );

    this.Screens.key.material.uniforms.uTexture.value =
      this.targets.about.key.texture;
  }

  renderStory(t) {
    Common.renderer.setRenderTarget(this.targets.about.story);
    Common.renderer.render(
      Common.pages.About.scenes.story,
      Common.pages.About.cameras.story.main,
    );

    this.Screens.story.material.uniforms.uTexture.value =
      this.targets.about.story.texture;
  }

  renderMemory(t) {
    Common.renderer.setRenderTarget(this.targets.about.memory);
    Common.renderer.render(
      Common.pages.About.scenes.memory,
      Common.pages.About.cameras.memory.main,
    );

    this.Screens.memory.material.uniforms.uTexture.value =
      this.targets.about.memory.texture;
  }

  render(t) {
    Object.keys(this.Component).forEach((key) => {
      if (typeof this.Component[key].render === "function") {
        this.Component[key].render(t);
      }
    });

    Object.keys(this.Helpers).forEach((key) => {
      if (typeof this.Helpers[key].render === "function") {
        this.Helpers[key].render(t);
      }
    });

    this.Background.glass.y = -Device.scrollTop * 0.1;

    this.renderHero();
    this.renderKey();
    this.renderStory(t);
    // this.renderMemory(t);

    Common.renderer.setRenderTarget(null);
    Common.renderer.render(
      Common.pages.About.scenes.main,
      Common.pages.About.cameras.main,
    );

    // Common.renderer.render(
    //   Common.pages.About.scenes.story,
    //   Common.pages.About.cameras.story.main,
    // );

    // Common.renderer.render(
    //   Common.pages.About.scenes.depth,
    //   Common.pages.About.cameras.depth.main,
    // );
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

    Object.keys(this.Screens).forEach((key) => {
      const target = this.Screens[key].userData.class;

      const rect = document.querySelector(target).getBoundingClientRect();

      this.Screens[key].material.uniforms.uResolution.value
        .set(Device.viewport.width, Device.viewport.height)
        .multiplyScalar(Device.pixelRatio);

      this.Screens[key].scale.set(rect.width, rect.height, 1);

      this.Screens[key].position.set(
        rect.left + rect.width * 0.5 - width * 0.5,
        -rect.top + Device.scrollTop - rect.height * 0.5 + height * 0.5,
        0,
      );
    });

    const keySize = document.querySelector(".key").getBoundingClientRect();

    this.Background.glass.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);

    const distance = 100;

    this.Background.glass.scale.set(keySize.width, keySize.height * scale, 1);

    this.Background.glass.position.set(0, 0, -distance);
  }

  debug(pane) {
    Object.keys(this.Component).forEach((key) => {
      if (typeof this.Component[key].debug === "function") {
        this.Component[key].debug(pane);
      }
    });
  }
}
