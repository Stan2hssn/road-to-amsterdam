float tvNoise(vec2 p, float ta, float tb) {
    return fract(sin(p.x * ta + p.y * tb) * 5678.);
}