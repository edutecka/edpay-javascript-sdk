export declare class InvoicesResource {
    private readonly client;
    constructor(client: {
        request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any>;
    });
    create(payload: Record<string, unknown>, idempotencyKey: string): Promise<any>;
    list(params?: {
        limit?: number;
    }): Promise<any>;
    retrieve(invoiceId: string): Promise<any>;
    finalize(invoiceId: string): Promise<any>;
    voidInvoice(invoiceId: string): Promise<any>;
}
//# sourceMappingURL=invoices.d.ts.map