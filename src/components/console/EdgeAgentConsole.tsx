"use client";

import React, { useState } from "react";
import { Terminal, Bot, Sparkles, Send, ShieldCheck, Zap } from "lucide-react";
import { SYSTEMS_DATA, PROFILE_DATA } from "@/data/systems";

export function EdgeAgentConsole() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "agent"; content: string; mcpTool?: string }>>([
    {
      role: "agent",
      content: `Agente local inicializado em modo privacy-first (Zero data leakage).
Estou pronto para analisar a arquitetura de sistemas de Thadeu Ramos, incluindo a malha Zero Trust, brokers de mensageria agnósticos para IA e o motor transacional do PIX. O que gostaria de explorar?`,
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input.trim();
    setInput("");

    // Adiciona pergunta do usuário
    const nextMessages = [...messages, { role: "user" as const, content: userQuery }];
    setMessages(nextMessages);

    // Motor de Resposta Local orientado a MCP Tools simulando inferência rápida de Edge
    setTimeout(() => {
      const q = userQuery.toLowerCase();
      let reply = "";
      let toolName = "queryCareerSystem";

      if (q.includes("zero trust") || q.includes("segurança") || q.includes("m2m") || q.includes("token")) {
        toolName = "inspectZeroTrustMesh()";
        reply = `[MCP: AEGIS-M2M] O Thadeu liderou o hardening da malha de microsserviços do Banco Safra implementando autenticação M2M estrita através de tokens criptográficos assinados por aplicação com não-repúdio ponta a ponta e RBAC integrado ao Active Directory, eliminando vulnerabilidades internas de tráfego desprotegido.`;
      } else if (q.includes("broker") || q.includes("mensageria") || q.includes("whatsapp") || q.includes("meta")) {
        toolName = "inspectAgnosticBroker()";
        reply = `[MCP: HYPERION-BROKER] O Thadeu concebeu uma plataforma de mensageria com buffers agnósticos para IA, capaz de receber requisições de múltiplos canais (Meta Cloud WhatsApp, Telegram, Enterprise Webhooks) e despachar para múltiplos LLMs em menos de 45ms de latência, provendo ferramentas dinâmicas e biometria facial.`;
      } else if (q.includes("pix") || q.includes("atendimento") || q.includes("pnl")) {
        toolName = "inspectPixAiEngine()";
        reply = `[MCP: NEXUS-PIX] Como responsável técnico, o Thadeu desenvolveu e sustentou o canal de autoatendimento 100% IA do PIX no Banco Safra, refinando modelos de PNL para reconhecimento de intenções sob volumetria financeira massiva e conquistando promoção para Sênior em 7 meses.`;
      } else if (q.includes("dlp") || q.includes("governança") || q.includes("compliance")) {
        toolName = "inspectSentinelDLP()";
        reply = `[MCP: SENTINEL-DLP] O Thadeu implementou a plataforma de governança para gerentes do Safra com Data Loss Prevention (DLP) em tempo real, tráfego criptografado e seguro de anexos bancários e mecanismos de delegação temporária de atendimento.`;
      } else if (q.includes("contato") || q.includes("email") || q.includes("linkedin")) {
        toolName = "getContactTransmission()";
        reply = `Informações de contato de Thadeu Ramos:\n• E-mail: ${PROFILE_DATA.contact.email}\n• LinkedIn: ${PROFILE_DATA.contact.linkedin}\n• GitHub: ${PROFILE_DATA.contact.github}\n• Localização: São Paulo, SP (Disponibilidade para Remoto / Híbrido).`;
      } else {
        toolName = "searchSemanticIndex()";
        reply = `[MCP: Local Semantic Search] Com base na trajetória de Thadeu Ramos (Senior Software Engineer): ele se destaca na convergência entre engenharia de plataformas distribuídas de alta disponibilidade, segurança defensiva Zero Trust e integração de agentes autônomos de IA com ferramentas MCP. Deseja inspecionar um sistema específico? (Ex: 'Broker de Mensageria', 'Zero Trust' ou 'Motor PIX')`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: reply,
          mcpTool: toolName,
        },
      ]);
    }, 450);
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/15 overflow-hidden flex flex-col h-[520px]">
      {/* Header do Agente */}
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
                ON-DEVICE
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Orquestração de Ferramentas via Model Context Protocol (MCP)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-white/50">
          <ShieldCheck className="w-3.5 h-3.5 text-[#07CA6B]" />
          <span>Zero-Telemetry</span>
        </div>
      </div>

      {/* Lista de Mensagens */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              m.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {m.mcpTool && (
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#38BDF8] mb-1 pl-1">
                <Zap className="w-3 h-3 text-[#1856FF]" />
                <span>Tool Executada: {m.mcpTool}</span>
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[#1856FF] text-white rounded-br-none shadow-md"
                  : "bg-black/40 text-white/90 border border-white/10 rounded-bl-none font-sans"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Sugestões Rápidas de Prompt */}
      <div className="px-4 py-2 border-t border-white/[0.06] bg-black/20 flex gap-1.5 overflow-x-auto text-[11px] font-mono scrollbar-none">
        <button
          onClick={() => setInput("Explique o Broker de Mensageria para IA")}
          className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/5 shrink-0 transition-colors"
        >
          Broker de Mensageria
        </button>
        <button
          onClick={() => setInput("Como foi implementado o Zero Trust M2M?")}
          className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/5 shrink-0 transition-colors"
        >
          Zero Trust M2M
        </button>
        <button
          onClick={() => setInput("Qual a experiência com PIX e IA?")}
          className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/5 shrink-0 transition-colors"
        >
          Canal PIX 100% IA
        </button>
      </div>

      {/* Input de Envio */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-white/[0.02] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte sobre arquitetura, mensageria, segurança ou IA..."
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#1856FF] transition-colors"
        />
        <button
          type="submit"
          className="px-3.5 py-2 rounded-xl bg-[#1856FF] hover:bg-[#1856FF]/90 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Consultar</span>
        </button>
      </form>
    </div>
  );
}
