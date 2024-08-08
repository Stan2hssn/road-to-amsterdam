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
} from "three";

import Common from "../Common";
import Device from "../pure/Device.js";

import Content from "./content/index.js";
import Balls from "./balls/index.js";
import Panel from "./panel/index.js";
import Raycaster from "./raycast/index.js";

import pixelsVertex from "./glsl/pixels/about.vert";
import pixelsFragment from "./glsl/pixels/about.frag";

import storyFragment from "./glsl/pixels/story.frag";
import storyVertex from "./glsl/pixels/story.vert";

export default class {
  Component = {};
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
    this.Screens.story = this.createScreen("story");
    this.setBackgroundStory();

    this.Helpers.raycaster = new Raycaster();

    this.Component.Panel = new Panel(
      this.Helpers.raycaster.raycasterCoords,
      this.Helpers.raycaster.objectId,
    );

    this.Component.Content = new Content();
    this.Component.Balls = new Balls();
    this.addObjects();
  }

  addObjects() {
    Object.keys(this.Screens).forEach((key) => {
      Common.pages.About.scenes.main.add(this.Screens[key]);
    });

    // Common.pages.About.scenes.story.add(this.Component.transHero);
  }

  setBackgroundStory() {
    this.Component.backgroundStory = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        vertexShader: storyVertex,
        fragmentShader: storyFragment,
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
        },
      }),
    );

    this.Component.backgroundStory.position.z = -800;

    Common.pages.About.scenes.story.add(this.Component.backgroundStory);
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
        story: this.getRenderTarget(),
      },
    };
  }

  dispose() {
    Object.values(this.targets).forEach((target) => target.dispose());
  }

  createScreen(className) {
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

    this.Component.backgroundStory.material.uniforms.uTexture.value =
      this.targets.about.hero.texture;
  }

  renderStory() {
    Common.renderer.setRenderTarget(this.targets.about.story);
    Common.renderer.render(
      Common.pages.About.scenes.story,
      Common.pages.About.cameras.story.main,
    );

    this.Screens.story.material.uniforms.uTexture.value =
      this.targets.about.story.texture;
  }

  render(t) {
    Object.keys(this.Component).forEach((key) => {
      if (typeof this.Component[key].render === "function") {
        this.Component[key].render(t);
      }
    });

    this.Component.backgroundStory.position.y = Device.scrollTop;
    this.Component.backgroundStory.material.uniforms.uShift.value =
      Device.scrollTop;

    this.renderHero();
    this.renderStory();

    Common.renderer.setRenderTarget(null);
    Common.renderer.render(
      Common.pages.About.scenes.main,
      Common.pages.About.cameras.main,
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

    this.Component.backgroundStory.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);

    Device.aspectRatio > 1
      ? this.Component.backgroundStory.scale.set(
          Device.viewport.width * Device.aspectRatio * 2,
          Device.viewport.height * Device.aspectRatio * 2,
          1,
        )
      : this.Component.backgroundStory.scale.set(
          Device.viewport.width * 2,
          Device.viewport.height * 2,
          1,
        );

    console.log("pixelRatio", Device.pixelRatio);
  }

  debug(pane) {
    Object.keys(this.Component).forEach((key) => {
      this.Component[key].debug(pane);
    });
  }
}
