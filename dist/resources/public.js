"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicResource = void 0;
class PublicResource {
    client;
    constructor(client) {
        this.client = client;
    }
    async listPaymentMethods() {
        return this.client.request("GET", "/v1/public/payment-methods", undefined, undefined, false);
    }
}
exports.PublicResource = PublicResource;
//# sourceMappingURL=public.js.map