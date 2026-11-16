import type { PaymentLinkCreateOptions } from "../types.js";
export declare class PaymentLinksResource {
    private readonly client;
    constructor(client: {
        request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any>;
    });
    create(options: PaymentLinkCreateOptions): Promise<any>;
    list(): Promise<any>;
    retrieve(linkId: string): Promise<any>;
    deactivate(linkId: string, idempotencyKey: string): Promise<any>;
    createCheckoutSession(linkId: string, idempotencyKey: string, embedOrigin?: string): Promise<any>;
}
//# sourceMappingURL=payment-links.d.ts.map