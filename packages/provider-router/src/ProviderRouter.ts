import { IExecutionProvider } from '@payment-os/execution-engine';

export class ProviderRouter {
  private providers: Map<string, IExecutionProvider> = new Map();

  public registerProvider(provider: IExecutionProvider): void {
    this.providers.set(provider.providerId, provider);
  }

  public getProvider(providerId: string): IExecutionProvider | undefined {
    return this.providers.get(providerId);
  }

  public async findBestProvider(
    amount: number,
    currency: string,
    country: string,
    policyType: string
  ): Promise<IExecutionProvider | null> {
    
    let bestProvider: IExecutionProvider | null = null;
    let bestScore = -1;

    for (const provider of this.providers.values()) {
      const caps = await provider.getCapabilities();

      if (caps.currentHealth !== 'HEALTHY') continue;
      if (!caps.supportedCountries.includes(country)) continue;
      if (!caps.supportedCurrencies.includes(currency)) continue;
      if (amount < caps.minimumAmount || amount > caps.maximumAmount) continue;
      if (caps.currentCapacity < amount || caps.currentLiquidity < amount) continue;

      let score = 0;
      if (policyType === 'FASTEST') {
        score = 100000 - caps.averageLatencyMs; // lower latency = higher score
      } else if (policyType === 'RELIABLE') {
        score = caps.successRate;
      } else {
        score = caps.priority;
      }

      if (score > bestScore) {
        bestScore = score;
        bestProvider = provider;
      }
    }

    return bestProvider;
  }
}
