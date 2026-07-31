import { LiquidityGraph, LiquidityPool } from '@payment-os/liquidity';

export interface TreasurySnapshot {
  poolId: string;
  currency: string;
  totalAssets: number;
  availableAssets: number;
  reservedAssets: number;
  committedAssets: number;
  utilizationRatio: number;
  timestamp: Date;
}

export class TreasuryEngine {
  constructor(private graph: LiquidityGraph) {}

  getPoolSnapshot(poolId: string): TreasurySnapshot {
    const pool = this.graph.getPool(poolId);
    if (!pool) throw new Error(`Pool ${poolId} not found`);

    const totalAssets = pool.available + pool.reserved + pool.committed + pool.locked;
    const utilizationRatio = totalAssets > 0 ? pool.reserved / totalAssets : 0;

    return {
      poolId: pool.id,
      currency: pool.currency,
      totalAssets,
      availableAssets: pool.available,
      reservedAssets: pool.reserved,
      committedAssets: pool.committed,
      utilizationRatio,
      timestamp: new Date()
    };
  }

  getGlobalSnapshot(currency: string): TreasurySnapshot {
    const pools = this.graph.getAllPools().filter(p => p.currency === currency);
    
    let totalAssets = 0;
    let availableAssets = 0;
    let reservedAssets = 0;
    let committedAssets = 0;

    for (const p of pools) {
      totalAssets += p.available + p.reserved + p.committed + p.locked;
      availableAssets += p.available;
      reservedAssets += p.reserved;
      committedAssets += p.committed;
    }

    const utilizationRatio = totalAssets > 0 ? reservedAssets / totalAssets : 0;

    return {
      poolId: `global_${currency}`,
      currency,
      totalAssets,
      availableAssets,
      reservedAssets,
      committedAssets,
      utilizationRatio,
      timestamp: new Date()
    };
  }
}
