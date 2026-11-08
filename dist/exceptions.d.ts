export declare class EDPayError extends Error {
    readonly statusCode: number;
    readonly responseData: unknown;
    constructor(message: string, statusCode?: number, responseData?: unknown);
}
export declare class SignatureVerificationError extends EDPayError {
    constructor(message?: string);
}
//# sourceMappingURL=exceptions.d.ts.map