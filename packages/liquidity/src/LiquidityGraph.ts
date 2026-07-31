import { LiquidityPool, PoolLevel } from './LiquidityModels';

export class LiquidityGraph {
  private pools: Map<string, LiquidityPool> = new Map();

  registerPool(pool: LiquidityPool): void {
    this.pools.set(pool.id, pool);
  }

  getPool(id: string): LiquidityPool | undefined {
    return this.pools.get(id);
  }

  /**
   * Traverse up the graph to find emergency or fallback liquidity
   */
  findFallbackPool(startPoolId: string, neededAmount: number): LiquidityPool | null {
    let currentPool = this.pools.get(startPoolId);
    
    while (currentPool) {
      if (currentPool.available >= neededAmount) {
        return currentPool;
      }
      if (!currentPool.parentPoolId) break;
      currentPool = this.pools.get(currentPool.parentPoolId);
    }
    
    return null;
  }

  getAllPools(): LiquidityPool[] {
    return Array.from(this.pools.values());
  }
}
