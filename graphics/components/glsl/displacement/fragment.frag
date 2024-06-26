uniform float uTime;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;

    gl_FragColor = vec4(vec2(uv), 1., 1.);
}