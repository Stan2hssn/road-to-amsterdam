import CloudsFragment from "./glsl/clouds/cloud.frag";
import CloudsVertex from "./glsl/clouds/cloud.vert";
import drawClouds from "./glsl/clouds/draw.frag";

import BicubicUpscaleMaterial from "./extends/BicubicUpscaleMaterial";

const Shaders = {
  Materials: {
    BicubicFilter: new BicubicUpscaleMaterial(),
  },
  glsl: {
    Clouds: {
      fragment: CloudsFragment,
      vertex: CloudsVertex,
      draw: drawClouds,
    },
  },
};

export default Shaders;
