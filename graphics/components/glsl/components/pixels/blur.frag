precision highp float;
        #include <packing>

uniform float uTime;
uniform float cameraNear;
uniform float cameraFar;
uniform float uIntensity;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec3 vPos;

uniform sampler2D uInfoTexture;
uniform sampler2D uTexture;
uniform sampler2D tNoise;

#define uBlurStrength 1.;

#include ../../helpers/tvNoise.glsl;

float readDepth(sampler2D uInfoTexture, vec2 coord) {
    float fragCoordZ = texture2D(uInfoTexture, coord).x;
    float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
    return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
}

vec3 draw(sampler2D image, vec2 uv) {
    return texture2D(image, vec2(uv.x, uv.y)).rgb;
}
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}
vec3 blur(vec2 uv, sampler2D image, float blurAmount) {
    vec3 blurredImage = vec3(0.);

    vec2 q1 = vec2(cos(degrees(0.)), sin(degrees(0.))) * (rand(vec2(0., uv.x + uv.y)) + blurAmount);
    vec2 uv2_1 = uv + (q1 * blurAmount);
    blurredImage += draw(image, uv2_1) / 2.;

    vec2 q2 = vec2(cos(degrees(360. / 2.)), sin(degrees(360. / 2.))) * (rand(vec2(2., uv.x + uv.y + 24.)) + blurAmount);
    vec2 uv2_2 = uv + (q2 * blurAmount);
    blurredImage += draw(image, uv2_2) / 2.;
    return blurredImage;
}

vec3 blur2(vec2 mUv, sampler2D image, float blurAmount, vec2 responsive, vec2 winUv) {
    vec3 blurredImage = vec3(0.);
    float t = uTime + 120.;

    float ta = t * 0.654321;
    float tb = t * (ta * 0.123456);
    vec4 noise = vec4(vec3(1. - tvNoise(mUv, ta, tb)), 1.);
    float depth = readDepth(uInfoTexture, winUv);
    float gradient = smoothstep(-0.2, 1., blur(winUv, uInfoTexture, .005).r - .2 - step(.3, length(vec2(mUv.x * .9, (mUv.y * 1.5 - .1) * responsive.x - .1))));
    gradient -= noise.r * .1;

    // gradient = 1.;

    #define repeats 20.
    for(float i = 0.; i < repeats; i++) {
        vec2 q = vec2(cos(degrees((i / repeats) * 360.)), sin(degrees((i / repeats) * 360.))) * (rand(vec2(i, winUv.x + winUv.y)) + blurAmount);
        vec2 uv2 = winUv + (q * blurAmount * gradient);
        blurredImage += draw(image, uv2) / 2.;
        q = vec2(cos(degrees((i / repeats) * 360.)), sin(degrees((i / repeats) * 360.))) * (rand(vec2(i + 2., winUv.x + winUv.y + 24.)) + blurAmount);
        uv2 = winUv + (q * blurAmount * gradient);
        blurredImage += draw(image, uv2) / 2.;
    }
    return blurredImage / repeats;
}

void main() {
    float t = uTime + 120.;
    vec2 uv = vUv;
    uv -= 0.5;

    float ratio = uResolution.x / uResolution.y;

    float direction = step(1., ratio);

    vec2 responsive = vec2(mix(ratio, 1.0, direction), mix(1.0, 1.0 / ratio, direction));

    vec2 winUv = gl_FragCoord.xy / uResolution.xy;
    float depth = readDepth(uInfoTexture, winUv);
    vec2 mUv = (uv - vec2(uMouse.x * .5, uMouse.y * .505)) * responsive;

    float ta = t * 0.654321;
    float tb = t * (ta * 0.123456);
    vec4 noise = vec4(vec3(1. - tvNoise(winUv, ta, tb)), 1.);

    vec2 corrected_mouse = uMouse * responsive;

    float gradient = smoothstep(-0.2, 1., blur(winUv, uInfoTexture, .005).r - .2 - step(.2, length(vec2(mUv.x, mUv.y * 2. - .1))));

    vec4 tGlass = texture2D(tNoise, fract((winUv * 1.5) * responsive) + noise.rg * .005);
    winUv -= vec2(uMouse.x * .5, uMouse.y * .505);

    vec4 color = vec4(0.);
    vec4 cache = texture2D(uTexture, winUv);

    if(uIntensity > 0.1) {
        color = vec4(blur2(mUv, uTexture, .06, responsive, winUv - (tGlass.rg * .1) + .05), 1.);
        tGlass = mix(vec4(vec3(0.), 1.), tGlass, smoothstep(.3, .0, length(vec2(mUv.x, (mUv.y * 2. - .1) * responsive.x))));
        color.rgb -= tGlass.rgb * .05;
    // color -= noise * .01;  
    }

    gl_FragColor = vec4(winUv, 1., 1.);
    gl_FragColor = vec4(vec3(gradient), 1.);
    gl_FragColor = color;
    gl_FragColor = vec4(step(.3, length(vec2(mUv.x, (mUv.y * 2. - .1) * responsive.x))), 1., 1., 1.);
    gl_FragColor = tGlass;
    gl_FragColor = mix(cache, color, uIntensity);
}