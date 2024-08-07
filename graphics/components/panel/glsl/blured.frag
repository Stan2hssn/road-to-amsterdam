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

    vec4 color = texture2D(tTransmission, winUv);

    vec4 finalColor = mix(vec4(vec3(0.9608, 0.7569, 0.2), 1.), color, smoothstep(.3, .5, dist));

    // finalColor = LinearTosRGB(finalColor);

    gl_FragColor = finalColor;
    gl_FragColor = vec4(0.3, 0.26, 0.2, 1.0);
}