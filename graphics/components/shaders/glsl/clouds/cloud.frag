uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D tBlueNoise;
uniform sampler2D tDiffuse;
uniform sampler2D tNoise;
uniform int uFrame;

#define MAX_STEPS 50

#include ../helpers/fbm.glsl
#include ../helpers/rotate2D.glsl
#include ../helpers/SDF/sdSphere.glsl
#include ../helpers/SDF/sdTorus.glsl

float scene(vec3 p) {
  // p.xz *= rotate2D(-3.14 * 0.1);
  float d = sdSphere(p, 1.2);
  // p.yz *= rotate2D(-3.14 * 0.5 + uTime);
  d = sdTorus(p, vec2(1.0, 0.7));
  d = 1. - texture2D(tDiffuse, gl_FragCoord.xy / uResolution.xy).r;

  float f = fbm(p, tNoise, uTime) * .7;

  return -d + f;
}

const vec3 SUN_POSITION = vec3(1.0, 0.0, 0.0);
const float MARCH_SIZE = 0.16;

vec4 raymarch(vec3 rayOrigin, vec3 rayDirection, float offset) {
  float depth = 0.0;
  depth += MARCH_SIZE * offset;
  vec3 p = rayOrigin + depth * rayDirection;
  vec3 sunDirection = normalize(SUN_POSITION);

  vec4 res = vec4(0.0);

  for(int i = 0; i < MAX_STEPS; i++) {
    float density = scene(p);

    // We only draw the density if it's greater than 0
    if(density > 0.0) {
      // Directional derivative
      // For fast diffuse lighting
      float diffuse = clamp((scene(p) - scene(p + 0.3 * sunDirection)) / 0.3, 0.0, 1.0);
      vec3 lin = vec3(0.60, 0.60, 0.75) * 1.1 + 0.8 * vec3(1.0, 0.6, 0.3) * diffuse;
      vec4 color = vec4(mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.0, 0.0), density), density);
      color.rgb *= lin;
      color.rgb *= color.a;
      res += color * (1.0 - res.a);
    }

    depth += MARCH_SIZE;
    p = rayOrigin + depth * rayDirection;
  }

  return res;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  uv -= 0.5;
  uv.x *= uResolution.x / uResolution.y;

  // Ray Origin - camera
  vec3 ro = vec3(0.0, 0.0, 5.0);
  // Ray Direction
  vec3 rd = normalize(vec3(uv, -1.0));

  vec3 color = vec3(0.0);

  // Sun and Sky
  vec3 sunDirection = normalize(SUN_POSITION);
  float sun = clamp(dot(sunDirection, rd), 0.0, 1.0);
  // Base sky color
  color = vec3(0.7, 0.7, 0.90);
  // Add vertical gradient
  color -= 0.8 * vec3(0.90, 0.75, 0.90) * rd.y;
  // Add sun color to sky
  color += 0.5 * vec3(1.0, 0.5, 0.3) * pow(sun, 10.0);

  float blueNoise = texture2D(tBlueNoise, gl_FragCoord.xy / 1024.0).r;
  float offset = fract(blueNoise + float(uFrame % 32) / sqrt(0.5));

  // Cloud
  vec4 res = raymarch(ro, rd, offset);
  color = color * (1.0 - res.a) + res.rgb;

  vec3 p1 = vec3(ro + rd);

  float test = texture2D(tDiffuse, gl_FragCoord.xy / uResolution.xy).r;

  gl_FragColor = vec4(vec3(test), 1.);
  gl_FragColor = vec4(color, 1.0);
}
