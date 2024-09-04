uniform float uTime;

uniform mat4 projectionMatrixCamera;
uniform mat4 viewMatrixCamera;

varying vec2 vUv;
varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec4 vTexCoords;
varying vec3 vNormal;
varying vec4 vWorldPosition;

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);

    float res = mix(mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x), mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
    return res * res;
}

void main() {
    float time = uTime * 0.005;
    vec3 pos = position;

    vNormal = mat3(modelMatrix) * normal;
    vWorldPosition = modelMatrix * vec4(position, 1.0);
    vTexCoords = projectionMatrixCamera * viewMatrixCamera * vWorldPosition;

    vec4 vertexPos = modelMatrix * vec4(pos, 1.0);

    vec3 transformedNormal = normalMatrix * normal;
    worldNormal = normalize(transformedNormal);

    eyeVector = normalize(vertexPos.xyz - cameraPosition);

    vWorldPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * vertexPos;

    gl_Position = projectionMatrix * viewPosition;
    vUv = uv;
}
