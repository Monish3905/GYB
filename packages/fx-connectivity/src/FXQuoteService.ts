import { FXProvider, FXQuote, FXExecution } from './FXProviderRegistry';

/**
 * SandboxFXProvider
 * 
 * Provides deterministic FX quotes for testing.
 * NEVER use sandbox rates for real-money transactions.
 */
export class SandboxFXProvider implements FXProvider {
  providerId = 'sandbox-fx-provider';

  private simulateFailure = false;
  private failureType = '';

  public injectFailure(type: string) { this.simulateFailure = true; this.failureType = type; }
  public resetFailure() { this.simulateFailure = false; this.failureType = ''; }

  async quote(sourceCurrency: string, destCurrency: string, amount: number): Promise<FXQuote> {
    if (this.simulateFailure && this.failureType === 'FX_UNAVAILABLE') {
      throw new Error('Sandbox FX: Service unavailable');
    }

    const rate = this.getSandboxRate(sourceCurrency, destCurrency);
    const destAmount = amount * rate;
    return {
      quoteId: `fxq-${Date.now()}`,
      sourceCurrency,
      destinationCurrency: destCurrency,
      sourceAmount: amount,
      destinationAmount: parseFloat(destAmount.toFixed(4)),
      rate,
      spread: 0.005,
      fees: 2.50,
      providerQuoteId: `sandbox-q-${Date.now()}`,
      status: 'QUOTED',
      expiresAt: Date.now() + 30000, // 30 second expiry
      createdAt: Date.now()
    };
  }

  async lock(quoteId: string): Promise<FXQuote> {
    if (this.simulateFailure && this.failureType === 'FX_LOCK_EXPIRED') {
      throw new Error('Sandbox FX: Quote expired before lock');
    }
    // Return a locked version of the quote
    return {
      quoteId,
      sourceCurrency: 'GBP', destinationCurrency: 'INR',
      sourceAmount: 1000, destinationAmount: 105500,
      rate: 105.5, spread: 0.005, fees: 2.50,
      providerQuoteId: `sandbox-locked-${Date.now()}`,
      status: 'LOCKED',
      expiresAt: Date.now() + 300000, // 5 minute lock
      createdAt: Date.now()
    };
  }

  async execute(quoteId: string, railTransactionId: string): Promise<FXExecution> {
    return {
      executionId: `fxe-${Date.now()}`,
      quoteId,
      railTransactionId,
      executedRate: 105.5,
      sourceAmount: 1000,
      destinationAmount: 105500,
      providerExecutionId: `sandbox-exec-${Date.now()}`,
      status: 'EXECUTED'
    };
  }

  async getExecutionStatus(_executionId: string): Promise<string> { return 'CONFIRMED'; }
  async reconcile(_executionId: string): Promise<boolean> { return true; }

  private getSandboxRate(src: string, dest: string): number {
    // Deterministic sandbox rates — NOT for production use
    if (src === 'GBP' && dest === 'INR') return 105.50;
    if (src === 'USD' && dest === 'INR') return 83.25;
    if (src === 'EUR' && dest === 'INR') return 90.75;
    return 1.0;
  }
}
