"use client";

import { useState } from "react";
import { Cpu, Layers, MessageSquare, ShieldCheck } from "lucide-react";
import { SYSTEMS_DATA } from "@/data/systems";

type ScenarioType = "normal" | "meta_outage" | "dlp_violation" | "pix_spike" | "unauthorized_m2m";
type ScenarioLevel = "info" | "warn" | "error" | "success";

const SCENARIOS: Record<ScenarioType, {
  title: string;
  subtitle: string;
  projectId: string;
  messages: Array<{ level: ScenarioLevel; message: string }>;
}> = {
  normal: {
    title: "Fluxo Nominal",
    subtitle: "Idempotência & Backpressure",
    projectId: "ai-messaging-broker",
    messages: [
      { level: "info", message: "Topologia distribuída com particionamento de tópicos e processamento assíncrono não bloqueante." },
      { level: "info", message: "Idempotência garantida via Correlation ID e chaves deduplicadas para neutralizar reenvios duplicados." },
      { level: "success", message: "Conexões ativas saudáveis, consumo equilibrado de mensagens e telemetria dentro dos SLOs esperados." },
    ],
  },
  meta_outage: {
    title: "Falha de Canal Externo",
    subtitle: "Circuit Breaker & DLQ",
    projectId: "ai-messaging-broker",
    messages: [
      { level: "warn", message: "Detecção de falhas consecutivas e elevação abrupta de latência na API externa (> 2.5s)." },
      { level: "error", message: "Disparo de Circuit Breaker: abertura do circuito para evitar retenção de threads e efeito cascata." },
      { level: "success", message: "Roteamento assíncrono para Dead Letter Queue (DLQ) com backoff exponencial + jitter e comutação para canal secundário." },
    ],
  },
  dlp_violation: {
    title: "Detecção & Higienização DLP",
    subtitle: "Sanitização & Custódia",
    projectId: "governance-dlp",
    messages: [
      { level: "warn", message: "Detecção em tempo real de dados restritos (CPF, cartões e tokens sensíveis) no corpo da mensagem." },
      { level: "info", message: "Sanitização e mascaramento irreversível em memória antes de qualquer gravação em banco ou log." },
      { level: "success", message: "Geração de hash de custódia imutável para auditoria e bloqueio preventivo de vazamento na borda." },
    ],
  },
  unauthorized_m2m: {
    title: "Zero Trust M2M",
    subtitle: "mTLS & Validação RBAC",
    projectId: "zero-trust-mesh",
    messages: [
      { level: "warn", message: "Tentativa de chamada service-to-service com assinatura ausente, expirada ou escopo inadequado." },
      { level: "error", message: "Rejeição imediata pelo policy engine de segurança (HTTP 403 Forbidden) antes de tocar no core." },
      { level: "success", message: "Isolamento do chamador não autenticado e registro de evento de segurança na trilha de auditoria." },
    ],
  },
  pix_spike: {
    title: "Pico Transacional",
    subtitle: "Token Bucket & Bulkhead",
    projectId: "pix-ai-engine",
    messages: [
      { level: "warn", message: "Surto repentino de concorrência transacional ultrapassando a vazão normal do gateway." },
      { level: "info", message: "Ativação de isolamento por Bulkhead e controle de taxa adaptativo via algoritmo Token Bucket." },
      { level: "success", message: "Degradação graciosa: pagamentos prioritários processados sem indisponibilizar serviços satélites." },
    ],
  },
};

const SCENARIO_ORDER: ScenarioType[] = ["normal", "meta_outage", "dlp_violation", "unauthorized_m2m", "pix_spike"];
const PROJECT_ICONS = [MessageSquare, ShieldCheck, Layers, Cpu];
const LEVEL_STYLE: Record<ScenarioLevel, string> = {
  info: "border-[#1856FF]/30 bg-[#1856FF]/10 text-[#38BDF8]",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  error: "border-red-500/30 bg-red-500/10 text-red-200",
  success: "border-[#07CA6B]/30 bg-[#07CA6B]/10 text-[#07CA6B]",
};

