import { OnfidoKycProvider } from '../../../packages/real-providers/src/OnfidoKycProvider';
import { ModulrFundingConnector } from '../../../packages/real-providers/src/ModulrFundingConnector';
import { CurrencycloudFXProvider } from '../../../packages/real-providers/src/CurrencycloudFXProvider';
import { CashfreeSettlementConnector } from '../../../packages/real-providers/src/CashfreeSettlementConnector';
import { ConnectorEnvironment } from '../../../packages/financial-connectivity/src/FinancialInstitutionConnector';

describe('MS28: Real-World Provider Integration API Contracts', () => {
  it('should initialize Onfido KYC Provider successfully', () => {
    const onfido = new OnfidoKycProvider('dummy-token', 'sandbox');
    expect(onfido).toBeDefined();
    // In a real environment with actual tokens, we would mock axios here to verify the exact payload.
    // For now, we assert the provider is correctly structured and doesn't throw on instantiation.
  });

  it('should initialize Modulr Funding Connector in Sandbox', async () => {
    const modulr = new ModulrFundingConnector('key', 'secret', ConnectorEnvironment.SANDBOX);
    expect(modulr.connectorId).toBe('modulr-gbp-connector');
    expect(modulr.getSupportedCapabilities()).toContain('GBP_COLLECTION');
  });

  it('should block Modulr Execution in Production if REAL_MONEY_ENABLED is not true/PILOT', async () => {
    process.env.REAL_MONEY_ENABLED = 'false';
    const modulrProd = new ModulrFundingConnector('key', 'secret', ConnectorEnvironment.PRODUCTION);
    await expect(modulrProd.initiateFunding({
      requestId: '123', railTransactionId: 'rt-1', amount: 500, currency: 'GBP',
      sourceAccountToken: 'tok', idempotencyKey: 'idem'
    })).rejects.toThrow('SUSPENDED');
  });

  it('should initialize Currencycloud FX Provider', () => {
    const fx = new CurrencycloudFXProvider('id', 'key', 'sandbox');
    expect(fx.providerId).toBe('currencycloud-fx');
  });

  it('should initialize Cashfree Settlement Connector', () => {
    const cashfree = new CashfreeSettlementConnector('app', 'secret', ConnectorEnvironment.SANDBOX);
    expect(cashfree.connectorId).toBe('cashfree-inr-connector');
    expect(cashfree.getSupportedCapabilities()).toContain('INR_PAYOUT');
  });
});
