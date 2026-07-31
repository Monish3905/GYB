import { IChainProvider } from '../interfaces/IChainProvider';

export class ProviderRegistry {
  private providers: Map<string, IChainProvider> = new Map();

  /** Register a new blockchain provider plugin */
  registerProvider(name: string, provider: IChainProvider): void {
    if (this.providers.has(name)) {
      throw new Error(`Provider ${name} is already registered`);
    }
    this.providers.set(name, provider);
  }

  /** Retrieve a provider by name */
  getProvider(name: string): IChainProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not found in registry`);
    }
    return provider;
  }

  /** Get all available providers that support a specific asset */
  getProvidersForAsset(asset: string): IChainProvider[] {
    const supported: IChainProvider[] = [];
    for (const provider of this.providers.values()) {
      if (provider.supportsAsset(asset)) {
        supported.push(provider);
      }
    }
    return supported;
  }

  /** Perform health checks on all registered providers */
  async checkAllHealth(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};
    for (const [name, provider] of this.providers.entries()) {
      try {
        status[name] = await provider.health();
      } catch (err) {
        status[name] = false;
      }
    }
    return status;
  }

  /** Return list of all registered provider names ordered by capability logic if needed */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
