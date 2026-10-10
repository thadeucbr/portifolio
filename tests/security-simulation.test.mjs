import test from "node:test";
import assert from "node:assert/strict";
import { simulateSecurityInspection } from "../src/components/security/securitySimulation.mjs";

test("masks Brazilian CPF and 16-digit card values in local sample payloads", () => {
  const result = simulateSecurityInspection(
    "CPF 123.456.789-00 e cartão 4111 2222 3333 4444",
    { hasToken: true, role: "BANK_MANAGER" },
  );

  assert.equal(result.cpfMasked, true);
  assert.equal(result.cardMasked, true);
  assert.match(result.sanitizedText, /DLP_PROTECTED_CPF/);
  assert.match(result.sanitizedText, /DLP_PROTECTED_CARD/);
  assert.doesNotMatch(result.sanitizedText, /123\.456\.789-00|4111 2222 3333 4444/);
  assert.equal(result.decision, "SANITIZED_ALLOWED");
});

test("blocks requests with no test token or an untrusted application role", () => {
  const noToken = simulateSecurityInspection("mensagem sem dado sensível", {
    hasToken: false,
    role: "BANK_MANAGER",
  });
  const untrusted = simulateSecurityInspection("mensagem sem dado sensível", {
    hasToken: true,
    role: "UNTRUSTED_APP",
  });

  assert.equal(noToken.decision, "BLOCKED");
  assert.equal(untrusted.decision, "BLOCKED");
});

test("passes clean sample text only for the locally authorized role", () => {
  const result = simulateSecurityInspection("mensagem sem dado sensível", {
    hasToken: true,
    role: "BANK_MANAGER",
  });

  assert.equal(result.decision, "ALLOWED");
  assert.equal(result.sanitizedText, "mensagem sem dado sensível");
  assert.equal(result.rbacGranted, true);
});

test("does not leak global-regex state between repeated scans", () => {
  const scan = () => simulateSecurityInspection("CPF 123.456.789-00", {
    hasToken: true,
    role: "BANK_MANAGER",
  });

  assert.equal(scan().cpfMasked, true);
  assert.equal(scan().cpfMasked, true);
});
