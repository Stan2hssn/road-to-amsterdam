uniform float uTime;
uniform sampler2D uPositions;

varying vec3 uPosition;
varying vec2 vUv;
varying vec4 vColor;

#define bg 33./ 255.
#define PI 3.14159265359

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
    vUv = uv;
    vec4 pos = texture2D(uPositions, uv);

    vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.);

    float angle = atan(pos.y, pos.x);
    float radius = length(pos.xy);

    float c = cos(PI + angle + uTime * .1) * radius * .1 + noise(uv * 10.) * .1;

    vColor = vec4(vec3(1.5 - c), c + .15);

    gl_PointSize = 5. * (1. / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}