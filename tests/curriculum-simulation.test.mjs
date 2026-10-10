import test from "node:test";
import assert from "node:assert/strict";
import { buildCurriculumSimulationEvents } from "../src/components/inspector/curriculumSimulation.mjs";

test("simulation events follow only the selected CV summary and disclose that no production system ran", () => {
  const events = buildCurriculumSimulationEvents({
    title: "Exemplo curricular",
    executionFlow: [
      { step: "ETAPA A", title: "Canal", description: "Mensagem via canal descrito no CV." },
      { step: "ETAPA B", title: "Atendimento", description: "Resumo do atendimento reportado." },
    ],
  });
  assert.equal(events.length, 4);
  assert.match(events[0], /SIMULAÇÃO LOCAL/);
  assert.match(events[1], /ETAPA A.*Canal/);
  assert.match(events[2], /ETAPA B.*Atendimento/);
  assert.match(events[3], /nenhum sistema real foi chamado/i);
  assert.equal(events.some((event) => /\d+(?:\.\d+)?ms|latência nominal|token Ed25519/i.test(event)), false);
});
