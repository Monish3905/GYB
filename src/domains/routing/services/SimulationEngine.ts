import { CostEngine } from './CostEngine';
import { Decimal } from '../../../shared/types';
import { Route } from '../models/RoutingModels';

export interface SimulationRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: Decimal;
  senderCountry: string;
  recipientCountry: string;
}

export interface SimulationResult {
  route: Route;
  expectedProfitUSD: Decimal;
  score: number;
}

export class SimulationEngine {
  constructor(private costEngine: CostEngine) {}

  /**
   * Generates every possible payment route (Internal, Solana, SWIFT, etc.)
   * and uses the CostEngine to evaluate their viability entirely in memory.
   */
  async simulateAllRoutes(request: SimulationRequest): Promise<SimulationResult[]> {
    const simulations: SimulationResult[] = [];

    // 1. Simulate Internal Rail
    simulations.push(this.simulateInternalRail(request));

    // 2. Simulate Solana Rail
    simulations.push(this.simulateSolanaRail(request));

    // 3. Simulate SWIFT Rail
    simulations.push(this.simulateSwiftRail(request));

    // Filter out invalid routes and sort by score descending
    return simulations
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  private simulateInternalRail(request: SimulationRequest): SimulationResult {
    const costOutputs = this.costEngine.calculateCosts({
      gasFeeUSD: new Decimal(0),
      bridgeFeeUSD: new Decimal(0),
      fxSpreadPercentage: new Decimal(0.5), // 0.5% internal FX spread
      treasuryCostUSD: new Decimal(0.10), // Amortized cost of running treasury
      settlementFeeUSD: new Decimal(0),
      complianceCostUSD: new Decimal(0.50),
      riskCostUSD: new Decimal(0),
      principalAmount: request.amount
    });

    return {
      route: {
        name: 'Internal_Netting',
        provider: 'InternalRailProvider',
        totalCost: costOutputs.totalCostUSD,
        costPercentage: costOutputs.costPercentage,
        recipientAmount: request.amount, // Simplified
        fees: {
          fxSpread: new Decimal(0.5),
          gas: new Decimal(0),
          bridgeFee: new Decimal(0),
          bankFee: new Decimal(0),
          complianceFee: new Decimal(0.50),
          settlement: new Decimal(0)
        },
        settlementTime: 'instant',
        confidence: 'very_high'
      },
      expectedProfitUSD: costOutputs.expectedProfitUSD,
      score: costOutputs.optimalRouteScore
    };
  }

  private simulateSolanaRail(request: SimulationRequest): SimulationResult {
    const costOutputs = this.costEngine.calculateCosts({
      gasFeeUSD: new Decimal(0.005), // Half a cent on Solana
      bridgeFeeUSD: new Decimal(0),
      fxSpreadPercentage: new Decimal(0.2), // Tighter crypto spread
      treasuryCostUSD: new Decimal(0), 
      settlementFeeUSD: new Decimal(0.10),
      complianceCostUSD: new Decimal(0.50),
      riskCostUSD: new Decimal(0.20), // Slight crypto risk premium
      principalAmount: request.amount
    });

    return {
      route: {
        name: 'Solana_USDC',
        provider: 'SolanaProvider',
        totalCost: costOutputs.totalCostUSD,
        costPercentage: costOutputs.costPercentage,
        recipientAmount: request.amount,
        fees: {
          fxSpread: new Decimal(0.2),
          gas: new Decimal(0.005),
          bridgeFee: new Decimal(0),
          bankFee: new Decimal(0),
          complianceFee: new Decimal(0.50),
          settlement: new Decimal(0.10)
        },
        settlementTime: '13 seconds',
        confidence: 'high'
      },
      expectedProfitUSD: costOutputs.expectedProfitUSD,
      score: costOutputs.optimalRouteScore
    };
  }

  private simulateSwiftRail(request: SimulationRequest): SimulationResult {
    const costOutputs = this.costEngine.calculateCosts({
      gasFeeUSD: new Decimal(0),
      bridgeFeeUSD: new Decimal(0),
      fxSpreadPercentage: new Decimal(1.5), // High bank spread
      treasuryCostUSD: new Decimal(0), 
      settlementFeeUSD: new Decimal(25), // Flat SWIFT fee
      complianceCostUSD: new Decimal(2.00), // Heavy manual compliance
      riskCostUSD: new Decimal(0), 
      principalAmount: request.amount
    });

    return {
      route: {
        name: 'SWIFT_Wire',
        provider: 'SwiftProvider',
        totalCost: costOutputs.totalCostUSD,
        costPercentage: costOutputs.costPercentage,
        recipientAmount: request.amount,
        fees: {
          fxSpread: new Decimal(1.5),
          gas: new Decimal(0),
          bridgeFee: new Decimal(0),
          bankFee: new Decimal(25),
          complianceFee: new Decimal(2.00),
          settlement: new Decimal(25)
        },
        settlementTime: '3-5 days',
        confidence: 'medium'
      },
      expectedProfitUSD: costOutputs.expectedProfitUSD,
      score: costOutputs.optimalRouteScore
    };
  }
}
