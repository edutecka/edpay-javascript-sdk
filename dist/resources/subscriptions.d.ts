export declare class SubscriptionsResource {
    private readonly client;
    constructor(client: {
        request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any>;
    });
    create(payload: Record<string, unknown>, idempotencyKey: string): Promise<any>;
    list(params?: {
        limit?: number;
    }): Promise<any>;
    pause(seriesId: string): Promise<any>;
    resume(seriesId: string): Promise<any>;
}
//# sourceMappingURL=subscriptions.d.ts.map