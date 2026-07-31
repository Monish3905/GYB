import { LiquidityGraph } from '@payment-os/liquidity';

export interface ForecastResult {
  poolId: string;
  predictedOutflow24h: number;
  predictedInflow24h: number;
  expectedShortage: boolean;
}

export class ForecastingEngine {
  constructor(private graph: LiquidityGraph) {}

  generateForecast(poolId: string): ForecastResult {
    const pool = this.graph.getPool(poolId);
    if (!pool) throw new Error('Pool not found');

    // Deterministic stub: assume outflow is 2x reserved and inflow is 0.5x committed
    const predictedOutflow24h = pool.reserved * 2;
    const predictedInflow24h = pool.committed * 0.5;

    const projectedAvailable = pool.available + predictedInflow24h - predictedOutflow24h;

    return {
      poolId,
      predictedOutflow24h,
      predictedInflow24h,
      expectedShortage: projectedAvailable < 0
    };
  }
}
