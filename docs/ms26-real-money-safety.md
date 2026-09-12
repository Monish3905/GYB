# Real-Money Safety & Dry Run
REAL_MONEY_EXECUTION = BLOCKED
Currently, GYB lacks legal authorization and live PSP integration. The ProductionReadinessEngine enforces 17 gates.
To execute a live dry-run:
1. Complete KYC.
2. Inject test credentials into vault.
3. Clear the ProductionReadinessEngine's 17 gates via overrides (only possible by Admin).
4. Set REAL_MONEY_ENABLED=true.
