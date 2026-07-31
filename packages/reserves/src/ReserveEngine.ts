import { IEventBus, ReserveThresholdExceededEvent } from '@payment-os/events';
import { LiquidityGraph } from '@payment-os/liquidity';

export interface ReservePolicy {
  poolId: string;
  minimumReserveRatio: number; // e.g. 0.20 (20%)
}

export class ReserveEngine {
  private policies: Map<string, ReservePolicy> = new Map();

  constructor(
    private graph: LiquidityGraph,
    private eventBus: IEventBus
  ) {}

  setPolicy(policy: ReservePolicy): void {
    this.policies.set(policy.poolId, policy);
  }

  async checkReserves(poolId: string): Promise<void> {
    const pool = this.graph.getPool(poolId);
    if (!pool) return;

    const policy = this.policies.get(poolId);
    if (!policy) return;

    const totalAssets = pool.available + pool.reserved + pool.committed + pool.locked;
    if (totalAssets === 0) return;

    const currentReserveRatio = pool.available / totalAssets;

    if (currentReserveRatio < policy.minimumReserveRatio) {
      await this.eventBus.publish<ReserveThresholdExceededEvent>({
        eventId: `evt_${Date.now()}`,
        timestamp: new Date(),
        eventType: 'ReserveThresholdExceeded',
        poolId,
        currentReserveRatio,
        minimumReserveRatio: policy.minimumReserveRatio
      });
    }
  }

  async checkAllReserves(): Promise<void> {
    for (const poolId of this.policies.keys()) {
      await this.checkReserves(poolId);
    }
  }
}
