"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, Zap, Activity, Copy, Check, ExternalLink, RefreshCw } from "lucide-react";
import { MCP_REGISTRY, MCPToolDefinition } from "@/mcp/registry";
import { PROFILE_DATA } from "@/data/systems";

interface GenerativeToolArtifactProps {
  toolName: string;
  args?: Record<string, any>;
  onTriggerAction?: (actionName: string) => void;
}

export function GenerativeToolArtifact({ toolName, args = {}, onTriggerAction }: GenerativeToolArtifactProps) {
  const [copied, setCopied] = useState(false);
  const [elicitationResolved, setElicitationResolved] = useState<"pending" | "accepted" | "declined">("pending");
  const [activeTab, setActiveTab] = useState<"ui" | "contract">("ui");

  const toolMeta: MCPToolDefinition = MCP_REGISTRY[toolName] || {
    name: toolName,
    description: "Operação executada via protocolo MCP tipado.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    parameters: { type: "object", properties: {}, required: [] },
  };

  const copyContract = () => {
    navigator.clipboard.writeText(JSON.stringify(toolMeta, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-white/20 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl transition-all duration-300">
      {/* Header do Componente Generativo com Badges MCP */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#1856FF]/20 via-white/[0.04] to-transparent border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1856FF] animate-ping" />
          <span className="font-mono text-xs font-semibold text-white tracking-wider flex items-center gap-1.5">
            MCP_TOOL: <span className="text-[#38BDF8]">{toolMeta.name}</span>
          </span>
        </div>

        {/* Hints Rigorosos do MCP */}
        <div className="flex items-center gap-1.5 font-mono text-[9px]">
          {toolMeta.annotations.readOnlyHint && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              readOnly
            </span>
          )}
          {toolMeta.annotations.idempotentHint && (
            <span className="px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
              idempotent
            </span>
          )}
          {toolMeta.annotations.requiresElicitation && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse">
              elicitation_required
            </span>
          )}
          <button
            onClick={() => setActiveTab(activeTab === "ui" ? "contract" : "ui")}
            className="ml-2 px-1.5 py-0.5 rounded bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Alternar entre visualização UI viva e contrato JSON tipado"
          >
            {activeTab === "ui" ? "{ JSON }" : "UI Live"}
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico Generativo */}
      {activeTab === "contract" ? (
        <div className="p-3 bg-black/60 font-mono text-[11px] text-white/80 overflow-x-auto relative">
          <button
            onClick={copyContract}
            className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <pre>{JSON.stringify(toolMeta, null, 2)}</pre>
        </div>
      ) : (
        <div className="p-3.5">
          {/* Artefato: Broker de Mensageria */}
          {toolName === "inspectBrokerArchitecture" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-[10px] text-white/50 uppercase">Canal Ingest</div>
                  <div className="text-emerald-400 font-bold mt-0.5">Meta Cloud WhatsApp</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-[10px] text-white/50 uppercase">Buffer Core</div>
                  <div className="text-sky-400 font-bold mt-0.5">Agnostic Dispatcher</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-[10px] text-white/50 uppercase">Latência P99</div>
                  <div className="text-white font-bold mt-0.5">&lt; 42 ms</div>
                </div>
              </div>

              {/* Diagrama de Nós em Tempo Real */}
              <div className="p-2.5 rounded-lg bg-black/50 border border-white/10 flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-1.5 text-white/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Meta Webhook
                </div>
                <span className="text-white/30 text-xs">──►</span>
                <div className="flex items-center gap-1.5 text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
                  <Activity className="w-3 h-3 text-sky-400 animate-spin" />
                  Async Buffer
                </div>
                <span className="text-white/30 text-xs">──►</span>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Multi-LLM Engine
                </div>
              </div>
            </div>
          )}

          {/* Artefato: Zero Trust M2M */}
          {toolName === "inspectZeroTrustMesh" && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-500/30 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/90">M2M Asymmetric Signature</span>
                </div>
                <span className="text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  VERIFIED_OK
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-white/5 border border-white/10">
                  <span className="text-white/40 block text-[9px]">DIRETÓRIO / AUTH</span>
                  <span className="text-white">Active Directory RBAC</span>
                </div>
                <div className="p-2 rounded bg-white/5 border border-white/10">
                  <span className="text-white/40 block text-[9px]">TOKEN REPLAY RESISTANCE</span>
                  <span className="text-emerald-400">100% Nonce Salted</span>
                </div>
              </div>
            </div>
          )}

          {/* Artefato: PIX AI Engine */}
          {toolName === "inspectPixAiEngine" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs p-2 rounded bg-white/5 border border-white/10">
                <span className="text-white/70">Reconhecimento de Intenção PNL</span>
                <span className="text-sky-300 font-bold">99.4% Acurácia</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 font-mono text-[11px] space-y-1">
                <div className="text-white/40 text-[9px]">FLUXO TRANSACIONAL SEGURO</div>
                <div className="text-white/90">Intenção: &ldquo;Estorno Chave PIX Duplicada&rdquo;</div>
                <div className="text-emerald-400 flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Roteamento autônomo sem intervenção humana
                </div>
              </div>
            </div>
          )}

          {/* Artefato: Sentinel DLP */}
          {toolName === "inspectSentinelDLP" && (
            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
                <span className="text-rose-300">Payload com CPF/Cartão Bancário</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">DLP BLOCKED</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-emerald-300">Output Sanitizado: &ldquo;***.***.892-00&rdquo;</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">SAFE FOR LLM</span>
              </div>
            </div>
          )}

          {/* Artefato: Elicitation Request (Solicitação de Contato Executivo) */}
          {toolName === "requestExecutiveContact" && (
            <div className="space-y-3 font-mono text-xs">
              {elicitationResolved === "pending" ? (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                    <Zap className="w-4 h-4 animate-bounce" />
                    MCP Elicitation Request: Permissão Requerida
                  </div>
                  <p className="text-white/70 text-[11px] leading-relaxed">
                    O agente requer confirmação para descriptografar os canais diretos e o telefone corporativo de Thadeu Ramos. Deseja prosseguir com a autorização?
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setElicitationResolved("accepted")}
                      className="px-3 py-1 rounded bg-[#07CA6B] text-black font-bold text-xs hover:bg-[#07CA6B]/90 transition-all cursor-pointer shadow-lg"
                    >
                      Autorizar Acesso
                    </button>
                    <button
                      onClick={() => setElicitationResolved("declined")}
                      className="px-3 py-1 rounded bg-white/10 text-white/70 text-xs hover:bg-white/20 transition-all cursor-pointer"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ) : elicitationResolved === "accepted" ? (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    Autorização MCP Concedida
                  </div>
                  <div className="space-y-1 text-white/90 text-[11px]">
                    <div>• E-mail: <a href={`mailto:${PROFILE_DATA.contact.email}`} className="text-sky-300 underline">{PROFILE_DATA.contact.email}</a></div>
                    <div>• Telefone/WhatsApp: <span className="text-sky-300">{PROFILE_DATA.contact.phone}</span></div>
                    <div>• LinkedIn: <a href={PROFILE_DATA.contact.linkedin} target="_blank" rel="noreferrer" className="text-sky-300 underline">{PROFILE_DATA.contact.linkedin}</a></div>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-[11px]">
                  Elicitation Request cancelada pelo usuário. Os canais privados permanecem encriptados.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
