# EDPay JavaScript / TypeScript SDK

The official JavaScript and TypeScript SDK for server-side Node.js applications. It can also be used in browser code through its frontend helpers, but **never expose a private API key in a browser or other untrusted environment**.

## Requirements

- Node.js 22.23.5 or later in the 22.x line, 24.22.3 or later in the 24.x line, or 26.13.1 or later in the 26.x line.
- npm, pnpm, or yarn

## Install

Install the package from npm:

```bash
npm install @edutecka-mz/edpay-sdk@1.6.2
```

The package import name is `@edutecka-mz/edpay-sdk`.

## Format and validate phone contacts

The contact helpers normalize common phone input (`+258...`, `258...`, `00 258...`, or national digits), reject unsupported characters, and can validate the national length and prefixes required by the selected payment method. They default to Mozambique's calling code (`258`) and nine national digits. Pass different rules when the selected method or country uses another format; the API's payment method identifier remains dynamic.

```typescript
import {
  addCountryPrefix,
  formatPhoneNumber,
  normalizePhoneNumber,
  phoneNumberOptionsForMethod,
  removeCountryPrefix,
  validatePhoneNumber,
} from "@edutecka-mz/edpay-sdk";

const contactInput = process.env.CUSTOMER_PHONE ?? "";
const selectedMethodRules = phoneNumberOptionsForMethod(process.env.EDPAY_METHOD ?? "");
if (selectedMethodRules !== null) {
  if (!validatePhoneNumber(contactInput, selectedMethodRules)) {
    throw new Error("Phone number is invalid for the selected method.");
  }
  const phoneForRequest = normalizePhoneNumber(contactInput, selectedMethodRules);
  const phoneForDisplay = formatPhoneNumber(contactInput, selectedMethodRules);
  const internationalPhone = addCountryPrefix(contactInput, selectedMethodRules);
  const nationalPhone = removeCountryPrefix(contactInput, selectedMethodRules);
}
```

`phoneNumberOptionsForMethod(method)` supplies the known rules for `emola` (national `86`/`87`, output `national`) and `mpesa` (`84`/`85`, output `country-code`, i.e. `258` plus national digits). It returns `null` for other method identifiers, including non-phone methods; use account-provided rules for other phone methods and skip phone validation for tokenized methods. `nationalPrefixes` and country rules remain configurable. `validatePhoneNumber` returns a boolean.

## Load available payment methods

After creating the client, use the public catalog to populate a method selector, then send the selected `code` to the payment resource. The SDK does not hard-code gateway identifiers:

```typescript
const catalog = await edpay.public.listPaymentMethods();
const availableMethods = catalog.data.payment_methods.filter((method) => method.enabled);
```

## Create a payment from a Node.js service

Every partner API request requires both `EDPAY_PUBLIC_KEY` (`pk_test_` or `pk_live_`) and `EDPAY_PRIVATE_KEY` (`sk_test_` or `sk_live_`) from the same environment. The SDK rejects missing, blank, or mismatched key pairs when creating the client. Public catalog requests and buyer-facing checkout requests authenticated by a checkout token do not use the partner key pair; never put the private key in browser code.

Store the keys in the server environment, not in source control:

```dotenv
EDPAY_PUBLIC_KEY=pk_test_...
EDPAY_PRIVATE_KEY=sk_test_...
```

```typescript
import { EDPayClient } from "@edutecka-mz/edpay-sdk";
import { normalizePhoneNumber, phoneNumberOptionsForMethod } from "@edutecka-mz/edpay-sdk";

const edpay = new EDPayClient({
  publicKey: process.env.EDPAY_PUBLIC_KEY!,
  privateKey: process.env.EDPAY_PRIVATE_KEY!,
});

const payment = await edpay.payments.create({
  amount_minor: 50000, // 500.00 MZN
  currency: "MZN",
  reference: "ORDER-10492",
  description: "Example order",
  idempotencyKey: "ORDER-10492-CREATE-1",
});

console.log(payment);
```

