uniform float uFactor;
uniform vec3 uPrimary;
uniform vec3 uSecondary;
uniform vec3 uBackground;
uniform vec3 uGrey;
uniform float uTime;
uniform float uLinearTime;
uniform vec2 winResolution;
uniform vec2 uMouse;

uniform sampler2D uWater;
uniform sampler2D uNoise;

varying vec2 vUv;
varying vec3 vPosition;
varying float viewer;
varying vec3 vNormal;
varying vec3 vTop;
varying vec3 vGradient;

mat2 rotate2d(float _angle) {
    return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}

void main() {
    vec2 uv = gl_FragCoord.xy / winResolution.xy;
    vec3 pos = vPosition;
    vec3 normal = vNormal;
    vec3 toper = vTop;
    vec3 background = uBackground;
    vec2 mag = vec2(fract(pos.x / normal.x) * 20., fract(pos.z / normal.z) * .2);
    float reflet = smoothstep(.5, -0.5, mag.x - mag.y);

    // Grey Filter
    float gray = dot(normal * normal, uGrey);
    vec3 GreyNormal = vec3(sqrt(gray) * 2.);

    // Mouse
    vec2 mouse = gl_FragCoord.xy / winResolution.xy;
    float AR = winResolution.y / winResolution.x;
    float mouseDist = length(((mouse) * 2. - 1.) - uMouse);
    float mouseForce = .5 + smoothstep(2., -0., mouseDist / (GreyNormal.x * GreyNormal.z + .5));

    // Noise UV
    vec2 uvNoise = vec2((uv.x - .5) / (sin(uv.y - .05) * 10.) / AR, (uv.y * (cos(uv.x - 1.))) - (-uLinearTime / 20.));

    // Water UV
    vec2 uvWater = vec2(sin(uv.x), uv.y - (-uLinearTime / 20.));

    // Noise
    vec2 noise = texture2D(uNoise, fract(uvNoise)).rg;

    // Water
    vec4 water = texture2D(uWater, fract(uvWater * 4. + (noise * .4)) * normal.xz * 1.);
    water.rgb *= (viewer + 1.5) / 5. + (mouseForce * 2.);

    // Reflection
    float reflection = 1. - smoothstep(1., 0., water.r);

    // Side Limit
    vec4 sideLimit = vec4(vec3((clamp(GreyNormal, .0, 1.))), 1.);
    sideLimit.rgb += reflection;

    // Background
    float clampGround = step(-0., toper.y);
    float clampTop = step(-.5, toper.y);
    vec4 topLimit = vec4(vec3(clampTop * (clamp(GreyNormal, .6, 1.))), 1.);
    vec4 top = vec4(background, 1.);

    // Color Ramp
    vec4 colorRamp = vec4(mix(uPrimary, uSecondary, top.y), 1.);
    vec4 side = vec4(mix(uPrimary, uSecondary, smoothstep(0., 1.5, vGradient.y * sideLimit.g)), 1.);
    // side.rgb = mix(side.rgb, uBackground, sideLimit.g);

    // Linear to sRGB
    side = LinearTosRGB(side);

    // Combine
    vec4 color = vec4(mix(side.rgb, uBackground, clamp(topLimit.g + clampGround, 0., 1.)), 1.);
    color = LinearTosRGB(color);

    gl_FragColor = vec4(viewer, viewer, viewer, 1.0);
    gl_FragColor = vec4(topLimit.rgb, 1.0);
    gl_FragColor = vec4(vNormal, 1.0);
    // gl_FragColor = vec4(vec3(reflection), 1.0);
    gl_FragColor = vec4(side.rgb, 1.0);
    gl_FragColor = vec4(sideLimit.rgb, 1.0);
    gl_FragColor = vec4(pos, 1.0);
    gl_FragColor = vec4(vec3(mouseForce), 1.0);
    gl_FragColor = water;
    gl_FragColor = vec4(noise, 0.2, 1.0);
    gl_FragColor = vec4(vec3(mag, 1.), 1.0);
    gl_FragColor = vec4(vec3(mouseForce), 1.0);
    gl_FragColor = color;
}