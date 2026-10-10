"use client";

import { useState } from "react";
import { AlertOctagon, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { simulateSecurityInspection } from "./securitySimulation.mjs";

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
    decision: "ALLOWED" | "BLOCKED" | "SANITIZED_ALLOWED";
    durationMs: number;
  } | null>(null);

  const runLocalSecuritySimulation = () => {
    const startedAt = performance.now();
    const result = simulateSecurityInspection(testPayload, {
      hasToken: hasM2mToken,
      role: activeRole,
    });

    setSanitizedResult(result.sanitizedText);
    setInspectionLog({ ...result, durationMs: performance.now() - startedAt });
  };

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col justify-between animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#07CA6B]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#38BDF8]">
              INSPETOR LOCAL // DEMONSTRAÇÃO DE REGRAS DLP E AUTORIZAÇÃO
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Playground local de mascaramento e autorização
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Regras ilustrativas executadas neste navegador; sem validação criptográfica, Active Directory ou conexão bancária.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#07CA6B] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#07CA6B] animate-ping" />
            REGRAS LOCAIS PRONTAS
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
                  CREDENCIAL DE TESTE:
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
                  <span>{hasM2mToken ? "Token de teste presente" : "Sem token de teste"}</span>
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">
                  PAPEL DE TESTE (SEM AD):
                </label>
                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value as "BANK_MANAGER" | "GUEST" | "UNTRUSTED_APP")}
                  className="w-full py-2 px-3 rounded-xl bg-black/40 border border-white/15 font-mono text-xs text-white focus:outline-none focus:border-[#1856FF]"
                >
                  <option value="BANK_MANAGER">BANK_MANAGER (permitido nesta demo)</option>
                  <option value="GUEST">GUEST (sem autorização)</option>
                  <option value="UNTRUSTED_APP">UNTRUSTED_APP (bloqueado)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={runLocalSecuritySimulation}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1856FF] to-[#38BDF8] hover:opacity-90 text-white font-mono text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#1856FF]/30 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Executar simulação local</span>
            </button>
          </div>
        </div>

        {/* Painel Direito: Telemetria de Inspeção em Tempo Real */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-white/15 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 font-mono text-xs">
              <span className="text-[#38BDF8] uppercase font-bold">
                RESULTADO DA SIMULAÇÃO LOCAL
              </span>
              <span className="text-white/40">EXECUÇÃO NO NAVEGADOR</span>
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
                    {`EXECUÇÃO LOCAL: ${inspectionLog.durationMs.toFixed(2)} ms`}
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
                    <span className="text-white/50 block mb-0.5">TOKEN DE TESTE:</span>
                    <strong className={inspectionLog.m2mValid ? "text-[#07CA6B]" : "text-red-400"}>
                      {inspectionLog.m2mValid ? "PRESENTE (SIMULADO)" : "AUSENTE / NÃO CONFIÁVEL"}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-white/50 block mb-0.5">PAPEL LOCAL (SIMULADO):</span>
                    <strong className={inspectionLog.rbacGranted ? "text-[#07CA6B]" : "text-red-400"}>
                      {inspectionLog.rbacGranted ? "PAPEL AUTORIZADO" : "SEM PERMISSÃO"}
                    </strong>
                  </div>
                </div>

                {/* Resultado Sanitizado Enviado ao Modelo de IA */}
                <div>
                  <label className="block text-[10px] text-white/50 uppercase mb-1">
                    Payload mascarado nesta simulação local:
                  </label>
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-white/90 text-xs leading-relaxed font-sans">
                    {sanitizedResult}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-white/40 italic font-mono text-xs">
                Clique em &quot;Executar simulação local&quot; para ver o resultado das regras no navegador.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 text-[10px] font-mono text-white/50 flex items-center justify-between">
            <span>EXEMPLO DIDÁTICO • SEM INTEGRAÇÃO BACEN</span>
            <span className="text-[#07CA6B]">CRIPTOGRAFIA REAL: NÃO IMPLEMENTADA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
