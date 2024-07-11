uniform float uTime;
uniform float uGlobalIor;

uniform vec2 winResolution;

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

void main() {

    float time = uTime * .1;
    vec2 uv = gl_FragCoord.xy / winResolution.xy;
    vec2 uvMap = vUv;

    vec3 normalBump = texture2D(normalTexture, fract(vec2(uvMap.x, uvMap.y * .3 + time) * 10.)).xyz;
    vec3 water = texture2D(tWater, fract(uvMap * 2. + uTime)).xyz;
    vec3 noise = texture2D(noiseTexture, uvMap).xyz;
    vec3 noiseColor = texture2D(noiseColor, fract(uvMap * 10.)).xyz;

    vec3 normalGrain = normalBump * (noise * 10.) * water;

    float smoothBlur = (noise.r * smoothstep(1., -.5, length(vec2(uv.x, uv.y * .6 + .2) - .5) * 1.));

    vec3 normal = worldNormal * normalGrain;

    vec3 ior = uIor * uGlobalIor;

    float iorRatioRed = 1. / ior.r;
    float iorRatioGreen = 1. / ior.g;
    float iorRatioBlue = 1. / ior.b;

    vec4 color = vec4(1.0);

    vec3 refractVecR = refract(eyeVector * .9, (normal), iorRatioRed);
    vec3 refractVecG = refract(eyeVector * .9, (normal), iorRatioGreen);
    vec3 refractVecB = refract(eyeVector * .9, (normal), iorRatioBlue);

    vec2 newUv = (vec2(uv.x * .4 + .3, uv.y * .3 + .35));

    float R = texture2D(uTexture, newUv + refractVecR.xy).r;
    float G = texture2D(uTexture, newUv + refractVecG.xy).g;
    float B = texture2D(uTexture, newUv + refractVecB.xy).b;

    vec4 colorTest = texture2D(uTexture, uv * .6 + .2);

    vec3 colorRGB = uColor;
    vec3 backroundColor = uBagroundColor;

    vec3 noiseC = noiseColor * 1.;
    vec4 blur = texture2D(uTexture, uv * .75 + .12);

    color.r = mix(R, colorRGB.r, 2.);
    color.g = mix(G, colorRGB.g, 2.);
    color.b = mix(B, colorRGB.b, 2.);

    vec4 test = LinearTosRGB(colorTest);
    color = LinearTosRGB(color);

    vec3 finalColor = mix(color.rgb, backroundColor + .1, 1. - uv.y * (noise * 2.));

    gl_FragColor = vec4(finalColor, 1.);
    gl_FragColor = LinearTosRGB(vec4(mix(colorRGB, backroundColor, 0.2) / smoothstep(0., .5, normal.b + normal.r), 1.));
    gl_FragColor = vec4(vec3(R, G, B), 1.);
    gl_FragColor = colorTest;
    gl_FragColor = vec4(normal, 1.);
    gl_FragColor = color;
    gl_FragColor = LinearTosRGB(vec4(finalColor, 1.));
}
