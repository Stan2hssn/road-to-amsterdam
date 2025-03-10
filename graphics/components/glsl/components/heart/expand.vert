#include <begin_vertex>

// Basic UV setup
vUv = aUv;

// Time and animation variables
float time = uTime * 0.4;
time = uMotionTime / 3. - aRandom / 2.;
float t = mix(0., time - 0.2, step(0.1, time));

// Noise and shrink factor
float noiseFactor = noise(aCenter.xy * 2. + vec2(uTime));
float shrinkFactor = smoothstep(0., 0.3, time) + mix(smoothstep(0., 1. / (uShrink * 5.), noiseFactor), 0., uShrink);

// Get wave displacement from the texture
vec4 tWorldPosition = modelMatrix * vec4(aCenter, 1.0);
vec4 tTexCoords = tProjectionMatrixCamera * tViewMatrixCamera * tWorldPosition;
vTexCoords = tTexCoords;

// Map texture coordinates to screen space
vec2 winUv = (vTexCoords.xy / vTexCoords.w) * 0.5 + 0.5;

// Sample the wave texture using transformed UV
float mouseWave = texture2D(tWavePropagation, winUv).r;

// Normalize ray coordinates
vec3 rayCoords = (uRayCoords - vec3(0., uPosY, 0.)) / uRectWidth;

// Calculate translated position relative to the centroid
vec3 translatedPos = transformed - aCenter;

// Movement factor influenced by wave texture and noise
float factor = smoothstep(0.6 + shrinkFactor, 0.0, length(aCenter.xy - rayCoords.xy * 0.9) / 1.4 + noiseFactor * 0.2);
factor = smoothstep(0.1, 1., mouseWave) * mix(0., 1., smoothstep(1., 3., uTime));

// Expand factor based on noise and heart beat animation
float expand = smoothstep(5., 0.1, noise(aCenter.xy * 10. + vec2(time)) * 2.);
float beatHeart = mix(0., smoothstep(0.3, 1., noiseFactor) * 0.5, uIdle);
factor = expand * factor * 0.5 + beatHeart;
factor *= aId;

// Scale the triangle based on the factor
vec3 scaledPos = translatedPos * mix(1., mix(0., 1., uShrink + uIdle), mix(min(1., factor * 3.), shrinkFactor, shrinkFactor));

// Calculate the final animation factor
float finalFactor = mix(factor * 2., expand * 2., shrinkFactor);

// Rotation based on time and interaction
float newTime = max(0., pow(t, 2.5));
mat3 rotationX = rotationMatrixX(- 6.28 * 2. * uShrink * min(aRandom * newTime, 10.));
mat3 rotationY = rotationMatrixY(- 6.28 * 2. * uShrink * min(aRandom * newTime, 10.));

// Rotation using ray direction and triangle normal
vec3 rayTo = normalize(uRayCoords - aCenter);
vec3 rotationAxis = normalize(cross(- normal, rayTo));
float angle = acos(clamp(dot(normal, rayTo), - 1.0, 1.0));
mat3 rotation = rotationMatrix(rotationAxis, angle * finalFactor);

// Calculate new position based on rotation and scaling
vec3 newPos = mix(rotation * scaledPos, rotationX * rotationY * scaledPos, uShrink);
newPos = rotationX * rotationY * scaledPos;

// Apply velocity and curl noise for a more organic movement
float v0 = uVel0 - aRandom;
float g = uGravity;
float m = uMass;
float c = 1.0;
float vTerm = (m * g) / c;
float velocity = v0 * newTime + (vTerm * c) * newTime;
vec3 curlNoise = curl(aCenter, 5.2, .1) * 5.;

// Final position with wave and noise influences
transformed = (aCenter + newPos);
transformed += normal * ((finalFactor * 0.15) * abs(uShrink - 1.)) + velocity * normal + mix(vec3(0.), curlNoise, newTime);
transformed.z += mix(0., 0.001, aId);
transformed *= mix(1., 1.004, aId);

// Set the view based on mouse wave influence
view = mouseWave;
