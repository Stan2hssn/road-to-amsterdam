import {
  InstancedMesh,
  BoxGeometry,
  MeshBasicMaterial,
  Object3D,
  Color,
  Uniform,
  InstancedBufferAttribute,
  Mesh,
  ShaderMaterial,
  Vector3,
} from "three";
import Common from "../../Common";

import gsap from "gsap";
import Shaders from "../../pure/Shaders";

export default class {
  constructor() {
    this.count = 1000;
    this.color = new Color();
    this.clock = 0;
    this.preClock = 0;
    this.changeValue = 0;

    // In your class constructor
    this.previousRotationAxis = new Vector3(0, 1, 0);
    this.previousAngle = 0;

    this.init();
  }

  init() {
    this.initMainLantern();
    this.initInstances();
    this.addInstance();
  }

  initMainLantern() {
    this.mainGeometryLantern = new BoxGeometry(1, 2, 1);

    this.mainlanternsMaterial = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTiltScale: { value: 0.1 }, // Ajustez cette valeur pour contrôler l'inclinaison
        uTransition: { value: 0 },
        uPreClock: new Uniform(0),
      },
      vertexShader: Shaders.Components.mainLantern.vertex,
      fragmentShader: Shaders.Components.mainLantern.fragment,
    });

    this.mainLantern = new Mesh(
      this.mainGeometryLantern,
      this.mainlanternsMaterial,
    );

    this.mainLantern.position.set(0, 1, 0);
  }

  initInstances() {
    this.loopLength = 2000.0;
    this.lanternGeometry = new BoxGeometry(1, 2, 1);

    this.lanternsMaterial = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 2.0 }, // Adjust speed as needed
        loopLength: { value: this.loopLength }, // Length at which to loop
      },
      vertexShader: Shaders.Components.lanternInstances.vertex,
      fragmentShader: Shaders.Components.lanternInstances.fragment,
    });

    this.lanterns = new InstancedMesh(
      this.lanternGeometry,
      this.lanternsMaterial,
      this.count,
    );

    const dummy = new Object3D();
    const basePositions = new Float32Array(this.count * 3);
    const randomValues = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      let posX, posY, posZ;
      let isOverlapping;

      do {
        posX = Math.random() * this.count - this.count / 2;
        posY = Math.random() * 30 + 30;
        posZ = Math.random() * this.loopLength; // Start between -1000 and 0
        isOverlapping = false;

        for (let j = 0; j < i; j++) {
          const prevX = basePositions[j * 3];
          const prevY = basePositions[j * 3 + 1];
          const prevZ = basePositions[j * 3 + 2];

          const distance = Math.sqrt(
            (posX - prevX) ** 2 + (posY - prevY) ** 2 + (posZ - prevZ) ** 2,
          );

          if (distance < 2) {
            isOverlapping = true;
            break;
          }
        }
      } while (isOverlapping);

      basePositions.set([posX, posY, posZ], i * 3);

      // Set instance matrix to identity (positions handled in shader)
      dummy.position.set(0, 0, 0);
      dummy.updateMatrix();

      this.lanterns.setMatrixAt(i, dummy.matrix);

      randomValues[i] = Math.random() * 0.5 + 0.5;
    }

    // Attach attributes to the instanced mesh's geometry
    this.lanterns.geometry.setAttribute(
      "aBasePosition",
      new InstancedBufferAttribute(basePositions, 3),
    );

    this.lanterns.geometry.setAttribute(
      "aRandom",
      new InstancedBufferAttribute(randomValues, 1),
    );

    this.lanterns.instanceMatrix.needsUpdate = true;

    // Add the instanced mesh to the scene
    Common.sceneManager.scenes.instanceScene.add(this.lanterns);
  }

  addInstance() {
    Common.sceneManager.scenes.instanceScene.add(
      this.lanterns,
      this.mainLantern,
    );
  }

  dispose() {}

  render(t) {
    this.clock = t / 1000;

    if (this.mainlanternsMaterial.uniforms.uTransition.value > 0) {
      this.preClock +=
        0.005 * this.mainlanternsMaterial.uniforms.uTransition.value;
    }

    this.mainlanternsMaterial.uniforms.uTime.value = this.clock;
    this.mainlanternsMaterial.uniforms.uPreClock.value = this.preClock;

    console.log("preClock", this.mainlanternsMaterial.uniforms.uPreClock);

    this.lanternsMaterial.uniforms.uTime.value = this.clock;
  }

  resize() {}

  debug(debug) {
    if (debug === null) return;
    console.log(
      " this.mainlanternsMaterial.uniforms.uTransition.value",
      this.mainlanternsMaterial.uniforms.uTransition,
    );

    this.debug = debug;

    const btn = this.debug.addButton({ title: "send lantern" });

    btn.on("click", () => {
      gsap.to(this.mainlanternsMaterial.uniforms.uTransition, {
        value: 1,
        duration: 5, // Duration of the animation in seconds
        ease: "linear",
      });
    });
  }
}
