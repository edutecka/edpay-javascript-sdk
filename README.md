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

## Available operations

- Payments: `create`, `createCheckout`, `list`, `retrieve`, `listEvents`, `listAttempts`
- Checkout: create and retrieve sessions, read frame policy, create and retrieve session or payment-link payments
- Payment links: `create`, `list`, `retrieve`, `deactivate`, `createCheckoutSession`
- Customers: `create`, `list`, `retrieve`, `update`
- Invoices: `create`, `list`, `retrieve`, `finalize`, `voidInvoice`
- Invoice series (`subscriptions`): `create`, `list`, `pause`, `resume`
- FX: `quote`
- Wallets: `list`, `retrieve`, `balance`, `listEntries`
- Webhook endpoints and deliveries: create, list, update, disable, delete, retrieve, and retry
- Public catalog: `listPaymentMethods`
- Webhook signature verification: `verifyWebhookSignature`

`createCheckout` is a legacy alias for creating a payment intent through `POST /v1/payment-checkout`; it does not create a hosted session. Hosted checkout uses payment-link creation followed by `checkout.createSession`.

Payment, invoice, customer, and subscription methods return parsed JSON responses. Failed API requests throw `EDPayError`, which exposes `statusCode` and `responseData` for application-level handling.

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
