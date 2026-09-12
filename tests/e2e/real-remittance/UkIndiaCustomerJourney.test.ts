import { EndToEndTransactionOrchestrator } from '../../../packages/transaction-orchestrator/src/EndToEndTransactionOrchestrator';
import { RailTransactionEngine } from '../../../packages/rail-transaction/src/RailTransactionEngine';
import { SandboxFXProvider } from '../../../packages/fx-connectivity/src/FXQuoteService';
import { UkSettlementConnector } from '../../../packages/financial-connectivity/src/UkSettlementConnector';
import { IndiaSettlementConnector } from '../../../packages/financial-connectivity/src/IndiaSettlementConnector';
import { ConnectorEnvironment, SettlementState } from '../../../packages/financial-connectivity/src/FinancialInstitutionConnector';
import { ReconciliationEngineV2 } from '../../../packages/reconciliation-engine/src/ReconciliationEngineV2';
import { ProductionReadinessEngineV2 } from '../../../packages/production-readiness/src/ProductionReadinessEngine';
import { BeneficiaryValidationEngine } from '../../../packages/beneficiary-validation/src/BeneficiaryValidationEngine';

describe('MS27 E2E: Real-World Remittance Journey (Sandbox)', () => {
  let txEngine: RailTransactionEngine;
  let fxProvider: SandboxFXProvider;
  let ukConnector: UkSettlementConnector;
  let inConnector: IndiaSettlementConnector;
  let reconciliation: ReconciliationEngineV2;
  let readiness: ProductionReadinessEngineV2;
  let beneficiaryValidator: BeneficiaryValidationEngine;

  beforeEach(() => {
    txEngine = new RailTransactionEngine();
    fxProvider = new SandboxFXProvider();
    ukConnector = new UkSettlementConnector(ConnectorEnvironment.SANDBOX);
    inConnector = new IndiaSettlementConnector(ConnectorEnvironment.SANDBOX);
    reconciliation = new ReconciliationEngineV2();
    readiness = new ProductionReadinessEngineV2();
    beneficiaryValidator = new BeneficiaryValidationEngine();
  });

  it('should execute a complete successful UK to India customer journey', async () => {
    // 1. Customer Add Beneficiary & Validate
    const benValidation = await beneficiaryValidator.validate({
      accountToken: 'tok-in-1',
      country: 'IN',
      currency: 'INR',
      institutionName: 'HDFC Bank',
      accountHolderName: 'Rahul Sharma'
    });
    expect(benValidation.isValid).toBe(true);

    // 2. Customer gets FX Quote
    const quote = await fxProvider.quote('GBP', 'INR', 500);
    expect(quote.destinationAmount).toBe(52750); // 500 * 105.5
    expect(quote.status).toBe('QUOTED');

    // 3. Customer confirms & locks quote
    const lockedQuote = await fxProvider.lock(quote.quoteId);
    expect(lockedQuote.status).toBe('LOCKED');

    // 4. API Gateway creates Rail Transaction (abstracted by the Orchestrator concept)
    const tx = await txEngine.createTransaction({
      customerId: 'user-123',
      corridor: 'UK-IN',
      amount: quote.sourceAmount,
      currency: 'GBP',
      destinationAmount: quote.destinationAmount,
      destinationCurrency: 'INR'
    });
    expect(tx.status).toBe('CREATED');

    // 5. Compliance Approved (simulated as part of MS27 backend workflow)
    await txEngine.updateStatus(tx.railTransactionId, 'COMPLIANCE_APPROVED');

    // 6. Funding Confirmed via UK Connector
    const fund = await ukConnector.initiateFunding({
      requestId: 'req-1', railTransactionId: tx.railTransactionId, amount: 500,
      currency: 'GBP', sourceAccountToken: 'tok-uk', idempotencyKey: 'idem-1'
    });
    expect(fund.status).toBe('FUNDING_CONFIRMED');

    // 7. FX Execution
    const fxExecution = await fxProvider.execute(lockedQuote.quoteId, tx.railTransactionId);
    expect(fxExecution.status).toBe('EXECUTED');

    // 8. India Payout via Connector
    const settle = await inConnector.initiateSettlement({
      instructionId: 'inst-1', railTransactionId: tx.railTransactionId,
      amount: fxExecution.destinationAmount, currency: 'INR',
      beneficiaryAccountToken: 'tok-in-1', idempotencyKey: 'idem-2'
    });
    expect(settle.status).toBe(SettlementState.COMPLETED);

    // 9. Final Reconciliation V2 Cross-Check
    const reconStatus = reconciliation.reconcileTransaction(
      tx,
      fund.status as any,
      fxExecution as any,
      settle.status,
      52750 // expected final amount from provider
    );
    expect(reconStatus).toBe('MATCHED');

    // 10. Final State
    await txEngine.updateStatus(tx.railTransactionId, 'COMPLETED');
    const finalTx = await txEngine.getTransaction(tx.railTransactionId);
    expect(finalTx?.status).toBe('COMPLETED');
  });

  it('should block real execution and fail closed in Production without clearance', async () => {
    process.env.REAL_MONEY_ENABLED = 'false';
    const prodUkConnector = new UkSettlementConnector(ConnectorEnvironment.PRODUCTION);
    
    // Attempting to fund in production will throw immediately
    await expect(
      prodUkConnector.initiateFunding({
        requestId: 'req-prod', railTransactionId: 'tx-prod', amount: 500,
        currency: 'GBP', sourceAccountToken: 'tok-uk', idempotencyKey: 'idem-prod'
      })
    ).rejects.toThrow('SUSPENDED in production');
    
    // Readiness engine should correctly report block status
    expect(readiness.isProductionReady()).toBe(false);
    expect(readiness.getBlockers().length).toBeGreaterThan(0);
  });
});
