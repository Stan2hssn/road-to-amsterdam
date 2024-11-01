uniform float uTime;
uniform vec2 uResolution;

float sdSphere(vec3 p, float radius) {
    return length(p) - radius;
}

float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

mat2 rotate2D(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    uv -= 0.5;
    uv.x *= uResolution.x / uResolution.y;

    vec3 p = vec3(uv, 0.0);
    float d = sdSphere(p, .4);
    // p.yz *= rotate2D(-3.14 * 0.5);
    // d = sdTorus(p, vec2(.1, 0.2));

    vec4 color = vec4(1.0);
    color.rgb = vec3(-d);

    gl_FragColor = vec4(.2, 0.3, 0.2, 1.0);
    gl_FragColor = color;
}