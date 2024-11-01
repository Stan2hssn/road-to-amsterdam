float noise(vec3 x, sampler2D noiseSampler) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    vec2 uv = (p.xy + vec2(37.0, 239.0) * p.z) + f.xy;
    vec2 tex = textureLod(noiseSampler, (uv + 0.5) / 256.0, 0.0).yx;

    return mix(tex.x, tex.y, f.z) * 2.0 - 1.0;
}

float fbm(vec3 p, sampler2D noiseSampler, float time) {
    vec3 q = p + time * 0.1 * vec3(1.0, -0.2, -1.0);
    float g = noise(q, noiseSampler);

    float f = 0.0;
    float scale = 0.5;
    float factor = 2.02;

    for(int i = 0; i < 6; i++) {
        f += scale * noise(q, noiseSampler);
        q *= factor;
        factor += 0.21;
        scale *= 0.5;
    }

    return f;
}
