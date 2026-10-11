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
          <div className="relative w-full max-w-lg rounded-2xl glass-panel border border-white/20 p-5 shadow-2xl bg-[#0b0e17]/95 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#38BDF8]">
                  MCP · ELICITATION/CREATE
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <h2 id="contact-modal-title" className="text-lg font-semibold text-white">
                    Solicitar contato
                  </h2>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-[#1856FF]/40 bg-[#1856FF]/10 text-[#38BDF8]">
                    CONTATO 1.00
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-lg leading-none"
                aria-label="Fechar formulário"
              >
                ×
              </button>
            </div>

            <ElicitationContactForm onCancel={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
