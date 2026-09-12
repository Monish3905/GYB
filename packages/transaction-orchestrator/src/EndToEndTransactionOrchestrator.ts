import { GYBTransactionProtocol, RailTransactionState } from '../../rail-protocol/src/GYBRailProtocol';
import { RailTransactionEngine } from '../../rail-transaction/src/RailTransactionEngine';
import { RailClearingEngine } from '../../rail-clearing/src/RailClearingEngine';
import { SandboxFinancialNetwork } from '../../sandbox-network/src/SandboxFinancialNetwork';
import { ReconciliationEngine, ReconciliationStatus } from '../../reconciliation-engine/src/ReconciliationEngine';
import { ProductionReadinessEngine } from '../../production-readiness/src/ProductionReadinessEngine';
import { UkIndiaCorridor } from '../../corridor-uk-india/src/UkIndiaCorridor';

export class EndToEndTransactionOrchestrator {
  private txEngine: RailTransactionEngine;
  private clearingEngine: RailClearingEngine;
  private settlementAdapter: SandboxFinancialNetwork;
  private reconciliationEngine: ReconciliationEngine;
  private readinessEngine: ProductionReadinessEngine;

  constructor(
    txEngine: RailTransactionEngine,
    clearingEngine: RailClearingEngine,
    settlementAdapter: SandboxFinancialNetwork,
    reconciliationEngine: ReconciliationEngine,
    readinessEngine: ProductionReadinessEngine
  ) {
    this.txEngine = txEngine;
    this.clearingEngine = clearingEngine;
    this.settlementAdapter = settlementAdapter;
    this.reconciliationEngine = reconciliationEngine;
    this.readinessEngine = readinessEngine;
  }

  public async execute(tx: GYBTransactionProtocol): Promise<boolean> {
    if (!this.readinessEngine.isReadyForExecution()) {
      throw new Error('Production readiness gate failed');
    }

    // 1. Create Transaction
    this.txEngine.createTransaction(tx);
    
    // 2. Validate Corridor
    if (!UkIndiaCorridor.validate(tx.sourceAmount, tx.sourceCurrency, tx.destinationCurrency)) {
      this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.REJECTED);
      return false;
    }
    this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.VALIDATING);

    // 3. Compliance (Simulated for orchestration flow)
    this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.COMPLIANCE_PENDING);
    // Simulate AML/Sanctions pass
    this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.COMPLIANCE_APPROVED);

    // 4. Ledger Reservation
    this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.LEDGER_RESERVED);

    // 5. Routing & Clearing
    this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.ROUTING);
    this.clearingEngine.submitForClearing(tx);
    this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.CLEARING);

    // 6. FX Lock
    try {
      const rate = await this.settlementAdapter.quote(tx.sourceAmount, tx.sourceCurrency, tx.destinationCurrency);
      tx.fxRate = rate;
      this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.FX_LOCKED);
    } catch (e) {
      this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.FAILED);
      return false;
    }

    // 7. Settlement Instruction
    this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.SETTLEMENT_PENDING);
    
    try {
      const settlementResult = await this.settlementAdapter.initiateSettlement({
        requestId: `req-${tx.railTransactionId}`,
        transactionId: tx.railTransactionId,
        amount: tx.destinationAmount,
        currency: tx.destinationCurrency,
        beneficiary: 'IN_BANK_ACC_123'
      });

      if (!settlementResult.success) {
        this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.FAILED);
        return false;
      }
      this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.EXTERNAL_SETTLEMENT);

      // 8. Settlement Confirmation
      const status = await this.settlementAdapter.getSettlementStatus(settlementResult.providerReference!);
      if (status === 'COMPLETED') {
        this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.SETTLED);
      }
    } catch (e) {
      this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.FAILED);
      return false;
    }

    // 9. Reconciliation
    this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.RECONCILING);
    const recStatus = this.reconciliationEngine.reconcileTransaction(
      tx, 
      tx.destinationAmount, // Ledger amount simulator
      tx.destinationAmount, // Provider amount simulator
      'COMPLETED'
    );

    if (recStatus === ReconciliationStatus.MATCHED) {
      this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.RECONCILED);
      this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.COMPLETED);
      return true;
    } else {
      this.txEngine.transitionState(tx.railTransactionId, RailTransactionState.QUARANTINED);
      return false;
    }
  }
}
