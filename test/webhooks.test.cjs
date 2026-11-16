const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const test = require("node:test");

const { verifyWebhookSignature } = require("../dist/webhooks.js");

test("accepts a valid EDPay timestamped HMAC-SHA256 signature", () => {
  const payload = JSON.stringify({ type: "payment.succeeded" });
  const secret = "test-webhook-secret";
  const timestamp = 1_700_000_000;
  const signature = crypto.createHmac("sha256", secret).update(`${timestamp}.`).update(payload).digest("hex");
  const signatureHeader = `t=${timestamp},v1=${signature}`;

  assert.equal(verifyWebhookSignature(payload, signatureHeader, secret, { now: timestamp }), true);
});

test("rejects invalid, empty, and mismatched signatures", () => {
  const payload = JSON.stringify({ type: "payment.succeeded" });
  const secret = "test-webhook-secret";

  assert.equal(verifyWebhookSignature(payload, "invalid", secret), false);
  assert.equal(verifyWebhookSignature(payload, "", secret), false);
  assert.equal(verifyWebhookSignature("", "signature", secret), false);
});
