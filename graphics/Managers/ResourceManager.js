import { TextureLoader } from "three";
import ShaderPaths from "../pure/Shaders";
import TexturePaths from "../pure/Library";

class ResourceManager {
  constructor() {
    this.textureLoader = new TextureLoader();
    this.resources = {
      textures: {},
      shaders: {},
    };
  }

  // Modify loadShader to accept a variable number of arguments
  loadShader(...path) {
    const shaderName = path.join("/");
    if (!this.resources.shaders[shaderName]) {
      let shaderPaths = ShaderPaths;
      for (let key of path) {
        shaderPaths = shaderPaths[key];
        if (!shaderPaths) {
          console.error(`Shader path "${path.join("/")}" not found.`);
          return null;
        }
      }

      const vertexPath = shaderPaths.vertex || null;
      const fragmentPath = shaderPaths.fragment || null;

      if (vertexPath && fragmentPath) {
        const vertexShader = fetch(vertexPath).then((res) => res.text());
        const fragmentShader = fetch(fragmentPath).then((res) => res.text());

        return Promise.all([vertexShader, fragmentShader]).then(
          ([vertex, fragment]) => {
            this.resources.shaders[shaderName] = { vertex, fragment };
            return this.resources.shaders[shaderName];
          },
        );
      } else if (vertexPath) {
        return fetch(vertexPath)
          .then((res) => res.text())
          .then((vertex) => {
            this.resources.shaders[shaderName] = { vertex, fragment: "" };
            return this.resources.shaders[shaderName];
          });
      } else {
        console.error(
          `Shader "${shaderName}" not found (neither vertex nor fragment).`,
        );
        return null;
      }
    }
    return Promise.resolve(this.resources.shaders[shaderName]);
  }

  // Modify getShader similarly if needed
  getShader(...path) {
    const shaderName = path.join("/");
    return this.resources.shaders[shaderName];
  }
}

export default new ResourceManager();
