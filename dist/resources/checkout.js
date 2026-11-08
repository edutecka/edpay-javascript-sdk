"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutResource = void 0;
class CheckoutResource {
    client;
    constructor(client) {
        this.client = client;
    }
    async createSession(options) {
        const { idempotencyKey, ...payload } = options;
        const headers = {};
        if (idempotencyKey) {
            headers["Idempotency-Key"] = idempotencyKey;
        }
        return this.client.request("POST", "/v1/checkout/sessions", payload, headers);
    }
    async retrieveSession(sessionId) {
        return this.client.request("GET", `/v1/checkout/sessions/${sessionId}`);
    }
    async expireSession(sessionId) {
        return this.client.request("POST", `/v1/checkout/sessions/${sessionId}/expire`);
    }
}
exports.CheckoutResource = CheckoutResource;
//# sourceMappingURL=checkout.js.map