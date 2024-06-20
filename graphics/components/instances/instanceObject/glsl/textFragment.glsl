uniform sampler2D uText;
uniform vec2 uMouse;
uniform float uTime;

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

vec2 bubble(vec2 p) {
    p += cos(p.xy + uTime * vec2(1.2, 1.1)) * 0.1;
    p += cos(p.yx * 1.1 + uTime + vec2(1., 2.1)) * 0.01;
    p += sin(p.yx * 1.2 + uTime + vec2(1., 1.)) * 0.1;
    p += sin(p.yx * 1. + uTime + vec2(3., 2.)) * 0.2;
    p += noise(p) * 2.;

    p.y -= uMouse.y;
    p.x -= uMouse.x;

    return p;
}

void main() {
    vec2 uv = vUv;

    vec2 p = uv * 2.0 - 1.0;

    vec2 bubble1 = bubble(p + .8);
    vec2 bubble2 = bubble(p - .7);

    // float dist = 1. - noise(p) * 3.;
    // float dist = 1. - length(noise(p)) * .5;

    float dist1 = length(bubble1) * 2.;
    vec2 dir1 = normalize(bubble1 - uMouse / 2.0);

    float dist2 = length(bubble2) * 2.;
    vec2 dir2 = normalize(bubble2 - uMouse / 2.0);

    vec2 c1 = dir1 * (1. - smoothstep(0., 1., dist1));
    vec2 c2 = dir2 * (1. - smoothstep(0., 1., dist2));

    vec2 newUv = uv - (c1 + c2);

    float mask = smoothstep(0.9, .9, dist2);
    float mask2 = smoothstep(0.9, .9, dist1);

    // float inversion = smoothstep(1.01, .0, dist);
    // inversion = fract(smoothstep(1.01, .6, dist));

    // vec4 color = texture2D(uText, uv - (inversion - .3));
    vec4 color = texture2D(uText, newUv);

    mask *= smoothstep(0.5, 1., 1. - color.r);

    gl_FragColor = vec4(.2, 0.3, 0.2, 1.0);
    gl_FragColor = vec4(newUv, 1., 1.0);
    gl_FragColor = color;
    gl_FragColor = vec4(vec3(mask), 1.);
    gl_FragColor = vec4(color.rgb + vec3(0., 0., 1.), 1.);
    gl_FragColor = vec4(color.rgb + vec3(0., 0., 1.), mask * mask2);
}