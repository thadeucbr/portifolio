"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface CyberpunkGridProps {
  className?: string;
  isGlitching?: boolean;
}

export function CyberpunkNeuralGrid({ className = "", isGlitching = false }: CyberpunkGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Cena, Câmera e Renderizador
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070d, 0.0022);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, -25, 110);
    camera.rotation.x = 0.35; // Ângulo inclinado estilo visualizador cibernético / terminal HUD

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. GRID CIBERNÉTICO DE PISO INFINITO (Cyberpunk Wireframe Plane)
    const gridHelper = new THREE.GridHelper(360, 48, 0x1856ff, 0x1e293b);
    gridHelper.position.y = -42;
    scene.add(gridHelper);

    // 2. GRID CIBERNÉTICO DE TETO (Data-bus Ceil)
    const ceilGrid = new THREE.GridHelper(360, 48, 0x07ca6b, 0x0f172a);
    ceilGrid.position.y = 52;
    ceilGrid.rotation.x = Math.PI;
    scene.add(ceilGrid);

    // 3. FLUXO DE PACOTES DE FIBRA ÓPTICA E PULSOS DE DADOS (Data Highway Pulses)
    const pulseCount = 70;
    const pulseGeo = new THREE.BufferGeometry();
    const pulsePositions = new Float32Array(pulseCount * 3);
    const pulseColors = new Float32Array(pulseCount * 3);

    const cyan = new THREE.Color(0x38bdf8);
    const electricBlue = new THREE.Color(0x1856ff);
    const neonGreen = new THREE.Color(0x07ca6b);
    const neonAmber = new THREE.Color(0xf59e0b);

    for (let i = 0; i < pulseCount; i++) {
      const idx = i * 3;
      pulsePositions[idx] = (Math.random() - 0.5) * 240;
      pulsePositions[idx + 1] = -41.5 + (Math.random() * 2);
      pulsePositions[idx + 2] = (Math.random() - 0.5) * 300;

      const c = Math.random() > 0.6 ? cyan : Math.random() > 0.3 ? neonGreen : electricBlue;
      pulseColors[idx] = c.r;
      pulseColors[idx + 1] = c.g;
      pulseColors[idx + 2] = c.b;
    }

    pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePositions, 3));
    pulseGeo.setAttribute("color", new THREE.BufferAttribute(pulseColors, 3));

    const pulseMat = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const dataPulses = new THREE.Points(pulseGeo, pulseMat);
    scene.add(dataPulses);

    // 4. SCANLINE LASER HORIZONTAL (Cyberpunk Sensor Scan)
    const scanlineGeo = new THREE.BufferGeometry();
    const scanPoints = new Float32Array([
      -180, -41, 0,
       180, -41, 0
    ]);
    scanlineGeo.setAttribute("position", new THREE.BufferAttribute(scanPoints, 3));
    const scanlineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
      linewidth: 2,
    });
    const scanline = new THREE.Line(scanlineGeo, scanlineMat);
    scene.add(scanline);

    // 5. Interação com o Cursor
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

    // 6. Laço de Animação Cyberpunk
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Lerp da câmera com resposta ao mouse
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      camera.position.x = mouseRef.current.x * 15;
      camera.position.y = -25 + mouseRef.current.y * 8;
      camera.rotation.y = -mouseRef.current.x * 0.08;

      // Movimento infinito do grid (Efeito de velocidade cibernética)
      gridHelper.position.z = (time * 18) % 15;
      ceilGrid.position.z = (time * 18) % 15;

      // Varredura da Scanline Laser
      scanline.position.z = Math.sin(time * 0.8) * 90;

      // Movimentação dos pacotes de dados
      const posAttr = pulseGeo.attributes.position as THREE.BufferAttribute;
      const pArr = posAttr.array as Float32Array;
      for (let i = 0; i < pulseCount; i++) {
        const idx = i * 3;
        pArr[idx + 2] += 1.8; // Voando em direção à câmera
        if (pArr[idx + 2] > 120) {
          pArr[idx + 2] = -160;
          pArr[idx] = (Math.random() - 0.5) * 240;
        }
      }
      posAttr.needsUpdate = true;

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
