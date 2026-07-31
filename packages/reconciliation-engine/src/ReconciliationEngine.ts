import { Ledger } from '@payment-os/ledger';
import { IEventBus } from '@payment-os/events';

export type ReconStatus = 'MATCHED' | 'PARTIALLY_MATCHED' | 'UNMATCHED' | 'EXCEPTION';

export interface ReconRecord {
  reconId: string;
  externalRefId: string; // From settlement or execution
  internalJournalId?: string;
  status: ReconStatus;
  discrepancyAmount: number;
}

export class ReconciliationEngine {
  private reconRecords: Map<string, ReconRecord> = new Map();

  constructor(
    private ledger: Ledger,
    private eventBus: IEventBus
  ) {}

  public async reconcileExecutionCandidates(candidates: any[]): Promise<void> {
    const reconId = crypto.randomUUID();
    let matchedCount = 0;
    let exceptionCount = 0;

    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'ReconciliationStarted',
      reconciliationId: reconId
    } as any);

    const allJournals = this.ledger.getAllJournals();

    for (const candidate of candidates) {
      // Very basic matching by executionId
      const matchedJournal = allJournals.find(j => j.executionId === candidate.executionId);
      
      const record: ReconRecord = {
        reconId,
        externalRefId: candidate.executionId,
        internalJournalId: matchedJournal?.journalId,
        status: matchedJournal ? 'MATCHED' : 'UNMATCHED',
        discrepancyAmount: 0 // Mock implementation
      };

      if (record.status === 'MATCHED') matchedCount++;
      else exceptionCount++;

      this.reconRecords.set(candidate.executionId, record);
    }

    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'ReconciliationCompleted',
      reconciliationId: reconId,
      matchedCount,
      exceptionCount
    } as any);
  }

  public getExceptions(): ReconRecord[] {
    return Array.from(this.reconRecords.values()).filter(r => r.status !== 'MATCHED');
  }
}
