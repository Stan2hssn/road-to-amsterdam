import {
  BoxGeometry,
  IcosahedronGeometry,
  Mesh,
  ShaderMaterial,
  PlaneGeometry,
  SphereGeometry,
  TextureLoader,
  Uniform,
  Vector2,
  Vector3,
  Color,
  AnimationMixer,
  DodecahedronGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  SRGBColorSpace,
  VideoTexture,
  Matrix3,
  Matrix4,
  WebGLRenderTarget,
  DirectionalLight,
  BufferAttribute,
} from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import Common from "../../Common";
import Device from "../..//pure/Device";

// import vertexShader from "../glsl/heart/heart.vert";
// import fragmentShader from "../glsl/heart/heart.frag";

import vertexShader from "../glsl/heart/expand.vert";
import fragmentShader from "../glsl/heart/expand.frag";

import { BackSide } from "three";
import { FrontSide } from "three";
import Input from "../../Input";

export default class {
  params = {
    morphTargetInfluences: [0, 0, 0, 0, 0], // Array to match the morph targets in the shader
    uSaturation: 1,
    uRefractPower: 0.1,
    uChromaticAberration: 0.9,
    uFresnelPower: 7.0,
    uIorR: 1.16,
    uIorY: 1.15,
    uIorG: 1.14,
    uIorC: 1.22,
    uIorB: 1.22,
    uIorP: 1.22,
    uShininess: 40,
    uDiffuseness: 1,
    uLight: new Vector3(1, 1.9, 0.3),
    uZoom: 2.4,
    uShiftY: 0.8,
    uShiftX: 2.35,
    shrink: 0,
    uMaskFactor: 0,
    uGravity: 9.8,
    uVel0: 0,
    uMass: 1,
    uMotionTime: 0,
  };

  constructor(target1, target2) {
    this.backSide = new WebGLRenderTarget(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height * Device.pixelRatio,
    );
    this.frontSide = target2;
    this.modelLoader = new GLTFLoader();
    this.loader = new TextureLoader();

    this.renderTexture = null;
    this.gltf = null;
    this.mixer = null;
    this.elapsedTime = 0;
    this.previousTime = 0;

    this.textures = {};

    this.loadTextures();
    this.init();
    // this.debug();
  }

  loadTextures() {
    this.textures = {
      video: this.loader.load("./Texture/Videos/memory.jpg"),
    };

    const video = document.getElementById("video");
    video.muted = true;
    video.play();

    this.video = new VideoTexture(video);
    this.video.colorSpace = SRGBColorSpace;
  }

  getCamParams() {
    const camera = Common.pages.About.cameras.memory.main;

    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    camera.updateWorldMatrix();

    this.viewMatrixCamera = camera.matrixWorldInverse.clone();
    this.projectionMatrixCamera = camera.projectionMatrix.clone();
    this.modelMatrixCamera = camera.matrixWorld.clone();
    this.projPosition = camera.position.clone();
  }

