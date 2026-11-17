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
- [x] Use the single API host; test or live access is selected by the matching API key prefixes.
- [x] `verifyWebhookSignature` cryptographic utility using `crypto.timingSafeEqual` (HMAC SHA-256).

### Phase 2: API Resource Modules (Completed)
- [x] `PaymentsResource`: create and retrieve payment records.
- [x] Checkout operations are child methods of `payments`: `privateCheckout`, `publicCheckout`, `linkCheckout`, and token-based buyer operations.
- [x] Link checkout is created for an existing payment with `payments.linkCheckout(paymentId, ...)`.
- [x] `CustomersResource`: `create`, `retrieve`, `update`.

### Phase 3: Framework Helpers & Middleware (Planned)
- [ ] Express middleware for webhook verification: `edpayWebhookMiddleware()`.
- [ ] Next.js Edge / Node route helper: `createWebhookHandler()`.

### Phase 4: Distribution & CI/CD
- [ ] GitHub Actions pipeline for building and publishing to npm (`@edutecka-mz/edpay-sdk`).
- [ ] Automated integration tests.
