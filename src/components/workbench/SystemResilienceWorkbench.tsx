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
    title: "Visão geral",
    subtitle: "Tópicos curriculares",
    projectId: "ai-messaging-broker",
    messages: [
      { level: "info", message: "Demonstração local: nenhum payload real foi recebido." },
      { level: "success", message: "Os cartões apresentam resumos independentes dos projetos descritos no CV." },
      { level: "info", message: "Nenhuma integração, arquitetura interna ou métrica de produção é consultada." },
    ],
  },
  meta_outage: {
    title: "Indisponibilidade de canal",
    subtitle: "Hipótese didática",
    projectId: "ai-messaging-broker",
    messages: [
      { level: "warn", message: "Cenário hipotético: um canal externo fica indisponível." },
      { level: "info", message: "O CV cita alta resiliência; mecanismo real de contingência não é descrito aqui." },
      { level: "success", message: "Nenhum canal real foi chamado ou afetado." },
    ],
  },
  dlp_violation: {
    title: "Exemplo de governança DLP",
    subtitle: "Regras internas não carregadas",
    projectId: "governance-dlp",
    messages: [
      { level: "warn", message: "Cenário didático: nenhuma mensagem real ou dado bancário está sendo inspecionado." },
      { level: "info", message: "O CV cita políticas DLP e custódia/tráfego seguro de arquivos; as regras internas não são reproduzidas nesta demo." },
      { level: "success", message: "A demonstração não transmite nem persiste payloads deste cenário." },
    ],
  },
  unauthorized_m2m: {
    title: "Autorização M2M",
    subtitle: "Validação conceitual",
    projectId: "zero-trust-mesh",
    messages: [
      { level: "warn", message: "Hipótese didática: uma aplicação tenta acessar um recurso sem autorização." },
      { level: "info", message: "O CV descreve tokens M2M assinados por aplicação e RBAC associado ao Active Directory." },
      { level: "success", message: "Nenhum token, certificado, diretório ou API real foi verificado." },
    ],
  },
  pix_spike: {
    title: "Demanda elevada no canal PIX",
    subtitle: "Sem números de produção",
    projectId: "pix-ai-engine",
    messages: [
      { level: "warn", message: "Cenário hipotético de alta demanda; esta animação não gera carga." },
      { level: "info", message: "O CV descreve um canal PIX baseado em IA e trabalho sob alta demanda transacional." },
      { level: "success", message: "Volume, assertividade e capacidade não são medidos nem estimados nesta demo." },
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
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#38BDF8]">LABORATÓRIO LOCAL · CENÁRIOS DIDÁTICOS</div>
          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Resiliência em contexto curricular</h2>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-white/55">Interações locais baseadas no CV. Não conectam a sistemas internos, não injetam falhas e não medem resultados de produção.</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] text-white/60">SEM INTEGRAÇÕES</span>
      </header>

      <div className="grid shrink-0 grid-cols-2 gap-2.5 font-mono text-xs sm:grid-cols-3 lg:grid-cols-5">
        {SCENARIO_ORDER.map((id, index) => {
          const item = SCENARIOS[id];
          return (
            <button key={id} onClick={() => setActiveScenario(id)} aria-pressed={activeScenario === id} className={`rounded-2xl border p-3 text-left transition-all ${activeScenario === id ? "border-[#1856FF] bg-[#1856FF]/15 text-white" : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.06]"}`}>
              <span className="text-[9px] uppercase text-[#38BDF8]">DEMO {String(index + 1).padStart(2, "0")}</span>
              <span className="mt-1 block text-xs font-semibold">{item.title}</span>
              <span className="mt-0.5 block text-[9px] text-white/45">{item.subtitle}</span>
            </button>
          );
        })}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="glass-panel rounded-3xl border border-white/15 p-4 sm:p-6 lg:col-span-7" aria-labelledby="curriculum-themes-title">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <h3 id="curriculum-themes-title" className="font-mono text-[10px] font-bold uppercase text-[#38BDF8]">Experiências descritas no CV</h3>
            <span className="font-mono text-[9px] text-white/40">PROJETOS INDEPENDENTES · SEM TOPOLOGIA INTERNA</span>
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
                      <span className="font-mono text-[8px] uppercase text-white/40">{project.sourceLabel}</span>
                      <h4 className="mt-1 text-xs font-semibold text-white">{project.title}</h4>
                      <p className="mt-1 text-[10px] leading-relaxed text-white/55">{project.summary}</p>
                      <span className={`mt-2 inline-block font-mono text-[8px] uppercase ${isFocused ? "text-[#38BDF8]" : "text-white/30"}`}>{isFocused ? "EM FOCO NESTA DEMO" : "RESUMO CURRICULAR"}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="glass-panel flex min-h-[280px] flex-col rounded-3xl border border-white/15 p-4 sm:p-6 lg:col-span-5" aria-live="polite">
          <div className="border-b border-white/10 pb-3">
            <span className="font-mono text-[9px] uppercase text-[#07CA6B]">SAÍDA LOCAL · {scenario.title}</span>
            <p className="mt-1 text-[10px] leading-relaxed text-white/45">Mensagens explicativas desta hipótese; não são logs, auditoria ou telemetria de sistemas do banco.</p>
          </div>
          <ul className="mt-3 space-y-2">
            {scenario.messages.map((entry, index) => (
              <li key={`${activeScenario}-${index}`} className={`rounded-xl border p-3 text-[10px] leading-relaxed ${LEVEL_STYLE[entry.level]}`}>{entry.message}</li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
