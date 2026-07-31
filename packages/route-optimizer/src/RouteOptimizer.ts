import { RouteSimulationResult } from '@payment-os/simulation';

export type RoutingPolicy = 'cheapest' | 'fastest' | 'safest' | 'balanced' | 'liquidity-max';

export interface IRouteOptimizerStrategy {
  score(result: RouteSimulationResult): number;
}

export class CheapestStrategy implements IRouteOptimizerStrategy {
  score(result: RouteSimulationResult): number {
    if (!result.isViable) return -1;
    // Higher profit -> higher score
    // Base 100, add profit margin
    return 100 + result.expectedProfitUSD;
  }
}

export class FastestStrategy implements IRouteOptimizerStrategy {
  score(result: RouteSimulationResult): number {
    if (!result.isViable) return -1;
    // Lower time -> higher score (max 100 for instant, drop points for latency)
    const penalty = result.totalTimeMs / 1000; // 1 point per second
    return Math.max(0, 100 - penalty);
  }
}

export class RouteOptimizer {
  private strategies: Map<RoutingPolicy, IRouteOptimizerStrategy> = new Map();

  constructor() {
    this.strategies.set('cheapest', new CheapestStrategy());
    this.strategies.set('fastest', new FastestStrategy());
  }

  rankRoutes(results: RouteSimulationResult[], policy: RoutingPolicy): RouteSimulationResult[] {
    const strategy = this.strategies.get(policy);
    if (!strategy) throw new Error(`Strategy ${policy} not found`);

    // Assign scores
    const scoredResults = results.map(r => ({
      ...r,
      finalScore: strategy.score(r)
    }));

    // Filter viable and sort descending
    return scoredResults
      .filter(r => r.finalScore >= 0)
      .sort((a, b) => (b as any).finalScore - (a as any).finalScore);
  }
}
