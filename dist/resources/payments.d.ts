import type { PaymentCreateOptions } from "../types.js";
export declare class PaymentsResource {
    private readonly client;
    constructor(client: {
        request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any>;
    });
    create(options: PaymentCreateOptions): Promise<any>;
    retrieve(paymentId: string): Promise<any>;
    cancel(paymentId: string): Promise<any>;
}
//# sourceMappingURL=payments.d.ts.map