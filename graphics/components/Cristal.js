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
} from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Pane } from "tweakpane";

// Shader imports (paths may vary based on your project structure)
import vertexShader from "./glsl/vertex.glsl";
import fragmentShader from "./glsl/fragment.glsl";
import Common from "../Common";
import Device from "../pure/Device";

import rugged from "/Texture/normal/rugged.webp";
import water from "/Texture/water.webp";
import noise from "/Texture/noise_light.jpg";
import noise_color from "/Texture/crystal_texture.jpg";

export default class {
  params = {
    basic: 0,
    uLight: new Vector3(0, 7.3, -5),
    uShininess: 40,
    uDiffuseness: 0.2,
    uIor: new Vector3(3.107, 1.105, 0.804),
    uGlobalIor: 0.94,
    gltfScale: 0.8,
    // gltfScale: 2,
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    morphTargetInfluences: [0, 0, 0, 0, 0], // Array to match the morph targets in the shader
    primaryColor: "#1985ad",
    backgroundColor: Common.scene.background,
  };

  constructor(posX, posY, posZ) {
    this.pane = new Pane();
    this.modelLoader = new GLTFLoader();
    this.loader = new TextureLoader();

    this.textures = {
      normal: this.loader.load(rugged),
      noise: this.loader.load(noise),
      noiseColor: this.loader.load(noise_color),
      waterTexture: this.loader.load(water),
    };

    this.init(posX, posY, posZ);
    this.debug();
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.gltf = null;
    this.renderTexture = null;

    // this.material = new MeshStandardMaterial({
    //   color: 0x00ff00,
    // });

    // this.material = new ShaderMaterial({
    //   uniforms: {
    //     uTime: new Uniform(0),
    //     uResolution: new Uniform(
    //       new Vector2(
    //         Device.viewport.width,
    //         Device.viewport.height,
    //       ).multiplyScalar(Device.pixelRatio),
    //     ),
    //     uTexture: new Uniform(null),
    //     morphTargetInfluences: new Uniform(this.params.morphTargetInfluences),
    //   },
    //   vertexShader: `
    //  varying vec2 vUv;
    //     uniform float morphTargetInfluences[5];

    //     attribute vec3 morphTarget0;
    //     attribute vec3 morphTarget1;
    //     attribute vec3 morphTarget2;
    //     attribute vec3 morphTarget3;
    //     attribute vec3 morphTarget4;

    //     void main() {
    //       vec3 morphed = position;
    //       morphed += morphTarget0 * morphTargetInfluences[0];
    //       morphed += morphTarget1 * morphTargetInfluences[1];
    //       morphed += morphTarget2 * morphTargetInfluences[2];
    //       morphed += morphTarget3 * morphTargetInfluences[3];
    //       morphed += morphTarget4 * morphTargetInfluences[4];

    //       vUv = uv;
    //       gl_Position = projectionMatrix * modelViewMatrix * vec4(morphed, 1.0);
    //     }
    //   `,
    //   fragmentShader: `
    //   uniform float uTime;
    //   uniform vec2 uResolution;
    //   uniform sampler2D uTexture;
    //   varying vec2 vUv;
    //   void main() {
    //     vec2 uv = vUv;
    //     vec4 color = vec4(0.5, 0.5, 0.5, 1.0);
    //     gl_FragColor = color;
    //   }
    //   `,
    //   wireframe: true,
    // });

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
        morphTargetInfluences: new Uniform(this.params.morphTargetInfluences),
        uIor: new Uniform(this.params.uIor),
        uLight: new Uniform(this.params.uLight),
        uShininess: new Uniform(this.params.uShininess),
        uDiffuseness: new Uniform(this.params.uDiffuseness),
        normalTexture: new Uniform(this.textures.normal),
        noiseTexture: new Uniform(this.textures.noise),
        noiseColor: new Uniform(this.textures.noiseColor),
        tWater: new Uniform(this.textures.waterTexture),
        uGlobalIor: new Uniform(this.params.uGlobalIor),
        uColor: new Uniform(new Color(this.params.primaryColor)),
        uBackgroundColor: new Uniform(new Color(this.params.backgroundColor)),
        uTransmission: new Uniform(0),
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true,
    });

    this.modelLoader.load("/Models/Rock.glb", (gltf) => {
      gltf.scene.scale.set(
        this.params.gltfScale,
        this.params.gltfScale,
        this.params.gltfScale,
      );
      gltf.scene.rotation.set(0, Math.PI, 0);
      gltf.scene.position.set(
        this.params.position.x,
        this.params.position.y,
        this.params.position.z,
      );

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = this.material;
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

      Common.scene.add(gltf.scene);
    });

    this.geometry = new SphereGeometry(1.5, 32, 32);
    this.mesh = new Mesh(
      this.geometry,
      new ShaderMaterial({
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
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec2 uResolution;
          uniform sampler2D uTexture;
          varying vec2 vUv;
          void main() {
            vec2 uv = vUv;
            vec4 color = texture2D(uTexture, uv);
            color = LinearTosRGB(color);
            gl_FragColor = color;
          }
        `,
      }),
    );

    this.mesh.position.set(posX - 2, posY - 1, posZ + 2);

    // Add your mesh to the scene if needed
    // Common.scene.add(this.mesh);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    this.elapsedTime = t - this.previousTime;
    this.previousTime = t;
    // this.material.uniforms.uTime.value = t * 0.001;

    if (this.mixer) {
      this.mixer.update(this.elapsedTime * 0.001);
      // Update the morph target influences uniform
      this.material.uniforms.morphTargetInfluences.value =
        this.gltf.morphTargetInfluences.slice();
    }
  }

  resize() {
    this.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);
  }

  debug() {
    this.debug = this.pane.addFolder({ title: "Scene", expanded: true });

    this.debug.addBinding(this.params, "uIor", {
      label: "uIor",
      min: 0,
      max: 2,
      color: { type: "vec3" },
    });

    this.debug
      .addBinding(this.params, "uGlobalIor", {
        label: "global uIor",
        step: 0.01,
        min: -2,
        max: 10,
      })
      .on("change", () => {
        this.material.uniforms.uGlobalIor.value = this.params.uGlobalIor;
      });

    this.debug
      .addBinding(this.params, "gltfScale", {
        label: "gltf scale",
        step: 0.01,
        min: 0,
        max: 10,
      })
      .on("change", () => {
        if (this.gltf) {
          this.gltf.scale.set(
            this.params.gltfScale,
            this.params.gltfScale,
            this.params.gltfScale,
          );
        }
      });

    this.debug
      .addBinding(this.params, "position", {
        label: "position",
        step: 0.01,
        min: -10,
        max: 10,
      })
      .on("change", () => {
        if (this.gltf) {
          this.gltf.position.set(
            this.params.position.x,
            this.params.position.y,
            this.params.position.z,
          );
        }
      });

    this.debug.addBinding(this.params, "uLight", {
      label: "Light",
      min: -10,
      max: 10,
    });

    this.debug
      .addBinding(this.params, "uShininess", {
        label: "Shininess",
        min: 0,
        max: 100,
      })
      .on("change", () => {
        this.material.uniforms.uShininess.value = this.params.uShininess;
      });

    this.debug
      .addBinding(this.params, "uDiffuseness", {
        label: "Diffuseness",
        min: 0,
        max: 1,
      })
      .on("change", () => {
        this.material.uniforms.uDiffuseness.value = this.params.uDiffuseness;
      });
  }
}
