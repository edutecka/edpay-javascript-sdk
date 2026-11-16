import type { CheckoutPaymentOptions, CheckoutSessionCreateOptions } from "../types.js";

export class CheckoutResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>, authenticated?: boolean) => Promise<any> }) {}

  async createSession(options: CheckoutSessionCreateOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.client.request("POST", "/v1/checkout/sessions", payload, headers);
  }

  async retrieveSession(sessionId: string): Promise<any> {
    return this.client.request("GET", `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, undefined, undefined, false);
  }

  async getPaymentLink(linkId: string): Promise<any> {
    return this.client.request("GET", `/v1/checkout/payment-links/${encodeURIComponent(linkId)}`, undefined, undefined, false);
  }

  async getFramePolicy(token: string): Promise<any> {
    return this.client.request("GET", `/v1/checkout/sessions/${encodeURIComponent(token)}/frame-policy`, undefined, undefined, false);
  }

  async createSessionPayment(token: string, options: CheckoutPaymentOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    return this.client.request(
      "POST",
      `/v1/checkout/sessions/${encodeURIComponent(token)}/payments`,
      payload,
      { "Idempotency-Key": idempotencyKey },
      false
    );
  }

  async retrieveSessionPayment(token: string, paymentId: string): Promise<any> {
    return this.client.request(
      "GET",
      `/v1/checkout/sessions/${encodeURIComponent(token)}/payments/${encodeURIComponent(paymentId)}`,
      undefined,
      undefined,
      false
    );
  }

  /** Change method for the same session payment after the previous attempt definitively failed. */
  async createSessionPaymentAttempt(token: string, paymentId: string, options: CheckoutPaymentOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    return this.client.request(
      "POST",
      `/v1/checkout/sessions/${encodeURIComponent(token)}/payments/${encodeURIComponent(paymentId)}/attempts`,
      payload,
      { "Idempotency-Key": idempotencyKey },
      false
    );
  }

  async createPaymentLinkPayment(linkId: string, options: CheckoutPaymentOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    return this.client.request(
      "POST",
      `/v1/checkout/payment-links/${encodeURIComponent(linkId)}/payments`,
      payload,
      { "Idempotency-Key": idempotencyKey },
      false
    );
  }

  async retrievePaymentLinkPayment(linkId: string, paymentId: string): Promise<any> {
    return this.client.request(
      "GET",
      `/v1/checkout/payment-links/${encodeURIComponent(linkId)}/payments/${encodeURIComponent(paymentId)}`,
      undefined,
      undefined,
      false
    );
  }

  /** Change method for the same payment-link payment after the previous attempt definitively failed. */
  async createPaymentLinkPaymentAttempt(linkId: string, paymentId: string, options: CheckoutPaymentOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    return this.client.request(
      "POST",
      `/v1/checkout/payment-links/${encodeURIComponent(linkId)}/payments/${encodeURIComponent(paymentId)}/attempts`,
      payload,
      { "Idempotency-Key": idempotencyKey },
      false
    );
  }
}
