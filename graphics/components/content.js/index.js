import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  TextureLoader,
  LoadingManager,
  Color,
  Box3,
  Vector3,
} from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { Glyph } from "three-glyph";

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
  lineHeight = {
    h1: 1,
    h2: 0.8,
    h3: 0.6,
    h4: 0.5,
    h5: 0.2,
  };
  $target = Common.scrollContainer;

  manager = new LoadingManager();
  fontLoader = new FontLoader(this.manager);
  textureLoader = new TextureLoader(this.manager);

  constructor() {
    this.fontLoader.load(
      "./font/Avenue-X.json",
      //   "https://raw.githubusercontent.com/trinketmage/three-glyph/main/examples/simple/Love.json",
      (raw) => {
        this.font = raw.data;
      },
    );

    this.texture = this.textureLoader.load(
      "./font/Avenue-X.png",
      //   "./Texture/texture.jpg",
    );

    this.manager.onLoad = () => {
      this.getContent();
      this.init();
      this.resize(Common.scale, Device.viewport.height, Device.viewport.width);
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

  getContent() {
    this.titles = Common.scrollContainer.getElementsByClassName("content");

    for (let i = 0; i < this.titles.length; i++) {
      let textContent = this.titles[i].textContent;
      let tagName =
        this.titles[i].tagName === "SPAN"
          ? this.titles[i].parentNode.tagName
          : this.titles[i].tagName;

      this.meshes[tagName] = this.meshes[tagName] || {};
      const contentMesh = this.printContent(textContent);

      this.meshes[tagName][i] = contentMesh;
      Common.scene.add(contentMesh);
    }
  }

  printContent(text, size) {
    const { texture, font } = this;

    const glyph = new Glyph({
      text: text,
      font,
      map: texture,
      color: new Color(0x000000),
    });

    glyph.center();

    return glyph;
  }

  init() {}

  dispose() {}

  render(t) {
    const { x, y } = Input.coords;
    Object.keys(this.meshes).forEach((tagName) => {
      Object.keys(this.meshes[tagName]).forEach((key) => {
        this.meshes[tagName][key].rotation.y = -x * 0.05;
        this.meshes[tagName][key].rotation.x = -y * 0.05;
      });
    });
  }

  resizeMesh(mesh, rect, scale, height, width, decay) {
    mesh.position.set(
      rect.left + rect.width * 0.5 - width * 0.5,
      -rect.top + Device.scrollTop - rect.height * 0.5 + height * 0.5,
      0,
    );

    mesh.position.y -= decay;
  }

  resize(scale, height, width) {
    this.scale = scale;
    this.height = height;
    this.width = width;
    Object.keys(this.meshes).forEach((tagName) => {
      Object.keys(this.meshes[tagName]).forEach((key) => {
        const rect = this.titles[key].getBoundingClientRect();
        let decay = 0;
        if (tagName == "H1") {
          this.meshes[tagName][key].scale.set(
            (rect.width / 500) * this.lineHeight.h1,
            (rect.height / 45) * this.lineHeight.h1,
            1,
          );
          decay = 8;
        } else if (tagName == "H2") {
          this.meshes[tagName][key].scale.set(
            (rect.width / 500) * this.lineHeight.h2,
            (rect.height / 85) * this.lineHeight.h2,
            1,
          );
        } else if (tagName == "H3") {
          this.meshes[tagName][key].scale.set(
            (rect.width / 500) * this.lineHeight.h3,
            (rect.height / 85) * this.lineHeight.h3,
            1,
          );
        } else if (tagName == "H4") {
          this.meshes[tagName][key].scale.set(
            (rect.width / 500) * this.lineHeight.h4,
            (rect.height / 85) * this.lineHeight.h4,
            1,
          );
        } else if (tagName == "H5") {
          this.meshes[tagName][key].scale.set(
            (rect.width / 55) * this.lineHeight.h5,
            (rect.height / 8) * this.lineHeight.h5,
            1,
          );
          decay = 3;
        }
        this.resizeMesh(
          this.meshes[tagName][key],
          rect,
          scale,
          height,
          width,
          decay,
        );
      });
    });
  }

  setDebug(debug) {}
}
