uniform sampler2D tDiffuse;
uniform sampler2D tPrev;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uResolution;
uniform float uTime;
uniform float uMouseVel;
uniform float uShift;

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
    float time = uTime * 0.002;
    vec2 uv = vUv;
    vec4 prev = texture2D(tPrev, uv) * .995;
    uv -= 0.5;

    float ratio = uResolution.x / uResolution.y;

    float direction = step(1., ratio);

    vec2 responsive = vec2(mix(ratio, 1.0, direction), mix(1.0, 1.0 / ratio, direction));
    vec2 mUv = uv * responsive;

    vec4 current = texture2D(tDiffuse, uv);
    vec2 corrected_mouse = uMouse * responsive;
    // corrected_mouse = vec2(sin(time), cos(time)) * .5 * responsive;

    float l = length(corrected_mouse * .5 - mUv + (fbm(fract(uv - .5) * 8. + time, 1) * .1));
    l = smoothstep(.5, -0.8, l * 2.5) * (uMouseVel);

    float mask = smoothstep(.01, .0, l);

    gl_FragColor = vec4(1., 1., 1., 1.);
    gl_FragColor = vec4(current.rgb, 1.);
    gl_FragColor = vec4(vec3(fbm(fract(uv - .5) * 4. - time, 8)), 1.);
    gl_FragColor = vec4(l, l, l, 1.);
    gl_FragColor = vec4(vec3(l + prev.r), 1.);
}