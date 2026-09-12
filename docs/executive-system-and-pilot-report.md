# Global Payment Operating System (GYB)
## Executive Engineering & Product Architecture Report
**Prepared For:** Head of Engineering (CTO) & Head of Product / Principal Product Designer  
**Date:** August 2026  
**Status:** Milestones 1–27 Complete | Pilot Readiness Assessment  

---

## 1. Executive Summary

The **GYB Payment Operating System** has reached a major transition point. Over 27 developmental milestones, the system has evolved from a modular ledger and smart routing platform into a full-stack, enterprise-grade remittance rail connecting the **UK (GBP) and India (INR)** corridors.

```
                    ┌─────────────────────────────────────────┐
                    │       GYB Full-Stack Architecture       │
                    └────────────────────┬────────────────────┘
                                         │
               ┌─────────────────────────┴─────────────────────────┐
               ▼                                                   ▼
     [Remittance Web App]                                [Operations Console]
     Port 3000 | Customer UI                             Port 3001 | Ops / GRC UI
               │                                                   │
               └─────────────────────────┬─────────────────────────┘
                                         ▼
                               [Express API Gateway]
                              Port 4000 | REST API
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
 ┌───────────────┐                                                ┌───────────────┐
 │   Fiat Rail   │ (Modulr + Currencycloud + Cashfree)            │  Crypto Rail  │ (USDC on Solana)
 └───────┬───────┘                                                └───────┬───────┘
         │                                                                │
         └───────────────────────────────┬────────────────────────────────┘
                                         ▼
                 [Core Payment Engine · Double-Entry Ledger (MS8)]
                 [Smart Routing (MS5) · Compliance & AI Copilot (MS11-12)]
                 [17 Production Readiness Gates · Fail-Closed Safety (MS25-26)]
```

### Current Status
- **Core Software Completeness:** 100% of domain engines, double-entry ledgers, smart routing, compliance engines, real-world provider connectors, and customer/operations frontends are implemented and tested.
- **Current Operational Mode:** **SANDBOX / EMULATION**. The system strictly enforces a *fail-closed* policy (`REAL_MONEY_ENABLED=false` or `PILOT`) to prevent uncollateralized or unauthorized financial transactions.
- **Immediate Objective:** Launch a **cost-minimized, rapid real-money pilot** (UK 🇬🇧 → India 🇮🇳) bypassing heavy bank regulatory bottlenecks by leveraging the **USDC-on-Solana** blockchain rail while preparing for institutional fiat connectivity.

---

## 2. Comprehensive Implementation Overview (What is Built)

The repository represents over **820 packages**, 1,200+ TypeScript modules, and 17 database schemas adhering to Clean Architecture, Domain-Driven Design (DDD), Event Sourcing, and CQRS.

### A. Core Banking & Ledger Subsystems (Milestones 1–10)
1. **Immutable Double-Entry Ledger (MS7/MS8):** Complete multi-currency ledger with balance verification, transaction integrity, idempotency keys, and zero-sum journal entries.
2. **Smart Routing & Netting Engine (MS3/MS5):** Lowest-cost path evaluation, multi-rail routing, and bilateral netting to minimize liquidity requirements.
3. **Settlement Orchestrator & Sagas (MS6):** Distributed state machines managing funding, conversion, clearing, and payout with compensation/rollback capabilities.
4. **PostgreSQL Persistence & Distributed Event Bus (MS9/MS10):** Raw SQL persistence, outbox pattern, and pub/sub event messaging.

### B. Compliance, Risk & AI Intelligence (Milestones 11–12, 24)
1. **Sanctions & PEP Screening:** Real-time screening against OFAC, UK HMT, and international watchlists.
2. **AML & Fraud Detection:** Rule engines and AI behavioral scoring to detect suspicious volume anomalies, structuring, and mule accounts.
3. **Enterprise GRC & Audit Readiness:** Continuous compliance monitoring, evidence collection, and automated audit trails.

### C. Financial Connectivity Layer (Milestone 26)
Abstracted via the `FinancialInstitutionConnector` interface with three operational environments (`SANDBOX`, `CERTIFICATION`, `PRODUCTION`):

| Connector | Target Rail | Provider Implementation | Capabilities |
|---|---|---|---|
| **GBP Collection** | UK Faster Payments / Direct Debit | `ModulrFundingConnector` | Virtual accounts, inbound notification, automated reconciliation |
| **INR Settlement** | IMPS / NEFT / UPI | `CashfreeSettlementConnector` | Bank account validation, instant payout dispatch, status polling |
| **FX Conversion** | GBP/INR Real-Time Exchange | `CurrencycloudFXProvider` | Live FX quote streaming, rate locking, conversion execution |
| **KYC / Identity** | Global ID & Biometrics | `OnfidoKycProvider` | Document verification, facial similarity, SDK token generation |

