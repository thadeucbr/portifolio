"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { Bot, Send, Cpu, Loader2, AlertTriangle } from "lucide-react";
import { useEdgeEmbeddings, type RankResult } from "@/hooks/useEdgeEmbeddings";
import { usePortfolioMcp, type PortfolioMcpTool } from "@/hooks/usePortfolioMcp";
import { CONTACT_SYSTEM_ID, SYSTEM_TOOL, SYSTEM_LABEL } from "@/mcp/semanticEngine";
import type { SystemProject } from "@/data/systems";
import { GenerativeToolArtifact } from "./GenerativeToolArtifact";
import { SemanticGravityField } from "./SemanticGravityField";

interface MessageItem {
  id: string;
  role: "user" | "agent";
  content: string;
  tool?: {
    name: string;
    systemId: string;
    evidence?: string;
    source: "mcp" | "local";
    definition?: PortfolioMcpTool;
    result?: { project?: SystemProject; evidenceStatus?: string };
  };
  meta?: { engine: RankResult["engine"]; ms: number; top: { id: string; score: number }[] };
}

const QUICK = [
  "Como você desacopla canais de mensagem dos modelos de IA?",
  "Como garantir que um serviço interno não se passe por outro?",
  "Proteção contra vazamento de dados sensíveis em atendimento",
  "Quero falar com ele sobre uma vaga",
];

