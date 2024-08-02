import {
  Mesh,
  PlaneGeometry,
  TextureLoader,
  LoadingManager,
  DoubleSide,
  MeshBasicMaterial,
  Color,
} from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { MSDFTextGeometry, MSDFTextMaterial } from "three-msdf-text-utils";
import Device from "../../pure/Device";
import Common from "../../Common";
import Input from "../../Input";

export default class {
  content = null;
  titles = {};
  meshes = {
    H1: {},
    H2: {},
    H3: {},
    H4: {},
    H5: {},
  };
  scaleText = {
    h1: 0.85,
    h2: 0.8,
    h3: 0.6,
    h4: 0.5,
    h5: 0.38,
  };
  params = {
    Color: new Color(35 / 255, 106 / 255, 136 / 255),
  };
  $target = Common.scrollContainer;

  manager = new LoadingManager();
  fontLoader = new FontLoader(this.manager);
  textureLoader = new TextureLoader(this.manager);

  constructor() {
    this.fontLoader.load("./font/Avenue-X.json", (raw) => {
      this.font = raw;
    });

    this.texture = this.textureLoader.load("./font/Avenue-X.png");

    this.manager.onLoad = () => {
      this.getContent();
      this.init();
    };
  }

  getDummy(text, size) {
    this.geometry = new PlaneGeometry(1, 1, 1, 1);

    this.material = new MeshBasicMaterial({
      color: 0xffff00,
    });

    this.plane = new Mesh(this.geometry, this.material);

    return this.plane;
  }

  async getContent() {
    this.titles = Common.scrollContainer.getElementsByClassName("content");

    for (let i = 0; i < this.titles.length; i++) {
      let textContent = this.titles[i].textContent;

      let tagName =
        this.titles[i].tagName === "SPAN"
          ? this.titles[i].parentNode.tagName
          : this.titles[i].tagName;

      this.meshes[tagName] = this.meshes[tagName] || {};
      const contentMesh = await this.printContent(textContent);

      this.meshes[tagName][i] = contentMesh;

      contentMesh.rotation.x = -Math.PI;

      Common.scene.add(contentMesh);
    }
    this.resize(Common.scale, Device.viewport.height, Device.viewport.width);
  }

  async printContent(text, color) {
    const font = this.font;
    const texture = this.texture;

    const geometry = new MSDFTextGeometry({
      text,
      font: font.data,
      width: 1000,
      align: "center",
      flipY: true,
    });

    const material = new MSDFTextMaterial({});

    material.uniforms.uColor.value = this.params.Color;

    // const material = new MeshBasicMaterial({
    //   color: 0xffff00,
    // });

    material.uniforms.uMap.value = texture;
    material.side = DoubleSide;

    const mesh = new Mesh(geometry, material);

    mesh.rotation.x = Math.PI;

    return mesh;
  }

  init() {}

  dispose() {}

  render(t) {
    const { x, y } = Input.coords;
    Object.keys(this.meshes).forEach((tagName) => {
      Object.keys(this.meshes[tagName]).forEach((key) => {
        this.meshes[tagName][key].rotation.x = -y * 0.05 - Math.PI;
      });
    });
  }

  resizeMesh(mesh, rect, scale, height, width) {
    mesh.scale.set(scale, scale, 1);

    mesh.position.set(
      rect.left -
        (mesh.geometry.layout.width / 2) * mesh.scale.x +
        rect.width * 0.5 -
        width * 0.5,
      -rect.top -
        (mesh.geometry.layout.height / 2) * mesh.scale.y +
        Device.scrollTop -
        rect.height * 0.5 +
        height * 0.5,
      0,
    );
  }

  resize(scale, height, width) {
    this.scale = scale;
    this.height = height;
    this.width = width;
    Object.keys(this.meshes).forEach((tagName) => {
      Object.keys(this.meshes[tagName]).forEach((key) => {
        const rect = this.titles[key].getBoundingClientRect();
        let textScale = 1;
        if (tagName == "H1") {
          textScale = this.scaleText.h1 / ((6 * 100) / width);
          console.log("textScale", textScale);
        } else if (tagName == "H2") {
          textScale = this.scaleText.h2;
        } else if (tagName == "H3") {
          textScale = this.scaleText.h3;
        } else if (tagName == "H4") {
          textScale = this.scaleText.h4;
        } else if (tagName == "H5") {
          textScale = this.scaleText.h5;
        }
        this.resizeMesh(
          this.meshes[tagName][key],
          rect,
          textScale,
          height,
          width,
        );
      });
    });
  }

  debug(debug) {
    debug.addBinding(this.params, "Color", {
      label: "Color",
      picker: "inline",
      color: { type: "float" },
    });
  }
}
