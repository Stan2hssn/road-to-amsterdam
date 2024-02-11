import { BoxGeometry, Mesh, MeshMatcapMaterial, TextureLoader } from 'three';

import Texture from '../../../public/Texture/texture.png';

export default class {
  constructor(posX, posY, posZ) {
    this.loader = new TextureLoader();

    this.textures = {
      matcap: this.loader.load(Texture),
    };
    this.init(posX, posY, posZ);
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.geometry = new BoxGeometry(1, 1, 1);

    this.material = new MeshMatcapMaterial();
    this.material.matcap = this.textures.matcap;

    this.mesh = new Mesh(this.geometry, this.material);

    this.mesh.position.set(posX, posY, posZ);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    this.mesh.rotation.x = Math.sin(t / 500);
    this.mesh.rotation.y = Math.cos(t / 500);
  }

  resize() {}
}
