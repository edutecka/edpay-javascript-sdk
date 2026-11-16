# EDPay JavaScript / TypeScript SDK

The official JavaScript and TypeScript SDK for server-side Node.js applications. It can also be used in browser code through its frontend helpers, but **never expose a private API key in a browser or other untrusted environment**.

## Requirements

- Node.js 22.23.5 or later in the 22.x line, 24.22.3 or later in the 24.x line, or 26.13.1 or later in the 26.x line.
- npm, pnpm, or yarn

## Install

Install the package from npm:

```bash
npm install @edutecka-mz/edpay-sdk
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
EDPAY_METHOD=method_id_from_payment_methods
```

```typescript
import { EDPayClient } from "@edutecka-mz/edpay-sdk";
import { normalizePhoneNumber, phoneNumberOptionsForMethod } from "@edutecka-mz/edpay-sdk";

const edpay = new EDPayClient({
  publicKey: process.env.EDPAY_PUBLIC_KEY!,
  privateKey: process.env.EDPAY_PRIVATE_KEY!,
  environment: "sandbox",
});

const method = process.env.EDPAY_METHOD!;
const phoneRules = phoneNumberOptionsForMethod(method);
const phone = phoneRules
  ? normalizePhoneNumber(process.env.CUSTOMER_PHONE ?? "", phoneRules)
  : undefined; // Use the selected method's channel/token fields when no phone preset applies.

const payment = await edpay.payments.create({
  amount_minor: 50000, // 500.00 MZN
  currency: "MZN",
  method, // Select an ID supported by the account/API.
  ...(phone ? { phone } : {}),
  reference: "ORDER-10492",
  description: "Example order",
  idempotencyKey: "ORDER-10492-CREATE-1",
});

console.log(payment);
```

By default, the client uses `https://api-pay.edutecka.com`; set `baseUrl` only when EDPay provides a different API host for your account. Sandbox or production access is determined by the API keys. Partner requests send `X-EDPay-Public-Key` and `X-EDPay-Private-Key`; the public catalog and token-based checkout routes omit them. `idempotencyKey` is sent as the `Idempotency-Key` header. Payment amounts are expressed in minor currency units. The `method` is dynamic and may be omitted only when the API's default method applies; otherwise use an identifier returned by `GET /v1/public/payment-methods` or supported for the account. `phone` is optional for methods that do not need one; tokenized methods pass their instrument through `channel`.

### Browser checkout (frontend only)

`EDPay` is the browser checkout helper. It is separate from the server-side `EDPayClient` instance named `edpay` above. Use a public key only; never bundle a private key into browser code. Pass the checkout token created by your server:

```typescript
import { EDPay } from "@edutecka-mz/edpay-sdk/frontend";

const checkoutToken = "<TOKEN_RETURNED_BY_YOUR_SERVER>";
const checkoutClient = new EDPay({
  publicKey: process.env.NEXT_PUBLIC_EDPAY_PUBLIC_KEY!,
  environment: "sandbox",
});

checkoutClient.checkout({ token: checkoutToken, mode: "redirect" });
```

To retrieve a payment:

Use the server-side `edpay` (`EDPayClient`) instance created in the first example:

```typescript
const payment = await edpay.payments.retrieve("PAYMENT_ID");
```

## Create a hosted checkout session

Create a session on your server. The API returns a short-lived token; pass it to the browser checkout module or construct the hosted `/pay` URL using the public key:

```typescript
const session = await edpay.checkout.createSession({
  payment_link_id: process.env.EDPAY_PAYMENT_LINK_ID!,
  idempotencyKey: "ORDER-10492-CHECKOUT-1",
});

console.log(session);
```

The SDK sends this request to `POST /v1/checkout/sessions`. The session response contains `data.token` and `data.expires_at`; the token is intended for the browser checkout. Confirm payment using a verified webhook or a server-side payment lookup; a browser redirect alone is not proof of payment.

