"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersResource = void 0;
class CustomersResource {
    client;
    constructor(client) {
        this.client = client;
    }
    async list() {
        return this.client.request("GET", "/v1/customers");
    }
    async create(options) {
        const { idempotencyKey, ...payload } = options;
        return this.client.request("POST", "/v1/customers", payload, { "Idempotency-Key": idempotencyKey });
    }
    async retrieve(customerId) {
        return this.client.request("GET", `/v1/customers/${encodeURIComponent(customerId)}`);
    }
    async update(customerId, options) {
        const { idempotencyKey, ...payload } = options;
        return this.client.request("PATCH", `/v1/customers/${encodeURIComponent(customerId)}`, payload, { "Idempotency-Key": idempotencyKey });
    }
}
exports.CustomersResource = CustomersResource;
//# sourceMappingURL=customers.js.map