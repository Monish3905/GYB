import { JournalEntry } from '@payment-os/journal';
import { IEventBus } from '@payment-os/events';

export class Ledger {
  // Append-only data store
  private journals: JournalEntry[] = [];
  
  // Sequence trackers
  private currentLedgerSequence: number = 0;
  private currentPostingSequence: number = 0;

  constructor(private eventBus: IEventBus) {}

  public async appendJournal(entry: JournalEntry): Promise<JournalEntry> {
    if (entry.status !== 'VALIDATED') {
      throw new Error(`Cannot append journal ${entry.journalId} in state ${entry.status}. Must be VALIDATED.`);
    }

    this.currentLedgerSequence++;
    
    const finalizedEntry: JournalEntry = {
      ...entry,
      ledgerSequence: this.currentLedgerSequence,
      status: 'POSTED',
      postings: entry.postings.map(p => ({
        ...p,
        sequenceNumber: ++this.currentPostingSequence
      }))
    };

    // Immutability enforced in memory via Object.freeze, in DB via strict insert-only
    this.journals.push(Object.freeze(finalizedEntry) as JournalEntry);

    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'JournalPosted',
      journalId: finalizedEntry.journalId,
      ledgerSequence: finalizedEntry.ledgerSequence
    } as any);

    return finalizedEntry;
  }

  public getJournal(journalId: string): JournalEntry | undefined {
    return this.journals.find(j => j.journalId === journalId);
  }

  public getAllJournals(): JournalEntry[] {
    return [...this.journals]; // Return copy
  }

  public getJournalsAfter(sequenceNumber: number): JournalEntry[] {
    return this.journals.filter(j => j.ledgerSequence! > sequenceNumber);
  }
}
