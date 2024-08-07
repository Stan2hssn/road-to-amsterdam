uniform vec2 uResolution;

uniform sampler2D tTransmission;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    vec2 winUv = gl_FragCoord.xy / uResolution.xy;

    float dist = length(uv - vec2(0.5));

    if(dist > 0.5) {
        discard;
    }
    float r = 0.47;

    float g_out = pow(dist / r, 110.);
    float mag_out = .5 - cos(g_out - .1);

    vec2 uv_out = dist > r ? winUv + mag_out * (winUv - .1) : winUv;

    vec4 color = texture2D(tTransmission, uv_out);

    // color = LinearTosRGB(color);

    gl_FragColor = vec4(vec3(winUv + mag_out * (winUv - .1), 1.), 1.);
    gl_FragColor = color;
    gl_FragColor = vec4(0.71, 0.95, 0.71, 1.0);
}