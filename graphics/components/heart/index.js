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
} from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Pane } from "tweakpane";

import Common from "../../Common";
import Device from "../..//pure/Device";

export default class {
  params = {
    morphTargetInfluences: [0, 0, 0, 0, 0], // Array to match the morph targets in the shader
  };

  constructor(posX, posY, posZ) {
    this.pane = new Pane();
    this.modelLoader = new GLTFLoader();
    this.loader = new TextureLoader();

    this.textures = {};

    this.init();
    // this.debug();
  }

  init() {
    this.gltf = null;
    this.renderTexture = null;

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        uResolution: new Uniform(
          new Vector2(
            Device.viewport.width,
            Device.viewport.height,
          ).multiplyScalar(Device.pixelRatio),
        ),
        uTexture: new Uniform(null),
        uTransmission: new Uniform(0),
      },
      //   vertexShader: vertexShader,
      //   fragmentShader: fragmentShader,
      // wireframe: true,
    });

    this.modelLoader.load("/Models/Heart_V3.glb", (gltf) => {
      gltf.scene.position.set(0, 0, -200);
      gltf.scene.rotation.set(0, -Math.PI * 0.5, 0);

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = this.material;
          child.material = new MeshBasicMaterial({
            color: 0x333333,
          });
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

      Common.pages.About.scenes.story.add(gltf.scene);
      this.resize(Common.scale, Device.viewport.height, Device.viewport.width);
    });

    this.dummy = new Mesh(
      new PlaneGeometry(1, 1),
      new MeshStandardMaterial({
        color: 0x333333,
      }),
    );

    Common.pages.About.scenes.story.add(this.dummy);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    this.elapsedTime = t - this.previousTime;
    this.previousTime = t;
    // this.material.uniforms.uTime.value = t * 0.001;

    // if (this.mixer) {
    //   this.mixer.update(this.elapsedTime * 0.001);

    //   // Update the morph target influences uniform
    //   this.material.uniforms.morphTargetInfluences.value =
    //     this.gltf.morphTargetInfluences.slice();
    // }
  }

  resize(scale, height, width) {
    this.scale = scale;
    this.height = height;
    this.width = width;

    this.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);

    if (!this.gltf) return;
    const rect = document.querySelector(".heart").getBoundingClientRect();
    const gltfScale = rect.width * 0.5;

    this.gltf.scale.set(gltfScale, gltfScale, gltfScale);

    this.gltf.position.y =
      -rect.top + Device.scrollTop - rect.height * 0.5 + this.height * 0.5;
  }

  debug(debug) {
    // const { debug } = this;
  }
}
