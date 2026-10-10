import test from "node:test";
import assert from "node:assert/strict";
import { buildProjectSimulationEvents } from "../src/components/inspector/projectSimulation.mjs";

test("simulation events follow only the selected project and disclose that no production system ran", () => {
  const events = buildProjectSimulationEvents({
    title: "Exemplo de projeto",
    executionFlow: [
      { step: "ETAPA A", title: "Canal", description: "Entrada por canal." },
      { step: "ETAPA B", title: "Atendimento", description: "Etapa de atendimento." },
    ],
  });
  assert.equal(events.length, 4);
  assert.match(events[0], /SIMULAÇÃO LOCAL/);
  assert.match(events[1], /ETAPA A.*Canal/);
  assert.match(events[2], /ETAPA B.*Atendimento/);
  assert.match(events[3], /nenhum sistema real foi chamado/i);
  assert.equal(events.some((event) => /\d+(?:\.\d+)?ms|latência nominal|token Ed25519/i.test(event)), false);
});
