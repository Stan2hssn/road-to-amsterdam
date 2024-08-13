varying vec2 vUv;
varying vec4 vNormal;
varying vec3 vPos;

void main() {

    vec4 vertexPos = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * vertexPos;

    vec4 viewNormal = viewMatrix * vec4(normal, 0.0);

    gl_Position = projectionMatrix * viewPosition;

    vPos = position;
    vNormal = viewNormal;
    vUv = uv;
}