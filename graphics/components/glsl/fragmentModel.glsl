uniform float uTime;
uniform sampler2D uTexture;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    vec4 texture = texture2D(uTexture, uv);

    texture.rgb *= 3.0;

    gl_FragColor = vec4(uv.x, uv.y, 0., 1.0);
    gl_FragColor = texture;
}