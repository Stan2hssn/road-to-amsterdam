uniform float uTime;
uniform float uPreClock;
uniform float uTiltScale;
uniform float uTransition;

#include "../helpers/pNoise.glsl" // Assurez-vous que le chemin est correct

void main() {
    float delta = 0.01; // Petit incrément pour le calcul de la vitesse

    // **Paramètres pour le bruit de Perlin**
    float noiseScale = 2.0;   // Ajustez pour changer l'échelle du bruit
    float noiseSpeed = 0.2;   // Ajustez pour changer la vitesse du bruit

    vec3 trajectory = mix(vec3(0., 2., 0.), vec3(0., 2. + uPreClock, uPreClock), uTransition);

    // **Position actuelle en utilisant le bruit de Perlin**
    vec3 noisePosition = vec3(uTime * noiseSpeed, 0.0, 0.0);
    float currentX = cnoise(noisePosition) * noiseScale;
    float currentZ = cnoise(noisePosition + vec3(100.0, 0.0, 0.0)) * noiseScale; // Décalage pour obtenir une valeur différente

    vec3 currentPosition = vec3(currentX, trajectory.y, currentZ - trajectory.z);

    // **Position future pour calculer la vitesse, également en utilisant le bruit de Perlin**
    vec3 futureNoisePosition = vec3((uTime + delta) * noiseSpeed, 0.0, 0.0);
    float futureX = cnoise(futureNoisePosition) * noiseScale;
    float futureZ = cnoise(futureNoisePosition + vec3(100.0, 0.0, 0.0)) * noiseScale;

    vec3 futurePosition = vec3(futureX, trajectory.y, futureZ - trajectory.z);

    // **Vecteur vitesse**
    vec3 velocity = (futurePosition - currentPosition) / delta;

    // **Calcul des angles d'inclinaison**
    float tiltAngleX = -velocity.z * uTiltScale;
    float tiltAngleZ = velocity.x * uTiltScale;

    // **Matrices de rotation autour des axes X et Z**
    mat3 rotationX = mat3(1.0, 0.0, 0.0, 0.0, cos(tiltAngleX), -sin(tiltAngleX), 0.0, sin(tiltAngleX), cos(tiltAngleX));

    mat3 rotationZ = mat3(cos(tiltAngleZ), -sin(tiltAngleZ), 0.0, sin(tiltAngleZ), cos(tiltAngleZ), 0.0, 0.0, 0.0, 1.0);

    // **Appliquer les rotations**
    vec3 transformedPosition = rotationZ * rotationX * position;

    // **Position finale du sommet**
    vec3 finalPosition = currentPosition + transformedPosition;

    // **Transformation en espace de clip**
    gl_Position = projectionMatrix * viewMatrix * vec4(finalPosition, 1.0);
}