export function EdgeAgentConsole() {
  const { state, rank } = useEdgeEmbeddings();
  const { state: mcpState, callTool } = usePortfolioMcp();
  const ids = useMemo(() => Object.keys(SYSTEM_TOOL), []);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [scores, setScores] = useState<Record<string, number> | null>(null);
  const [topId, setTopId] = useState<string>();
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "boot",
      role: "agent",
      content:
        "Pergunte em linguagem natural. Embeddings ficam no navegador; a busca seleciona uma ficha e o cliente AI SDK chama um tool read-only no servidor MCP via Streamable HTTP. O servidor retorna conteúdo estático do portfólio. Ainda não há LLM escolhendo tools nem redigindo a resposta.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  const invoke = async (systemId: string, evidence?: string, prefix?: string, meta?: MessageItem["meta"]) => {
    const toolName = SYSTEM_TOOL[systemId];
    if (!toolName) return;

    if (systemId === CONTACT_SYSTEM_ID) {
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: "agent",
        content: prefix ?? "A solicitação de contato exige consentimento explícito.",
        tool: { name: toolName, systemId, evidence, source: "local" },
        meta,
      }]);
      return;
    }

    if (mcpState.phase !== "ready") {
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: "agent",
        content: `Servidor MCP indisponível: ${mcpState.detail ?? "aguarde a conexão"}. Nenhuma ferramenta foi executada.`,
        meta,
      }]);
      return;
    }

    const definition = mcpState.tools.find((tool) => tool.name === toolName);
    if (!definition) {
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: "agent",
        content: `A ferramenta ${toolName} não está na lista MCP aprovada. Execução bloqueada.`,
        meta,
      }]);
      return;
    }

    setBusy(true);
    try {
      const response = await callTool(toolName, { projectId: systemId });
      if (response.isError) throw new Error("MCP server rejected the project lookup.");
      const result = response.structuredContent as NonNullable<MessageItem["tool"]>["result"];
      if (result?.project?.id !== systemId) throw new Error("MCP result did not match the requested project.");
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: "agent",
        content: prefix ?? `Resultado recebido via MCP: ${SYSTEM_LABEL[systemId]}.`,
        tool: { name: toolName, systemId, evidence, source: "mcp", definition, result },
        meta,
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: "agent",
        content: `A chamada MCP falhou: ${error instanceof Error ? error.message : "erro desconhecido"}.`,
        meta,
      }]);
    } finally {
      setBusy(false);
    }
  };

  const ask = async (text: string) => {
    if (!text.trim() || busy) return;
    setInput("");
    setBusy(true);
    setMessages((p) => [...p, { id: `u-${Date.now()}`, role: "user", content: text }]);
    try {
      const r = await rank(text);
      const top = r.ranking[0];
      setScores(Object.fromEntries(r.ranking.map((x) => [x.systemId, x.score])));
      setTopId(top?.systemId);
      const meta = {
        engine: r.engine,
        ms: r.inferenceMs,
        top: r.ranking.slice(0, 3).map((x) => ({ id: x.systemId, score: x.score })),
      };
      if (top && top.score >= r.threshold) {
        await invoke(top.systemId, top.bestChunk, `Maior similaridade: ${SYSTEM_LABEL[top.systemId]}.`, meta);
      } else {
        setMessages((p) => [
          ...p,
          {
            id: `a-${Date.now()}`,
            role: "agent",
            content:
              "Nenhum sistema passou do limiar de confiança. Prefiro não chutar: reformule ou toque num dos corpos no campo acima.",
            meta,
          },
        ]);
      }
    } finally {
      setBusy(false);
    }
  };

  const rt = state.runtime;
  const loading = state.phase !== "ready" && state.phase !== "error";

  return (
    <div className="glass-panel rounded-2xl border border-white/15 overflow-hidden flex flex-col h-[min(640px,calc(100vh-180px))]">
      <div className="p-3.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-[#1856FF]/20 border border-[#1856FF]/40 text-[#38BDF8]">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white">Agente de busca semântica local</div>
            <p className="text-[10px] text-white/50 truncate font-mono">
              {rt
                ? `${rt.model.split("/")[1]} · ${rt.device.toUpperCase()} · ${rt.dtype} · ${rt.dims}d · cache ${rt.warmCache ? "hit" : "miss"}`
                : state.phase === "error"
                  ? state.detail
                  : (state.detail ?? "inicializando worker…")}
            </p>
            <p className={`text-[9px] truncate font-mono ${mcpState.phase === "ready" ? "text-[#07CA6B]/80" : "text-white/40"}`}>
              {mcpState.phase === "ready"
                ? `MCP Streamable HTTP · ${mcpState.serverName} · ${mcpState.tools.length} tools verificadas`
                : mcpState.phase === "error"
                  ? `MCP bloqueado · ${mcpState.detail}`
                  : "MCP: conectando ao servidor do portfólio…"}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 font-mono text-[10px] px-2 py-1 rounded border flex items-center gap-1 ${
            rt
              ? "bg-[#07CA6B]/15 text-[#07CA6B] border-[#07CA6B]/30"
              : state.phase === "error"
                ? "bg-[#EA2143]/15 text-[#EA2143] border-[#EA2143]/30"
                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
          }`}
        >
          {rt ? <Cpu className="w-3 h-3" /> : state.phase === "error" ? <AlertTriangle className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
          {rt ? "MODELO PRONTO" : state.phase === "error" ? "SEM BACKEND" : `${Math.round(state.progress * 100)}%`}
        </span>
      </div>

      {loading && (
        <div className="h-0.5 bg-white/5">
          <div className="h-full bg-[#1856FF] transition-[width] duration-300" style={{ width: `${state.progress * 100}%` }} />
        </div>
      )}

      <SemanticGravityField ids={ids} scores={scores} topId={topId} onSelect={(id) => invoke(id)} />

      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[90%] rounded-2xl p-3 leading-relaxed ${
                m.role === "user"
                  ? "bg-[#1856FF] text-white rounded-tr-none"
                  : "bg-white/[0.08] border border-white/10 text-white/90 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.meta && (
                <div className="mt-1.5 font-mono text-[9px] text-white/45">
                  {m.meta.engine === "neural" ? "embeddings neurais" : "fallback léxico (modelo ainda carregando)"} ·{" "}
                  {m.meta.ms.toFixed(1)} ms · {m.meta.top.map((t) => `${SYSTEM_LABEL[t.id]} ${t.score.toFixed(3)}`).join(" | ")}
                </div>
              )}
              {m.tool && (
                <GenerativeToolArtifact
                  toolName={m.tool.name}
                  systemId={m.tool.systemId}
                  evidence={m.tool.evidence}
                  source={m.tool.source}
                  serverTool={m.tool.definition}
                  serverResult={m.tool.result}
                />
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#38BDF8]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> gerando embedding da consulta…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-3 py-2 bg-black/30 border-t border-white/5 flex items-center gap-2 overflow-x-auto text-[10px] font-mono text-white/60">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => ask(q)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
        className="p-3 border-t border-white/10 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex.: como ele lida com falhas de um provedor de LLM?"
          className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#1856FF]"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="p-2.5 rounded-xl bg-[#1856FF] hover:bg-[#1856FF]/90 disabled:opacity-50 text-white cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
