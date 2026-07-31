import { ProviderQuote } from '@payment-os/providers';

export interface DeterministicCost {
  totalCostUSD: number;
  expectedProfitUSD: number;
  internalCostUSD: number;
}

export class CostEngine {
  /**
   * Deterministically calculate absolute cost components based on quotes
   * Ensures our profit margin calculation is mathematically sound
   */
  calculateCost(quote: ProviderQuote, principalAmountUSD: number): DeterministicCost {
    const internalCostUSD = 
      quote.settlementFeeUSD + 
      quote.gasFeeUSD + 
      quote.fxSpread + 
      quote.bridgeFeeUSD + 
      quote.liquidityCostUSD + 
      quote.treasuryCostUSD;

    // Fixed pricing model: charge customer 1.5% fee
    const customerFee = principalAmountUSD * 0.015;
    
    // Profit = Customer Fee - Internal Cost
    const expectedProfitUSD = customerFee - internalCostUSD;

    return {
      totalCostUSD: internalCostUSD,
      expectedProfitUSD,
      internalCostUSD
    };
  }
}
