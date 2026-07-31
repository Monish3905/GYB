export interface Quote {
  provider: string;
  settlementFee: string;
  gasFee: string;
  fxCost: string;
  liquidityCost: string;
  estimatedTime: string;
  successProbability: number;
  complianceStatus: string;
  riskScore: number;
  expectedProfit: string;
}

export interface IQuoteProvider {
  /** Generate a standardized quote for moving value */
  generateQuote(params: {
    fromCurrency: string;
    toCurrency: string;
    amount: string;
    senderCountry: string;
    recipientCountry: string;
  }): Promise<Quote>;
}
