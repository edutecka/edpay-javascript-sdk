import type { EDPayClientOptions } from "./types.js";
import { PaymentsResource } from "./resources/payments.js";
import { CheckoutResource } from "./resources/checkout.js";
import { PaymentLinksResource } from "./resources/payment-links.js";
import { CustomersResource } from "./resources/customers.js";
import { InvoicesResource } from "./resources/invoices.js";
import { SubscriptionsResource } from "./resources/subscriptions.js";
import { FxResource } from "./resources/fx.js";
import { WalletsResource } from "./resources/wallets.js";
import { WebhooksResource } from "./resources/webhooks.js";
import { PublicResource } from "./resources/public.js";
export declare class EDPayClient {
    private readonly publicKey;
    private readonly privateKey;
    private readonly baseUrl;
    private readonly timeoutMs;
    readonly payments: PaymentsResource;
    readonly checkout: CheckoutResource;
    readonly paymentLinks: PaymentLinksResource;
    readonly customers: CustomersResource;
    readonly invoices: InvoicesResource;
    readonly subscriptions: SubscriptionsResource;
    readonly fx: FxResource;
    readonly wallets: WalletsResource;
    readonly webhooks: WebhooksResource;
    readonly public: PublicResource;
    constructor(options: EDPayClientOptions);
    request<T = any>(method: string, path: string, body?: unknown, customHeaders?: Record<string, string>, authenticated?: boolean): Promise<T>;
}
//# sourceMappingURL=client.d.ts.map