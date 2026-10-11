"use client";

import { useEffect, useState } from "react";
import { Mail, X } from "lucide-react";
import { ElicitationContactForm } from "@/components/console/ElicitationContactForm";
import { PROFILE_DATA } from "@/data/systems";

interface ContactButtonDialogProps {
  triggerText?: string;
  triggerClassName?: string;
  icon?: React.ReactNode | null;
  ariaLabel?: string;
}

export function ContactButtonDialog({
  triggerText = "Contato",
  triggerClassName = "px-3.5 py-2 rounded-xl bg-[#1856FF] hover:bg-[#1856FF]/90 text-white font-sans text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md cursor-pointer",
  icon = <Mail aria-hidden="true" className="w-3.5 h-3.5" />,
  ariaLabel = "Abrir formulário de contato direto",
}: ContactButtonDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName}
        aria-label={ariaLabel}
      >
        {icon}
        <span>{triggerText}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          className="fixed inset-0 z-[100] grid place-items-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-xl rounded-2xl glass-panel border border-white/20 p-5 shadow-2xl bg-[#0b0e17]/90 my-8">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#38BDF8]">
                  Canal Direto · Notificação em Tempo Real
                </p>
                <h2 id="contact-modal-title" className="text-base font-bold text-white">
                  Fale com {PROFILE_DATA.name.split(" ")[0]}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                aria-label="Fechar formulário"
              >
                <X aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/70 mb-4 leading-relaxed">
              Preencha o formulário abaixo. Os dados são validados no servidor e despachados instantaneamente via bot do Telegram para alerta imediato.
            </p>

            <ElicitationContactForm />
          </div>
        </div>
      )}
    </>
  );
}
