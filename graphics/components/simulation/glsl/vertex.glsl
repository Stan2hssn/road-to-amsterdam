attribute vec2 instancedUv;
attribute vec3 instancedPosition;
attribute vec3 instancedScale;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;

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
    vec3 pos = position;
    vec4 mvPosition = modelMatrix * vec4(pos.xyz, 1.);

    mvPosition.x *= 1. - pos.y + .8;
    mvPosition.y *= instancedScale.y + .5;
    mvPosition.xz += vec2(pos.xz) * pos.y;
    mvPosition.xz = pos.xz + noise((instancedUv) + uTime * .1) * pos.y * .5;

    mvPosition.xyz += instancedPosition;

    gl_Position = projectionMatrix * viewMatrix * mvPosition; // World space to screen space
    vUv = uv;
    vPosition = mvPosition.xyz;
}
