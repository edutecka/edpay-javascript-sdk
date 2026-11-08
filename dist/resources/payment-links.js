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
    async retrieve(linkId) {
        return this.client.request("GET", `/v1/payment-links/${linkId}`);
    }
    async revoke(linkId) {
        return this.client.request("POST", `/v1/payment-links/${linkId}/revoke`);
    }
}
exports.PaymentLinksResource = PaymentLinksResource;
//# sourceMappingURL=payment-links.js.map