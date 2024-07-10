uniform sampler2D uText;
uniform vec2 uMouse;
uniform float uTime;
uniform float uShift;
uniform float ustepFactor;
uniform vec2 uRes;
uniform float uMouseVel;

uniform sampler2D tDiffuse;
uniform sampler2D tPrev;
uniform sampler2D uNoise;
uniform sampler2D uNoiseFlow;

varying vec2 vUv;

#define PI 3.14159265359

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
        v += a * noise(x) * 2.;
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    float time = uTime * 0.2;

    vec2 uv = vUv;

    vec2 winUv = gl_FragCoord.xy / uRes.xy;
    float aspect = uRes.y / uRes.x;
    winUv = winUv * .5;

    float ratio = uRes.x / uRes.y;
    float direction = step(1., ratio);
    vec2 responsive = vec2(mix(ratio, 1.0, direction), mix(1.0, 1.0 / ratio, direction));
    vec2 mUv = (uv - .5) * responsive;
    vec2 corrected_mouse = uMouse * responsive;
    corrected_mouse = corrected_mouse * .5;

    vec4 current = texture2D(tDiffuse, winUv);

    float scaleFac = 5.;

    float dist = current.r;

    float compiler = dist;

    vec2 dir = normalize((corrected_mouse) - mUv);

    float stepFactor = .9;

    vec2 c = (dir) * (smoothstep(0.7, stepFactor + .1, compiler)) * .1;

    vec2 newUv = (mUv + .5) * 1. + c;

    float mask = smoothstep(stepFactor, stepFactor - .01, compiler);

    float noiseFactor = ((fbm(newUv + time, 41) * (.1 * (uMouseVel * .1 + .5))) + 1.);

    vec4 text = texture2D(uText, noiseFactor * vec2(fract(newUv.x + time), newUv.y * 5. - .5) - vec2(0.0, 2. + .8));
    vec4 text1 = texture2D(uText, noiseFactor * vec2(fract(newUv.x - time), newUv.y * 5. - .5) - vec2(0.0, 1. + .8));
    vec4 text2 = texture2D(uText, noiseFactor * vec2(fract(newUv.x + time), newUv.y * 5. - .5) - vec2(0.0, 0. + .8));

    text.rgb *= text1.rgb * text2.rgb;

    mask *= smoothstep(0.8, 1., 1. - text.r);

    gl_FragColor = vec4(text.rgb + vec3(0., 0., 1.), 1.);
    gl_FragColor = text;
    gl_FragColor = vec4(text.rgb + vec3(.0, 0.0, 1.), mask);
    gl_FragColor = vec4((current.r - winUv) + (winUv), 0., 1.);
    gl_FragColor = vec4(newUv, 0., 1.);
    gl_FragColor = vec4(c, 1., 1.0);
    gl_FragColor = vec4(current.rgb, 1.);
    gl_FragColor = vec4(mask, 0.3, 0.2, 1.0);
    gl_FragColor = vec4(text.rgb + vec3(.3, 0.29, .8), mask);
}