By default, the client uses `https://api-pay.edutecka.com`; set `baseUrl` only when EDPay provides a different API host for your account. Sandbox or production access is determined by the API keys. Partner requests send `X-EDPay-Public-Key` and `X-EDPay-Private-Key`; the public catalog and token-based checkout routes omit them. `idempotencyKey` is sent as the `Idempotency-Key` header. Payment amounts are expressed in minor currency units. `payments.create` creates only the parent payment. Select a dynamic method afterward through `privateCheckout`, or let the buyer choose in hosted or link checkout. Method fields such as `phone` or `channel` belong to that child operation and depend on the selected method.

### Browser checkout (frontend only)

`EDPay` is the browser checkout helper. It is separate from the server-side `EDPayClient` instance named `edpay` above. Use a public key only; never bundle a private key into browser code. Pass the checkout token created by your server:

```typescript
import { EDPay } from "@edutecka-mz/edpay-sdk/frontend";

const checkoutToken = "<TOKEN_RETURNED_BY_YOUR_SERVER>";
const checkoutClient = new EDPay({
  publicKey: process.env.NEXT_PUBLIC_EDPAY_PUBLIC_KEY!,
});

checkoutClient.checkout({ token: checkoutToken, mode: "redirect" });
```

To retrieve a payment:

Use the server-side `edpay` (`EDPayClient`) instance created in the first example:

```typescript
const payment = await edpay.payments.retrieve("PAYMENT_ID");
```

## Choose a checkout mode for one payment

`payments.create` creates the parent record only. After saving its ID and reference with your order, use a child function to choose the integration. The same payment can be opened through private API processing, hosted checkout, or a shareable link checkout. A buyer can choose a method at checkout; the payment ID and reference remain unchanged.

```typescript
const payment = await edpay.payments.create({
  amount_minor: 50000,
  currency: "MZN",
  reference: "ORDER-10492",
  idempotencyKey: "ORDER-10492-CREATE",
});
const paymentId = payment.data.id;

// Choose one checkout mode for this parent payment:
const checkout = await edpay.payments.publicCheckout(paymentId, {
  idempotencyKey: "ORDER-10492-PUBLIC-CHECKOUT",
});
// Or call privateCheckout(paymentId, options) or linkCheckout(paymentId, options).
// Use checkout.data.token in the buyer-facing checkout. Never send partner keys to a browser.
```

`privateCheckout` submits a method from your backend. `publicCheckout` returns a token for EDPay-hosted checkout. `linkCheckout` returns a shareable token for the same payment. `listCheckouts(paymentId)` lists private executions, public/link executions, and sessions with no submitted method; each execution keeps the checkout mode that started it. `retrieve(paymentId)` fetches current status from the API; use verified webhooks for asynchronous updates.

### Synchronous PIN confirmation

For a method that uses a PIN prompt (currently M-Pesa and e-Mola), the provider's 60-second PIN window starts only after the Master dispatches the charge. The API's 80-second `private-checkout` deadline starts when it receives the request, so validation, queueing, and dispatch latency already consume that time. Other gateway methods can use different authorization flows and timings. The API returns HTTP `200` with a terminal attempt or `202` if the result is still pending, processing, or unknown when the deadline expires. The SDK transport timeout defaults to 90 seconds; keep a custom timeout above 80 seconds. If the caller disconnects, durable processing continues; configured webhook endpoints receive the event when the payment result is confirmed. You can also query `GET /v1/payments/{id}` and `GET /v1/payments/{id}/checkouts`. Do not resubmit while the attempt is pending or unknown.

## Function reference

Each row tells you what the call does and when to use it. Partner calls use the API key pair; public catalog and buyer checkout calls do not. Supply a stable `Idempotency-Key` for writes where required.

