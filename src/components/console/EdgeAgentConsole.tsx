"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal, Bot, Sparkles, Send, ShieldCheck, Zap, Activity, Cpu } from "lucide-react";
import { searchLocalSemanticMesh } from "@/mcp/semanticEngine";
import { MCP_REGISTRY } from "@/mcp/registry";
import { GenerativeToolArtifact } from "./GenerativeToolArtifact";

interface MessageItem {
  id: string;
  role: "user" | "agent";
  content: string;
  mcpTool?: string;
  mcpArgs?: Record<string, any>;
  score?: number;
}

export function EdgeAgentConsole() {
  const [input, setInput] = useState("");
  const [isInferring, setIsInferring] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "initial",
      role: "agent",
      content: `Agente local de Edge inicializado via MCP (Model Context Protocol).
A inferência semântica e resolução de ferramentas ocorre nativamente no seu navegador, sem envio de dados a servidores externos.
O que deseja inspecionar na arquitetura de Thadeu Ramos?`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isInferring]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isInferring) return;

    const userQuery = input.trim();
    setInput("");

    const userMsg: MessageItem = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: userQuery,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsInferring(true);

    // Motor de Inferência Vetorial Real no Edge
    setTimeout(() => {
      const searchResults = searchLocalSemanticMesh(userQuery);
      const topMatch = searchResults[0];

      let replyText = "";
      let mcpToolName: string | undefined = undefined;

      if (topMatch && topMatch.score > 0.08) {
        mcpToolName = topMatch.document.mcpTool;
        replyText = `Similaridade vetorial detectada (${(topMatch.score * 100).toFixed(1)}% de match semântico no Edge). Invocando ferramenta tipada via MCP:`;
      } else {
        replyText = `Busca semântica executada no navegador. Não encontrei um subsistema de alta convergência para essa consulta. Experimente indagar sobre: "Broker de Mensageria", "Autenticação M2M Zero Trust", "Motor de IA PIX" ou "Sentinel DLP".`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `agn-${Date.now()}`,
          role: "agent",
          content: replyText,
          mcpTool: mcpToolName,
          score: topMatch?.score,
        },
      ]);

      setIsInferring(false);
    }, 380); // Latência de inferência local ultrarrápida (Edge computing)
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/15 overflow-hidden flex flex-col h-[540px]">
      {/* Header do Agente MCP */}
      <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#1856FF]/20 border border-[#1856FF]/40 text-[#38BDF8]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">Edge AI Assistant</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#07CA6B]/20 text-[#07CA6B] border border-[#07CA6B]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#07CA6B] animate-pulse" />
                ON-DEVICE EMBEDDINGS
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Inferência semântica &amp; Generative UI via Model Context Protocol
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-white/60">
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10">
            <Cpu className="w-3 h-3 text-sky-400" />
            Zero-Cloud Latency
          </span>
        </div>
      </div>

      {/* Lista de Mensagens com Generative UI */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#1856FF] text-white rounded-tr-none shadow-lg shadow-[#1856FF]/20"
                  : "bg-white/[0.05] border border-white/10 text-white/90 rounded-tl-none backdrop-blur-md"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Generative UI Transmutation se houver MCP Tool */}
              {msg.mcpTool && (
                <GenerativeToolArtifact
                  toolName={msg.mcpTool}
                  args={msg.mcpArgs}
                />
              )}
            </div>
          </div>
        ))}

        {isInferring && (
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#38BDF8] p-2 rounded-lg bg-sky-950/20 border border-sky-500/20 w-fit">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            Computando embeddings locais no Edge &amp; resolvendo contrato MCP...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões de Prompt Rápidas */}
      <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center gap-2 overflow-x-auto text-[11px] font-mono text-white/60">
        <span className="text-white/40 shrink-0">Consultas MCP:</span>
        <button
          onClick={() => handleQuickPrompt("Como funciona o Broker de Mensageria com WhatsApp e IA?")}
          className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          ⚡ Broker de Mensageria
        </button>
        <button
          onClick={() => handleQuickPrompt("Auditar segurança Zero Trust e autenticação M2M")}
          className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          🛡️ Malha M2M Zero Trust
        </button>
        <button
          onClick={() => handleQuickPrompt("Testar reconhecimento de intenção no autoatendimento PIX")}
          className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          💳 Canal PIX 100% IA
        </button>
        <button
          onClick={() => handleQuickPrompt("Solicitar contato executivo com autorização de elicitação")}
          className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          📞 Elicitation Request
        </button>
      </div>

      {/* Formulário de Envio */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-white/[0.01] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Consulte o catálogo semântico de sistemas ou invoque ferramentas MCP..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#1856FF] transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isInferring}
          className="p-2.5 rounded-xl bg-[#1856FF] hover:bg-[#1856FF]/90 disabled:opacity-50 text-white transition-all cursor-pointer shadow-lg shadow-[#1856FF]/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
