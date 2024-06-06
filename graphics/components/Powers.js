import {
  Group,
  Mesh,
  SphereGeometry,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  MeshBasicMaterial,
  TextureLoader,
  PlaneGeometry,
} from "three";

import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

import Common from "../Common";

import Floor from "./starter/Floor";
import Cube from "./starter/Cube";
import { materialEmissive } from "three/examples/jsm/nodes/Nodes.js";

export default class {
  Starter = {};

  constructor() {
    this.init();
  }

  init() {
    this.StarterGroup = new Group();

    // this.Starter.floor = new Floor();

    this.Starter.Cube = new Cube(0, 0, 0);
    // this.dummy = new Mesh(
    //   new SphereGeometry(1, 32, 32),
    //   new MeshBasicMaterial({ color: 0xff0000 }),
    // );

    const loader = new FontLoader();

    loader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      function (font) {
        const dummy = new TextGeometry("C S", {
          font: font,
          size: 80,
          depth: 0.05,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 1,
          bevelSize: 8,
          bevelOffset: 0,
          bevelSegments: 5,
        });

        const dummyMesh = new Mesh(
          dummy,
          new MeshBasicMaterial({ color: 0xf2f1ed }),
        );

        dummyMesh.scale.set(0.014, 0.014, 0.014);
        dummyMesh.position.set(-1.2, -0.5, 0);

        Common.scene.add(dummyMesh);
      },
    );

    Object.keys(this.Starter).forEach((key) => {
      // this.StarterGroup.add(this.Starter[key].mesh);
    });

    Common.scene.add(this.StarterGroup);
  }

  dispose() {}

  render(t) {
    Object.keys(this.Starter).forEach((key) => {
      this.Starter[key].render(t);
    });
  }

  resize() {}
}
