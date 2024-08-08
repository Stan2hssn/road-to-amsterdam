uniform vec2 uResolution;

uniform sampler2D uTexture;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    vec4 color = texture2D(uTexture, uv);

    color = sRGBTransferOETF(color);

    gl_FragColor = vec4(0.3, 0.26, 0.2, 1.0);
    gl_FragColor = color;
}