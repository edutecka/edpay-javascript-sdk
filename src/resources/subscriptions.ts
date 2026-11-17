export class SubscriptionsResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any> }) {}

  async create(payload: Record<string, unknown>, idempotencyKey: string): Promise<any> {
    return this.client.request("POST", "/v1/invoices/series", payload, { "Idempotency-Key": idempotencyKey });
  }

  async list(params?: { limit?: number }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.limit !== undefined) {
      query.set("limit", String(params.limit));
    }
    const qs = query.toString();
    return this.client.request("GET", `/v1/invoices/series${qs ? `?${qs}` : ""}`);
  }

  async pause(seriesId: string): Promise<any> {
    return this.client.request("POST", `/v1/invoices/series/${encodeURIComponent(seriesId)}/pause`);
  }

  async resume(seriesId: string): Promise<any> {
    return this.client.request("POST", `/v1/invoices/series/${encodeURIComponent(seriesId)}/resume`);
  }
}
