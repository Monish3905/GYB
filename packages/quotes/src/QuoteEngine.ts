import { IProvider, ProviderQuote } from '@payment-os/providers';
import { ProviderRegistry } from '@payment-os/registry';

export class QuoteEngine {
  constructor(private registry: ProviderRegistry) {}

  async getQuote(providerId: string, fromAsset: string, toAsset: string, amount: number): Promise<ProviderQuote> {
    const provider = this.registry.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    // In a real system, this hits the provider API or an internal pricing model.
    return await provider.quote(fromAsset, toAsset, amount);
  }
}
