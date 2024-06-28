uniform sampler2D uText;
uniform vec2 uMouse;
uniform float uTime;
uniform float uShift;
uniform float uStep;
uniform vec2 uRes;

uniform sampler2D tDiffuse;
uniform sampler2D tPrev;
uniform sampler2D uNoise;
uniform sampler2D uNoiseFlow;

varying vec2 vUv;

#define PI 3.14159265359

vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float prng(float x) {
    return (sin(x) + sin(2.2 * x + 5.52) + sin(2.9 * x + 0.93) + sin(4.6 * x + 8.94)) / 4.0;
}

vec2 bubble(vec2 p, vec4 noisColor, vec2 shift, float influence) {
    p += snoise(p * 1.5 + uTime * 0.1) * 0.1;

    float maximus = uStep * 3.;
    p.y -= (uMouse.y * influence) + shift.x;
    p.x -= (uMouse.x * influence) + shift.y;

    p -= sin(max(p.xy * 1.2, maximus) - uTime + vec2(1., 1.1)) * 0.1;
    p -= cos(max(p.yx * 1.1, maximus) - uTime + vec2(1., 1.1)) * 0.1;
    p += sin(max(p.yx * 1.2, maximus) - uTime + vec2(1., 1.)) * 0.1;
    p += cos(max(p.yx * 1., maximus) - uTime + vec2(3., 2.)) * 0.1;

    return p;
}

void main() {
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

    float scaleFac = .7;

    float dist = length(current.rg);

    float compiler = 1. - dist;

    vec2 dir = normalize(corrected_mouse - winUv);

    float step = .9;

    vec2 c = dir * (1. - smoothstep(0.4, step + .1, compiler));

    vec2 newUv = uv + (c);

    float mask = smoothstep(step, step, compiler);

    vec4 color = texture2D(uText, newUv);

    mask *= smoothstep(0.5, 1., 1. - color.r);

    gl_FragColor = vec4(.2, 0.3, 0.2, 1.0);
    gl_FragColor = vec4(color.rgb + vec3(0., 0., 1.), 1.);
    gl_FragColor = color;
    gl_FragColor = vec4(c, 1., 1.0);
    gl_FragColor = vec4(winUv, 0., 1.);
    gl_FragColor = vec4(compiler, 0., 0., 1.);
    gl_FragColor = vec4(current.rgb, 1.);
    gl_FragColor = vec4(color.rgb + vec3(0., 0., 1.), mask);
}