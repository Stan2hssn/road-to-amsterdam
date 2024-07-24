uniform float uTime;
uniform float uGlobalIor;

uniform vec2 uResolution;

uniform sampler2D tNoise;

uniform sampler2D uTexture;
uniform sampler2D uReflect;

uniform vec3 uIor;
uniform vec3 uPrimary;
uniform vec3 uSecondary;
uniform vec3 uThirdary;
uniform vec3 uFourthary;

uniform vec3 uBackground;

varying vec2 vUv;

#define PI 3.14159265359

float rand(vec2 c) {
    return fract(sin(dot(c.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p, float freq) {
    float unit = 1. / freq;
    vec2 ij = floor(p / unit);
    vec2 xy = mod(p, unit) / unit;
	//xy = 3.*xy*xy-2.*xy*xy*xy;
    xy = .5 * (1. - cos(PI * xy));
    float a = rand((ij + vec2(0., 0.)));
    float b = rand((ij + vec2(1., 0.)));
    float c = rand((ij + vec2(0., 1.)));
    float d = rand((ij + vec2(1., 1.)));
    float x1 = mix(a, b, xy.x);
    float x2 = mix(c, d, xy.x);
    return mix(x1, x2, xy.y);
}

float pNoise(vec2 p, int res) {
    float persistance = .5;
    float n = 0.;
    float normK = 0.;
    float f = 4.;
    float amp = 1.;
    int iCount = 0;
    for(int i = 0; i < 50; i++) {
        n += amp * noise(p, f);
        f *= 2.;
        normK += amp;
        amp *= persistance;
        if(iCount == res)
            break;
        iCount++;
    }
    float nf = n / normK;
    return nf * nf * nf * nf;
}

float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) *
        43758.5453123);
}

float fbmNoise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
        (c - a) * u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

#define OCTAVES 8
float fbm(in vec2 st) {
    // Initial values
    float value = 1.0;
    float amplitude = .5;
    float frequency = 2.;
    //
    // Loop of octaves
    for(int i = 0; i < OCTAVES; i++) {
        value += amplitude * fbmNoise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

void main() {
    float time = uTime * .1; // uTime
    vec2 uv = vUv;
    vec2 winUv = gl_FragCoord.xy / uResolution.xy;
    vec2 uvWater = vec2(sin(uv.x), uv.y + (time));

    float ratio = uResolution.x / uResolution.y;
    float direction = step(1., ratio);
    vec2 responsive = vec2(mix(ratio, 1.0, direction), mix(1.0, 1.0 / ratio, direction));

    vec4 noiseTexture = texture2D(tNoise, fract(uv * vec2(.5, 1.) * 3. * (1. + fbm(uv + time) * .35)));

    vec4 reflection = texture2D(uReflect, winUv * (.3 + noiseTexture.rg));
    // reflection = texture2D(uReflect, winUv);

    reflection = LinearTosRGB(reflection);

    gl_FragColor = noiseTexture;
    gl_FragColor = vec4(vec3(winUv, 1.), 1.);
    gl_FragColor = reflection;
}