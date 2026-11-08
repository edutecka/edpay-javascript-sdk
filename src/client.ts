import type { EDPayClientOptions } from "./types.js";
import { EDPayError } from "./exceptions.js";
import { PaymentsResource } from "./resources/payments.js";
import { CheckoutResource } from "./resources/checkout.js";
import { PaymentLinksResource } from "./resources/payment-links.js";
import { CustomersResource } from "./resources/customers.js";

export class EDPayClient {
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  public readonly payments: PaymentsResource;
  public readonly checkout: CheckoutResource;
  public readonly paymentLinks: PaymentLinksResource;
  public readonly customers: CustomersResource;

  constructor(options: EDPayClientOptions) {
    if (!options?.publicKey || !options?.privateKey) {
      throw new Error("EDPayClient requires both publicKey and privateKey.");
    }

    this.publicKey = options.publicKey;
    this.privateKey = options.privateKey;
    this.timeoutMs = options.timeoutMs ?? 30000;

    if (options.baseUrl) {
      this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    } else {
      this.baseUrl =
        options.environment === "sandbox"
          ? "https://sandbox-api.edpay.co.mz"
          : "https://api.edpay.co.mz";
    }

    this.payments = new PaymentsResource(this);
    this.checkout = new CheckoutResource(this);
    this.paymentLinks = new PaymentLinksResource(this);
    this.customers = new CustomersResource(this);
  }

  async request<T = any>(
    method: string,
    path: string,
    body?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "X-EDPay-Public-Key": this.publicKey,
      "X-EDPay-Private-Key": this.privateKey,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "EDPay-Node-SDK/1.0.0",
      ...customHeaders,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      const text = await response.text();
      let data: any = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }
      }

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `HTTP ${response.status} ${response.statusText}`;
        throw new EDPayError(errorMsg, response.status, data);
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timer);
      if (err instanceof EDPayError) throw err;
      throw new EDPayError(err.message || "Network request failed", 0);
    }
  }
}
