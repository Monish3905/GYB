import { IQuoteProvider, Quote } from '../interfaces/IQuoteProvider';
import { ProviderRegistry } from '../registry/ProviderRegistry';

export class QuoteEngine {
  constructor(private registry: ProviderRegistry, private internalQuoteProvider: IQuoteProvider) {}

  /**
   * For every payment generate quotes from:
   * Internal Rail, Solana, Base, Polygon, etc.
   * Every quote returns Settlement Fee, Gas Fee, FX Cost, Liquidity Cost, Estimated Time, etc.
   */
  async generateQuotes(params: {
    fromCurrency: string;
    toCurrency: string;
    amount: string;
    senderCountry: string;
    recipientCountry: string;
  }): Promise<Quote[]> {
    const quotes: Quote[] = [];

    // 1. Get internal rail quote
    try {
      const internalQuote = await this.internalQuoteProvider.generateQuote(params);
      quotes.push(internalQuote);
    } catch (err) {
      console.warn("Internal quote failed", err);
    }

    // 2. Iterate through blockchain providers in registry
    // In a real implementation, the QuoteEngine would query each provider's IGasOracle, Liquidity, etc.
    const providers = this.registry.getAvailableProviders();
    for (const name of providers) {
      const provider = this.registry.getProvider(name);
      
      // Stub: Build a quote from the provider's capabilities and current state
      if (provider.supportsAsset(params.toCurrency) || provider.supportsAsset(params.fromCurrency)) {
        // mock fetching oracle info
        quotes.push({
          provider: name,
          settlementFee: "0",
          gasFee: "0.01",
          fxCost: "0.05",
          liquidityCost: "0",
          estimatedTime: provider.capabilities().settlementSpeed,
          successProbability: 0.99,
          complianceStatus: "pending",
          riskScore: 10,
          expectedProfit: "0"
        });
      }
    }

    // Sort by optimal criteria (e.g. lowest combined cost)
    quotes.sort((a, b) => {
      const aCost = parseFloat(a.gasFee) + parseFloat(a.fxCost) + parseFloat(a.settlementFee);
      const bCost = parseFloat(b.gasFee) + parseFloat(b.fxCost) + parseFloat(b.settlementFee);
      return aCost - bCost;
    });

    return quotes;
  }
}
