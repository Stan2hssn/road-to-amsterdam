varying float view;

varying vec3 rayCoords;
varying vec3 pos;

uniform float uTime;
uniform float uShrink;

uniform vec3 uRayCoords;

void main() {
    float time = uTime;
    float color = smoothstep(.2, .2, length(pos.xy - vec2(cos(time) * .25, sin(time) * 0.25)));

    // gl_FragColor = vec4(color, 1.0);
    gl_FragColor = vec4(vec3(view), 1.0);
}