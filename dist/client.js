"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EDPayClient = void 0;
const exceptions_js_1 = require("./exceptions.js");
const payments_js_1 = require("./resources/payments.js");
const checkout_js_1 = require("./resources/checkout.js");
const payment_links_js_1 = require("./resources/payment-links.js");
const customers_js_1 = require("./resources/customers.js");
class EDPayClient {
    publicKey;
    privateKey;
    baseUrl;
    timeoutMs;
    payments;
    checkout;
    paymentLinks;
    customers;
    constructor(options) {
        if (!options?.publicKey || !options?.privateKey) {
            throw new Error("EDPayClient requires both publicKey and privateKey.");
        }
        this.publicKey = options.publicKey;
        this.privateKey = options.privateKey;
        this.timeoutMs = options.timeoutMs ?? 30000;
        if (options.baseUrl) {
            this.baseUrl = options.baseUrl.replace(/\/+$/, "");
        }
        else {
            this.baseUrl =
                options.environment === "sandbox"
                    ? "https://sandbox-api.edpay.co.mz"
                    : "https://api.edpay.co.mz";
        }
        this.payments = new payments_js_1.PaymentsResource(this);
        this.checkout = new checkout_js_1.CheckoutResource(this);
        this.paymentLinks = new payment_links_js_1.PaymentLinksResource(this);
        this.customers = new customers_js_1.CustomersResource(this);
    }
    async request(method, path, body, customHeaders) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            "X-EDPay-Public-Key": this.publicKey,
            "X-EDPay-Private-Key": this.privateKey,
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": "EDPay-Node-SDK/1.0.0",
            ...customHeaders,
        };
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await fetch(url, {
                method,
                headers,
                body: body !== undefined ? JSON.stringify(body) : undefined,
                signal: controller.signal,
            });
            clearTimeout(timer);
            const text = await response.text();
            let data = null;
            if (text) {
                try {
                    data = JSON.parse(text);
                }
                catch {
                    data = { raw: text };
                }
            }
            if (!response.ok) {
                const errorMsg = data?.message || data?.error || `HTTP ${response.status} ${response.statusText}`;
                throw new exceptions_js_1.EDPayError(errorMsg, response.status, data);
            }
            return data;
        }
        catch (err) {
            clearTimeout(timer);
            if (err instanceof exceptions_js_1.EDPayError)
                throw err;
            throw new exceptions_js_1.EDPayError(err.message || "Network request failed", 0);
        }
    }
}
exports.EDPayClient = EDPayClient;
//# sourceMappingURL=client.js.map