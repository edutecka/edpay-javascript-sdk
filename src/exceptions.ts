export class EDPayError extends Error {
  public readonly statusCode: number;
  public readonly responseData: unknown;

  constructor(message: string, statusCode = 400, responseData: unknown = null) {
    super(message);
    this.name = "EDPayError";
    this.statusCode = statusCode;
    this.responseData = responseData;
  }
}

export class SignatureVerificationError extends EDPayError {
  constructor(message = "Invalid EDPay webhook signature") {
    super(message, 400);
    this.name = "SignatureVerificationError";
  }
}
