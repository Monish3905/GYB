# Milestone 26 Repository Audit

## 1. Overview
This document summarizes the repository state up to Milestone 25. GYB has completed its end-to-end proprietary rail orchestration and is preparing for real-world financial connectivity.

## 2. Existing MS25 Architecture
* **`rail-protocol` & `rail-transaction`**: The core transaction state machine.
* **`external-settlement`**: Defines `ExternalSettlementAdapter`, the boundary between the internal GYB rail and external providers.
* **`sandbox-network`**: A mock implementation of `ExternalSettlementAdapter`.
* **`corridor-uk-india`**: Basic bounds validation for GBP->INR.
* **`reconciliation-engine`**: Compares internal ledger vs. GYB tx vs. settlement response.
* **`production-readiness`**: Basic safety gates preventing real-money execution.

## 3. Reusable Components (MS1-MS24)
* **`provider-framework` (MS15)**: The base abstraction for generic plugins/providers.
* **`treasury` & `fx-treasury` (MS18/19)**: The core concepts of liquidity and FX management.
* **`compliance`, `aml`, `fraud`, `sanctions` (MS11)**: Screening systems.
* **`ledger` (MS8)**: Double-entry accounting system.
* **`enterprise-governance` & `governance-approvals` (MS24)**: Can be reused for four-eyes financial approval.

## 4. Gaps That MS26 Must Implement
* **`financial-connectivity`**: Requires a robust connector framework supporting Sandbox/Certification/Production environments.
* **`fx-connectivity`**: Needs `FXProviderRegistry`, `FXQuoteService`, and `FXExecutionService` rather than simple rate lookups.
* **`beneficiary-validation`**: Pre-settlement account and name validation.
* **Funding Lifecycle**: Explicit `FUNDING_PENDING`, `FUNDING_CONFIRMED` state machine (currently combined with settlement in MS25).
* **Unknown Settlement State Handling**: Safe crash-recovery without accidental duplicate fiat transfers.
* **Reconciliation V2**: Deep reconciliation of funding, FX, and settlement legs.
* **Four-Eyes Approval**: High-value production transfer maker/checker flow.
* **Transaction Limits**: Per-corridor, per-customer, per-day limit enforcement.
* **Connector Health**: Real-time degradation monitoring.

## 5. Duplication to Avoid
* Do not duplicate the ledger (use MS8).
* Do not duplicate the baseline plugin framework (extend MS15 `provider-framework` for the specific financial connectors).
* Do not duplicate the MS24 governance evidence store.
