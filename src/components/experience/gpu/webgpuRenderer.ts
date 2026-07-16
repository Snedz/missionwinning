import { HERO_FIELD_WGSL } from '@/components/experience/shaders/heroField.wgsl';
import type { HeroUniforms } from '@/components/experience/gpu/webgl2Renderer';

export type WebGpuHero = {
  draw: (u: HeroUniforms) => void;
  resize: (w: number, h: number, dpr: number) => void;
  destroy: () => void;
};

export async function createWebGpuHero(canvas: HTMLCanvasElement): Promise<WebGpuHero | null> {
  const nav = navigator as Navigator & {
    gpu?: {
      requestAdapter: () => Promise<GPUAdapter | null>;
      getPreferredCanvasFormat: () => GPUTextureFormat;
    };
  };
  if (!nav.gpu) return null;
  const adapter = await nav.gpu.requestAdapter();
  if (!adapter) return null;
  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu') as GPUCanvasContext | null;
  if (!context) return null;

  const format = nav.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'opaque' });

  const module = device.createShaderModule({ code: HERO_FIELD_WGSL });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module, entryPoint: 'vs' },
    fragment: {
      module,
      entryPoint: 'fs',
      targets: [{ format }],
    },
    primitive: { topology: 'triangle-list' },
  });

  const uniformBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  const floats = new Float32Array(4);

  return {
    resize(w, h, dpr) {
      const rw = Math.max(1, Math.floor(w * dpr));
      const rh = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== rw || canvas.height !== rh) {
        canvas.width = rw;
        canvas.height = rh;
      }
    },
    draw(u) {
      floats[0] = u.time;
      floats[1] = u.aspect;
      floats[2] = u.px;
      floats[3] = u.py;
      device.queue.writeBuffer(uniformBuffer, 0, floats);
      const encoder = device.createCommandEncoder();
      const view = context.getCurrentTexture().createView();
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view,
            clearValue: { r: 0.039, g: 0.051, b: 0.071, a: 1 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    },
    destroy() {
      uniformBuffer.destroy();
      device.destroy();
    },
  };
}

// Minimal WebGPU type stubs for TS when @webgpu/types not installed
type GPUAdapter = { requestDevice: () => Promise<GPUDevice> };
type GPUDevice = {
  createShaderModule: (d: { code: string }) => GPUShaderModule;
  createRenderPipeline: (d: unknown) => GPURenderPipeline;
  createBuffer: (d: unknown) => GPUBuffer;
  createBindGroup: (d: unknown) => GPUBindGroup;
  queue: { writeBuffer: (b: GPUBuffer, o: number, d: Float32Array) => void; submit: (c: unknown[]) => void };
  createCommandEncoder: () => GPUCommandEncoder;
  destroy: () => void;
};
type GPUShaderModule = unknown;
type GPURenderPipeline = { getBindGroupLayout: (i: number) => unknown };
type GPUBuffer = { destroy: () => void };
type GPUBindGroup = unknown;
type GPUCommandEncoder = {
  beginRenderPass: (d: unknown) => GPURenderPass;
  finish: () => unknown;
};
type GPURenderPass = {
  setPipeline: (p: GPURenderPipeline) => void;
  setBindGroup: (i: number, g: GPUBindGroup) => void;
  draw: (n: number) => void;
  end: () => void;
};
type GPUCanvasContext = {
  configure: (d: unknown) => void;
  getCurrentTexture: () => { createView: () => unknown };
};
type GPUTextureFormat = string;
declare const GPUBufferUsage: { UNIFORM: number; COPY_DST: number };
