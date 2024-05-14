uniform float uTime;
uniform sampler2D tDiffuse;
varying vec2 vUv;

#define DISTORTION_AMOUNT 1.

vec2 PincushionDistortion(in vec2 uv, float strength) {
    vec2 st = uv - 0.5;
    float uvA = atan(st.x, st.y);
    float uvD = dot(st, st);
    return 0.5 + vec2(sin(uvA), cos(uvA)) * sqrt(uvD) * (1.0 - strength * uvD);
}

vec3 ChromaticAbberation(sampler2D tex, in vec2 uv) {
    float rChannel = texture2D(tex, PincushionDistortion(uv, 0.3 * DISTORTION_AMOUNT)).r;
    float gChannel = texture2D(tex, PincushionDistortion(uv, 0.15 * DISTORTION_AMOUNT)).g;
    float bChannel = texture2D(tex, PincushionDistortion(uv, 0.075 * DISTORTION_AMOUNT)).b;
    vec3 retColor = vec3(rChannel, gChannel, bChannel);
    return retColor;
}

void main() {
    vec2 uv = vUv;

    vec3 finalColor = ChromaticAbberation(tDiffuse, uv);

    gl_FragColor = vec4(finalColor, 1.);
}