varying vec2 vUv;

void main() {

    vec4 vertexPos = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * vertexPos;
    vUv = uv;

    gl_Position = projectionMatrix * viewPosition;
}