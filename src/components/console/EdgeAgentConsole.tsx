"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { Bot, Send, Cpu, Loader2, AlertTriangle } from "lucide-react";
import { useEdgeEmbeddings, type RankResult } from "@/hooks/useEdgeEmbeddings";
import { usePortfolioMcp, type PortfolioContactResult, type PortfolioMcpTool } from "@/hooks/usePortfolioMcp";
import { useLocalAssistant } from "@/hooks/useLocalAssistant";
import { CONTACT_SYSTEM_ID, SYSTEM_TOOL, SYSTEM_LABEL } from "@/mcp/semanticEngine";
import { isExplicitContactRequest } from "@/mcp/contactIntent.mjs";
import { buildPortfolioAnswerMessages, type PortfolioAnswerEvidence } from "@/mcp/answerPrompt.mjs";
import type { SystemProject } from "@/data/systems";
import { GenerativeToolArtifact } from "./GenerativeToolArtifact";
import { LocalModelPanel } from "./LocalModelPanel";
import { LocalAsrPanel } from "./LocalAsrPanel";
import { SemanticGravityField } from "./SemanticGravityField";
import { McpContactElicitationDialog } from "./McpContactElicitationDialog";

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
    result?: {
      project?: SystemProject;
      projects?: PortfolioProjectSummary[];
      contact?: PortfolioContactResult;
      evidenceStatus?: string;
    };
  };
  meta?: {
    engine: RankResult["engine"];
    ms: number;
    mcpMs?: number;
    generationMs?: number;
    totalMs?: number;
    top: { id: string; score: number }[];
    inferenceMs?: number;
    toolSelection?: string;
  };
}

type PortfolioProjectSummary = Pick<SystemProject, "id" | "shortLabel" | "title" | "category" | "period" | "summary">;

const QUICK = [
  "Como você desacopla canais de mensagem dos modelos de IA?",
  "Como garantir que um serviço interno não se passe por outro?",
  "Proteção contra vazamento de dados sensíveis em atendimento",
  "Quero falar com ele sobre uma vaga",
];

