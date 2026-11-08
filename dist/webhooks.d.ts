/**
 * Valida a autenticidade de um evento de webhook da EDPay usando HMAC SHA-256 em tempo constante.
 *
 * @param payload Corpo bruto da requisição HTTP (Buffer ou string).
 * @param signature Valor recebido no header `X-EDPay-Signature`.
 * @param secret Segredo de webhook obtido no dashboard da EDPay (`whsec_...`).
 */
export declare function verifyWebhookSignature(payload: string | Buffer, signature: string, secret: string): boolean;
//# sourceMappingURL=webhooks.d.ts.map