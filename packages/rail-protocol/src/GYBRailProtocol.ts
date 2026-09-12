export enum RailTransactionState {
  CREATED = 'CREATED',
  VALIDATING = 'VALIDATING',
  COMPLIANCE_PENDING = 'COMPLIANCE_PENDING',
  COMPLIANCE_APPROVED = 'COMPLIANCE_APPROVED',
  LEDGER_RESERVED = 'LEDGER_RESERVED',
  ROUTING = 'ROUTING',
  CLEARING = 'CLEARING',
  FX_LOCKED = 'FX_LOCKED',
  SETTLEMENT_PENDING = 'SETTLEMENT_PENDING',
  EXTERNAL_SETTLEMENT = 'EXTERNAL_SETTLEMENT',
  SETTLED = 'SETTLED',
  RECONCILING = 'RECONCILING',
  RECONCILED = 'RECONCILED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
  QUARANTINED = 'QUARANTINED'
}

export interface GYBTransactionProtocol {
  transactionId: string;
  railTransactionId: string;
  correlationId: string;
  idempotencyKey: string;
  
  senderId: string;
  receiverId: string;
  
  originatingCountry: string;
  destinationCountry: string;
  sourceCurrency: string;
  destinationCurrency: string;
  
  sourceAmount: number;
  destinationAmount: number;
  fxRate: number | null;
  fees: number;
  
  timestamp: number;
  expiresAt: number;
  protocolVersion: string;
  
  participantId: string;
  nodeId: string;
  
  state: RailTransactionState;
  complianceState: string | null;
  settlementState: string | null;
  reconciliationState: string | null;
  
  signatures: {
    participantSignature?: string;
    nodeSignature?: string;
  };
}

export class GYBRailProtocolValidator {
  public static validate(tx: GYBTransactionProtocol): boolean {
    if (!tx.railTransactionId || !tx.idempotencyKey || !tx.correlationId) return false;
    if (!tx.sourceCurrency || !tx.destinationCurrency) return false;
    if (tx.sourceAmount <= 0) return false;
    return true;
  }

  public static isTerminal(state: RailTransactionState): boolean {
    return [
      RailTransactionState.COMPLETED,
      RailTransactionState.REJECTED,
      RailTransactionState.FAILED,
      RailTransactionState.EXPIRED,
      RailTransactionState.CANCELLED,
      RailTransactionState.REVERSED,
      RailTransactionState.QUARANTINED
    ].includes(state);
  }
}
