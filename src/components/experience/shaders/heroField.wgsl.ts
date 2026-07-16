/** Fullscreen triangle raymarched-ish fBm field — WebGPU WGSL. */
export const HERO_FIELD_WGSL = /* wgsl */ `
struct Uniforms {
  time: f32,
  aspect: f32,
  px: f32,
  py: f32,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn vs(@builtin(vertex_index) vi: u32) -> VSOut {
  var p = array<vec2f, 3>(
    vec2f(-1.0, -1.0),
    vec2f(3.0, -1.0),
    vec2f(-1.0, 3.0)
  );
  var o: VSOut;
  o.pos = vec4f(p[vi], 0.0, 1.0);
  o.uv = p[vi] * 0.5 + 0.5;
  return o;
}

fn hash(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2f(1.0, 0.0)), u.x),
    mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), u.x),
    u.y
  );
}

fn fbm(p0: vec2f) -> f32 {
  var p = p0;
  var v = 0.0;
  var a = 0.5;
  for (var i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4f {
  var uv = in.uv;
  uv.x = (uv.x - 0.5) * u.aspect + 0.5;
  let ptr = vec2f(u.px, 1.0 - u.py);
  let d = length(uv - ptr);
  let n = fbm(uv * 3.0 + vec2f(u.time * 0.05, u.time * 0.03));
  let aurora = smoothstep(0.35, 0.85, n + 0.15 * sin(u.time + uv.y * 6.0));
  let glow = exp(-d * 2.2) * 0.35;
  let navy = vec3f(0.039, 0.051, 0.071);
  let emerald = vec3f(0.063, 0.725, 0.506);
  let brass = vec3f(0.788, 0.659, 0.416);
  var col = navy;
  col = mix(col, emerald * 0.45, aurora * 0.55 + glow);
  col = mix(col, brass * 0.25, smoothstep(0.6, 1.0, n) * 0.35);
  return vec4f(col, 1.0);
}
`;
