uniform float uTime;
uniform vec2 winResolution;
uniform sampler2D uTexture;
uniform sampler2D normalTexture;
uniform sampler2D gainTexture;
uniform sampler2D magTexture;
uniform vec3 uIor;
uniform sampler2D noiseTexture;
uniform sampler2D noiseCache;
uniform sampler2D frostedTexture;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec2 vUv;

void main() {
    vec3 ior = uIor;

    vec2 uv = gl_FragCoord.xy / winResolution.xy;
    vec2 uvMap = vUv;

    vec2 uvNoise = texture2D(noiseCache, uvMap).xy;

    vec3 normalBump = texture2D(normalTexture, uvMap).xyz;
    vec3 gain = texture2D(gainTexture, uvMap).xyz;
    vec3 mag = texture2D(magTexture, uvMap).xyz;
    vec3 noise = texture2D(noiseTexture, uvMap * uvNoise).xyz;
    // noise = texture2D(noiseTexture, uvMap).xyz;
    vec3 frosted = texture2D(frostedTexture, uvMap).xyz;

    vec3 normalGrain = (frosted * 1. - noise);

    vec3 normal = (worldNormal) * normalGrain * 3.;

    float iorRatioRed = 1.0 / ior.r;
    float iorRatioGreen = 1.0 / ior.g;
    float iorRatioBlue = 1.0 / ior.b;

    vec4 color = vec4(1.0);

    vec3 refractVecR = refract(eyeVector, normal, iorRatioRed);
    vec3 refractVecG = refract(eyeVector, normal, iorRatioGreen);
    vec3 refractVecB = refract(eyeVector, normal, iorRatioBlue);

    float R = texture2D(uTexture, ((uv * 1.5) * (uvNoise - .3)) + refractVecR.xy).r;
    float G = texture2D(uTexture, ((uv * 1.5) * (uvNoise - .3)) + refractVecG.xy).g;
    float B = texture2D(uTexture, ((uv * 1.5) * (uvNoise - .3)) + refractVecB.xy).b;

    vec3 colorTest = texture2D(uTexture, uv + refractVecR.xy).rgb;

    color.r = mix(R, 1., .5);
    color.g = mix(G, 1., .5);
    color.b = mix(B, 1., .5);

    // gl_FragColor = vec4(gain, 1.);
    gl_FragColor = vec4((refractVecR.rgb), 1.);
    gl_FragColor = vec4(vec3(color.r + .1, color.g + .1, color.b), 1.);
    gl_FragColor = vec4(vec3((uv * 1.4) * (uvNoise - .3), 1.), 1.);
    // gl_FragColor = vec4(vec3(uv, 1.), 1.);
    gl_FragColor = color;
}
