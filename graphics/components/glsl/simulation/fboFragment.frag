uniform sampler2D tDiffuse;
uniform sampler2D tPrev;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uResolution;
uniform float uTime;

varying vec2 vUv;

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);

    float res = mix(mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x), mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
    return res * res;
}

float fbm(vec2 x, int NUM_OCTAVES) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for(int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    // uv *= aspect;

    vec4 prev = texture2D(tPrev, uv);
    vec4 current = texture2D(tDiffuse, uv);

    float l = length(uMouse * .5 - uv);
    l = smoothstep(.1, 0., l);

    float preL = length(uPrevMouse * .5 - uv);
    preL = smoothstep(.01, .0, preL);

    gl_FragColor = vec4(uv, 1., 1.);
    gl_FragColor = vec4(l + preL * .9, 1., 1., 1.);
    gl_FragColor = vec4(1., 1., 1., 1.);
    gl_FragColor = vec4(prev.rgb, 1.);
    gl_FragColor = vec4(vec3(l) + prev.rgb * .9, 1.);
}