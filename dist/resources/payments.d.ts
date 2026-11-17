import type { PaymentCreateOptions, PrivateCheckoutOptions, PublicCheckoutOptions, LinkCheckoutOptions, CheckoutMethodOptions } from "../types.js";
export declare class PaymentsResource {
    private readonly client;
    constructor(client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>, authenticated?: boolean) => Promise<any>; });
    create(options: PaymentCreateOptions): Promise<any>;
    privateCheckout(paymentId: string, options: PrivateCheckoutOptions): Promise<any>;
    publicCheckout(paymentId: string, options: PublicCheckoutOptions): Promise<any>;
    linkCheckout(paymentId: string, options: LinkCheckoutOptions): Promise<any>;
    /** Lists private checkout attempts currently returned by the API. */
    listCheckouts(paymentId: string): Promise<any>;
    getCheckout(token: string): Promise<any>;
    submitCheckoutPayment(token: string, options: CheckoutMethodOptions): Promise<any>;
    retrieveCheckoutPayment(token: string): Promise<any>;
    framePolicy(token: string): Promise<any>;
    list(limit?: number): Promise<any>;
    retrieve(paymentId: string): Promise<any>;
    listEvents(paymentId: string): Promise<any>;
}
