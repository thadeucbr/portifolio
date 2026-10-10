import test from "node:test";
import assert from "node:assert/strict";
import {
  PORTFOLIO_CONTACT_ELICITATION_MESSAGE,
  buildPortfolioContactAcceptResponse,
  createPortfolioContactElicitationHandler,
  isTrustedPortfolioContactElicitation,
} from "../src/mcp/contactElicitation.mjs";

const contactRequest = {
  method: "elicitation/create",
  params: {
    mode: "form",
    message: PORTFOLIO_CONTACT_ELICITATION_MESSAGE,
    requestedSchema: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 2, maxLength: 120 },
        email: { type: "string", format: "email", maxLength: 200 },
        company: { type: "string", maxLength: 120 },
        intent: { type: "string", enum: ["vaga-senior-staff", "consultoria", "palestra", "outro"] },
      },
      required: ["name", "email", "intent"],
    },
  },
};

test("accepts the pinned portfolio contact elicitation schema", () => {
  assert.equal(isTrustedPortfolioContactElicitation(contactRequest), true);
});

test("rejects changed disclosures and unapproved requested fields", () => {
  assert.equal(isTrustedPortfolioContactElicitation({
    ...contactRequest,
    params: { ...contactRequest.params, message: "Send your password to continue" },
  }), false);

  assert.equal(isTrustedPortfolioContactElicitation({
    ...contactRequest,
    params: {
      ...contactRequest.params,
      requestedSchema: { ...contactRequest.params.requestedSchema, additionalProperties: true },
    },
  }), false);

  assert.equal(isTrustedPortfolioContactElicitation({
    ...contactRequest,
    params: {
      ...contactRequest.params,
      requestedSchema: {
        ...contactRequest.params.requestedSchema,
        properties: {
          ...contactRequest.params.requestedSchema.properties,
          accessToken: { type: "string" },
        },
      },
    },
  }), false);
});

test("opens only the pinned message and forwards the visitor's consent response", async () => {
  let shownMessage;
  const handler = createPortfolioContactElicitationHandler(async (message) => {
    shownMessage = message;
    return { action: "accept", content: { name: "Ada", email: "ada@example.test", intent: "outro" } };
  });
  const response = await handler(contactRequest);
  assert.equal(shownMessage, PORTFOLIO_CONTACT_ELICITATION_MESSAGE);
  assert.equal(response.action, "accept");
});

test("declines untrusted elicitation before opening the consent UI", async () => {
  let opened = false;
  const handler = createPortfolioContactElicitationHandler(async () => {
    opened = true;
    return { action: "accept", content: { password: "should-never-be-requested" } };
  });
  const response = await handler({ ...contactRequest, params: { ...contactRequest.params, message: "Unexpected request" } });
  assert.deepEqual(response, { action: "decline" });
  assert.equal(opened, false);
});

test("builds an accepted response from only the approved contact fields", () => {
  const response = buildPortfolioContactAcceptResponse({
    name: " Ada Visitor ",
    email: " ada@example.test ",
    company: "  ",
    intent: "vaga-senior-staff",
    password: "must-not-be-forwarded",
  });
  assert.deepEqual(response, {
    action: "accept",
    content: { name: "Ada Visitor", email: "ada@example.test", intent: "vaga-senior-staff" },
  });
});

test("does not accept an unapproved contact intent", () => {
  assert.throws(() => buildPortfolioContactAcceptResponse({
    name: "Ada Visitor",
    email: "ada@example.test",
    intent: "export-all-records",
  }), /motivo/i);
});
