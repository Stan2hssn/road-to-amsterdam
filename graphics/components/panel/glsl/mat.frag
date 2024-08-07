varying vec2 vUv;

void main() {
    vec2 uv = vUv;

    float dist = length(uv - vec2(0.5));

    if(dist > 0.5) {
        discard;
    }
    gl_FragColor = vec4(.2, 0.3, 0.2, 1.0);
}