## Continue the same payment with another method

The payment ID and reference identify one payment. Present active gateways as choices; each selected method is a child attempt, with only one attempt in progress at a time. Do not create another payment when the buyer changes method. Create the next attempt only after the current one is definitively failed. If it is still processing or its result is unknown, retrieve it later and wait for reconciliation to avoid charging twice. Use a new idempotency key for each child attempt.

```typescript
const paymentId = payment.data.id; // save this ID with your order
const current = await edpay.payments.retrieve(paymentId);

if (current.data.status === "failed") {
  await edpay.payments.createAttempt(paymentId, {
    method: selectedMethod, // active code from GET /v1/public/payment-methods
    phone: normalizedPhone,
    idempotencyKey: "ORDER-10492-ATTEMPT-2",
  });
}
```

For a payment started through a hosted session or payment link, use the matching `checkout.createSessionPaymentAttempt` or `checkout.createPaymentLinkPaymentAttempt` with that same payment ID and its session token/link ID. The current public checkout form accepts phone-based methods; use the partner payment resource for tokenized instruments.

## Function reference

Each row tells you what the call does and when to use it. Partner calls use the API key pair; public catalog and buyer checkout calls do not. Supply a stable `Idempotency-Key` for writes where required.

| Resource | Function | Endpoint | What it does / when to use it |
|---|---|---|---|
| Payments | `payments.create` | `POST /v1/payments` | Creates the parent payment and its first method attempt. Start a server-to-server payment; keep its ID and reference for later method attempts and status checks. |
| Payments | `payments.createCheckout` | `POST /v1/payment-checkout` | Legacy alias for creating a payment; it does not create a hosted checkout session. Use only when migrating an integration that already calls this route. New code should use create. |
| Payments | `payments.list` | `GET /v1/payments` | Lists payments visible to the current API credentials and environment. Reconcile or show a payment history. Use the limit argument where available. |
| Payments | `payments.retrieve` | `GET /v1/payments/{id}` | Returns one payment and its current status. Check the result on your server after a redirect or webhook. |
| Payments | `payments.listEvents` | `GET /v1/payments/{id}/events` | Returns the recorded status changes for a payment. Inspect the payment lifecycle or troubleshoot a status change. |
| Payments | `payments.listAttempts` | `GET /v1/payments/{id}/attempts` | Lists the payment's provider attempts; this method is read-only. See which method was tried and the outcome of each attempt. |
| Payments | `payments.createAttempt` | `POST /v1/payments/{id}/attempts` | Adds another dynamic method as a child attempt. The payment ID, amount and reference stay the same; this attempt uses its own Idempotency-Key. Use after the latest attempt definitively failed. If it is processing or unknown, retrieve the payment and wait for reconciliation to avoid a duplicate charge. A payment supports up to 20 attempts. |
| Hosted checkout | `checkout.createSession` | `POST /v1/checkout/sessions` | Creates a short-lived checkout session from a payment link. Returns a token for the browser. Send a buyer to EDPay-hosted checkout or embed it on the exact HTTPS origin. |
| Hosted checkout | `checkout.retrieveSession` | `GET /v1/checkout/sessions/{token}` | Reads public session and checkout details. Pass the token returned by createSession. Load the hosted checkout page using its browser token. |
| Hosted checkout | `checkout.getPaymentLink` | `GET /v1/checkout/payment-links/{id}` | Reads the public details for an active payment link. Render the buyer-facing link checkout before a payment is submitted. |
| Hosted checkout | `checkout.getFramePolicy` | `GET /v1/checkout/sessions/{token}/frame-policy` | Reads whether the session can be embedded and its frame policy. Check embed eligibility before placing checkout in an iframe. |
| Hosted checkout | `checkout.createSessionPayment` | `POST /v1/checkout/sessions/{token}/payments` | Submits a selected phone-based method and buyer data to a public session; tokenized methods are not accepted by the current hosted form. Requires an idempotency key. Start payment from a hosted checkout form. The response means accepted for processing, not paid. |
| Hosted checkout | `checkout.createSessionPaymentAttempt` | `POST /v1/checkout/sessions/{token}/payments/{payment_id}/attempts` | Adds another phone-based method to the payment already created from this session. It keeps the same payment ID and reference; hosted checkout currently does not accept tokenized instruments. Use the same session token and payment ID after the previous attempt definitively failed. Wait when the result is processing or unknown. |
| Hosted checkout | `checkout.retrieveSessionPayment` | `GET /v1/checkout/sessions/{token}/payments/{payment_id}` | Reads the status of a payment created from that session. Show a buyer the latest processing result; verify settlement server-side too. |
| Hosted checkout | `checkout.createPaymentLinkPayment` | `POST /v1/checkout/payment-links/{id}/payments` | Submits a selected phone-based method and buyer data from a public link; tokenized methods are not accepted by the current hosted form. Requires an idempotency key. Start a buyer payment directly from a payment-link page. |
| Hosted checkout | `checkout.createPaymentLinkPaymentAttempt` | `POST /v1/checkout/payment-links/{id}/payments/{payment_id}/attempts` | Adds another phone-based method to the payment already created from this link. It keeps the same payment ID and reference; hosted checkout currently does not accept tokenized instruments. Reuse the same link ID and payment ID after the previous attempt definitively failed. Wait when the result is processing or unknown. |
| Hosted checkout | `checkout.retrievePaymentLinkPayment` | `GET /v1/checkout/payment-links/{id}/payments/{payment_id}` | Reads the status of a payment submitted through a public link. Refresh the buyer-facing result for a link payment. |
| Payment links | `paymentLinks.create` | `POST /v1/payment-links` | Creates a fixed-amount public link. Creating the link does not itself create a payment. Collect payment for a fixed amount through a shareable buyer URL. |
| Payment links | `paymentLinks.list` | `GET /v1/payment-links` | Lists links owned by the authenticated account and environment. Show or reconcile the account's payment links. |
| Payment links | `paymentLinks.retrieve` | `GET /v1/payment-links/{id}` | Reads one link and its status. Check expiry, amount, or whether the link is still active. |
| Payment links | `paymentLinks.deactivate` | `POST /v1/payment-links/{id}/deactivate` | Stops an active link from starting future checkout payments. Close a link that should no longer accept buyer payments. |
| Payment links | `paymentLinks.createCheckoutSession` | `POST /v1/checkout/sessions` | Convenience wrapper that creates a hosted session for the supplied link. Use it instead of calling checkout.createSession when your SDK provides this wrapper. |
| Customers | `customers.create` | `POST /v1/customers` | Creates a customer record for the authenticated account. Save customer details before associating them with payments or invoices. |
| Customers | `customers.list` | `GET /v1/customers` | Lists customers in the current account and environment. Build a customer picker or reconcile customer records. |
| Customers | `customers.retrieve` | `GET /v1/customers/{id}` | Reads one customer record. Load a customer's saved details by ID. |
| Customers | `customers.update` | `PATCH /v1/customers/{id}` | Updates the supplied customer fields. Correct or refresh a customer's details; use a stable idempotency key where required. |
| Invoices | `invoices.create` | `POST /v1/invoices` | Creates a draft invoice with its customer and line items. Prepare an invoice before issuing it to the customer. |
| Invoices | `invoices.list` | `GET /v1/invoices` | Lists invoices, optionally limited to a page size. Show or reconcile invoices for the account. |
| Invoices | `invoices.retrieve` | `GET /v1/invoices/{id}` | Reads one invoice and its current state. Load invoice details or check its lifecycle. |
| Invoices | `invoices.finalize` | `POST /v1/invoices/{id}/finalize` | Issues the draft invoice and makes it available for payment. The invoice is complete and ready to send to the customer. |
| Invoices | `invoices.voidInvoice` | `POST /v1/invoices/{id}/void` | Voids an invoice that should no longer be payable. Cancel an issued invoice according to its allowed state transitions. |
| Invoice series | `subscriptions.create` | `POST /v1/invoice-series` | Creates a schedule that issues invoices on the configured interval. Bill a customer repeatedly using a defined start date, interval, and due period. |
| Invoice series | `subscriptions.list` | `GET /v1/invoice-series` | Lists invoice series; there is no series-detail endpoint in this API version. Review recurring schedules for the account. |
| Invoice series | `subscriptions.pause` | `POST /v1/invoice-series/{id}/pause` | Pauses future invoice generation for a series. Temporarily stop recurring billing without deleting the schedule. |
| Invoice series | `subscriptions.resume` | `POST /v1/invoice-series/{id}/resume` | Resumes invoice generation for a paused series. Restart recurring billing after the pause condition has ended. |
| FX quotes | `fx.quote` | `GET /v1/fx/quote` | Returns an indicative conversion quote for an amount and currency pair. Display a conversion estimate before creating a payment. A quote is not a settlement guarantee. |
| Wallets | `wallets.list` | `GET /v1/wallets` | Lists wallets available to the authenticated account and environment. Choose a wallet before reading its balance or entries. |
| Wallets | `wallets.retrieve` | `GET /v1/wallets/{id}` | Reads one wallet's details. Load the wallet metadata for an account view. |
| Wallets | `wallets.balance` | `GET /v1/wallets/{id}/balance` | Reads the wallet's current balance. Show the available or pending balance for a wallet. |
| Wallets | `wallets.listEntries` | `GET /v1/wallets/{id}/entries` | Lists ledger entries with cursor pagination. Show a transaction statement; pass the returned cursor for the next page. |
| Webhooks | `webhooks.listEndpoints` | `GET /v1/webhook-endpoints` | Lists configured webhook destinations. Review which event destinations are active. |
| Webhooks | `webhooks.createEndpoint` | `POST /v1/webhook-endpoints` | Registers an HTTPS receiver and selected event types. The signing secret is shown only at creation. Connect your server to receive payment lifecycle events; store the returned secret securely. |
| Webhooks | `webhooks.updateEndpoint` | `PATCH /v1/webhook-endpoints/{id}` | Updates a destination's URL or subscribed event types. Change a receiver without creating a second endpoint. |
| Webhooks | `webhooks.disableEndpoint` | `POST /v1/webhook-endpoints/{id}/disable` | Stops future deliveries to an endpoint while retaining its record. Temporarily stop a destination while investigating or migrating it. |
| Webhooks | `webhooks.deleteEndpoint` | `DELETE /v1/webhook-endpoints/{id}` | Removes a webhook endpoint. Permanently remove a destination that is no longer used. |
| Webhooks | `webhooks.listDeliveries` | `GET /v1/webhook-deliveries` | Lists delivery attempts and their summary states. Monitor failed, pending, or completed event deliveries. |
| Webhooks | `webhooks.retrieveDelivery` | `GET /v1/webhook-deliveries/{id}` | Reads one delivery's status and attempt metadata. Inspect one delivery before deciding whether to retry it. |
| Webhooks | `webhooks.retryDelivery` | `POST /v1/webhook-deliveries/{id}/retry` | Queues a retry for an eligible failed delivery. Retry after fixing the receiver; the endpoint must be active. |
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
    const paymentLinkId = event.data.payment_link_id; // string | null
    // Update the matching order idempotently using event.data.
  }

  return Response.json({ received: true });
}
```

`EDPayWebhookEvent` and `EDPayWebhookPaymentData` describe the verified event envelope and sanitized payment fields. `data.payment_link_id` is nullable; reconciliation status/code and fee/net breakdown fields are optional because they are not present in every event. The verifier returns a boolean, so parse/cast only after signature verification.

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
