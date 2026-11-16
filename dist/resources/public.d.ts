export declare class PublicResource {
    private readonly client;
    constructor(client: {
        request: (method: string, path: string, body?: unknown, headers?: Record<string, string>, authenticated?: boolean) => Promise<any>;
    });
    listPaymentMethods(): Promise<any>;
}
//# sourceMappingURL=public.d.ts.map