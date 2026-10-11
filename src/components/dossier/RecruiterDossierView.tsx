"use client";

import { useState } from "react";
import { PROFILE_DATA, SYSTEMS_DATA } from "@/data/systems";
import { Award, Download } from "lucide-react";
import { ContactButtonDialog } from "@/components/contact/ContactButtonDialog";

export function RecruiterDossierView() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://thadeucbr.github.io");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col justify-between animate-in fade-in duration-300 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#07CA6B]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#38BDF8]">
              DOSSIÊ EXECUTIVO DE ENGENHARIA // RELATÓRIO DE SENIORIDADE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Thadeu Castelo Branco Ramos • Resumo de Decisões e Competências
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Documento consolidado para avaliação de Tech Leads, Diretores e CTOs.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs no-print">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-xl glass-panel hover:bg-white/[0.1] text-white border border-white/15 cursor-pointer transition-colors"
          >
            {copied ? "Link Copiado!" : "Compartilhar Link"}
          </button>
          <a
            href="/CV%20-%20Thadeu%20Castelo%20Branco%20Ramos%20-%202026.pdf"
            download="CV - Thadeu Castelo Branco Ramos - 2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-[#1856FF] hover:bg-[#1856FF]/90 text-white flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
            aria-label="Baixar currículo em PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar PDF</span>
          </a>
        </div>
      </div>

      {/* Conteúdo do Dossiê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4 flex-1">
        {/* Coluna 1: Dados do Engenheiro e Trajetória */}
        <div className="glass-panel rounded-3xl p-6 border border-white/15 space-y-4">
          <div>
            <span className="font-mono text-[10px] text-[#38BDF8] uppercase">
              STATUS ATUAL
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Engenheiro de Software Sênior
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Banco Safra • São Paulo, SP (Remoto / Híbrido)
            </p>
          </div>

          <div className="pt-2 border-t border-white/10 text-xs text-[#94A3B8] leading-relaxed">
            {PROFILE_DATA.summary}
          </div>

          <div className="pt-2 border-t border-white/10 space-y-2 font-mono text-xs">
            <span className="text-[#38BDF8] text-[10px] uppercase block">
              CONTATOS OFICIAIS:
            </span>
            <div className="text-white/80">E-mail: {PROFILE_DATA.contact.email}</div>
            <div className="text-white/80">Tel: {PROFILE_DATA.contact.phone}</div>
            <div className="text-white/80">
              Medium: <a href={PROFILE_DATA.contact.medium} target="_blank" rel="noreferrer" className="text-[#38BDF8] hover:underline">@thadeucbr</a>
            </div>
            <div className="text-white/80">Inglês: C2 Proficient (EF SET 75/100)</div>
          </div>

          <div className="pt-2 border-t border-white/10 space-y-1 font-mono text-xs">
            <span className="text-[#38BDF8] text-[10px] uppercase block">
              FORMAÇÃO:
            </span>
            <div className="text-white font-semibold">Pós-Graduação em IA e Machine Learning</div>
            <div className="text-white/60 text-[11px]">PUC Minas (2026)</div>
          </div>
        </div>

        {/* Coluna 2 e 3: Os 5 Pilares de Arquitetura Comprovados */}
        <div className="md:col-span-2 glass-panel rounded-3xl p-6 border border-white/15 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 font-mono text-xs">
              <span className="text-[#07CA6B] font-bold uppercase">
                EXPERIÊNCIA E DEMONSTRAÇÕES • RESUMOS CURRICULARES
              </span>
              <span className="text-white/50">RESUMO CURRICULAR</span>
            </div>

            <div className="grid gap-3 mt-3">
              {SYSTEMS_DATA.map((sys) => (
                <div
                  key={sys.id}
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#38BDF8] font-bold">
                        {sys.shortLabel}
                      </span>
                      <span className="text-white/40">•</span>
                      <span className="text-xs font-bold text-white">{sys.title}</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
                      {sys.summary}
                    </p>
                  </div>

                  <div className="text-right shrink-0 font-mono text-xs">
                    <span className="text-[#07CA6B] font-bold block">{sys.facts[0].value}</span>
                    <span className="text-[10px] text-white/40">{sys.facts[0].label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Destaque de Contratação */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1856FF]/20 to-[#07CA6B]/15 border border-[#1856FF]/40 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono">
                Pronto para Liderar Arquiteturas Complexas de Backend e IA
              </h4>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Capacidade de acelerar entregas, mitigar riscos de vazamento e desenhar plataformas tolerantes a falhas.
              </p>
            </div>
            <ContactButtonDialog
              triggerText="Iniciar Conversa"
              triggerClassName="px-4 py-2 rounded-xl bg-[#1856FF] hover:bg-[#1856FF]/90 text-white font-mono text-xs font-semibold shrink-0 cursor-pointer shadow-md transition-colors"
              icon={null}
              ariaLabel="Iniciar conversa e enviar mensagem"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
