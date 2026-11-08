import type { CheckoutSessionCreateOptions } from "../types.js";
export declare class CheckoutResource {
    private readonly client;
    constructor(client: {
        request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any>;
    });
    createSession(options: CheckoutSessionCreateOptions): Promise<any>;
    retrieveSession(sessionId: string): Promise<any>;
    expireSession(sessionId: string): Promise<any>;
}
//# sourceMappingURL=checkout.d.ts.map