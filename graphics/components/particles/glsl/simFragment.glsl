uniform float uTime;
uniform sampler2D uPositions;

varying vec2 vUv;

void main() {
    vec2 st = vUv;
    vec4 pos = texture2D(uPositions, st);

    // float radius = length(st);
    // float angle = atan(st.y, st.x) + .01;

    // vec3 targetPos = vec3(cos(angle), sin(angle), 1.) * radius;

    // pos.xy += (targetPos.xy - pos.xy) * 0.01;

    pos.xy += vec2(.001);

    gl_FragColor = vec4(pos.xy, 1.0, 1.0);
    // gl_FragColor = vec4(st.x, st.y, 0.0, 1.0);
    // gl_FragColor = vec4(.2, 0.3, 0.2, sin(uTime * .2) * 0.2 + 0.5);
}