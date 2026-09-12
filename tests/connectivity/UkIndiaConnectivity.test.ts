import { ConnectorEnvironment, SettlementState, FundingState } from '../../packages/financial-connectivity/src/FinancialInstitutionConnector';
import { UkSettlementConnector } from '../../packages/financial-connectivity/src/UkSettlementConnector';
import { IndiaSettlementConnector } from '../../packages/financial-connectivity/src/IndiaSettlementConnector';
import { SandboxFXProvider } from '../../packages/fx-connectivity/src/FXQuoteService';
import { FinancialApprovalEngine } from '../../packages/financial-connectivity/src/FinancialApprovalEngine';
import { TransactionLimitsEngine } from '../../packages/transaction-limits/src/TransactionLimitsEngine';

describe('UK -> India Financial Connectivity Integration (Sandbox)', () => {
  let ukConnector: UkSettlementConnector;
  let indiaConnector: IndiaSettlementConnector;
  let fxProvider: SandboxFXProvider;
  let approvalEngine: FinancialApprovalEngine;
  let limitsEngine: TransactionLimitsEngine;

  beforeEach(() => {
    ukConnector = new UkSettlementConnector(ConnectorEnvironment.SANDBOX);
    indiaConnector = new IndiaSettlementConnector(ConnectorEnvironment.SANDBOX);
    fxProvider = new SandboxFXProvider();
    approvalEngine = new FinancialApprovalEngine();
    limitsEngine = new TransactionLimitsEngine();

    limitsEngine.addLimit({
      scope: 'CORRIDOR', scopeReference: 'UK-IN', currency: 'GBP',
      maxPerTransaction: 50000, maxPerDay: 100000, maxPerRolling30d: 500000
    });
  });

  it('should successfully simulate a funded, FX-locked, and settled transaction', async () => {
    // 1. Limit Check
    const limitCheck = limitsEngine.evaluate('CORRIDOR', 'UK-IN', 'GBP', 5000);
    expect(limitCheck.allowed).toBe(true);

    // 2. UK Funding
    const fundRes = await ukConnector.initiateFunding({
      requestId: 'req-1', railTransactionId: 'tx-1', amount: 5000, currency: 'GBP',
      sourceAccountToken: 'tok-uk-1', idempotencyKey: 'idem-fund-1'
    });
    expect(fundRes.status).toBe(FundingState.FUNDING_CONFIRMED);

    // 3. FX Quote & Lock
    const quote = await fxProvider.quote('GBP', 'INR', 5000);
    const locked = await fxProvider.lock(quote.quoteId);
    expect(locked.status).toBe('LOCKED');
    const exec = await fxProvider.execute(locked.quoteId, 'tx-1');

    // 4. Financial Approval (Maker/Checker)
    approvalEngine.submitApproval({ railTransactionId: 'tx-1', approvalType: 'MAKER', approverId: 'ops-1', decision: 'APPROVED', decidedAt: Date.now() });
    approvalEngine.submitApproval({ railTransactionId: 'tx-1', approvalType: 'CHECKER', approverId: 'ops-2', decision: 'APPROVED', decidedAt: Date.now() });
    expect(approvalEngine.isFullyApproved('tx-1')).toBe(true);

    // 5. India Settlement
    const settleRes = await indiaConnector.initiateSettlement({
      instructionId: 'inst-1', railTransactionId: 'tx-1', amount: exec.destinationAmount,
      currency: 'INR', beneficiaryAccountToken: 'tok-in-1', idempotencyKey: 'idem-stl-1'
    });
    expect(settleRes.status).toBe(SettlementState.COMPLETED);
  });

  it('should fail closed in PRODUCTION if REAL_MONEY_ENABLED is false', async () => {
    // Override environment
    process.env.REAL_MONEY_ENABLED = 'false';
    const prodUk = new UkSettlementConnector(ConnectorEnvironment.PRODUCTION);
    
    await expect(prodUk.initiateFunding({
      requestId: 'req-prod', railTransactionId: 'tx-prod', amount: 100, currency: 'GBP',
      sourceAccountToken: 'tok-1', idempotencyKey: 'idem-prod'
    })).rejects.toThrow('SUSPENDED in production');
  });

  it('should safely quarantine UNKNOWN settlement states', async () => {
    indiaConnector.injectFailure('SETTLEMENT_UNKNOWN');
    const settleRes = await indiaConnector.initiateSettlement({
      instructionId: 'inst-2', railTransactionId: 'tx-2', amount: 1000,
      currency: 'INR', beneficiaryAccountToken: 'tok-in-2', idempotencyKey: 'idem-stl-2'
    });
    expect(settleRes.status).toBe(SettlementState.UNKNOWN);
    // In actual orchestration, the ReconciliationEngineV2 handles quarantining this
  });

  it('should enforce Maker/Checker separation', () => {
    approvalEngine.submitApproval({ railTransactionId: 'tx-3', approvalType: 'MAKER', approverId: 'ops-1', decision: 'APPROVED', decidedAt: Date.now() });
    const checkerRes = approvalEngine.submitApproval({ railTransactionId: 'tx-3', approvalType: 'CHECKER', approverId: 'ops-1', decision: 'APPROVED', decidedAt: Date.now() });
    expect(checkerRes).toBe(false); // Same ID cannot be checker
    expect(approvalEngine.isFullyApproved('tx-3')).toBe(false);
  });
});