export function EdgeAgentConsole() {
  const { state, rank, loadEmbeddings } = useEdgeEmbeddings();
  const { state: mcpState, callTool, requestContact, contactElicitation, respondToContactElicitation } = usePortfolioMcp();
  const { state: assistantState, loadModel, generate } = useLocalAssistant();
  const ids = useMemo(() => Object.keys(SYSTEM_TOOL), []);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [generationEnabled, setGenerationEnabled] = useState(false);
  const [scores, setScores] = useState<Record<string, number> | null>(null);
  const [topId, setTopId] = useState<string>();
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "boot",
      role: "agent",
      content:
        "Pergunte em linguagem natural. A busca lexical local responde imediatamente; embeddings neurais e respostas Qwen são opcionais porque podem disputar GPU/CPU e aumentar a latência. O MCP consulta a ficha selecionada. O contato é uma ação separada que só envia os campos que você aceitar explicitamente.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  const invoke = async (
    systemId: string,
    evidence?: string,
    prefix?: string,
    meta?: MessageItem["meta"],
    question?: string,
    retrievedEvidence?: PortfolioAnswerEvidence[],
    requestStartedAt?: number,
  ) => {
    const toolName = SYSTEM_TOOL[systemId];
    if (!toolName) return;

    if (systemId === CONTACT_SYSTEM_ID) {
      setBusy(true);
      try {
        if (mcpState.phase !== "ready") throw new Error("Servidor MCP indisponível para solicitar contato.");
        const definition = mcpState.tools.find((tool) => tool.name === "portfolio_request_contact");
        if (!definition) throw new Error("A ferramenta MCP de contato não está aprovada.");
        const contact = await requestContact();
        setMessages((prev) => [...prev, {
          id: `a-${Date.now()}`,
          role: "agent",
          content: contact.message,
          tool: {
            name: "portfolio_request_contact",
            systemId,
            evidence,
            source: "mcp",
            definition,
            result: { contact },
          },
          meta,
        }]);
      } catch (error) {
        setMessages((prev) => [...prev, {
          id: `a-${Date.now()}`,
          role: "agent",
          content: `A solicitação MCP de contato falhou: ${error instanceof Error ? error.message : "erro desconhecido"}.`,
          meta,
        }]);
      } finally {
        setBusy(false);
      }
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
      const toolArguments: Record<string, unknown> = { projectId: systemId };
      const mcpStartedAt = performance.now();
      const response = await callTool(toolName, toolArguments);
      const mcpMs = performance.now() - mcpStartedAt;
      if (response.isError) throw new Error("MCP server rejected the request.");
      const result = response.structuredContent as NonNullable<MessageItem["tool"]>["result"];
      let resolvedSystemId = systemId;
      if (toolName === "portfolio_get_project") {
        const requestedProjectId = typeof toolArguments.projectId === "string" ? toolArguments.projectId : "";
        if (!requestedProjectId || result?.project?.id !== requestedProjectId) {
          throw new Error("MCP result did not match the approved project ID.");
        }
        resolvedSystemId = requestedProjectId;
        setTopId(resolvedSystemId);
      } else if (toolName === "portfolio_list_projects") {
        if (!Array.isArray(result?.projects)) throw new Error("MCP did not return a project list.");
      } else {
        throw new Error("The selected MCP tool is outside the local allowlist.");
      }
      const messageId = `a-${Date.now()}`;
      const shouldGenerate = generationEnabled && assistantState.phase === "ready" && Boolean(question?.trim());
      const responseMeta = meta
        ? {
            ...meta,
            toolSelection: "busca semântica",
            mcpMs,
            ...(requestStartedAt === undefined ? {} : { totalMs: performance.now() - requestStartedAt }),
          }
        : meta;
      setMessages((prev) => [...prev, {
        id: messageId,
        role: "agent",
        content: shouldGenerate ? "Gerando resposta local com fontes…" : prefix ?? `Ficha recebida via MCP: ${SYSTEM_LABEL[resolvedSystemId]}.`,
        tool: { name: toolName, systemId: resolvedSystemId, evidence, source: "mcp", definition, result },
        meta: responseMeta,
      }]);
      if (shouldGenerate && question) {
        const primaryEvidence: PortfolioAnswerEvidence = result?.projects
          ? {
              id: "portfolio-index",
              title: "Índice de projetos do MCP",
              text: result.projects.map((project) => `${project.title} (${project.shortLabel}, ${project.category})`).join("; "),
            }
          : { id: resolvedSystemId, title: `${result?.project?.title ?? SYSTEM_LABEL[resolvedSystemId]} · ficha MCP`, text: JSON.stringify(result?.project ?? {}) };
        const evidenceForAnswer: PortfolioAnswerEvidence[] = [
          primaryEvidence,
          ...(retrievedEvidence ?? []).filter((source) => source.id !== primaryEvidence.id && source.id !== resolvedSystemId),
        ].slice(0, 3);
        const generationStartedAt = performance.now();
        try {
          const completion = await generate(buildPortfolioAnswerMessages(question, evidenceForAnswer), (text) => {
            setMessages((previous) => previous.map((message) => message.id === messageId
              ? { ...message, content: message.content === "Gerando resposta local com fontes…" ? text : message.content + text }
              : message));
          });
          setMessages((previous) => previous.map((message) => message.id === messageId
            ? {
                ...message,
                content: completion.answer,
                meta: message.meta ? {
                  ...message.meta,
                  inferenceMs: completion.inferenceMs,
                  generationMs: performance.now() - generationStartedAt,
                  totalMs: requestStartedAt === undefined ? message.meta.totalMs : performance.now() - requestStartedAt,
                } : undefined,
              }
            : message));
        } catch (error) {
          setMessages((previous) => previous.map((message) => message.id === messageId
            ? {
                ...message,
                content: `A resposta local falhou: ${error instanceof Error ? error.message : "erro desconhecido"}. A ficha MCP continua disponível abaixo.`,
                meta: message.meta ? {
                  ...message.meta,
                  generationMs: performance.now() - generationStartedAt,
                  totalMs: requestStartedAt === undefined ? message.meta.totalMs : performance.now() - requestStartedAt,
                } : undefined,
              }
            : message));
        }
      }
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
    const requestStartedAt = performance.now();
    setInput("");
    setBusy(true);
    setMessages((p) => [...p, { id: `u-${Date.now()}`, role: "user", content: text }]);
    try {
      if (isExplicitContactRequest(text)) {
        setTopId(CONTACT_SYSTEM_ID);
        setScores({ [CONTACT_SYSTEM_ID]: 1 });
        await invoke(CONTACT_SYSTEM_ID, "Pedido explícito de contato.");
        return;
      }

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
        const retrievedEvidence: PortfolioAnswerEvidence[] = r.ranking.slice(0, 3).map((item) => ({
          id: item.systemId,
          title: SYSTEM_LABEL[item.systemId] ?? item.systemId,
          text: item.bestChunk ?? "",
        }));
        await invoke(top.systemId, top.bestChunk, `Maior similaridade: ${SYSTEM_LABEL[top.systemId]}.`, meta, text, retrievedEvidence, requestStartedAt);
      } else {
        setMessages((p) => [
          ...p,
          {
            id: `a-${Date.now()}`,
            role: "agent",
            content:
              "Nenhum sistema passou do limiar de confiança. Prefiro não chutar: reformule ou toque num dos corpos no campo acima.",
            meta: { ...meta, totalMs: performance.now() - requestStartedAt },
          },
        ]);
      }
    } finally {
      setBusy(false);
    }
  };

  const rt = state.runtime;
  const loading = ["probing", "downloading", "indexing"].includes(state.phase);

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
        {rt ? (
          <span className="shrink-0 font-mono text-[9px] px-2 py-1 rounded border bg-[#07CA6B]/15 text-[#07CA6B] border-[#07CA6B]/30">
            <Cpu aria-hidden="true" className="inline w-3 h-3 mr-1" />
            {rt.device.toUpperCase()} · pronto
          </span>
        ) : (
          <button
            type="button"
            onClick={loadEmbeddings}
            disabled={loading}
            aria-label={loading ? "Carregando modelo de embeddings" : "Ativar busca neural local"}
            className="shrink-0 font-mono text-[9px] px-2 py-1 rounded border border-[#1856FF]/40 bg-[#1856FF]/10 text-[#BAE6FD] hover:bg-[#1856FF]/20 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? <Loader2 aria-hidden="true" className="inline w-3 h-3 mr-1 animate-spin" /> : state.phase === "error" ? <AlertTriangle aria-hidden="true" className="inline w-3 h-3 mr-1" /> : <Cpu aria-hidden="true" className="inline w-3 h-3 mr-1" />}
            {loading ? `${Math.round(state.progress * 100)}%` : state.phase === "error" ? "TENTAR EMBEDDINGS" : "ATIVAR BUSCA NEURAL"}
          </button>
        )}
      </div>

      {loading && (
        <div className="h-0.5 bg-white/5">
          <div className="h-full bg-[#1856FF] transition-[width] duration-300" style={{ width: `${state.progress * 100}%` }} />
        </div>
      )}

      <SemanticGravityField ids={ids} scores={scores} topId={topId} onSelect={(id) => invoke(id)} />
      <LocalModelPanel
        state={assistantState}
        onLoad={loadModel}
        generationEnabled={generationEnabled}
        onToggleGeneration={() => setGenerationEnabled((enabled) => !enabled)}
      />
      <LocalAsrPanel onTranscript={setInput} />

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
                <div className="mt-1.5 font-mono text-[9px] text-white/65">
                  {m.meta.engine === "neural" ? "embeddings neurais" : "fallback léxico"} ·{" "}
                  busca {m.meta.ms.toFixed(1)} ms · {m.meta.top.map((t) => `${SYSTEM_LABEL[t.id]} ${t.score.toFixed(3)}`).join(" | ")}
                  {m.meta.mcpMs !== undefined ? ` · MCP ${m.meta.mcpMs.toFixed(0)} ms` : ""}
                  {m.meta.generationMs !== undefined ? ` · Qwen ${m.meta.generationMs.toFixed(0)} ms` : ""}
                  {m.meta.totalMs !== undefined ? ` · total ${m.meta.totalMs.toFixed(0)} ms` : ""}
                  {m.meta.toolSelection ? ` · ${m.meta.toolSelection}` : ""}
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
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> buscando localmente, consultando MCP e gerando resposta se ativada…
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
          aria-label="Pergunte sobre a experiência e os projetos de Thadeu"
          placeholder="Ex.: como ele lida com falhas de um provedor de LLM?"
          className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#1856FF]"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="p-2.5 rounded-xl bg-[#1856FF] hover:bg-[#1856FF]/90 disabled:opacity-50 text-white cursor-pointer"
        >
          <Send aria-hidden="true" className="w-4 h-4" />
          <span className="sr-only">Enviar pergunta</span>
        </button>
      </form>
      {contactElicitation && (
        <McpContactElicitationDialog
          message={contactElicitation}
          onRespond={respondToContactElicitation}
        />
      )}
    </div>
  );
}
