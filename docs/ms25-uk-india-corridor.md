# Milestone 25: UK -> India Corridor

The initial E2E validation for the GYB rail exercises the GBP -> INR corridor.

## Corridor Configuration
- **Source**: UK (GBP)
- **Destination**: India (INR)
- **Transaction Limit**: £50,000 GBP
- **Compliance**: Requires both KYC and AML checks before LEDGER_RESERVED state.

## Boundary Definitions
- **Internal Compliance Boundary**: AML and KYC are evaluated internally.
- **Settlement Boundary**: The actual transmission of INR to the Indian beneficiary relies on an external financial PSP in India. This is explicitly abstracted behind `ExternalSettlementAdapter`.
- **Sandbox**: During MS25, `SandboxFinancialNetwork` fulfills the adapter role. It simulates latency, FX limits, and failure conditions deterministically.

## Idempotency
Double-spending is prevented explicitly. Submitting the exact same transaction (same `idempotencyKey`) will not result in a new FX lock or settlement request.
