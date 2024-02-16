import { BoxGeometry, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';

export default class {
  constructor() {
    this.init();
  }

  init() {
    this.geometry = new SphereGeometry(0.5, 16, 16);

    this.material = new MeshBasicMaterial({ color: 0x5f4633 });

    this.mesh = new Mesh(this.geometry, this.material);

    this.posX = 0;
    this.posY = 0;
    this.posZ = 0;

    this.mesh.position.set(this.posX, this.posY, this.posZ);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {}

  resize() {}
}
