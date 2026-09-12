import { GYBTransactionProtocol } from '../../rail-protocol/src/GYBRailProtocol';

export enum ReconciliationStatus {
  MATCHED = 'MATCHED',
  MISMATCH_AMOUNT = 'MISMATCH_AMOUNT',
  MISMATCH_CURRENCY = 'MISMATCH_CURRENCY',
  MISSING_SETTLEMENT = 'MISSING_SETTLEMENT',
  QUARANTINED = 'QUARANTINED'
}

export class ReconciliationEngine {
  public reconcileTransaction(
    tx: GYBTransactionProtocol, 
    ledgerAmount: number, 
    providerAmount: number,
    providerStatus: string
  ): ReconciliationStatus {
    
    if (providerStatus !== 'COMPLETED') {
      return ReconciliationStatus.MISSING_SETTLEMENT;
    }

    if (ledgerAmount !== providerAmount || tx.destinationAmount !== providerAmount) {
      console.warn(`[RECONCILIATION] Amount mismatch for ${tx.railTransactionId}. Tx: ${tx.destinationAmount}, Ledger: ${ledgerAmount}, Provider: ${providerAmount}`);
      return ReconciliationStatus.MISMATCH_AMOUNT;
    }

    return ReconciliationStatus.MATCHED;
  }
}
