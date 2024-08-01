uniform float uTime;

uniform vec2 uResolution;

uniform sampler2D tTransmission;

varying vec2 vUv;

void main() {
    vec2 winUv = gl_FragCoord.xy / uResolution.xy;

    vec4 transmission = texture2D(tTransmission, winUv);

    // transmission = LinearTosRGB(transmission);

    gl_FragColor = vec4(.2, 0.3, 0.2, 1.0);
    gl_FragColor = vec4(mix(transmission.rgb, vec3(0.), sin(uTime * 0.001)), 1.);
    gl_FragColor = vec4(vec3(winUv, 1.), 1.);
    gl_FragColor = transmission;
}