| Resource | Function | Endpoint | What it does / when to use it |
|---|---|---|---|
| Payments | `payments.create` | `POST /v1/payments` | Creates the parent payment only. Save its ID and reference, then choose a checkout mode. |
| Payments | `payments.privateCheckout` | `POST /v1/payments/{id}/private-checkout` | Submits a selected method from your server for the existing payment. Use when your backend controls the interface. |
| Payments | `payments.publicCheckout` | `POST /v1/payments/{id}/public-checkout` | Creates an opaque token for EDPay-hosted checkout on the existing payment. |
| Payments | `payments.linkCheckout` | `POST /v1/payments/{id}/link-checkout` | Creates a shareable buyer token for the existing payment; it does not create another payment. |
| Payments | `payments.listCheckouts` | `GET /v1/payments/{id}/checkouts` | Lists executions with their checkout mode and sessions where no method was submitted. |
| Payments | `payments.retrieve` | `GET /v1/payments/{id}` | Retrieves remote payment status. |
| Payments | `payments.listEvents` | `GET /v1/payments/{id}/events` | Reads recorded payment status changes. |
| Payments | `payments.list` | `GET /v1/payments` | Lists account payments for reconciliation or history. |
| Hosted checkout | `payments.getCheckout` | `GET /v1/payments/checkouts/{token}` | Loads the buyer-facing hosted or link checkout with its opaque token. |
| Hosted checkout | `payments.submitCheckoutPayment` | `POST /v1/payments/checkouts/{token}/payment` | Submits the buyer-selected method and required method fields with an idempotency key. |
| Hosted checkout | `payments.retrieveCheckoutPayment` | `GET /v1/payments/checkouts/{token}/payment` | Reads the parent payment status without exposing its ID to the buyer. |
| Hosted checkout | `payments.framePolicy` | `GET /v1/payments/checkouts/{token}/frame-policy` | Checks whether the hosted checkout can be embedded. |
| Customers | `customers.create` | `POST /v1/customers` | Creates a customer record for the authenticated account. Save customer details before associating them with payments or invoices. |
| Customers | `customers.list` | `GET /v1/customers` | Lists customers in the current account and environment. Build a customer picker or reconcile customer records. |
| Customers | `customers.retrieve` | `GET /v1/customers/{id}` | Reads one customer record. Load a customer's saved details by ID. |
| Customers | `customers.update` | `PATCH /v1/customers/{id}` | Updates the supplied customer fields. Correct or refresh a customer's details; use a stable idempotency key where required. |
| Invoices | `invoices.create` | `POST /v1/invoices` | Creates a draft invoice with its customer and line items. Prepare an invoice before issuing it to the customer. |
| Invoices | `invoices.list` | `GET /v1/invoices` | Lists invoices, optionally limited to a page size. Show or reconcile invoices for the account. |
| Invoices | `invoices.retrieve` | `GET /v1/invoices/{id}` | Reads one invoice and its current state. Load invoice details or check its lifecycle. |
| Invoices | `invoices.finalize` | `POST /v1/invoices/{id}/finalize` | Issues the draft invoice and makes it available for payment. The invoice is complete and ready to send to the customer. |
| Invoices | `invoices.voidInvoice` | `POST /v1/invoices/{id}/void` | Voids an invoice that should no longer be payable. Cancel an issued invoice according to its allowed state transitions. |
| Invoice series | `subscriptions.create` | `POST /v1/invoices/series` | Creates a schedule that issues invoices on the configured interval. Bill a customer repeatedly using a defined start date, interval, and due period. |
| Invoice series | `subscriptions.list` | `GET /v1/invoices/series` | Lists invoice series; there is no series-detail endpoint in this API version. Review recurring schedules for the account. |
| Invoice series | `subscriptions.pause` | `POST /v1/invoices/series/{id}/pause` | Pauses future invoice generation for a series. Temporarily stop recurring billing without deleting the schedule. |
| Invoice series | `subscriptions.resume` | `POST /v1/invoices/series/{id}/resume` | Resumes invoice generation for a paused series. Restart recurring billing after the pause condition has ended. |
| FX quotes | `fx.quote` | `GET /v1/fx/quote` | Returns an indicative conversion quote for an amount and currency pair. Display a conversion estimate before creating a payment. A quote is not a settlement guarantee. |
| Wallets | `wallets.list` | `GET /v1/wallets` | Lists wallets available to the authenticated account and environment. Choose a wallet before reading its balance or entries. |
| Wallets | `wallets.retrieve` | `GET /v1/wallets/{id}` | Reads one wallet's details. Load the wallet metadata for an account view. |
| Wallets | `wallets.balance` | `GET /v1/wallets/{id}/balance` | Reads the wallet's current balance. Show the available or pending balance for a wallet. |
| Wallets | `wallets.listEntries` | `GET /v1/wallets/{id}/entries` | Lists ledger entries with cursor pagination. Show a transaction statement; pass the returned cursor for the next page. |
| Webhooks | `webhooks.listEndpoints` | `GET /v1/webhooks/endpoints` | Lists configured webhook destinations. Review which event destinations are active. |
| Webhooks | `webhooks.createEndpoint` | `POST /v1/webhooks/endpoints` | Registers an HTTPS receiver and selected event types. The signing secret is shown only at creation. Connect your server to receive payment lifecycle events; store the returned secret securely. |
| Webhooks | `webhooks.updateEndpoint` | `PATCH /v1/webhooks/endpoints/{id}` | Updates a destination's URL or subscribed event types. Change a receiver without creating a second endpoint. |
| Webhooks | `webhooks.disableEndpoint` | `POST /v1/webhooks/endpoints/{id}/disable` | Stops future deliveries to an endpoint while retaining its record. Temporarily stop a destination while investigating or migrating it. |
| Webhooks | `webhooks.deleteEndpoint` | `DELETE /v1/webhooks/endpoints/{id}` | Removes a webhook endpoint. Permanently remove a destination that is no longer used. |
| Webhooks | `webhooks.listDeliveries` | `GET /v1/webhooks/deliveries` | Lists delivery attempts and their summary states. Monitor failed, pending, or completed event deliveries. |
| Webhooks | `webhooks.retrieveDelivery` | `GET /v1/webhooks/deliveries/{id}` | Reads one delivery's status and attempt metadata. Inspect one delivery before deciding whether to retry it. |
| Webhooks | `webhooks.retryDelivery` | `POST /v1/webhooks/deliveries/{id}/retry` | Queues a retry for an eligible failed delivery. Retry after fixing the receiver; the endpoint must be active. |
| Public catalog and optional support chat | `public.listPaymentMethods` | `GET /v1/public/payment-methods` | Returns active payment methods and their public requirements without partner keys. Build a method selector and validate the selected method's required fields. |
| Browser checkout (JavaScript SDK) | `EDPay.checkout` | `Browser helper` | Chooses redirect, modal, or embedded checkout from the supplied mode and container options. Start checkout in the buyer's browser with a short-lived token created by your server; use a public key only. |
| Browser checkout (JavaScript SDK) | `EDPay.redirectToCheckout` | `Browser helper` | Navigates the browser to the hosted payment page. Use the simplest checkout integration when leaving your site is acceptable. |
| Browser checkout (JavaScript SDK) | `EDPay.openModal` | `Browser helper` | Opens checkout in a modal iframe and returns a close function. Keep the buyer on the current page while showing hosted checkout. |
| Browser checkout (JavaScript SDK) | `EDPay.mount` | `Browser helper` | Mounts checkout in a supplied element and returns an unmount function. Place checkout inline inside a page layout and clean it up when the component closes. |
| Contact helpers | `normalizePhoneNumber` | `Local helper` | Removes display punctuation and returns the phone value in the configured national or international form. Prepare a phone value before validating or sending it to a method that requires one. |
| Contact helpers | `formatPhoneNumber` | `Local helper` | Formats a valid phone number for display; it does not change the API payload automatically. Show a readable phone number in a form or confirmation screen. |
| Contact helpers | `addCountryPrefix` | `Local helper` | Adds the configured country calling code to a national number. An integration needs the international form, such as 258 plus national digits. |
| Contact helpers | `removeCountryPrefix` | `Local helper` | Removes the configured country calling code and returns national digits. A selected method expects the national number without a country code. |
| Contact helpers | `validatePhoneNumber` | `Local helper` | Checks length, allowed characters, country code, and configured prefixes; returns true or false. Reject invalid input before calling the API. It does not replace server-side validation. |
| Contact helpers | `phoneNumberOptionsForMethod` | `Local helper` | Returns known contact rules for the selected method, or null when no preset exists. Load rules before validating a phone; configure rules from the live catalog for other phone methods. |
| Webhook signature verification | `verifyWebhookSignature` | `Local helper` | Checks the Payment-Signature HMAC and timestamp against the unmodified request body. Verify the signature before parsing or acting on an incoming webhook. Use the raw bytes and keep the secret server-side. |
| Client utilities | `client.request` | `Raw API request` | Sends a request to an API path without a dedicated resource wrapper. The optional authenticated argument controls whether partner key headers are sent. Use only for a supported endpoint that has no SDK method; keep private keys on the server and apply the endpoint's scope and idempotency rules. |

