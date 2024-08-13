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

export default class {
  content = null;
  titles = {};
  sections = {};

  meshes = {
    H1: {},
    H2: {},
    H3: {},
    H4: {},
    H5: {},
    H6: {},
    P: {},
  };

  fontFamily = {
    H1: "AvenueX",
    H2: "AvenueX",
    H3: "SatoshiMedium",
    H4: "SatoshiBold",
    H5: "SatoshiBold",
    H6: "SatoshiMedium",
    P: "SatoshiMedium",
  };

  fontStyles = {
    H1: {
      scale: 0.85,
      lineHeight: 60,
    },

    H2: {
      scale: 0.8,
      lineHeight: 60,
    },

    H3: {
      scale: 0.6,
      lineHeight: 50,
    },

    H4: {
      scale: 0.5,
      lineHeight: 60,
    },

    H5: {
      scale: 0.38,
      lineHeight: 60,
    },

    H6: {
      scale: 0.3,
      lineHeight: 60,
    },

    P: {
      scale: 0.38,
      lineHeight: 60,
    },
  };

  params = {
    Color: new Color(0x236a88),
  };
  $target = Common.scrollContainer;

  Fonts = {
    AvenueX: {
      font: null,
      texture: null,
    },
    SatoshiMedium: {
      font: null,
      texture: null,
    },
    SatoshiBold: {
      font: null,
      texture: null,
    },
  };

  manager = new LoadingManager();
  fontLoader = new FontLoader(this.manager);
  textureLoader = new TextureLoader(this.manager);

  constructor() {
    this.manager = new LoadingManager(this.onLoadComplete.bind(this));
    this.fontLoader = new FontLoader(this.manager);
    this.textureLoader = new TextureLoader(this.manager);

    this.loadAssets();
  }

  loadAssets() {
    this.fontLoader.load("./font/Avenue-X.json", (font) => {
      this.Fonts.AvenueX.font = font;
    });

    this.fontLoader.load("./font/Satoshi-Medium.json", (font) => {
      this.Fonts.SatoshiMedium.font = font;
    });

    this.fontLoader.load("./font/Satoshi-Bold.json", (font) => {
      this.Fonts.SatoshiBold.font = font;
    });

    this.Fonts.AvenueX.texture = this.textureLoader.load("./font/Avenue-X.png");
    this.Fonts.SatoshiMedium.texture = this.textureLoader.load(
      "./font/Satoshi-Medium.png",
    );
    this.Fonts.SatoshiBold.texture = this.textureLoader.load(
      "./font/Satoshi-Bold.png",
    );
  }

  onLoadComplete() {
    this.titles = this.$target.getElementsByClassName("content");
    this.getContent();
    this.init();
  }

  getDummy() {
    return new Mesh(
      new PlaneGeometry(1, 1),
      new MeshBasicMaterial({ color: 0xffff00 }),
    );
  }

  async getContent() {
    const promises = [];

    for (let i = 0; i < this.titles.length; i++) {
      const title = this.titles[i];
      const section = this.getParentSection(title);
      const tagName =
        title.tagName === "SPAN" ? title.parentNode.tagName : title.tagName;

      if (!this.meshes[tagName]) this.meshes[tagName] = {};

      const contentMeshPromise = this.printContent(
        title.innerText,
        this.fontFamily[tagName],
        title,
        tagName,
      ).then((contentMesh) => {
        contentMesh.rotation.x = -Math.PI;
        this.meshes[tagName][i] = contentMesh;

        if (Common.pages.About.scenes[section.className]) {
          Common.pages.About.scenes[section.className].add(contentMesh);
        }
      });

      promises.push(contentMeshPromise);
    }

    await Promise.all(promises);
    this.resize(Common.scale, Device.viewport.height, Device.viewport.width);
  }

  getParentSection(element) {
    let parent = element.parentNode;
    while (parent.tagName !== "SECTION") {
      parent = parent.parentNode;
    }
    return parent;
  }

  async printContent(text, fontFamily, title, tagName) {
    const { font, texture } = this.Fonts[fontFamily];
    const style = window.getComputedStyle(title);
    const align = style["text-align"];
    const lineHeight = this.fontStyles[tagName].lineHeight;

    const geometry = new MSDFTextGeometry({
      text,
      font: font.data,
      width: 1000,
      align: align,
      flipY: true,
      lineHeight: lineHeight,
      letterSpacing: 0.5,
    });

    const material = new MSDFTextMaterial({});

    material.uniforms.uColor.value = this.params.Color;
    material.uniforms.uMap.value = texture;

    const mesh = new Mesh(geometry, material);

    mesh.rotation.x = Math.PI;

    return new Mesh(geometry, material);
  }

  init() {}

  dispose() {}

  render(t) {}

  resizeMesh(mesh, rect, textScale, height, width, text, scaleFactor) {
    if (scaleFactor > 1) {
      mesh.geometry.update({
        width: rect.width * scaleFactor,
        height: rect.height,
      });
    }

    mesh.scale.set(textScale, textScale, 1);

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
        const text = this.titles[key].innerText;

        let scaleFactor = 1;
        let textScale = 1;
        if (tagName == "H1") {
          textScale = this.fontStyles.H1.scale / ((6 * 100) / width);
        } else if (tagName == "H2") {
          textScale = this.fontStyles.H2.scale;
        } else if (tagName == "H3") {
          textScale = this.fontStyles.H3.scale / ((8 * 100) / width);
        } else if (tagName == "H4") {
          textScale = this.fontStyles.H4.scale;
        } else if (tagName == "H5") {
          textScale = this.fontStyles.H5.scale;
          scaleFactor = 2.6;
        } else if (tagName == "H6") {
          textScale = this.fontStyles.H6.scale;
          scaleFactor = 2.8;
        } else if (tagName == "P") {
          textScale = this.fontStyles.P.scale;
          scaleFactor = 2.6;
        }
        this.resizeMesh(
          this.meshes[tagName][key],
          rect,
          textScale,
          height,
          width,
          text,
          scaleFactor,
        );
      });
    });
  }

  debug(debug) {
    debug
      .addBinding(this.fontStyles.H3, "lineHeight", {
        label: "Line Height",
        min: 0,
        max: 100,
        step: 1,
      })
      .on("change", () => {
        Object.keys(this.meshes).forEach((tagName) => {
          Object.keys(this.meshes[tagName]).forEach((key) => {
            this.meshes[tagName][key].geometry.update({
              lineHeight: this.fontStyles.H3.lineHeight,
            });
          });
        });
      });
  }
}
