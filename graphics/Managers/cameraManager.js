import { PerspectiveCamera, OrthographicCamera, Vector3 } from "three";

import Device from "../pure/Device.js";

import gsap from "gsap";

class CameraManager {
  constructor(params) {
    this.params = params;
    this.currentPosition = new Vector3();
    this.currentLookingAt = new Vector3();
    this.nextIndex = 0;

    this.keyPositions = [
      { x: 0, y: 4, z: 30 },
      { x: 0, y: 1, z: 8 },
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

  resizeCameras() {
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
  }

  setDebug(debug) {
    if (!debug) {
      console.error("Debug object is not defined.");
      return;
    }

    this.debug = debug;

    // Ajouter un bouton de débogage pour changer la position de la caméra
    const btn = this.debug.addButton({ title: "Etape suivante" });

    btn.on("click", () => {
      // Choisir la prochaine position (alterner entre les deux)
      this.nextIndex = (this.nextIndex + 1) % this.keyPositions.length;

      // Animer la position de la caméra avec GSAP
      gsap.to(this.currentPosition, {
        duration: 3,
        x: this.keyPositions[this.nextIndex].x,
        y: this.keyPositions[this.nextIndex].y,
        z: this.keyPositions[this.nextIndex].z,
        ease: "power2.inOut",
        onUpdate: () => {
          if (this.cameras.instanceCamera) {
            this.cameras.instanceCamera.position.copy(this.currentPosition);
          }
        },
      });

      // Animer le point de focus (lookAt) de la caméra avec GSAP
      gsap.to(this.currentLookingAt, {
        duration: 3.2,
        x: this.keyLookAt[this.nextIndex].x,
        y: this.keyLookAt[this.nextIndex].y,
        z: this.keyLookAt[this.nextIndex].z,
        ease: "power2.inOut",
        onUpdate: () => {
          console.log("currentPosition", this.currentLookingAt);

          if (this.cameras.instanceCamera) {
            this.cameras.instanceCamera.lookAt(this.currentLookingAt);
          }
        },
      });
    });
  }
}

export default CameraManager;
