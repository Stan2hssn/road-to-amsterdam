import {
  AmbientLight,
  MeshPhysicalMaterial,
  TextureLoader,
  InstancedMesh,
  Object3D,
  SpotLight,
  Color,
  InstancedBufferAttribute,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  Vector2,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import bar from "/Models/bar.glb";
import ao from "/Textures/ao.png";
import fbo from "/Textures/fbo.png";

import noise from "./noise";
import Common from "../Common";
import Input from "../Input";

export default class {
  loader = {};

  constructor() {
    this.init();
  }

  setMaterial() {
    this.aoMap = new TextureLoader().load(ao);
    this.aoMap.flipY = false;

    this.fbo = new TextureLoader().load(fbo);
    this.fbo.flipY = false;

    this.material = new MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.65,
      aoMap: this.aoMap,
      aoMapIntensity: 0.75,
    });

    this.uniforms = {
      time: { value: 0 },
      uFBO: { value: Common.fbo.texture },
      uAO: { value: this.aoMap },
      uMouse: { value: new Vector2(0, 0) },
      light_color: { value: new Color("#ffe9e9") },
      ramp_color_one: { value: new Color("#06082D") },
      ramp_color_two: { value: new Color("#020284") },
      ramp_color_three: { value: new Color("#0000ff") },
      ramp_color_four: { value: new Color("#71c7f5") },
    };

    this.material.onBeforeCompile = (shader) => {
      shader.uniforms = Object.assign(shader.uniforms, this.uniforms);

      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
        uniform float time;
        uniform sampler2D uFBO;
        uniform vec3 light_color;
        uniform vec3 ramp_color_one;
        uniform vec3 ramp_color_two;
        uniform vec3 ramp_color_three;
        uniform vec3 ramp_color_four; 
        uniform vec2 uMouse;
        ${noise}

        attribute vec2 instancedUv;

        varying float vHeight;
        varying float vHeightUV;
      `,
      );

      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
       #include <begin_vertex>

       float n = cnoise(vec3(instancedUv.x * 5., instancedUv.y * 5., time * 0.05));
       
       transformed.y *= clamp(n * 15. + 15., 1., 100.);
       vHeightUV = clamp(position.y *2., 0., 1.);
       vec4 transition = texture2D(uFBO, instancedUv);
       transformed.y /= clamp(transition.b * 4., 0.6, 10.);
       transformed *= ( .05 + transition.g);
       transformed.y += transition.r *45.;
       vHeight = transformed.y;
      `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
        #include <common>
        uniform sampler2D uFBO;
        uniform vec3 light_color;
        uniform vec3 ramp_color_one;
        uniform vec3 ramp_color_two;
        uniform vec3 ramp_color_three;
        uniform vec3 ramp_color_four; 

        varying float vHeight;
        varying float vHeightUV;
      `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
        #include <color_fragment>
        vec3 highlight = mix(ramp_color_three, ramp_color_four, vHeightUV );
        
        diffuseColor.rgb = ramp_color_two;
        diffuseColor.rgb = mix(diffuseColor.rgb, ramp_color_three, vHeightUV);
        diffuseColor.rgb = mix(diffuseColor.rgb, highlight, clamp(vHeight / 10. -3.,0., 1.));
        `,
      );
    };
  }

  addLight() {
    this.light = new AmbientLight(0xffffff, 0.7);
    this.spotLight = new SpotLight(0xffe9e9, 5000);
    this.spotLight.position.set(-320, 110, -320);
    this.spotLight.target.position.set(0, -100, 0);
    this.spotLight.angle = 0.4;
    this.spotLight.penumbra = 1;
    this.spotLight.decay = 1;
    this.spotLight.distance = 1000;
  }

  init() {
    this.setMaterial();
    this.addLight();

    this.loader = new GLTFLoader();
    this.loader.load(bar, (gltf) => {
      console.log("gltf", gltf);

      this.model = gltf.scene.children[0];
      this.model.material = this.material;
      this.geometry = this.model.geometry;

      this.geometry.scale(6, 6, 6);

      // Common.scene.add(this.model);

      this.iSize = 50;
      this.instances = this.iSize * this.iSize;

      this.instanceMesh = new InstancedMesh(
        this.model.geometry,
        this.model.material,
        this.instances,
      );

      let dummy = new Object3D();
      let w = 10;

      let instancedUv = new Float32Array(this.instances * 2);

      for (let i = 0; i < this.iSize; i++) {
        for (let j = 0; j < this.iSize; j++) {
          instancedUv.set(
            [i / this.iSize, j / this.iSize],
            (i * this.iSize + j) * 2,
          );

          dummy.position.set(
            (i - this.iSize / 2) * w,
            0,
            (j - this.iSize / 2) * w,
          );

          dummy.updateMatrix();
          this.instanceMesh.setMatrixAt(i * this.iSize + j, dummy.matrix);
        }
      }

      this.instanceMesh.instanceMatrix.needsUpdate = true;
      this.instanceMesh.geometry.setAttribute(
        "instancedUv",
        new InstancedBufferAttribute(instancedUv, 2),
      );

      console.log("this.instanceMesh", this.instanceMesh);

      Common.scene.add(this.instanceMesh);
    });

    this.debuger = new Mesh(
      new PlaneGeometry(100, 100),
      new MeshBasicMaterial({ map: Common.fbo.texture }),
    );

    this.debuger.position.set(0, 200, 200);
    this.debuger.rotateY(Math.PI / 4);
    this.debuger.rotateX(-Math.PI / 4);

    Common.scene.add(this.light, this.spotLight);

    // Common.scene.add(this.debuger);

    Common.scene.position.set(-250, 0, -250);
    console.log("Common.scene", Common.scene.children);
  }

  dispose() {}

  render(t) {
    this.uniforms.time.value = t / 60;

    // Object.keys(this.loader).forEach((key) => {
    //   this.loader[key].render(t);
    // });
  }

  resize() {}

  setDebug(debug) {
    const { debug: pane } = this;

    debug
      .addBinding(this.spotLight, "intensity", {
        min: 1000,
        max: 10000,
      })
      .on("change", (v) => {
        this.spotLight.intensity = v.value;
      });

    debug
      .addBinding(this.spotLight, "angle", {
        min: 0,
        max: Math.PI,
      })
      .on("change", (v) => {
        this.spotLight.angle = v.value;
      });

    debug
      .addBinding(this.spotLight, "penumbra", {
        min: 0,
        max: 1,
      })
      .on("change", (v) => {
        this.spotLight.penumbra = v.value;
      });

    debug
      .addBinding(this.spotLight, "decay", {
        min: 0,
        max: 2,
      })
      .on("change", (v) => {
        this.spotLight.decay = v.value;
      });

    debug
      .addBinding(this.spotLight, "distance", {
        min: 0,
        max: 1000,
      })
      .on("change", (v) => {
        this.spotLight.distance = v.value;
      });

    debug
      .addBinding(this.spotLight.position, "x", {
        min: -500,
        max: 500,
      })
      .on("change", (v) => {
        this.spotLight.position.x = v.value;
      });

    debug
      .addBinding(this.spotLight.position, "y", {
        min: -500,
        max: 500,
      })
      .on("change", (v) => {
        this.spotLight.position.y = v.value;
      });

    debug
      .addBinding(this.spotLight.position, "z", {
        min: -500,
        max: 500,
      })
      .on("change", (v) => {
        this.spotLight.position.z = v.value;
      });
  }
}
