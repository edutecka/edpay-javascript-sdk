"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EDPayClient = void 0;
const exceptions_js_1 = require("./exceptions.js");
const payments_js_1 = require("./resources/payments.js");
const checkout_js_1 = require("./resources/checkout.js");
const payment_links_js_1 = require("./resources/payment-links.js");
const customers_js_1 = require("./resources/customers.js");
const invoices_js_1 = require("./resources/invoices.js");
const subscriptions_js_1 = require("./resources/subscriptions.js");
const fx_js_1 = require("./resources/fx.js");
const wallets_js_1 = require("./resources/wallets.js");
const webhooks_js_1 = require("./resources/webhooks.js");
const public_js_1 = require("./resources/public.js");
class EDPayClient {
    publicKey;
    privateKey;
    baseUrl;
    timeoutMs;
    payments;
    checkout;
    paymentLinks;
    customers;
    invoices;
    subscriptions;
    fx;
    wallets;
    webhooks;
    public;
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
                options.baseUrl || "https://api-pay.edutecka.com";
        }
        this.payments = new payments_js_1.PaymentsResource(this);
        this.checkout = new checkout_js_1.CheckoutResource(this);
        this.paymentLinks = new payment_links_js_1.PaymentLinksResource(this);
        this.customers = new customers_js_1.CustomersResource(this);
        this.invoices = new invoices_js_1.InvoicesResource(this);
        this.subscriptions = new subscriptions_js_1.SubscriptionsResource(this);
        this.fx = new fx_js_1.FxResource(this);
        this.wallets = new wallets_js_1.WalletsResource(this);
        this.webhooks = new webhooks_js_1.WebhooksResource(this);
        this.public = new public_js_1.PublicResource(this);
    }
    async request(method, path, body, customHeaders, authenticated = true) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": "EDPay-Node-SDK/1.4.0",
            ...customHeaders,
        };
        if (authenticated) {
            headers["X-EDPay-Public-Key"] = this.publicKey;
            headers["X-EDPay-Private-Key"] = this.privateKey;
        }
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
                const apiError = data?.error;
                const errorMsg = apiError?.message || data?.message || (typeof apiError === "string" ? apiError : undefined) || `HTTP ${response.status} ${response.statusText}`;
                throw new exceptions_js_1.EDPayError(errorMsg, response.status, data, {
                    errorCode: apiError?.code,
                    requestId: response.headers.get("X-Request-Id") ?? undefined,
                    retryAfter: response.headers.get("Retry-After") ?? undefined,
                });
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