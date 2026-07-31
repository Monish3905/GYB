import { JournalEntry } from '@payment-os/journal';
import { ChartOfAccounts } from '@payment-os/chart-of-accounts';

export class BalanceProjector {
  constructor(private coa: ChartOfAccounts) {}

  public projectBalances(journals: JournalEntry[]): Map<string, number> {
    const balances = new Map<string, number>();

    // Ensuring ordered playback
    const sortedJournals = [...journals].sort((a, b) => a.ledgerSequence! - b.ledgerSequence!);

    for (const journal of sortedJournals) {
      if (journal.status !== 'POSTED') continue;

      for (const posting of journal.postings) {
        const currentBalance = balances.get(posting.accountId) || 0;
        const account = this.coa.getAccount(posting.accountId);
        
        if (!account) continue;

        // Assets and Expenses increase on Debit. Liabilities, Equity, Revenue increase on Credit.
        let newBalance = currentBalance;
        
        if (account.type === 'ASSET' || account.type === 'EXPENSE') {
          newBalance += posting.direction === 'DEBIT' ? posting.amount : -posting.amount;
        } else {
          newBalance += posting.direction === 'CREDIT' ? posting.amount : -posting.amount;
        }

        balances.set(posting.accountId, newBalance);
      }
    }

    return balances;
  }
}
