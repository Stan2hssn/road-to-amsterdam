uniform float uTime;

uniform vec2 uResolution;

uniform sampler2D tLogo;

varying vec4 vTexCoords;

float sdSquare(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdSegment(in vec2 p, in vec2 a, in vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float aspect = uResolution.x / uResolution.y;
    float invAspect = uResolution.y / uResolution.x;
    vec2 texelUv = (vTexCoords.xy / vTexCoords.w) * 0.5 + 0.5;
    vec4 tDiffuse = texture2D(tLogo, texelUv - vec2(0., 0.3));

    vec3 gradient = mix(vec3(0., 0., .0), vec3(0., 0., .2), uv.y);
    vec3 color = gradient;
    color += vec3(1.) * smoothstep(0., 1., tDiffuse.a);

    vec2 p = vec2(.5, -.1 - (invAspect - 1.) * .5);
    float segmentLength = .05;
    float segmentOffset = .05;

    float rS = sdSegment(texelUv, p + vec2(segmentOffset, 0.), p + vec2(segmentOffset + segmentLength, 0.));
    float lS = sdSegment(texelUv, p - vec2(segmentOffset * 2., 0.), p - vec2(segmentOffset * 2. - segmentLength, 0.));
    rS = smoothstep(.001, .002, rS);
    lS = smoothstep(.001, .002, lS);

    float c = sdCircle(texelUv - vec2(.5, -.1 - (invAspect - 1.) * .5), .02);
    c = smoothstep(.0, .002, c) - smoothstep(.0, .002, c - .002);
    c = 1. - c;

    float cta = lS * rS * c;
    color += 1. - cta;

    gl_FragColor = vec4(0., 0., 1., 1.0);
    gl_FragColor = vec4(texelUv, 1., 1.0);
    // gl_FragColor = vec4(vec3(1.) * smoothstep(0., 1., color.a), 1.);
    gl_FragColor = vec4(vec3(cta), 1.);
    gl_FragColor = vec4(color, 1.);
}