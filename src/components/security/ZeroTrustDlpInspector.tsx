"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  Terminal, 
  CheckCircle2, 
  AlertOctagon,
  FileCheck,
  Send,
  Eye,
  RefreshCw
} from "lucide-react";

export function ZeroTrustDlpInspector() {
  const [testPayload, setTestPayload] = useState("Cliente João da Silva, CPF 123.456.789-00, solicitando desbloqueio de PIX de R$ 15.000,00 no cartão 4111 2222 3333 4444.");
  const [hasM2mToken, setHasM2mToken] = useState(true);
  const [activeRole, setActiveRole] = useState<"BANK_MANAGER" | "GUEST" | "UNTRUSTED_APP">("BANK_MANAGER");
  const [sanitizedResult, setSanitizedResult] = useState<string | null>(null);
  const [inspectionLog, setInspectionLog] = useState<{
    cpfMasked: boolean;
    cardMasked: boolean;
    m2mValid: boolean;
    rbacGranted: boolean;
    signatureHash: string;
    decision: "ALLOWED" | "BLOCKED" | "SANITIZED_ALLOWED";
  } | null>(null);

  const runLiveSecurityScan = () => {
    // 1. Simulação do DLP Filter (Sanitização de CPF e Cartões em tempo real)
    const cpfRegex = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
    const cardRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;

    const cpfFound = cpfRegex.test(testPayload);
    const cardFound = cardRegex.test(testPayload);

    let cleanText = testPayload
      .replace(cpfRegex, "[DLP_PROTECTED_CPF:***.***.***-**]")
      .replace(cardRegex, "[DLP_PROTECTED_CARD:**** **** **** ****]");

    setSanitizedResult(cleanText);

    // 2. Simulação da Validação Zero Trust M2M + RBAC Active Directory
    const isM2mOk = hasM2mToken && activeRole !== "UNTRUSTED_APP";
    const isRbacOk = activeRole === "BANK_MANAGER";

    let finalDecision: "ALLOWED" | "BLOCKED" | "SANITIZED_ALLOWED" = "ALLOWED";

    if (!isM2mOk || !isRbacOk) {
      finalDecision = "BLOCKED";
    } else if (cpfFound || cardFound) {
      finalDecision = "SANITIZED_ALLOWED";
    }

    setInspectionLog({
      cpfMasked: cpfFound,
      cardMasked: cardFound,
      m2mValid: isM2mOk,
      rbacGranted: isRbacOk,
      signatureHash: isM2mOk ? "ed25519:7c9e12f0a82b3d" : "INVALID_SIGNATURE_ERROR",
      decision: finalDecision,
    });
  };

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col justify-between animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#07CA6B]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#38BDF8]">
              INSPETOR DE SEGURANÇA DEFENSIVA // ZERO TRUST & DLP EM TEMPO REAL
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Testador Interativo de Sanitização DLP e Assinatura M2M
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Digite ou edite o payload abaixo para testar a barreira de prevenção de vazamento de dados e autenticação mútua.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#07CA6B] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#07CA6B] animate-ping" />
            BARREIRA DLP ATIVA
          </span>
        </div>
      </div>

      {/* Grid Dual: Configuração de Teste à Esquerda & Resultado da Inspeção à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 flex-1 min-h-0 items-stretch">
        {/* Painel Esquerdo: Entrada de Dados e Controles */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-white/15 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#38BDF8] mb-1.5">
                Payload de Entrada (Mensagem ou Requisição de API):
              </label>
              <textarea
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                rows={4}
                className="w-full rounded-2xl bg-black/50 border border-white/15 p-3.5 text-xs text-white placeholder-white/40 font-mono focus:outline-none focus:border-[#1856FF] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Configuração de Contexto Zero Trust */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">
                  TOKEN M2M ASSINADO:
                </label>
                <button
                  type="button"
                  onClick={() => setHasM2mToken(!hasM2mToken)}
                  className={`w-full py-2 px-3 rounded-xl border font-mono text-xs transition-all cursor-pointer flex items-center justify-between ${
                    hasM2mToken
                      ? "bg-[#07CA6B]/20 border-[#07CA6B] text-[#07CA6B]"
                      : "bg-red-500/20 border-red-500 text-red-300"
                  }`}
                >
                  <span>{hasM2mToken ? "Ed25519 Presente" : "Sem Token (Anônimo)"}</span>
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">
                  PAPEL RBAC (ACTIVE DIRECTORY):
                </label>
                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl bg-black/40 border border-white/15 font-mono text-xs text-white focus:outline-none focus:border-[#1856FF]"
                >
                  <option value="BANK_MANAGER">Gerente Safra (Autorizado)</option>
                  <option value="GUEST">Convidado / Leitura</option>
                  <option value="UNTRUSTED_APP">App Não Homologado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={runLiveSecurityScan}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1856FF] to-[#38BDF8] hover:opacity-90 text-white font-mono text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#1856FF]/30 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Executar Verificação Zero Trust & DLP</span>
            </button>
          </div>
        </div>

        {/* Painel Direito: Telemetria de Inspeção em Tempo Real */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-white/15 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 font-mono text-xs">
              <span className="text-[#38BDF8] uppercase font-bold">
                DIAGNÓSTICO DA MALHA DE SEGURANÇA
              </span>
              <span className="text-white/40">AUDITORIA EM MILISSEGUNDOS</span>
            </div>

            {inspectionLog ? (
              <div className="space-y-4 mt-4 font-mono text-xs">
                {/* Status Principal de Decisão */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    inspectionLog.decision === "BLOCKED"
                      ? "bg-red-500/20 border-red-500 text-red-200"
                      : inspectionLog.decision === "SANITIZED_ALLOWED"
                      ? "bg-[#07CA6B]/20 border-[#07CA6B] text-[#07CA6B]"
                      : "bg-[#1856FF]/20 border-[#1856FF] text-[#38BDF8]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {inspectionLog.decision === "BLOCKED" ? (
                      <AlertOctagon className="w-5 h-5 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-[#07CA6B]" />
                    )}
                    <div>
                      <div className="font-bold text-sm">
                        DECISÃO DA MALHA: {inspectionLog.decision}
                      </div>
                      <div className="text-[10px] text-white/60">
                        {inspectionLog.decision === "BLOCKED"
                          ? "Acesso rejeitado. Token ou papel RBAC inválidos."
                          : "Acesso autorizado com sanitização ativa."}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-black/40">
                    LATÊNCIA: 14ms
                  </span>
                </div>

                {/* Métricas de Verificação */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-white/50 block mb-0.5">VAZAMENTO CPF:</span>
                    <strong className={inspectionLog.cpfMasked ? "text-amber-300" : "text-white/80"}>
                      {inspectionLog.cpfMasked ? "MASCARADO PELO DLP" : "Nenhum detectado"}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-white/50 block mb-0.5">VAZAMENTO CARTÃO:</span>
                    <strong className={inspectionLog.cardMasked ? "text-amber-300" : "text-white/80"}>
                      {inspectionLog.cardMasked ? "MASCARADO PELO DLP" : "Nenhum detectado"}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-white/50 block mb-0.5">AUTENTICAÇÃO M2M:</span>
                    <strong className={inspectionLog.m2mValid ? "text-[#07CA6B]" : "text-red-400"}>
                      {inspectionLog.m2mValid ? "VÁLIDA (Ed25519)" : "REJEITADA"}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-white/50 block mb-0.5">RBAC ACTIVE DIRECTORY:</span>
                    <strong className={inspectionLog.rbacGranted ? "text-[#07CA6B]" : "text-red-400"}>
                      {inspectionLog.rbacGranted ? "PAPEL AUTORIZADO" : "SEM PERMISSÃO"}
                    </strong>
                  </div>
                </div>

                {/* Resultado Sanitizado Enviado ao Modelo de IA */}
                <div>
                  <label className="block text-[10px] text-white/50 uppercase mb-1">
                    Payload Sanitizado Entregue com Segurança ao Broker de IA:
                  </label>
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-white/90 text-xs leading-relaxed font-sans">
                    {sanitizedResult}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-white/40 italic font-mono text-xs">
                Clique em "Executar Verificação Zero Trust & DLP" para rodar a auditoria em tempo real.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 text-[10px] font-mono text-white/50 flex items-center justify-between">
            <span>NORMA: BACEN 4.893 & LGPD</span>
            <span className="text-[#07CA6B]">NÃO-REPÚDIO: ATIVO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
