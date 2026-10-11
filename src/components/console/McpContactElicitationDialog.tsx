"use client";

import { useEffect, useId, useState } from "react";
import { buildPortfolioContactAcceptResponse, type PortfolioContactElicitationResponse } from "@/mcp/contactElicitation.mjs";

interface Props {
  message: string;
  onRespond: (response: PortfolioContactElicitationResponse) => void;
}

export function McpContactElicitationDialog({ message, onRespond }: Props) {
  const titleId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [intent, setIntent] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onRespond({ action: "cancel" });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onRespond]);

  const decline = () => onRespond({ action: "decline" });
  const cancel = () => onRespond({ action: "cancel" });

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4" data-testid="mcp-contact-elicitation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="glass-panel w-full max-w-lg rounded-2xl border border-white/20 p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#38BDF8]">MCP · elicitation/create</p>
            <h2 id={titleId} className="mt-1 text-lg font-semibold text-white">Solicitar contato</h2>
          </div>
          <button type="button" onClick={cancel} aria-label="Cancelar solicitação" className="rounded-lg px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white">×</button>
        </div>

        <p className="mb-4 rounded-xl border border-white/10 bg-white/[0.06] p-3 text-xs leading-relaxed text-white/80">{message}</p>

        <form onSubmit={(event) => {
          event.preventDefault();
          onRespond(buildPortfolioContactAcceptResponse({ name, email, phone, company, intent }));
        }} className="space-y-3">
          <label className="block text-xs text-white/80">
            Nome <span aria-hidden="true" className="text-rose-300">*</span>
            <input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-white outline-none focus:border-[#1856FF]" />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block text-xs text-white/80">
              E-mail <span aria-hidden="true" className="text-rose-300">*</span>
              <input required type="email" maxLength={200} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-white outline-none focus:border-[#1856FF]" />
            </label>
            <label className="block text-xs text-white/80">
              Telefone / WhatsApp (opcional)
              <input type="tel" maxLength={40} autoComplete="tel" placeholder="(11) 99999-9999" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-white outline-none focus:border-[#1856FF]" />
            </label>
          </div>
          <label className="block text-xs text-white/80">
            Empresa (opcional)
            <input maxLength={120} autoComplete="organization" value={company} onChange={(event) => setCompany(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-white outline-none focus:border-[#1856FF]" />
          </label>
          <label className="block text-xs text-white/80">
            Motivo <span aria-hidden="true" className="text-rose-300">*</span>
            <select required value={intent} onChange={(event) => setIntent(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-[#141414] px-3 py-2 text-white outline-none focus:border-[#1856FF]">
              <option value="">Selecione</option>
              <option value="vaga-senior-staff">Vaga sênior/staff</option>
              <option value="consultoria">Consultoria</option>
              <option value="palestra">Palestra</option>
              <option value="outro">Outro</option>
            </select>
          </label>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={decline} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/75 hover:bg-white/10">Recusar</button>
            <button type="button" onClick={cancel} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/75 hover:bg-white/10">Cancelar</button>
            <button type="submit" className="rounded-lg border border-[#1856FF] bg-[#1856FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1856FF]/90">Aceitar e enviar</button>
          </div>
        </form>
      </section>
    </div>
  );
}
