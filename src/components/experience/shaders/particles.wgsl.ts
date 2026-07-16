/** WebGPU compute (update) + point render for Win Score particle ring. */

export const PARTICLES_COMPUTE_WGSL = /* wgsl */ `
struct Uniforms {
  time: f32,
  score: f32,
  sets: f32,
  pr: f32,
  aspect: f32,
  count: f32,
  _pad0: f32,
  _pad1: f32,
};
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read_write> particles: array<vec4f>;

fn hash(n: f32) -> f32 {
  return fract(sin(n * 127.1) * 43758.5453);
}

fn nebula(seed: f32, t: f32) -> vec2f {
  let a = seed * 6.28318 + t * (0.15 + hash(seed + 1.0) * 0.25);
  let r = 0.15 + hash(seed + 2.0) * 0.55;
  return vec2f(cos(a) * r * u.aspect * 0.55, sin(a) * r * 0.7);
}

fn ringTarget(seed: f32, score: f32) -> vec2f {
  let arc = clamp(score / 100.0, 0.05, 1.0) * 6.28318 * 0.85;
  let start = -1.2;
  let ang = start + hash(seed) * arc;
  let r = 0.38 + hash(seed + 3.0) * 0.04;
  return vec2f(cos(ang) * r * u.aspect * 0.7, sin(ang) * r);
}

@compute @workgroup_size(64)
fn cs(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x;
  if (i >= u32(u.count)) { return; }
  let seed = f32(i) / max(u.count, 1.0);
  var p = particles[i];
  var pos = p.xy;
  var vel = p.zw;
  let group = floor(seed * 3.0);
  let active = select(0.0, 1.0, group <= u.sets - 0.5);
  var target = mix(nebula(seed, u.time), ringTarget(seed, u.score), active);
  if (u.pr > 0.5) {
    let burst = exp(-fract(u.time * 0.4) * 3.0) * 0.12;
    let n = normalize(target + vec2f(0.001, 0.0));
    target = target + n * burst * (0.5 + hash(seed + 9.0));
  }
  vel = vel * 0.88 + (target - pos) * 0.08;
  pos = pos + vel * 0.035;
  if (length(pos) > 2.5) {
    pos = nebula(seed, u.time);
    vel = vec2f(0.0, 0.0);
  }
  particles[i] = vec4f(pos, vel);
}
`;

export const PARTICLES_RENDER_WGSL = /* wgsl */ `
struct Uniforms {
  time: f32,
  score: f32,
  sets: f32,
  pr: f32,
  aspect: f32,
  count: f32,
  _pad0: f32,
  _pad1: f32,
};
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> particles: array<vec4f>;

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) alpha: f32,
  @location(1) brass: f32,
};

@vertex
fn vs(@builtin(vertex_index) vi: u32) -> VSOut {
  let p = particles[vi];
  var o: VSOut;
  var xy = p.xy;
  xy.x = xy.x / max(u.aspect, 0.01);
  o.pos = vec4f(xy, 0.0, 1.0);
  let seed = f32(vi) / max(u.count, 1.0);
  o.alpha = 0.35 + fract(seed * 9.0) * 0.55;
  o.brass = u.pr;
  return o;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4f {
  let emerald = vec3f(0.063, 0.725, 0.506);
  let brass = vec3f(0.788, 0.659, 0.416);
  let col = mix(emerald, brass, in.brass * 0.85);
  return vec4f(col, in.alpha * 0.9);
}
`;