Responses are parsed JSON objects. API errors throw `EDPayError` with `statusCode` and `responseData`. Browser checkout uses the separate `@edutecka-mz/edpay-sdk/frontend` entry point and must receive a short-lived token created by your server.
## Verify webhook signatures

Use the raw request body and the `Payment-Signature` header before parsing or processing an event. EDPay signs `timestamp + "." + rawBody`; the verifier also enforces a five-minute timestamp window by default. For example, in a Next.js route handler:

```typescript
import { verifyWebhookSignature } from "@edutecka-mz/edpay-sdk";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("payment-signature") ?? "";
  const secret = process.env.EDPAY_WEBHOOK_SECRET!;

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody) as import("@edutecka-mz/edpay-sdk").EDPayWebhookEvent;
  if (event.type === "payment.succeeded") {
    const orderReference = event.data.reference;
    // Match the order idempotently by its merchant reference.
  }

  return Response.json({ received: true });
}
```

`EDPayWebhookEvent` and `EDPayWebhookPaymentData` describe the verified event envelope and sanitized payment fields. Match orders by `data.reference`; link-checkout details are not needed for correlation. Reconciliation status/code and fee/net breakdown fields are optional because they are not present in every event. The verifier returns a boolean, so parse/cast only after signature verification.

The public support-chat route streams server-sent events and is not exposed by this release's JSON request helpers.

