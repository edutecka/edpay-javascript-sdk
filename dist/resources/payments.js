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
    async privateCheckout(paymentId, options) {
        const { idempotencyKey, ...payload } = options;
        return this.client.request("POST", `/v1/payments/${encodeURIComponent(paymentId)}/private-checkout`, payload, { "Idempotency-Key": idempotencyKey });
    }
    async publicCheckout(paymentId, options) {
        const { idempotencyKey, ...payload } = options;
        return this.client.request("POST", `/v1/payments/${encodeURIComponent(paymentId)}/public-checkout`, payload, { "Idempotency-Key": idempotencyKey });
    }
    async linkCheckout(paymentId, options) {
        const { idempotencyKey, ...payload } = options;
        return this.client.request("POST", `/v1/payments/${encodeURIComponent(paymentId)}/link-checkout`, payload, { "Idempotency-Key": idempotencyKey });
    }
    /** Lists executions with their checkout mode and sessions with no submission. */
    async listCheckouts(paymentId) {
        return this.client.request("GET", `/v1/payments/${encodeURIComponent(paymentId)}/checkouts`);
    }
    async getCheckout(token) {
        return this.client.request("GET", `/v1/payments/checkouts/${encodeURIComponent(token)}`, undefined, undefined, false);
    }
    async submitCheckoutPayment(token, options) {
        const { idempotencyKey, ...payload } = options;
        return this.client.request("POST", `/v1/payments/checkouts/${encodeURIComponent(token)}/payment`, payload, { "Idempotency-Key": idempotencyKey }, false);
    }
    async retrieveCheckoutPayment(token) {
        return this.client.request("GET", `/v1/payments/checkouts/${encodeURIComponent(token)}/payment`, undefined, undefined, false);
    }
    async framePolicy(token) {
        return this.client.request("GET", `/v1/payments/checkouts/${encodeURIComponent(token)}/frame-policy`, undefined, undefined, false);
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
}
exports.PaymentsResource = PaymentsResource;
//# sourceMappingURL=payments.js.map