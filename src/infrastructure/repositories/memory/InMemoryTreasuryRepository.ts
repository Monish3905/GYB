import { ITreasuryRepository } from '../../../domains/treasury/services/TreasuryService';
import { CountryPool, NettingCycle } from '../../../domains/treasury/models/TreasuryModels';
import { Decimal } from '../../../shared/types';

export class InMemoryTreasuryRepository implements ITreasuryRepository {
  private pools: Map<string, CountryPool> = new Map();
  private cycles: Map<string, NettingCycle> = new Map();

  async getPool(countryCode: string, currency: string): Promise<CountryPool | null> {
    for (const pool of this.pools.values()) {
      if (pool.countryCode === countryCode && pool.currency === currency) {
        return pool;
      }
    }
    return null;
  }

  async createPool(poolData: Omit<CountryPool, 'id' | 'createdAt' | 'updatedAt'>): Promise<CountryPool> {
    const id = `pool_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date();
    const pool: CountryPool = {
      ...poolData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.pools.set(id, pool);
    return pool;
  }

  async updatePoolBalances(poolId: string, balanceDelta: Decimal, inflowDelta: Decimal, outflowDelta: Decimal): Promise<CountryPool> {
    const pool = this.pools.get(poolId);
    if (!pool) throw new Error("Pool not found");

    pool.balance = pool.balance.add(balanceDelta);
    pool.totalInflow24h = pool.totalInflow24h.add(inflowDelta);
    pool.totalOutflow24h = pool.totalOutflow24h.add(outflowDelta);
    pool.updatedAt = new Date();

    return pool;
  }

  async createNettingCycle(cycleData: Omit<NettingCycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<NettingCycle> {
    const id = `cycle_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const cycle: NettingCycle = {
      ...cycleData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cycles.set(id, cycle);
    return cycle;
  }

  async updateNettingCycleStatus(id: string, status: NettingCycle['settlementStatus'], actualCost?: Decimal): Promise<NettingCycle> {
    const cycle = this.cycles.get(id);
    if (!cycle) throw new Error("Netting cycle not found");

    cycle.settlementStatus = status;
    if (actualCost) cycle.actualCost = actualCost;
    
    return cycle;
  }
}
