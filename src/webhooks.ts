import * as crypto from "node:crypto";

export interface WebhookSignatureOptions {
  /** Maximum accepted age or clock skew in seconds. Defaults to 300 seconds. */
  toleranceSeconds?: number;
  /** Current Unix timestamp in seconds, injectable for deterministic verification. */
  now?: number;
}

/**
 * Verify an EDPay `Payment-Signature` header against the raw HTTP request body.
 * EDPay signs `timestamp + "." + rawBody` with HMAC-SHA256. Verify before parsing
 * JSON, and reject stale timestamps to limit replay attacks.
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signatureHeader: string,
  secret: string,
  options: WebhookSignatureOptions = {}
): boolean {
  if (!payload || !signatureHeader || !secret) return false;

  const tolerance = options.toleranceSeconds ?? 300;
  const now = options.now ?? Math.floor(Date.now() / 1000);
  if (!Number.isInteger(tolerance) || tolerance < 0 || !Number.isFinite(now)) return false;

  let timestamp: string | undefined;
  let signature: string | undefined;
  for (const field of signatureHeader.split(",")) {
    const [rawKey, ...rawValue] = field.trim().split("=");
    const key = rawKey?.trim();
    const value = rawValue.join("=").trim();
    if (key === "t") {
      if (timestamp !== undefined) return false;
      timestamp = value;
    } else if (key === "v1") {
      if (signature !== undefined) return false;
      signature = value;
    }
  }
  if (!timestamp || !/^\d+$/.test(timestamp) || !signature || !/^[a-f\d]{64}$/i.test(signature)) return false;
  const signedAt = Number(timestamp);
  if (!Number.isSafeInteger(signedAt) || Math.abs(now - signedAt) > tolerance) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.`).update(payload).digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && crypto.timingSafeEqual(expected, received);
}
