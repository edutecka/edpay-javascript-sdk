"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentLinksResource = void 0;
class PaymentLinksResource {
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
        return this.client.request("POST", "/v1/payment-links", payload, headers);
    }
    async list() {
        return this.client.request("GET", "/v1/payment-links");
    }
    async retrieve(linkId) {
        return this.client.request("GET", `/v1/payment-links/${encodeURIComponent(linkId)}`);
    }
    async deactivate(linkId, idempotencyKey) {
        return this.client.request("POST", `/v1/payment-links/${encodeURIComponent(linkId)}/deactivate`, undefined, { "Idempotency-Key": idempotencyKey });
    }
    async createCheckoutSession(linkId, idempotencyKey, embedOrigin) {
        return this.client.request("POST", "/v1/checkout/sessions", { payment_link_id: linkId, ...(embedOrigin ? { embed_origin: embedOrigin } : {}) }, { "Idempotency-Key": idempotencyKey });
    }
}
exports.PaymentLinksResource = PaymentLinksResource;
//# sourceMappingURL=payment-links.js.map