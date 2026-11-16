export class FxResource {
  constructor(private readonly client: { request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<any> }) {}

  async quote(fromCurrency: string, toCurrency: string, amountMinor: number): Promise<any> {
    const query = new URLSearchParams({
      from_currency: fromCurrency,
      to_currency: toCurrency,
      amount_minor: String(amountMinor),
    });
    return this.client.request("GET", `/v1/fx/quote?${query}`);
  }
}
