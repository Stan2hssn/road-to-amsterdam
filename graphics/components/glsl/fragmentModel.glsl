varying vec2 vUv;
varying vec3 vPosition;
varying float viewer;

void main() {
    vec2 uv = vUv;
    vec3 pos = vPosition;

    gl_FragColor = vec4(.2, 0.3, 0.2, 1.0);
    gl_FragColor = vec4(uv, 0.0, 1.0);
    gl_FragColor = vec4(viewer, viewer, viewer, 1.0);
    gl_FragColor = vec4(pos, 1.0);

}