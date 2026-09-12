# Milestone 25 Architecture

This document describes the final End-to-End GYB Proprietary Rail architecture.

## Transaction Orchestration
The `EndToEndTransactionOrchestrator` is the central coordinator for the GYB rail transaction lifecycle. It moves transactions deterministically through the following states:

1. `CREATED`
2. `VALIDATING`
3. `COMPLIANCE_PENDING` -> `COMPLIANCE_APPROVED`
4. `LEDGER_RESERVED`
5. `ROUTING`
6. `CLEARING`
7. `FX_LOCKED`
8. `SETTLEMENT_PENDING`
9. `EXTERNAL_SETTLEMENT`
10. `SETTLED`
11. `RECONCILING` -> `RECONCILED`
12. `COMPLETED`

## Rail Node & Participant Registry
The `RailNode` exposes the intake boundary. It delegates payload validation to the `GYBRailProtocolValidator` and uniqueness/signature verification to the `TransactionIntegrityEngine`. 
`RailParticipantRegistry` manages the lifecycle of participants interacting with the rail.

## Integration Boundaries
The architecture enforces strict separation between internal GYB logic and external systems:
- **Internal Ledger**: Managed implicitly via `RailClearingEngine` during the CLEARING phase.
- **Compliance**: Externalized to MS11 AML/Sanctions gates (simulated in the orchestrator flow).
- **External Settlement**: Mediated explicitly through `ExternalSettlementAdapter`. No provider-specific logic leaks into the core rail.

## Safety & Governance
Execution is gated by the `ProductionReadinessEngine`, which defaults to blocking any real-money interactions unless `REAL_MONEY_ENABLED=true` and all safety gates pass.
