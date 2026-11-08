# @edpay/sdk - SDK Oficial EDPay para JavaScript & TypeScript

Biblioteca cliente oficial para integração server-to-server com a plataforma EDPay em ambientes Node.js, Next.js, Express, Fastify e NestJS.

---

## Instalação

```bash
npm install @edpay/sdk
# ou
pnpm add @edpay/sdk
# ou
yarn add @edpay/sdk
```

---

## Inicialização

```typescript
import { EDPayClient } from "@edpay/sdk";

const edpay = new EDPayClient({
  publicKey: process.env.EDPAY_PUBLIC_KEY!,   // pk_live_... ou pk_test_...
  privateKey: process.env.EDPAY_PRIVATE_KEY!, // sk_live_... ou sk_test_...
  environment: "production", // ou "sandbox"
});
```

---

## Exemplos de Uso

### 1. Criar Pagamento Direto (API Checkout)

```typescript
const payment = await edpay.payments.create({
  amount_minor: 50000,           // 500.00 MZN
  currency: "MZN",
  method: "emola",               // ou "mpesa", "card", "apple_pay", etc.
  phone: "+25884xxxxxxx",        // obrigatório para carteiras móveis
  reference: "FAT-2026-001",
  description: "Subscrição Mensal",
  emola_custom_message: "Pagamento de Serviços via EDPay",
});

console.log("ID da transação:", payment.id);
console.log("Estado:", payment.status);
```

### 2. Criar Sessão de Checkout Alojado

```typescript
const session = await edpay.checkout.createSession({
  amount_minor: 150000,
  currency: "MZN",
  success_url: "https://minhaloja.co.mz/sucesso?session_id={CHECKOUT_SESSION_ID}",
  cancel_url: "https://minhaloja.co.mz/cancelado",
  reference: "ENC-9982",
});

console.log("Redirecionar cliente para:", session.checkout_url);
```

### 3. Verificar Assinatura de Webhook

```typescript
import { verifyWebhookSignature } from "@edpay/sdk";

// No handler do Next.js App Router (src/app/api/webhooks/edpay/route.ts)
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-edpay-signature") || "";
  const webhookSecret = process.env.EDPAY_WEBHOOK_SECRET!;

  const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody);
  if (event.event === "payment.succeeded") {
    // Processar aprovação de encomenda
  }

  return Response.json({ received: true });
}
```

---

## Prazos e Condições Comerciais

- **Tarifa Unificada**: 6,00% em Meticais (MZN) sem custos de manutenção.
- **Liquidação Bancária**: Transferência automática no prazo de 2 a 7 dias úteis.

---

## Licença

MIT © [EDPay](https://edpay.co.mz)
