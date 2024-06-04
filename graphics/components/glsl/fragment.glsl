uniform float uTime;
uniform vec2 winResolution;
uniform sampler2D uTexture;
uniform sampler2D normalTexture;
uniform sampler2D gainTexture;
uniform sampler2D magTexture;
uniform vec3 uIor;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec2 vUv;

void main() {
    vec3 ior = uIor;

    vec2 uv = gl_FragCoord.xy / winResolution.xy;
    vec2 uvMap = vUv;

    vec3 normalBump = texture2D(normalTexture, uvMap).xyz;
    vec3 gain = texture2D(gainTexture, uvMap).xyz;
    vec3 mag = texture2D(magTexture, uvMap).xyz;

    vec3 normal = (worldNormal) * ((gain * 2.0 - 1.0 / 2.) + (normalBump * .5));

    float iorRatioRed = 1.0 / ior.r;
    float iorRatioGreen = 1.0 / ior.g;
    float iorRatioBlue = 1.0 / ior.b;

    vec4 color = vec4(1.0);

    vec3 refractVecR = refract(eyeVector, normal, iorRatioRed);
    vec3 refractVecG = refract(eyeVector, normal, iorRatioGreen);
    vec3 refractVecB = refract(eyeVector, normal, iorRatioBlue);

    float R = texture2D(uTexture, uv + refractVecR.xy).r;
    float G = texture2D(uTexture, uv + refractVecG.xy).g;
    float B = texture2D(uTexture, uv + refractVecB.xy).b;

    vec3 colorTest = texture2D(uTexture, uv + refractVecR.xy).rgb;

    color.r = R;
    color.g = G;
    color.b = B;

    // gl_FragColor = vec4(gain, 1.);
    gl_FragColor = vec4(vec3(uvMap, 1.), 1.);
    gl_FragColor = vec4((refractVecR.rgb), 1.);
    gl_FragColor = vec4(vec3(color.r, 1., 1.), 1.);
    gl_FragColor = color;
}
