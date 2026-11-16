"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksResource = void 0;
class WebhooksResource {
    client;
    constructor(client) {
        this.client = client;
    }
    async listEndpoints() {
        return this.client.request("GET", "/v1/webhook-endpoints");
    }
    async createEndpoint(options) {
        const { idempotencyKey, ...payload } = options;
        return this.client.request("POST", "/v1/webhook-endpoints", payload, { "Idempotency-Key": idempotencyKey });
    }
    async updateEndpoint(endpointId, options) {
        return this.client.request("PATCH", `/v1/webhook-endpoints/${encodeURIComponent(endpointId)}`, options);
    }
    async disableEndpoint(endpointId) {
        return this.client.request("POST", `/v1/webhook-endpoints/${encodeURIComponent(endpointId)}/disable`);
    }
    async deleteEndpoint(endpointId) {
        return this.client.request("DELETE", `/v1/webhook-endpoints/${encodeURIComponent(endpointId)}`);
    }
    async listDeliveries(limit = 50) {
        const query = new URLSearchParams({ limit: String(limit) });
        return this.client.request("GET", `/v1/webhook-deliveries?${query}`);
    }
    async retrieveDelivery(deliveryId) {
        return this.client.request("GET", `/v1/webhook-deliveries/${encodeURIComponent(deliveryId)}`);
    }
    async retryDelivery(deliveryId) {
        return this.client.request("POST", `/v1/webhook-deliveries/${encodeURIComponent(deliveryId)}/retry`);
    }
}
exports.WebhooksResource = WebhooksResource;
//# sourceMappingURL=webhooks.js.map