import {
  Float32BufferAttribute,
  BufferGeometry,
  Mesh,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

export default class CustomPlaneGeometry {
  constructor(
    width = 1,
    height = 1,
    numPlanes = 10,
    widthSegments = width / numPlanes,
    heightSegments = height / numPlanes,
  ) {
    this.parameters = {
      width,
      height,
      widthSegments,
      heightSegments,
      numPlanes,
    };

    this.geometry = this.init();
  }

  init() {
    if (this.parameters.numPlanes % 2 === 0) {
      this.parameters.numPlanes = this.parameters.numPlanes + 1;
      this.parameters.widthSegments =
        this.parameters.width / this.parameters.numPlanes;
    }

    const { width, height, numPlanes, widthSegments } = this.parameters;

    const geometry = new BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];
    const planeIndex = [];
    const planesNumber = [];

    for (let i = 0; i < numPlanes; i++) {
      const x = -width / 2 + widthSegments * i;
      const y = -height / 2;

      const offset = i * 4;

      // Vertices
      vertices.push(x, y, 0);
      vertices.push(x + widthSegments, y, 0);
      vertices.push(x + widthSegments, y + height, 0);
      vertices.push(x, y + height, 0);

      // indices (two triangles per plane)
      indices.push(offset + 0, offset + 1, offset + 2);
      indices.push(offset + 0, offset + 2, offset + 3);

      // indices.push(offset + 0, offset + 1, offset + 2);
      // indices.push(offset + 0, offset + 2, offset + 3);

      planeIndex.push(offset, offset, offset, offset);

      const uStart = i / numPlanes;
      const uEnd = (i + 1) / numPlanes;

      uvs.push(uStart, 0);
      uvs.push(uEnd, 0);
      ``;
      uvs.push(uEnd, 1);
      uvs.push(uStart, 1);

      planesNumber.push(
        numPlanes - 1,
        numPlanes - 1,
        numPlanes - 1,
        numPlanes - 1,
      );
    }

    geometry.setIndex(indices);
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute(
      "planeIndex",
      new Float32BufferAttribute(planeIndex, 1),
    );
    geometry.setAttribute("indices", new Float32BufferAttribute(indices, 1));
    geometry.setAttribute(
      "planesNumber",
      new Float32BufferAttribute(planesNumber, 1),
    );

    geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));

    geometry.computeVertexNormals();

    return geometry;
  }

  dispose() {}

  render(t) {}

  resize() {}

  setDebug(debug) {}
}
