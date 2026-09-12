import { GYBTransactionProtocol, RailTransactionState } from '../../packages/rail-protocol/src/GYBRailProtocol';
import { RailTransactionEngine } from '../../packages/rail-transaction/src/RailTransactionEngine';
import { RailClearingEngine } from '../../packages/rail-clearing/src/RailClearingEngine';
import { SandboxFinancialNetwork } from '../../packages/sandbox-network/src/SandboxFinancialNetwork';
import { ReconciliationEngine } from '../../packages/reconciliation-engine/src/ReconciliationEngine';
import { ProductionReadinessEngine } from '../../packages/production-readiness/src/ProductionReadinessEngine';
import { EndToEndTransactionOrchestrator } from '../../packages/transaction-orchestrator/src/EndToEndTransactionOrchestrator';
import { TransactionIntegrityEngine } from '../../packages/transaction-integrity/src/TransactionIntegrityEngine';

describe('UK -> India End-to-End Validation', () => {
  let orchestrator: EndToEndTransactionOrchestrator;
  let sandboxNetwork: SandboxFinancialNetwork;
  let txEngine: RailTransactionEngine;
  let integrityEngine: TransactionIntegrityEngine;
  
  beforeEach(() => {
    txEngine = new RailTransactionEngine();
    const clearingEngine = new RailClearingEngine();
    sandboxNetwork = new SandboxFinancialNetwork();
    const reconciliationEngine = new ReconciliationEngine();
    const readinessEngine = new ProductionReadinessEngine();
    integrityEngine = new TransactionIntegrityEngine();

    orchestrator = new EndToEndTransactionOrchestrator(
      txEngine,
      clearingEngine,
      sandboxNetwork,
      reconciliationEngine,
      readinessEngine
    );
  });

  const createTestTx = (id: string, amount: number): GYBTransactionProtocol => ({
    transactionId: `global-${id}`,
    railTransactionId: `rail-${id}`,
    correlationId: integrityEngine.generateCorrelationId(),
    idempotencyKey: `idem-${id}`,
    senderId: 'SENDER_1',
    receiverId: 'RECEIVER_1',
    originatingCountry: 'UK',
    destinationCountry: 'IN',
    sourceCurrency: 'GBP',
    destinationCurrency: 'INR',
    sourceAmount: amount,
    destinationAmount: amount * 105.5,
    fxRate: null,
    fees: 5.0,
    timestamp: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60,
    protocolVersion: '1.0',
    participantId: 'PSP_UK_1',
    nodeId: 'NODE_UK_1',
    state: RailTransactionState.CREATED,
    complianceState: null,
    settlementState: null,
    reconciliationState: null,
    signatures: {}
  });

  it('should successfully execute a UK -> India transaction through the GYB rail', async () => {
    const tx = createTestTx('success-001', 1000);
    const result = await orchestrator.execute(tx);
    
    expect(result).toBe(true);
    const state = txEngine.getTransaction(tx.railTransactionId)?.state;
    expect(state).toBe(RailTransactionState.COMPLETED);
  });

  it('should reject transaction due to sandbox FX unavailability', async () => {
    sandboxNetwork.injectFailure('FX_UNAVAILABLE');
    const tx = createTestTx('fail-fx-001', 1000);
    const result = await orchestrator.execute(tx);
    
    expect(result).toBe(false);
    const state = txEngine.getTransaction(tx.railTransactionId)?.state;
    expect(state).toBe(RailTransactionState.FAILED);
  });

  it('should reject transaction due to sandbox provider settlement failure', async () => {
    sandboxNetwork.injectFailure('SETTLEMENT_FAILURE');
    const tx = createTestTx('fail-settle-001', 1000);
    const result = await orchestrator.execute(tx);
    
    expect(result).toBe(false);
    const state = txEngine.getTransaction(tx.railTransactionId)?.state;
    expect(state).toBe(RailTransactionState.FAILED);
  });

  it('should enforce idempotency via TransactionIntegrityEngine', () => {
    const key = 'shared-idempotency-key';
    expect(integrityEngine.guaranteeIdempotency(key)).toBe(true);
    expect(integrityEngine.guaranteeIdempotency(key)).toBe(false);
  });

  it('should reject if corridor limit exceeded', async () => {
    // UkIndiaCorridor has a 50,000 GBP limit
    const tx = createTestTx('fail-limit-001', 100000);
    const result = await orchestrator.execute(tx);
    
    expect(result).toBe(false);
    const state = txEngine.getTransaction(tx.railTransactionId)?.state;
    expect(state).toBe(RailTransactionState.REJECTED);
  });
});
