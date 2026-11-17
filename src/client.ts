import type { EDPayClientOptions } from "./types.js";
import { EDPayError } from "./exceptions.js";
import { PaymentsResource } from "./resources/payments.js";
import { CustomersResource } from "./resources/customers.js";
import { InvoicesResource } from "./resources/invoices.js";
import { SubscriptionsResource } from "./resources/subscriptions.js";
import { FxResource } from "./resources/fx.js";
import { WalletsResource } from "./resources/wallets.js";
import { WebhooksResource } from "./resources/webhooks.js";
import { PublicResource } from "./resources/public.js";

export class EDPayClient {
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  public readonly payments: PaymentsResource;
  public readonly customers: CustomersResource;
  public readonly invoices: InvoicesResource;
  public readonly subscriptions: SubscriptionsResource;
  public readonly fx: FxResource;
  public readonly wallets: WalletsResource;
  public readonly webhooks: WebhooksResource;
  public readonly public: PublicResource;

  constructor(options: EDPayClientOptions) {
    const publicKey = options?.publicKey?.trim();
    const privateKey = options?.privateKey?.trim();
    const publicMode = publicKey?.match(/^pk_(test|live)_[a-fA-F0-9]{24}$/)?.[1] ?? null;
    const privateMode = privateKey?.match(/^sk_(test|live)_[a-fA-F0-9]{64}$/)?.[1] ?? null;
    if (!publicMode || !privateMode) {
      throw new Error("EDPayClient requires a valid publicKey (pk_test_/pk_live_ plus 24 hex characters) and privateKey (sk_test_/sk_live_ plus 64 hex characters).");
    }
    if (publicMode !== privateMode) {
      throw new Error("EDPay publicKey and privateKey must use the same environment (test or live).");
    }

    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.timeoutMs = options.timeoutMs ?? 90000;

    if (options.baseUrl) {
      this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    } else {
      this.baseUrl = "https://api-pay.edutecka.com";
    }

    this.payments = new PaymentsResource(this);
    this.customers = new CustomersResource(this);
    this.invoices = new InvoicesResource(this);
    this.subscriptions = new SubscriptionsResource(this);
    this.fx = new FxResource(this);
    this.wallets = new WalletsResource(this);
    this.webhooks = new WebhooksResource(this);
    this.public = new PublicResource(this);
  }

  async request<T = any>(
    method: string,
    path: string,
    body?: unknown,
    customHeaders?: Record<string, string>,
    authenticated = true
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "EDPay-Node-SDK/1.6.1",
      ...customHeaders,
    };
    if (authenticated) {
      headers["X-EDPay-Public-Key"] = this.publicKey;
      headers["X-EDPay-Private-Key"] = this.privateKey;
    }

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
        const apiError = data?.error;
        const errorMsg = apiError?.message || data?.message || (typeof apiError === "string" ? apiError : undefined) || `HTTP ${response.status} ${response.statusText}`;
        throw new EDPayError(errorMsg, response.status, data, {
          errorCode: apiError?.code,
          requestId: response.headers.get("X-Request-Id") ?? undefined,
          retryAfter: response.headers.get("Retry-After") ?? undefined,
        });
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timer);
      if (err instanceof EDPayError) throw err;
      throw new EDPayError(err.message || "Network request failed", 0);
    }
  }
}
