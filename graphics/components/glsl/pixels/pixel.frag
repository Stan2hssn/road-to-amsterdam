uniform float uBoolean;

uniform vec2 uResolution;

uniform sampler2D uTexture;

varying vec2 vUv;

void main() {
    vec2 st = vUv;
    vec2 uv = (gl_FragCoord.xy / uResolution.xy);

    vec3 borderColor = vec3(0.137, 0.416, 0.533);

    vec4 color = texture2D(uTexture, uv);

    float limit = mix(0., 0.002, uBoolean);
    float border = 1. - step(1. - limit, st.y);

    color = sRGBTransferOETF(color);

    color.rgb = mix(borderColor, color.rgb, border);

    gl_FragColor = vec4(0.3, 0.26, 0.2, 1.0);
    gl_FragColor = vec4(st, 1., 1.);
    gl_FragColor = vec4(vec3(uBoolean), 1.);
    gl_FragColor = color;
}