"use client";

import React, { useState } from "react";
import { 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Cpu, 
  MessageSquare, 
  Layers,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export function LiveArchitectureSandbox() {
  const [activePipeline, setActivePipeline] = useState<"broker" | "zerotrust">("broker");
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [packetPosition, setPacketPosition] = useState<number>(0);
  const [telemetry, setTelemetry] = useState({
    latency: "38ms",
    status: "HEALTHY",
    throughput: "14.2k req/s",
    dlpViolations: "0 BLOCKED",
    securityHash: "ed25519:9f8a...4b1",
  });

  const triggerPacketFlow = () => {
    if (isTransmitting) return;
    setIsTransmitting(true);
    setActiveStep(1);
    setPacketPosition(12);

    setTimeout(() => {
      setActiveStep(2);
      setPacketPosition(37);
      setTelemetry((prev) => ({ ...prev, latency: "21ms", throughput: "15.8k req/s" }));
    }, 600);

    setTimeout(() => {
      setActiveStep(3);
      setPacketPosition(62);
      setTelemetry((prev) => ({ ...prev, latency: "34ms" }));
    }, 1300);

    setTimeout(() => {
      setActiveStep(4);
      setPacketPosition(88);
      setTelemetry((prev) => ({ ...prev, latency: "41ms", status: "VERIFIED" }));
    }, 2000);

    setTimeout(() => {
      setIsTransmitting(false);
      setPacketPosition(100);
      setTimeout(() => {
        setPacketPosition(0);
        setActiveStep(0);
      }, 800);
    }, 2800);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-[0_20px_70px_rgba(0,0,0,0.6)] relative overflow-hidden">
      {/* Luz ambiente local (Backlight glow) */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#1856FF]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#07CA6B]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header do Sandbox */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#07CA6B] animate-ping" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#38BDF8]">
              LIVE ARCHITECTURE SANDBOX // PRODUCTION REPLICA
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Pipeline Distribuído & Roteamento de IA em Tempo Real
          </h3>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-xl">
            Simulação interativa da infraestrutura desenvolvida no Banco Safra: desacoplamento de canais multimodais, filtros de DLP, malha Zero Trust com tokens assinados e orquestração MCP.
          </p>
        </div>

        {/* Botão de Disparo */}
        <div className="flex items-center gap-3">
          <button
            onClick={triggerPacketFlow}
            disabled={isTransmitting}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-lg ${
              isTransmitting
                ? "bg-white/10 text-white/50 cursor-not-allowed border border-white/10"
                : "bg-gradient-to-r from-[#1856FF] to-[#38BDF8] hover:opacity-90 text-white cursor-pointer shadow-[0_0_25px_rgba(24,86,255,0.4)]"
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isTransmitting ? "animate-spin" : "fill-current"}`} />
            <span>{isTransmitting ? "Propagando Pulso..." : "Transmitir Payload"}</span>
          </button>
        </div>
      </div>

      {/* PIPELINE VISUAL COM CABO DE FIBRA E PULSO DE LUZ */}
      <div className="my-8 relative z-10">
        <div className="relative">
          {/* Trilha de fibra ótica de fundo */}
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
            {/* Feixe de luz viajando durante a transmissão */}
            {isTransmitting && (
              <div
                className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-[#38BDF8] to-white rounded-full shadow-[0_0_15px_#38BDF8] transition-all duration-300"
                style={{ left: `${packetPosition}%`, transform: "translateX(-50%)" }}
              />
            )}
          </div>

          {/* 4 Estágios do Pipeline como Placas de Vidro Iluminadas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {/* Estágio 1: Canais de Entrada */}
            <div
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                activeStep === 1
                  ? "glass-panel bg-[#1856FF]/25 border-[#38BDF8] shadow-[0_0_30px_rgba(56,189,248,0.4)] -translate-y-1"
                  : "bg-white/[0.03] border-white/10 text-white/70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase text-[#38BDF8]">
                  01 // INGRESS
                </span>
                <MessageSquare className="w-4 h-4 text-[#38BDF8]" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Multi-Channel Ingress
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                WhatsApp Cloud (Meta COEX), Telegram & Webhooks corporativos.
              </p>
              <div className="mt-3 text-[10px] font-mono px-2 py-1 rounded bg-black/40 text-white/60 inline-block">
                HTTP/2 • Webhooks
              </div>
            </div>

            {/* Estágio 2: Broker Agnóstico & DLP */}
            <div
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                activeStep === 2
                  ? "glass-panel bg-purple-500/25 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.4)] -translate-y-1"
                  : "bg-white/[0.03] border-white/10 text-white/70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase text-purple-400">
                  02 // BROKER & DLP
                </span>
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Agnostic Buffer & DLP
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Desacoplamento em memória, sanitização e barreira contra vazamentos.
              </p>
              <div className="mt-3 text-[10px] font-mono px-2 py-1 rounded bg-black/40 text-purple-300 inline-block">
                Buffer Agnóstico • DLP Ativo
              </div>
            </div>

            {/* Estágio 3: Zero Trust M2M */}
            <div
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                activeStep === 3
                  ? "glass-panel bg-[#07CA6B]/25 border-[#07CA6B] shadow-[0_0_30px_rgba(7,202,107,0.4)] -translate-y-1"
                  : "bg-white/[0.03] border-white/10 text-white/70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase text-[#07CA6B]">
                  03 // ZERO TRUST
                </span>
                <ShieldCheck className="w-4 h-4 text-[#07CA6B]" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">
                M2M Cryptographic Mesh
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Tokens assinados por microsserviço e validação RBAC no Active Directory.
              </p>
              <div className="mt-3 text-[10px] font-mono px-2 py-1 rounded bg-black/40 text-[#07CA6B] inline-block">
                Tokens Ed25519 • mTLS
              </div>
            </div>

            {/* Estágio 4: MCP Dispatcher & LLMs */}
            <div
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                activeStep === 4
                  ? "glass-panel bg-sky-500/25 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.4)] -translate-y-1"
                  : "bg-white/[0.03] border-white/10 text-white/70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase text-sky-400">
                  04 // AI EXECUTION
                </span>
                <Cpu className="w-4 h-4 text-sky-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">
                MCP Tools & LLM Routing
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Invocação de biometria facial, listas dinâmicas e retorno transacional.
              </p>
              <div className="mt-3 text-[10px] font-mono px-2 py-1 rounded bg-black/40 text-sky-300 inline-block">
                Model Context Protocol
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD DE TELEMETRIA EM TEMPO REAL */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-white/10 relative z-10 font-mono text-xs">
        <div className="p-3 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[10px] text-[#94A3B8]">LATÊNCIA DE FLUXO</div>
          <div className="text-base font-bold text-white mt-0.5">{telemetry.latency}</div>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[10px] text-[#94A3B8]">VAZAMENTOS (DLP)</div>
          <div className="text-base font-bold text-[#07CA6B] mt-0.5">{telemetry.dlpViolations}</div>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[10px] text-[#94A3B8]">STATUS DA MALHA</div>
          <div className="text-base font-bold text-[#38BDF8] mt-0.5">{telemetry.status}</div>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[10px] text-[#94A3B8]">THROUGHPUT TRANSACIONAL</div>
          <div className="text-base font-bold text-white mt-0.5">{telemetry.throughput}</div>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-[#94A3B8]">CHAVE M2M ATIVA</div>
          <div className="text-xs font-bold text-purple-300 mt-1 truncate">{telemetry.securityHash}</div>
        </div>
      </div>
    </div>
  );
}
