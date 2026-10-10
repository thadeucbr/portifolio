"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  AlertTriangle, 
  Cpu, 
  MessageSquare, 
  Layers, 
  Activity,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";

type ScenarioType = "normal" | "meta_outage" | "dlp_violation" | "pix_spike" | "unauthorized_m2m";

export function SystemResilienceWorkbench() {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("normal");
  const [isRunning, setIsRunning] = useState(false);
  const [simLogs, setSimLogs] = useState<Array<{ timestamp: string; level: "info" | "warn" | "error" | "success"; message: string }>>([
    {
      timestamp: "12:00:01.102",
      level: "success",
      message: "PLATAFORMA ESTÁVEL: Broker de Mensageria, Malha Zero Trust e Agentes MCP operando nominalmente.",
    },
  ]);

  const triggerScenario = (scenario: ScenarioType) => {
    setActiveScenario(scenario);
    setIsRunning(true);

    const now = () => new Date().toLocaleTimeString("pt-BR") + "." + Math.floor(Math.random() * 900 + 100);

    if (scenario === "normal") {
      setSimLogs([
        { timestamp: now(), level: "info", message: "Disparando tráfego de rotina (WhatsApp, Telegram, Webhooks)..." },
        { timestamp: now(), level: "success", message: "Inbound recebido. Buffer agnóstico despachou para o ecossistema de IA em 28ms." },
      ]);
      setIsRunning(false);
      return;
    }

    if (scenario === "meta_outage") {
      setSimLogs((prev) => [
        { timestamp: now(), level: "error", message: "SIMULAÇÃO: Queda repentina de Webhook da Meta (WhatsApp Cloud API timeout > 5000ms)." },
      ]);

      setTimeout(() => {
        setSimLogs((prev) => [
          ...prev,
          { timestamp: now(), level: "warn", message: "CIRCUIT BREAKER ATIVADO: Broker Agnóstico isolou o canal degradado sem afetar os outros." },
          { timestamp: now(), level: "info", message: "Buffer desacoplado enfileirou mensagens em DLQ com retry exponencial." },
          { timestamp: now(), level: "success", message: "RESILIÊNCIA COMPROVADA: Modelos de IA e canais Telegram/Enterprise continuaram 100% online." },
        ]);
        setIsRunning(false);
      }, 700);
    }

    if (scenario === "dlp_violation") {
      setSimLogs((prev) => [
        { timestamp: now(), level: "warn", message: "SIMULAÇÃO: Ingestão de mensagem com tentativa de vazamento de CPF e Chave Bancária via chat." },
      ]);

      setTimeout(() => {
        setSimLogs((prev) => [
          ...prev,
          { timestamp: now(), level: "error", message: "SENTINEL DLP BLOQUEOU: Filtro heurístico em tempo real detectou dados sensíveis (LGPD/Bacen)." },
          { timestamp: now(), level: "info", message: "Payload sanitizado antes de qualquer exposição ao modelo de linguagem." },
          { timestamp: now(), level: "success", message: "INCIDENTE EVITADO: Sessão auditada e custódia segura gerou log imutável de compliance." },
        ]);
        setIsRunning(false);
      }, 700);
    }

    if (scenario === "unauthorized_m2m") {
      setSimLogs((prev) => [
        { timestamp: now(), level: "error", message: "SIMULAÇÃO: Microsserviço interno tentando chamar a API de IA sem token criptográfico assinado." },
      ]);

      setTimeout(() => {
        setSimLogs((prev) => [
          ...prev,
          { timestamp: now(), level: "warn", message: "MALHA ZERO TRUST INTERCEPTOU: Handshake mTLS rejeitou a conexão na porta 8443." },
          { timestamp: now(), level: "error", message: "TOKEN M2M AUSENTE / INVÁLIDO: Falha de assinatura Ed25519 e RBAC não localizado no Active Directory." },
          { timestamp: now(), level: "success", message: "SEGURANÇA BLINDADA: Acesso barrado no perímetro Zero Trust sem exposição das chaves." },
        ]);
        setIsRunning(false);
      }, 700);
    }

    if (scenario === "pix_spike") {
      setSimLogs((prev) => [
        { timestamp: now(), level: "warn", message: "SIMULAÇÃO: Pico transacional sazonal de PIX (Salto de 3k para 65k requisições simultâneas)." },
      ]);

      setTimeout(() => {
        setSimLogs((prev) => [
          ...prev,
          { timestamp: now(), level: "info", message: "Motor 100% IA do PIX escalou horizontalmente via workers assíncronos." },
          { timestamp: now(), level: "success", message: "PNL refinado manteve taxa de assertividade em 94.2% sem filas de retenção." },
          { timestamp: now(), level: "success", message: "OPERAÇÃO CONCLUÍDA: 0 transações perdidas. Latência estabilizada em 41ms." },
        ]);
        setIsRunning(false);
      }, 700);
    }
  };

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col justify-between animate-in fade-in duration-300">
      {/* Top Header do Workbench */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#07CA6B] animate-ping" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#38BDF8]">
              BANCADA DE ENGENHARIA DE RESILIÊNCIA // LIVE FAULT INJECTION
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Simulador Interativo de Decisões de Arquitetura & Falhas
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Escolha um cenário de estresse abaixo para testar ao vivo como a infraestrutura desenvolvida no Banco Safra reage a quedas, ataques e picos.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-white/60">
          <span className="text-[#07CA6B]">SISTEMA: SEGURO</span>
          <span>•</span>
          <span>ZERO TRUST ATIVO</span>
        </div>
      </div>

      {/* Seletor de Cenários de Estresse Real (Utilidade Prática de Avaliação) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-4 shrink-0 font-mono text-xs">
        <button
          onClick={() => triggerScenario("normal")}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeScenario === "normal"
              ? "bg-[#1856FF]/20 border-[#1856FF] text-white shadow-[0_0_20px_rgba(24,86,255,0.4)]"
              : "glass-panel-subtle text-white/70 hover:bg-white/[0.06] border-white/10"
          }`}
        >
          <div className="text-[10px] text-[#38BDF8] uppercase font-bold">CENÁRIO 01</div>
          <div className="font-semibold text-xs mt-1">Tráfego Nominal</div>
          <div className="text-[10px] text-white/50 mt-0.5">Rotina 28ms</div>
        </button>

        <button
          onClick={() => triggerScenario("meta_outage")}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeScenario === "meta_outage"
              ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              : "glass-panel-subtle text-white/70 hover:bg-white/[0.06] border-white/10"
          }`}
        >
          <div className="text-[10px] text-amber-400 uppercase font-bold">CENÁRIO 02</div>
          <div className="font-semibold text-xs mt-1">Queda API Meta</div>
          <div className="text-[10px] text-white/50 mt-0.5">Circuit Breaker</div>
        </button>

        <button
          onClick={() => triggerScenario("dlp_violation")}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeScenario === "dlp_violation"
              ? "bg-red-500/20 border-red-400 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              : "glass-panel-subtle text-white/70 hover:bg-white/[0.06] border-white/10"
          }`}
        >
          <div className="text-[10px] text-red-400 uppercase font-bold">CENÁRIO 03</div>
          <div className="font-semibold text-xs mt-1">Vazamento (DLP)</div>
          <div className="text-[10px] text-white/50 mt-0.5">Sanitização Ativa</div>
        </button>

        <button
          onClick={() => triggerScenario("unauthorized_m2m")}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeScenario === "unauthorized_m2m"
              ? "bg-purple-500/20 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              : "glass-panel-subtle text-white/70 hover:bg-white/[0.06] border-white/10"
          }`}
        >
          <div className="text-[10px] text-purple-400 uppercase font-bold">CENÁRIO 04</div>
          <div className="font-semibold text-xs mt-1">Zero Trust Hack</div>
          <div className="text-[10px] text-white/50 mt-0.5">Rejeição M2M AD</div>
        </button>

        <button
          onClick={() => triggerScenario("pix_spike")}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeScenario === "pix_spike"
              ? "bg-[#07CA6B]/20 border-[#07CA6B] text-[#07CA6B] shadow-[0_0_20px_rgba(7,202,107,0.4)]"
              : "glass-panel-subtle text-white/70 hover:bg-white/[0.06] border-white/10"
          }`}
        >
          <div className="text-[10px] text-[#07CA6B] uppercase font-bold">CENÁRIO 05</div>
          <div className="font-semibold text-xs mt-1">Pico PIX 65k req</div>
          <div className="text-[10px] text-white/50 mt-0.5">100% IA Escalável</div>
        </button>
      </div>

      {/* Área Central: Topologia Ativa com Indicadores de Alerta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-2 flex-1 min-h-0 items-stretch">
        {/* Lado Esquerdo: Grafo Topológico Vivo */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-white/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 font-mono text-xs">
              <span className="text-[#38BDF8] uppercase font-bold">
                DIAGRAMA DE MALHA ARQUITETURAL
              </span>
              <span className="text-white/50">STATUS DO NÓ</span>
            </div>

            {/* Nós Interativos da Topologia */}
            <div className="space-y-3 mt-4 font-mono text-xs">
              {/* Nó Inbound */}
              <div
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  activeScenario === "meta_outage"
                    ? "bg-amber-500/20 border-amber-400 text-amber-200"
                    : "bg-white/[0.03] border-white/10 text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-[#38BDF8]" />
                  <div>
                    <div className="font-bold">Canal Ingress (Meta WhatsApp / Webhooks)</div>
                    <div className="text-[10px] text-white/60">Porta de entrada multicanal</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-black/40">
                  {activeScenario === "meta_outage" ? "CIRCUIT OPEN" : "ONLINE"}
                </span>
              </div>

              {/* Nó Broker Agnóstico */}
              <div
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  activeScenario === "dlp_violation"
                    ? "bg-red-500/20 border-red-400 text-red-200"
                    : "bg-white/[0.03] border-white/10 text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-bold">Broker Agnóstico & Filtro Heurístico DLP</div>
                    <div className="text-[10px] text-white/60">Sanitização e buffer desacoplado</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-black/40">
                  {activeScenario === "dlp_violation" ? "DLP INTERCEPT" : "INSPECTING"}
                </span>
              </div>

              {/* Nó Malha Zero Trust M2M */}
              <div
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  activeScenario === "unauthorized_m2m"
                    ? "bg-purple-500/20 border-purple-400 text-purple-200"
                    : "bg-white/[0.03] border-white/10 text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#07CA6B]" />
                  <div>
                    <div className="font-bold">Zero Trust Mesh (Tokens Ed25519 & Active Directory)</div>
                    <div className="text-[10px] text-white/60">Autenticação M2M e RBAC estrito</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-black/40">
                  {activeScenario === "unauthorized_m2m" ? "ACCESS DENIED" : "VERIFIED"}
                </span>
              </div>

              {/* Nó IA / PIX */}
              <div
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  activeScenario === "pix_spike"
                    ? "bg-[#07CA6B]/25 border-[#07CA6B] text-[#07CA6B]"
                    : "bg-white/[0.03] border-white/10 text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="font-bold">Motor 100% IA (PIX & MCP Agent Dispatcher)</div>
                    <div className="text-[10px] text-white/60">Execução semântica e ferramentas dinâmicas</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-black/40">
                  {activeScenario === "pix_spike" ? "SCALING 65K REQ" : "READY"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-white/50 flex items-center justify-between">
            <span>ISOLAMENTO DE FALHAS: ATIVO</span>
            <span className="text-[#07CA6B]">DISPONIBILIDADE: 99.99%</span>
          </div>
        </div>

        {/* Lado Direito: Terminal de Telemetria e Logs Imutáveis */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-white/15 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 font-mono text-xs">
              <span className="text-[#07CA6B] uppercase font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#07CA6B] animate-pulse" />
                CONCILIO DE TELEMETRIA & LOGS EM PRODUÇÃO
              </span>
              <button
                onClick={() => triggerScenario("normal")}
                className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Resetar Logs</span>
              </button>
            </div>

            {/* Linhas de Logs em Tempo Real */}
            <div className="space-y-2.5 mt-4 font-mono text-xs max-h-[300px] overflow-y-auto pr-1">
              {simLogs.map((log, index) => {
                const badgeColor =
                  log.level === "error"
                    ? "text-red-400 bg-red-500/10 border-red-500/30"
                    : log.level === "warn"
                    ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
                    : log.level === "success"
                    ? "text-[#07CA6B] bg-[#07CA6B]/10 border-[#07CA6B]/30"
                    : "text-[#38BDF8] bg-[#1856FF]/10 border-[#1856FF]/30";

                return (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="text-[10px] text-white/40 shrink-0 mt-0.5">
                      [{log.timestamp}]
                    </span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border shrink-0 font-bold ${badgeColor}`}>
                      {log.level}
                    </span>
                    <span className="text-white/90 text-xs">
                      {log.message}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumo Técnico da Decisão */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mt-4 font-sans text-xs text-[#94A3B8]">
            <strong className="text-white font-mono block text-[11px] uppercase mb-1">
              Por que este comportamento prova senioridade de backend:
            </strong>
            Em ambientes bancários de missão crítica, a regra de ouro é: uma falha em canal terceiro ou um ataque interno nunca pode comprometer a malha de inteligência. A separação entre Broker, Malha Zero Trust e Executores garante contenção de danos em microssegundos.
          </div>
        </div>
      </div>
    </div>
  );
}
