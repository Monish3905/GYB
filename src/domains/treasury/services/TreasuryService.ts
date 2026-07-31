import { Decimal } from '../../../shared/types';
import { CountryPool, NettingCycle } from '../models/TreasuryModels';

export interface ITreasuryRepository {
  getPool(countryCode: string, currency: string): Promise<CountryPool | null>;
  updatePoolBalances(poolId: string, balanceDelta: Decimal, inflowDelta: Decimal, outflowDelta: Decimal): Promise<CountryPool>;
  createNettingCycle(cycle: Omit<NettingCycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<NettingCycle>;
  updateNettingCycleStatus(id: string, status: NettingCycle['settlementStatus'], actualCost?: Decimal): Promise<NettingCycle>;
}

export class TreasuryService {
  constructor(private repo: ITreasuryRepository) {}

  /**
   * Check if a pool has enough liquidity to fulfill an internal netting transfer
   */
  async checkLiquidity(countryCode: string, currency: string, requiredAmount: Decimal): Promise<boolean> {
    const pool = await this.repo.getPool(countryCode, currency);
    if (!pool || pool.poolStatus !== 'active') return false;

    // Must have balance above minThreshold after this transfer
    const postTransferBalance = pool.balance.subtract(requiredAmount);
    return postTransferBalance.compareTo(pool.minThreshold) >= 0;
  }

  /**
   * Adjust pool balances after a transfer has settled via internal netting
   */
  async recordTransfer(params: {
    fromCountryCode: string;
    fromCurrency: string;
    fromAmount: Decimal;
    toCountryCode: string;
    toCurrency: string;
    toAmount: Decimal;
  }): Promise<void> {
    const fromPool = await this.repo.getPool(params.fromCountryCode, params.fromCurrency);
    const toPool = await this.repo.getPool(params.toCountryCode, params.toCurrency);

    if (!fromPool || !toPool) {
      throw new Error('Pool not found');
    }

    // Money leaving the sender country -> Inflow to the sending pool (users give money to the pool)
    await this.repo.updatePoolBalances(fromPool.id, params.fromAmount, params.fromAmount, new Decimal(0));

    // Money arriving in receiver country -> Outflow from the receiving pool (pool gives money to user)
    // Note: Outflow decreases the balance. The updatePoolBalances takes a balanceDelta.
    const toBalanceDelta = new Decimal(-params.toAmount.toNumber());
    await this.repo.updatePoolBalances(toPool.id, toBalanceDelta, new Decimal(0), params.toAmount);
  }

  /**
   * Evaluates if netting cycle should be triggered based on time or thresholds
   */
  async triggerNettingCycle(fromCountry: string, fromCurrency: string, toCountry: string, toCurrency: string): Promise<NettingCycle | null> {
    // In real implementation, this reads 24h inflows/outflows, calculates net exposure,
    // and creates a settlement cycle to move real money (e.g., via Solana or SWIFT) to rebalance.
    // Stub implementation:
    return null;
  }
}
