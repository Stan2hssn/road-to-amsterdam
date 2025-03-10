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
  MeshPhysicalMaterial,
  SpotLight,
  Group,
  SpotLightHelper,
  DirectionalLightHelper,
  PointLight,
  PMREMGenerator,
  AmbientLight,
  RepeatWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  sRGBEncoding,
  DoubleSide,
  LinearSRGBColorSpace,
  ShaderChunk,
  AdditiveBlending,
} from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import Common from "../../Common";
import Device from "../../pure/Device";

import Shaders from "../../pure/Shaders";

import tvNoise from "../glsl/helpers/tvNoise.glsl";

import { BackSide } from "three";
import { FrontSide } from "three";
import Input from "../../Input";
import { RGBELoader } from "three/examples/jsm/Addons.js";
import Library from "../../pure/TexturesLoader";
import waveCursor from "../waveCursor";
import { metalness } from "three/examples/jsm/nodes/Nodes.js";

export default class {
  params = {
    uSaturation: 1,
    uRefractPower: 0.8,
    uChromaticAberration: 0.3,
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
    uZoom: 2.5,
    uShiftY: 0.68,
    uShiftX: 2.35,
    shrink: 0,
    uMaskFactor: 0,
    uGravity: 9.8,
    uVel0: 0,
    uMass: 1,
    uMotionTime: 0,
    uNoise: 5.2,
  };
  meshes = {};

  constructor(target1, target2, target3) {
    this.videoTarget = new WebGLRenderTarget(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height * Device.pixelRatio,
    );
    this.backSide = target1;
    this.frontSide = target2;
    this.waveCursor = target3;

    this.modelLoader = new GLTFLoader();
    this.loader = new TextureLoader();

    this.renderTexture = null;

    this.gltf = null;
    this.shellMesh = null;
    this.rayMesh = null;
    this.crystalHeart = null;
    this.planeVideo = null;

    this.rayGeometry = null;
    this.shellGeometry = null;
    this.crystalHeartGeometry = null;

    this.video = null;
    this.mixer = null;
    this.elapsedTime = 0;
    this.previousTime = 0;

    this.textures = {};

    this.init();
  }

  getCamParams() {
    const mainCamera = Common.pages.About.cameras.main;
    const camera = Common.pages.About.cameras.memory.main;

    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    camera.updateWorldMatrix();

    mainCamera.updateProjectionMatrix();
    mainCamera.updateMatrixWorld();
    mainCamera.updateWorldMatrix();

    this.mainCameraParams = {
      matrixWorldInverse: mainCamera.matrixWorldInverse,
      projectionMatrix: mainCamera.projectionMatrix,
      matrixWorld: mainCamera.matrixWorld,
      position: mainCamera.position,
    };

    this.cameraParams = {
      matrixWorldInverse: camera.matrixWorldInverse,
      projectionMatrix: camera.projectionMatrix,
      matrixWorld: camera.matrixWorld,
      position: camera.position,
    };
  }

