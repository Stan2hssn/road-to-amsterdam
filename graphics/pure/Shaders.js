import depthVertex from "../glsl/depthOfField/depth.vert";
import depthFragment from "../glsl/depthOfField/depth.frag";

import vertexLantern from "../glsl/lantern/vertexLantern.vert";
import fragmentLantern from "../glsl/lantern/lantern.frag";

import instancesFragment from "../glsl/lantern/instances/lantern.frag";
import instancesVertex from "../glsl/lantern/instances/lantern.vert";

const Shaders = {
  postProcessing: {
    depthOfField: {
      vertex: depthVertex,
      fragment: depthFragment,
    },
  },

  Components: {
    mainLantern: {
      vertex: vertexLantern,
      fragment: fragmentLantern,
    },
    lanternInstances: {
      fragment: instancesFragment,
      vertex: instancesVertex,
    },
  },
};

export default Shaders;
