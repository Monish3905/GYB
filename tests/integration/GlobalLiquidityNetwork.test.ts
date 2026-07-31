import { InMemoryEventBus, TreasuryRebalancedEvent } from '@payment-os/events';
import { LiquidityGraph, ReservationEngine } from '@payment-os/liquidity';
import { TreasuryEngine } from '@payment-os/treasury';
import { ReserveEngine } from '@payment-os/reserves';
import { RebalancingEngine } from '@payment-os/rebalancing';

describe('Global Liquidity Network & Treasury Engine', () => {
  let eventBus: InMemoryEventBus;
  let graph: LiquidityGraph;
  let reservationEngine: ReservationEngine;
  let treasuryEngine: TreasuryEngine;
  let reserveEngine: ReserveEngine;
  let rebalancingEngine: RebalancingEngine;

  beforeEach(() => {
    eventBus = new InMemoryEventBus();
    graph = new LiquidityGraph();
    
    // Build Liquidity Graph
    graph.registerPool({
      id: 'pool_global_usd',
      level: 'global',
      currency: 'USD',
      available: 1000000000, // $1B Global Reserve
      reserved: 0,
      committed: 0,
      locked: 0
    });

    graph.registerPool({
      id: 'pool_us_usd',
      level: 'country',
      countryCode: 'US',
      currency: 'USD',
      available: 1000000, // $1M Local US pool
      reserved: 0,
      committed: 0,
      locked: 0,
      parentPoolId: 'pool_global_usd'
    });

    reservationEngine = new ReservationEngine(graph, eventBus);
    treasuryEngine = new TreasuryEngine(graph);
    reserveEngine = new ReserveEngine(graph, eventBus);
    rebalancingEngine = new RebalancingEngine(graph, eventBus);

    // Set a reserve policy for US pool
    reserveEngine.setPolicy({
      poolId: 'pool_us_usd',
      minimumReserveRatio: 0.20 // 20%
    });
  });

  it('handles 10,000 simultaneous reservations flawlessly', async () => {
    const promises: Promise<any>[] = [];
    
    // Try to reserve $10 10,000 times (Total $100,000)
    for (let i = 0; i < 10000; i++) {
      promises.push(reservationEngine.reserve(`tx_${i}`, 'pool_us_usd', 10));
    }

    await Promise.all(promises);

    const snapshot = treasuryEngine.getPoolSnapshot('pool_us_usd');
    
    expect(snapshot.availableAssets).toBe(1000000 - 100000); // 900,000
    expect(snapshot.reservedAssets).toBe(100000);
    expect(snapshot.totalAssets).toBe(1000000);
  });

  it('processes a massive rollback storm without corrupting state', async () => {
    // 1. Reserve 5,000 times
    const resIds: string[] = [];
    for (let i = 0; i < 5000; i++) {
      const res = await reservationEngine.reserve(`tx_storm_${i}`, 'pool_us_usd', 10);
      resIds.push(res.reservationId);
    }

    let snapshot = treasuryEngine.getPoolSnapshot('pool_us_usd');
    expect(snapshot.availableAssets).toBe(950000);
    expect(snapshot.reservedAssets).toBe(50000);

    // 2. Roll them all back concurrently
    await Promise.all(resIds.map(id => reservationEngine.rollback(id, 'Simulated failure')));

    // 3. Verify exactly 1,000,000 available again
    snapshot = treasuryEngine.getPoolSnapshot('pool_us_usd');
    expect(snapshot.availableAssets).toBe(1000000);
    expect(snapshot.reservedAssets).toBe(0);
  });

  it('triggers emergency pool activation and cross-pool rebalance', async () => {
    // We have $1M in pool_us_usd. Min reserve is 20% ($200k).
    // Let's reserve $850k to drop available below 20%.
    await reservationEngine.reserve('tx_big', 'pool_us_usd', 850000);
    
    // Check reserves. This will publish ReserveThresholdExceededEvent
    // RebalancingEngine listens to it, and should pull funds from Global Pool
    
    // We capture the rebalance event
    let capturedEvent: TreasuryRebalancedEvent | undefined;
    eventBus.subscribe<TreasuryRebalancedEvent>('TreasuryRebalanced', async (e) => {
      capturedEvent = e;
    });

    await reserveEngine.checkAllReserves();

    // Since eventBus is executing via setTimeout(..., 0), we wait a tick
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(capturedEvent).toBeDefined();
    expect(capturedEvent?.sourcePoolId).toBe('pool_global_usd');
    expect(capturedEvent?.targetPoolId).toBe('pool_us_usd');

    // The deficit was 20% of 1,000,000 = 200,000. 
    // Available was 150,000. Deficit = 50,000.
    expect(capturedEvent?.amount).toBe(50000);

    // Verify actual pool state
    const snapshot = treasuryEngine.getPoolSnapshot('pool_us_usd');
    expect(snapshot.availableAssets).toBe(200000); // Back to 20%
    
    const globalSnapshot = treasuryEngine.getPoolSnapshot('pool_global_usd');
    expect(globalSnapshot.availableAssets).toBe(1000000000 - 50000);
  });
});
