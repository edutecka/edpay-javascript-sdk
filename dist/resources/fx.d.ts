export declare class FxResource {
    private readonly client;
    constructor(client: {
        request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any>;
    });
    quote(fromCurrency: string, toCurrency: string, amountMinor: number): Promise<any>;
}
//# sourceMappingURL=fx.d.ts.map