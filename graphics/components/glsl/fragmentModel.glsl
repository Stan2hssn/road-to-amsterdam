uniform float uFactor;
uniform vec3 uPrimary;
uniform vec3 uSecondary;
uniform vec3 uBackground;
uniform vec3 uGrey;

varying vec2 vUv;
varying vec3 vPosition;
varying float viewer;
varying vec3 vNormal;
varying vec3 vTop;
varying vec3 vGradient;

void main() {
    vec2 uv = vUv;
    vec3 pos = vPosition;
    vec3 normal = vNormal;
    vec3 toper = vTop;
    vec3 background = uBackground;

    // Grey Filter
    float gray = dot(normal * normal, uGrey);
    vec3 GreyNormal = vec3(sqrt(gray) * 2.);

    // Side Limit
    vec4 sideLimit = vec4(vec3((clamp(GreyNormal, .6, 1.))), 1.);

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

    gl_FragColor = vec4(.2, 0.3, 0.2, 1.0);
    gl_FragColor = vec4(uv, 1.0, 1.0);
    gl_FragColor = vec4(viewer, viewer, viewer, 1.0);
    gl_FragColor = vec4(GreyNormal, 1.0);
    gl_FragColor = vec4(vNormal, 1.0);
    gl_FragColor = vec4(side.rgb, 1.0);
    gl_FragColor = vec4(topLimit.rgb, 1.0);
    gl_FragColor = vec4(top.rgb, 1.0);
    gl_FragColor = vec4(vec3(topLimit.g + clampGround), 1.0);
    gl_FragColor = color;
}