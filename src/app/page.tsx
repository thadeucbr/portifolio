import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PROFILE_DATA } from "@/data/systems";
import { SynapticNeuralMesh } from "@/components/neural/SynapticNeuralMesh";
import { StageShell } from "@/components/stage/StageShell";
import { ElicitationContactForm } from "@/components/console/ElicitationContactForm";

export const metadata: Metadata = {
  title: "Thadeu Ramos | Senior Software Engineer & AI Systems Architect",
  description:
    "Portfólio interativo de engenharia de plataformas, segurança e sistemas de Inteligência Artificial.",
};

/** Server-rendered page shell; only the interactive canvas and stage are client islands. */
export default function Home() {
  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-[#060810] text-[#FFFFFF] font-sans flex flex-col">
      <div aria-hidden="true" className="ambient-glow-primary top-10 -left-20 opacity-20" />
      <div aria-hidden="true" className="ambient-glow-secondary top-40 right-0 opacity-25" />
      <div aria-hidden="true" className="ambient-glow-primary bottom-10 right-1/4 opacity-20" />
      <SynapticNeuralMesh />

      <header className="relative z-40 w-full px-3 sm:px-6 pt-3 sm:pt-4">
        <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between gap-4 border border-white/15 shadow-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div aria-hidden="true" className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1856FF] to-[#38BDF8] flex items-center justify-center font-mono font-bold text-xs shadow-[0_0_20px_rgba(24,86,255,0.6)]">
              TR
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-bold text-sm text-white tracking-tight">{PROFILE_DATA.name}</span>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#07CA6B]/15 text-[#07CA6B] border border-[#07CA6B]/30 flex items-center gap-1">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#07CA6B] animate-pulse" />
                  PORTFÓLIO INTERATIVO
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8] truncate">
                {PROFILE_DATA.role} • Backend & AI Systems Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-sans shrink-0">
            <a href={PROFILE_DATA.contact.github} target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors">GitHub</a>
            <a href={PROFILE_DATA.contact.linkedin} target="_blank" rel="noreferrer" className="hidden sm:inline text-white/70 hover:text-white transition-colors">LinkedIn</a>
            <a href={`mailto:${PROFILE_DATA.contact.email}`} className="px-3 py-2 rounded-xl bg-[#1856FF] hover:bg-[#1856FF]/90 text-white font-sans font-medium flex items-center gap-1.5 transition-colors shadow-md">
              <Mail aria-hidden="true" className="w-3.5 h-3.5" />
              <span>Contato</span>
            </a>
          </div>
        </div>
      </header>

      <StageShell />
      <noscript>
        <section className="relative z-50 mx-auto w-full max-w-2xl px-4 pb-8" aria-label="Contato acessível sem JavaScript">
          <h2 className="mb-3 text-lg font-semibold text-white">Contato sem JavaScript</h2>
          <ElicitationContactForm />
        </section>
      </noscript>
    </main>
  );
}
