uniform vec3 uTransformed;
uniform vec3 uPosition;
uniform float uTime;
uniform float uFactor;

attribute vec3 instancedPosition;

varying vec2 vUv;
varying vec3 vPosition;
varying float viewer;

void main() {
    vec3 pos = position;
    vec3 transformed = uTransformed;

    pos.y -= 4.;

    float dist = length(instancedPosition.xz);

    pos.y -= smoothstep(.9, uFactor, dist) - 1.;

    vec4 vertexPos = modelMatrix * vec4(pos, 1.0);

    vec4 viewPosition = viewMatrix * vertexPos;

    gl_Position = projectionMatrix * viewPosition;

    vPosition = instancedPosition.xyz * (uFactor * 10.);
    vUv = normal.xy;
    viewer = dist;
}