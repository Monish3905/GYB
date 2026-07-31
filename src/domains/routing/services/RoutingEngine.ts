import { Decimal } from '../../../shared/types';
import { Route } from '../models/RoutingModels';
import { ISettlementProvider } from '../../settlement/providers/ISettlementProvider';
import { TreasuryService } from '../../treasury/services/TreasuryService';

export interface RouteRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: Decimal;
  senderCountry: string;
  recipientCountry: string;
}

export class RoutingEngine {
  constructor(
    private providers: ISettlementProvider[],
    private treasury: TreasuryService
  ) {}

  /**
   * Core routing intelligence: Simulates all possible routes to find the absolute optimal path.
   */
  async findOptimalRoute(request: RouteRequest): Promise<Route> {
    const candidates = await this.simulateAllRoutes(request);
    
    if (candidates.length === 0) {
      throw new Error(`No available routes for ${request.fromCurrency} -> ${request.toCurrency}`);
    }

    // Sort primarily by totalCost (lowest first), then by settlement speed if costs are similar
    candidates.sort((a, b) => {
      const costDiff = a.totalCost.compareTo(b.totalCost);
      if (costDiff !== 0) return costDiff;
      
      // Fallback: prefer high confidence
      const confidenceRank = { 'very_high': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return confidenceRank[b.confidence] - confidenceRank[a.confidence];
    });

    return candidates[0]; // The optimal route
  }

  /**
   * Simulates cost, time, and success probability for all available rails.
   */
  private async simulateAllRoutes(request: RouteRequest): Promise<Route[]> {
    const routes: Route[] = [];

    // 1. Evaluate Internal Rail (Netting via Treasury)
    const canUseInternal = await this.treasury.checkLiquidity(request.recipientCountry, request.toCurrency, request.amount); // Simple FX assumption
    if (canUseInternal) {
      routes.push(this.buildInternalRoute(request));
    }

    // 2. Evaluate External Providers (Solana, Base, SWIFT, Mocks)
    for (const provider of this.providers) {
      const isSupported = await provider.supportsRoute(request.fromCurrency, request.toCurrency);
      if (!isSupported) continue;

      const canSettle = await provider.canSettle(request.amount, request.fromCurrency);
      if (!canSettle) continue;

      try {
        const feeEstimate = await provider.estimateFee(request.amount, request.fromCurrency);
        const timeEstimate = await provider.estimateSettlementTime(request.amount);
        
        // Mock FX assumption for now: 1:1 if same currency, otherwise needs FX integration
        // (Cost Engine would ideally provide the exact FX spread here)
        const fxSpread = new Decimal(0); 

        const totalCost = feeEstimate.estimatedFeeUSD.add(fxSpread);

        routes.push({
          name: `${provider.constructor.name}_rail`,
          provider: provider.constructor.name,
          totalCost: totalCost,
          costPercentage: totalCost.divide(request.amount).multiply(new Decimal(100)),
          recipientAmount: request.amount, // Simplified, assume FX applied elsewhere
          fees: {
            fxSpread,
            gas: feeEstimate.estimatedFeeUSD,
            bridgeFee: new Decimal(0),
            bankFee: new Decimal(0),
            complianceFee: new Decimal(1), // Amortized compliance cost
            settlement: new Decimal(0),
          },
          settlementTime: timeEstimate,
          confidence: feeEstimate.confidence
        });
      } catch (err) {
        // Provider estimation failed, skip this route
        console.warn(`Route estimation failed for provider`, err);
      }
    }

    return routes;
  }

  private buildInternalRoute(request: RouteRequest): Route {
    // Internal netting costs virtually nothing (just FX spread + amortized compliance)
    const fxSpread = new Decimal(0.50); // Mock 50 cents spread
    const complianceFee = new Decimal(0.50); 
    const totalCost = fxSpread.add(complianceFee);

    return {
      name: 'internal_netting',
      provider: 'InternalRailProvider',
      totalCost,
      costPercentage: totalCost.divide(request.amount).multiply(new Decimal(100)),
      recipientAmount: request.amount,
      fees: {
        fxSpread,
        gas: new Decimal(0),
        bridgeFee: new Decimal(0),
        bankFee: new Decimal(0),
        complianceFee,
        settlement: new Decimal(0),
      },
      settlementTime: 'instant',
      confidence: 'very_high'
    };
  }
}
