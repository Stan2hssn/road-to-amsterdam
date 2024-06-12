varying vec2 vUv;

void main() {
    vec2 uv = vUv;

    gl_FragColor = vec4(.2, 0.3, 0.2, 1.0);
    gl_FragColor = vec4(uv, 0.0, 1.0);
}