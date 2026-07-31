export interface ProviderCapabilities {
  supportedCountries: string[];
  supportedAssets: string[];
  supportedStablecoins: string[];
  settlementSpeed: 'instant' | 'minutes' | 'hours' | 'days';
  liquidity: 'high' | 'medium' | 'low';
  maxAmount: number;
  minAmount: number;
  supportsBatching: boolean;
  supportsStreaming: boolean;
  supportsBridging: boolean;
  supportsSwaps: boolean;
}

export interface ProviderQuote {
  settlementFeeUSD: number;
  gasFeeUSD: number;
  fxSpread: number;
  bridgeFeeUSD: number;
  liquidityCostUSD: number;
  treasuryCostUSD: number;
  estimatedTimeMs: number;
  successProbability: number;
  complianceStatus: 'pass' | 'review' | 'fail';
  riskScore: number;
}

export interface IProvider {
  id: string;
  type: 'blockchain' | 'bank' | 'internal' | 'mobile_money';
  
  getCapabilities(): ProviderCapabilities;
  quote(fromAsset: string, toAsset: string, amount: number): Promise<ProviderQuote>;
}
