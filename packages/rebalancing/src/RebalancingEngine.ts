import { IEventBus, ReserveThresholdExceededEvent, TreasuryRebalancedEvent } from '@payment-os/events';
import { LiquidityGraph } from '@payment-os/liquidity';

export class RebalancingEngine {
  constructor(
    private graph: LiquidityGraph,
    private eventBus: IEventBus
  ) {
    this.eventBus.subscribe<ReserveThresholdExceededEvent>('ReserveThresholdExceeded', async (event) => {
      await this.handleEmergencyRebalance(event);
    });
  }

  async handleEmergencyRebalance(event: ReserveThresholdExceededEvent): Promise<void> {
    const pool = this.graph.getPool(event.poolId);
    if (!pool || !pool.parentPoolId) return;

    const parentPool = this.graph.getPool(pool.parentPoolId);
    if (!parentPool) return;

    // We need to restore it to minimum reserve ratio
    const totalAssets = pool.available + pool.reserved + pool.committed + pool.locked;
    const targetAvailable = totalAssets * event.minimumReserveRatio;
    const deficit = targetAvailable - pool.available;

    if (deficit > 0 && parentPool.available >= deficit) {
      // Execute Rebalance
      parentPool.available -= deficit;
      pool.available += deficit;

      await this.eventBus.publish<TreasuryRebalancedEvent>({
        eventId: `evt_${Date.now()}`,
        timestamp: new Date(),
        eventType: 'TreasuryRebalanced',
        sourcePoolId: parentPool.id,
        targetPoolId: pool.id,
        currency: pool.currency,
        amount: deficit,
        reason: 'Emergency reserve threshold exceeded'
      });
    }
  }
}