  setModels() {
    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        uResolution: new Uniform(
          new Vector2(
            Device.viewport.width,
            Device.viewport.height,
          ).multiplyScalar(Device.pixelRatio),
        ),

        // Camera
        viewMatrixCamera: new Uniform(this.viewMatrixCamera),
        projectionMatrixCamera: new Uniform(this.projectionMatrixCamera),
        modelMatrixCamera: new Uniform(this.modelMatrixCamera),
        projPosition: new Uniform(this.projPosition),

        // Textures
        uTexture: new Uniform(null),
        uVideoTexture: new Uniform(this.video),

        // Transition
        uTransmission: new Uniform(0),

        // Refraction
        uSaturation: new Uniform(this.params.uSaturation),
        uRefractPower: new Uniform(this.params.uRefractPower),
        uChromaticAberration: new Uniform(this.params.uChromaticAberration),
        uFresnelPower: new Uniform(this.params.uFresnelPower),
        uIorR: new Uniform(this.params.uIorR),
        uIorY: new Uniform(this.params.uIorY),
        uIorG: new Uniform(this.params.uIorG),
        uIorC: new Uniform(this.params.uIorC),
        uIorB: new Uniform(this.params.uIorB),
        uIorP: new Uniform(this.params.uIorP),
        uShininess: new Uniform(this.params.uShininess),
        uDiffuseness: new Uniform(this.params.uDiffuseness),
        uLight: new Uniform(this.params.uLight),

        // Focus
        uZoom: new Uniform(this.params.uZoom),
        uShiftY: new Uniform(this.params.uShiftY),
        uShiftX: new Uniform(this.params.uShiftX),

        // Add the morph target influences uniform for animation
        morphTargetInfluences: new Uniform(this.params.morphTargetInfluences),
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true,
    });

    this.modelLoader.load("/Models/Heart_V3.glb", (gltf) => {
      gltf.scene.position.set(0, 0, -200);
      gltf.scene.rotation.set(0, -Math.PI * 0.5, 0);

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = this.material;
          //   child.material = new MeshBasicMaterial({
          //     color: 0x333333,
          //   });
          this.gltf = child;
        }
      });

      if (gltf.animations.length > 0) {
        this.mixer = new AnimationMixer(gltf.scene);
        this.mixer.clipAction(gltf.animations[0]).play();

        if (this.gltf.geometry.morphAttributes.position.length > 0) {
          this.gltf.geometry.attributes.morphTarget0 =
            this.gltf.geometry.morphAttributes.position[0];
          this.gltf.geometry.attributes.morphTarget1 =
            this.gltf.geometry.morphAttributes.position[1];
          this.gltf.geometry.attributes.morphTarget2 =
            this.gltf.geometry.morphAttributes.position[2];
          this.gltf.geometry.attributes.morphTarget3 =
            this.gltf.geometry.morphAttributes.position[3];
          this.gltf.geometry.attributes.morphTarget4 =
            this.gltf.geometry.morphAttributes.position[4];
        }
      }

      //   Common.pages.About.scenes.story.add(gltf.scene);
      this.resize(Common.scale, Device.viewport.height, Device.viewport.width);
    });

    // this.rayMesh = new Mesh(
    //   new PlaneGeometry(1, 1),
    //   new ShaderMaterial({
    //     vertexShader: `
    //     varying vec2 vUv;
    //     void main() {
    //       vUv = uv;
    //       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    //     }`,
    //     fragmentShader: `
    //     varying vec2 vUv;
    //     uniform sampler2D uTexture;
    //     uniform vec2 uResolution;
    //     void main() {
    //         vec2 winUv = gl_FragCoord.xy / uResolution.xy;
    //       vec4 texture = texture2D(uTexture, vUv);

    //       gl_FragColor = vec4(winUv, 1.0, 1.0);
    //       gl_FragColor = texture;
    //     }
    //     `,
    //     uniforms: {
    //       uResolution: new Uniform(
    //         new Vector2(
    //           Device.viewport.width,
    //           Device.viewport.height,
    //         ).multiplyScalar(Device.pixelRatio),
    //       ),
    //       uTexture: new Uniform(null),
    //     },
    //   }),
    // );
  }

  init() {
    this.getCamParams();
    this.setModels();

    let rad = 0.5;
    let size = 32;

    this.rayMesh = new Mesh(
      new SphereGeometry(rad + 0.3, size, size),
      new MeshBasicMaterial({
        color: 0x000000,
      }),
    );

    this.rayMesh.visible = false;

    let goldgeometry = new SphereGeometry(rad, size, size).toNonIndexed();

    this.goldDebug = new Mesh(
      goldgeometry,
      new ShaderMaterial({
        uniforms: {
          uTime: new Uniform(0),
          uRayCoords: new Uniform(Input.raycasterCoords),
          uRectWidth: new Uniform(),
          uPosY: new Uniform(),
          uMouseVelocity: new Uniform(Input.velocity),
          uShrink: new Uniform(this.params.shrink),
          uMaskFactor: new Uniform(this.params.uMaskFactor),
          uVel0: new Uniform(this.params.uVel0),
          uGravity: new Uniform(this.params.uGravity),
          uMass: new Uniform(this.params.uMass),
          uMotionTime: new Uniform(0),
        },
        vertexShader,
        fragmentShader,
        // wireframe: true,
        side: FrontSide,
      }),
    );
    // Calculate centroid for each triangle and assign to all three vertices of that triangle
    const positions = goldgeometry.attributes.position.array;
    const count = goldgeometry.attributes.position.count;

    const centroids = new Float32Array(count * 3);
    const rotations = new Float32Array(count);
    const randoms = new Float32Array(count * 3);
    const postPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 3) {
      const r = Math.random() * Math.PI * 2;
      const random = Math.random(count);

      rotations[i] = r;

      randoms[i] = random;
      randoms[i + 1] = random;
      randoms[i + 2] = random;

      const p1 = new Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
      );
      const p2 = new Vector3(
        positions[(i + 1) * 3],
        positions[(i + 1) * 3 + 1],
        positions[(i + 1) * 3 + 2],
      );
      const p3 = new Vector3(
        positions[(i + 2) * 3],
        positions[(i + 2) * 3 + 1],
        positions[(i + 2) * 3 + 2],
      );

      const centroid = p1.clone().add(p2).add(p3).divideScalar(3);

      centroids.set([centroid.x, centroid.y, centroid.z], i * 3);
      centroids.set([centroid.x, centroid.y, centroid.z], (i + 1) * 3);
      centroids.set([centroid.x, centroid.y, centroid.z], (i + 2) * 3);
    }

    goldgeometry.setAttribute("aCenter", new BufferAttribute(centroids, 3));
    goldgeometry.setAttribute("aRotation", new BufferAttribute(rotations, 1));
    goldgeometry.setAttribute("aRandom", new BufferAttribute(randoms, 1));

    this.goldDebug.position.set(0, 0, -200);

    Common.pages.About.scenes.story.add(this.goldDebug, this.rayMesh);
    Input.interactivesObjects.push(this.rayMesh);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    // console.log(this.goldDebug.material.uniforms.uRayCoords);

    // console.log(
    //   "Input.velocity",
    //   this.goldDebug.material.uniforms.uVelocity.value,
    // );

    this.elapsedTime = t - this.previousTime;
    this.previousTime = t;
    this.material.uniforms.uTime.value = t * 0.001;
    this.goldDebug.material.uniforms.uTime.value = t * 0.001;
    this.goldDebug.material.uniforms.uMouseVelocity.value = Input.rayVelocity;

    if (this.mixer) {
      this.mixer.update(this.elapsedTime * 0.001);
      this.material.uniforms.morphTargetInfluences.value =
        this.gltf.morphTargetInfluences.slice();
    }

    if (!this.gltf) return;

    // this.material.uniforms.uTransmission.value = 0;
    // this.gltf.material.side = BackSide;

    // // Glass Material - FrontSide
    // Common.renderer.setRenderTarget(this.backSide);
    // Common.renderer.render(
    //   Common.pages.About.scenes.story,
    //   Common.pages.About.cameras.main,
    // );
    // this.gltf.material.uniforms.uTexture.value = this.backSide.texture;
    // // this.rayMesh.material.uniforms.uTexture.value = this.backSide.texture;

    // this.gltf.material.uniforms.uTransmission.value = 1;

    // this.gltf.material.side = FrontSide;
  }

  resize(scale, height, width) {
    this.scale = scale;
    this.height = height;
    this.width = width;

    this.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);

    // this.rayMesh.material.uniforms.uResolution.value =
    //   this.material.uniforms.uResolution.value;

    if (!this.gltf) return;

    this.rect = document.querySelector(".heart").getBoundingClientRect();
    const gltfScale = this.rect.width * 0.5;

    this.gltf.scale.set(gltfScale, gltfScale, gltfScale);

    this.gltf.position.y =
      -this.rect.top +
      Device.scrollTop -
      this.rect.height * 0.5 +
      this.height * 0.5;

    this.goldDebug.scale.set(this.rect.width, this.rect.width, this.rect.width);

    this.goldDebug.position.set(
      this.rect.left + this.rect.width * 0.5 - width * 0.5,
      -this.rect.top + Device.scrollTop - this.rect.height * 0.5 + height * 0.5,
      0,
    );

    this.rayMesh.scale.set(this.rect.width, this.rect.width, this.rect.width);

    this.rayMesh.position.set(
      this.rect.left + this.rect.width * 0.5 - width * 0.5,
      -this.rect.top + Device.scrollTop - this.rect.height * 0.5 + height * 0.5,
      0,
    );

    Common.pages.About.cameras.memory.main.position.set(
      0,
      this.gltf.position.y,
      Common.cameraZ,
    );

    this.goldDebug.material.uniforms.uRectWidth.value = this.rect.width;
    this.goldDebug.material.uniforms.uPosY.value = this.gltf.position.y;

    Common.pages.About.cameras.memory.main.lookAt(0, this.gltf.position.y, 0);

    this.material.uniforms.projPosition.value =
      Common.pages.About.cameras.memory.main.position;
    this.material.uniforms.viewMatrixCamera.value =
      Common.pages.About.cameras.memory.main.matrixWorldInverse;
    this.material.uniforms.projectionMatrixCamera.value =
      Common.pages.About.cameras.memory.main.projectionMatrix;
    this.material.uniforms.modelMatrixCamera.value = this.gltf.matrixWorld;
  }

  debug(debug) {
    debug
      .addBinding(this.params, "shrink", {
        label: "Shrink",
        min: 0,
        max: 0.8,
      })
      .on("change", (e) => {
        console.log("e", e);

        this.goldDebug.material.uniforms.uShrink.value = e.value;
      });

    debug
      .addBinding(this.params, "uMaskFactor", {
        label: "Mask Factor",
        min: 0,
        max: 1,
      })
      .on("change", (e) => {
        this.goldDebug.material.uniforms.uMaskFactor.value = e.value;
      });

    debug
      .addBinding(this.params, "uMotionTime", {
        label: "Motion Time",
        min: 0,
        max: 1,
      })
      .on("change", (e) => {
        this.goldDebug.material.uniforms.uMotionTime.value = e.value;
      });
    // debug
    //   .addBinding(this.params, "uZoom", {
    //     label: "Zoom",
    //     min: 0,
    //     max: 10,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uZoom.value = this.params.uZoom;
    //   });
    // debug
    //   .addBinding(this.params, "uShiftY", {
    //     label: "Shift Y",
    //     min: -2,
    //     max: 10,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uShiftY.value = this.params.uShiftY;
    //   });
    // debug
    //   .addBinding(this.params, "uShiftX", {
    //     label: "Shift X",
    //     min: -2,
    //     max: 10,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uShiftX.value = this.params.uShiftX;
    //   });
    // debug
    //   .addBinding(this.params, "uSaturation", {
    //     label: "Saturation",
    //     min: 0,
    //     max: 2,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uSaturation.value = this.params.uSaturation;
    //   });
    // debug
    //   .addBinding(this.params, "uRefractPower", {
    //     label: "Refract Power",
    //     min: 0,
    //     max: 1,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uRefractPower.value = this.params.uRefractPower;
    //   });
    // debug
    //   .addBinding(this.params, "uChromaticAberration", {
    //     label: "Chromatic Aberration",
    //     min: 0,
    //     max: 1,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uChromaticAberration.value =
    //       this.params.uChromaticAberration;
    //   });
    // debug
    //   .addBinding(this.params, "uFresnelPower", {
    //     label: "Fresnel Power",
    //     min: 0,
    //     max: 10,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uFresnelPower.value = this.params.uFresnelPower;
    //   });
    // debug
    //   .addBinding(this.params, "uIorR", {
    //     label: "IorR",
    //     min: 1,
    //     max: 2,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uIorR.value = this.params.uIorR;
    //   });
    // debug
    //   .addBinding(this.params, "uIorY", {
    //     label: "IorY",
    //     min: 1,
    //     max: 2,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uIorY.value = this.params.uIorY;
    //   });
    // debug
    //   .addBinding(this.params, "uIorG", {
    //     label: "IorG",
    //     min: 1,
    //     max: 2,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uIorG.value = this.params.uIorG;
    //   });
    // debug
    //   .addBinding(this.params, "uIorC", {
    //     label: "IorC",
    //     min: 1,
    //     max: 2,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uIorC.value = this.params.uIorC;
    //   });
    // debug
    //   .addBinding(this.params, "uIorB", {
    //     label: "IorB",
    //     min: 1,
    //     max: 2,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uIorB.value = this.params.uIorB;
    //   });
    // debug
    //   .addBinding(this.params, "uIorP", {
    //     label: "IorP",
    //     min: 1,
    //     max: 2,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uIorP.value = this.params.uIorP;
    //   });
    // debug
    //   .addBinding(this.params, "uShininess", {
    //     label: "Shininess",
    //     min: 0,
    //     max: 100,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uShininess.value = this.params.uShininess;
    //   });
    // debug
    //   .addBinding(this.params, "uDiffuseness", {
    //     label: "Diffuseness",
    //     min: 0,
    //     max: 1,
    //   })
    //   .on("change", () => {
    //     this.material.uniforms.uDiffuseness.value = this.params.uDiffuseness;
    //   });
  }
}
