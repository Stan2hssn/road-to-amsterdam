import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export default class ModelLoader {
  constructor(
    path,
    posX = 0,
    posY = 0,
    posZ = 0,
    scaleX = 1,
    scaleY = 1,
    scaleZ = 1,
    rotationX = 0,
    rotationY = 0,
    rotationZ = 0,
  ) {
    this.modelPath = path;
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.scaleZ = scaleZ;
    this.rotationX = rotationX;
    this.rotationY = rotationY;
    this.rotationZ = rotationZ;
  }

  load() {
    this.loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      this.loader.load(
        this.modelPath,
        (gltf) => {
          gltf.scene.position.set(this.posX, this.posY, this.posZ);
          gltf.scene.scale.set(this.scaleX, this.scaleY, this.scaleZ);
          gltf.scene.rotation.set(
            this.rotationX,
            this.rotationY,
            this.rotationZ,
          );

          this.children = [...gltf.scene.children];
          resolve(gltf.scene);
        },
        undefined,
        reject,
      );
    });
  }
}
