import { BoxGeometry, Mesh, MeshBasicMaterial, TorusGeometry } from 'three';

export default class {
  constructor() {
    this.init();
  }

  init() {
    this.geometry = new TorusGeometry(0.5, 0.15, 16, 100);

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

  render(t) {
    // this.mesh.rotation.x = Math.sin(t / 500);
    // this.mesh.rotation.y = Math.cos(t / 500);
  }

  resize() {}
}
