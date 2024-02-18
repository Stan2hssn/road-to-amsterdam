import { Group, PlaneGeometry, MeshBasicMaterial } from 'three';

import Common from '../Common';

import Instance from './instance';

import Device from '../pure/Device';

export default class {
  Starter = {};
  $target = null;

  constructor() {
    this.init();
  }

  init() {
    this.StarterGroup = new Group();

    // this.Starter.floor = new Floor();
    this.$target = document.querySelectorAll('.item');

    this.$target.forEach((el, index) => {
      this.geometryAttribute = el.getAttribute('geometry');

      this.instance = new Instance(this.$target[index], this.geometryAttribute);
      this.Starter[index] = this.instance;
      // console.log('position', this.instance.mesh.position);
    });

    Object.keys(this.Starter).forEach((key) => {
      this.StarterGroup.add(this.Starter[key].mesh);
    });

    Common.scene.add(this.StarterGroup);
  }

  dispose() {}

  render(t) {
    Object.keys(this.Starter).forEach((key) => {
      this.Starter[key].render(t);
    });
  }

  resize(scale, height, width) {
    Object.keys(this.Starter).forEach((key) => {
      this.Starter[key].resize(scale, height, width);
    });
  }
}