export function SystemResilienceWorkbench() {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("normal");
  const scenario = SCENARIOS[activeScenario];
  const projects = SYSTEMS_DATA.filter((project) => project.id !== "edge-mcp-hub");

  return (
    <section className="flex h-full w-full flex-col gap-4 p-4 animate-in fade-in duration-300 sm:gap-5 sm:p-8">
      <header className="flex flex-col justify-between gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#38BDF8]">ARQUITETURA DISTRIBUÍDA · TOLERÂNCIA A FALHAS</div>
          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Engenharia e resiliência</h2>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-white/55">Padrões de engenharia para contenção de falhas, proteção de infraestrutura downstream e garantia de disponibilidade sob estresse.</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#07CA6B]/30 bg-[#07CA6B]/10 px-3 py-1.5 font-mono text-xs text-[#07CA6B]">PADRÕES ATIVOS</span>
      </header>

      <div className="grid shrink-0 grid-cols-2 gap-2.5 font-mono text-xs sm:grid-cols-3 lg:grid-cols-5">
        {SCENARIO_ORDER.map((id, index) => {
          const item = SCENARIOS[id];
          return (
            <button key={id} onClick={() => setActiveScenario(id)} aria-pressed={activeScenario === id} className={`rounded-2xl border p-3 text-left transition-all ${activeScenario === id ? "border-[#1856FF] bg-[#1856FF]/15 text-white" : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.06]"}`}>
              <span className="text-[11px] uppercase text-[#38BDF8]">CENÁRIO {String(index + 1).padStart(2, "0")}</span>
              <span className="mt-1 block text-sm font-semibold">{item.title}</span>
              <span className="mt-0.5 block text-[11px] text-white/50">{item.subtitle}</span>
            </button>
          );
        })}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="glass-panel rounded-3xl border border-white/15 p-4 sm:p-6 lg:col-span-7" aria-labelledby="experience-themes-title">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <h3 id="experience-themes-title" className="font-mono text-xs font-bold uppercase text-[#38BDF8]">Projetos e Casos Práticos</h3>
            <span className="font-mono text-[11px] text-white/50">TOPOLOGIA E CONTEXTO DE APLICAÇÃO</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {projects.map((project, index) => {
              const Icon = PROJECT_ICONS[index] ?? Layers;
              const isFocused = project.id === scenario.projectId;
              return (
                <article key={project.id} className={`rounded-2xl border p-4 transition-colors ${isFocused ? "border-[#1856FF]/60 bg-[#1856FF]/[0.08]" : "border-white/10 bg-black/20"}`}>
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#38BDF8]" aria-hidden="true" />
                    <div>
                      <span className="font-mono text-[11px] uppercase text-white/70">{project.shortLabel}</span>
                      <h4 className="mt-1 text-sm font-semibold text-white">{project.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-white/60">{project.summary}</p>
                      <span className={`mt-2 inline-block font-mono text-[11px] uppercase ${isFocused ? "text-[#38BDF8]" : "text-white/65"}`}>{isFocused ? "EM FOCO NESTA DEMO" : "EXPERIÊNCIA PROFISSIONAL"}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="glass-panel flex min-h-[280px] flex-col rounded-3xl border border-white/15 p-4 sm:p-6 lg:col-span-5" aria-live="polite">
          <div className="border-b border-white/10 pb-3">
            <span className="font-mono text-[11px] uppercase text-[#07CA6B]">AÇÕES DE RESILIÊNCIA · {scenario.title.toUpperCase()}</span>
            <p className="mt-1 text-xs leading-relaxed text-white/55">Decisões tomadas automaticamente pela camada de arquitetura sob este cenário.</p>
          </div>
          <ul className="mt-3 space-y-2">
            {scenario.messages.map((entry, index) => (
              <li key={`${activeScenario}-${index}`} className={`rounded-xl border p-3 text-xs leading-relaxed ${LEVEL_STYLE[entry.level]}`}>{entry.message}</li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
