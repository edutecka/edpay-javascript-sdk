const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const test = require("node:test");

const { verifyWebhookSignature } = require("../dist/webhooks.js");

test("accepts a valid HMAC-SHA256 signature", () => {
  const payload = JSON.stringify({ type: "payment.succeeded" });
  const secret = "test-webhook-secret";
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  assert.equal(verifyWebhookSignature(payload, signature, secret), true);
});

test("rejects invalid, empty, and mismatched signatures", () => {
  const payload = JSON.stringify({ type: "payment.succeeded" });
  const secret = "test-webhook-secret";

  assert.equal(verifyWebhookSignature(payload, "invalid", secret), false);
  assert.equal(verifyWebhookSignature(payload, "", secret), false);
  assert.equal(verifyWebhookSignature("", "signature", secret), false);
});
