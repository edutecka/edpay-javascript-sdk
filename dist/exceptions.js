"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureVerificationError = exports.EDPayError = void 0;
class EDPayError extends Error {
    statusCode;
    responseData;
    constructor(message, statusCode = 400, responseData = null) {
        super(message);
        this.name = "EDPayError";
        this.statusCode = statusCode;
        this.responseData = responseData;
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