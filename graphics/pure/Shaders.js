// ./components/glsl/Shaders.js

// Import shaders for Balls
import ballsVertex from "../components/glsl/components/balls/balls.vert";
import ballsFragment from "../components/glsl/components/balls/balls.frag";

// Import shaders for Heart
import heartVertex from "../components/glsl/components/heart/heart.vert";
import heartFragment from "../components/glsl/components/heart/heart.frag";
import expandVertex from "../components/glsl/components/heart/expand.vert";
import expandFragment from "../components/glsl/components/heart/expand.frag";
import expandHeadVertex from "../components/glsl/components/heart/expandHead.vert";

// Import shaders for Pixels
import pixelVertex from "../components/glsl/components/pixels/pixel.vert";
import pixelFragment from "../components/glsl/components/pixels/pixel.frag";
import backgroundGlassVertex from "../components/glsl/components/pixels/backgroundGlass.vert";
import backgroundGlassFragment from "../components/glsl/components/pixels/backgroundGlass.frag";
import blurFragment from "../components/glsl/components/pixels/blur.frag";

// Import shaders for waveCursor
import color from "../components/glsl/components/waveCursor/color.frag";
import face from "../components/glsl/components/waveCursor/face.vert";

// Export all shaders as a single object
const Shaders = {
  balls: {
    vertex: ballsVertex,
    fragment: ballsFragment,
  },
  heart: {
    vertex: heartVertex,
    fragment: heartFragment,
    expand: {
      head: expandHeadVertex,
      vertex: expandVertex,
      fragment: expandFragment,
    },
  },
  pixels: {
    vertex: pixelVertex,
    fragment: pixelFragment,
    backgroundGlass: {
      vertex: backgroundGlassVertex,
      fragment: backgroundGlassFragment,
    },
    blur: blurFragment,
  },
  // simulation: {
  //   color: colorFragment,
  //   face: faceVertex,
  //   sim: {
  //     mouse: mouse,
  //     externalForce: externalForce,
  //   },
  // },
  waveCursor: {
    vertex: face,
    fragment: color,
  },
};

export default Shaders;