## Official documentation

- [SDK installation and integration guide](https://docs-pay.edutecka.com/sdks/)
- [Payments API reference](https://docs-pay.edutecka.com/api/payments/)
- [Authentication and API keys](https://docs-pay.edutecka.com/guides/authentication/)
- [Webhooks](https://docs-pay.edutecka.com/api/webhooks/)

## Other official SDK repositories

- [PHP SDK](https://github.com/edutecka/edpay-php-sdk)
- [Python SDK](https://github.com/edutecka/edpay-python-sdk)
- [Java SDK](https://github.com/edutecka/edpay-java-sdk)
- [.NET SDK](https://github.com/edutecka/edpay-dot-net-sdk)

## Official plugin repositories

- [WooCommerce (WordPress)](https://github.com/edutecka/edpay-woocommerce-plugin)
- [Shopify](https://github.com/edutecka/edpay-shopify-app)
- [Magento / Adobe Commerce](https://github.com/edutecka/edpay-magento2-module) — integration preview; not production-ready
- [PrestaShop](https://github.com/edutecka/edpay-prestashop-module)
- [OpenCart](https://github.com/edutecka/edpay-opencart-extension)
- [WHMCS](https://github.com/edutecka/edpay-whmcs-gateway)

## License

MIT. See [LICENSE](LICENSE).
