import type { PaymentLinkCreateOptions } from "../types.js";

export class PaymentLinksResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any> }) {}

  async create(options: PaymentLinkCreateOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.client.request("POST", "/v1/payment-links", payload, headers);
  }

  async list(): Promise<any> {
    return this.client.request("GET", "/v1/payment-links");
  }

  async retrieve(linkId: string): Promise<any> {
    return this.client.request("GET", `/v1/payment-links/${encodeURIComponent(linkId)}`);
  }

  async deactivate(linkId: string, idempotencyKey: string): Promise<any> {
    return this.client.request("POST", `/v1/payment-links/${encodeURIComponent(linkId)}/deactivate`, undefined, { "Idempotency-Key": idempotencyKey });
  }

  async createCheckoutSession(linkId: string, idempotencyKey: string, embedOrigin?: string): Promise<any> {
    return this.client.request(
      "POST",
      "/v1/checkout/sessions",
      { payment_link_id: linkId, ...(embedOrigin ? { embed_origin: embedOrigin } : {}) },
      { "Idempotency-Key": idempotencyKey }
    );
  }
}
