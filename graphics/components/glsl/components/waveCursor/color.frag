precision highp float;

uniform sampler2D tBuffer;
uniform sampler2D tAdvect;
uniform float uTime;
uniform vec2 uSplatCoords;
uniform vec2 uPrevSplatCoords;
uniform vec2 uResolution;
uniform float uSplatRadius;
uniform float uScrollOffset;
uniform float uSizeXFactor;

varying vec2 vUv;

float line(vec2 uv, vec2 point1, vec2 point2) {
    vec2 pa = uv - point1, ba = point2 - point1;
    float aspectRatio = uResolution.x / uResolution.y;
    pa.x *= aspectRatio;
    ba.x *= aspectRatio;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

float cubicIn(float t) {
    return t * t * t;
}

void main() {
    vec2 splatCoords = vec2(1.) - vec2((uSplatCoords.x - 1.0) / -2.0, (uSplatCoords.y - 1.0) / -2.0);

    vec2 prevSplatCoords = vec2(1.) - vec2((uPrevSplatCoords.x - 1.0) / -2.0, (uPrevSplatCoords.y - 1.0) / -2.0);

    vec2 uv = vUv;
    uv.y -= uScrollOffset;

    float ratio = uResolution.x / uResolution.y;
    float direction = step(1., ratio);
    vec2 responsive = vec2(mix(ratio, 1.0, direction), mix(1.0, 1.0 / ratio, direction));

    // uv *= responsive;

    vec2 invResolution = 1.0 / vec2(uResolution);

    // advect
    vec2 noiseUv = vUv;
    vec2 advect = texture2D(tAdvect, fract(noiseUv * 3. * responsive)).xy * 2. - 1.;
    advect *= 1.;
    uv += advect * invResolution;

    // wave propagation
    float wavespeed = 1.;
    vec2 offset = invResolution * wavespeed;
    float l = texture2D(tBuffer, uv - vec2(offset.x, 0.0)).r;
    float r = texture2D(tBuffer, uv + vec2(offset.x, 0.0)).r;
    float t = texture2D(tBuffer, uv + vec2(0.0, offset.y)).r;
    float b = texture2D(tBuffer, uv - vec2(0.0, offset.y)).r;
    float nextVal = max(max(max(l, r), t), b);

    // mouse line splat

    float radius = 0.2 * smoothstep(0.1, 1., uSplatRadius * uSizeXFactor);
    float splat = cubicIn(clamp(1.0 - line(vUv, prevSplatCoords.xy, splatCoords.xy) / radius, 0.0, 1.0));
    nextVal += splat;

    // damping and clamp

    nextVal *= 0.985;
    nextVal = min(nextVal, 1.0);
    float rim = nextVal - texture2D(tBuffer, uv).r;
    gl_FragColor = vec4(nextVal, rim, 0.0, 1.0);

    // advect = texture2D(tAdvect, fract(noiseUv * 3. * responsive)).xy * 2. - 1.;
    // gl_FragColor = vec4(advect, 0.0, 1.0);
}