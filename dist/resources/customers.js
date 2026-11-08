"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersResource = void 0;
class CustomersResource {
    client;
    constructor(client) {
        this.client = client;
    }
    async create(options) {
        return this.client.request("POST", "/v1/customers", options);
    }
    async retrieve(customerId) {
        return this.client.request("GET", `/v1/customers/${customerId}`);
    }
    async update(customerId, options) {
        return this.client.request("PUT", `/v1/customers/${customerId}`, options);
    }
}
exports.CustomersResource = CustomersResource;
//# sourceMappingURL=customers.js.map