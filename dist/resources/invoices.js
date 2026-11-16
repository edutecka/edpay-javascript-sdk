"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesResource = void 0;
class InvoicesResource {
    client;
    constructor(client) {
        this.client = client;
    }
    async create(payload, idempotencyKey) {
        return this.client.request("POST", "/v1/invoices", payload, { "Idempotency-Key": idempotencyKey });
    }
    async list(params) {
        const query = new URLSearchParams();
        if (params?.limit !== undefined) {
            query.set("limit", String(params.limit));
        }
        const qs = query.toString();
        return this.client.request("GET", `/v1/invoices${qs ? `?${qs}` : ""}`);
    }
    async retrieve(invoiceId) {
        return this.client.request("GET", `/v1/invoices/${encodeURIComponent(invoiceId)}`);
    }
    async finalize(invoiceId) {
        return this.client.request("POST", `/v1/invoices/${encodeURIComponent(invoiceId)}/finalize`);
    }
    async voidInvoice(invoiceId) {
        return this.client.request("POST", `/v1/invoices/${encodeURIComponent(invoiceId)}/void`);
    }
}
exports.InvoicesResource = InvoicesResource;
//# sourceMappingURL=invoices.js.map