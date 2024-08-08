uniform float uShift;

uniform vec2 uResolution;

uniform sampler2D uTexture;
uniform sampler2D noiseTexture;
uniform sampler2D frostedGlass;

vec3 hash3(vec2 p) {
    vec3 q = vec3(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)), dot(p, vec2(419.2, 371.9)));
    return fract(sin(q) * 43758.5453);
}

float iqnoise(in vec2 x, float u, float v) {
    vec2 p = floor(x);
    vec2 f = fract(x);

    float k = 1.0 + 63.0 * pow(1.0 - v, 4.0);

    float va = 0.0;
    float wt = 0.0;
    for(int j = -2; j <= 2; j++) for(int i = -2; i <= 2; i++) {
            vec2 g = vec2(float(i), float(j));
            vec3 o = hash3(p + g) * vec3(u, u, 1.0);
            vec2 r = g - f + o.xy;
            float d = dot(r, r);
            float ww = pow(1.0 - smoothstep(0.0, 1.414, sqrt(d)), k);
            va += o.z * ww;
            wt += ww;
        }

    return va / wt;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    float ratio = uResolution.x / uResolution.y;
    float direction = step(1., ratio);
    vec2 responsive = vec2(mix(ratio, 1.0, direction), mix(1.0, 1.0 / ratio, direction));

    vec4 noiseTexture = texture2D(noiseTexture, uv * responsive);
    vec4 frostedGlass = texture2D(frostedGlass, fract((uv * 2. + vec2(0., uShift * .002)) * responsive));
    // frostedGlass.rgb = vec3(pow(iqnoise(24. * uv * responsive, 1., .2), 1.));

    vec2 noise = (noiseTexture.rg * .1) + pow(frostedGlass.r, 4.) * .3;

    vec4 color = texture2D(uTexture, uv + noise - .08);
    color.rgb -= pow(frostedGlass.r * .5 + noiseTexture.r * .1, 2.);

    gl_FragColor = vec4(0.3, 0.26, 0.2, 1.0);
    gl_FragColor = vec4(vec3(noise, 1.), 1.);
    gl_FragColor = frostedGlass;
    gl_FragColor = color;
}