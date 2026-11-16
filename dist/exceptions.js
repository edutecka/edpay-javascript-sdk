"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureVerificationError = exports.EDPayError = void 0;
class EDPayError extends Error {
    statusCode;
    responseData;
    errorCode;
    requestId;
    retryAfter;
    constructor(message, statusCode = 400, responseData = null, metadata = {}) {
        super(message);
        this.name = "EDPayError";
        this.statusCode = statusCode;
        this.responseData = responseData;
        this.errorCode = metadata.errorCode;
        this.requestId = metadata.requestId;
        this.retryAfter = metadata.retryAfter;
    }
}
exports.EDPayError = EDPayError;
class SignatureVerificationError extends EDPayError {
    constructor(message = "Invalid EDPay webhook signature") {
        super(message, 400);
        this.name = "SignatureVerificationError";
    }
}
exports.SignatureVerificationError = SignatureVerificationError;
//# sourceMappingURL=exceptions.js.map