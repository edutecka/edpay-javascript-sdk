"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsResource = void 0;
class PaymentsResource {
    client;
    constructor(client) {
        this.client = client;
    }
    async create(options) {
        const { idempotencyKey, ...payload } = options;
        const headers = {};
        if (idempotencyKey) {
            headers["Idempotency-Key"] = idempotencyKey;
        }
        return this.client.request("POST", "/v1/payments", payload, headers);
    }
    /** Legacy alias for creating a payment intent through /v1/payment-checkout. */
    async createCheckout(options) {
        const { idempotencyKey, ...payload } = options;
        return this.client.request("POST", "/v1/payment-checkout", payload, { "Idempotency-Key": idempotencyKey });
    }
    async list(limit = 50) {
        const query = new URLSearchParams({ limit: String(limit) });
        return this.client.request("GET", `/v1/payments?${query}`);
    }
    async retrieve(paymentId) {
        return this.client.request("GET", `/v1/payments/${encodeURIComponent(paymentId)}`);
    }
    async listEvents(paymentId) {
        return this.client.request("GET", `/v1/payments/${encodeURIComponent(paymentId)}/events`);
    }
    async listAttempts(paymentId) {
        return this.client.request("GET", `/v1/payments/${encodeURIComponent(paymentId)}/attempts`);
    }
}
exports.PaymentsResource = PaymentsResource;
//# sourceMappingURL=payments.js.map