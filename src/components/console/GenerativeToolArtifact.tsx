"use client";

import React, { useState } from "react";
import { Check, Copy, Cpu, Database, HardDrive, Layers } from "lucide-react";
import { LOCAL_ACTIONS } from "@/mcp/registry";
import type { LocalActionDefinition } from "@/mcp/registry";
import { SYSTEMS_DATA } from "@/data/systems";
import { useEdgeEmbeddings } from "@/hooks/useEdgeEmbeddings";
import { ProjectFlowDiagram } from "@/components/projects/ProjectFlowDiagram";
import type { PortfolioContactResult, PortfolioMcpTool } from "@/hooks/usePortfolioMcp";

interface McpProjectResult {
  project?: (typeof SYSTEMS_DATA)[number];
  projects?: Array<Pick<(typeof SYSTEMS_DATA)[number], "id" | "sourceLabel" | "title" | "category" | "period" | "summary">>;
  contact?: PortfolioContactResult;
  evidenceStatus?: string;
}

interface GenerativeToolArtifactProps {
  toolName: string;
  systemId: string;
  /** Trecho do currículo recuperado pelo modelo de embeddings que justificou a chamada. */
  evidence?: string;
  source?: "mcp" | "local";
  serverTool?: PortfolioMcpTool;
  serverResult?: McpProjectResult;
}

