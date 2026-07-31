export interface TreasuryHealth {
  utilizationPercentage: number;
  rebalanceRequired: boolean;
  recommendedRebalanceAmount?: number;
  recommendedRebalanceRoute?: string;
  costOfCapitalPercentage: number;
}

export class TreasuryIntelligenceEngine {
  getTreasuryHealth(countryCode: string, currency: string): TreasuryHealth {
    if (countryCode === 'IN' && currency === 'INR') {
      return {
        utilizationPercentage: 0.95, // High usage
        rebalanceRequired: true,
        recommendedRebalanceAmount: 200000,
        recommendedRebalanceRoute: 'Solana_USDC_to_INR',
        costOfCapitalPercentage: 0.05
      };
    }
    return {
      utilizationPercentage: 0.10,
      rebalanceRequired: false,
      costOfCapitalPercentage: 0.01
    };
  }
}
