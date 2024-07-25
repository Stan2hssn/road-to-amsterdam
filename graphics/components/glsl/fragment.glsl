uniform float uTime;
uniform float uGlobalIor;
uniform float uTransmission;

uniform float uShininess;
uniform float uDiffuseness;
uniform vec3 uLight;

uniform vec2 uResolution;

uniform vec3 uIor;
uniform vec3 uColor;
uniform vec3 uBagroundColor;

uniform sampler2D uTexture;
uniform sampler2D normalTexture;
uniform sampler2D noiseTexture;
uniform sampler2D tWater;
uniform sampler2D frostedTexture;
uniform sampler2D noiseColor;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec2 vUv;
varying vec3 pos;

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

float specular(vec3 light, float shiniess, float diffuseness) {
    vec3 normal = worldNormal;
    vec3 lightVector = normalize(-light);
    vec3 halfVector = normalize(lightVector + eyeVector);

    float NdotL = max(dot(normal, lightVector), 0.0);
    float NdotH = max(dot(normal, halfVector), 0.0);
    float NdotH2 = NdotH * NdotH;

    float kDiffuse = max(0.0, NdotL);
    float kSpecular = pow(NdotH2, shiniess);

    return kDiffuse * diffuseness + kSpecular;
}

void main() {
    float time = uTime * .1;
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 uvMap = vUv;

    float ratio = uResolution.x / uResolution.y;
    float direction = step(1., ratio);
    vec2 responsive = vec2(mix(ratio, 1.0, direction), mix(1.0, 1.0 / ratio, direction));

    vec3 water = texture2D(tWater, fract(uvMap * 2. + time)).xyz;
    vec3 noise = texture2D(noiseTexture, uvMap).xyz;
    vec3 noiseColor = texture2D(noiseColor, fract(uvMap * 2. + time)).xyz;

    float normalGrain = fbm(uvMap * 2. + time);

    float smoothBlur = (noise.r * smoothstep(1., -.5, length(vec2(uv.x, uv.y * .6 + .2) - .5) * 1.));

    vec3 normal = worldNormal * noiseColor;
    normal = worldNormal * normalGrain;

    vec3 ior = uIor * uGlobalIor;

    float iorRatioRed = 1. / ior.r;
    float iorRatioGreen = 1. / ior.g;
    float iorRatioBlue = 1. / ior.b;

    vec4 color = vec4(1.0);
    float specularLight = specular(uLight, uShininess, uDiffuseness);

    vec3 refractVecR = refract(eyeVector * uTransmission, (normal), iorRatioRed);
    vec3 refractVecG = refract(eyeVector * uTransmission, (normal), iorRatioGreen);
    vec3 refractVecB = refract(eyeVector * uTransmission, (normal), iorRatioBlue);

    float R = texture2D(uTexture, uv + refractVecR.rg * .01).r;
    float G = texture2D(uTexture, uv + refractVecG.rg * .01).g;
    float B = texture2D(uTexture, uv + refractVecB.rg * .01).b;

    vec4 colorTest = texture2D(uTexture, uv);

    color.rgb = vec3(R + specularLight, G + specularLight, B + specularLight);
    float spot = smoothstep(.5, .6, length(uv));
    // color = LinearTosRGB(color);

    gl_FragColor = vec4(vec3(uv, 1.), 1.);
    gl_FragColor = vec4(vec3(spot), 1.);
    gl_FragColor = colorTest;
    // gl_FragColor = vec4(normalGrain, 1.0);
    gl_FragColor = color;
}
