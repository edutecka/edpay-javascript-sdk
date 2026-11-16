import type { CustomerCreateOptions, CustomerUpdateOptions } from "../types.js";

export class CustomersResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any> }) {}

  async list(): Promise<any> {
    return this.client.request("GET", "/v1/customers");
  }

  async create(options: CustomerCreateOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    return this.client.request("POST", "/v1/customers", payload, { "Idempotency-Key": idempotencyKey });
  }

  async retrieve(customerId: string): Promise<any> {
    return this.client.request("GET", `/v1/customers/${encodeURIComponent(customerId)}`);
  }

  async update(customerId: string, options: CustomerUpdateOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    return this.client.request("PATCH", `/v1/customers/${encodeURIComponent(customerId)}`, payload, { "Idempotency-Key": idempotencyKey });
  }
}
