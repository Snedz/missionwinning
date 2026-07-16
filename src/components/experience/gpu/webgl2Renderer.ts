import { HERO_FIELD_FRAG, HERO_FIELD_VERT } from '@/components/experience/shaders/heroField.glsl';

export type HeroUniforms = {
  time: number;
  aspect: number;
  px: number;
  py: number;
};

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(info || 'shader compile failed');
  }
  return sh;
}

export type WebGl2Hero = {
  draw: (u: HeroUniforms) => void;
  resize: (w: number, h: number, dpr: number) => void;
  destroy: () => void;
};

export function createWebGl2Hero(canvas: HTMLCanvasElement): WebGl2Hero | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    powerPreference: 'high-performance',
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, HERO_FIELD_VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, HERO_FIELD_FRAG);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) || 'link failed');
  }
  gl.useProgram(prog);
  const locTime = gl.getUniformLocation(prog, 'uTime');
  const locAspect = gl.getUniformLocation(prog, 'uAspect');
  const locPointer = gl.getUniformLocation(prog, 'uPointer');
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

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
      gl.useProgram(prog);
      gl.uniform1f(locTime, u.time);
      gl.uniform1f(locAspect, u.aspect);
      gl.uniform2f(locPointer, u.px, u.py);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy() {
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteVertexArray(vao);
    },
  };
}
