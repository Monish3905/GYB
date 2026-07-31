import { Ledger } from '@payment-os/ledger';
import { BalanceProjector } from '@payment-os/ledger-projections';
import { IEventBus } from '@payment-os/events';

export class BalanceEngine {
  constructor(
    private ledger: Ledger,
    private projector: BalanceProjector,
    private eventBus: IEventBus
  ) {}

  public getBalance(accountId: string): number {
    // Computes balance dynamically from all journals
    const allJournals = this.ledger.getAllJournals();
    const balances = this.projector.projectBalances(allJournals);
    return balances.get(accountId) || 0;
  }

  public getPointInTimeBalance(accountId: string, timestamp: Date): number {
    // Filter journals up to the specific point in time
    const allJournals = this.ledger.getAllJournals();
    const pitJournals = allJournals.filter(j => j.timestamp <= timestamp);
    const balances = this.projector.projectBalances(pitJournals);
    return balances.get(accountId) || 0;
  }

  public async broadcastBalances(accountIds: string[]): Promise<void> {
    const allJournals = this.ledger.getAllJournals();
    const balances = this.projector.projectBalances(allJournals);
    
    for (const accountId of accountIds) {
      const balance = balances.get(accountId) || 0;
      await this.eventBus.publish({
        eventId: crypto.randomUUID(),
        timestamp: new Date(),
        eventType: 'BalanceProjected',
        accountId,
        newBalance: balance,
        currency: 'USD' // Would fetch from COA in a full implementation
      } as any);
    }
  }
}
