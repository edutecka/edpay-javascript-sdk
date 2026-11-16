"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsResource = void 0;
class WalletsResource {
    client;
    constructor(client) {
        this.client = client;
    }
    async list() {
        return this.client.request("GET", "/v1/wallets");
    }
    async retrieve(walletId) {
        return this.client.request("GET", `/v1/wallets/${encodeURIComponent(walletId)}`);
    }
    async balance(walletId) {
        return this.client.request("GET", `/v1/wallets/${encodeURIComponent(walletId)}/balance`);
    }
    async listEntries(walletId, params) {
        const query = new URLSearchParams();
        if (params?.cursor)
            query.set("cursor", params.cursor);
        if (params?.limit !== undefined)
            query.set("limit", String(params.limit));
        const queryString = query.toString();
        const suffix = queryString ? `?${queryString}` : "";
        return this.client.request("GET", `/v1/wallets/${encodeURIComponent(walletId)}/entries${suffix}`);
    }
}
exports.WalletsResource = WalletsResource;
//# sourceMappingURL=wallets.js.map