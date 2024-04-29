uniform vec2 uResolution;
uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vec2 st = vUv;

    float s = smoothstep(0.6, 1.3, st.y);
    vec3 color = mix(vec3(.9), vec3(0.914, 0.588, 0.757), 1. - s);

    gl_FragColor = vec4(color, 1.0);
}