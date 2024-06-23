uniform sampler2D uText;
uniform vec2 uMouse;
uniform float uTime;
uniform float uShift;
uniform float uStep;

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
    float time = uTime * 0.1;

    // uv = fract(uv);
    vec4 noisColor = texture2D(uNoiseFlow, fract(uv + vec2(cos(uTime * .01), sin(uTime * .01))));

    // vec2 p = uv * 2. - 1.0;
    vec2 p = (vec2(uv.x, (uv.y + .5) * .5) * 2.0 - 1.);

    vec2 bubble1 = bubble(p, noisColor, vec2(0., 0.), 1.);

    vec2 print = vec2(0.);
    print.x -= .5 - prng(time + .5);
    print.y += ((prng(time) - .5) * 1.);

    vec2 bubble2 = bubble(p, noisColor, vec2(sin(print.x), cos(print.y)), 0.);

    print.x -= 1. + prng(time + .2);
    print.y -= ((prng(time + PI) + 1.0));

    vec2 bubble3 = bubble(p, noisColor, vec2(cos(print.x), sin(print.y)), 0.);

    print.x -= .5 - prng(time - .5);
    print.y -= ((prng(time - PI * 2.) - 1.0) * .1);

    vec2 bubble4 = bubble(p, noisColor, vec2(cos(print.x), sin(print.y)), 0.);

    float scaleFac = 2.;

    float dist = length(bubble1) * scaleFac;
    float dist1 = length(bubble2) * scaleFac;
    float dist2 = length(bubble3) * scaleFac;
    float dist3 = length(bubble4) * scaleFac;

    float compiler = min(min(dist, dist1), min(dist2, dist3));

    vec2 dir = normalize(bubble1 - uMouse / 2.0);

    float step = .8;

    vec2 c = dir * (1. - smoothstep(0.4, step + .1, compiler));

    vec2 newUv = uv - (c);

    float mask = smoothstep(step, step, compiler);

    float inversion = smoothstep(.01, 1., compiler);
    inversion = fract(smoothstep(1.01, .6, compiler));

    // vec4 color = texture2D(uText, uv - (inversion - .3));

    newUv = newUv * (snoise(newUv * 1.5 + uTime * .1) * .1 + .9);
    vec4 color = texture2D(uText, newUv);

    mask *= smoothstep(0.5, 1., 1. - color.r);
    // mask = 1.;

    gl_FragColor = vec4(.2, 0.3, 0.2, 1.0);
    gl_FragColor = vec4(vec3(dist), 1.);
    gl_FragColor = vec4(color.rgb + vec3(0., 0., 1.), 1.);
    gl_FragColor = vec4(inversion, 1., 1., 1.);
    gl_FragColor = noisColor;
    gl_FragColor = color;
    gl_FragColor = vec4(c, 1., 1.0);
    gl_FragColor = vec4(compiler, 0., 0., 1.);
    gl_FragColor = vec4(color.rgb + vec3(0., 0., 1.), mask);
}