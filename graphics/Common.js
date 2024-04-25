import Device from "./pure/Device.js";

import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  OrthographicCamera,
  WebGLRenderTarget,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  TextureLoader,
  Uniform,
  Vector2,
  Raycaster,
  SphereGeometry,
  MeshBasicMaterial,
} from "three";

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

import { Pane } from "tweakpane";
import gsap from "gsap";

import Input from "./Input";

class Common {
  // create a scene and the parameters for the scene
  scene = new Scene();
  params = {
    uProgress: 0,
    sceneColor: 0x08092d,
    cameraFov: 50,
    cameraNear: 0.01,
    cameraFar: 100.0,
  };

  constructor() {
    this.scene.background = new Color(this.params.sceneColor);

    this.canClick = false;

    this.aspect = Device.viewport.width / Device.viewport.height;
    this.frustumSize = Device.viewport.height / 2;

    this.camera = new OrthographicCamera(
      (this.frustumSize * this.aspect) / -2,
      (this.frustumSize * this.aspect) / 2,
      this.frustumSize / 2,
      this.frustumSize / -2,
      0.1,
      1000,
    );

    this.camera.position.set(1.9, 2.5, 2.0);

    this.camera.setViewOffset(
      Device.viewport.width,
      Device.viewport.height,
      50,
      -500,
      Device.viewport.width,
      Device.viewport.height,
    );

    this.render = this.render.bind(this);
  }

  setupFBO() {
    this.images = [
      "/Textures/state1.jpg",
      "/Textures/state2.jpg",
      "/Textures/state6.jpg",
      "/Textures/state4.jpg",
      "/Textures/state3.jpg",
    ];

    this.fbo = new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
    );

    this.fboScene = new Scene();
    this.fboCamera = new OrthographicCamera(-1, 1, 1, -1, -1, 1);

    this.select1 = 2;
    this.select2 = 3;

    this.texture1 = this.images[2];
    this.texture2 = this.images[3];

    this.state1 = new TextureLoader().load(this.texture1);
    this.state2 = new TextureLoader().load(this.texture2);

