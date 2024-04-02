uniform float uTime;
uniform sampler2D uPositions;

varying vec2 vUv;
varying vec4 vColor;

void main() {
    vec2 st = vUv;

    gl_FragColor = vec4(vColor);
    // gl_FragColor = vec4(.2, 0.3, 0.2, sin(uTime * .2) * 0.2 + 0.5);
}