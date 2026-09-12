import { GYBTransactionProtocol } from '../../rail-protocol/src/GYBRailProtocol';
import { FundingState, SettlementState } from '../../financial-connectivity/src/FinancialInstitutionConnector';
import { FXExecution } from '../../fx-connectivity/src/FXProviderRegistry';

export enum ReconciliationStatus {
  MATCHED = 'MATCHED',
  MISMATCH_FUNDING = 'MISMATCH_FUNDING',
  MISMATCH_SETTLEMENT = 'MISMATCH_SETTLEMENT',
  MISMATCH_FX = 'MISMATCH_FX',
  MISSING_SETTLEMENT = 'MISSING_SETTLEMENT',
  QUARANTINED = 'QUARANTINED'
}

export class ReconciliationEngineV2 {
  public reconcileTransaction(
    tx: GYBTransactionProtocol, 
    fundingStatus: FundingState,
    fxExecution: FXExecution | null,
    settlementStatus: SettlementState,
    providerSettlementAmount: number
  ): ReconciliationStatus {
    
    if (fundingStatus !== FundingState.FUNDING_CONFIRMED) {
      console.warn(`[RECONCILIATION-V2] Funding not confirmed for ${tx.railTransactionId}`);
      return ReconciliationStatus.MISMATCH_FUNDING;
    }

    if (!fxExecution || fxExecution.status !== 'EXECUTED') {
      console.warn(`[RECONCILIATION-V2] FX execution missing or not confirmed for ${tx.railTransactionId}`);
      return ReconciliationStatus.MISMATCH_FX;
    }

    if (fxExecution.destinationAmount !== tx.destinationAmount) {
      console.warn(`[RECONCILIATION-V2] FX amount mismatch for ${tx.railTransactionId}`);
      return ReconciliationStatus.MISMATCH_FX;
    }

    if (settlementStatus === SettlementState.UNKNOWN) {
      console.error(`[RECONCILIATION-V2] Settlement status UNKNOWN for ${tx.railTransactionId}. Quarantining to prevent duplicates.`);
      return ReconciliationStatus.QUARANTINED;
    }

    if (settlementStatus !== SettlementState.COMPLETED) {
      return ReconciliationStatus.MISSING_SETTLEMENT;
    }

    if (tx.destinationAmount !== providerSettlementAmount) {
      console.warn(`[RECONCILIATION-V2] Final settlement amount mismatch for ${tx.railTransactionId}`);
      return ReconciliationStatus.MISMATCH_SETTLEMENT;
    }

    console.log(`[RECONCILIATION-V2] Transaction ${tx.railTransactionId} fully matched across Funding, FX, and Settlement.`);
    return ReconciliationStatus.MATCHED;
  }
}
