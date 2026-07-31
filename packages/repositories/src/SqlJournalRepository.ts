import { JournalEntry } from '@payment-os/journal';
import { IDatabase } from '@payment-os/database';
import { IUnitOfWork } from '@payment-os/unit-of-work';

export class SqlJournalRepository {
  constructor(private db: IDatabase) {}

  public async save(journal: JournalEntry, uow?: IUnitOfWork): Promise<void> {
    const conn = uow ? uow.getConnection() : this.db;
    
    // Convert to raw SQL mapping (simplified for implementation example)
    const sql = `
      INSERT INTO JournalEntries (
        journal_id, ledger_sequence, status, currency, timestamp, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const params = [
      journal.journalId,
      journal.ledgerSequence,
      journal.status,
      journal.currency,
      journal.timestamp,
      journal.createdBy
    ];

    await conn.execute(sql, params);
    
    // Also save postings in same transaction
    for (const posting of journal.postings) {
      await conn.execute(`
        INSERT INTO JournalPostings (
          posting_id, journal_id, account_id, direction, amount, currency
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        posting.postingId,
        journal.journalId,
        posting.accountId,
        posting.direction,
        posting.amount,
        posting.currency
      ]);
    }
  }
}
