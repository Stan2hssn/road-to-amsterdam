varying vec2 vUv;
varying vec3 vPos;

void main() {

    vec4 vertexPos = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * vertexPos;

    gl_Position = projectionMatrix * viewPosition;

    vPos = position;
    vUv = uv;
}