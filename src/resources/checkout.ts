import type { CheckoutSessionCreateOptions } from "../types.js";

export class CheckoutResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any> }) {}

  async createSession(options: CheckoutSessionCreateOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.client.request("POST", "/v1/checkout/sessions", payload, headers);
  }

  async retrieveSession(sessionId: string): Promise<any> {
    return this.client.request("GET", `/v1/checkout/sessions/${sessionId}`);
  }

  async expireSession(sessionId: string): Promise<any> {
    return this.client.request("POST", `/v1/checkout/sessions/${sessionId}/expire`);
  }
}
