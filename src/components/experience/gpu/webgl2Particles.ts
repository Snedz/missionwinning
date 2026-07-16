import {
  PARTICLE_DRAW_FRAG,
  PARTICLE_DRAW_VERT,
  PARTICLE_UPDATE_VERT,
} from '@/components/experience/shaders/particles.glsl';

export type ParticleUniforms = {
  time: number;
  score: number;
  sets: number;
  pr: number;
  aspect: number;
};

export type WebGl2Particles = {
  draw: (u: ParticleUniforms) => void;
  resize: (w: number, h: number, dpr: number) => void;
  destroy: () => void;
};

const COUNT = 28_000;
const STRIDE = 5; // x y vx vy seed
const BYTES = COUNT * STRIDE * 4;

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(info || 'particle shader compile failed');
  }
  return sh;
}

function link(
  gl: WebGL2RenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
  varyings?: string[]
): WebGLProgram {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  if (varyings) {
    gl.transformFeedbackVaryings(prog, varyings, gl.INTERLEAVED_ATTRIBS);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) || 'particle link failed');
  }
  return prog;
}

export function createWebGl2Particles(canvas: HTMLCanvasElement): WebGl2Particles | null {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: 'high-performance',
  });
  if (!gl) return null;

  const ext = gl.getExtension('EXT_color_buffer_float');
  void ext;

  const updateVs = compile(gl, gl.VERTEX_SHADER, PARTICLE_UPDATE_VERT);
  const updateFs = compile(
    gl,
    gl.FRAGMENT_SHADER,
    `#version 300 es\nprecision lowp float;out vec4 o;void main(){o=vec4(0.0);}`
  );
  const updateProg = link(gl, updateVs, updateFs, ['vPos', 'vVel', 'vSeed']);

  const drawVs = compile(gl, gl.VERTEX_SHADER, PARTICLE_DRAW_VERT);
  const drawFs = compile(gl, gl.FRAGMENT_SHADER, PARTICLE_DRAW_FRAG);
  const drawProg = link(gl, drawVs, drawFs);

  const seed = new Float32Array(COUNT * STRIDE);
  for (let i = 0; i < COUNT; i++) {
    const o = i * STRIDE;
    const s = i / COUNT;
    const a = s * Math.PI * 2;
    const r = 0.2 + (i % 97) / 97 * 0.5;
    seed[o] = Math.cos(a) * r;
    seed[o + 1] = Math.sin(a) * r * 0.7;
    seed[o + 2] = 0;
    seed[o + 3] = 0;
    seed[o + 4] = s;
  }

  const bufA = gl.createBuffer()!;
  const bufB = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, bufA);
  gl.bufferData(gl.ARRAY_BUFFER, seed, gl.DYNAMIC_COPY);
  gl.bindBuffer(gl.ARRAY_BUFFER, bufB);
  gl.bufferData(gl.ARRAY_BUFFER, BYTES, gl.DYNAMIC_COPY);

  const vaoA = gl.createVertexArray()!;
  const vaoB = gl.createVertexArray()!;
  const tfA = gl.createTransformFeedback()!;
  const tfB = gl.createTransformFeedback()!;

  const bindRead = (vao: WebGLVertexArrayObject, buf: WebGLBuffer) => {
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, STRIDE * 4, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, STRIDE * 4, 8);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, STRIDE * 4, 16);
  };
  bindRead(vaoA, bufA);
  bindRead(vaoB, bufB);

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tfA);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufB);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tfB);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufA);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  let readA = true;
  const locU = {
    time: gl.getUniformLocation(updateProg, 'uTime'),
    score: gl.getUniformLocation(updateProg, 'uScore'),
    sets: gl.getUniformLocation(updateProg, 'uSets'),
    pr: gl.getUniformLocation(updateProg, 'uPr'),
    aspect: gl.getUniformLocation(updateProg, 'uAspect'),
  };
  const locD = {
    aspect: gl.getUniformLocation(drawProg, 'uAspect'),
    pr: gl.getUniformLocation(drawProg, 'uPr'),
  };

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  return {
    resize(w, h, dpr) {
      const rw = Math.max(1, Math.floor(w * dpr));
      const rh = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== rw || canvas.height !== rh) {
        canvas.width = rw;
        canvas.height = rh;
      }
      gl.viewport(0, 0, rw, rh);
    },
    draw(u) {
      // Update pass (TF only writes vPos+vVel — seed stays in buffer... problem)
      // Interleaved TF of only pos/vel would desync seed. Fix: full stride TF with seed passthrough.
      // Our varyings are only vPos,vVel — seed not written. Use separate seed buffer approach.
      // Simpler fix for this ship: CPU-free update that re-reads seed from attrib while writing pos/vel
      // into a tightly packed buffer is complex. Re-seed each frame from aPos as seed-driven state:

      gl.useProgram(updateProg);
      gl.uniform1f(locU.time, u.time);
      gl.uniform1f(locU.score, u.score);
      gl.uniform1f(locU.sets, u.sets);
      gl.uniform1f(locU.pr, u.pr);
      gl.uniform1f(locU.aspect, u.aspect);

      const readVao = readA ? vaoA : vaoB;
      const tf = readA ? tfA : tfB;
      gl.bindVertexArray(readVao);
      gl.enable(gl.RASTERIZER_DISCARD);
      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
      gl.beginTransformFeedback(gl.POINTS);
      gl.drawArrays(gl.POINTS, 0, COUNT);
      gl.endTransformFeedback();
      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
      gl.disable(gl.RASTERIZER_DISCARD);

      readA = !readA;

      // Draw from buffer that was just written (now "read" side after flip is previous write)
      // After flip, particles live in the buffer we wrote to. readA toggled → written is opposite of current readA.
      const drawVao = readA ? vaoB : vaoA;
      gl.useProgram(drawProg);
      gl.uniform1f(locD.aspect, u.aspect);
      gl.uniform1f(locD.pr, u.pr);
      gl.clearColor(0.039, 0.051, 0.071, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindVertexArray(drawVao);
      gl.drawArrays(gl.POINTS, 0, COUNT);
    },
    destroy() {
      gl.deleteProgram(updateProg);
      gl.deleteProgram(drawProg);
      gl.deleteShader(updateVs);
      gl.deleteShader(updateFs);
      gl.deleteShader(drawVs);
      gl.deleteShader(drawFs);
      gl.deleteBuffer(bufA);
      gl.deleteBuffer(bufB);
      gl.deleteVertexArray(vaoA);
      gl.deleteVertexArray(vaoB);
      gl.deleteTransformFeedback(tfA);
      gl.deleteTransformFeedback(tfB);
    },
  };
}
