import { RouteCandidate } from '@payment-os/routing';
import { IProvider, ProviderQuote } from '@payment-os/providers';
import { ProviderRegistry } from '@payment-os/registry';

export interface RouteSimulationResult {
  candidate: RouteCandidate;
  totalCostUSD: number;
  expectedProfitUSD: number;
  totalTimeMs: number;
  successProbability: number;
  isViable: boolean;
  failureReason?: string;
  liquidityImpact: number;
  treasuryImpact: number;
  riskScore: number;
  complianceScore: number;
}

export class SimulationEngine {
  constructor(private registry: ProviderRegistry) {}

  async simulate(candidate: RouteCandidate, principalAmountUSD: number): Promise<RouteSimulationResult> {
    let totalCostUSD = 0;
    let totalTimeMs = 0;
    let compoundProbability = 1.0;
    let totalRisk = 0;

    for (const hop of candidate.hops) {
      const provider = this.registry.getProvider(hop.providerId);
      if (!provider) {
        return this.failSimulation(candidate, `Provider ${hop.providerId} not found`);
      }

      const quote = await provider.quote(hop.fromAsset, hop.toAsset, principalAmountUSD);
      
      if (quote.complianceStatus === 'fail') {
        return this.failSimulation(candidate, `Compliance failed at hop ${hop.providerId}`);
      }

      totalCostUSD += quote.gasFeeUSD + quote.bridgeFeeUSD + quote.fxSpread + quote.settlementFeeUSD;
      totalTimeMs += quote.estimatedTimeMs;
      compoundProbability *= quote.successProbability;
      totalRisk += quote.riskScore;
    }

    // Assume we charge 1% fee on principal
    const revenue = principalAmountUSD * 0.01;
    const expectedProfitUSD = revenue - totalCostUSD;

    return {
      candidate,
      totalCostUSD,
      expectedProfitUSD,
      totalTimeMs,
      successProbability: compoundProbability,
      isViable: true,
      liquidityImpact: principalAmountUSD, // simplistic
      treasuryImpact: totalCostUSD,
      riskScore: totalRisk / candidate.hops.length,
      complianceScore: 100 // assuming pass
    };
  }

  private failSimulation(candidate: RouteCandidate, reason: string): RouteSimulationResult {
    return {
      candidate,
      totalCostUSD: 0,
      expectedProfitUSD: 0,
      totalTimeMs: 0,
      successProbability: 0,
      isViable: false,
      failureReason: reason,
      liquidityImpact: 0,
      treasuryImpact: 0,
      riskScore: 100,
      complianceScore: 0
    };
  }
}
