import gsap from "gsap";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
  Vector2,
  WebGLRenderTarget,
  RGBAFormat,
  NearestFilter,
  DepthFormat,
  DepthTexture,
  UnsignedShortType,
  TextureLoader,
} from "three";

import Device from "../../pure/Device";
import Common from "../../Common";
import Input from "../../Input";

import pixelsVertex from "../glsl/pixels/pixel.vert";
import screenBlur from "../glsl/pixels/blur.frag";

export default class {
  constructor() {
    this.glb = null;
    this.screen = null;
    this.renderTarget = null;
    this.glbNear = -5;
    this.glbFar = -10;
    this.timeline = gsap.timeline({ paused: true });
    this.updateCallback = false;

    this.t = 0;

    this.init();
  }

  init() {
    this.loadResources();
    this.renderTarget = this.createRenderTarget();

    this.modelLoader.load("/Models/Arrow.glb", (glb) => {
      this.setupGLBModel(glb);
      this.setupAnchorHover();
    });

    this.screen = this.createScreenMesh();
    Common.pages.About.scenes.story.add(this.screen);
  }

  loadResources() {
    this.modelLoader = new GLTFLoader();
    this.loader = new TextureLoader();
    this.noise = this.loader.load("/Texture/Maps/noise_light.jpg");
  }

  createRenderTarget() {
    const target = new WebGLRenderTarget(
      (Device.viewport.width / 4) * Device.pixelRatio,
      (Device.viewport.height / 4) * Device.pixelRatio,
    );
    target.texture.format = RGBAFormat;
    target.texture.minFilter = NearestFilter;
    target.texture.magFilter = NearestFilter;
    target.texture.generateMipmaps = false;
    target.stencilBuffer = true;
    target.depthBuffer = true;
    target.depthTexture = new DepthTexture();
    target.depthTexture.format = DepthFormat;
    target.depthTexture.type = UnsignedShortType;

    return target;
  }

  setupGLBModel(glb) {
    glb.scene.scale.set(1, 1, 1);
    glb.scene.position.set(0, 0, this.glbFar);
    glb.scene.rotation.set(0, Math.PI, 0);

    glb.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new MeshBasicMaterial({
          color: 0x236a88,
        });
      }
    });

    this.glb = glb.scene;
    Common.pages.About.scenes.depth.add(this.glb);
  }

  setupAnchorHover() {
    const anchorElements = document.querySelectorAll("a.link");

    anchorElements.forEach((anchor) => {
      anchor.addEventListener("mouseenter", () => this.start());
      anchor.addEventListener("mouseleave", () => this.stop());
    });
  }

  start() {
    if (!this.glb) return;
    this.glb.visible = true;
    gsap.to(this.glb.position, {
      z: this.glbNear,
      duration: 2,
      ease: "power4.out",
      overwrite: "auto",
      onStart: () => {
        this.screen.material.uniforms.uIntensity.value = 1;
        this.updateCallback = true;
        this.resize(
          Common.scale,
          Device.viewport.height,
          Device.viewport.width,
        );
      },
    });
  }

  stop() {
    if (!this.glb) return;

    gsap.to(this.glb.position, {
      z: this.glbFar,
      duration: 1.5,
      ease: "power1.in",
      overwrite: "auto",
      onStart: () => {
        this.updateCallback = true;
      },
      onComplete: () => {
        this.updateCallback = false;
        this.glb.visible = false;
        this.screen.material.uniforms.uIntensity.value = 0;
      },
    });
  }

  updateRotation(t) {
    if (this.updateCallback) {
      this.glb.rotation.set(
        Math.PI * 1.25,
        Math.sin(t * 0.2),
        Math.cos(t * 0.2),
      );
    }
  }

  render(t, forceRender = false) {
    if (!this.updateCallback && !forceRender) return;

    this.t += 0.04;

    this.updateRotation(this.t);

    Common.renderer.setRenderTarget(this.renderTarget);
    Common.renderer.render(
      Common.pages.About.scenes.depth,
      Common.pages.About.cameras.depth.main,
    );

    const uniforms = this.screen.material.uniforms;

    uniforms.uTime.value = this.t;
    uniforms.uMouse.value = Input.coords;
    uniforms.uInfoTexture.value = this.renderTarget.depthTexture;
    uniforms.uTexture.value = this.renderTarget.texture;
  }

  createScreenMesh() {
    return new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        vertexShader: pixelsVertex,
        fragmentShader: screenBlur,
        uniforms: {
          uTime: new Uniform(100 * Math.random()),
          uResolution: new Uniform(
            new Vector2(
              Device.viewport.width,
              Device.viewport.height,
            ).multiplyScalar(Device.pixelRatio),
          ),
          uMouse: new Uniform(Input.coords),
          uTexture: new Uniform(null),
          uInfoTexture: new Uniform(null),
          cameraNear: new Uniform(Common.params.depth.near),
          cameraFar: new Uniform(Common.params.depth.far),
          tNoise: new Uniform(this.noise),
          uIntensity: new Uniform(0),
        },
      }),
    );
  }

  resize(scale, height, width) {
    if (!this.updateCallback) return;
    const rect = document.querySelector(".back_link").getBoundingClientRect();

    this.screen.scale.set(
      Device.viewport.width * 1.9,
      Device.viewport.height * 1.9,
      1,
    );
    this.screen.position.set(
      rect.left + rect.width * 0.5 - width * 0.5,
      -rect.top + Device.scrollTop - rect.height * 0.5 + height * 0.5,
      -600,
    );

    this.screen.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);

    this.renderTarget.setSize(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height * Device.pixelRatio,
    );

    this.render(0, true);
  }

  setDebug(debug) {
    // Debugging code, if needed
  }
}
