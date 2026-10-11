"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, ShieldQuestion, XCircle } from "lucide-react";
import { submitRecruiterSignal, type SignalState } from "@/app/actions";

const initial: SignalState = { status: "idle" };

/**
 * Formulário progressivo de fallback via Server Action; não é uma chamada MCP Elicitation.
 * accept → valida e persiste; decline/cancel → encerram sem efeitos colaterais.
 */
interface ElicitationContactFormProps {
  onCancel?: () => void;
}

export function ElicitationContactForm({ onCancel }: ElicitationContactFormProps = {}) {
  const [state, formAction, pending] = useActionState(submitRecruiterSignal, initial);

  if (state.status === "accepted" && state.channels) {
    return (
      <div className="p-4 rounded-xl bg-[#07CA6B]/10 border border-[#07CA6B]/30 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-[#07CA6B] font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> {state.message}
        </div>
        <div className="space-y-1.5 text-white/90 pt-2 border-t border-[#07CA6B]/20">
          <div>
            E-mail:{" "}
            <a href={`mailto:${state.channels.email}`} className="text-sky-300 underline font-semibold">
              {state.channels.email}
            </a>
          </div>
          <div>
            Telefone / WhatsApp: <span className="text-sky-300 font-semibold">{state.channels.phone}</span>
          </div>
          <div>
            LinkedIn:{" "}
            <a href={state.channels.linkedin} target="_blank" rel="noreferrer" className="text-sky-300 underline font-semibold">
              {state.channels.linkedin}
            </a>
          </div>
        </div>
        <div className="text-white/40 text-[11px] pt-1">recibo · {state.receiptId}</div>
      </div>
    );
  }

  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-3">
      <p className="rounded-xl border border-white/10 bg-white/[0.06] p-3 text-xs leading-relaxed text-white/80">
        Informe nome, e-mail, telefone (opcional), empresa (opcional) e motivo para contato direto. Recusar ou cancelar não envia nem grava os dados.
      </p>

      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <label className="block text-xs text-white/80">
        Nome <span aria-hidden="true" className="text-rose-300">*</span>
        <input
          name="name"
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
          placeholder="Seu nome"
          className={`mt-1 w-full rounded-lg border bg-black/35 px-3 py-2 text-xs text-white outline-none focus:border-[#1856FF] ${err.name ? "border-[#EA2143]" : "border-white/15"}`}
        />
        {err.name && <span className="mt-0.5 block text-[10px] text-[#EA2143]">{err.name}</span>}
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block text-xs text-white/80">
          E-mail <span aria-hidden="true" className="text-rose-300">*</span>
          <input
            name="email"
            required
            type="email"
            maxLength={200}
            autoComplete="email"
            placeholder="seu.email@empresa.com"
            className={`mt-1 w-full rounded-lg border bg-black/35 px-3 py-2 text-xs text-white outline-none focus:border-[#1856FF] ${err.email ? "border-[#EA2143]" : "border-white/15"}`}
          />
          {err.email && <span className="mt-0.5 block text-[10px] text-[#EA2143]">{err.email}</span>}
        </label>
        <label className="block text-xs text-white/80">
          Telefone / WhatsApp (opcional)
          <input
            name="phone"
            type="tel"
            maxLength={40}
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-xs text-white outline-none focus:border-[#1856FF]"
          />
        </label>
      </div>

      <label className="block text-xs text-white/80">
        Empresa (opcional)
        <input
          name="company"
          maxLength={120}
          autoComplete="organization"
          placeholder="Nome da empresa"
          className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-xs text-white outline-none focus:border-[#1856FF]"
        />
      </label>

      <label className="block text-xs text-white/80">
        Motivo <span aria-hidden="true" className="text-rose-300">*</span>
        <select
          name="intent"
          required
          defaultValue=""
          className={`mt-1 w-full rounded-lg border bg-[#141414] px-3 py-2 text-xs text-white outline-none focus:border-[#1856FF] ${err.intent ? "border-[#EA2143]" : "border-white/15"}`}
        >
          <option value="" disabled>
            Selecione
          </option>
          <option value="vaga-senior-staff">Vaga sênior/staff</option>
          <option value="consultoria">Consultoria</option>
          <option value="palestra">Palestra</option>
          <option value="outro">Outro</option>
        </select>
        {err.intent && <span className="mt-0.5 block text-[10px] text-[#EA2143]">{err.intent}</span>}
      </label>

      {state.status === "error" && state.message && !Object.keys(err).length && (
        <div className="flex items-center gap-1.5 text-[#EA2143] text-xs">
          <XCircle className="w-3.5 h-3.5 shrink-0" /> {state.message}
        </div>
      )}
      {state.status === "idle" && state.message && <div className="text-white/60 text-xs">{state.message}</div>}

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <button
          type={onCancel ? "button" : "submit"}
          onClick={onCancel}
          name="decision"
          value="decline"
          formNoValidate
          disabled={pending}
          className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/75 hover:bg-white/10 cursor-pointer"
        >
          Recusar
        </button>
        <button
          type={onCancel ? "button" : "submit"}
          onClick={onCancel}
          name="decision"
          value="cancel"
          formNoValidate
          disabled={pending}
          className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/75 hover:bg-white/10 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          name="decision"
          value="accept"
          disabled={pending}
          className="rounded-lg border border-[#1856FF] bg-[#1856FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1856FF]/90 disabled:opacity-60 flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Aceitar e enviar
        </button>
      </div>
    </form>
  );
}
