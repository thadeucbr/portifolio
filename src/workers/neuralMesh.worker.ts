/// <reference lib="webworker" />
// Guideline linhas 46-48, 51-53, 109-120: WebGPURenderer (fallback automático p/ WebGL2),
// materiais em TSL, Bloom em TSL via RenderPipeline e todo o loop isolado num Web Worker
// e Web Workers isolam o loop de renderização via OffscreenCanvas; o FPS deve ser medido por dispositivo/browser.

import * as THREE from "three/webgpu";
import { float, pass, smoothstep, uniform, uv, vec3 } from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { createGlowSpriteCache, glowSpriteCacheKey } from "./glowSpriteCache.mjs";

export type MeshIn =
  | { type: "init"; canvas: OffscreenCanvas; width: number; height: number; dpr: number; reducedMotion: boolean }
  | { type: "resize"; width: number; height: number; dpr: number }
  | { type: "pointer"; x: number; y: number }
  | { type: "pulse"; intensity: number };

export type MeshOut = { type: "backend"; name: "WebGPU" | "WebGL2" } | { type: "error"; message: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

const NODE_COUNT = 95;
const SPIKE_COUNT = 40;
const LINK_DIST = 65;
const BOUNDS = new THREE.Vector3(160, 100, 60);

let renderer: THREE.WebGPURenderer;
let pipeline: THREE.RenderPipeline;
let camera: THREE.PerspectiveCamera;
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
const pulse = uniform(0); // excitação global: sobe quando o agente infere, decai sozinha
let pulseTarget = 0;
let motion = 1;

/** Material TSL de "soma neural": núcleo branco + halo gaussiano, cor por instância. */
function glowMaterial(core: number) {
  const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const d = uv().sub(0.5).length().mul(2); // 0 no centro, 1 na borda
  const halo = smoothstep(float(1), float(0), d).pow(2.2);
  const hot = smoothstep(float(core), float(0), d);
  m.colorNode = vec3(1).mul(halo.add(hot.mul(1.5))).mul(pulse.mul(0.8).add(1));
  m.opacityNode = halo;
  return m;
}

const bakedGlowSpriteCache = createGlowSpriteCache(
  (size) => new OffscreenCanvas(size, size),
  (canvas, { color, size, shadowBlur, opacity }) => {
    if (typeof color !== "number") return;
    const context = canvas.getContext("2d", { alpha: true, desynchronized: true, willReadFrequently: false });
    if (!context) return;
    const rgba = (alpha: number) => `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255}, ${Math.max(0, Math.min(1, alpha))})`;
    const center = size / 2;

    // Bake the expensive diffuse shadow and radial glow once in an isolated 2D buffer.
    context.shadowColor = rgba(opacity * 0.45);
    context.shadowBlur = shadowBlur;
    context.fillStyle = rgba(opacity * 0.35);
    context.beginPath();
    context.arc(center, center, size * 0.2, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;

    const gradient = context.createRadialGradient(center, center, 0, center, center, size * 0.5);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.4})`);
    gradient.addColorStop(0.16, rgba(opacity));
    gradient.addColorStop(0.55, rgba(opacity * 0.6));
    gradient.addColorStop(1, rgba(0));
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(center, center, size * 0.5, 0, Math.PI * 2);
    context.fill();
  },
);
const glowSpriteTextures = new Map<string, THREE.CanvasTexture<OffscreenCanvas>>();

/** Reuses a cached, pre-baked sprite for each ambient light-leak material. */
function orb(hex: number, size: number, x: number, y: number) {
  const spriteParams = { color: hex, size: 512, shadowBlur: 44, opacity: 0.35 };
  const cacheKey = glowSpriteCacheKey(spriteParams);
  let texture = glowSpriteTextures.get(cacheKey);
  if (!texture) {
    const createdTexture = new THREE.CanvasTexture<OffscreenCanvas>(bakedGlowSpriteCache(spriteParams));
    createdTexture.colorSpace = THREE.SRGBColorSpace;
    createdTexture.needsUpdate = true;
    glowSpriteTextures.set(cacheKey, createdTexture);
    texture = createdTexture;
  }
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
  mesh.position.set(x, y, -220);
  return mesh;
}

async function init(msg: Extract<MeshIn, { type: "init" }>) {
  motion = msg.reducedMotion ? 0.25 : 1;

  renderer = new THREE.WebGPURenderer({ canvas: msg.canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(msg.dpr, 2));
  renderer.setSize(msg.width, msg.height, false);
  await renderer.init();

  const backend = (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend ? "WebGPU" : "WebGL2";
  ctx.postMessage({ type: "backend", name: backend } satisfies MeshOut);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060810);

  camera = new THREE.PerspectiveCamera(50, msg.width / msg.height, 0.1, 1000);
  camera.position.z = 180;

  const orbs = [orb(0x1856ff, 420, -170, 90), orb(0x3a344e, 520, 200, -40), orb(0x0ea5e9, 300, 60, -120)];
  orbs.forEach((o) => scene.add(o));

  // Neurônios (instanciados — um draw call)
  const palette = [0x1856ff, 0x38bdf8, 0x07ca6b, 0x3a344e].map((h) => new THREE.Color(h));
  const nodes = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), glowMaterial(0.18), NODE_COUNT);
  const pos: THREE.Vector3[] = [];
  const vel: THREE.Vector3[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    pos.push(new THREE.Vector3((Math.random() - 0.5) * 320, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 120));
    vel.push(new THREE.Vector3((Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * 0.1));
    const r = Math.random();
    nodes.setColorAt(i, palette[r > 0.6 ? 0 : r > 0.3 ? 1 : r > 0.1 ? 2 : 3]);
  }
  nodes.frustumCulled = false;
  scene.add(nodes);

  // Sinapses
  const maxLinks = (NODE_COUNT * (NODE_COUNT - 1)) / 2;
  const linePos = new Float32Array(maxLinks * 6);
  const lineCol = new Float32Array(maxLinks * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3).setUsage(THREE.DynamicDrawUsage));
  lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3).setUsage(THREE.DynamicDrawUsage));
  const lineMat = new THREE.LineBasicNodeMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  scene.add(new THREE.LineSegments(lineGeo, lineMat));

  // Potenciais de ação viajando pelos axônios
  const spikes = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), glowMaterial(0.35), SPIKE_COUNT);
  const cyan = new THREE.Color(0x38bdf8);
  for (let s = 0; s < SPIKE_COUNT; s++) spikes.setColorAt(s, cyan);
  spikes.frustumCulled = false;
  scene.add(spikes);
  const spikeState = Array.from({ length: SPIKE_COUNT }, () => ({
    from: Math.floor(Math.random() * NODE_COUNT),
    to: Math.floor(Math.random() * NODE_COUNT),
    t: Math.random(),
    speed: 0.006 + Math.random() * 0.01,
  }));

  // Pós-processamento em TSL
  pipeline = new THREE.RenderPipeline(renderer);
  const scenePass = pass(scene, camera);
  const color = scenePass.getTextureNode("output");
  pipeline.outputNode = color.add(bloom(color, 0.85, 0.45, 0.05));

  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const clock = new THREE.Timer();

  renderer.setAnimationLoop(() => {
    clock.update();
    const t = clock.getElapsed();
    pulseTarget *= 0.97;
    pulse.value += (pulseTarget - pulse.value) * 0.08;
    const excite = 1 + pulse.value * 2.5;

    mouse.x += (mouse.tx - mouse.x) * 0.03;
    mouse.y += (mouse.ty - mouse.y) * 0.03;
    camera.position.x = mouse.x * 12;
    camera.position.y = mouse.y * 8;
    camera.lookAt(0, 0, 0);

    orbs.forEach((o, i) => {
      o.position.x += Math.sin(t * 0.05 + i * 2) * 0.05 * motion;
      o.position.y += Math.cos(t * 0.04 + i) * 0.04 * motion;
    });

    const mwx = mouse.x * 150;
    const mwy = mouse.y * 90;
    for (let i = 0; i < NODE_COUNT; i++) {
      const p = pos[i];
      p.addScaledVector(vel[i], motion);
      if (Math.abs(p.x) > BOUNDS.x) vel[i].x *= -1;
      if (Math.abs(p.y) > BOUNDS.y) vel[i].y *= -1;
      if (Math.abs(p.z) > BOUNDS.z) vel[i].z *= -1;
      const dx = p.x - mwx;
      const dy = p.y - mwy;
      const d2 = dx * dx + dy * dy;
      if (d2 < 3600 && d2 > 0) {
        const d = Math.sqrt(d2);
        const f = (1 - d / 60) * 0.4;
        p.x += (dx / d) * f;
        p.y += (dy / d) * f;
      }
      sc.setScalar(5.5);
      m4.compose(p, q, sc);
      nodes.setMatrixAt(i, m4);
    }
    nodes.instanceMatrix.needsUpdate = true;

    let li = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const d = pos[i].distanceTo(pos[j]);
        if (d >= LINK_DIST) continue;
        const a = 1 - d / LINK_DIST;
        linePos.set([pos[i].x, pos[i].y, pos[i].z, pos[j].x, pos[j].y, pos[j].z], li);
        lineCol.set([0.09 * a, 0.34 * a, 1.0 * a, 0.22 * a, 0.74 * a, 0.97 * a], li);
        li += 6;
      }
    }
    lineGeo.setDrawRange(0, li / 3);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;

    for (let s = 0; s < SPIKE_COUNT; s++) {
      const sp = spikeState[s];
      sp.t += sp.speed * excite * motion;
      if (sp.t >= 1) {
        sp.t = 0;
        sp.from = sp.to;
        let best = (sp.from + 1) % NODE_COUNT;
        let bd = Infinity;
        for (let k = 0; k < NODE_COUNT; k++) {
          if (k === sp.from) continue;
          const d = pos[sp.from].distanceTo(pos[k]);
          if (d < LINK_DIST && d < bd && Math.random() > 0.3) {
            bd = d;
            best = k;
          }
        }
        sp.to = best;
      }
      tmp.lerpVectors(pos[sp.from], pos[sp.to], sp.t);
      sc.setScalar(6.5);
      m4.compose(tmp, q, sc);
      spikes.setMatrixAt(s, m4);
    }
    spikes.instanceMatrix.needsUpdate = true;

    pipeline.render();
  });
}

ctx.onmessage = (e: MessageEvent<MeshIn>) => {
  const m = e.data;
  if (m.type === "init") {
    init(m).catch((err) => ctx.postMessage({ type: "error", message: (err as Error).message } satisfies MeshOut));
  } else if (m.type === "resize" && renderer) {
    renderer.setPixelRatio(Math.min(m.dpr, 2));
    renderer.setSize(m.width, m.height, false);
    camera.aspect = m.width / m.height;
    camera.updateProjectionMatrix();
  } else if (m.type === "pointer") {
    mouse.tx = m.x;
    mouse.ty = m.y;
  } else if (m.type === "pulse") {
    pulseTarget = Math.min(1, pulseTarget + m.intensity);
  }
};
