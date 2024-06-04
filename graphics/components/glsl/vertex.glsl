uniform float uTime;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec2 vUv;

void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vec4 mvPosition = viewMatrix * worldPos;

    vec3 transformedNormal = normalMatrix * normal;
    worldNormal = normalize(transformedNormal);

    eyeVector = normalize(worldPos.xyz - cameraPosition);

    gl_Position = projectionMatrix * mvPosition;

    vUv = uv;
}