"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsResource = void 0;
class SubscriptionsResource {
    client;
    constructor(client) {
        this.client = client;
    }
    async create(payload, idempotencyKey) {
        return this.client.request("POST", "/v1/invoice-series", payload, { "Idempotency-Key": idempotencyKey });
    }
    async list(params) {
        const query = new URLSearchParams();
        if (params?.limit !== undefined) {
            query.set("limit", String(params.limit));
        }
        const qs = query.toString();
        return this.client.request("GET", `/v1/invoice-series${qs ? `?${qs}` : ""}`);
    }
    async pause(seriesId) {
        return this.client.request("POST", `/v1/invoice-series/${encodeURIComponent(seriesId)}/pause`);
    }
    async resume(seriesId) {
        return this.client.request("POST", `/v1/invoice-series/${encodeURIComponent(seriesId)}/resume`);
    }
}
exports.SubscriptionsResource = SubscriptionsResource;
//# sourceMappingURL=subscriptions.js.map