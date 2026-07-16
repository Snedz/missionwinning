/** WebGL2 fullscreen triangle — GLSL ES 3.00. */
export const HERO_FIELD_VERT = /* glsl */ `#version 300 es
const vec2 P[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
out vec2 vUv;
void main() {
  vec2 p = P[gl_VertexID];
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

export const HERO_FIELD_FRAG = /* glsl */ `#version 300 es
precision highp float;
uniform float uTime;
uniform float uAspect;
uniform vec2 uPointer;
in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 uv = vUv;
  uv.x = (uv.x - 0.5) * uAspect + 0.5;
  vec2 ptr = vec2(uPointer.x, 1.0 - uPointer.y);
  float d = length(uv - ptr);
  float n = fbm(uv * 3.0 + vec2(uTime * 0.05, uTime * 0.03));
  float aurora = smoothstep(0.35, 0.85, n + 0.15 * sin(uTime + uv.y * 6.0));
  float glow = exp(-d * 2.2) * 0.35;
  vec3 navy = vec3(0.039, 0.051, 0.071);
  vec3 emerald = vec3(0.063, 0.725, 0.506);
  vec3 brass = vec3(0.788, 0.659, 0.416);
  vec3 col = navy;
  col = mix(col, emerald * 0.45, aurora * 0.55 + glow);
  col = mix(col, brass * 0.25, smoothstep(0.6, 1.0, n) * 0.35);
  fragColor = vec4(col, 1.0);
}
`;
