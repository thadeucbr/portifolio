"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface AntigravityCanvasProps {
  className?: string;
  onSelectNode?: (nodeIndex: number) => void;
}

export function AntigravityCanvas({ className = "" }: AntigravityCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Cena, Câmera e Renderizador
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090e, 0.0018);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 220;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
      const name = "WebGL2 (fallback)";
      (window as Window & { __portfolioRenderBackend?: string }).__portfolioRenderBackend = name;
      window.dispatchEvent(new CustomEvent("neural:backend", { detail: { name } }));
    } catch (error) {
      console.warn("[AntigravityCanvas] WebGL2 indisponível:", error);
      const name = "indisponível (WebGL2)";
      (window as Window & { __portfolioRenderBackend?: string }).__portfolioRenderBackend = name;
      window.dispatchEvent(new CustomEvent("neural:backend", { detail: { name } }));
      return;
    }

    // 2. Campo de Poeira Cósmica & Micro-gravidade (Partículas Quânticas)
    const particleCount = 420;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const primaryColor = new THREE.Color(0x1856ff);
    const secondaryColor = new THREE.Color(0x3a344e);
    const accentCyan = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const x = (Math.random() - 0.5) * 450;
      const y = (Math.random() - 0.5) * 350;
      const z = (Math.random() - 0.5) * 250;

      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;

      originalPositions[idx] = x;
      originalPositions[idx + 1] = y;
      originalPositions[idx + 2] = z;

      velocities[idx] = (Math.random() - 0.5) * 0.15;
      velocities[idx + 1] = (Math.random() - 0.5) * 0.15;
      velocities[idx + 2] = (Math.random() - 0.5) * 0.15;

      // Mistura harmônica de cores inspirada no documento de arquitetura
      const mixed = Math.random();
      const color = mixed > 0.6 ? primaryColor : mixed > 0.25 ? accentCyan : secondaryColor;
      colors[idx] = color.r;
      colors[idx + 1] = color.g;
      colors[idx + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Shader / Material com Sprite Circular Suave (evita renderização dura de pontos)
    const canvasPoint = document.createElement("canvas");
    canvasPoint.width = 32;
    canvasPoint.height = 32;
    const ctx = canvasPoint.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.3, "rgba(255,255,255,0.7)");
      gradient.addColorStop(0.8, "rgba(24,86,255,0.2)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    const pointTexture = new THREE.CanvasTexture(canvasPoint);

    const particleMaterial = new THREE.PointsMaterial({
      size: 3.8,
      vertexColors: true,
      map: pointTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 3. Nó de Gravidade Cósmica Central (Orbe Quântica Representando o Core Zero Trust)
    const coreGeometry = new THREE.IcosahedronGeometry(22, 2);
    const coreWireframe = new THREE.WireframeGeometry(coreGeometry);
    const coreLine = new THREE.LineSegments(
      coreWireframe,
      new THREE.LineBasicMaterial({
        color: 0x1856ff,
        transparent: true,
        opacity: 0.28,
      })
    );
    scene.add(coreLine);

    // Anel Orbital Externo
    const torusGeometry = new THREE.TorusGeometry(38, 0.4, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.rotation.x = Math.PI / 3;
    scene.add(torus);

    // 4. Tratamento de Movimento do Mouse (Repulsão Antigravitacional)
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;

      mouseRef.current.targetX = (clientX / rect.width) * 2 - 1;
      mouseRef.current.targetY = -(clientY / rect.height) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 5. Redimensionamento de Janela
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // 6. Laço Cinemático (Cinemática Baseada em Molas + Campo de Repulsão)
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Interpolação suave do mouse (Spring / Lerp)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Parallax sutil na câmera
      camera.position.x = mouseRef.current.x * 25;
      camera.position.y = mouseRef.current.y * 20;
      camera.lookAt(0, 0, 0);

      // Rotação suave do núcleo
      coreLine.rotation.y = elapsedTime * 0.12;
      coreLine.rotation.x = elapsedTime * 0.08;
      torus.rotation.z = elapsedTime * 0.05;
      torus.rotation.y = elapsedTime * 0.07;

      // Atualização física das partículas com simulação de repulsão
      const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      const mouseWorldX = mouseRef.current.x * 120;
      const mouseWorldY = mouseRef.current.y * 90;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;

        // Deriva de gravidade zero suave
        posArray[idx] += Math.sin(elapsedTime * 0.4 + i) * 0.08;
        posArray[idx + 1] += Math.cos(elapsedTime * 0.35 + i) * 0.08;
        posArray[idx + 2] += Math.sin(elapsedTime * 0.2 + i) * 0.05;

        // Vetor de distância do cursor (Repulsão Antigravidade)
        const dx = posArray[idx] - mouseWorldX;
        const dy = posArray[idx + 1] - mouseWorldY;
        const distSq = dx * dx + dy * dy;

        // Se o mouse estiver perto, repelir
        if (distSq < 3200 && distSq > 0) {
          const force = (1 - Math.sqrt(distSq) / 60) * 1.5;
          posArray[idx] += (dx / Math.sqrt(distSq)) * force * 1.2;
          posArray[idx + 1] += (dy / Math.sqrt(distSq)) * force * 1.2;
        }

        // Tensão de retorno elástica para a posição original (Spring Physics)
        posArray[idx] += (originalPositions[idx] - posArray[idx]) * 0.012;
        posArray[idx + 1] += (originalPositions[idx + 1] - posArray[idx + 1]) * 0.012;
        posArray[idx + 2] += (originalPositions[idx + 2] - posArray[idx + 2]) * 0.012;
      }

      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      particleGeometry.dispose();
      particleMaterial.dispose();
      pointTexture.dispose();
      coreGeometry.dispose();
      coreWireframe.dispose();
      coreLine.material.dispose();
      torusGeometry.dispose();
      torusMaterial.dispose();
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
