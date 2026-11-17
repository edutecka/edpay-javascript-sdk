import type { WebhookEndpointCreateOptions, WebhookEndpointUpdateOptions } from "../types.js";

export class WebhooksResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any> }) {}

  async listEndpoints(): Promise<any> {
    return this.client.request("GET", "/v1/webhooks/endpoints");
  }

  async createEndpoint(options: WebhookEndpointCreateOptions): Promise<any> {
    const { idempotencyKey, ...payload } = options;
    return this.client.request("POST", "/v1/webhooks/endpoints", payload, { "Idempotency-Key": idempotencyKey });
  }

  async updateEndpoint(endpointId: string, options: WebhookEndpointUpdateOptions): Promise<any> {
    return this.client.request("PATCH", `/v1/webhooks/endpoints/${encodeURIComponent(endpointId)}`, options);
  }

  async disableEndpoint(endpointId: string): Promise<any> {
    return this.client.request("POST", `/v1/webhooks/endpoints/${encodeURIComponent(endpointId)}/disable`);
  }

  async deleteEndpoint(endpointId: string): Promise<any> {
    return this.client.request("DELETE", `/v1/webhooks/endpoints/${encodeURIComponent(endpointId)}`);
  }

  async listDeliveries(limit = 50): Promise<any> {
    const query = new URLSearchParams({ limit: String(limit) });
    return this.client.request("GET", `/v1/webhooks/deliveries?${query}`);
  }

  async retrieveDelivery(deliveryId: string): Promise<any> {
    return this.client.request("GET", `/v1/webhooks/deliveries/${encodeURIComponent(deliveryId)}`);
  }

  async retryDelivery(deliveryId: string): Promise<any> {
    return this.client.request("POST", `/v1/webhooks/deliveries/${encodeURIComponent(deliveryId)}/retry`);
  }
}
