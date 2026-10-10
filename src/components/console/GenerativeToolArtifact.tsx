"use client";

import React, { useState } from "react";
import { Check, Copy, Cpu, Database, HardDrive, Layers } from "lucide-react";
import { MCP_REGISTRY, type MCPToolDefinition } from "@/mcp/registry";
import { SYSTEMS_DATA } from "@/data/systems";
import { useEdgeEmbeddings } from "@/hooks/useEdgeEmbeddings";
import { ElicitationContactForm } from "./ElicitationContactForm";

interface GenerativeToolArtifactProps {
  toolName: string;
  systemId: string;
  /** Trecho do currículo recuperado pelo modelo de embeddings que justificou a chamada. */
  evidence?: string;
}

/**
 * UI local: o ranking semântico seleciona um artefato do portfólio. O contrato é inspirado
 * em MCP, mas não há chamada a um servidor MCP nem geração de resposta por LLM.
 */
export function GenerativeToolArtifact({ toolName, systemId, evidence }: GenerativeToolArtifactProps) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"ui" | "contract">("ui");
  const { state } = useEdgeEmbeddings();

  const tool: MCPToolDefinition | undefined = MCP_REGISTRY[toolName];
  const system = SYSTEMS_DATA.find((s) => s.id === systemId);
  if (!tool) return null;

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(tool, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const rt = state.runtime;

  return (
    <div className="my-3 rounded-xl border border-white/15 bg-black/40 backdrop-blur-xl overflow-hidden">
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#1856FF]/20 via-white/[0.04] to-transparent border-b border-white/10 flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-white tracking-wider truncate">
          ferramenta local → <span className="text-[#38BDF8]">{tool.name}</span>
        </span>
        <div className="flex items-center gap-1.5 font-mono text-[9px] shrink-0">
          {tool.annotations.readOnlyHint && (
            <span className="px-1.5 py-0.5 rounded bg-[#07CA6B]/10 border border-[#07CA6B]/30 text-[#07CA6B]">readOnly</span>
          )}
          {tool.annotations.idempotentHint && (
            <span className="px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">idempotent</span>
          )}
          {tool.annotations.destructiveHint && (
            <span className="px-1.5 py-0.5 rounded bg-[#EA2143]/10 border border-[#EA2143]/30 text-[#EA2143]">destructive</span>
          )}
          {tool.annotations.requiresElicitation && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">elicitation</span>
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
          <pre>{JSON.stringify(tool, null, 2)}</pre>
        </div>
      ) : (
        <div className="p-3.5 space-y-3">
          <p className="font-mono text-[9px] text-white/40">
            CONTRATO LOCAL INSPIRADO EM MCP • SEM CONEXÃO A SERVIDOR MCP
          </p>
          {evidence && (
            <div className="text-[11px] leading-relaxed text-white/75 border-l-2 border-[#1856FF] pl-2.5">
              <span className="font-mono text-[9px] text-white/40 block">EVIDÊNCIA RECUPERADA DO CURRÍCULO</span>
              {evidence}
            </div>
          )}

          {toolName === "requestExecutiveContact" && <ElicitationContactForm />}

          {toolName === "inspectEdgeInferenceRuntime" && (
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

          {system && toolName !== "inspectEdgeInferenceRuntime" && (
            <>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                {system.metrics.slice(0, 3).map((m) => (
                  <div key={m.label} className="p-2 rounded-lg bg-white/[0.06] border border-white/10">
                    <div className="text-[9px] text-white/45 uppercase">{m.label}</div>
                    <div className="text-[#38BDF8] font-bold text-xs mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>

              <ol className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                {system.executionFlow.map((st, i) => (
                  <li key={st.step} className="flex items-center gap-1.5">
                    <span className="px-2 py-1 rounded bg-white/[0.06] border border-white/10 text-white/85" title={st.description}>
                      <span className="text-white/40">{st.step}</span> {st.title}
                    </span>
                    {i < system.executionFlow.length - 1 && <span className="text-white/30">→</span>}
                  </li>
                ))}
              </ol>

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
