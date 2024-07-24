uniform float uTime;
uniform float uGlobalIor;
uniform float uTransmissivity;

uniform vec2 uResolution;

uniform sampler2D tNoise;
uniform sampler2D uTransmission;

varying vec2 vUv;

uniform vec3 uGrey;
uniform vec3 uIor;

varying vec3 vNormal;

vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
    vec4 color = vec4(0.0);
    vec2 off1 = vec2(1.411764705882353) * direction;
    vec2 off2 = vec2(3.2941176470588234) * direction;
    vec2 off3 = vec2(5.176470588235294) * direction;
    color += texture2D(image, uv) * 0.1964825501511404;
    color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
    color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
    color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
    color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
    color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
    color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
    return color;
}

void main() {
    vec2 uv = vUv;
    vec2 winUv = gl_FragCoord.xy / uResolution.xy;

    vec4 glass = texture2D(tNoise, fract(uv * 2.));

    float gray = dot(vNormal * vNormal, uGrey);
    vec3 GreyNormal = vec3(sqrt(gray) * 2.);

    vec4 transmission = texture2D(uTransmission, (winUv));

    float transmissionR = blur13(uTransmission, winUv * (1. + glass.rg * .1 * (uTransmissivity - uTransmissivity)) - uIor.r * 1.5, uResolution.xy, vec2(1. * uTransmissivity)).r;
    float transmissionG = blur13(uTransmission, winUv * (1. + glass.rg * .1 * (uTransmissivity - uTransmissivity)) - uIor.g * 1.5, uResolution.xy, vec2(1. * uTransmissivity)).g;
    float transmissionB = blur13(uTransmission, winUv * (1. + glass.rg * .1 * (uTransmissivity - uTransmissivity)) - uIor.b * 1.5, uResolution.xy, vec2(1. * uTransmissivity)).b;

    transmission.rgb = vec3(transmissionR, transmissionG, transmissionB);

    transmission.rgb = mix(transmission.rgb, vec3(1.), .5 * uTransmissivity);
    transmission.rgb += GreyNormal * .5;

    gl_FragColor = vec4(winUv, 1., 1.0);
    gl_FragColor = glass;
    gl_FragColor = vec4(GreyNormal, 1.);
    gl_FragColor = transmission;
}