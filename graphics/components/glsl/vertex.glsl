uniform float uTime;
uniform sampler2D normalModel;

uniform float morphTargetInfluences[5];

attribute vec3 morphTarget0;
attribute vec3 morphTarget1;
attribute vec3 morphTarget2;
attribute vec3 morphTarget3;
attribute vec3 morphTarget4;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec2 vUv;
varying vec3 pos;

void main() {
    vec3 morphed = position;
    morphed += morphTarget0 * morphTargetInfluences[0];
    morphed += morphTarget1 * morphTargetInfluences[1];
    morphed += morphTarget2 * morphTargetInfluences[2];
    morphed += morphTarget3 * morphTargetInfluences[3];
    morphed += morphTarget4 * morphTargetInfluences[4];
    // Add more morph targets if needed

    // Transform the normal as usual
    vec3 transformedNormal = normalMatrix * normal;
    worldNormal = normalize(transformedNormal);

    // Calculate world position and eye vector
    vec4 worldPos = modelMatrix * vec4(morphed, 1.0);
    vec4 mvPosition = viewMatrix * worldPos;

    eyeVector = normalize(worldPos.xyz - cameraPosition);

    // Output the final position
    gl_Position = projectionMatrix * mvPosition;

    // Pass through other variables
    vUv = uv;
}