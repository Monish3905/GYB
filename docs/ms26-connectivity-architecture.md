# MS26 Connectivity Architecture

The Financial Connectivity Architecture (MS26) provides the real-world boundary between GYB’s internal ledger/rail and regulated external financial institutions.

## Core Abstraction: `FinancialInstitutionConnector`
All integrations implement this unified interface, handling:
- **Funding (Collection)**: Taking fiat from users.
- **Settlement (Payout)**: Sending fiat to beneficiaries.
- **Beneficiary Validation**: Pre-flight account checks.
- **Reconciliation**: Post-transaction matching.
- **Health Checks**: Real-time degradation monitoring.

## Environment Isolation
Every connector operates in a strict environment:
1. **SANDBOX**: Deterministic simulated responses (used heavily in current MS26 implementation).
2. **CERTIFICATION**: Test credentials hitting real PSP sandbox environments.
3. **PRODUCTION**: Real credentials hitting live PSP APIs.

In `PRODUCTION` mode, connectors default to failing closed (Status: `SUSPENDED`) if `REAL_MONEY_ENABLED` is false or if the `ProductionReadinessEngine` fails its 17 gates.

## Credentials
The `ConnectorCredentialsManager` strictly stores vault references (`vaultReference`), enforcing a hard rule against raw API keys appearing in code or database rows.
