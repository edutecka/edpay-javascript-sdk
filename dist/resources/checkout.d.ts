import type { CheckoutPaymentOptions, CheckoutSessionCreateOptions } from "../types.js";
export declare class CheckoutResource {
    private readonly client;
    constructor(client: {
        request: (method: string, path: string, body?: unknown, headers?: Record<string, string>, authenticated?: boolean) => Promise<any>;
    });
    createSession(options: CheckoutSessionCreateOptions): Promise<any>;
    retrieveSession(sessionId: string): Promise<any>;
    getPaymentLink(linkId: string): Promise<any>;
    getFramePolicy(token: string): Promise<any>;
    createSessionPayment(token: string, options: CheckoutPaymentOptions): Promise<any>;
    retrieveSessionPayment(token: string, paymentId: string): Promise<any>;
    createPaymentLinkPayment(linkId: string, options: CheckoutPaymentOptions): Promise<any>;
    retrievePaymentLinkPayment(linkId: string, paymentId: string): Promise<any>;
}
//# sourceMappingURL=checkout.d.ts.map