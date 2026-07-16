import {
  PARTICLES_COMPUTE_WGSL,
  PARTICLES_RENDER_WGSL,
} from '@/components/experience/shaders/particles.wgsl';
import type { ParticleUniforms } from '@/components/experience/gpu/webgl2Particles';

export type WebGpuParticles = {
  draw: (u: ParticleUniforms) => void;
  resize: (w: number, h: number, dpr: number) => void;
  destroy: () => void;
};

const COUNT = 72_000;

type GPUAdapter = { requestDevice: () => Promise<GPUDevice> };
type GPUDevice = {
  createShaderModule: (d: { code: string }) => unknown;
  createComputePipeline: (d: unknown) => GPUComputePipeline;
  createRenderPipeline: (d: unknown) => GPURenderPipeline;
  createBuffer: (d: unknown) => GPUBuffer;
  createBindGroup: (d: unknown) => GPUBindGroup;
  queue: {
    writeBuffer: (b: GPUBuffer, o: number, d: ArrayBufferView) => void;
    submit: (c: unknown[]) => void;
  };
  createCommandEncoder: () => GPUCommandEncoder;
  destroy: () => void;
};
type GPUComputePipeline = { getBindGroupLayout: (i: number) => unknown };
type GPURenderPipeline = { getBindGroupLayout: (i: number) => unknown };
type GPUBuffer = { destroy: () => void };
type GPUBindGroup = unknown;
type GPUCommandEncoder = {
  beginComputePass: () => GPUComputePass;
  beginRenderPass: (d: unknown) => GPURenderPass;
  finish: () => unknown;
};
type GPUComputePass = {
  setPipeline: (p: GPUComputePipeline) => void;
  setBindGroup: (i: number, g: GPUBindGroup) => void;
  dispatchWorkgroups: (n: number) => void;
  end: () => void;
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
declare const GPUBufferUsage: {
  UNIFORM: number;
  COPY_DST: number;
  STORAGE: number;
};

export async function createWebGpuParticles(
  canvas: HTMLCanvasElement
): Promise<WebGpuParticles | null> {
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
  if (!context) {
    device.destroy();
    return null;
  }

  const format = nav.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'premultiplied' });

  const computeModule = device.createShaderModule({ code: PARTICLES_COMPUTE_WGSL });
  const renderModule = device.createShaderModule({ code: PARTICLES_RENDER_WGSL });

  const computePipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module: computeModule, entryPoint: 'cs' },
  });

  const renderPipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: renderModule, entryPoint: 'vs' },
    fragment: {
      module: renderModule,
      entryPoint: 'fs',
      targets: [
        {
          format,
          blend: {
            color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' },
            alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
          },
        },
      ],
    },
    primitive: { topology: 'point-list' },
  });

  const uniformBuffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const initial = new Float32Array(COUNT * 4);
  for (let i = 0; i < COUNT; i++) {
    const o = i * 4;
    const s = i / COUNT;
    const a = s * Math.PI * 2;
    const r = 0.2 + ((i % 97) / 97) * 0.5;
    initial[o] = Math.cos(a) * r;
    initial[o + 1] = Math.sin(a) * r * 0.7;
  }
  const particleBuffer = device.createBuffer({
    size: initial.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(particleBuffer, 0, initial);

  const computeBind = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: particleBuffer } },
    ],
  });
  const renderBind = device.createBindGroup({
    layout: renderPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: particleBuffer } },
    ],
  });

  const floats = new Float32Array(8);

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
      floats[1] = u.score;
      floats[2] = u.sets;
      floats[3] = u.pr;
      floats[4] = u.aspect;
      floats[5] = COUNT;
      floats[6] = 0;
      floats[7] = 0;
      device.queue.writeBuffer(uniformBuffer, 0, floats);

      const encoder = device.createCommandEncoder();
      const cpass = encoder.beginComputePass();
      cpass.setPipeline(computePipeline);
      cpass.setBindGroup(0, computeBind);
      cpass.dispatchWorkgroups(Math.ceil(COUNT / 64));
      cpass.end();

      const view = context.getCurrentTexture().createView();
      const rpass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view,
            clearValue: { r: 0.039, g: 0.051, b: 0.071, a: 0 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      });
      rpass.setPipeline(renderPipeline);
      rpass.setBindGroup(0, renderBind);
      rpass.draw(COUNT);
      rpass.end();
      device.queue.submit([encoder.finish()]);
    },
    destroy() {
      uniformBuffer.destroy();
      particleBuffer.destroy();
      device.destroy();
    },
  };
}
