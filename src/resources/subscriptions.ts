export class SubscriptionsResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any> }) {}

  async create(payload: Record<string, any>, idempotencyKey?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.client.request("POST", "/v1/invoice-series", payload, headers);
  }

  async list(params?: { customer_id?: string; status?: string; limit?: number; offset?: number }): Promise<any> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) query.append(k, String(v));
      });
    }
    const qs = query.toString();
    return this.client.request("GET", `/v1/invoice-series${qs ? `?${qs}` : ""}`);
  }

  async retrieve(seriesId: string): Promise<any> {
    return this.client.request("GET", `/v1/invoice-series/${seriesId}`);
  }

  async pause(seriesId: string): Promise<any> {
    return this.client.request("POST", `/v1/invoice-series/${seriesId}/pause`);
  }

  async resume(seriesId: string): Promise<any> {
    return this.client.request("POST", `/v1/invoice-series/${seriesId}/resume`);
  }

  async cancel(seriesId: string): Promise<any> {
    return this.client.request("POST", `/v1/invoice-series/${seriesId}/cancel`);
  }
}
