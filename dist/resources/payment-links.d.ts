import type { PaymentLinkCreateOptions } from "../types.js";
export declare class PaymentLinksResource {
    private readonly client;
    constructor(client: {
        request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any>;
    });
    create(options: PaymentLinkCreateOptions): Promise<any>;
    retrieve(linkId: string): Promise<any>;
    revoke(linkId: string): Promise<any>;
}
//# sourceMappingURL=payment-links.d.ts.map