export type TransactionState = 
  | 'Created'
  | 'QuoteRequested'
  | 'Quoted'
  | 'Compliance'
  | 'LiquidityReserved'
  | 'SettlementPrepared'
  | 'Signed'
  | 'Submitted'
  | 'Pending'
  | 'Confirmed'
  | 'LedgerCommitted'
  | 'TreasuryUpdated'
  | 'Completed'
  | 'Archived'
  | 'Failed';

export class PaymentStateMachine {
  private currentState: TransactionState;

  constructor(initialState: TransactionState = 'Created') {
    this.currentState = initialState;
  }

  getState(): TransactionState {
    return this.currentState;
  }

  canTransitionTo(nextState: TransactionState): boolean {
    const validTransitions: Record<TransactionState, TransactionState[]> = {
      'Created': ['QuoteRequested', 'Failed'],
      'QuoteRequested': ['Quoted', 'Failed'],
      'Quoted': ['Compliance', 'Failed'],
      'Compliance': ['LiquidityReserved', 'Failed'],
      'LiquidityReserved': ['SettlementPrepared', 'Failed'],
      'SettlementPrepared': ['Signed', 'Failed'],
      'Signed': ['Submitted', 'Failed'],
      'Submitted': ['Pending', 'Failed'],
      'Pending': ['Confirmed', 'Failed'],
      'Confirmed': ['LedgerCommitted', 'Failed'],
      'LedgerCommitted': ['TreasuryUpdated', 'Failed'],
      'TreasuryUpdated': ['Completed', 'Failed'],
      'Completed': ['Archived'],
      'Archived': [],
      'Failed': ['Archived']
    };

    return validTransitions[this.currentState]?.includes(nextState) || false;
  }

  transitionTo(nextState: TransactionState): void {
    if (!this.canTransitionTo(nextState)) {
      throw new Error(`Invalid state transition from ${this.currentState} to ${nextState}`);
    }
    this.currentState = nextState;
  }
}
