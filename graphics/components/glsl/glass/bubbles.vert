uniform float uTime;

attribute vec3 aRamdom;

varying vec2 vUv;

float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) *
        43758.5453123);
}

float fbmNoise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
        (c - a) * u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

#define OCTAVES 8
float fbm(in vec2 st) {
    // Initial values
    float value = 1.0;
    float amplitude = .5;
    float frequency = 2.;
    //
    // Loop of octaves
    for(int i = 0; i < OCTAVES; i++) {
        value += amplitude * fbmNoise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

void main() {
    vUv = uv;
    float time = uTime * .1;
    vec3 pos = position;
    pos.y += fract(time) * 50.;
    pos.xz += vec2(fbm(pos.xz + time) * 20. - 20., fbm(pos.xz + time));

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    gl_PointSize = 200.0 * (1. / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

}