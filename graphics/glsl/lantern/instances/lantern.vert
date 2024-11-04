uniform float uTime;
uniform float uSpeed;
uniform float loopLength;

attribute vec3 aBasePosition;
attribute float aRandom;

#include "../../helpers/curl4.glsl"

void main() {
    // Total movement along Z
    float totalMovement = uTime * uSpeed * aRandom;

    // Compute new Z position and apply looping
    float newZ = aBasePosition.z - totalMovement;
    float adjustedZ = newZ + loopLength;
    float loopedZ = mod(adjustedZ, loopLength) - loopLength / 2.;

    // Compute the updated instance position at current time
    vec3 instancePosition = vec3(aBasePosition.x, aBasePosition.y, loopedZ) + vec3(curl(aBasePosition, uTime * 0.1, 0.5).xy * 1.5, 0.0);

    float ascentRate = 0.2; // Contrôle la vitesse de montée sur Y
    instancePosition.y += -loopedZ * ascentRate;

    // Compute instance position at a slightly later time (delta)
    float delta = 1.;
    float totalMovementNext = (uTime + delta) * uSpeed * aRandom;
    float newZNext = aBasePosition.z - totalMovementNext;
    float adjustedZNext = newZNext + loopLength;
    float loopedZNext = mod(adjustedZNext, loopLength) - loopLength;

    vec3 curl = curl(aBasePosition, (uTime + delta), 0.5) * .2;

    float curlX = curl.x;
    float curlY = curl.y;

    vec3 nextInstancePosition = vec3(aBasePosition.x, aBasePosition.y, loopedZNext) + vec3(curlX, curlY, -curlY);

    // Compute direction vector
    vec3 direction = normalize(nextInstancePosition - instancePosition);

    // Choose an up reference vector
    vec3 upReference = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), step(0.99, abs(direction.y)));

    // Compute right and up vectors
    vec3 right = normalize(cross(upReference, direction));
    vec3 up = cross(direction, right);

    // Build rotation matrix
    mat3 rotationMatrix = mat3(right, up, direction);

    // Rotate the local vertex positions
    vec3 transformed = rotationMatrix * position;

    // Compute world position
    vec3 worldPosition = instancePosition + transformed;

    // Transform to clip space
    vec4 mvPosition = modelViewMatrix * vec4(worldPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
