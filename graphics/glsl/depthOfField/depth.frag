#include <packing>

precision highp float;

uniform sampler2D tDiffuse;
uniform sampler2D tDepth;

uniform float cameraNear;
uniform float cameraFar;

uniform int samples; // Samples on the first ring
uniform int rings;   // Ring count
uniform float maxBlur; // Max blur amount

uniform bool showFocus; // Show focus point for debugging

uniform float focalDepth;  // Focal distance in meters
uniform float focalLength; // Focal length in mm
uniform float fstop;       // F-stop value
uniform bool manualdof;    // Manual depth of field calculation
uniform float ndofstart;   // Near DOF blur start
uniform float ndofdist;    // Near DOF blur falloff distance
uniform float fdofstart;   // Far DOF blur start
uniform float fdofdist;    // Far DOF blur falloff distance
uniform float CoC;         // Circle of confusion size in mm

uniform bool vignetting;   // Use vignetting
uniform bool autofocus;    // Use autofocus
uniform vec2 focus;        // Autofocus point
uniform float threshold;   // Highlight threshold
uniform float gain;        // Highlight gain
uniform float bias;        // Bokeh edge bias
uniform float fringe;      // Bokeh chromatic aberration
uniform bool noise;        // Use noise for dithering
uniform float namount;     // Dither amount
uniform bool depthblur;    // Blur the depth buffer
uniform float dbsize;      // Depth blur size
uniform bool pentagon;     // Use pentagon bokeh shape
uniform float feather;     // Pentagon shape feather

uniform vec2 texel;    // Size of one texel
uniform float width;   // Width of screen
uniform float height;  // Height of screen

varying vec2 vUv;

const float PI = 3.14159265;

float linearize(float depth) {
    return -cameraFar * cameraNear / (depth * (cameraFar - cameraNear) - cameraFar);
}

float penta(vec2 coords) {
    float scale = float(rings) - 1.3;
    vec4 HS0 = vec4(1.0, 0.0, 0.0, 1.0);
    vec4 HS1 = vec4(0.309016994, 0.951056516, 0.0, 1.0);
    vec4 HS2 = vec4(-0.809016994, 0.587785252, 0.0, 1.0);
    vec4 HS3 = vec4(-0.809016994, -0.587785252, 0.0, 1.0);
    vec4 HS4 = vec4(0.309016994, -0.951056516, 0.0, 1.0);
    vec4 HS5 = vec4(0.0, 0.0, 1.0, 1.0);

    vec4 one = vec4(1.0);

    vec4 P = vec4((coords), vec2(scale, scale));

    vec4 dist = vec4(0.0);
    float inorout = -4.0;

    dist.x = dot(P, HS0);
    dist.y = dot(P, HS1);
    dist.z = dot(P, HS2);
    dist.w = dot(P, HS3);

    dist = smoothstep(-feather, feather, dist);

    inorout += dot(dist, one);

    dist.x = dot(P, HS4);
    dist.y = HS5.w - abs(P.z);

    dist = smoothstep(-feather, feather, dist);
    inorout += dist.x;

    return clamp(inorout, 0.0, 1.0);
}

vec3 color(vec2 coords, float blur) {
    vec3 col = vec3(0.0);

    col.r = texture2D(tDiffuse, coords + vec2(0.0, 1.0) * texel * fringe * blur).r;
    col.g = texture2D(tDiffuse, coords + vec2(-0.866, -0.5) * texel * fringe * blur).g;
    col.b = texture2D(tDiffuse, coords + vec2(0.866, -0.5) * texel * fringe * blur).b;

    vec3 lumcoeff = vec3(0.299, 0.587, 0.114);
    float lum = dot(col.rgb, lumcoeff);
    float thresh = max((lum - threshold) * gain, 0.0);
    return col + mix(vec3(0.0), col, thresh * blur);
}

vec2 rand(vec2 coord) {
    float noiseX = ((fract(1.0 - coord.s * (width / 2.0)) * 0.25) + (fract(coord.t * (height / 2.0)) * 0.75)) * 2.0 - 1.0;
    float noiseY = ((fract(1.0 - coord.s * (width / 2.0)) * 0.75) + (fract(coord.t * (height / 2.0)) * 0.25)) * 2.0 - 1.0;

    if(noise) {
        noiseX = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;
        noiseY = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233) * 2.0)) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;
    }
    return vec2(noiseX, noiseY);
}

void main() {
    float depth = linearize(texture2D(tDepth, vUv).x);
    vec4 basicTexel = texture2D(tDiffuse, vUv);

    float fDepth = 50.0; // Focal distance up to 50 units
    float blur = 0.0;

    if(depth > fDepth) {
        blur = (depth - fDepth) / (cameraFar - fDepth);
    }

    blur = clamp(blur, 0.0, maxBlur);

    vec3 col = vec3(0.0);
    if(blur < 0.05) {
        col = texture2D(tDiffuse, vUv).rgb;
    } else {
        float s = 1.0;
        int ringsamples;
        for(int i = 1; i <= rings; i++) {
            ringsamples = i * samples;
            for(int j = 0; j < ringsamples; j++) {
                float step = PI * 2.0 / float(ringsamples);
                float pw = cos(float(j) * step) * float(i);
                float ph = sin(float(j) * step) * float(i);
                float p = pentagon ? penta(vec2(pw, ph)) : 1.0;
                col += color(vUv + vec2(pw, ph) * blur * texel, blur) * mix(1.0, float(i) / float(rings), bias) * p;
                s += mix(1.0, float(i) / float(rings), bias) * p;
            }
        }
        col /= s;
    }

    if(showFocus) {
        float edge = 0.002 * depth;
        float m = clamp(smoothstep(0.0, edge, blur), 0.0, 1.0);
        float e = clamp(smoothstep(1.0 - edge, 1.0, blur), 0.0, 1.0);

        col = mix(col, vec3(1.0, 0.5, 0.0), (1.0 - m) * 0.6);
        col = mix(col, vec3(0.0, 0.5, 1.0), ((1.0 - e) - (1.0 - m)) * 0.2);
    }

    basicTexel = LinearTosRGB(basicTexel);

    gl_FragColor = vec4(col, 1.0);
    gl_FragColor = basicTexel * smoothstep(1., 0., length(vUv - .5));
}
