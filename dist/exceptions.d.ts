export declare class EDPayError extends Error {
    readonly statusCode: number;
    readonly responseData: unknown;
    readonly errorCode?: string;
    readonly requestId?: string;
    readonly retryAfter?: string;
    constructor(message: string, statusCode?: number, responseData?: unknown, metadata?: {
        errorCode?: string;
        requestId?: string;
        retryAfter?: string;
    });
}
export declare class SignatureVerificationError extends EDPayError {
    constructor(message?: string);
}
//# sourceMappingURL=exceptions.d.ts.map