import { GYBTransactionProtocol, RailTransactionState } from '../../rail-protocol/src/GYBRailProtocol';

export class RailTransactionEngine {
  private memoryStore: Map<string, GYBTransactionProtocol> = new Map();

  public createTransaction(tx: GYBTransactionProtocol): GYBTransactionProtocol {
    tx.state = RailTransactionState.CREATED;
    this.memoryStore.set(tx.railTransactionId, tx);
    return tx;
  }

  public getTransaction(id: string): GYBTransactionProtocol | undefined {
    return this.memoryStore.get(id);
  }

  public transitionState(id: string, newState: RailTransactionState): boolean {
    const tx = this.memoryStore.get(id);
    if (!tx) return false;

    // Basic state machine validation
    const validTransitions = this.getValidTransitions(tx.state);
    if (!validTransitions.includes(newState)) {
      console.error(`Invalid transition from ${tx.state} to ${newState} for ${id}`);
      return false;
    }

    tx.state = newState;
    this.memoryStore.set(id, tx);
    console.log(`[TX-ENGINE] Transaction ${id} moved to ${newState}`);
    return true;
  }

  private getValidTransitions(current: RailTransactionState): RailTransactionState[] {
    const map: Record<RailTransactionState, RailTransactionState[]> = {
      [RailTransactionState.CREATED]: [RailTransactionState.VALIDATING, RailTransactionState.REJECTED],
      [RailTransactionState.VALIDATING]: [RailTransactionState.COMPLIANCE_PENDING, RailTransactionState.FAILED],
      [RailTransactionState.COMPLIANCE_PENDING]: [RailTransactionState.COMPLIANCE_APPROVED, RailTransactionState.REJECTED],
      [RailTransactionState.COMPLIANCE_APPROVED]: [RailTransactionState.LEDGER_RESERVED, RailTransactionState.FAILED],
      [RailTransactionState.LEDGER_RESERVED]: [RailTransactionState.ROUTING, RailTransactionState.FAILED],
      [RailTransactionState.ROUTING]: [RailTransactionState.CLEARING, RailTransactionState.FAILED],
      [RailTransactionState.CLEARING]: [RailTransactionState.FX_LOCKED, RailTransactionState.FAILED],
      [RailTransactionState.FX_LOCKED]: [RailTransactionState.SETTLEMENT_PENDING, RailTransactionState.FAILED],
      [RailTransactionState.SETTLEMENT_PENDING]: [RailTransactionState.EXTERNAL_SETTLEMENT, RailTransactionState.FAILED],
      [RailTransactionState.EXTERNAL_SETTLEMENT]: [RailTransactionState.SETTLED, RailTransactionState.FAILED],
      [RailTransactionState.SETTLED]: [RailTransactionState.RECONCILING],
      [RailTransactionState.RECONCILING]: [RailTransactionState.RECONCILED, RailTransactionState.QUARANTINED],
      [RailTransactionState.RECONCILED]: [RailTransactionState.COMPLETED],
      [RailTransactionState.COMPLETED]: [],
      [RailTransactionState.REJECTED]: [],
      [RailTransactionState.FAILED]: [],
      [RailTransactionState.EXPIRED]: [],
      [RailTransactionState.CANCELLED]: [],
      [RailTransactionState.REVERSED]: [],
      [RailTransactionState.QUARANTINED]: []
    };
    return map[current] || [];
  }
}
