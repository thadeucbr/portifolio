"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { Bot, Send, Cpu, Loader2, AlertTriangle } from "lucide-react";
import { useEdgeEmbeddings, type RankResult } from "@/hooks/useEdgeEmbeddings";
import { SYSTEM_TOOL, SYSTEM_LABEL } from "@/mcp/semanticEngine";
import { GenerativeToolArtifact } from "./GenerativeToolArtifact";
import { SemanticGravityField } from "./SemanticGravityField";

interface MessageItem {
  id: string;
  role: "user" | "agent";
  content: string;
  tool?: { name: string; systemId: string; evidence?: string };
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
        "Pergunte em linguagem natural. Sua pergunta vira um vetor dentro do seu navegador, é comparada com trechos do currículo e a ferramenta MCP do sistema mais próximo é renderizada como interface. Nada é enviado a servidores de IA.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  const invoke = (systemId: string, evidence?: string, prefix?: string, meta?: MessageItem["meta"]) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: "agent",
        content: prefix ?? `Invocação manual de ${SYSTEM_LABEL[systemId]}.`,
        tool: { name: SYSTEM_TOOL[systemId], systemId, evidence },
        meta,
      },
    ]);
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
        invoke(top.systemId, top.bestChunk, `Maior similaridade: ${SYSTEM_LABEL[top.systemId]}.`, meta);
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
              {m.tool && <GenerativeToolArtifact toolName={m.tool.name} systemId={m.tool.systemId} evidence={m.tool.evidence} />}
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