### D. Blockchain & Stablecoin Settlement Rail (Milestones 2, 25)
1. **Solana Native Integration (`SolanaProvider`):** Direct RPC communication with Solana Devnet/Mainnet using `@solana/web3.js` and `@solana/spl-token`.
2. **Token Registry (`TokenRegistry`):** Pre-configured mints for **USDC** (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`) and **EURC**.
3. **Cryptographic Signing (`BlockchainSettlementAdapter`):** Keypair signing from environment/vault for non-custodial and custodial treasury transfers with ~400ms settlement times and ~$0.0002 network fees.

### E. Frontend Applications & API Gateway (Milestone 27)
1. **Customer Remittance Web App (`apps/remittance-web` - Port 3000):**
   - Modern Vite/React single-page application with responsive UI.
   - Live FX calculator (GBP → INR), beneficiary management with IFSC/account validation.
   - Multi-step remittance flow with real-time lifecycle tracking (Funding → Compliance → Rail Settlement → Beneficiary Credit).
2. **Operations Console (`apps/operations-console` - Port 3001):**
   - Real-time connector health monitoring and latency gauges.
   - Transaction ledger visualizer and reconciliation status.
   - Interactive **17-Gate Production Readiness Dashboard**.
3. **API Gateway (`apps/api-gateway` - Port 4000):**
   - Express REST API exposing authentication, quote generation, order execution, provider metrics, and compliance logs.

---

## 3. Dual-Rail Architecture: Fiat vs. Crypto Pilot Strategy

To achieve the fastest time-to-market with the lowest operational cost, the system supports two distinct execution paths:

```
                                  [Sender: £500 GBP]
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
            [Option A: Fiat Rail]                         [Option B: Crypto Rail]
                    │                                             │
      Modulr GBP Inbound (£0.35 fee)                 UK On-Ramp (Transak/MoonPay Widget)
                    │                                             │
    Currencycloud FX (0.4% spread)                   USDC on Solana (~$0.0002 gas, 400ms)
                    │                                             │
    Cashfree IMPS Payout (₹3.50 fee)                 India Off-Ramp API (Onmeta/TransFi)
                    │                                             │
           [Beneficiary: ₹ INR]                          [Beneficiary: ₹ INR]
```

### Comparative Analysis

| Feature / Metric | Traditional Fiat Rail (Path A) | Crypto Stablecoin Rail (Path B) - **RECOMMENDED FOR PILOT** |
|---|---|---|
| **Regulatory Prerequisite** | FCA Authorisation (PI/EMI) + RBI Compliance | None for sender/receiver; On/Off-ramp partners handle compliance |
| **Licensing Lead Time** | 3 to 12 months | Immediate (Days for API onboarding) |
| **Upfront Setup Costs** | £1,500 – £5,000+ (Legal & Licensing) | ~$49/mo (Dedicated RPC node) + ~$20 SOL gas fund |
| **Transfer Settlement Time** | 10 minutes to 2 hours (dependent on banking cutoffs) | **Sub-minute** (400ms Solana finality + instant UPI off-ramp) |
| **Per-Transaction Network Fee** | £0.20 – £0.50 + ₹3.50 | **<$0.001 (Solana Lamport fee)** |
| **Integration Complexity** | High (Virtual accounts, bank webhooks, settlement windows) | Low (Single crypto transfer instruction + Off-ramp API) |

---

## 4. Current Blockers: Production Readiness Gate Audit

When evaluating the system via the `ProductionReadinessEngine`, 6 mandatory gates currently return `FAIL` or `NOT_READY`. **All 6 represent external legal, commercial, and credential dependencies, not software defects.**

```
[PASS]  KYC_READINESS              ├── Software & checks built
[PASS]  AML_READINESS              ├── Watchlists & rules active
[PASS]  FRAUD_READINESS            ├── Scoring & velocity checks active
[PASS]  LEDGER_READINESS           ├── Double-entry balancing active
[PASS]  RECONCILIATION_READINESS   ├── Automated matching engine verified
[PASS]  SECURITY_READINESS         ├── IAM, HMAC, signature validation verified
[FAIL]  LEGAL_AUTHORIZATION        └── No FCA license / Partner Agent agreement verified
[FAIL]  BANKING_RELATIONSHIP       └── No commercial contract executed with Modulr/Cashfree
[FAIL]  PROVIDER_CERTIFICATION     └── Connectors currently mapped to SANDBOX, not live test
[FAIL]  CONNECTOR_READINESS        └── No production vault credentials injected
[FAIL]  PRODUCTION_CREDENTIALS     └── Secrets vault lacks live production API tokens
[FAIL]  PRODUCTION_LIQUIDITY       └── Settlement pools in GBP/INR unfunded
```

---

## 5. Requirements Matrix & Procurement Plan

### Phase 1: Immediate Crypto-First Pilot (Next 1–2 Weeks)
To execute the live pilot with minimal cost, the following must be procured:

1. **Solana Mainnet RPC Provider:**
   - Provider: [Helius](https://helius.dev/) or [QuickNode](https://www.quicknode.com/)
   - Cost: Free tier or Developer tier ($49/month).
2. **Treasury Keypair & Gas Liquidity:**
   - Dedicated Solana Keypair generated in cold/secure storage.
   - 0.5 SOL (~$75) transferred to treasury address for transaction fees.
3. **UK Fiat On-Ramp Partner:**
   - Provider: [Transak](https://transak.com/), [MoonPay](https://www.moonpay.com/), or [Stripe Crypto](https://stripe.com/crypto).
   - Integration: Drop-in frontend iframe/widget allowing sender to buy USDC directly to treasury.
4. **India Fiat Off-Ramp Partner:**
   - Provider: [Onmeta](https://onmeta.in/), [TransFi](https://transfi.com/), or [Kado](https://www.kado.money/).
   - Integration: API access allowing GYB to deposit USDC and trigger IMPS/UPI disbursement to beneficiary accounts.

### Phase 2: Full Institutional Banking Rail (3–6 Months)
1. **UK PSP Agreement:** Commercial contract with [Modulr Finance](https://www.modulrfinance.com/) or [ClearBank](https://www.clear.bank/).
2. **India Payout Agreement:** Commercial contract with [Cashfree Payments](https://www.cashfree.com/) or [Razorpay](https://razorpay.com/).
3. **FX Provider Agreement:** Commercial agreement with [Currencycloud](https://www.currencycloud.com/).
4. **Legal Entity & Regulatory Status:**
   - Option 1 (Fast): Register as an **Authorised Agent** under an existing FCA-regulated EMI.
   - Option 2 (Direct): Apply for **Small Payment Institution (SPI)** status via FCA Connect.
5. **Prefunded Settlement Accounts:** £5,000 in UK safeguarding and ₹5,000,000 in Cashfree payout pool.

---

## 6. Strategic Questions & Clarifications for Leadership

To finalize technical design and product UX for the pilot, please review and provide direction on the following key questions:

### A. For Head of Engineering (CTO)
1. **Treasury Key Management & Security:**
   - *Current State:* Devnet private key is passed via environment variable `TREASURY_SOLANA_SECRET`.
   - *Question:* For the real-money pilot, should we integrate AWS Secrets Manager / HashiCorp Vault with an automated signer, or use an MPC wallet solution (e.g., Turnkey / Fireblocks) for transaction signing?
2. **Off-Ramp Webhook & Idempotency Strategy:**
   - *Question:* Off-ramp providers in India (IMPS) occasionally enter an asynchronous `PENDING` state during bank downtime. Should we adopt a 60-second polling fallback or require strict Webhook signature verification before updating ledger finality?
3. **RPC Redundancy:**
   - *Question:* Should we configure automatic fallback across two RPC providers (e.g., Helius primary + QuickNode secondary) in `SolanaProvider.ts` to prevent transaction drops during network congestion?

### B. For Head of Product / Principal Product Designer
1. **Customer Payment Experience (On-Ramp UX):**
   - *Option 1 (Embedded Widget):* Senders complete KYC and GBP payment directly inside a Transak/MoonPay modal within our app. Senders see GBP debit and receive instant confirmation.
   - *Option 2 (Bank Transfer to Virtual Account):* Senders do a standard Faster Payment from their banking app (Revolut, Monzo, Barclays) to a designated virtual account.
   - *Question:* Which UX flow do you want to prioritize for the v1 pilot customer journey?
2. **Fee & Spread Transparency Display:**
   - *Current UI:* Shows a fixed flat fee (£1.50) + live FX rate.
   - *Question:* When routing via Crypto Rail, should we show a single guaranteed conversion rate with fees bundled into the spread, or display an itemized breakdown (Network Fee + Partner Fee + FX Rate)?
3. **Beneficiary Pre-flight Validation Flow:**
   - *Question:* If an Indian bank account fails Penny-Drop validation (name mismatch > 20%), should the UI immediately block transaction creation and prompt document re-entry, or allow manual override by operations with Maker-Checker approval?

---

## 7. Recommended Next Steps

1. **Approve Pilot Architecture:** Align on the **USDC-on-Solana + On/Off Ramp** path for the low-cost alpha pilot.
2. **Scaffold Off-Ramp Connector:** Implement `CryptoOfframpSettlementConnector.ts` within `packages/real-providers` to standardize the off-ramp API contract.
3. **Inject Mainnet RPC & Test Wallet:** Update `.env` with a mainnet RPC URL and funded test keypair.
4. **Execute Live Micro-Transaction (£10 Test):** Run a live end-to-end dry run through the customer web app on Port 3000 to verify actual latency, gas fees, and bank landing time.

---
*Report generated and archived in GYB Documentation.*
