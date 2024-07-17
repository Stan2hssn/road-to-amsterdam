varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vec4 mvPosition = viewMatrix * worldPos;

    gl_Position = projectionMatrix * mvPosition;

    vNormal = normalMatrix * normal;
    vUv = uv;
}