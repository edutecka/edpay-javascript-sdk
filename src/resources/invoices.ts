export class InvoicesResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any> }) {}

  async create(payload: Record<string, any>, idempotencyKey?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.client.request("POST", "/v1/invoices", payload, headers);
  }

  async list(params?: { customer_id?: string; status?: string; limit?: number; offset?: number }): Promise<any> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) query.append(k, String(v));
      });
    }
    const qs = query.toString();
    return this.client.request("GET", `/v1/invoices${qs ? `?${qs}` : ""}`);
  }

  async retrieve(invoiceId: string): Promise<any> {
    return this.client.request("GET", `/v1/invoices/${invoiceId}`);
  }

  async finalize(invoiceId: string): Promise<any> {
    return this.client.request("POST", `/v1/invoices/${invoiceId}/finalize`);
  }

  async voidInvoice(invoiceId: string): Promise<any> {
    return this.client.request("POST", `/v1/invoices/${invoiceId}/void`);
  }
}
