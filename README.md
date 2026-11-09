# EDPay JavaScript / TypeScript SDK

The official JavaScript and TypeScript SDK for server-side Node.js applications. It can also be used in browser code through its frontend helpers, but **never expose a private API key in a browser or other untrusted environment**.

## Requirements

- Node.js 20 or later
- npm, pnpm, or yarn

## Install

Install the package from npm:

```bash
npm install @edutecka-mz/edpay-sdk
```

The package import name is `@edutecka-mz/edpay-sdk`.

## Create a payment from a Node.js service

Store the keys in the server environment, not in source control:

```dotenv
EDPAY_PUBLIC_KEY=pk_test_...
EDPAY_PRIVATE_KEY=sk_test_...
EDPAY_METHOD=method_id_from_payment_methods
```

```typescript
import { EDPayClient } from "@edutecka-mz/edpay-sdk";

const edpay = new EDPayClient({
  publicKey: process.env.EDPAY_PUBLIC_KEY!,
  privateKey: process.env.EDPAY_PRIVATE_KEY!,
  environment: "sandbox",
});

const payment = await edpay.payments.create({
  amount_minor: 50000, // 500.00 MZN
  currency: "MZN",
  method: process.env.EDPAY_METHOD, // Select an ID supported by the account/API.
  reference: "ORDER-10492",
  description: "Example order",
  idempotencyKey: "ORDER-10492",
});

console.log(payment);
```

By default, the client uses `https://api-pay.edutecka.com`; set `baseUrl` only when EDPay provides a different API host for your account. Sandbox or production access is determined by the API keys. The client sends `X-EDPay-Public-Key` and `X-EDPay-Private-Key` headers. `idempotencyKey` is sent as the `Idempotency-Key` header. Payment amounts are expressed in minor currency units. The `method` is dynamic and should be an identifier returned by `GET /v1/public/payment-methods` or otherwise supported for the account; do not hard-code a particular gateway into a multi-gateway flow.

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

Create the session on your server, then send the customer to the hosted checkout URL returned by the API:

```typescript
const session = await edpay.checkout.createSession({
  amount_minor: 50000,
  currency: "MZN",
  success_url: "https://merchant.example/checkout/success",
  cancel_url: "https://merchant.example/checkout/cancel",
  reference: "ORDER-10492",
  idempotencyKey: "ORDER-10492-checkout",
});

console.log(session);
```

The SDK sends this request to `POST /v1/checkout/sessions`. Confirm payment using a verified webhook or a server-side payment lookup; a browser redirect alone is not proof of payment.

## Available operations

- Payments: `create`, `retrieve`, `cancel`
- Checkout sessions: `createSession`, `retrieveSession`, `expireSession`
- Payment links: `create`, `retrieve`, `revoke`
- Customers: `create`, `retrieve`, `update`
- Invoices: `create`, `list`, `retrieve`, `finalize`, `voidInvoice`
- Subscriptions: `create`, `list`, `retrieve`, `pause`, `resume`, `cancel`
- Webhooks: `verifyWebhookSignature`

Payment, invoice, customer, and subscription methods return parsed JSON responses. Failed API requests throw `EDPayError`, which exposes `statusCode` and `responseData` for application-level handling.

## Verify webhook signatures

Use the raw request body and the `X-EDPay-Signature` header before parsing or processing an event. For example, in a Next.js route handler:

```typescript
import { verifyWebhookSignature } from "@edutecka-mz/edpay-sdk";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-edpay-signature") ?? "";
  const secret = process.env.EDPAY_WEBHOOK_SECRET!;

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody);
  if (event.type === "payment.succeeded") {
    // Update the matching order idempotently using event.data.
  }

  return Response.json({ received: true });
}
```

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
