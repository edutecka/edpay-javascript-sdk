import type { EDPayClientOptions } from "./types.js";
import { PaymentsResource } from "./resources/payments.js";
import { CheckoutResource } from "./resources/checkout.js";
import { PaymentLinksResource } from "./resources/payment-links.js";
import { CustomersResource } from "./resources/customers.js";
export declare class EDPayClient {
    private readonly publicKey;
    private readonly privateKey;
    private readonly baseUrl;
    private readonly timeoutMs;
    readonly payments: PaymentsResource;
    readonly checkout: CheckoutResource;
    readonly paymentLinks: PaymentLinksResource;
    readonly customers: CustomersResource;
    constructor(options: EDPayClientOptions);
    request<T = any>(method: string, path: string, body?: unknown, customHeaders?: Record<string, string>): Promise<T>;
}
//# sourceMappingURL=client.d.ts.map