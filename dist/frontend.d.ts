export interface EDPayFrontendOptions {
    publicKey: string;
    environment?: "production" | "sandbox";
    baseUrl?: string;
}
export interface OpenModalOptions {
    token?: string;
    paymentUrl?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    onClose?: () => void;
}
export interface MountOptions extends OpenModalOptions {
    container: string | HTMLElement;
    width?: string;
    height?: string;
}
export interface CheckoutOptions extends OpenModalOptions {
    mode?: "modal" | "embedded" | "redirect";
    container?: string | HTMLElement;
    width?: string;
    height?: string;
}
export declare class EDPay {
    private readonly publicKey;
    private readonly baseUrl;
    constructor(options: EDPayFrontendOptions | string);
    private resolveUrl;
    private resolveEmbeddedUrl;
    /**
     * Unified checkout initiator supporting modal, embedded iframe, or direct redirect.
     */
    checkout(options: CheckoutOptions): {
        close?: () => void;
        unmount?: () => void;
    } | void;
    /**
     * Redirects the browser directly to the hosted payment page.
     */
    redirectToCheckout(options: {
        token?: string;
        paymentUrl?: string;
    }): void;
    /**
     * Opens an interactive payment modal overlay with iframe on the current page.
     */
    openModal(options: OpenModalOptions): {
        close: () => void;
    };
    /**
     * Embeds the checkout iframe inside a designated container element.
     */
    mount(options: MountOptions): {
        unmount: () => void;
    };
}
export declare const EDPayFrontend: typeof EDPay;
//# sourceMappingURL=frontend.d.ts.map