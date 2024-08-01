uniform float uTime;

attribute float aRandom;

varying vec2 vUv;

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);

    float res = mix(mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x), mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
    return res * res;
}

void main() {
    float time = uTime * 0.005;
    vec3 pos = position;

    vec4 vertexPos = modelMatrix * vec4(pos, 1.0);

    // Calculate translation based on noise and time
    float translationX = noise(vec2(time * .1 + aRandom * 10., 0.0)) * 20.0;
    float translationY = noise(vec2(0.0, time * .1 + aRandom * 10.)) * 20.0;
    vec3 translation = vec3(translationX, translationY, 0.0);

    // Apply the translation to the vertex position
    vertexPos.xyz -= translation;

    vertexPos.xy -= noise(vertexPos.xy * .01 + time * 0.1 + aRandom) * 10.;

    vec4 viewPosition = viewMatrix * vertexPos;

    gl_Position = projectionMatrix * viewPosition;

    vUv = uv;
}