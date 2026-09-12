import { GYBTransactionProtocol, GYBRailProtocolValidator } from '../../rail-protocol/src/GYBRailProtocol';
import { TransactionIntegrityEngine } from '../../transaction-integrity/src/TransactionIntegrityEngine';

export class RailNode {
  private nodeId: string;
  private integrityEngine: TransactionIntegrityEngine;

  constructor(nodeId: string, integrityEngine: TransactionIntegrityEngine) {
    this.nodeId = nodeId;
    this.integrityEngine = integrityEngine;
  }

  public intakeTransaction(tx: GYBTransactionProtocol): boolean {
    console.log(`[NODE ${this.nodeId}] Intaking transaction ${tx.railTransactionId}`);
    
    if (!GYBRailProtocolValidator.validate(tx)) {
      console.error(`[NODE ${this.nodeId}] Invalid protocol structure.`);
      return false;
    }

    if (!this.integrityEngine.guaranteeIdempotency(tx.idempotencyKey)) {
      console.warn(`[NODE ${this.nodeId}] Idempotency conflict for ${tx.idempotencyKey}`);
      return false; // Replay attempt
    }

    if (tx.expiresAt < Date.now()) {
      console.error(`[NODE ${this.nodeId}] Transaction expired.`);
      return false;
    }

    // Signature verification would go here in production
    console.log(`[NODE ${this.nodeId}] Transaction ${tx.railTransactionId} authenticated and accepted.`);
    return true;
  }
}
