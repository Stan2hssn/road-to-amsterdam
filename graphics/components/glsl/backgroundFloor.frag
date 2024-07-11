uniform float uTime;

uniform vec2 uResolution;

uniform sampler2D tNoise;
uniform sampler2D tWater;
uniform sampler2D tHdri;
uniform sampler2D tHdri2;

uniform sampler2D uTexture;
uniform sampler2D uReflect;

uniform vec3 uPrimary;
uniform vec3 uSecondary;
uniform vec3 uThirdary;
uniform vec3 uFourthary;

uniform vec3 uBackground;

varying vec2 vUv;
varying vec3 pos;

const mat2 mtx = mat2(0.80, 0.60, -0.60, 0.80);

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

float fbm(vec2 p, float t) {
    float f = 0.0;

    f += 0.500000 * noise(p + t);
    p = mtx * p * 1.02;
    f += 0.031250 * noise(p);
    p = mtx * p * 1.01;
    f += 0.250000 * noise(p);
    p = mtx * p * 1.03;
    f += 0.125000 * noise(p);
    p = mtx * p * 1.01;
    f += 0.062500 * noise(p);
    p = mtx * p * 1.04;
    f += 0.015625 * noise(p + sin(t));

    return f / 0.96875;
}

float pattern(in vec2 p) {
    return fbm(p + fbm(p + fbm(p, uTime), uTime), uTime);
}

vec4 mod289(vec4 x) {
    return x - floor(x / 289.0) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289((x * 34.0 + 1.0) * x);
}

vec4 caustics(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);

    // First corner
    vec3 i = floor(v + dot(v, vec3(C.y)));
    vec3 x0 = v - i + dot(i, vec3(C.x));

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.x;
    vec3 x2 = x0 - i2 + C.y;
    vec3 x3 = x0 - 0.5;

    // Permutations
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    vec4 j = p - 49.0 * floor(p / 49.0);  // mod(p,7*7)

    vec4 x_ = floor(j / 7.0);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = (x_ * 2.0 + 0.5) / 7.0 - 1.0;
    vec4 y = (y_ * 2.0 + 0.5) / 7.0 - 1.0;

    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 g0 = vec3(a0.xy, h.x);
    vec3 g1 = vec3(a0.zw, h.y);
    vec3 g2 = vec3(a1.xy, h.z);
    vec3 g3 = vec3(a1.zw, h.w);

    // Compute noise and gradient at P
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    vec4 m2 = m * m;
    vec4 m3 = m2 * m;
    vec4 m4 = m2 * m2;
    vec3 grad = -6.0 * m3.x * x0 * dot(x0, g0) + m4.x * g0 +
        -6.0 * m3.y * x1 * dot(x1, g1) + m4.y * g1 +
        -6.0 * m3.z * x2 * dot(x2, g2) + m4.z * g2 +
        -6.0 * m3.w * x3 * dot(x3, g3) + m4.w * g3;
    vec4 px = vec4(dot(x0, g0), dot(x1, g1), dot(x2, g2), dot(x3, g3));
    return 42.0 * vec4(grad, dot(m4, px));
}

float water_caustics(vec3 pos) {
    vec4 n = caustics(pos);

    pos -= 0.07 * n.xyz;
    pos *= 1.62;
    n = caustics(pos);

    pos -= 0.07 * n.xyz;
    n = caustics(pos);

    pos -= 0.07 * n.xyz;
    n = caustics(pos);
    return n.w;
}

void main() {
    float time = uTime * .1; // uTime
    vec2 uv = vUv;
    vec2 winUv = gl_FragCoord.xy / uResolution.xy;
    vec2 uvWater = vec2(sin(uv.x), uv.y + (time));

    float ratio = uResolution.x / uResolution.y;
    float direction = step(1., ratio);
    vec2 responsive = vec2(mix(ratio, 1.0, direction), mix(1.0, 1.0 / ratio, direction));

    vec4 noiseTexture = texture2D(tNoise, fract(((vec2(uv.x * 1., uv.y) * 2. - 1.) * 10.) * responsive));

    float l = length((uv - vec2(.5, .55) * vec2(1., .5)));
    float lHigh = length((uv - vec2(.4, 1.) * vec2(0.5, 0.5)));
    float noiseFactor = l * (1.2 + fbm(uv * 200., uTime * 10.));
    float highlight = lHigh * (1.2 + fbm(uv * 200., uTime * 10.));

    vec3 o = vec3(0.0, 0.0, 0.0);
    vec3 w;
    vec3 causticsPos = pos * 7.;

    w.x = mix(water_caustics(causticsPos + o + uTime), water_caustics(causticsPos + o + 1. + uTime), 0.5);
    w.y = mix(water_caustics(causticsPos + o * 2.0 + uTime), water_caustics(causticsPos + o + 1. + uTime), 0.5);
    w.z = mix(water_caustics(causticsPos + o * 3.0 + uTime), water_caustics(causticsPos + o + 1. + uTime), 0.5);

    vec3 caustics = exp(w * 2. - 1.);
    caustics += smoothstep(0.2, 1., caustics.r * .2);

    caustics = mix(uSecondary, uPrimary, caustics.r + caustics.g + caustics.b);

    vec4 reflection = texture2D(uReflect, uv * (uv.x * (2.1 + caustics.r * 0.05) * (.94 + noiseTexture.r * .05)) * (1. + fbm(uv * 100., uTime * 10.) * .1));
    vec4 background = texture2D(uTexture, winUv);
    vec4 hdri = texture2D(tHdri, (winUv - vec2(0.0, 0.5)) * (1. + noiseFactor * 3.));
    vec4 hdri2 = texture2D(tHdri2, (winUv - vec2(0.3, 0.5)) * (1. + noiseFactor * 2.));

    vec3 water = mix(uFourthary, uThirdary, (uv.x * ((2.2 + caustics.r * 0.3) * (.97 + noiseTexture.r * .1) * (1. + fbm(uv * 100., uTime * 10.) * .2))));

    vec4 finalColor = mix(background, vec4(water, 1.), 1.);
    finalColor = vec4(mix(finalColor.rgb, reflection.rgb, reflection.r), 1.);
    finalColor.rgb += noiseTexture.rgb * 0.02;

    vec3 grade = mix(finalColor.rgb, water.rgb, smoothstep(0.35, .351, noiseFactor));
    grade = mix(grade, background.rgb, smoothstep(0.6, .601, noiseFactor));
    grade += (smoothstep(0.49, .50, highlight) - smoothstep(0.51, .51, highlight)) * .3;

    LinearTosRGB(finalColor);
    LinearTosRGB(background);

    gl_FragColor = vec4(finalColor.rgb, 1.0);
    gl_FragColor = vec4(mix(caustics, reflection.rgb, reflection.r), 1.);
    gl_FragColor = hdri2;
    gl_FragColor = reflection;
    gl_FragColor = vec4(vec3(l), 1.);
    gl_FragColor = vec4(grade, 1.);
}