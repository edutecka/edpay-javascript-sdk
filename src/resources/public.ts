export class PublicResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>, authenticated?: boolean) => Promise<any> }) {}

  async listPaymentMethods(): Promise<any> {
    return this.client.request("GET", "/v1/public/payment-methods", undefined, undefined, false);
  }
}
