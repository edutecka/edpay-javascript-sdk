import type { WebhookEndpointCreateOptions, WebhookEndpointUpdateOptions } from "../types.js";
export declare class WebhooksResource {
    private readonly client;
    constructor(client: {
        request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any>;
    });
    listEndpoints(): Promise<any>;
    createEndpoint(options: WebhookEndpointCreateOptions): Promise<any>;
    updateEndpoint(endpointId: string, options: WebhookEndpointUpdateOptions): Promise<any>;
    disableEndpoint(endpointId: string): Promise<any>;
    deleteEndpoint(endpointId: string): Promise<any>;
    listDeliveries(limit?: number): Promise<any>;
    retrieveDelivery(deliveryId: string): Promise<any>;
    retryDelivery(deliveryId: string): Promise<any>;
}
//# sourceMappingURL=webhooks.d.ts.map