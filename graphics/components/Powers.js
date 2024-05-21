import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  ShaderMaterial,
  Uniform,
  TextureLoader,
  Mesh,
  PlaneGeometry,
  Vector2,
} from "three";

import vertexModel from "./glsl/vertexModel.glsl";
import fragmentModel from "./glsl/fragmentModel.glsl";

import ModelTexture from "/Texture/model.webp";
import Gain from "/Texture/gain.jpeg";
import Dirt from "/Texture/dirt.webp";

import vertex from "./glsl/vertex.glsl";
import fragment from "./glsl/fragment.glsl";

import GDN8 from "/Models/GDN8.glb";
import Maxilla from "/Models/Maxilla.glb";
import Aircord from "/Models/Aircord.gltf";
import Brain from "/Models/Brain.gltf";
import Drift from "/Models/Drift.glb";
import Stonestyle from "/Models/Stonestyle.gltf";

import Common from "../Common";
import Input from "../Input";
import Device from "../pure/Device";

export default class ModelLoader {
  Models = {
    GDN8: GDN8,
    Maxilla: Maxilla,
    Aircord: Aircord,
    Brain: Brain,
    Drift: Drift,
    Stonestyle: Stonestyle,
  };

  constructor() {
    this.init();
  }

  async init() {
    Common.getProject();

    if (!Common.Project) return;

    for (const project in Common.Project) {
      const id = project;

      const size = Common.Project[project].size;
      const shift = Common.Project[project].translate;
      const model = Common.Project[project].model;

      try {
        const loadedModel = await this.Model(model, size, shift);
        const projectRender = this.renderModel(id);

        loadedModel.position.set(id * Common.step, shift, 0);

        Common.Project[project].instance.dummy = projectRender;
        Common.Project[project].instance.glb = loadedModel;

        // Add the loaded model to the scene
        Common.renderScene.add(loadedModel);
        Common.mainScene.add(projectRender);
      } catch (error) {
        console.error(
          `Error loading model or dummy for project: ${project}`,
          error,
        );
      }
    }
  }

  Model(model, size, shift) {
    const texture = new TextureLoader().load(ModelTexture);
    texture.flipY = false;

    const material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        uTexture: {
          value: texture,
        },
      },
      vertexShader: vertexModel,
      fragmentShader: fragmentModel,
    });

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: "js" });
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    return new Promise((resolve, reject) => {
      gltfLoader.load(
        this.Models[model],
        (gltf) => {
          const glb = gltf.scene.children[0];
          if (glb) {
            glb.material = material;

            const uv = glb.geometry.attributes.uv.array;
            for (let i = 0; i < uv.length; i += 4) {
              uv[i] = 0;
              uv[i + 1] = 0;
              uv[i + 2] = 1;
              uv[i + 3] = 0;
            }
            glb.geometry.attributes.uv.needsUpdate = true;

            glb.position.set(0, shift, 0);
            glb.scale.set(0.01, 0.01, 0.01);
            glb.scale.multiplyScalar(size);

            resolve(glb);
          } else {
            reject(new Error("Model does not contain children."));
          }
        },
        undefined,
        (error) => {
          reject(error);
        },
      );
    });
  }

  renderModel(id) {
    this.gain = new TextureLoader().load(Gain);
    this.dirt = new TextureLoader().load(Dirt);

    this.dummy = new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        uniforms: {
          uTime: new Uniform(0),
          uRender: new Uniform(null),
          uGain: new Uniform(this.gain),
          uResolution: new Uniform(new Vector2(0, 0)),
          uDirt: new Uniform(this.dirt),
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        side: 2,
      }),
    );

    this.dummy.position.set(0, -id * 2, 0);

    return this.dummy;
  }

  dispose() {}

  render(t) {
    const { x, y } = Input.coords;

    Object.keys(Common.Project).forEach((project, index) => {
      const dummy = Common.Project[project].instance.dummy;
      const glb = Common.Project[project].instance.glb;
      if (!dummy) return;

      dummy.material.uniforms.uRender.value =
        Common.Project[project].renderTexture;
      dummy.material.uniforms.uTime.value = t / 1000;
      dummy.material.uniforms.uResolution.value.set(
        Device.viewport.width,
        Device.viewport.height,
      );

      dummy.rotation.y = Device.scrollTop / 2 + index;

      if (glb) {
        glb.rotation.x = -y / 12;
        glb.rotation.y = x / 12 - -Device.scrollTop - index * Math.PI * 1.35;
      } else {
        console.error(`GLB is undefined for project: ${project}`);
      }
    });
  }

  resize() {
    // for (const project in Common.Project) {
    //   Common.Project[
    //     project
    //   ].instance.dummy.material.uniforms.uResolution.value.set(
    //     Device.viewport.width,
    //     Device.viewport.height,
    //   );
    // }
  }
}
