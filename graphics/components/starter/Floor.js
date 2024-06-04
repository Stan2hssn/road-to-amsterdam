import { PlaneGeometry, MeshBasicMaterial, Mesh } from "three";

export default class {
  constructor(posX, posY, posZ) {
    this.init(posX, posY, posZ);
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.geometry = new PlaneGeometry(10, 10);
    this.material = new MeshBasicMaterial({ color: 0xffffaa, side: 2 });
    this.mesh = new Mesh(this.geometry, this.material);

    this.mesh.position.set(posX, posY, posZ);
    this.mesh.rotation.x = -Math.PI / 2;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {}

  resize() {}
}
