uniform float uTime;
uniform float uSaturation;
uniform float uRefractPower;
uniform float uChromaticAberration;
uniform float uFresnelPower;
uniform float uIorR;
uniform float uIorY;
uniform float uIorG;
uniform float uIorC;
uniform float uIorB;
uniform float uIorP;
uniform float uShininess;
uniform float uDiffuseness;

uniform vec2 uResolution;

uniform vec3 uLight;

uniform sampler2D tTransmission;

varying vec2 vUv;
varying vec3 worldNormal;
varying vec3 eyeVector;

vec3 sat(vec3 rgb, float intensity) {
    vec3 L = vec3(0.2125, 0.7154, 0.0721);
    vec3 grayscale = vec3(dot(rgb, L));
    return mix(grayscale, rgb, intensity);
}

float specular(vec3 light, float shininess, float diffuseness) {
    vec3 normal = worldNormal;
    vec3 lightVector = normalize(-light);
    vec3 halfVector = normalize(eyeVector + lightVector);

    float NdotL = dot(normal, lightVector);
    float NdotH = dot(normal, halfVector);
    float NdotH2 = NdotH * NdotH;

    float kDiffuse = max(0., NdotL * 0.5 - 0.5);
    float kSpecular = pow(NdotH2, shininess);

    return kSpecular + kDiffuse * diffuseness;
}

float fresnel(vec3 eyeVector, vec3 worldNormal, float power) {
    float fresnelFactor = abs(dot(eyeVector, worldNormal));
    float inversefresnelFactor = 1.5 - fresnelFactor;

    return pow(inversefresnelFactor, power);
}

void main() {
    const int LOOP = 16;

    float iorRatioRed = 1.0 / uIorR;
    float iorRatioGreen = 1.0 / uIorG;
    float iorRatioBlue = 1.0 / uIorB;

    vec2 winUv = gl_FragCoord.xy / uResolution.xy;

    vec3 normal = worldNormal;
    vec4 color = vec4(1.0);

    for(int i = 0; i < LOOP; i++) {
        float slide = float(i) / float(LOOP) * 0.05;

        vec3 refractVecR = refract(eyeVector, normal, (1.0 / uIorR));
        vec3 refractVecY = refract(eyeVector, normal, (1.0 / uIorY));
        vec3 refractVecG = refract(eyeVector, normal, (1.0 / uIorG));
        vec3 refractVecC = refract(eyeVector, normal, (1.0 / uIorC));
        vec3 refractVecB = refract(eyeVector, normal, (1.0 / uIorB));
        vec3 refractVecP = refract(eyeVector, normal, (1.0 / uIorP));

        float r = texture2D(tTransmission, winUv + refractVecR.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 0.5;

        float y = (texture2D(tTransmission, winUv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 2.0 +
            texture2D(tTransmission, winUv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).y * 2.0 -
            texture2D(tTransmission, winUv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).z) / 6.0;

        float g = texture2D(tTransmission, winUv + refractVecG.xy * (uRefractPower + slide * 2.0) * uChromaticAberration).y * 0.5;

        float c = (texture2D(tTransmission, winUv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).y * 2.0 +
            texture2D(tTransmission, winUv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).z * 2.0 -
            texture2D(tTransmission, winUv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).x) / 6.0;

        float b = texture2D(tTransmission, winUv + refractVecB.xy * (uRefractPower + slide * 3.0) * uChromaticAberration).z * 0.5;

        float p = (texture2D(tTransmission, winUv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).z * 2.0 +
            texture2D(tTransmission, winUv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 2.0 -
            texture2D(tTransmission, winUv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).y) / 6.0;

        float R = r + (2.0 * p + 2.0 * y - c) / 3.0;
        float G = g + (2.0 * y + 2.0 * c - p) / 3.0;
        float B = b + (2.0 * c + 2.0 * p - y) / 3.0;

        color.r += R;
        color.g += G;
        color.b += B;

        color.rgb = sat(color.rgb, uSaturation);
    }

    color.rgb /= float(LOOP);

    color = LinearTosRGB(color);

    color.rgb = pow(color.rgb, vec3(1.0 / .4));

    float specularLight = specular(uLight, uShininess, uDiffuseness);
    color.rgb += specularLight * 0.2;

    float f = fresnel(eyeVector, normal, uFresnelPower);
    color.rgb += f * vec3(.050);

    vec4 colorTest = texture2D(tTransmission, winUv - .5);

    gl_FragColor = vec4(.2, 0.3, 0.2, 1.0);
    gl_FragColor = vec4(vec3(winUv, 1.), 1.);
    gl_FragColor = vec4(mix(color.rgb, vec3(0.), sin(uTime * 0.001)), 1.);
    gl_FragColor = colorTest;
    gl_FragColor = color;
}