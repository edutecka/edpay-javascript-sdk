export declare class WalletsResource {
    private readonly client;
    constructor(client: {
        request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any>;
    });
    list(): Promise<any>;
    retrieve(walletId: string): Promise<any>;
    balance(walletId: string): Promise<any>;
    listEntries(walletId: string, params?: {
        cursor?: string;
        limit?: number;
    }): Promise<any>;
}
//# sourceMappingURL=wallets.d.ts.map