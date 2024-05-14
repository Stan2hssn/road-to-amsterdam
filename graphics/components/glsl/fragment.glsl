uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uRender;
uniform sampler2D uGain;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    float AR = uResolution.y / uResolution.x;

    float dist = length(uv - 0.5);
    if(dist > .5)
        discard;
    float r = 0.49;

    float g_out = pow(dist / r, 110.);
    float mag_out = .5 - cos(g_out - 1.);

    vec2 uv_out = dist < r ? uv + mag_out * (uv - .5) : uv;

    float g_in = pow(dist / r, -10.);
    vec2 g_in_power = vec2(sin(uv.x - .5), sin(uv.y - .5));

    float mag_in = .5 - cos(g_in - 1.);
    vec2 uv_in = dist > r ? uv : (uv - .5) * mag_in * g_in_power;

    vec4 gain = texture2D(uGain, uv);

    vec2 uv_display = uv + uv_out * .1 + uv_in * .1 + (gain.xy - .5) * .1;
    uv_display.x -= .05;

    vec4 c = texture2D(uRender, uv_display);

    gl_FragColor = gain;

    gl_FragColor = vec4(uv.x, uv.y, 0., 1.0);
    gl_FragColor = vec4(uv_out, 0., 1.0);
    gl_FragColor = c;
}