"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = verifyWebhookSignature;
const crypto = __importStar(require("node:crypto"));
/**
 * Valida a autenticidade de um evento de webhook da EDPay usando HMAC SHA-256 em tempo constante.
 *
 * @param payload Corpo bruto da requisição HTTP (Buffer ou string).
 * @param signature Valor recebido no header `X-EDPay-Signature`.
 * @param secret Segredo de webhook obtido no dashboard da EDPay (`whsec_...`).
 */
function verifyWebhookSignature(payload, signature, secret) {
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
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=webhooks.js.map