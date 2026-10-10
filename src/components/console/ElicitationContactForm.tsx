"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, ShieldQuestion, XCircle } from "lucide-react";
import { submitRecruiterSignal, type SignalState } from "@/app/actions";

const initial: SignalState = { status: "idle" };

/**
 * Formulário progressivo de fallback via Server Action; não é uma chamada MCP Elicitation.
 * accept → valida e persiste; decline/cancel → encerram sem efeitos colaterais.
 */
export function ElicitationContactForm() {
  const [state, formAction, pending] = useActionState(submitRecruiterSignal, initial);

  if (state.status === "accepted" && state.channels) {
    return (
      <div className="p-3 rounded-lg bg-[#07CA6B]/10 border border-[#07CA6B]/30 space-y-2 font-mono text-[11px]">
        <div className="flex items-center gap-1.5 text-[#07CA6B] font-bold text-xs">
          <CheckCircle2 className="w-4 h-4" /> {state.message}
        </div>
        <div className="space-y-1 text-white/90">
          <div>
            E-mail:{" "}
            <a href={`mailto:${state.channels.email}`} className="text-sky-300 underline">
              {state.channels.email}
            </a>
          </div>
          <div>
            Telefone/WhatsApp: <span className="text-sky-300">{state.channels.phone}</span>
          </div>
          <div>
            LinkedIn:{" "}
            <a href={state.channels.linkedin} target="_blank" rel="noreferrer" className="text-sky-300 underline">
              {state.channels.linkedin}
            </a>
          </div>
        </div>
        <div className="text-white/40 text-[10px]">receipt: {state.receiptId}</div>
      </div>
    );
  }

  const err = state.fieldErrors ?? {};
  const field =
    "w-full bg-white/[0.06] border rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-white/35 focus:outline-none focus:border-[#1856FF]";

  return (
    <form action={formAction} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
      <div className="flex items-center gap-2 text-amber-300 font-semibold font-mono">
        <ShieldQuestion className="w-4 h-4" /> CONSENTIMENTO DE CONTATO · SERVER ACTION
      </div>
      <p className="text-white/70 text-[11px] leading-relaxed">
        Para solicitar contato, informe seus dados profissionais. Em desenvolvimento, sem Telegram configurado, ficam neste servidor;
        em produção, ao aceitar, nome, e-mail, empresa e motivo são enviados ao responsável via Telegram (serviço de terceiros).
        Sem bot e chat ID configurados, o pedido é recusado sem gravação local. Não inclua informações sensíveis.
      </p>

      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <input name="name" placeholder="Nome" className={`${field} ${err.name ? "border-[#EA2143]" : "border-white/15"}`} />
          {err.name && <span className="text-[10px] text-[#EA2143]">{err.name}</span>}
        </div>
        <div>
          <input
            name="email"
            type="email"
            placeholder="E-mail corporativo"
            className={`${field} ${err.email ? "border-[#EA2143]" : "border-white/15"}`}
          />
          {err.email && <span className="text-[10px] text-[#EA2143]">{err.email}</span>}
        </div>
        <input name="company" placeholder="Empresa (opcional)" className={`${field} border-white/15`} />
        <div>
          <select
            name="intent"
            defaultValue=""
            className={`${field} ${err.intent ? "border-[#EA2143]" : "border-white/15"} [&>option]:bg-[#0b0f1a]`}
          >
            <option value="" disabled>
              Motivo
            </option>
            <option value="vaga-senior-staff">Vaga Sênior / Staff</option>
            <option value="consultoria">Consultoria</option>
            <option value="palestra">Palestra</option>
            <option value="outro">Outro</option>
          </select>
          {err.intent && <span className="text-[10px] text-[#EA2143]">{err.intent}</span>}
        </div>
      </div>

      {state.status === "error" && state.message && !Object.keys(err).length && (
        <div className="flex items-center gap-1.5 text-[#EA2143] text-[11px]">
          <XCircle className="w-3.5 h-3.5" /> {state.message}
        </div>
      )}
      {state.status === "idle" && state.message && <div className="text-white/50 text-[11px]">{state.message}</div>}

      <div className="flex items-center gap-2 pt-1 font-mono">
        <button
          type="submit"
          name="decision"
          value="accept"
          disabled={pending}
          className="px-3 py-1 rounded bg-[#07CA6B] text-black font-bold hover:bg-[#07CA6B]/90 disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
        >
          {pending && <Loader2 className="w-3 h-3 animate-spin" />} accept
        </button>
        <button
          type="submit"
          name="decision"
          value="decline"
          formNoValidate
          disabled={pending}
          className="px-3 py-1 rounded bg-white/10 text-white/70 hover:bg-white/20 cursor-pointer"
        >
          decline
        </button>
        <button
          type="submit"
          name="decision"
          value="cancel"
          formNoValidate
          disabled={pending}
          className="px-3 py-1 rounded border border-white/10 text-white/50 hover:bg-white/10 cursor-pointer"
        >
          cancel
        </button>
      </div>
    </form>
  );
}
