import { PerspectiveCamera, OrthographicCamera, Vector3 } from "three";
import Device from "../pure/Device.js";
import Common from "../Common.js";
import gsap from "gsap";

class CameraManager {
  constructor(params) {
    this.params = params;
    this.currentPosition = new Vector3();
    this.currentLookingAt = new Vector3();
    this.offset = 0;

    this.keyPositions = [
      { x: 0, y: 4, z: 30 },
      { x: 0, y: 2, z: 8 },
      { x: 8, y: 1, z: 8 },
    ];

    this.keyLookAt = [
      { x: 0, y: 0, z: 28 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 2, z: 0 },
    ];

    this.cameras = {
      instanceCamera: null,
      mainCamera: null,
      projectionCamera: null,
      reflectionCamera: null,
    };
  }

  getPerspectiveCamera() {
    return new PerspectiveCamera(
      this.params.cameraFov,
      Device.viewport.width / Device.viewport.height,
      this.params.cameraNear,
      this.params.cameraFar,
    );
  }

  getOrthographicCamera() {
    return new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  }

  createCameras() {
    // Create Perspective Camera
    this.cameras.instanceCamera = this.getPerspectiveCamera();

    // Create Orthographic Camera
    this.cameras.mainCamera = this.getOrthographicCamera();

    // Create projection Camera
    this.cameras.projectionCamera = this.getPerspectiveCamera();

    // Create reflection Camera
    this.cameras.reflectionCamera = this.getPerspectiveCamera();

    // Set initial camera animation parameters
    this.setupCameraAnimation();
  }

  setupCameraAnimation() {
    this.currentPosition.set(
      this.keyPositions[0].x,
      this.keyPositions[0].y,
      this.keyPositions[0].z,
    );

    this.currentLookingAt.set(
      this.keyLookAt[0].x,
      this.keyLookAt[0].y,
      this.keyLookAt[0].z,
    );
  }

  render() {
    this.cameras.reflectionCamera.position.set(
      this.cameras.instanceCamera.position.x,
      -this.cameras.instanceCamera.position.y + this.offset,
      this.cameras.instanceCamera.position.z,
    );
    this.cameras.reflectionCamera.lookAt(
      this.currentLookingAt.x,
      -this.currentLookingAt.y,
      this.currentLookingAt.z,
    );
  }

  animateToStep(stepIndex) {
    if (stepIndex >= this.keyPositions.length || stepIndex < 0) return;

    gsap.to(this.currentPosition, {
      duration: 3,
      x: this.keyPositions[stepIndex].x,
      y: this.keyPositions[stepIndex].y,
      z: this.keyPositions[stepIndex].z,
      ease: "power2.inOut",
      onUpdate: () => {
        if (this.cameras.instanceCamera) {
          this.cameras.instanceCamera.position.copy(this.currentPosition);
        }
      },
    });

    gsap.to(this.currentLookingAt, {
      duration: 3.2,
      x: this.keyLookAt[stepIndex].x,
      y: this.keyLookAt[stepIndex].y,
      z: this.keyLookAt[stepIndex].z,
      ease: "power2.inOut",
      onUpdate: () => {
        if (this.cameras.instanceCamera) {
          this.cameras.instanceCamera.lookAt(this.currentLookingAt);
        }
      },
    });
  }

  resizeCamera(camera, depth = false) {
    const aspect = Device.viewport.width / Device.viewport.height;

    if (depth) {
      let depthCamera = camera;
      depthCamera.position.set(2, 2, 9);
      depthCamera.aspect = aspect;
    } else {
      camera.aspect = aspect;
      camera.position.copy(this.currentPosition);
      camera.lookAt(this.currentLookingAt);
    }

    camera.updateProjectionMatrix();
  }

  resizeCameras(aspect) {
    if (this.cameras.instanceCamera) {
      this.resizeCamera(this.cameras.instanceCamera);
    }
    if (this.cameras.mainCamera) {
      this.cameras.mainCamera.left = -1;
      this.cameras.mainCamera.right = 1;
      this.cameras.mainCamera.top = 1;
      this.cameras.mainCamera.bottom = -1;

      this.cameras.mainCamera.position.set(0, 0, 1);

      this.cameras.mainCamera.updateProjectionMatrix();
    }
    this.cameras.projectionCamera.position.set(0, 1.8 * aspect, 28);
    this.cameras.projectionCamera.lookAt(0, 0, 28);
    this.cameras.projectionCamera.aspect = 2.26;
    this.cameras.projectionCamera.updateProjectionMatrix();
    this.cameras.projectionCamera.updateMatrixWorld();

    this.cameras.reflectionCamera.aspect = aspect;
    this.cameras.reflectionCamera.updateProjectionMatrix();
  }

  setDebug(debug) {
    if (!debug) {
      console.error("Debug object is not defined.");
      return;
    }

    // Set up debug bindings
    this.debug = debug;
    const camFolder = this.debug.addFolder({ title: "Camera" });
    camFolder.addBinding(this, "offset", {
      label: "Offset",
      min: 0,
      max: 20,
      step: 1,
    });
  }
}

export default CameraManager;
