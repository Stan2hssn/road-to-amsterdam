uniform float uTime;
uniform sampler2D uPositions;

varying vec3 uPosition;
varying vec2 vUv;

void main() {
    vUv = uv;
    vec4 pos = texture2D(uPositions, uv);

    vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.);

    gl_PointSize = 10. * (1. / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}