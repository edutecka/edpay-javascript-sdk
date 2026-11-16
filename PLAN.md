# Roadmap & Architecture Plan - EDPay JavaScript & TypeScript SDK

## Objectives
1. Develop a universal TypeScript client with strict typing and ESM + CommonJS compatibility.
2. Zero heavy runtime dependencies (using the native Node.js `fetch` API, version >= 18).
3. Ready-to-use utilities for Next.js, Express, Fastify, and NestJS.

---

## Development Phases

### Phase 1: Core Architecture & Authentication (Completed)
- [x] Official headers: `X-EDPay-Public-Key` and `X-EDPay-Private-Key`.
- [x] Idempotency support via `Idempotency-Key`.
- [x] Automatic switching between `sandbox` (`https://sandbox-api.edpay.co.mz`) and `production` (`https://api.edpay.co.mz`).
- [x] `verifyWebhookSignature` cryptographic utility using `crypto.timingSafeEqual` (HMAC SHA-256).

### Phase 2: API Resource Modules (Completed)
- [x] `PaymentsResource`: `create`, `retrieve`, `cancel`.
- [x] `CheckoutResource`: `createSession`, `retrieveSession`, `expireSession`.
- [x] `PaymentLinksResource`: `create`, `retrieve`, `revoke`.
- [x] `CustomersResource`: `create`, `retrieve`, `update`.

### Phase 3: Framework Helpers & Middleware (Planned)
- [ ] Express middleware for webhook verification: `edpayWebhookMiddleware()`.
- [ ] Next.js Edge / Node route helper: `createWebhookHandler()`.

### Phase 4: Distribution & CI/CD
- [ ] GitHub Actions pipeline for building and publishing to npm (`@edutecka-mz/edpay-sdk`).
- [ ] Automated integration tests.
