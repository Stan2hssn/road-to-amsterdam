import {
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  Color,
  DoubleSide,
  Uniform,
  Vector2,
  Group,
} from "three";

import Common from "../../Common";
import Input from "../../Input";

import glassy from "./glsl/glassy.frag";
import mat from "./glsl/mat.frag";
import blured from "./glsl/blured.frag";
import vertex from "./glsl/vertex.vert";
import Device from "../../pure/Device";

export default class {
  params = {
    length: 7,
  };

  Panels = {};

  constructor(rayCoords, raycastId) {
    this.raycastId = raycastId;
    this.rayCoords = rayCoords;
    this.pivot = 0;

    this.getMaterial();
    this.init();
  }

  getMaterial() {
    const panelShaders = [glassy, mat, blured];

    this.Materials = {
      glassy: null,
      mat: null,
      blured: null,
    };

    Object.keys(this.Materials).forEach((key, index) => {
      this.Materials[key] = new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color(Math.random() * 0xffffff) },
          tTransmission: new Uniform(null),
          uResolution: new Uniform(
            new Vector2(
              Device.viewport.width,
              Device.viewport.height,
            ).multiplyScalar(Device.pixelRatio),
          ),
          uCoords: new Uniform(),
          uRayCoords: new Uniform(),
          uId: new Uniform(0),
        },
        vertexShader: vertex,
        fragmentShader: panelShaders[index],
        side: DoubleSide,
        transparent: true,
      });

      this.Materials[key].userData = key;
    });
  }

  getMesh(j) {
    const index = [0, 1, 0, 2, 1, 2, 1, 2];

    const geometry = new PlaneGeometry(0.45, 0.32, 1, 1);

    let materialKey;

    // Assign material based on the index
    switch (index[j]) {
      case 0:
        materialKey = "glassy";
        break;
      case 1:
        materialKey = "mat";
        break;
      case 2:
        materialKey = "blured";
        break;
    }

    return new Mesh(geometry, this.Materials[materialKey]);
  }

  init() {
    this.target = document.querySelector(".panel");

    this.PanelGroup = new Group();
    this.positionPlane = [];

    for (let i = 0; i < this.params.length; i++) {
      let panelName = `Panel-${i}`;

      this.Panels[panelName] = this.getMesh(i);

      this.Panels[panelName].material.uniforms.uId.value =
        i / this.params.length;

      this.Panels[panelName].userData =
        `${this.Panels[panelName].material.userData}-${i}`;

      let angle = (i / this.params.length) * (2 * Math.PI);

      // Rotate the object to face the center and add tilt
      this.Panels[panelName].rotation.y = -(Math.sin(angle) * Math.PI) / 8; // Slight tilt on the y-axis based on angle
      this.Panels[panelName].rotation.x = -(Math.cos(angle) * Math.PI) / 8; // Slight tilt on the x-axis based on angle
      this.Panels[panelName].rotation.z = angle + Math.PI; // Adjust rotation to face center

      this.PanelGroup.add(this.Panels[panelName]);
    }

    Common.pages.About.scenes.Main.add(this.PanelGroup);
  }

  dispose() {
    Object.values(this.Panels).forEach((panel) => {
      Common.scene.remove(panel);
    });
  }

  render(t) {
    Object.values(this.Panels).forEach((panel, i) => {
      const id = this.raycastId;
      const m = panel.material.uniforms;

      let angle = (i / this.params.length) * (2 * Math.PI);

      // console.log("raycastCoords", this.rayCoords);

      m.uTime.value = t;
      m.uResolution.value
        .set(Device.viewport.width, Device.viewport.height)
        .multiplyScalar(Device.pixelRatio);

      m.uCoords.value = Input.coords;

      panel.position.set(
        Math.cos(angle) *
          ((Input.scroll / Device.viewport.height) * 0.02 + 0.25),
        Math.sin(angle) *
          ((Input.scroll / Device.viewport.height) * 0.02 + 0.25),
        0,
      );

      this.PanelGroup.rotation.z = Input.scroll * 0.001;
    });
  }

  resize(scale, height, width) {
    const rect = this.target.getBoundingClientRect();

    this.scale = scale;
    this.height = height;
    this.width = width;

    this.PanelGroup.scale.set(rect.height, rect.height, 500);

    this.PanelGroup.position.set(
      rect.left + rect.height * 0.5 - this.width * 0.5,
      -rect.top + Device.scrollTop - rect.height * 0.5 + this.height * 0.5,
      0,
    );
  }

  setDebug(debug) {}
}
