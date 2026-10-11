"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Mic, Square } from "lucide-react";
import { mixAudioChannelsToMono, resampleMonoAudio } from "@/ai/audioResampling.mjs";
import type { LocalAsrDevice, LocalAsrPhase, LocalAsrRequest, LocalAsrResponse } from "@/ai/localAsrProtocol";

const MODEL_URL = "https://huggingface.co/onnx-community/whisper-small/tree/36050c46d777d46dc4b5f43f6d90574fc38f8732";
const MAX_RECORDING_MS = 20_000;

interface ProgressState {
  loaded?: number;
  total?: number;
  percent?: number;
}

export function LocalAsrPanel({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [phase, setPhase] = useState<LocalAsrPhase>("idle");
  const [detail, setDetail] = useState("Transcrição local desligada.");
  const [device, setDevice] = useState<LocalAsrDevice>();
  const [progress, setProgress] = useState<ProgressState>({});
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const workerRef = useRef<Worker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (recorderRef.current) {
      recorderRef.current.onstop = null;
      if (recorderRef.current.state !== "inactive") recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    workerRef.current?.terminate();
  }, []);

  const loadModel = () => {
    if (workerRef.current && phase !== "error") return;
    workerRef.current?.terminate();
    workerRef.current = null;
    setError("");
    setTranscript("");
    setPhase("probing");
    setDetail("Preparando Whisper Small local…");

    const worker = new Worker(new URL("../../workers/localAsr.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<LocalAsrResponse>) => {
      const message = event.data;
      if (message.type === "status") {
        setPhase(message.phase);
        setDetail(message.detail);
        if (message.device) setDevice(message.device);
        if (message.loaded !== undefined || message.total !== undefined || message.percent !== undefined) {
          setProgress({ loaded: message.loaded, total: message.total, percent: message.percent });
        }
        if (message.phase === "error") setError(message.detail);
      } else if (message.type === "transcript") {
        setTranscript(message.text);
        setDevice(message.device);
        setPhase("ready");
        setDetail(`Transcrição local concluída em ${Math.round(message.inferenceMs)} ms.`);
        setProgress({});
      } else {
        setError(message.detail);
        setDetail(message.detail);
        setPhase(device ? "ready" : "error");
        setProgress({});
      }
    };
    worker.onerror = () => {
      setError("O worker local de transcrição falhou.");
      setPhase("error");
      setDetail("O worker local de transcrição falhou.");
    };
    const request: LocalAsrRequest = { type: "load" };
    worker.postMessage(request);
  };

  const transcribeBlob = async (blob: Blob) => {
    const worker = workerRef.current;
    if (!worker) throw new Error("Ative o modelo local antes de gravar.");
    setPhase("transcribing");
    setDetail("Convertendo áudio e transcrevendo no worker local…");
    setError("");

    const audioContext = new AudioContext();
    try {
      const decoded = await audioContext.decodeAudioData(await blob.arrayBuffer());
      const channels = Array.from({ length: decoded.numberOfChannels }, (_, index) => decoded.getChannelData(index));
      const mono = mixAudioChannelsToMono(channels);
      const audio = resampleMonoAudio(mono, decoded.sampleRate, 16_000);
      if (audio.length > 16_000 * 25) throw new Error("A gravação excedeu o limite local de duração.");

      const requestId = `whisper-${++requestIdRef.current}`;
      const request: LocalAsrRequest = { type: "transcribe", requestId, audio };
      worker.postMessage(request, [audio.buffer]);
    } finally {
      await audioContext.close().catch(() => undefined);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const startRecording = async () => {
    if (phase !== "ready" || !workerRef.current) return;
    setError("");
    setTranscript("");
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Este navegador não oferece gravação de áudio compatível.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : undefined;
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        if (blob.size === 0) {
          setPhase("ready");
          setError("Nenhum áudio foi gravado.");
          return;
        }
        void transcribeBlob(blob).catch((cause: unknown) => {
          setPhase("ready");
          setError(cause instanceof Error ? cause.message : "Não foi possível processar o áudio.");
        });
      };
      recorder.start(250);
      setPhase("recording");
      setDetail("Gravando localmente · limite de 20 segundos.");
      timerRef.current = setTimeout(stopRecording, MAX_RECORDING_MS);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Não foi possível iniciar a gravação.";
      setError(message);
      setDetail(message);
      setPhase("ready");
    }
  };

  const loading = ["probing", "downloading", "loading"].includes(phase);
  const percent = Math.max(0, Math.min(100, progress.percent ?? 0));

  return (
    <details className="border-y border-white/10 bg-black/15">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-2.5 text-xs text-white/80">
        <span className="min-w-0">
          <span className="block font-semibold text-emerald-200">TRANSCRIÇÃO LOCAL · WHISPER SMALL</span>
          <span className="mt-0.5 block text-[11px] text-white/50">Opt-in · ≈300 MB Q4 · áudio fica nesta aba</span>
        </span>
        <span className="shrink-0 rounded border border-emerald-400/30 px-2.5 py-1 font-mono text-xs text-emerald-200">
          {device ? device.toUpperCase() : phase === "idle" ? "DESLIGADO" : phase.toUpperCase()}
        </span>
      </summary>
      <div className="space-y-2 px-3.5 pb-3">
        <p className="text-[11px] leading-relaxed text-white/60">
          O modelo é baixado só após ativação. Microfone somente após Gravar; gravação máx. 20 s; texto aparece para revisão e não é enviado até você pressionar Enviar no chat. {" "}
          <a href={MODEL_URL} target="_blank" rel="noreferrer" className="underline decoration-white/30 hover:text-white/80">snapshot Apache-2.0</a>
        </p>
        <div className="flex flex-wrap gap-2">
          {!device && (
            <button type="button" onClick={loadModel} disabled={loading} className="flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1.5 font-mono text-xs text-emerald-100 hover:bg-emerald-400/20 disabled:opacity-60">
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              {loading ? "CARREGANDO" : "ATIVAR WHISPER"}
            </button>
          )}
          {phase === "ready" && (
            <button type="button" onClick={() => void startRecording()} className="flex items-center gap-1.5 rounded-lg border border-rose-400/40 bg-rose-400/10 px-2.5 py-1.5 font-mono text-xs text-rose-100 hover:bg-rose-400/20">
              <Mic className="h-3 w-3" /> GRAVAR 20s
            </button>
          )}
          {phase === "recording" && (
            <button type="button" onClick={stopRecording} className="flex items-center gap-1.5 rounded-lg border border-rose-400/50 bg-rose-500/20 px-2.5 py-1.5 font-mono text-xs text-rose-100">
              <Square className="h-3 w-3 fill-current" /> PARAR GRAVAÇÃO
            </button>
          )}
          {phase === "transcribing" && <span role="status" className="flex items-center gap-1.5 font-mono text-xs text-emerald-200"><Loader2 className="h-3 w-3 animate-spin" /> transcrevendo no worker…</span>}
          {(phase === "idle" || phase === "error") && <span className="font-mono text-[11px] text-white/50">{detail}</span>}
        </div>
        {loading && (
          <div role="status" aria-live="polite" className="space-y-1">
            <div className="flex justify-between gap-2 font-mono text-[11px] text-white/60">
              <span className="truncate">{detail}</span>
              <span>{percent.toFixed(0)}%{progress.total ? ` · ${(progress.loaded ?? 0) / 1_000_000 | 0} / ${(progress.total / 1_000_000) | 0} MB` : ""}</span>
            </div>
            <div className="h-1 overflow-hidden rounded bg-white/10"><div className="h-full bg-emerald-400" style={{ width: `${percent}%` }} /></div>
          </div>
        )}
        {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
        {transcript && (
          <div className="space-y-2">
            <label className="block text-xs text-white/65">
              TRANSCRIÇÃO PARA REVISÃO
              <textarea rows={3} value={transcript} onChange={(event) => setTranscript(event.target.value)} className="mt-1 w-full resize-y rounded-lg border border-white/10 bg-black/30 p-2 text-xs leading-relaxed text-white/90" />
            </label>
            <button type="button" onClick={() => onTranscript(transcript)} className="rounded-lg border border-[#1856FF]/50 bg-[#1856FF]/15 px-2.5 py-1.5 font-mono text-xs text-sky-100 hover:bg-[#1856FF]/25">INSERIR NO CHAT PARA REVISÃO</button>
          </div>
        )}
      </div>
    </details>
  );
}
