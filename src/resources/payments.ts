import type { PaymentCreateOptions } from "../types.js";

export class PaymentsResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any> }) {}

  async create(options: PaymentCreateOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.client.request("POST", "/v1/payments", payload, headers);
  }

  async retrieve(paymentId: string): Promise<any> {
    return this.client.request("GET", `/v1/payments/${paymentId}`);
  }

  async cancel(paymentId: string): Promise<any> {
    return this.client.request("POST", `/v1/payments/${paymentId}/cancel`);
  }
}