  getExpansivesMaterials() {
    const { idle, shrink, motionTime } = Input.object.heart;

    this.shellMaterial = new MeshStandardMaterial({
      map: this.textures.shell,
      metalness: 0.5,
      flatShading: true,
    });

    this.goldMaterial = new MeshStandardMaterial({
      metalness: 0.8,
      roughness: 0.15,
      map: this.textures.Gold,
      envMap: this.envMap,
      envMapIntensity: 2,
      normalMap: this.textures.normal,
      normalScale: new Vector2(0.09, 0.09),
      side: 2,
    });

    this.uniforms = {
      // Time
      uTime: new Uniform(0),

      // Mouse
      uRayCoords: new Uniform(Input.raycasterCoords),

      // Interaction
      uRectWidth: new Uniform(),
      uPosY: new Uniform(),

      // Physics
      uVel0: new Uniform(this.params.uVel0),
      uGravity: new Uniform(this.params.uGravity),
      uMass: new Uniform(this.params.uMass),

      // Motion
      uShrink: shrink,
      uMotionTime: motionTime,
      uIdle: idle,

      // Noise
      uNoise: new Uniform(this.params.uNoise),

      // Wave Cursor
      tWavePropagation: new Uniform(this.waveCursor.texture),
      tWavePropagation: new Uniform(this.textures.gradient),

      // Camera
      tViewMatrixCamera: new Uniform(
        this.mainCameraParams.matrixWorldInverse.clone(),
      ),
      tProjectionMatrixCamera: new Uniform(
        this.mainCameraParams.projectionMatrix.clone(),
      ),
      tModelMatrixCamera: new Uniform(
        this.mainCameraParams.matrixWorld.clone(),
      ),
      tProjPosition: new Uniform(this.mainCameraParams.position.clone()),
    };

    this.expansiveMaterials = {
      shellMaterial: this.shellMaterial,
      goldMaterial: this.goldMaterial,
    };

    Object.values(this.expansiveMaterials).forEach((shader, i) => {
      shader.onBeforeCompile = (shader) => {
        shader.uniforms = Object.assign(shader.uniforms, this.uniforms);

        // Modifications du vertex shader
        shader.vertexShader = shader.vertexShader.replace(
          "#include <common>",
          Shaders.heart.expand.head,
        );

        shader.vertexShader = shader.vertexShader.replace(
          "#include <begin_vertex>",
          Shaders.heart.expand.vertex,
        );

        if (i > 0) return;
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <common>",
          `
          #include <common>
          varying vec2 vUv;
          uniform sampler2D tNormalTexture;
          uniform sampler2D tWavePropagation;
          uniform float uZoom;
          uniform vec2 uResolution;
          uniform vec2 uShift;
        
          uniform float uTime;
          varying float view;
          varying vec4 vTexCoords;
          varying vec4 vWorldPosition;
        
        
          ${tvNoise}
           `,
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <color_fragment>",
          `
          #include <color_fragment>

          vec2 winUv =  (vTexCoords.xy / vTexCoords.w) * 0.5 + 0.5;
          // winUv = gl_FragCoord.xy / uResolution.xy;

          vec3 test = texture2D(tWavePropagation, winUv).rgb;

          float t = uTime  + 120.;

          float ta = t * 0.654321;
          float tb = t * (ta * 0.123456);

          float grain = tvNoise(vUv, ta, tb);

          diffuseColor.rgb -= grain * .01;
          diffuseColor.rgb += .01;
          // diffuseColor.rgb = vec3(view,0.,0.);
          // diffuseColor.rgb = vec3(winUv, 0.);
          // diffuseColor.rgb = test;
          `,
        );
      };
    });

