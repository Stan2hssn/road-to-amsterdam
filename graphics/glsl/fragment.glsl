uniform float uTime;

void main() {

    gl_FragColor = vec4(.2, 0.3, 0.2, sin(uTime * .2) * 0.2 + 0.5);
}