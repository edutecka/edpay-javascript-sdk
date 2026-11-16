export class WalletsResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any> }) {}

  async list(): Promise<any> {
    return this.client.request("GET", "/v1/wallets");
  }

  async retrieve(walletId: string): Promise<any> {
    return this.client.request("GET", `/v1/wallets/${encodeURIComponent(walletId)}`);
  }

  async balance(walletId: string): Promise<any> {
    return this.client.request("GET", `/v1/wallets/${encodeURIComponent(walletId)}/balance`);
  }

  async listEntries(walletId: string, params?: { cursor?: string; limit?: number }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.cursor) query.set("cursor", params.cursor);
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    const queryString = query.toString();
    const suffix = queryString ? `?${queryString}` : "";
    return this.client.request("GET", `/v1/wallets/${encodeURIComponent(walletId)}/entries${suffix}`);
  }
}
