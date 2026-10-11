import test from "node:test";
import assert from "node:assert/strict";
import { createPortfolioContactSubmitter } from "../src/mcp/contactSubmission.mjs";

test("maps an accepted MCP form into the existing Server Action contract", async () => {
  let received;
  const submit = createPortfolioContactSubmitter(async (previousState, formData) => {
    received = { previousState, formData };
    return { status: "accepted", receiptId: "receipt-test" };
  });

  const result = await submit({
    name: "Ada Visitor",
    email: "ada@example.test",
    phone: "+55 11 99999-9999",
    company: "Analytical Engine",
    intent: "vaga-senior-staff",
  });

  assert.equal(received.previousState.status, "idle");
  assert.equal(received.formData.get("decision"), "accept");
  assert.equal(received.formData.get("name"), "Ada Visitor");
  assert.equal(received.formData.get("email"), "ada@example.test");
  assert.equal(received.formData.get("phone"), "+55 11 99999-9999");
  assert.equal(received.formData.get("company"), "Analytical Engine");
  assert.equal(received.formData.get("intent"), "vaga-senior-staff");
  assert.equal(received.formData.get("website"), "");
  assert.equal(result.receiptId, "receipt-test");
});
