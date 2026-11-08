import type { CustomerCreateOptions } from "../types.js";

export class CustomersResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any> }) {}

  async create(options: CustomerCreateOptions): Promise<any> {
    return this.client.request("POST", "/v1/customers", options);
  }

  async retrieve(customerId: string): Promise<any> {
    return this.client.request("GET", `/v1/customers/${customerId}`);
  }

  async update(customerId: string, options: Partial<CustomerCreateOptions>): Promise<any> {
    return this.client.request("PUT", `/v1/customers/${customerId}`, options);
  }
}
