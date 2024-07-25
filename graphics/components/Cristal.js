import {
  BoxGeometry,
  IcosahedronGeometry,
  Mesh,
  MeshMatcapMaterial,
  PlaneGeometry,
  ShaderMaterial,
  SphereGeometry,
  CapsuleGeometry,
  TextureLoader,
  Uniform,
  Vector2,
  DodecahedronGeometry,
  Vector3,
  BackSide,
  FrontSide,
  Color,
} from "three";

import rugged from "/Texture/normal/rugged.webp";
import water from "/Texture/water.webp";
import noise from "/Texture/noise_light.jpg";
import noise_color from "/Texture/crystal_texture.jpg";

import vertexShader from "./glsl/vertex.glsl";
import fragmentShader from "./glsl/fragment.glsl";
import Common from "../Common";
import Device from "../pure/Device";

import { GLTFLoader } from "three/examples/jsm/Addons.js";

import { Pane } from "tweakpane";

export default class {
  params = {
    basic: 0,
    uLight: new Vector3(0, 7.3, -5),
    uShininess: 40,
    uDiffuseness: 0.2,
    uIor: new Vector3(1.107, 1.105, 1.104),
    uGlobalIor: 0.94,
    gltfScale: 0.8,
    // gltfScale: 3,
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    primaryColor: "#1985ad",
    backgroudColor: Common.scene.background,
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
        uBagroundColor: new Uniform(new Color(this.params.backgroudColor)),
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
      Common.scene.add(gltf.scene);
    });

    this.geometry = new SphereGeometry(1.5, 32, 32);
    // this.geometry = new IcosahedronGeometry(2);
    // this.geometry = new DodecahedronGeometry(2, 0);
    // this.geometry = new BoxGeometry(3, 3, 3);
    this.geometry = new PlaneGeometry(3, 2);

    const { basic } = this.params;

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
        // wireframe: true,
      }),
    );

    this.mesh.position.set(posX - 2, posY - 1, posZ + 2);

    // Common.scene.add(this.mesh);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    this.material.uniforms.uTime.value = t * 0.001;
  }

  resize() {
    this.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);
  }

  debug() {
    const { debug: pane } = this;

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
      .on("change", (value) => {
        this.material.uniforms.uGlobalIor.value = this.params.uGlobalIor;
      });

    this.debug
      .addBinding(this.params, "gltfScale", {
        label: "gltf scale",
        step: 0.01,
        min: 0,
        max: 10,
      })
      .on("change", (value) => {
        this.gltf.scale.set(
          this.params.gltfScale,
          this.params.gltfScale,
          this.params.gltfScale,
        );
      });

    this.debug
      .addBinding(this.params, "position", {
        label: "position",
        step: 0.01,
        min: -10,
        max: 10,
      })
      .on("change", (value) => {
        this.gltf.position.set(
          this.params.position.x,
          this.params.position.y,
          this.params.position.z,
        );
      });

    this.debug.addBinding(this.params, "uLight", {
      label: "Light",
      min: -10,
      max: 10,
      // color: { type: "float" },
    });

    this.debug
      .addBinding(this.params, "uShininess", {
        label: "Shininess",
        min: 0,
        max: 100,
      })
      .on("change", (value) => {
        this.material.uniforms.uShininess.value = this.params.uShininess;
      });

    this.debug
      .addBinding(this.params, "uDiffuseness", {
        label: "Diffuseness",
        min: 0,
        max: 1,
      })
      .on("change", (value) => {
        this.material.uniforms.uDiffuseness.value = this.params.uDiffuseness;
      });
  }
}
