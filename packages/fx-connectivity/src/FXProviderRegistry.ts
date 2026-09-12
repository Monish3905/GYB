export interface FXQuote {
  quoteId: string;
  sourceCurrency: string;
  destinationCurrency: string;
  sourceAmount: number;
  destinationAmount: number;
  rate: number;
  spread: number;
  fees: number;
  providerQuoteId: string;
  status: 'QUOTED' | 'LOCKED' | 'EXECUTED' | 'EXPIRED' | 'FAILED';
  expiresAt: number;
  createdAt: number;
}

export interface FXExecution {
  executionId: string;
  quoteId: string;
  railTransactionId: string;
  executedRate: number;
  sourceAmount: number;
  destinationAmount: number;
  providerExecutionId: string;
  status: 'EXECUTED' | 'CONFIRMED' | 'FAILED' | 'REVERSED';
}

export interface FXProvider {
  providerId: string;
  quote(sourceCurrency: string, destCurrency: string, amount: number): Promise<FXQuote>;
  lock(quoteId: string): Promise<FXQuote>;
  execute(quoteId: string, railTransactionId: string): Promise<FXExecution>;
  getExecutionStatus(executionId: string): Promise<string>;
  reconcile(executionId: string): Promise<boolean>;
}

export class FXProviderRegistry {
  private providers: Map<string, FXProvider> = new Map();

  public register(provider: FXProvider): void {
    this.providers.set(provider.providerId, provider);
  }

  public getProvider(id: string): FXProvider | undefined {
    return this.providers.get(id);
  }

  public getDefaultProvider(): FXProvider | undefined {
    return this.providers.values().next().value;
  }
}
