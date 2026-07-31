import { JournalEntry, JournalStatus } from '@payment-os/journal';
import { ChartOfAccounts } from '@payment-os/chart-of-accounts';
import { Ledger } from '@payment-os/ledger';
import { IEventBus } from '@payment-os/events';
import { PeriodManager } from '@payment-os/period-close';

export class PostingEngine {
  constructor(
    private coa: ChartOfAccounts,
    private ledger: Ledger,
    private eventBus: IEventBus,
    private periodManager: PeriodManager
  ) {}

  public async validateAndPost(entry: JournalEntry): Promise<JournalEntry> {
    try {
      // 1. Validate Period
      if (this.periodManager.isPeriodClosed(entry.timestamp)) {
        throw new Error("Cannot post to a closed period.");
      }

      // 2. Validate Accounts
      let totalDebits = 0;
      let totalCredits = 0;

      for (const posting of entry.postings) {
        const account = this.coa.getAccount(posting.accountId);
        if (!account) {
          throw new Error(`Account ${posting.accountId} not found in COA.`);
        }
        if (account.status !== 'ACTIVE') {
          throw new Error(`Account ${posting.accountId} is ${account.status}.`);
        }
        if (posting.currency !== account.currency) {
          // Multi-currency handling would go here, enforcing FX spread accounts
          throw new Error(`Currency mismatch for account ${posting.accountId}. Expected ${account.currency}, got ${posting.currency}`);
        }

        if (posting.direction === 'DEBIT') totalDebits += posting.amount;
        if (posting.direction === 'CREDIT') totalCredits += posting.amount;
      }

      // 3. Validate Double Entry
      // Use epsilon for float comparison
      if (Math.abs(totalDebits - totalCredits) > 0.000001) {
        throw new Error(`Journal unbalanced. Debits: ${totalDebits}, Credits: ${totalCredits}`);
      }

      // 4. Mark Validated
      entry.status = 'VALIDATED';
      await this.eventBus.publish({
        eventId: crypto.randomUUID(),
        timestamp: new Date(),
        eventType: 'JournalValidated',
        journalId: entry.journalId
      } as any);

      // 5. Commit to Ledger
      return await this.ledger.appendJournal(entry);

    } catch (error: any) {
      entry.status = 'REJECTED';
      await this.eventBus.publish({
        eventId: crypto.randomUUID(),
        timestamp: new Date(),
        eventType: 'JournalRejected',
        journalId: entry.journalId,
        reason: error.message
      } as any);
      throw error;
    }
  }
}
