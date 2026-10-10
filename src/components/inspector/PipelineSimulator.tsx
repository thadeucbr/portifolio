"use client";

import React, { useState } from "react";
import { SystemProject } from "@/data/systems";
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  ShieldAlert, 
  Cpu, 
  ArrowRight,
  Zap,
  Lock,
  Layers
} from "lucide-react";

interface PipelineSimulatorProps {
  system: SystemProject;
}

export function PipelineSimulator({ system }: PipelineSimulatorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentStep(1);
    setLogs([`[0.00ms] INBOUND: Recebido payload assíncrono via Meta Cloud Webhook (ID: 0x9f4a1)`]);

    setTimeout(() => {
      setCurrentStep(2);
      setLogs((prev) => [
        ...prev,
        `[12.4ms] DLP SANITIZER: Análise de conformidade executada. 0 vazamentos de dados detectados.`,
      ]);
    }, 700);

    setTimeout(() => {
      setCurrentStep(3);
      setLogs((prev) => [
        ...prev,
        `[24.8ms] ZERO TRUST M2M: Token criptográfico Ed25519 assinado verificado com sucesso contra AD.`,
      ]);
    }, 1400);

    setTimeout(() => {
      setCurrentStep(4);
      setLogs((prev) => [
        ...prev,
        `[38.2ms] MCP DISPATCHER: Invocação de ferramenta dinâmica aprovada. Roteado para o ecossistema de modelos de IA.`,
        `[42.1ms] COMPLETED: Transação concluída com sucesso em 42ms (Latência nominal < 45ms).`,
      ]);
      setIsRunning(false);
    }, 2200);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setLogs([]);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-white font-semibold">Simulador de Tráfego em Tempo Real</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
              isRunning
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : "bg-[#1856FF] hover:bg-[#1856FF]/90 text-white shadow-md cursor-pointer"
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Disparar Payload</span>
          </button>
          <button
            onClick={resetSimulation}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Resetar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Nós do Pipeline Interativo com Status Visual */}
      <div className="grid grid-cols-4 gap-2">
        <div
          className={`p-3 rounded-xl border transition-all ${
            currentStep >= 1
              ? "bg-[#1856FF]/20 border-[#1856FF] text-[#38BDF8]"
              : "bg-black/30 border-white/5 text-white/40"
          }`}
        >
          <div className="text-[10px] uppercase font-bold">1. Inbound</div>
          <div className="text-[11px] truncate mt-1">Multi-Channel</div>
        </div>

        <div
          className={`p-3 rounded-xl border transition-all ${
            currentStep >= 2
              ? "bg-purple-500/20 border-purple-400 text-purple-300"
              : "bg-black/30 border-white/5 text-white/40"
          }`}
        >
          <div className="text-[10px] uppercase font-bold">2. DLP Filter</div>
          <div className="text-[11px] truncate mt-1">Sanitização</div>
        </div>

        <div
          className={`p-3 rounded-xl border transition-all ${
            currentStep >= 3
              ? "bg-[#07CA6B]/20 border-[#07CA6B] text-[#07CA6B]"
              : "bg-black/30 border-white/5 text-white/40"
          }`}
        >
          <div className="text-[10px] uppercase font-bold">3. Zero Trust</div>
          <div className="text-[11px] truncate mt-1">Token M2M</div>
        </div>

        <div
          className={`p-3 rounded-xl border transition-all ${
            currentStep >= 4
              ? "bg-sky-500/20 border-sky-400 text-sky-300"
              : "bg-black/30 border-white/5 text-white/40"
          }`}
        >
          <div className="text-[10px] uppercase font-bold">4. MCP Agent</div>
          <div className="text-[11px] truncate mt-1">Inferência</div>
        </div>
      </div>

      {/* Terminal de Logs de Execução em Dark Glass */}
      <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 h-36 overflow-y-auto space-y-1">
        {logs.length === 0 ? (
          <div className="text-white/30 italic text-center py-8">
            Clique em &quot;Disparar Payload&quot; para ver o trajeto de validação distribuída.
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="text-white/80 leading-relaxed">
              <span className="text-[#38BDF8]">❯</span> {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
