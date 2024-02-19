import { Group } from 'three';

import Common from '../Common';

import Floor from './starter/Floor';
import Cube from './starter/Cube';

export default class {
  Starter = {};

  constructor() {
    this.init();
  }

  init() {
    this.StarterGroup = new Group();

    this.Starter.floor = new Floor();
    this.Starter.Cube = new Cube(0, 1.2, 0);

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

  resize() {}
}
