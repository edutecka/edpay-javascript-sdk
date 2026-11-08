# Roadmap & Plano de Arquitetura - EDPay JavaScript & TypeScript SDK

## Objectivos
1. Desenvolver um cliente universal TypeScript com tipagem estrita e compatibilidade ESM + CommonJS.
2. Zero dependências pesadas em tempo de execução (utilização da API nativa `fetch` do Node.js >= 18).
3. Utilitários prontos para Next.js, Express, Fastify e NestJS.

---

## Fases de Desenvolvimento

### Fase 1: Arquitetura Core & Autenticação (Concluído)
- [x] Headers oficiais: `X-EDPay-Public-Key` e `X-EDPay-Private-Key`.
- [x] Suporte a idempotência via `Idempotency-Key`.
- [x] Alternância automática entre `sandbox` (`https://sandbox-api.edpay.co.mz`) e `production` (`https://api.edpay.co.mz`).
- [x] Utilitário criptográfico `verifyWebhookSignature` com `crypto.timingSafeEqual` (HMAC SHA-256).

### Fase 2: Módulos de Recursos da API (Concluído)
- [x] `PaymentsResource`: `create`, `retrieve`, `cancel`.
- [x] `CheckoutResource`: `createSession`, `retrieveSession`, `expireSession`.
- [x] `PaymentLinksResource`: `create`, `retrieve`, `revoke`.
- [x] `CustomersResource`: `create`, `retrieve`, `update`.

### Fase 3: Framework Helpers & Middlewares (Em Planeamento)
- [ ] Express middleware para verificação de webhook `edpayWebhookMiddleware()`.
- [ ] Next.js Edge / Node route helper `createWebhookHandler()`.

### Fase 4: Distribuição & CI/CD
- [ ] Pipeline no GitHub Actions para compilação e publicação no npm (`@edpay/sdk`).
- [ ] Testes de integração automatizados.
