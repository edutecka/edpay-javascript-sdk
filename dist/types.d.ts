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
    currency: "MZN" | "USD" | "EUR";
    method?: string;
    phone?: string;
    customer_id?: string;
    reference?: string;
    description?: string;
    channel?: PaymentChannelOptions;
    idempotencyKey: string;
}
/** Method-specific payment instrument fields accepted by the partner API. */
export interface PaymentChannelOptions {
    type?: string;
    provider?: string;
    customer_phone?: string;
    customer_email?: string;
    payment_token?: string;
    wallet_token?: string;
    return_url?: string;
    holder_name?: string;
}
export interface CheckoutSessionCreateOptions {
    payment_link_id: string;
    embed_origin?: string;
    idempotencyKey: string;
}
export interface PaymentLinkCreateOptions {
    amount_minor: number;
    currency: "MZN" | "USD" | "EUR";
    expires_at?: string;
    idempotencyKey: string;
}
export interface CustomerCreateOptions {
    name: string;
    email?: string;
    idempotencyKey: string;
}
export interface CustomerUpdateOptions {
    name?: string;
    email?: string;
    idempotencyKey: string;
}
export interface CheckoutPaymentOptions {
    method: string;
    phone: string;
    idempotencyKey: string;
}
export interface WebhookEndpointAuth {
    type: "bearer";
    token: string;
}
export interface WebhookHeaderAuth {
    type: "header";
    name: string;
    value: string;
}
export interface WebhookEndpointCreateOptions {
    url: string;
    events: string[];
    auth?: WebhookEndpointAuth | WebhookHeaderAuth | null;
    idempotencyKey: string;
}
export interface WebhookEndpointUpdateOptions {
    url?: string;
    events?: string[];
    auth?: WebhookEndpointAuth | WebhookHeaderAuth | null;
}
export type EDPayWebhookEventType = "payment.created" | "payment.updated" | "payment.succeeded" | "payment.failed" | "payment.cancelled" | "payment.reconciliation_required";
export type EDPayPaymentStatus = "pending" | "processing" | "unknown" | "succeeded" | "failed" | "cancelled";
/** Sanitized payment data delivered in EDPay payment webhook events. */
export interface EDPayWebhookPaymentData {
    object: "payment";
    id: string;
    reference: string;
    payment_link_id: string | null;
    trans_id: string;
    method: string;
    status: EDPayPaymentStatus;
    amount_minor: number;
    currency: "MZN" | "USD" | "EUR";
    platform_fee_minor?: number;
    receiver_net_minor?: number;
    reconciliation_status?: "manual_review";
    reconciliation_code?: string;
    created_at: string;
}
/** Verified webhook event envelope. Validate the signature before parsing JSON. */
export interface EDPayWebhookEvent {
    id: string;
    object: "event";
    type: EDPayWebhookEventType;
    created_at: string;
    data: EDPayWebhookPaymentData;
}
//# sourceMappingURL=types.d.ts.map