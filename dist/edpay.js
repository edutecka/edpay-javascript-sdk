/**
 * EDPay JavaScript SDK (Frontend / Browser Bundle)
 * https://pay.edutecka.com
 * (c) Edutecka Pay Lda. All rights reserved.
 */
(function (global) {
  'use strict';

  function EDPay(options) {
    if (!(this instanceof EDPay)) {
      return new EDPay(options);
    }
    if (typeof options === 'string') {
      this.publicKey = options;
      this.baseUrl = 'https://pay.edutecka.com';
    } else if (options && typeof options === 'object') {
      if (!options.publicKey) {
        throw new Error('EDPay requires a valid publicKey (pk_live_... or pk_test_...).');
      }
      this.publicKey = options.publicKey;
      if (options.baseUrl) {
        this.baseUrl = options.baseUrl.replace(/\/+$/, '');
      } else {
        this.baseUrl = options.environment === 'sandbox'
          ? 'https://sandbox.pay.edutecka.com'
          : 'https://pay.edutecka.com';
      }
    } else {
      throw new Error('EDPay requires an options object or public key string.');
    }
  }

  EDPay.prototype.resolveUrl = function (options) {
    if (options.paymentUrl) {
      return options.paymentUrl;
    }
    if (options.token) {
      return this.baseUrl + '/pay?token=' + encodeURIComponent(options.token) + '&pk=' + encodeURIComponent(this.publicKey);
    }
    throw new Error("EDPay: Either 'token' or 'paymentUrl' must be provided.");
  };

  EDPay.prototype.redirectToCheckout = function (options) {
    var url = this.resolveUrl(options);
    window.location.href = url;
  };

  EDPay.prototype.openModal = function (options) {
    options = options || {};
    var checkoutUrl = this.resolveUrl(options);

    // Overlay backdrop
    var overlay = document.createElement('div');
    overlay.id = 'edpay-modal-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;opacity:0;transition:opacity 0.25s ease-in-out;';

    // Modal Card
    var modal = document.createElement('div');
    modal.style.cssText = 'position:relative;width:100%;max-width:480px;height:min(680px,92vh);background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);display:flex;flex-direction:column;';

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.style.cssText = 'position:absolute;top:12px;right:12px;width:32px;height:32px;border:none;border-radius:50%;background:rgba(0,0,0,0.08);color:#333;font-size:22px;line-height:1;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;';

    // Iframe
    var iframe = document.createElement('iframe');
    iframe.src = checkoutUrl;
    var checkoutOrigin = new URL(iframe.src).origin;
    iframe.style.cssText = 'width:100%;height:100%;border:none;';
    iframe.allow = 'payment';

    modal.appendChild(closeBtn);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
    });

    function cleanup() {
      window.removeEventListener('message', handleMessage);
      overlay.style.opacity = '0';
      setTimeout(function () {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 250);
    }

    function handleClose() {
      cleanup();
      if (typeof options.onClose === 'function') {
        options.onClose();
      }
    }

    closeBtn.addEventListener('click', handleClose);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        handleClose();
      }
    });

    function handleMessage(event) {
      if (event.origin !== checkoutOrigin || event.source !== iframe.contentWindow) return;
      if (!event.data || typeof event.data !== 'object') return;
      var type = event.data.type;
      var payload = event.data.payload;

      if (type === 'edpay:payment_success' || type === 'edpay:success') {
        if (typeof options.onSuccess === 'function') {
          options.onSuccess(payload);
        }
        setTimeout(handleClose, 1500);
      } else if (type === 'edpay:payment_failed' || type === 'edpay:error') {
        if (typeof options.onError === 'function') {
          options.onError(payload);
        }
      } else if (type === 'edpay:close') {
        handleClose();
      }
    }

    window.addEventListener('message', handleMessage);

    return {
      close: handleClose
    };
  };

  EDPay.prototype.mount = function (options) {
    options = options || {};
    var target = typeof options.container === 'string'
      ? document.getElementById(options.container)
      : options.container;

    if (!target) {
      throw new Error("EDPay: Target container '" + options.container + "' not found.");
    }

    var checkoutUrl = this.resolveUrl(options);
    var iframe = document.createElement('iframe');
    iframe.src = checkoutUrl;
    var checkoutOrigin = new URL(iframe.src).origin;
    iframe.style.cssText = 'width:' + (options.width || '100%') + ';height:' + (options.height || '620px') + ';border:none;border-radius:16px;';
    iframe.allow = 'payment';

    target.innerHTML = '';
    target.appendChild(iframe);

    function handleMessage(event) {
      if (event.origin !== checkoutOrigin || event.source !== iframe.contentWindow) return;
      if (!event.data || typeof event.data !== 'object') return;
      var type = event.data.type;
      var payload = event.data.payload;

      if (type === 'edpay:payment_success' || type === 'edpay:success') {
        if (typeof options.onSuccess === 'function') options.onSuccess(payload);
      } else if (type === 'edpay:payment_failed' || type === 'edpay:error') {
        if (typeof options.onError === 'function') options.onError(payload);
      } else if (type === 'edpay:close') {
        if (typeof options.onClose === 'function') options.onClose();
      }
    }

    window.addEventListener('message', handleMessage);

    return {
      unmount: function () {
        window.removeEventListener('message', handleMessage);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }
    };
  };

  EDPay.prototype.checkout = function (options) {
    options = options || {};
    if (options.mode === 'embedded' || options.container) {
      return this.mount(options);
    }
    if (options.mode === 'redirect') {
      return this.redirectToCheckout(options);
    }
    return this.openModal(options);
  };

  global.EDPay = EDPay;
  global.EdPay = EDPay;

})(typeof window !== 'undefined' ? window : this);
