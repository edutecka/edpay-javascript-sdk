import type { CustomerCreateOptions } from "../types.js";
export declare class CustomersResource {
    private readonly client;
    constructor(client: {
        request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any>;
    });
    create(options: CustomerCreateOptions): Promise<any>;
    retrieve(customerId: string): Promise<any>;
    update(customerId: string, options: Partial<CustomerCreateOptions>): Promise<any>;
}
//# sourceMappingURL=customers.d.ts.map