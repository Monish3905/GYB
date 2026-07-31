import { ProviderRegistry } from '@payment-os/provider-registry';
import { IExecutionProvider } from '@payment-os/provider-framework';

export class MultiRailRouter {
  constructor(private registry: ProviderRegistry) {}

  public async selectProvider(
    sourceCurrency: string,
    destinationCurrency: string,
    amount: number
  ): Promise<IExecutionProvider> {
    const providers = this.registry.getAllProviders();
    if (providers.length === 0) {
      throw new Error('No execution providers available');
    }

    // In a production system, this would evaluate capabilities, health, rates, and limits.
    // For now, simply return the first available provider that is active.
    // E.g., if we are routing USD to EUR via Solana, it returns solana-provider.
    return providers[0];
  }
}
