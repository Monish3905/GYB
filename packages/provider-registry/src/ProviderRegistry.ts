import { IExecutionProvider } from '@payment-os/provider-framework';

export class ProviderRegistry {
  private providers: Map<string, IExecutionProvider> = new Map();

  public register(provider: IExecutionProvider): void {
    this.providers.set(provider.getProviderId(), provider);
  }

  public getProvider(providerId: string): IExecutionProvider | undefined {
    return this.providers.get(providerId);
  }

  public getAllProviders(): IExecutionProvider[] {
    return Array.from(this.providers.values());
  }

  public getProvidersByType(type: string): IExecutionProvider[] {
    return this.getAllProviders().filter(p => p.getProviderType() === type);
  }
}