/** Shows real MCP results; contact submission is separate and consent-gated. */
export function GenerativeToolArtifact({ toolName, systemId, evidence, source = "local", serverTool, serverResult }: GenerativeToolArtifactProps) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"ui" | "contract">("ui");
  const { state } = useEdgeEmbeddings();

  const localTool: LocalActionDefinition | undefined = LOCAL_ACTIONS[toolName];
  const tool = serverTool ?? localTool;
  const system = serverResult?.project ?? (toolName === "portfolio_get_project" ? SYSTEMS_DATA.find((s) => s.id === systemId) : undefined);
  if (!tool) return null;

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(serverTool?.inputSchema ?? localTool?.parameters ?? tool, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const rt = state.runtime;

  return (
    <div className="my-3 rounded-xl border border-white/15 bg-black/40 backdrop-blur-xl overflow-hidden">
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#1856FF]/20 via-white/[0.04] to-transparent border-b border-white/10 flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-white tracking-wider truncate">
          {source === "mcp" ? "MCP tools/call" : "ação local"} → <span className="text-[#38BDF8]">{tool.name}</span>
        </span>
        <div className="flex items-center gap-1.5 font-mono text-[9px] shrink-0">
          {serverTool?.annotations?.readOnlyHint && (
            <span className="px-1.5 py-0.5 rounded bg-[#07CA6B]/10 border border-[#07CA6B]/30 text-[#07CA6B]">readOnly</span>
          )}
          {serverTool?.annotations?.idempotentHint && (
            <span className="px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">idempotent</span>
          )}
          {serverTool?.annotations?.destructiveHint && (
            <span className="px-1.5 py-0.5 rounded bg-[#EA2143]/10 border border-[#EA2143]/30 text-[#EA2143]">destructive</span>
          )}
          <button
            onClick={() => setTab(tab === "ui" ? "contract" : "ui")}
            className="ml-1 px-1.5 py-0.5 rounded bg-white/10 text-white/70 hover:text-white cursor-pointer"
          >
            {tab === "ui" ? "{ schema }" : "UI"}
          </button>
        </div>
      </div>

      {tab === "contract" ? (
        <div className="p-3 bg-black/60 font-mono text-[11px] text-white/80 overflow-x-auto relative">
          <button onClick={copy} className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-white/20 text-white">
            {copied ? <Check className="w-3.5 h-3.5 text-[#07CA6B]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <pre>{JSON.stringify(serverTool?.inputSchema ?? localTool?.parameters ?? tool, null, 2)}</pre>
        </div>
      ) : (
        <div className="p-3.5 space-y-3">
          <p className="font-mono text-[9px] text-white/40">
            {source === "mcp"
              ? `SERVIDOR MCP VERIFICADO · ${serverResult?.evidenceStatus ?? "resultado estruturado"}`
              : "AÇÃO LOCAL COM CONSENTIMENTO EXPLÍCITO"}
          </p>
          {evidence && (
            <div className="text-[11px] leading-relaxed text-white/75 border-l-2 border-[#1856FF] pl-2.5">
              <span className="font-mono text-[9px] text-white/40 block">EVIDÊNCIA RECUPERADA DO CURRÍCULO</span>
              {evidence}
            </div>
          )}

          {toolName === "portfolio_request_contact" && serverResult?.contact && (
            <div className={`rounded-lg border p-3 ${serverResult.contact.status === "accepted" ? "border-[#07CA6B]/30 bg-[#07CA6B]/[0.06]" : "border-white/15 bg-black/20"}`}>
              <span className="font-mono text-[9px] uppercase text-white/45">RESULTADO DA ELICITATION</span>
              <p className="mt-1 text-xs text-white/85">{serverResult.contact.message}</p>
              {serverResult.contact.receiptId && (
                <span className="mt-2 block font-mono text-[9px] text-[#07CA6B]">recibo · {serverResult.contact.receiptId}</span>
              )}
            </div>
          )}

          {toolName === "portfolio_list_projects" && serverResult?.projects && (
            <div className="space-y-2" aria-label="Projetos retornados pelo servidor MCP">
              <span className="font-mono text-[9px] uppercase text-[#38BDF8]">Índice estático retornado pelo servidor MCP</span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {serverResult.projects.map((project) => (
                  <li key={project.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-white">{project.title}</span>
                      <span className="font-mono text-[8px] text-white/40">{project.period}</span>
                    </div>
                    <span className="font-mono text-[9px] text-[#38BDF8]/80">{project.sourceLabel} · {project.category}</span>
                    <p className="mt-1 text-[10px] leading-relaxed text-white/55">{project.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {systemId === "edge-mcp-hub" && toolName === "portfolio_get_project" && (
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              {[
                { icon: Layers, k: "modelo", v: rt?.model ?? "carregando…" },
                { icon: Cpu, k: "backend", v: rt ? `${rt.device.toUpperCase()} · ${rt.dtype}` : state.phase },
                { icon: Database, k: "índice", v: rt ? `${rt.chunks} trechos × ${rt.dims} dims` : "—" },
                {
                  icon: HardDrive,
                  k: "Cache API",
                  v: rt ? (rt.warmCache ? "hit (pesos do disco)" : "miss (1º download)") : "—",
                },
                { icon: Cpu, k: "load", v: rt ? `${Math.round(rt.loadMs)} ms` : "—" },
                { icon: Database, k: "indexação", v: rt ? `${Math.round(rt.indexMs)} ms` : "—" },
              ].map(({ icon: Icon, k, v }) => (
                <div key={k} className="p-2 rounded bg-white/[0.06] border border-white/10">
                  <span className="text-white/40 text-[9px] uppercase flex items-center gap-1">
                    <Icon className="w-3 h-3" /> {k}
                  </span>
                  <span className="text-white break-all">{v}</span>
                </div>
              ))}
            </div>
          )}

          {system && systemId !== "edge-mcp-hub" && (
            <>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                {system.facts.slice(0, 3).map((m) => (
                  <div key={m.label} className="p-2 rounded-lg bg-white/[0.06] border border-white/10">
                    <div className="text-[9px] text-white/45 uppercase">{m.label}</div>
                    <div className="text-[#38BDF8] font-bold text-xs mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>

              <ProjectFlowDiagram
                key={system.id}
                steps={system.executionFlow}
                evidenceStatus={serverResult?.evidenceStatus ?? "static-portfolio-content"}
              />

              <div className="text-[11px] text-white/70 p-2 rounded bg-[#EA2143]/[0.06] border border-[#EA2143]/20">
                <span className="font-mono text-[9px] text-[#EA2143] block">FAILURE HANDLING</span>
                {system.failureHandling}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
