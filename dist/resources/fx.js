"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FxResource = void 0;
class FxResource {
    client;
    constructor(client) {
        this.client = client;
    }
    async quote(fromCurrency, toCurrency, amountMinor) {
        const query = new URLSearchParams({
            from_currency: fromCurrency,
            to_currency: toCurrency,
            amount_minor: String(amountMinor),
        });
        return this.client.request("GET", `/v1/fx/quote?${query}`);
    }
}
exports.FxResource = FxResource;
//# sourceMappingURL=fx.js.map