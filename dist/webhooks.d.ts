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
export declare function verifyWebhookSignature(payload: string | Buffer, signatureHeader: string, secret: string, options?: WebhookSignatureOptions): boolean;
//# sourceMappingURL=webhooks.d.ts.map