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
 * Verify an EDPay `Payment-Signature` header against the raw HTTP request body.
 * EDPay signs `timestamp + "." + rawBody` with HMAC-SHA256. Verify before parsing
 * JSON, and reject stale timestamps to limit replay attacks.
 */
function verifyWebhookSignature(payload, signatureHeader, secret, options = {}) {
    if (!payload || !signatureHeader || !secret)
        return false;
    const tolerance = options.toleranceSeconds ?? 300;
    const now = options.now ?? Math.floor(Date.now() / 1000);
    if (!Number.isInteger(tolerance) || tolerance < 0 || !Number.isFinite(now))
        return false;
    let timestamp;
    let signature;
    for (const field of signatureHeader.split(",")) {
        const [rawKey, ...rawValue] = field.trim().split("=");
        const key = rawKey?.trim();
        const value = rawValue.join("=").trim();
        if (key === "t") {
            if (timestamp !== undefined)
                return false;
            timestamp = value;
        }
        else if (key === "v1") {
            if (signature !== undefined)
                return false;
            signature = value;
        }
    }
    if (!timestamp || !/^\d+$/.test(timestamp) || !signature || !/^[a-f\d]{64}$/i.test(signature))
        return false;
    const signedAt = Number(timestamp);
    if (!Number.isSafeInteger(signedAt) || Math.abs(now - signedAt) > tolerance)
        return false;
    const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.`).update(payload).digest();
    const received = Buffer.from(signature, "hex");
    return received.length === expected.length && crypto.timingSafeEqual(expected, received);
}
//# sourceMappingURL=webhooks.js.map