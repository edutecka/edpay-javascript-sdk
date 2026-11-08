export type EDPayEnvironment = "production" | "sandbox";

export interface EDPayClientOptions {
  publicKey: string;
  privateKey: string;
  environment?: EDPayEnvironment;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface PaymentCreateOptions {
  amount_minor: number;
  currency: string;
  method: string;
  phone?: string;
  reference?: string;
  description?: string;
  emola_custom_message?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface CheckoutSessionCreateOptions {
  amount_minor: number;
  currency: string;
  success_url: string;
  cancel_url: string;
  reference?: string;
  payment_methods?: string[];
  customer_email?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface PaymentLinkCreateOptions {
  title: string;
  amount_minor: number;
  currency?: string;
  description?: string;
  allowed_methods?: string[];
  max_uses?: number;
  expires_at?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface CustomerCreateOptions {
  name: string;
  email: string;
  phone?: string;
  tax_id?: string;
  metadata?: Record<string, unknown>;
}
