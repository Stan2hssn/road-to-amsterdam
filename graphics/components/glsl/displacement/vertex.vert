attribute vec3 planeIndex;
attribute vec3 planesNumber;

uniform float uTime;
uniform float uSpeed;
uniform float uInfluence;

varying vec2 vUv;

#define PI 3.14159265359

void main() {
    vec3 pos = position;
    pos.y = pos.y + sin((planeIndex.x / planesNumber.x) * PI / 4.) * uSpeed * 20. * uInfluence;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vUv = uv;
}
