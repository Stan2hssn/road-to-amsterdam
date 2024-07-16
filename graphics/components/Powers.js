import {
  Group,
  Mesh,
  SphereGeometry,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  MeshBasicMaterial,
  TextureLoader,
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
  Color,
  BoxGeometry,
  Vector2,
} from "three";

import backgroundShader from "./glsl/background.vert";
import backgroundFragment from "./glsl/background.frag";

import glass from "/Texture/noise_light.jpg";
import noise from "/Texture/noise_light.jpg";
import water from "/Texture/normal_water.webp";

import Common from "../Common";
import Device from "../pure/Device";
import Input from "../Input";

import paint from "./starter/paint";
import Cube from "./starter/Cube";
import { float } from "three/examples/jsm/nodes/Nodes.js";

export default class {
  Starter = {};
  Letters = {};

  params = {
    height: 30,
    background: new Color(0xfff2e6),
    primary: new Color(0x459392),
    secondary: new Color(0x0c4e68),
    tertiary: new Color(0x0c4e68),
    fourthary: new Color(0x083947),
    uIor: {
      x: 1.17,
      y: 1.15,
      z: 1.14,
    },
    uGlobalIor: 1,
  };

  constructor() {
    this.init();
  }

  texture() {
    this.loaderTexture = new TextureLoader();

    this.textures = {
      noise: this.loaderTexture.load(noise),
      waterTexture: this.loaderTexture.load(water),
      glass: this.loaderTexture.load(glass),
    };
  }

  init() {
    this.texture();
    this.StarterGroup = new Group();
    this.LettersGroup = new Group();

    // this.Starter.Cube = new Cube(0, 0, 0);

    this.plane = new Mesh(
      new BoxGeometry(1, 1),

      // new MeshBasicMaterial({
      //   color: 0xffffff,
      // }),

      new ShaderMaterial({
        uniforms: {
          uTime: new Uniform(0),
          tLogo: {
            value: new TextureLoader().load("/Texture/Capsens.png"),
          },
          uBackground: new Uniform(new Color(this.params.background)),
        },
        vertexShader: `
          uniform float uTime;
          varying vec2 vUv;

         float rand(float n){return fract(sin(n) * 43758.5453123);}

          float noise(float p){
            float fl = floor(p);
            float fc = fract(p);
            return mix(rand(fl), rand(fl + 1.0), fc);
          }

          void main() {
            float time = uTime *.1;
            vec3 pos = position + vec3(.5);
            vec2 movement = vec2(cos(time), sin(time) -1.) * .1 - .05;
            pos.xy += movement * noise(cos(time * .5) * -sin(time * .5));

            vec4 worldPos = modelMatrix * vec4(pos, 1.0);

            vec4 mvPosition = viewMatrix * worldPos;

            gl_Position = projectionMatrix * mvPosition;
            vUv = uv;
          }
        `,
        fragmentShader: `
          uniform sampler2D tLogo;

          uniform float uTime;

          uniform vec3 uBackground;

          varying vec2 vUv;
          void main() {
          float time = uTime;
            vec4 text = texture2D(tLogo, vUv);
            float mask = smoothstep(0.,1., text.a);

            gl_FragColor = vec4(vUv + time, 0.0, 1.0);
            gl_FragColor = vec4((text.rgb), mask);
            gl_FragColor = vec4(vec3(uBackground), mask );

          }
        `,
        transparent: true,
      }),
    );

    this.waterCompilerMaterial = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        tNoise: new Uniform(this.textures.noise),
        tGlass: new Uniform(this.textures.waterTexture),
        uPrimary: new Uniform(this.params.primary),
        uSecondary: new Uniform(this.params.secondary),
        uThirdary: new Uniform(this.params.tertiary),
        uFourthary: new Uniform(this.params.fourthary),
        uBackground: new Uniform(new Color(this.params.waterCompiler)),
        tRipples: new Uniform(this.textures.waterTexture),
        tLogo: new Uniform(null),
        uRes: new Uniform(
          new Vector2(
            Device.viewport.width,
            Device.viewport.height,
          ).multiplyScalar(Device.pixelRatio),
        ),
      },
      vertexShader: backgroundShader,
      fragmentShader: backgroundFragment,
      side: 2,
      depthTest: true,
      depthWrite: true,
    });

    this.waterCompiler = new Mesh(
      new PlaneGeometry(200, 100, 1, 1),
      this.waterCompilerMaterial,
    );

    this.paint = new paint(0, -10, -30, this.params);

    this.waterCompiler.position.set(0, 0, -60);

    this.waterCompiler.rotation.set(0, 0, 0);

    this.dummy = new Mesh(
      new PlaneGeometry(5, 5),
      new MeshBasicMaterial({
        color: 0x1111111,
      }),
    );

    // Object.keys(this.Starter).forEach((key) => {
    //   // this.StarterGroup.add(this.Starter[key].mesh);
    // });

    this.LettersGroup.add(this.plane);

    this.dummy.position.set(0, -4, -5);

    this.LettersGroup.position.set(0, 1, -10.9);
    this.LettersGroup.scale.set(2, 2, 2);

    Common.projectScene.add(this.waterCompiler, this.paint.ripples);
  }

  dispose() {}

  render(t) {
    this.paint.render(t);

    this.waterCompiler.material.uniforms.uTime.value = t * 0.0001;

    this.waterCompiler.material.visible = true;
    this.paint.ripples.visible = false;

    Common.renderer.setRenderTarget(Common.RipplesTexture);
    Common.renderer.render(Common.projectScene, Common.projectCamera);

    this.paint.ripples.material.uniforms.uReflect.value =
      Common.RipplesTexture.texture;

    this.waterCompiler.material.visible = false;
    this.paint.ripples.visible = true;

    Common.renderer.setRenderTarget(null);
    Common.renderer.render(Common.projectScene, Common.projectCamera);
  }

  resize() {
    Object.keys(this.Starter).forEach((key) => {
      this.Starter[key].resize();
    });

    this.plane.scale.set(1, 1, 1);
    this.waterCompiler.scale.set(1, 1, 1);

    this.paint.resize();

    this.waterCompiler.material.uniforms.uRes.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);
  }

  debug(debug) {
    const { debug: pane } = this;

    debug.addBinding(this.params, "secondary", {
      label: "Secondary",
      min: 0,
      max: 0xffffff,
      color: { type: "float" },
    });

    debug.addBinding(this.params, "tertiary", {
      label: "Tertiary",
      min: 0,
      max: 0xffffff,
      color: { type: "float" },
    });

    debug.addBinding(this.params, "fourthary", {
      label: "Fourthary",
      min: 0,
      max: 0xffffff,
      color: { type: "float" },
    });
  }
}
