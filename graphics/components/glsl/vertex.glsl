uniform float uTime;
uniform sampler2D normalModel;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec2 vUv;
varying vec3 pos;

void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vec4 mvPosition = viewMatrix * worldPos;

    vec3 model = texture2D(normalModel, uv).xyz;

    vec3 transformedNormal = normalMatrix * normal;
    worldNormal = normalize(transformedNormal);

    eyeVector = normalize(worldPos.xyz - cameraPosition);

    gl_Position = projectionMatrix * mvPosition;

    pos = position;
    vUv = uv;
}