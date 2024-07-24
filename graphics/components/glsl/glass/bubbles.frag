uniform float uTime;

uniform vec2 uResolution;

uniform sampler2D uTransmission;

varying vec2 vUv;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 inUv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);

    float l = length(inUv - vec2(.5));
    l = smoothstep(.45, .45, l);

    vec4 color = texture2D(uTransmission, uv);
    color = vec4(1., 1., 1., 1.);

    if(l > .5) {
        discard;
    }

    gl_FragColor = vec4(inUv, 1., 1.);
    gl_FragColor = vec4(vec3(l), 1.0);
    gl_FragColor = color;
}