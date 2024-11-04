import { TextureLoader } from "three";

const imageLoader = new TextureLoader();

const Library = {
  Images: {
    Normal: {
      advect: imageLoader.load("/Texture/Images/Normal/advect.png"),
    },
    Diffuse: {},
    Maps: {
      homeScreen: imageLoader.load("/Texture/Images/Maps/homeScreen.webp"),
    },
    BW: {},
    Helpers: {
      checkerUV: imageLoader.load("/Texture/Images/Helpers/checkerUV.jpg"),
    },
    Procedural: {},
  },
  Videos: {},
};

console.log("Library:", Library);

export default Library;
