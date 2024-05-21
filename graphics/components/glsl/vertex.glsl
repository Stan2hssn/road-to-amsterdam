uniform float uTime;
varying vec2 vUv;

void main() {
    vec3 pos = position;

    pos.y += sin(uTime) * 0.02;
    pos.x += cos(uTime) * 0.02;
    pos.z += sin(uTime) * 0.02;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    vUv = uv;
}