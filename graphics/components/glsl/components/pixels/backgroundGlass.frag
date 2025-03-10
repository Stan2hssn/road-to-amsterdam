uniform float uShift;

uniform vec2 uResolution;
uniform vec2 uCoords;

uniform vec3 uBackground;

uniform sampler2D uTexture;
uniform sampler2D noiseTexture;
uniform sampler2D frostedGlass;

varying vec2 vUv;
varying vec4 vNormal;
varying vec3 vPos;

void main() {
    vec2 st = vUv;
    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    float ratio = uResolution.x / uResolution.y;
    float direction = step(1., ratio);
    vec2 responsive = vec2(mix(ratio, 1.0, direction), mix(1.0, 1.0 / ratio, direction));

    vec4 noiseTexture = texture2D(noiseTexture, fract(uv * 2.) * responsive);

    vec2 shift = vec2(uCoords.x * .003, 0.) * responsive;

    vec2 frostedUvs = st * 2. - shift;

    float l = smoothstep(0.2, .02, length((st - vec2(.5, .5)) * vec2(.5, 1.2) * step(responsive.x, 1.2) + noiseTexture.r * .02));

    vec4 frostedGlass = texture2D(frostedGlass, fract((frostedUvs * vec2(.35, 1.)) * 4. * responsive)); 
    // frostedGlass.rgb = vec3(pow(iqnoise(24. * uv * responsive, 1., .2), 1.));

    vec2 noise = (noiseTexture.rg * .2) + pow(frostedGlass.r, 2.);

    float colorR = texture2D(uTexture, (uv + (noise * .31)) + vec2(-.12, -.12)).r;
    float colorG = texture2D(uTexture, (uv + (noise * .305)) + vec2(-.12, -.12)).g;
    float colorB = texture2D(uTexture, (uv + (noise * .3)) + vec2(-.12, -.12)).b;

    vec4 color = vec4(colorR + .2, colorG + .2, colorB + .2, 1.0);

    color.rgb -= pow(frostedGlass.r * .8, 1.5);

    color.rgb -= vec3(noiseTexture.r) * .1;
    // color.rgb = mix(color.rgb, vec3(1.), smoothstep(0.13, 1., noise.r));

    color.rgb = mix(uBackground, color.rgb, l);

    vec4 colorTest = texture2D(uTexture, uv);

    gl_FragColor = vec4(0.3, 0.26, 0.2, 1.0);
    gl_FragColor = vec4(vec3(smoothstep(0.13, 1., noise.r)), 1.);

    gl_FragColor = vec4(responsive, 0., 1.);
    gl_FragColor = vec4(vec3(l), 1.);
    gl_FragColor = frostedGlass;
    gl_FragColor = color;
}