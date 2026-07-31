import { ProviderRegistry } from '@payment-os/provider-registry';
import { IQuoteProvider, FXQuote } from '@payment-os/provider-framework';

export class QuoteEngine {
  constructor(private registry: ProviderRegistry) {}

  public async getBestQuote(sourceCurrency: string, destinationCurrency: string, amount: number): Promise<FXQuote> {
    const fxProviders = this.registry.getProvidersByType('FX') as unknown as IQuoteProvider[];
    
    if (fxProviders.length === 0) {
      throw new Error('No FX providers available');
    }

    // In production, ask all providers for quotes and select the best rate
    // Mocking a single provider returning a quote
    return {
      quoteId: `qt-${crypto.randomUUID()}`,
      exchangeRate: 1.05,
      guaranteedUntil: new Date(Date.now() + 600000), // 10 minutes
      providerId: 'provider-fx-default'
    };
  }
}
