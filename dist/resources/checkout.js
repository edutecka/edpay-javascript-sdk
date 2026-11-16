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
        return this.client.request("GET", `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, undefined, undefined, false);
    }
    async getPaymentLink(linkId) {
        return this.client.request("GET", `/v1/checkout/payment-links/${encodeURIComponent(linkId)}`, undefined, undefined, false);
    }
    async getFramePolicy(token) {
        return this.client.request("GET", `/v1/checkout/sessions/${encodeURIComponent(token)}/frame-policy`, undefined, undefined, false);
    }
    async createSessionPayment(token, options) {
        const { idempotencyKey, ...payload } = options;
        return this.client.request("POST", `/v1/checkout/sessions/${encodeURIComponent(token)}/payments`, payload, { "Idempotency-Key": idempotencyKey }, false);
    }
    async retrieveSessionPayment(token, paymentId) {
        return this.client.request("GET", `/v1/checkout/sessions/${encodeURIComponent(token)}/payments/${encodeURIComponent(paymentId)}`, undefined, undefined, false);
    }
    /** Change method for the same session payment after the previous attempt definitively failed. */
    async createSessionPaymentAttempt(token, paymentId, options) {
        const { idempotencyKey, ...payload } = options;
        return this.client.request("POST", `/v1/checkout/sessions/${encodeURIComponent(token)}/payments/${encodeURIComponent(paymentId)}/attempts`, payload, { "Idempotency-Key": idempotencyKey }, false);
    }
    async createPaymentLinkPayment(linkId, options) {
        const { idempotencyKey, ...payload } = options;
        return this.client.request("POST", `/v1/checkout/payment-links/${encodeURIComponent(linkId)}/payments`, payload, { "Idempotency-Key": idempotencyKey }, false);
    }
    async retrievePaymentLinkPayment(linkId, paymentId) {
        return this.client.request("GET", `/v1/checkout/payment-links/${encodeURIComponent(linkId)}/payments/${encodeURIComponent(paymentId)}`, undefined, undefined, false);
    }
    /** Change method for the same payment-link payment after the previous attempt definitively failed. */
    async createPaymentLinkPaymentAttempt(linkId, paymentId, options) {
        const { idempotencyKey, ...payload } = options;
        return this.client.request("POST", `/v1/checkout/payment-links/${encodeURIComponent(linkId)}/payments/${encodeURIComponent(paymentId)}/attempts`, payload, { "Idempotency-Key": idempotencyKey }, false);
    }
}
exports.CheckoutResource = CheckoutResource;
//# sourceMappingURL=checkout.js.map