    this.fboGeometry = new PlaneGeometry(2, 2);
    this.fboMaterial = new ShaderMaterial({
      uniforms: {
        uProgress: new Uniform(this.params.uProgress),
        uState1: { value: this.state1 },
        uState2: { value: this.state2 },
        uFBO: { value: null },
        uMouse: new Uniform(new Vector2(Input.coords.x, Input.coords.y)),
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    this.fboQuad = new Mesh(this.fboGeometry, this.fboMaterial);

    this.fboScene.add(this.fboQuad);
  }

  setRaycaster() {
    this.raycaster = new Raycaster();

    this.dummy = new Mesh(
      new PlaneGeometry(500, 500, 1, 1),
      new MeshBasicMaterial({ wireframe: true, visible: false }),
    );
    this.dummy.rotateX(-Math.PI / 2);

    this.ball = new Mesh(
      new SphereGeometry(20, 32, 32),
      new MeshBasicMaterial({ color: 0x00ff00, visible: false }),
    );

    this.scene.add(this.dummy, this.ball);
  }

  init({ canvas }) {
    this.setRaycaster();
    this.setupFBO();

    this.renderer = new WebGLRenderer({
      canvas: canvas,
      alpha: false,
      stencil: false,
      powerPreference: "high-performance",
      antialias: false,
    });

    this.renderer.physicallyCorrectLights = true;

    this.renderer.setPixelRatio(Device.pixelRatio);

    this.pane = new Pane();

    this.scene.position.set(0, 0, 0);

    window.addEventListener("click", this.setAction.bind(this));
  }

  render(t) {
    this.raycaster.linePrecision = 0.1;
    const pointer = new Vector2(Input.coords.x, Input.coords.y);
    this.raycaster.setFromCamera(pointer, this.camera);

    this.intersects = this.raycaster.intersectObject(this.dummy, true);

    if (this.intersects.length >= 1) {
      this.canClick = true;
      const { x, z } = this.intersects[0].point;
      this.ball.position.set(x + 280, 50, z + 280);

      this.fboMaterial.uniforms.uMouse.value = new Vector2(
        1 + x / 500 + 0.05,
        1 + z / 500 + 0.05,
      );
    } else {
      this.canClick = false;
    }

    this.fboMaterial.uniforms.uProgress.value = this.params.uProgress;
    this.renderer.setRenderTarget(this.fbo);
    this.renderer.render(this.fboScene, this.fboCamera);

    this.renderer.setRenderTarget(null);
    this.fboMaterial.uniforms.uFBO.value = this.fbo.texture;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }

  resize() {
    Device.viewport.width = this.renderer.domElement.parentElement.offsetWidth;
    Device.viewport.height =
      this.renderer.domElement.parentElement.clientHeight;

    this.aspect = Device.viewport.width / Device.viewport.height;
    this.frustumSize = Device.viewport.height / 2;

    this.camera.left = (this.frustumSize * this.aspect) / -2;
    this.camera.right = (this.frustumSize * this.aspect) / 2;
    this.camera.top = this.frustumSize / 2;
    this.camera.bottom = this.frustumSize / -2;

    this.camera.setViewOffset(
      Device.viewport.width,
      Device.viewport.height,
      50,
      -500,
      Device.viewport.width,
      Device.viewport.height,
    );

    this.camera.position.set(1.9, 2.5, 2.0);

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
  }

  setAction(action) {
    console.log("click", this.canClick);

    if (!this.canClick) return;
    if (this.params.uProgress < 0.1 || this.canClick) {
      gsap.to(this.params, {
        uProgress: 1,
        duration: 3,
        ease: "slow.inOut",
        onUpdate: () => {
          this.fboMaterial.uniforms.uProgress.value = this.params.uProgress;
        },
      });
    } else {
      gsap.to(this.params, {
        uProgress: 0,
        duration: 3,
        ease: "slow.inOut",
        onUpdate: () => {
          this.fboMaterial.uniforms.uProgress.value = this.params.uProgress;
        },
      });
    }
  }

  setDebug(debug) {
    const { debug: pane } = this;

    this.debug = this.pane.addFolder({ title: "Scene", expanded: true });

    this.debug
      .addBinding(this.params, "uProgress", {
        label: "Progress",
        step: 0.01,
        min: 0,
        max: 1,
      })
      .on("change", (value) => {
        this.params.uProgress = value.value;
      });

    this.debug
      .addButton({
        title: "Play",
        label: "Animate",
      })
      .on("click", () => {
        gsap.to(this.params, {
          uProgress: 1,
          duration: 3,
          ease: "slow.inOut",
          onUpdate: () => {
            this.fboMaterial.uniforms.uProgress.value = this.params.uProgress;
            this.debug.refresh();
          },
        });
      });

    this.debug
      .addButton({
        title: "Reset",
        label: "Reset",
      })
      .on("click", () => {
        this.params.uProgress = 0;
        this.debug.refresh();
      });

    this.debug
      .addBinding(this.images, `${this.select1}`, {
        options: {
          square: this.images[0],
          heart_MK: this.images[4],
          heart: this.images[2],
          Forever: this.images[3],
          country: this.images[1],
        },
      })
      .on("change", (value) => {
        this.texture1 = value.value;
        this.state1 = new TextureLoader().load(this.texture1);
        this.fboMaterial.uniforms.uState1.value = this.state1;
        this.params.uProgress = 0;
        this.fboMaterial.uniforms.uProgress.value = this.params.uProgress;
        this.debug.refresh();
      });

    this.debug
      .addBinding(this.images, `${this.select2}`, {
        options: {
          square: this.images[0],
          heart_MK: this.images[4],
          heart: this.images[2],
          Forever: this.images[3],
          country: this.images[1],
        },
      })
      .on("change", (value) => {
        this.texture2 = value.value;
        this.state2 = new TextureLoader().load(this.texture2);
        this.fboMaterial.uniforms.uState2.value = this.state2;
        this.params.uProgress = 0;
        this.fboMaterial.uniforms.uProgress.value = this.params.uProgress;
        this.debug.refresh();
      });
  }
}

export default new Common();
