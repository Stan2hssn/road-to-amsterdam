import { TextureLoader } from "three";

const imageLoader = new TextureLoader();

const Library = {
  Images: {
    Normal: {
      advect: imageLoader.load("/Texture/Images/Normal/advect.png"),
    },
    Diffuse: {},
    BW: {},
    Helpers: {
      checkerUV: imageLoader.load("/Texture/Images/Helpers/checkerUV.jpg"),
    },
    Procedural: {},
  },
  Videos: {},
};

export default Library;
