import { TextureLoader } from "three";

const imageLoader = new TextureLoader();

const Library = {
  Images: {
    Normal: {
      advect: imageLoader.load("/Texture/Images/Normal/advect.png"),
      frostedGlass: imageLoader.load("/Texture/Images/Normal/frostedGlass.jpg"),
      goldTexture: imageLoader.load("/Texture/Images/Normal/goldTexture.webp"),
    },
    Diffuse: {
      GoldDiffuse: imageLoader.load("/Texture/Images/Diffuse/GoldDiffuse.webp"),
      //   GoldDiffuse4K: imageLoader.load("/Texture/Images/Diffuse/GoldDiffuse4k.webp"),
      MarbleDiffuse: imageLoader.load(
        "/Texture/Images/Diffuse/MarbleDiffuse.webp",
      ),
      //   MarbleTexture6K: imageLoader.load("/Texture/Images/Diffuse/MarbleTexture6K.webp"),
      ShellDiffuse: imageLoader.load(
        "/Texture/Images/Diffuse/ShellDiffuse.webp",
      ),
    },
    BW: {
      MarbleMap: imageLoader.load("/Texture/Images/BW/MarbleMap.webp"),
    },
    Helpers: {
      checkerUV: imageLoader.load("/Texture/Images/Helpers/checkerUV.jpg"),
      gradient: imageLoader.load("/Texture/Images/Helpers/gradient.png"),
    },
    Procedural: {
      noiseLight: imageLoader.load(
        "/Texture/Images/Procedural/noise_light.jpg",
      ),
    },
  },
  Videos: {
    memory: document.getElementById("memory"), // Assuming this element is in your HTML
  },
};

export default Library;
