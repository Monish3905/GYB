import { Decimal } from '../../../shared/types';

export interface CostInputs {
  gasFeeUSD: Decimal;
  bridgeFeeUSD: Decimal;
  fxSpreadPercentage: Decimal;
  treasuryCostUSD: Decimal;
  settlementFeeUSD: Decimal;
  complianceCostUSD: Decimal;
  riskCostUSD: Decimal;
  principalAmount: Decimal;
}

export interface CostOutputs {
  totalCostUSD: Decimal;
  expectedProfitUSD: Decimal;
  optimalRouteScore: number;
  costPercentage: Decimal;
}

export class CostEngine {
  /**
   * Deterministic cost calculations for a given route simulation
   */
  calculateCosts(inputs: CostInputs): CostOutputs {
    // 1. Calculate absolute FX spread cost
    const fxCostUSD = inputs.principalAmount.multiply(inputs.fxSpreadPercentage).divide(new Decimal(100));

    // 2. Sum total direct costs
    const totalCostUSD = inputs.gasFeeUSD
      .add(inputs.bridgeFeeUSD)
      .add(fxCostUSD)
      .add(inputs.treasuryCostUSD)
      .add(inputs.settlementFeeUSD)
      .add(inputs.complianceCostUSD)
      .add(inputs.riskCostUSD);

    // 3. Expected profit (Assuming we charge the user a fixed 1% fee on the principal)
    // In a real system, the revenue model would be injected.
    const revenueUSD = inputs.principalAmount.multiply(new Decimal(1)).divide(new Decimal(100)); // 1% fee
    const expectedProfitUSD = revenueUSD.subtract(totalCostUSD);

    // 4. Cost Percentage
    const costPercentage = totalCostUSD.divide(inputs.principalAmount).multiply(new Decimal(100));

    // 5. Route Score (Lower cost = higher score. Factor in risk)
    // Max score is 100. Deduct points for high cost percentage and risk.
    let score = 100 - (costPercentage.toNumber() * 10) - (inputs.riskCostUSD.toNumber() * 5);
    if (score < 0) score = 0;

    return {
      totalCostUSD,
      expectedProfitUSD,
      optimalRouteScore: score,
      costPercentage
    };
  }
}
