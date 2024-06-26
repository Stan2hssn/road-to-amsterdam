import vertexShader from "../components/glsl/displacement/vertex.vert";
import fragmentShader from "../components/glsl/displacement/fragment.frag";
import textVertex from "../components/glsl/simulation/textVertex.vert";
import textFragment from "../components/glsl/simulation/textFragment.frag";
import fboFragment from "../components/glsl/simulation/fboFragment.frag";
import vertex from "../components/glsl/vertex.vert";

function shaders() {
  return {
    fboFragment,
    vertexShader,
    fragmentShader,
    textVertex,
    textFragment,
    vertex,
  };
}

export {
  fboFragment,
  vertexShader,
  fragmentShader,
  textVertex,
  textFragment,
  vertex,
  shaders,
};
