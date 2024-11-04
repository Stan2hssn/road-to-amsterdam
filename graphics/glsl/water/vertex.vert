uniform mat4 viewMatrixCamera;
uniform mat4 projMatrix;

varying vec4 vTexCoords;

void main() {
    vec4 vertexPos = modelMatrix * vec4(position, 1.0);

    vec4 viewPosition = viewMatrix * vertexPos;

    vTexCoords = projMatrix * viewMatrixCamera * vertexPos;
    gl_Position = projectionMatrix * viewPosition;
}