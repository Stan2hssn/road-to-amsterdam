uniform float uTime;
uniform float uGlobalIor;
uniform float uTransmissivity;

uniform vec2 uResolution;

uniform sampler2D tNoise;
uniform sampler2D uTransmission;

varying vec2 vUv;

uniform vec3 uGrey;

varying vec3 vNormal;

void main() {
    vec2 uv = vUv;
    vec2 winUv = gl_FragCoord.xy / uResolution.xy;

    vec4 glass = texture2D(tNoise, fract(uv));

    float gray = dot(vNormal * vNormal, uGrey);
    vec3 GreyNormal = vec3(sqrt(gray) * 2.);

    vec4 transmission = texture2D(uTransmission, (winUv) * (glass.rg * uTransmissivity));
    transmission.rgb += GreyNormal * .8;

    gl_FragColor = vec4(winUv, 1., 1.0);
    gl_FragColor = glass;
    gl_FragColor = vec4(GreyNormal, 1.);
    gl_FragColor = transmission;
}