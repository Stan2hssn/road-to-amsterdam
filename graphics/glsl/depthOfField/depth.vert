varying vec2 vUv;

void main() {
    vUv = uv;

    vec4 vertexPos = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * vertexPos;

    gl_Position = projectionMatrix * viewPosition;
}