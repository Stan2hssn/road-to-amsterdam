uniform float uTime;
uniform float uId;
uniform vec2 uCoords;
varying vec2 vUv;

#define PI 3.14159265359

mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0, oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0, oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0, 0.0, 0.0, 0.0, 1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
  mat4 m = rotationMatrix(axis, angle);
  return (m * vec4(v, 1.0)).xyz;
}

void main() {
  float time = uTime * 0.001;
  vec3 pos = position;

  // Apply rotation
  pos = rotate(pos, vec3(1.0, 0.0, 0.0), (PI - uCoords.x) / 4.0 - PI - 1.0);

  // Apply model matrix
  vec4 vertexPos = modelMatrix * vec4(pos, 1.0);

  // Apply view and projection matrices
  vec4 viewPosition = viewMatrix * vertexPos;
  gl_Position = projectionMatrix * viewPosition;

  // Pass UV coordinates
  vUv = uv;
}
