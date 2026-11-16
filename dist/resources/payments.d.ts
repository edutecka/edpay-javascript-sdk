import type { PaymentAttemptCreateOptions, PaymentCreateOptions } from "../types.js";
export declare class PaymentsResource {
    private readonly client;
    constructor(client: {
        request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any>;
    });
    create(options: PaymentCreateOptions): Promise<any>;
    /** Legacy alias for creating a payment intent through /v1/payment-checkout. */
    createCheckout(options: PaymentCreateOptions): Promise<any>;
    /** Start another method for this payment after its latest attempt definitively failed. */
    createAttempt(paymentId: string, options: PaymentAttemptCreateOptions): Promise<any>;
    list(limit?: number): Promise<any>;
    retrieve(paymentId: string): Promise<any>;
    listEvents(paymentId: string): Promise<any>;
    listAttempts(paymentId: string): Promise<any>;
}
//# sourceMappingURL=payments.d.ts.map