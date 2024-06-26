import Device from "./pure/Device.js";
import { Pane } from "tweakpane";
import { vertex, fboFragment } from "./pure/shaders.js";
import Input from "./Input.js";
import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  Raycaster,
  Vector2,
  PlaneGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Mesh,
  SphereGeometry,
  WebGLRenderTarget,
  OrthographicCamera,
  ShaderMaterial,
} from "three";

class Common {
  scene = new Scene();
  params = {
    sceneColor: 0x111111,
    cameraFov: 52,
    cameraNear: 0.01,
    cameraFar: 10000.0,
  };

  constructor() {
    this.scene.background = new Color(this.params.sceneColor);

    this.render = this.render.bind(this);
  }

  setCamera() {
    this.scale = 1;

    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraZ =
      (Device.viewport.height /
        Math.tan((this.params.cameraFov * Math.PI) / 360)) *
      0.5;

    this.z = 300;

    const camera = new PerspectiveCamera(
      this.params.cameraFov,
      Device.viewport.width / Device.viewport.height,
      this.params.cameraNear,
      this.params.cameraFar,
    );

    return camera;
  }
  setRaycaster() {
    this.raycasterPlane = new Mesh(
      new PlaneGeometry(this.frustumSize, 2),
      new MeshBasicMaterial({ color: 0x00000ff, side: DoubleSide }),
    );

    this.dummy = new Mesh(
      new SphereGeometry(0.01, 20, 20),
      new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide }),
    );

    this.raycasterPlane.position.set(0, 0, -1);
    this.raycaster = new Raycaster();
    this.pointer = new Vector2();

    this.preScene.add(this.raycasterPlane, this.dummy);
  }

  init({ canvas, scrollContainer }) {
    this.setupPipeline();
    this.camera = this.setCamera();
    this.scrollContainer = scrollContainer;

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: false,
      stencil: false,
      powerPreference: "high-performance",
      antialias: false,
    });

    this.renderer.physicallyCorrectLights = true;
    this.renderer.setPixelRatio(Device.pixelRatio);
    this.debug = window.location.hash === "#debug" ? new Pane() : null;
  }

  setupPipeline() {
    this.renderTarget = new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
    );
    this.targetA = this.renderTarget.clone();
    this.targetB = this.renderTarget.clone();

    this.fboScene = new Scene();

    this.aspect = Device.viewport.width / Device.viewport.height;
    this.frustumSize = Device.viewport.height / 2;

    this.fboCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.fboMaterial = new ShaderMaterial({
      uniforms: {
        tDiffuse: { value: this.renderTarget.texture },
        tPrev: { value: this.targetA.texture },
        uMouse: { value: new Vector2(0, 0) },
        uPrevMouse: { value: new Vector2(0, 0) },
        resolution: {
          value: new Vector2(Device.viewport.width, Device.viewport.height),
        },
        uTime: { value: 0 },
      },
      vertexShader: vertex,
      fragmentShader: fboFragment,
    });

    this.fboQuad = new Mesh(new PlaneGeometry(2, 2), this.fboMaterial);
    this.fboScene.add(this.fboQuad);

    this.preCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.preScene = new Scene();
    this.preScene.background = new Color(0xffffff);

    this.setRaycaster();
  }

  render(t) {
    if (!t) return;

    this.fboMaterial.uniforms.uTime.value = t;

    this.pointer.x = Input.coords.x;
    this.pointer.y = Input.coords.y;
    this.raycaster.setFromCamera(this.pointer, this.preCamera);
    const intersects = this.raycaster.intersectObject(this.raycasterPlane);

    if (intersects.length >= 1) {
      this.dummy.position.copy(intersects[0].point);
      const { x, y } = intersects[0].point;

      console.log("x", x, "y", y);

      this.fboMaterial.uniforms.uMouse.value = new Vector2(
        1 + x * 10,
        1 + y * 10,
      );
    }

    this.cameraY = -Device.scrollTop;
    this.scrollContainer.style.transform = `translate3d(0, ${-Device.scrollTop}px, 0)`;
    this.camera.position.set(this.cameraX, this.cameraY, this.cameraZ);
  }

  dispose() {
    this.renderer.dispose();
  }

  updateCamera() {
    const aspect = Device.viewport.width / Device.viewport.height;

    this.aspect = aspect;
    this.frustumSize = 0.1;

    // Update preCamera
    this.preCamera.left = -this.frustumSize * aspect;
    this.preCamera.right = this.frustumSize * aspect;
    this.preCamera.top = this.frustumSize;
    this.preCamera.bottom = -this.frustumSize;

    // Update fboCamera
    this.fboCamera.left = -1;
    this.fboCamera.right = 1;
    this.fboCamera.top = 1;
    this.fboCamera.bottom = -1;

    // Update perspective camera
    this.cameraZ =
      (Device.viewport.height /
        Math.tan((this.params.cameraFov * Math.PI) / 360)) *
      0.5;
    this.camera.position.set(this.cameraX, this.cameraY, this.cameraZ);
    this.camera.aspect = aspect;

    // Update projection matrices
    this.camera.updateProjectionMatrix();
    this.preCamera.updateProjectionMatrix();
    this.fboCamera.updateProjectionMatrix();
  }

  resize() {
    const parentElement = this.renderer.domElement.parentElement;
    Device.viewport.width = parentElement.offsetWidth;
    Device.viewport.height = parentElement.offsetHeight;

    this.updateCamera();

    this.renderTarget.setSize(Device.viewport.width, Device.viewport.height);
    this.targetA.setSize(Device.viewport.width, Device.viewport.height);
    this.targetB.setSize(Device.viewport.width, Device.viewport.height);

    this.renderer.setSize(Device.viewport.width, Device.viewport.height);
    this.renderer.setPixelRatio(Device.pixelRatio);

    this.fboMaterial.uniforms.resolution.value.set(
      Device.viewport.width,
      Device.viewport.height,
    );
  }

  setDebug(debug) {
    if (this.debug) {
      this.debug = this.debug.addFolder({ title: "Scene", expanded: true });
    }
  }
}

export default new Common();
