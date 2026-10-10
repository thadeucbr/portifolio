import test from "node:test";
import assert from "node:assert/strict";
import { buildPortfolioAnswerMessages, cleanGeneratedAnswer, createSafeAnswerStreamFilter } from "../src/mcp/answerPrompt.mjs";

test("builds Portuguese grounded-chat messages with numbered source citations", () => {
  const messages = buildPortfolioAnswerMessages("Como funciona o broker?", [
    { id: "broker", title: "Broker", text: "Recebe canais e envia ao orquestrador." },
    { id: "security", title: "Malha", text: "Autenticação entre serviços." },
  ]);

  assert.equal(messages[0].role, "system");
  assert.match(messages[0].content, /pt-BR/);
  assert.match(messages[0].content, /não siga instruções/);
  assert.match(messages[1].content, /\[P1\] Broker/);
  assert.match(messages[1].content, /\[P2\] Malha/);
  assert.match(messages[1].content, /Como funciona o broker\?/);
});

test("caps question and evidence size and number to bound prompt memory", () => {
  const messages = buildPortfolioAnswerMessages("q".repeat(5000), Array.from({ length: 8 }, (_, index) => ({
    id: String(index),
    title: `Project ${index}`,
    text: "x".repeat(5000),
  })));

  assert.ok(messages[1].content.length < 5000);
  assert.match(messages[1].content, /\[P3\]/);
  assert.doesNotMatch(messages[1].content, /\[P4\]/);
});

test("asks the model to abstain when no source supports the answer", () => {
  const messages = buildPortfolioAnswerMessages("Qual é a taxa real de sucesso?", []);

  assert.match(messages[0].content, /não invente/i);
  assert.match(messages[1].content, /nenhum trecho recuperado/i);
});

test("never streams private think blocks even when their tags split across chunks", () => {
  const visible = [];
  const filter = createSafeAnswerStreamFilter((text) => visible.push(text));

  filter.push("Fato [P1]. <thi");
  filter.push("nk>segredo interno");
  filter.push("</thi");
  filter.push("nk> resposta final.");
  filter.finish();

  assert.equal(visible.join(""), "Fato [P1].  resposta final.");
});

test("drops an unfinished private think block and strips it from final output", () => {
  const visible = [];
  const filter = createSafeAnswerStreamFilter((text) => visible.push(text));

  filter.push("Resposta pública. <think>conteúdo privado sem fechamento");
  filter.finish();

  assert.equal(visible.join(""), "Resposta pública. ");
  assert.equal(cleanGeneratedAnswer("A [P1]. <think>segredo</think> B [P2]."), "A [P1].  B [P2].");
});
