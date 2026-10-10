"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface CyberAtmosphereProps {
  className?: string;
}

export function CyberpunkNeuralGrid({ className = "" }: CyberAtmosphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Cena e Câmera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. NEON LIGHT LEAKS NO EIXO Z NEGATIVO (Conforme Linha 8 do Documento)
    // Gradientes profundos volumétricos que iluminam o vidro sem agressividade
    const createAmbientGlowMesh = (colorHex: number, radius: number, x: number, y: number, z: number) => {
      const geo = new THREE.PlaneGeometry(radius, radius);
      const cvs = document.createElement("canvas");
      cvs.width = 128;
      cvs.height = 128;
      const ctx = cvs.getContext("2d");
      if (ctx) {
        const rad = 64;
        const col = new THREE.Color(colorHex);
        const grad = ctx.createRadialGradient(rad, rad, 0, rad, rad, rad);
        grad.addColorStop(0, `rgba(${col.r * 255}, ${col.g * 255}, ${col.b * 255}, 0.28)`);
        grad.addColorStop(0.5, `rgba(${col.r * 255}, ${col.g * 255}, ${col.b * 255}, 0.08)`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
      }
      const tex = new THREE.CanvasTexture(cvs);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      return mesh;
    };

    // Orbe Electric Blue principal (#1856FF)
    const blueLeak = createAmbientGlowMesh(0x1856ff, 180, -45, 20, -50);
    scene.add(blueLeak);

    // Orbe Deep Plum / Ameixa (#3A344E)
    const plumLeak = createAmbientGlowMesh(0x3a344e, 220, 50, -30, -60);
    scene.add(plumLeak);

    // Toque sutil de Cyan (#38BDF8)
    const cyanLeak = createAmbientGlowMesh(0x38bdf8, 140, 20, 45, -45);
    scene.add(cyanLeak);

    // 2. MALHA TOPOLÓGICA DE CIRCUITO SUAVE E ESTÁVEL (Sem linhas vindo na cara)
    // Uma malha estática calma com respiração lenta no fundo
    const circuitPoints: THREE.Vector3[] = [];
    const step = 20;
    for (let x = -100; x <= 100; x += step) {
      circuitPoints.push(new THREE.Vector3(x, -60, -20));
      circuitPoints.push(new THREE.Vector3(x, 60, -20));
    }
    for (let y = -60; y <= 60; y += step) {
      circuitPoints.push(new THREE.Vector3(-100, y, -20));
      circuitPoints.push(new THREE.Vector3(100, y, -20));
    }

    const circuitGeo = new THREE.BufferGeometry().setFromPoints(circuitPoints);
    const circuitMat = new THREE.LineBasicMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.22,
    });
    const circuitMesh = new THREE.LineSegments(circuitGeo, circuitMat);
    scene.add(circuitMesh);

    // 3. Resposta suave ao mouse (Apenas parallax elegante de profundidade)
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

    // 4. Laço Cinematográfico Suave (Respiração Orgânica de Luz)
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Lerp calmo de câmera
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.02;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.02;

      camera.position.x = mouseRef.current.x * 6;
      camera.position.y = mouseRef.current.y * 4;
      camera.lookAt(0, 0, 0);

      // Respiração lenta e sutil dos orbes de luz (sem tremedeira, sem nada vindo na cara)
      blueLeak.position.x = -45 + Math.sin(time * 0.3) * 6;
      blueLeak.position.y = 20 + Math.cos(time * 0.25) * 4;

      plumLeak.position.x = 50 + Math.cos(time * 0.2) * 8;
      plumLeak.position.y = -30 + Math.sin(time * 0.3) * 5;

      cyanLeak.scale.setScalar(1 + Math.sin(time * 0.4) * 0.08);

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
