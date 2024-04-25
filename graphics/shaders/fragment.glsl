uniform sampler2D uState1;
uniform sampler2D uState2;
uniform float uProgress;
uniform vec2 uMouse;

varying vec2 vUv;

void main() {
    vec4 s1 = texture2D(uState1, vec2(vUv.x, 1. - vUv.y));
    vec4 s2 = texture2D(uState2, vec2(vUv.x, 1. - vUv.y));

    float mouse = length(vUv - uMouse) * 2.;
    vec2 st = vUv - uMouse;

    float dist = length(st * .8) / uProgress;
    float radius = 1.4;
    float progress = 1. * uProgress;
    float thinkness = .2;

    float innerProgress = clamp(progress, 0., 1.);
    float outerProgress = clamp(progress - thinkness, 0., 1.);

    float innerCircle = 1. - smoothstep((innerProgress - thinkness) * radius, innerProgress * radius, dist);
    float outerCircle = 1. - smoothstep((outerProgress - thinkness) * radius, outerProgress * radius, dist);

    float displacement = (innerCircle - outerCircle);
    float scale = mix(s1.x, s2.x, innerCircle);

    gl_FragColor = vec4(vec3(displacement, scale, mouse), 1.0);
}