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
    async retrieve(paymentId) {
        return this.client.request("GET", `/v1/payments/${paymentId}`);
    }
    async cancel(paymentId) {
        return this.client.request("POST", `/v1/payments/${paymentId}/cancel`);
    }
}
exports.PaymentsResource = PaymentsResource;
//# sourceMappingURL=payments.js.map