"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SystemProject } from "@/data/systems";

interface SpatialCanvasProps {
  systems: SystemProject[];
  selectedId: string | null;
  mode: "zero-g" | "grid" | "orbit";
  onSelectSystem: (id: string) => void;
}

export function SpatialZeroGCanvas({
  systems,
  selectedId,
  mode,
  onSelectSystem,
}: SpatialCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isDown: false });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseVecRef = useRef(new THREE.Vector2());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Cena com Névoa Cósmica e Câmera Perspectiva
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090e, 0.0015);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1500);
    camera.position.set(0, 0, 240);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Luzes de Paleta: Electric Blue (#1856FF) e Deep Plum (#3A344E)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x1856ff, 3, 400);
    blueLight.position.set(-120, 100, 100);
    scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 2, 350);
    cyanLight.position.set(120, -80, 80);
    scene.add(cyanLight);

    // 3. Campo de Partículas Cósmicas (Dust Particles)
    const particleCount = 600;
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);

    const colorBlue = new THREE.Color(0x1856ff);
    const colorCyan = new THREE.Color(0x38bdf8);
    const colorPlum = new THREE.Color(0x3a344e);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      pPositions[idx] = (Math.random() - 0.5) * 600;
      pPositions[idx + 1] = (Math.random() - 0.5) * 450;
      pPositions[idx + 2] = (Math.random() - 0.5) * 350;

      const rnd = Math.random();
      const c = rnd > 0.6 ? colorBlue : rnd > 0.3 ? colorCyan : colorPlum;
      pColors[idx] = c.r;
      pColors[idx + 1] = c.g;
      pColors[idx + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pColors, 3));

    // Texture circular suave
    const cvs = document.createElement("canvas");
    cvs.width = 32;
    cvs.height = 32;
    const ctx = cvs.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.3, "rgba(56,189,248,0.8)");
      g.addColorStop(0.8, "rgba(24,86,255,0.2)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    const pTex = new THREE.CanvasTexture(cvs);

    const pMat = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      map: pTex,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleField = new THREE.Points(pGeo, pMat);
    scene.add(particleField);

    // 4. Criação dos Nós 3D Espaciais de Sistemas (Zero-G Monoliths)
    const nodeMeshes: THREE.Group[] = [];
    const nodeVelocities: THREE.Vector3[] = [];
    const nodeTargets: THREE.Vector3[] = [];

    // Criação dos monolitos de vidro 3D para cada sistema
    systems.forEach((system, index) => {
      const group = new THREE.Group();
      group.userData = { id: system.id, index, title: system.title, sourceLabel: system.sourceLabel };

      // Monolito Principal (Vidro Translúcido com Bordas de Luz)
      const boxGeo = new THREE.BoxGeometry(32, 22, 4);
      const boxMat = new THREE.MeshPhysicalMaterial({
        color: 0x0a1020,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.85, // Propriedade óptica de vidro
        thickness: 2,
        transparent: true,
        opacity: 0.85,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      group.add(boxMesh);

      // Light Catcher Wireframe (Borda capturadora de luz)
      const edgeGeo = new THREE.EdgesGeometry(boxGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7,
      });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      group.add(edges);

      // Núcleo Quântico do Monolito (Glowing Core)
      const coreGeo = new THREE.SphereGeometry(3, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: index === 0 ? 0x1856ff : index === 1 ? 0x07ca6b : 0x38bdf8,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.set(0, 0, 2.5);
      group.add(coreMesh);

      // Halo Pulsante em volta do Core
      const haloGeo = new THREE.RingGeometry(4.5, 6, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x1856ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(0, 0, 2.6);
      group.add(halo);

      // Posição orbital inicial no espaço
      const angle = (index / systems.length) * Math.PI * 2;
      const radius = 75;
      group.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * (radius * 0.6),
        (Math.random() - 0.5) * 40
      );

      scene.add(group);
      nodeMeshes.push(group);
      nodeVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.05
        )
      );
      nodeTargets.push(new THREE.Vector3());
    });

    // 5. Linhas de Conexão Neurais entre os Nós da Malha
    const lineGeo = new THREE.BufferGeometry();
    const lineCount = systems.length * (systems.length - 1);
    const linePositions = new Float32Array(lineCount * 3);
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x1856ff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const networkLines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(networkLines);

    // 6. Tratamento de Eventos de Mouse e Raycasting
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseVecRef.current.x = (x / rect.width) * 2 - 1;
      mouseVecRef.current.y = -(y / rect.height) * 2 + 1;

      mouseRef.current.targetX = mouseVecRef.current.x;
      mouseRef.current.targetY = mouseVecRef.current.y;
    };

    const onClick = (e: MouseEvent) => {
      raycasterRef.current.setFromCamera(mouseVecRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        let cur: THREE.Object3D | null = hit.object;
        while (cur && cur.parent && cur.parent !== scene) {
          if (cur.userData?.id) {
            onSelectSystem(cur.userData.id);
            return;
          }
          cur = cur.parent;
        }
        if (cur?.userData?.id) {
          onSelectSystem(cur.userData.id);
          return;
        }
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    container.addEventListener("click", onClick);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);

    // 7. Laço de Renderização Cinemático e Físico
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Lerp da câmera em resposta ao mouse
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      camera.position.x = mouseRef.current.x * 20;
      camera.position.y = mouseRef.current.y * 15;
      camera.lookAt(0, 0, 0);

      // Atualização dos nós 3D segundo o modo selecionado
      nodeMeshes.forEach((mesh, idx) => {
        const vel = nodeVelocities[idx];

        if (mode === "zero-g") {
          // Deriva livre de microgravidade com limites elásticos suaves
          mesh.position.add(vel);
          mesh.rotation.y += 0.003;
          mesh.rotation.x = Math.sin(time * 0.4 + idx) * 0.08;

          // Repulsão de borda cósmica
          if (Math.abs(mesh.position.x) > 130) vel.x *= -1;
          if (Math.abs(mesh.position.y) > 85) vel.y *= -1;
          if (Math.abs(mesh.position.z) > 40) vel.z *= -1;

          // Repulsão ao cursor do mouse no espaço projetado
          const mouseWorldX = mouseRef.current.x * 120;
          const mouseWorldY = mouseRef.current.y * 80;
          const dx = mesh.position.x - mouseWorldX;
          const dy = mesh.position.y - mouseWorldY;
          const distSq = dx * dx + dy * dy;

          if (distSq < 2200 && distSq > 0) {
            const force = (1 - Math.sqrt(distSq) / 50) * 0.8;
            mesh.position.x += (dx / Math.sqrt(distSq)) * force;
            mesh.position.y += (dy / Math.sqrt(distSq)) * force;
          }
        } else if (mode === "orbit") {
          // Alinhamento em anel orbital harmônico
          const angle = (idx / nodeMeshes.length) * Math.PI * 2 + time * 0.15;
          const r = 85;
          nodeTargets[idx].set(Math.cos(angle) * r, Math.sin(angle) * (r * 0.4), Math.sin(time + idx) * 15);
          mesh.position.lerp(nodeTargets[idx], 0.05);
          mesh.rotation.y = -angle;
        } else if (mode === "grid") {
          // Matriz geométrica precisa (Kinetic Grid)
          const cols = 3;
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          nodeTargets[idx].set((col - 1) * 75, (0.5 - row) * 65, 0);
          mesh.position.lerp(nodeTargets[idx], 0.06);
          mesh.rotation.set(0, 0, 0);
        }

        // Destaque visual se estiver selecionado
        const isSel = mesh.userData.id === selectedId;
        const targetScale = isSel ? 1.25 : 1.0;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      });

      // Atualização das linhas de conexão dinâmicas entre nós
      let lineIdx = 0;
      const lPos = lineGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < nodeMeshes.length; i++) {
        for (let j = i + 1; j < nodeMeshes.length; j++) {
          const p1 = nodeMeshes[i].position;
          const p2 = nodeMeshes[j].position;

          lPos[lineIdx++] = p1.x;
          lPos[lineIdx++] = p1.y;
          lPos[lineIdx++] = p1.z;

          lPos[lineIdx++] = p2.x;
          lPos[lineIdx++] = p2.y;
          lPos[lineIdx++] = p2.z;
        }
      }
      lineGeo.attributes.position.needsUpdate = true;

      // Movimentação sutil da poeira cósmica
      particleField.rotation.y = time * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [systems, selectedId, mode, onSelectSystem]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 cursor-crosshair overflow-hidden"
    />
  );
}
