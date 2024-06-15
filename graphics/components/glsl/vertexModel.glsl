uniform vec3 uTransformed;
uniform vec3 uPosition;
uniform float uTime;
uniform float uFactor;
uniform float uId;
uniform vec3 uModelPosition;

attribute float aId;

varying vec2 vUv;
varying vec3 vPosition;
varying float viewer;
varying vec3 vNormal;
varying vec3 vTop;
varying vec3 vGradient;

void main() {
    vec3 pos = position;

    vTop = (pos * 3.8 - 15.1);

    float dist = 1. - length((uPosition.xz) * (uTime / 10.));
    float norm = smoothstep(0.99, 1., pow(dist, 2.));

    pos.y -= 4. + ((norm * 7.) - (uId + 2.));
    vGradient = pos * .1 + .5;
    // pos.y -= smoothstep(.9, uFactor, dist) - 1.;

    vec4 vertexPos = modelMatrix * vec4(pos, 1.0);

    vec4 viewPosition = viewMatrix * vertexPos;

    gl_Position = projectionMatrix * viewPosition;

    vUv = uv;
    vPosition = pos;
    vNormal = normal;
    viewer = norm;
}