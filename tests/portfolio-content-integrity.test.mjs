import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sourceFiles = [
  "../src/data/systems.ts",
  "../src/components/inspector/ArchitectureInspector.tsx",
  "../src/components/inspector/PipelineSimulator.tsx",
  "../src/components/modes/ModeArchitect.tsx",
  "../src/components/cyberpunk/CyberpunkHeroView.tsx",
  "../src/components/workbench/SystemResilienceWorkbench.tsx",
];
const source = (await Promise.all(sourceFiles.map((path) => readFile(new URL(path, import.meta.url), "utf8")))).join("\n");
const systems = await readFile(new URL("../src/data/systems.ts", import.meta.url), "utf8");

test("does not publish invented project codenames or unsupported performance metrics", () => {
  for (const unsupported of ["HYPERION-BROKER", "AEGIS-M2M", "SENTINEL-DLP", "NEXUS-PIX", "< 45ms", "99.99%", "> 92%", "98.4%", "Ed25519 / RSA", "14.2k req/s", "15.8k req/s", "TR-8942-SR", "28ms", "65k req", "65k REQ", "5000ms", "workers horizontal scaling"]) {
    assert.equal(source.includes(unsupported), false, `unsupported claim remains: ${unsupported}`);
  }
});

test("uses curriculum facts and source labels instead of metrics or project codenames", () => {
  assert.match(systems, /sourceLabel:\s*string/);
  assert.match(systems, /facts:\s*\{/);
  assert.doesNotMatch(systems, /\bcodename\s*:/);
  assert.doesNotMatch(systems, /\bmetrics\s*:/);
});

test("uses CV-supported claims and identifies the portfolio demo separately from Safra work", () => {
  for (const supported of ["Banco Safra · experiência interna", "WhatsApp", "Telegram", "Active Directory", "100% IA", "Promoção em 7 meses", "Demonstração técnica do portfólio"]) {
    assert.equal(systems.toLocaleLowerCase("pt-BR").includes(supported.toLocaleLowerCase("pt-BR")), true, `CV-supported label missing: ${supported}`);
  }
});

test("simulators and inspectors disclaim real production calls and telemetry", () => {
  for (const misleading of ["PRODUCTION REPLICA", "LIVE ARCHITECTURE SANDBOX", "LATÊNCIA DE FLUXO", "Resiliência Garantida", "Produção Ativa", "TELEMETRIA DE MAINFRAME"]) {
    assert.equal(source.toLocaleUpperCase("pt-BR").includes(misleading.toLocaleUpperCase("pt-BR")), false, `misleading interface claim remains: ${misleading}`);
  }
  assert.match(source, /não chama sistemas internos/i);
});
