import * as crypto from "node:crypto";

/**
 * Valida a autenticidade de um evento de webhook da EDPay usando HMAC SHA-256 em tempo constante.
 *
 * @param payload Corpo bruto da requisição HTTP (Buffer ou string).
 * @param signature Valor recebido no header `X-EDPay-Signature`.
 * @param secret Segredo de webhook obtido no dashboard da EDPay (`whsec_...`).
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  if (!payload || !signature || !secret) {
    return false;
  }

  const cleanSig = signature.trim().toLowerCase();
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const digest = hmac.digest("hex").toLowerCase();

  try {
    const sigBuf = Buffer.from(cleanSig, "utf8");
    const digestBuf = Buffer.from(digest, "utf8");
    if (sigBuf.length !== digestBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(sigBuf, digestBuf);
  } catch {
    return false;
  }
}
