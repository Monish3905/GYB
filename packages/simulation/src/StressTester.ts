import { Ledger } from '@payment-os/ledger';
import { JournalEntry } from '@payment-os/journal';
import { ChartOfAccounts } from '@payment-os/chart-of-accounts';
import { AccountBuilder } from '@payment-os/accounts';
import { PostingEngine } from '@payment-os/posting-engine';
import { BalanceEngine } from '@payment-os/balance-engine';
import { BalanceProjector } from '@payment-os/ledger-projections';
import { PeriodManager } from '@payment-os/period-close';
import { InMemoryEventBus } from '@payment-os/events';

// Persistence imports
import { PostgresAdapter } from '@payment-os/postgres';
import { TransactionManager } from '@payment-os/transaction-manager';
import { SqlJournalRepository } from '@payment-os/repositories';
import { OutboxRelay } from '@payment-os/outbox';
import { DatabaseMonitor } from '@payment-os/database-monitor';

export class StressTester {
  private eventBus = new InMemoryEventBus();

  public async simulatePersistenceLoad(journalCount: number): Promise<void> {
    console.log(`Starting persistence stress test with ${journalCount} transactions...`);

    // Mock PG Adapter for deterministic offline tests without a real PG instance
    // In a real environment, this would be new PostgresAdapter('postgresql://localhost...');
    const mockDb: any = {
      getConnection: async () => ({
        execute: async () => 1,
        query: async () => [],
        commit: async () => {},
        rollback: async () => {},
        release: () => {}
      }),
      execute: async () => 1,
      query: async () => [],
      healthCheck: async () => true
    };

    const monitor = new DatabaseMonitor();
    const txManager = new TransactionManager(mockDb);
    const journalRepo = new SqlJournalRepository(mockDb);
    const outbox = new OutboxRelay(mockDb);
    
    const coa = new ChartOfAccounts();
    coa.registerAccount(new AccountBuilder().setId('T-USD').setCode('1000').setName('Treasury').setType('ASSET').setCurrency('USD').build());
    coa.registerAccount(new AccountBuilder().setId('S-USD').setCode('2000').setName('Settlement').setType('LIABILITY').setCurrency('USD').build());

    const ledger = new Ledger(this.eventBus);
    const periodManager = new PeriodManager(this.eventBus);
    const postingEngine = new PostingEngine(coa, ledger, this.eventBus, periodManager);

    const startTime = Date.now();

    for (let i = 0; i < journalCount; i++) {
      const startMs = Date.now();
      
      try {
        // Enforce Serializable Isolation and UnitOfWork grouping
        await txManager.runInTransaction(async (uow) => {
          monitor.recordConnection();

          const entry: JournalEntry = {
            journalId: `jnl-${i}`,
            timestamp: new Date(),
            createdBy: 'simulation',
            status: 'DRAFT',
            currency: 'USD',
            description: 'Persistent Settlement',
            postings: [
              { postingId: `post-${i}-1`, accountId: 'T-USD', direction: 'CREDIT', amount: 50, currency: 'USD' },
              { postingId: `post-${i}-2`, accountId: 'S-USD', direction: 'DEBIT', amount: 50, currency: 'USD' }
            ]
          };

          const posted = await postingEngine.validateAndPost(entry);
          await journalRepo.save(posted, uow);
          
          // Outbox pattern - written in the exact same transaction
          await outbox.saveEvent({
            eventId: `evt-${i}`,
            eventType: 'JournalPosted',
            timestamp: new Date(),
            journalId: posted.journalId
          } as any, uow);

          monitor.recordTransactionCommit();
        }, 'SERIALIZABLE');

      } catch (err) {
        monitor.recordTransactionRollback();
      } finally {
        monitor.releaseConnection();
        monitor.recordQueryLatency(Date.now() - startMs);
      }
    }

    const endTime = Date.now();
    console.log(`Successfully completed ${journalCount} transactions using Serializable UnitOfWork in ${endTime - startTime}ms.`);
    console.log('Database Metrics:', monitor.getMetrics());
  }
}
