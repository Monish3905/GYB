import { IEventBus } from '@payment-os/events';

export interface AuditRecord {
  auditId: string;
  who: string;
  what: string;
  why: string;
  when: Date;
  correlationId?: string;
  executionId?: string;
  settlementId?: string;
}

export class AuditTrail {
  private records: Map<string, AuditRecord> = new Map();

  constructor(private eventBus: IEventBus) {}

  public async logEvent(
    who: string,
    what: string,
    why: string,
    correlationId?: string,
    executionId?: string,
    settlementId?: string
  ): Promise<string> {
    const auditId = crypto.randomUUID();
    const record: AuditRecord = {
      auditId,
      who,
      what,
      why,
      when: new Date(),
      correlationId,
      executionId,
      settlementId
    };

    // Store append-only in memory
    this.records.set(auditId, record);

    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'AuditRecordCreated',
      auditId
    } as any);

    return auditId;
  }

  public getTrail(correlationId: string): AuditRecord[] {
    return Array.from(this.records.values()).filter(r => r.correlationId === correlationId);
  }
}
