import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  TextureLoader,
  LoadingManager,
  Color,
} from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { Glyph } from "three-glyph";

import Device from "../../pure/Device";

import Common from "../../Common";

export default class {
  content = null;
  titles = {};
  meshes = {};
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
      //   "./font/Avenue-X.png",
      "./Texture/texture.jpg",
    );

    this.manager.onLoad = () => {
      this.init();
      this.getContent();
    };
  }

  getContent() {
    this.titles = Common.scrollContainer.getElementsByClassName("content");

    for (let i = 0; i < this.titles.length; i++) {
      const textContent = this.titles[i].textContent;

      this.meshes[i] = this.printContent(textContent);
      this.resizeMesh(
        this.meshes[i],
        this.titles[i].getBoundingClientRect(),
        Common.scale,
        Device.viewport.height,
        Device.viewport.width,
      );

      Common.scene.add(this.meshes[i]);
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

    console.log("glyph", glyph);

    glyph.center();

    return glyph;
  }

  init() {}

  dispose() {}

  render(t) {}

  resizeMesh(mesh, rect, scale, height, width) {
    this.scale = scale;
    this.height = height;
    this.width = width;

    // mesh.scale.set(rect.width, rect.width, 1);
    mesh.scale.set(1, 1, 1);
    mesh.position.set(
      rect.left + rect.width * 0.5 - this.width * 0.5,
      -rect.top + Device.scrollTop - rect.height * 0.5 + this.height * 0.5,
      0,
    );
  }

  resize(scale, height, width) {
    Object.keys(this.meshes).forEach((key) => {
      const rect = this.titles[key].getBoundingClientRect();
      this.resizeMesh(this.meshes[key], rect, scale, height, width);
    });
  }

  setDebug(debug) {}
}
