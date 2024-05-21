uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uRender;
uniform sampler2D uGain;
uniform sampler2D uDirt;

varying vec2 vUv;

#define DISTORTION_AMOUNT 2.

vec2 PincushionDistortion(in vec2 uv, float strength) {
    vec2 st = uv - 0.5;
    float uvA = atan(st.x, st.y);
    float uvD = dot(st, st);
    return 0.5 + vec2(sin(uvA), cos(uvA)) * sqrt(uvD) * (1.0 - strength * uvD);
}

vec3 ChromaticAbberation(sampler2D tex, in vec2 uv) {

    float rChannel = texture2D(tex, PincushionDistortion(uv, 0.1 * DISTORTION_AMOUNT)).r;
    float gChannel = texture2D(tex, PincushionDistortion(uv, 0.11 * DISTORTION_AMOUNT)).g;
    float bChannel = texture2D(tex, PincushionDistortion(uv, 0.12 * DISTORTION_AMOUNT)).b;

    vec3 retColor = vec3(rChannel, gChannel, bChannel);
    return retColor;
}

void main() {
    vec2 uv = vUv;

    float dist = length(uv - 0.5);
    if(dist > .5)
        discard;
    float r = 0.48;

    float g_out = pow(dist / r, 110.);
    float mag_out = .5 - cos(g_out - .1);

    vec2 uv_out = dist < r ? uv + mag_out * (uv - .1) : uv;

    float g_in = pow(dist / r, -10.);
    vec2 g_in_power = vec2(sin(uv.x - .5), sin(uv.y - .5));

    float mag_in = .5 - cos(g_in - 1.);
    vec2 uv_in = dist > r ? uv : (uv - .5) * mag_in * g_in_power;

    vec4 gain = texture2D(uGain, uv);
    vec4 dirt = texture2D(uDirt, uv);

    vec2 uv_display = uv + uv_out * .1 + uv_in * .12 + (gain.xy - .5) * .122 - dirt.xy * .2;
    uv_display.x -= .05;

    vec3 cd = ChromaticAbberation(uRender, uv_display) * 2.;
    vec4 c = texture2D(uRender, uv_display);

    gl_FragColor = gain;

    // gl_FragColor = c;
    // gl_FragColor = vec4(c.rgb + cc, 1.0);
    gl_FragColor = vec4(uv.x, uv.y, 0., 1.0);
    gl_FragColor = vec4(uv_out, 0., 1.0);
    gl_FragColor = texture2D(uRender, uv);
    gl_FragColor = vec4(cd, 1.0);
}