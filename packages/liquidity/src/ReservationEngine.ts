import { IEventBus, LiquidityReservedEvent, LiquidityCommittedEvent, LiquidityRolledBackEvent } from '@payment-os/events';
import { LiquidityGraph } from './LiquidityGraph';
import { LiquidityReservation, LiquidityPolicy } from './LiquidityModels';

export class ReservationEngine {
  private reservations: Map<string, LiquidityReservation> = new Map();

  constructor(
    private graph: LiquidityGraph,
    private eventBus: IEventBus
  ) {}

  async reserve(
    transactionId: string, 
    poolId: string, 
    amount: number, 
    policy: LiquidityPolicy = 'highest_availability',
    reason: string = 'Standard Settlement'
  ): Promise<LiquidityReservation> {
    let pool = this.graph.getPool(poolId);
    if (!pool) throw new Error(`Pool ${poolId} not found`);

    // Policy check: If lowest_cost, we must not use emergency pools
    if (pool.available < amount) {
      if (policy === 'emergency_mode') {
        pool = this.graph.findFallbackPool(poolId, amount) || undefined;
        if (!pool) throw new Error(`Insufficient liquidity across entire graph for ${poolId}`);
      } else {
        throw new Error(`Insufficient liquidity in pool ${poolId}`);
      }
    }

    // Mutate state
    pool.available -= amount;
    pool.reserved += amount;

    const reservationId = `res_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expiration = new Date(Date.now() + 1000 * 60 * 5); // 5 mins

    const reservation: LiquidityReservation = {
      reservationId,
      transactionId,
      poolId: pool.id,
      currency: pool.currency,
      amount,
      state: 'reserved',
      timestamp: new Date(),
      expiration,
      reason
    };

    this.reservations.set(reservationId, reservation);

    await this.eventBus.publish<LiquidityReservedEvent>({
      eventId: `evt_${Date.now()}`,
      timestamp: new Date(),
      eventType: 'LiquidityReserved',
      reservationId,
      transactionId,
      poolId: pool.id,
      currency: pool.currency,
      amount
    });

    return reservation;
  }

  async commit(reservationId: string): Promise<void> {
    const res = this.reservations.get(reservationId);
    if (!res || res.state !== 'reserved') throw new Error('Invalid reservation for commit');

    const pool = this.graph.getPool(res.poolId);
    if (!pool) throw new Error('Pool not found');

    pool.reserved -= res.amount;
    pool.committed += res.amount;
    res.state = 'committed';

    await this.eventBus.publish<LiquidityCommittedEvent>({
      eventId: `evt_${Date.now()}`,
      timestamp: new Date(),
      eventType: 'LiquidityCommitted',
      reservationId,
      transactionId: res.transactionId
    });
  }

  async rollback(reservationId: string, reason: string): Promise<void> {
    const res = this.reservations.get(reservationId);
    if (!res || res.state !== 'reserved') throw new Error('Invalid reservation for rollback');

    const pool = this.graph.getPool(res.poolId);
    if (!pool) throw new Error('Pool not found');

    pool.reserved -= res.amount;
    pool.available += res.amount;
    res.state = 'rolled_back';

    await this.eventBus.publish<LiquidityRolledBackEvent>({
      eventId: `evt_${Date.now()}`,
      timestamp: new Date(),
      eventType: 'LiquidityRolledBack',
      reservationId,
      transactionId: res.transactionId,
      reason
    });
  }
}
