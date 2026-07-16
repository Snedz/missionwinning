/** WebGL2 transform-feedback + point sprites for Win Score nebula. */

export const PARTICLE_UPDATE_VERT = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aVel;
layout(location = 2) in float aSeed;

uniform float uTime;
uniform float uScore;   // 0..100
uniform float uSets;    // 0..3
uniform float uPr;      // 0|1
uniform float uAspect;

out vec2 vPos;
out vec2 vVel;
out float vSeed;

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453);
}

vec2 nebula(float seed, float t) {
  float a = seed * 6.28318 + t * (0.15 + hash(seed + 1.0) * 0.25);
  float r = 0.15 + hash(seed + 2.0) * 0.55;
  return vec2(cos(a) * r * uAspect * 0.55, sin(a) * r * 0.7);
}

vec2 ringTarget(float seed, float score) {
  float arc = clamp(score / 100.0, 0.05, 1.0) * 6.28318 * 0.85;
  float start = -1.2;
  float ang = start + hash(seed) * arc;
  float r = 0.38 + hash(seed + 3.0) * 0.04;
  return vec2(cos(ang) * r * uAspect * 0.7, sin(ang) * r);
}

void main() {
  float seed = aSeed;
  float group = floor(seed * 3.0); // thirds for set retarget
  float active = step(group, uSets - 0.5); // 0 until its set fires
  vec2 target = mix(nebula(seed, uTime), ringTarget(seed, uScore), active);
  if (uPr > 0.5) {
    float burst = exp(-fract(uTime * 0.4) * 3.0) * 0.12;
    target += normalize(target + vec2(0.001)) * burst * (0.5 + hash(seed + 9.0));
  }
  vec2 pos = aPos;
  vec2 vel = aVel;
  vec2 to = target - pos;
  vel = vel * 0.88 + to * 0.08;
  pos += vel * 0.035;
  if (length(pos) > 2.5) {
    pos = nebula(seed, uTime);
    vel = vec2(0.0);
  }
  vPos = pos;
  vVel = vel;
  vSeed = seed;
  gl_Position = vec4(0.0);
}
`;

export const PARTICLE_DRAW_VERT = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
layout(location = 2) in float aSeed;
uniform float uAspect;
uniform float uPr;
out float vAlpha;
out float vBrass;
void main() {
  vec2 p = aPos;
  p.x /= max(uAspect, 0.01);
  gl_Position = vec4(p, 0.0, 1.0);
  gl_PointSize = mix(1.6, 2.8, fract(aSeed * 17.0));
  vAlpha = 0.35 + fract(aSeed * 9.0) * 0.55;
  vBrass = uPr;
}
`;

export const PARTICLE_DRAW_FRAG = /* glsl */ `#version 300 es
precision mediump float;
in float vAlpha;
in float vBrass;
out vec4 fragColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  vec3 emerald = vec3(0.063, 0.725, 0.506);
  vec3 brass = vec3(0.788, 0.659, 0.416);
  vec3 col = mix(emerald, brass, vBrass * 0.85);
  fragColor = vec4(col, a);
}
`;
