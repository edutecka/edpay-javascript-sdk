import type { PaymentCreateOptions, PrivateCheckoutOptions, PublicCheckoutOptions, LinkCheckoutOptions, CheckoutMethodOptions } from "../types.js";

export class PaymentsResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>, authenticated?: boolean) => Promise<any> }) {}

  async create(options: PaymentCreateOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.client.request("POST", "/v1/payments", payload, headers);
  }

  async privateCheckout(paymentId: string, options: PrivateCheckoutOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    return this.client.request(
      "POST",
      `/v1/payments/${encodeURIComponent(paymentId)}/private-checkout`,
      payload,
      { "Idempotency-Key": idempotencyKey }
    );
  }

  async publicCheckout(paymentId: string, options: PublicCheckoutOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    return this.client.request("POST", `/v1/payments/${encodeURIComponent(paymentId)}/public-checkout`, payload, { "Idempotency-Key": idempotencyKey });
  }

  async linkCheckout(paymentId: string, options: LinkCheckoutOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    return this.client.request("POST", `/v1/payments/${encodeURIComponent(paymentId)}/link-checkout`, payload, { "Idempotency-Key": idempotencyKey });
  }

  /** Lists executions with their checkout mode and sessions with no submission. */
  async listCheckouts(paymentId: string): Promise<any> {
    return this.client.request("GET", `/v1/payments/${encodeURIComponent(paymentId)}/checkouts`);
  }

  async getCheckout(token: string): Promise<any> {
    return this.client.request("GET", `/v1/payments/checkouts/${encodeURIComponent(token)}`, undefined, undefined, false);
  }

  async submitCheckoutPayment(token: string, options: CheckoutMethodOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    return this.client.request("POST", `/v1/payments/checkouts/${encodeURIComponent(token)}/payment`, payload, { "Idempotency-Key": idempotencyKey }, false);
  }

  async retrieveCheckoutPayment(token: string): Promise<any> {
    return this.client.request("GET", `/v1/payments/checkouts/${encodeURIComponent(token)}/payment`, undefined, undefined, false);
  }

  async framePolicy(token: string): Promise<any> {
    return this.client.request("GET", `/v1/payments/checkouts/${encodeURIComponent(token)}/frame-policy`, undefined, undefined, false);
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

}