    this.setAttributes();
  }

  setAttributes() {
    const uvs = this.shellGeometry.attributes.uv;
    const positions = this.shellGeometry.attributes.position.array;
    const count = this.shellGeometry.attributes.position.count;
    const centroids = new Float32Array(count * 3);
    const rotations = new Float32Array(count);
    const randoms = new Float32Array(count * 3);
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
    this.shellGeometry.setAttribute(
      "aCenter",
      new BufferAttribute(centroids, 3),
    );
    this.shellGeometry.setAttribute(
      "aRotation",
      new BufferAttribute(rotations, 1),
    );
    this.shellGeometry.setAttribute("aRandom", new BufferAttribute(randoms, 1));
    this.shellGeometry.setAttribute("aUv", uvs);

    this.shellGeometry.setAttribute(
      "aId",
      new BufferAttribute(new Float32Array(count).fill(1), 1),
    );

    this.goldGeometry.setAttribute(
      "aCenter",
      new BufferAttribute(centroids, 3),
    );
    this.goldGeometry.setAttribute(
      "aRotation",
      new BufferAttribute(rotations, 1),
    );
    this.goldGeometry.setAttribute("aRandom", new BufferAttribute(randoms, 1));
    this.goldGeometry.setAttribute("aUv", uvs);

    this.goldGeometry.setAttribute(
      "aId",
      new BufferAttribute(new Float32Array(count).fill(0), 1),
    );
  }

  getMarbleMaterial() {
    this.textures.marble.flipY = false;

    this.marbleMaterial = new MeshStandardMaterial({
      map: this.textures.marble,
      metalness: 0.1,
      roughness: 0.5,
      envMap: this.envMap,
      envMapIntensity: 2,
    });

    this.marbleMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.factorTexel = new Uniform(this.textures.MarbleMap);

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <metalnessmap_fragment>",
        `
        float metalnessFactor = metalness;

        #ifdef USE_METALNESSMAP

        vec4 texelMetalness = 1.- texture2D( metalnessMap, vMetalnessMapUv );

        #endif
        `,
      );
    };
  }

  getMemoriesMaterial() {
    this.crystalMaterial = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        uResolution: new Uniform(
          new Vector2(
            Device.viewport.width,
            Device.viewport.height,
          ).multiplyScalar(Device.pixelRatio),
        ),

        // Camera
        viewMatrixCamera: new Uniform(this.cameraParams.matrixWorldInverse),
        projectionMatrixCamera: new Uniform(this.cameraParams.projectionMatrix),
        modelMatrixCamera: new Uniform(this.cameraParams.matrixWorld),
        projPosition: new Uniform(this.cameraParams.position),

        // Textures
        tDiffuse: new Uniform(null),
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
      vertexShader: Shaders.heart.vertex,
      fragmentShader: Shaders.heart.fragment,
      // wireframe: true,
    });

    this.videoMaterial = new MeshBasicMaterial({
      map: this.video,
    });
  }

  getMeshes() {
    this.meshes.shellMesh = new Mesh(this.shellGeometry, this.shellMaterial);

    this.meshes.goldMesh = new Mesh(this.goldGeometry, this.goldMaterial);

    this.meshes.rootHeart = new Mesh(
      this.rootHeartGeometry,
      this.marbleMaterial,
    );

    this.meshes.crystalHeart = new Mesh(
      this.crystalHeartGeometry,
      this.crystalMaterial,
    );

    this.meshes.planeVideo = new Mesh(
      new PlaneGeometry(0.8, 1.1, 1, 1),
      this.videoMaterial,
    );

    this.meshes.planeVideo.position.set(0, 0, -0.1);

    this.meshes.rayMesh = new Mesh(this.rayGeometry, new MeshBasicMaterial({}));
    this.meshes.rayMesh.visible = false;
  }

  getMaterials() {
    // Get Shell & Gold Materials
    this.getExpansivesMaterials();

    // get Marble & Memories Materials
    this.getMarbleMaterial();
    this.getMemoriesMaterial();
  }

  getGeometries(gltf) {
    const scene = gltf.scene;
    this.rayGeometry = scene.getObjectByName("glass").geometry.clone();
    this.crystalHeartGeometry = scene.getObjectByName("glass").geometry.clone();
    this.rootHeartGeometry = scene.getObjectByName("marble").geometry.clone();
    this.shellGeometry = scene
      .getObjectByName("coque")
      .geometry.toNonIndexed()
      .clone();

    // this.shellGeometry = new PlaneGeometry(1, 1, 100, 100).toNonIndexed();
    this.goldGeometry = this.shellGeometry.clone();
  }

  getModels() {
    this.modelLoader.loadAsync("/Models/heart.glb").then((gltf) => {
      this.gltf = gltf.scene;
      this.getGeometries(gltf);
      this.getMaterials();
      this.getMeshes();
      this.initMeshes();
    });
  }

  initMeshes() {
    Object.keys(this.meshes).forEach((key) => {
      const mesh = this.meshes[key];
      mesh.name = `${key}`;
    });

    this.gltfGroup = new Group();

    Object.values(this.meshes).forEach((mesh) => {
      this.gltfGroup.add(mesh);
    });

    Common.pages.About.scenes.story.add(this.gltfGroup);

    Input.interactivesObjects.push(this.meshes.rayMesh);

    this.resize(Common.scale, Device.viewport.height, Device.viewport.width);
  }

  loadTextures() {
    // loading the textures
    this.textures = {
      normal: Library.Images.Normal.goldTexture,
      marble: Library.Images.Diffuse.MarbleDiffuse,
      checker: Library.Images.Helpers.checkerUV,
      shell: Library.Images.Diffuse.ShellDiffuse,
      MarbleMap: Library.Images.BW.MarbleMap,
      Gold: Library.Images.Diffuse.GoldDiffuse,
      gradient: Library.Images.Helpers.checkerUV,
    };

    Object.values(this.textures).forEach((texture) => {
      texture.flipY = false;
      texture.colorSpace = SRGBColorSpace;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
    });

    const video = Library.Videos.memory;
    video.muted = true;
    video.play();

    this.video = new VideoTexture(video);
    this.video.colorSpace = SRGBColorSpace;

    // loading the environment
    let envMapLoader = new PMREMGenerator(Common.renderer);
    const loader = new TextureLoader();
    const rgbeLoader = new RGBELoader();
    this.envMap = null;

    rgbeLoader.load("Texture/Images/Env/white_studio.hdr", (hdrTexture) => {
      // hdrTexture.colorSpace = SRGBColorSpace;

      const envMap = envMapLoader.fromEquirectangular(hdrTexture).texture;
      Common.pages.About.scenes.story.environment = envMap;

      this.envMap = envMap;

      // Loading the models
      this.getModels();
    });
  }

  init() {
    this.getCamParams();

    // loading the models inside the loadTextures function
    this.loadTextures();
  }

  dispose() {
    this.gltf = null;
    this.shellMesh.dispose();
    this.rayMesh.dispose();
    this.crystalHeart.dispose();
    this.planeVideo.dispose();
    this.shellGeometry.dispose();
    this.rayGeometry.dispose();
    this.crystalHeartGeometry.dispose;
    this.video.dispose();
    this.mixer.dispose();
    this.elapsedTime = 0;
    this.previousTime = 0;
    this.textures.dispose();
  }

  render(t) {
    if (!this.gltf) return;

    this.updateUniforms(t);
    this.updateCameraUniforms();

    // Render the video to the videoTarget
    this.meshes.planeVideo.visible = true;
    this.meshes.crystalHeart.visible = false;
    this.meshes.rootHeart.visible = false;
    this.crystalMaterial.side = BackSide;
    this.crystalMaterial.uniforms.uRefractPower.value = 1;
    this.crystalMaterial.uniforms.uChromaticAberration.value = 0.03;

    Common.renderer.setRenderTarget(this.videoTarget);
    Common.renderer.render(
      Common.pages.About.scenes.story,
      Common.pages.About.cameras.story.main,
    );
    this.meshes.crystalHeart.visible = true;
    this.meshes.planeVideo.visible = false;
    this.meshes.rootHeart.visible = true;

    this.crystalMaterial.uniforms.tDiffuse.value = this.videoTarget.texture;

    // Render the back side of the heart
    this.meshes.shellMesh.visible = false;
    this.meshes.goldMesh.visible = false;
    this.meshes.rootHeart.visible = false;
    // this.shellMaterial.side = BackSide;
    // this.shellMaterial.uniforms.uTransmission.value = 0;
    Common.renderer.setRenderTarget(this.backSide);
    Common.renderer.render(
      Common.pages.About.scenes.story,
      Common.pages.About.cameras.story.main,
    );
    this.meshes.shellMesh.visible = true;
    this.meshes.goldMesh.visible = true;
    this.meshes.rootHeart.visible = true;

    // this.goldMaterial.uniforms.tDiffuse.value = this.backSide.texture;
  }

  updateUniforms(t) {
    // Update the time
    this.elapsedTime = t - this.previousTime;
    this.previousTime = t;
    this.crystalMaterial.uniforms.uTime.value = t * 0.001;

    // update uniforms
    if (this.uniforms) {
      const mainCamera = Common.pages.About.cameras.main;
      this.uniforms.uTime.value = t * 0.001;
      this.uniforms.tWavePropagation.value = this.waveCursor.texture;

      this.uniforms.tViewMatrixCamera.value.copy(mainCamera.matrixWorldInverse);
      this.uniforms.tProjectionMatrixCamera.value.copy(
        mainCamera.projectionMatrix,
      );
      this.uniforms.tModelMatrixCamera.value.copy(mainCamera.matrixWorld);
      this.uniforms.tProjPosition.value.copy(mainCamera.position);

      Object.keys(this.meshes).forEach((key) => {
        this.meshes[key].rotation.x =
          ((-Input.coords.y / 5) * Input.mousePowerIn) / 100;
      });
    }
  }

  updateCameraUniforms() {
    // Update camera uniforms
    const mainCamera = Common.pages.About.cameras.main;
    this.uniforms.tViewMatrixCamera.value.copy(mainCamera.matrixWorldInverse);
    this.uniforms.tProjectionMatrixCamera.value.copy(
      mainCamera.projectionMatrix,
    );
    this.uniforms.tModelMatrixCamera.value.copy(mainCamera.matrixWorld);
    this.uniforms.tProjPosition.value.copy(mainCamera.position);
  }

  resize(scale, height, width) {
    if (this.gltf === null) return;

    this.scale = scale;
    this.height = height;
    this.width = width;

    this.videoTarget.setSize(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height * Device.pixelRatio,
    );

    this.crystalMaterial.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);

    this.rect = document.querySelector(".heart").getBoundingClientRect();
    this.resizeModels();

    const camera = Common.pages.About.cameras.memory.main;

    camera.position.set(0, this.uniforms.uPosY.value, Common.cameraZ);

    camera.lookAt(0, this.uniforms.uPosY.value, 0);

    this.uniforms.tViewMatrixCamera.value.copy(camera.matrixWorldInverse);
    this.uniforms.tProjectionMatrixCamera.value.copy(camera.projectionMatrix);
    this.uniforms.tModelMatrixCamera.value.copy(camera.matrixWorld);
    this.uniforms.tProjPosition.value.copy(camera.position);
  }

  resizeModels() {
    this.gltfGroup.children.forEach((child) => {
      child.scale.set(this.rect.width, this.rect.width, this.rect.width * 1.2);

      child.position.set(
        this.rect.left + this.rect.width * 0.5 - this.width * 0.5,
        -this.rect.top +
          Device.scrollTop -
          this.rect.height * 0.5 +
          this.height * 0.5,
        -200,
      );
    });

    this.meshes.planeVideo.position.y -= 20;

    this.meshes.rayMesh.scale.set(
      this.rect.width * 2,
      this.rect.width * 2,
      this.rect.width * 2,
    );

    this.meshes.rayMesh.position.set(
      this.rect.left + this.rect.width * 0.5 - this.width * 0.5,
      -this.rect.top +
        Device.scrollTop -
        this.rect.height * 0.5 +
        this.height * 0.5,
      -200,
    );

    this.uniforms.uPosY.value = this.meshes.rayMesh.position.y;
    this.uniforms.uRectWidth.value = this.rect.width;
  }

  setDebug(debug) {
    // debug
    //   .addBinding(this.params, "shrink", {
    //     label: "Shrink",
    //     min: 0,
    //     max: 1,
    //   })
    //   .on("change", (e) => {
    //     console.log("e", e);

    //     this.uniforms.uShrink = e.value;
    //   });

    // debug
    //   .addBinding(this.params, "uMaskFactor", {
    //     label: "Mask Factor",
    //     min: 0,
    //     max: 1,
    //   })
    //   .on("change", (e) => {
    //     this.uniforms.uMaskFactor.value = e.value;
    //   });

    // debug
    //   .addBinding(this.params, "uMotionTime", {
    //     label: "Motion Time",
    //     min: 0,
    //     max: 5,
    //   })
    //   .on("change", (e) => {
    //     this.uniforms.uMotionTime.value = e.value;
    //   });

    // debug
    //   .addBinding(this.params, "uNoise", {
    //     label: "tvNoise",
    //     min: 0,
    //     max: 10,
    //   })
    //   .on("change", (e) => {
    //     this.uniforms.uNoise.value = e.value;
    //   });
    console.log("debug", debug);

    debug
      .addBinding(this.params, "uZoom", {
        label: "Zoom",
        min: 0,
        max: 10,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uZoom.value = this.params.uZoom;
        // this.uniforms.uZoom.value = this.params.uZoom;
      });
    debug
      .addBinding(this.params, "uShiftY", {
        label: "Shift Y",
        min: -2,
        max: 10,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uShiftY.value = this.params.uShiftY;
        // this.uniforms.uShift.value.y = this.params.uShiftY;
      });
    debug
      .addBinding(this.params, "uShiftX", {
        label: "Shift X",
        min: -2,
        max: 10,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uShiftX.value = this.params.uShiftX;
        // this.uniforms.uShift.value.x = this.params.uShiftX;
      });
    debug
      .addBinding(this.params, "uSaturation", {
        label: "Saturation",
        min: 0,
        max: 2,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uSaturation.value =
          this.params.uSaturation;
      });
    debug
      .addBinding(this.params, "uRefractPower", {
        label: "Refract Power",
        min: 0,
        max: 1,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uRefractPower.value =
          this.params.uRefractPower;
      });
    debug
      .addBinding(this.params, "uChromaticAberration", {
        label: "Chromatic Aberration",
        min: 0,
        max: 1,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uChromaticAberration.value =
          this.params.uChromaticAberration;
      });
    debug
      .addBinding(this.params, "uFresnelPower", {
        label: "Fresnel Power",
        min: 0,
        max: 10,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uFresnelPower.value =
          this.params.uFresnelPower;
      });
    debug
      .addBinding(this.params, "uIorR", {
        label: "IorR",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uIorR.value = this.params.uIorR;
      });
    debug
      .addBinding(this.params, "uIorY", {
        label: "IorY",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uIorY.value = this.params.uIorY;
      });
    debug
      .addBinding(this.params, "uIorG", {
        label: "IorG",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uIorG.value = this.params.uIorG;
      });
    debug
      .addBinding(this.params, "uIorC", {
        label: "IorC",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uIorC.value = this.params.uIorC;
      });
    debug
      .addBinding(this.params, "uIorB", {
        label: "IorB",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uIorB.value = this.params.uIorB;
      });
    debug
      .addBinding(this.params, "uIorP", {
        label: "IorP",
        min: 1,
        max: 2,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uIorP.value = this.params.uIorP;
      });
    debug
      .addBinding(this.params, "uShininess", {
        label: "Shininess",
        min: 0,
        max: 100,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uShininess.value = this.params.uShininess;
      });
    debug
      .addBinding(this.params, "uDiffuseness", {
        label: "Diffuseness",
        min: 0,
        max: 1,
      })
      .on("change", () => {
        this.crystalMaterial.uniforms.uDiffuseness.value =
          this.params.uDiffuseness;
      });
  }
}
