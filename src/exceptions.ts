export class EDPayError extends Error {
  public readonly statusCode: number;
  public readonly responseData: unknown;
  public readonly errorCode?: string;
  public readonly requestId?: string;
  public readonly retryAfter?: string;

  constructor(message: string, statusCode = 400, responseData: unknown = null, metadata: { errorCode?: string; requestId?: string; retryAfter?: string } = {}) {
    super(message);
    this.name = "EDPayError";
    this.statusCode = statusCode;
    this.responseData = responseData;
    this.errorCode = metadata.errorCode;
    this.requestId = metadata.requestId;
    this.retryAfter = metadata.retryAfter;
  }
}

export class SignatureVerificationError extends EDPayError {
  constructor(message = "Invalid EDPay webhook signature") {
    super(message, 400);
    this.name = "SignatureVerificationError";
  }
}
