import { IProvider } from '@payment-os/providers';

export class ProviderRegistry {
  private providers: Map<string, IProvider> = new Map();

  register(provider: IProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): IProvider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): IProvider[] {
    return Array.from(this.providers.values());
  }

  getProvidersByAsset(asset: string): IProvider[] {
    return this.getAllProviders().filter(p => 
      p.getCapabilities().supportedAssets.includes(asset) ||
      p.getCapabilities().supportedStablecoins.includes(asset)
    );
  }

  getProvidersForCorridor(fromCountry: string, toCountry: string): IProvider[] {
    return this.getAllProviders().filter(p => 
      p.getCapabilities().supportedCountries.includes(fromCountry) &&
      p.getCapabilities().supportedCountries.includes(toCountry)
    );
  }
}
