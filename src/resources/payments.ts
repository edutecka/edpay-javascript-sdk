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

  /** Legacy alias for creating a payment intent through /v1/payment-checkout. */
  async createCheckout(options: PaymentCreateOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    return this.client.request("POST", "/v1/payment-checkout", payload, { "Idempotency-Key": idempotencyKey });
  }

  async list(limit = 50): Promise<any> {
    const query = new URLSearchParams({ limit: String(limit) });
    return this.client.request("GET", `/v1/payments?${query}`);
  }

  async retrieve(paymentId: string): Promise<any> {
    return this.client.request("GET", `/v1/payments/${encodeURIComponent(paymentId)}`);
  }

  async listEvents(paymentId: string): Promise<any> {
    return this.client.request("GET", `/v1/payments/${encodeURIComponent(paymentId)}/events`);
  }

  async listAttempts(paymentId: string): Promise<any> {
    return this.client.request("GET", `/v1/payments/${encodeURIComponent(paymentId)}/attempts`);
  }
}
