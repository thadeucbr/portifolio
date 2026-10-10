"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface SynapticFieldProps {
  className?: string;
  onSynapseFired?: (neuronId: number) => void;
}

export function SynapticNeuralMesh({ className = "" }: SynapticFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Cena, Câmera e Renderizador
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060810, 0.002);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 180;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. NEURAL NODES (Neurônios e Pesos Sinápticos no Espaço)
    const nodeCount = 95;
    const nodes: THREE.Vector3[] = [];
    const nodeVelocities: THREE.Vector3[] = [];
    const nodeColors = new Float32Array(nodeCount * 3);

    const primaryBlue = new THREE.Color(0x1856ff);
    const accentCyan = new THREE.Color(0x38bdf8);
    const successGreen = new THREE.Color(0x07ca6b);
    const plumSecondary = new THREE.Color(0x3a344e);

    for (let i = 0; i < nodeCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 320,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 120
      );
      nodes.push(pos);
      nodeVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.18,
          (Math.random() - 0.5) * 0.18,
          (Math.random() - 0.5) * 0.1
        )
      );

      const rnd = Math.random();
      const col = rnd > 0.6 ? primaryBlue : rnd > 0.3 ? accentCyan : rnd > 0.1 ? successGreen : plumSecondary;
      nodeColors[i * 3] = col.r;
      nodeColors[i * 3 + 1] = col.g;
      nodeColors[i * 3 + 2] = col.b;
    }

    // Geometria de Pontos dos Neurônios com textura circular suave
    const nodeGeo = new THREE.BufferGeometry();
    const nodePosArr = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      nodePosArr[i * 3] = nodes[i].x;
      nodePosArr[i * 3 + 1] = nodes[i].y;
      nodePosArr[i * 3 + 2] = nodes[i].z;
    }
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePosArr, 3));
    nodeGeo.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));

    // Sprite do Neurônio
    const cvs = document.createElement("canvas");
    cvs.width = 64;
    cvs.height = 64;
    const ctx = cvs.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.25, "rgba(56,189,248,0.9)");
      g.addColorStop(0.65, "rgba(24,86,255,0.3)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.fill();
    }
    const nodeTex = new THREE.CanvasTexture(cvs);

    const nodeMat = new THREE.PointsMaterial({
      size: 5.5,
      map: nodeTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodePoints);

    // 2. SINAPSES DINÂMICAS (Conexões Axonais por Distância)
    const maxConnections = (nodeCount * (nodeCount - 1)) / 2;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineColors = new Float32Array(maxConnections * 6);

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });

    const synapseLines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(synapseLines);

    // 3. PULSOS SINÁPTICOS (Spike Action Potentials viajando pelos axônios)
    const spikeCount = 35;
    const spikePositions = new Float32Array(spikeCount * 3);
    const spikeGeo = new THREE.BufferGeometry();
    spikeGeo.setAttribute("position", new THREE.BufferAttribute(spikePositions, 3));

    const spikeMat = new THREE.PointsMaterial({
      size: 6.5,
      map: nodeTex,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const spikePoints = new THREE.Points(spikeGeo, spikeMat);
    scene.add(spikePoints);

    // Dados de trajetória de cada pulso
    const spikes = Array.from({ length: spikeCount }, () => ({
      from: Math.floor(Math.random() * nodeCount),
      to: Math.floor(Math.random() * nodeCount),
      progress: Math.random(),
      speed: 0.008 + Math.random() * 0.014,
    }));

    // 4. Mouse e Parallax
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current.targetX = (x / rect.width) * 2 - 1;
      mouseRef.current.targetY = -(y / rect.height) * 2 + 1;
    };

    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);

    // 5. Laço de Simulação da Rede Neural
    let animId: number;
    const clock = new THREE.Clock();
    const connectionThreshold = 65; // Distância máxima para disparar axônio

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Parallax sutil ao mouse
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.03;

      camera.position.x = mouseRef.current.x * 12;
      camera.position.y = mouseRef.current.y * 8;
      camera.lookAt(0, 0, 0);

      // Atualização dos nós neurais com micro-oscilação harmônica
      const curPosArr = nodeGeo.attributes.position.array as Float32Array;
      const mouseWorldX = mouseRef.current.x * 150;
      const mouseWorldY = mouseRef.current.y * 90;

      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];
        const vel = nodeVelocities[i];

        node.add(vel);

        // Limites da câmara neural
        if (Math.abs(node.x) > 160) vel.x *= -1;
        if (Math.abs(node.y) > 100) vel.y *= -1;
        if (Math.abs(node.z) > 60) vel.z *= -1;

        // Repulsão suave do cursor sobre a sinapse
        const dx = node.x - mouseWorldX;
        const dy = node.y - mouseWorldY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 3600 && distSq > 0) {
          const force = (1 - Math.sqrt(distSq) / 60) * 0.4;
          node.x += (dx / Math.sqrt(distSq)) * force;
          node.y += (dy / Math.sqrt(distSq)) * force;
        }

        curPosArr[i * 3] = node.x;
        curPosArr[i * 3 + 1] = node.y;
        curPosArr[i * 3 + 2] = node.z;
      }
      nodeGeo.attributes.position.needsUpdate = true;

      // Recálculo dinâmico das sinapses (Linhas conectando neurônios próximos)
      let lineIdx = 0;
      let colorIdx = 0;
      const lPos = lineGeo.attributes.position.array as Float32Array;
      const lCol = lineGeo.attributes.color.array as Float32Array;

      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dist = n1.distanceTo(n2);

          if (dist < connectionThreshold) {
            const alpha = 1 - dist / connectionThreshold;

            lPos[lineIdx++] = n1.x;
            lPos[lineIdx++] = n1.y;
            lPos[lineIdx++] = n1.z;

            lPos[lineIdx++] = n2.x;
            lPos[lineIdx++] = n2.y;
            lPos[lineIdx++] = n2.z;

            // Gradiente sináptico
            lCol[colorIdx++] = 0.09 * alpha;
            lCol[colorIdx++] = 0.34 * alpha;
            lCol[colorIdx++] = 1.0 * alpha;

            lCol[colorIdx++] = 0.22 * alpha;
            lCol[colorIdx++] = 0.74 * alpha;
            lCol[colorIdx++] = 0.97 * alpha;
          }
        }
      }

      lineGeo.setDrawRange(0, lineIdx / 3);
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate = true;

      // Atualização dos Pulsos Sinápticos (Action Potentials)
      const spkPos = spikeGeo.attributes.position.array as Float32Array;
      for (let s = 0; s < spikeCount; s++) {
        const spike = spikes[s];
        spike.progress += spike.speed;

        if (spike.progress >= 1) {
          spike.progress = 0;
          spike.from = Math.floor(Math.random() * nodeCount);
          // Escolhe um vizinho conectado
          const fromNode = nodes[spike.from];
          let closest = (spike.from + 1) % nodeCount;
          let minDist = 999;
          for (let k = 0; k < nodeCount; k++) {
            if (k !== spike.from) {
              const d = fromNode.distanceTo(nodes[k]);
              if (d < connectionThreshold && d < minDist) {
                minDist = d;
                closest = k;
              }
            }
          }
          spike.to = closest;
        }

        const p1 = nodes[spike.from];
        const p2 = nodes[spike.to];

        spkPos[s * 3] = p1.x + (p2.x - p1.x) * spike.progress;
        spkPos[s * 3 + 1] = p1.y + (p2.y - p1.y) * spike.progress;
        spkPos[s * 3 + 2] = p1.z + (p2.z - p1.z) * spike.progress;
      }
      spikeGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
}
