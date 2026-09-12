import { GYBTransactionProtocol, RailTransactionState } from '../../packages/rail-protocol/src/GYBRailProtocol';
import { RailTransactionEngine } from '../../packages/rail-transaction/src/RailTransactionEngine';
import { RailClearingEngine } from '../../packages/rail-clearing/src/RailClearingEngine';
import { SandboxFinancialNetwork } from '../../packages/sandbox-network/src/SandboxFinancialNetwork';
import { ReconciliationEngine } from '../../packages/reconciliation-engine/src/ReconciliationEngine';
import { ProductionReadinessEngine } from '../../packages/production-readiness/src/ProductionReadinessEngine';
import { EndToEndTransactionOrchestrator } from '../../packages/transaction-orchestrator/src/EndToEndTransactionOrchestrator';
import { TransactionIntegrityEngine } from '../../packages/transaction-integrity/src/TransactionIntegrityEngine';

describe('Rail Load Tester', () => {
  it('should process 1,000 concurrent transactions successfully', async () => {
    const txEngine = new RailTransactionEngine();
    const orchestrator = new EndToEndTransactionOrchestrator(
      txEngine,
      new RailClearingEngine(),
      new SandboxFinancialNetwork(),
      new ReconciliationEngine(),
      new ProductionReadinessEngine()
    );
    const integrityEngine = new TransactionIntegrityEngine();

    const executions: Promise<boolean>[] = [];
    
    for (let i = 0; i < 1000; i++) {
      const tx: GYBTransactionProtocol = {
        transactionId: `global-load-${i}`,
        railTransactionId: `rail-load-${i}`,
        correlationId: integrityEngine.generateCorrelationId(),
        idempotencyKey: `idem-load-${i}`,
        senderId: `SENDER_${i}`,
        receiverId: `RECEIVER_${i}`,
        originatingCountry: 'UK',
        destinationCountry: 'IN',
        sourceCurrency: 'GBP',
        destinationCurrency: 'INR',
        sourceAmount: 100, // Small amount to pass limits
        destinationAmount: 10550,
        fxRate: null,
        fees: 1.0,
        timestamp: Date.now(),
        expiresAt: Date.now() + 100000,
        protocolVersion: '1.0',
        participantId: 'PSP_UK_1',
        nodeId: 'NODE_UK_1',
        state: RailTransactionState.CREATED,
        complianceState: null,
        settlementState: null,
        reconciliationState: null,
        signatures: {}
      };

      executions.push(orchestrator.execute(tx));
    }

    const results = await Promise.all(executions);
    
    const successes = results.filter(r => r === true).length;
    expect(successes).toBe(1000);
    
    // Verify final state of first transaction
    const firstTx = txEngine.getTransaction('rail-load-0');
    expect(firstTx?.state).toBe(RailTransactionState.COMPLETED);
  });
});
