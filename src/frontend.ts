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

export class EDPay {
  private readonly publicKey: string;
  private readonly baseUrl: string;

  constructor(options: EDPayFrontendOptions | string) {
    if (typeof options === "string") {
      this.publicKey = options;
      this.baseUrl = "https://pay.edutecka.com";
    } else {
      if (!options?.publicKey) {
        throw new Error("EDPay requires a valid publicKey (pk_live_... or pk_test_...).");
      }
      this.publicKey = options.publicKey;
      if (options.baseUrl) {
        this.baseUrl = options.baseUrl.replace(/\/+$/, "");
      } else {
        this.baseUrl =
          options.environment === "sandbox"
            ? "https://sandbox.pay.edutecka.com"
            : "https://pay.edutecka.com";
      }
    }
  }

  private resolveUrl(options: { token?: string; paymentUrl?: string }): string {
    if (options.paymentUrl) {
      return options.paymentUrl;
    }
    if (options.token) {
      return `${this.baseUrl}/pay?token=${encodeURIComponent(options.token)}&pk=${encodeURIComponent(this.publicKey)}`;
    }
    throw new Error("EDPay: Either 'token' or 'paymentUrl' must be provided.");
  }

  /**
   * Redirects the browser directly to the hosted payment page.
   */
  redirectToCheckout(options: { token?: string; paymentUrl?: string }): void {
    if (typeof window === "undefined") return;
    const url = this.resolveUrl(options);
    window.location.href = url;
  }

  /**
   * Opens an interactive payment modal overlay with iframe on the current page.
   */
  openModal(options: OpenModalOptions): { close: () => void } {
    if (typeof document === "undefined") {
      return { close: () => {} };
    }

    const checkoutUrl = this.resolveUrl(options);

    // Overlay backdrop
    const overlay = document.createElement("div");
    overlay.id = "edpay-modal-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.65)";
    overlay.style.backdropFilter = "blur(4px)";
    overlay.style.zIndex = "999999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "16px";
    overlay.style.boxSizing = "border-box";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.25s ease-in-out";

    // Dialog card
    const modal = document.createElement("div");
    modal.style.position = "relative";
    modal.style.width = "100%";
    modal.style.maxWidth = "480px";
    modal.style.height = "min(680px, 92vh)";
    modal.style.backgroundColor = "#ffffff";
    modal.style.borderRadius = "20px";
    modal.style.overflow = "hidden";
    modal.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.35)";
    modal.style.display = "flex";
    modal.style.flexDirection = "column";

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.innerHTML = "&times;";
    closeBtn.setAttribute("aria-label", "Fechar");
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "12px";
    closeBtn.style.right = "12px";
    closeBtn.style.width = "32px";
    closeBtn.style.height = "32px";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "50%";
    closeBtn.style.backgroundColor = "rgba(0, 0, 0, 0.08)";
    closeBtn.style.color = "#333";
    closeBtn.style.fontSize = "22px";
    closeBtn.style.lineHeight = "1";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.zIndex = "10";
    closeBtn.style.display = "flex";
    closeBtn.style.alignItems = "center";
    closeBtn.style.justifyContent = "center";

    // Iframe
    const iframe = document.createElement("iframe");
    iframe.src = checkoutUrl;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.allow = "payment";

    modal.appendChild(closeBtn);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
    });

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      overlay.style.opacity = "0";
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 250);
    };

    const handleClose = () => {
      cleanup();
      options.onClose?.();
    };

    closeBtn.addEventListener("click", handleClose);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        handleClose();
      }
    });

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      const { type, payload } = event.data;

      if (type === "edpay:payment_success" || type === "edpay:success") {
        options.onSuccess?.(payload);
        setTimeout(handleClose, 1500);
      } else if (type === "edpay:payment_failed" || type === "edpay:error") {
        options.onError?.(payload);
      } else if (type === "edpay:close") {
        handleClose();
      }
    };

    window.addEventListener("message", handleMessage);

    return {
      close: handleClose,
    };
  }

  /**
   * Embeds the checkout iframe inside a designated container element.
   */
  mount(options: MountOptions): { unmount: () => void } {
    if (typeof document === "undefined") {
      return { unmount: () => {} };
    }

    const target =
      typeof options.container === "string"
        ? document.getElementById(options.container)
        : options.container;

    if (!target) {
      throw new Error(`EDPay: Target container '${options.container}' not found.`);
    }

    const checkoutUrl = this.resolveUrl(options);
    const iframe = document.createElement("iframe");
    iframe.src = checkoutUrl;
    iframe.style.width = options.width ?? "100%";
    iframe.style.height = options.height ?? "620px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "16px";
    iframe.allow = "payment";

    target.innerHTML = "";
    target.appendChild(iframe);

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      const { type, payload } = event.data;

      if (type === "edpay:payment_success" || type === "edpay:success") {
        options.onSuccess?.(payload);
      } else if (type === "edpay:payment_failed" || type === "edpay:error") {
        options.onError?.(payload);
      } else if (type === "edpay:close") {
        options.onClose?.();
      }
    };

    window.addEventListener("message", handleMessage);

    return {
      unmount: () => {
        window.removeEventListener("message", handleMessage);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      },
    };
  }
}

export const EDPayFrontend = EDPay;
