import test from "node:test";
import assert from "node:assert/strict";
import { isExplicitContactRequest } from "../src/mcp/contactIntent.mjs";

test("routes direct requests to speak or contact the portfolio owner to contact elicitation", () => {
  for (const request of [
    "Quero falar com ele sobre uma vaga",
    "Gostaria de conversar com você",
    "Como posso entrar em contato?",
    "Tenho uma oportunidade de trabalho para ele",
  ]) {
    assert.equal(isExplicitContactRequest(request), true, request);
  }
});

test("does not treat project questions about customer contact data as a contact request", () => {
  for (const question of [
    "Como o DLP protege dados de contato dos clientes?",
    "Como os projetos integram canais de contato?",
    "Quais competências ele tem em mensageria?",
  ]) {
    assert.equal(isExplicitContactRequest(question), false, question);
  }
});
