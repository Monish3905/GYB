import { IEventBus } from '@payment-os/events';

export interface DeadLetterRecord {
  dlqId: string;
  executionId: string;
  settlementInstructionId: string;
  failureReason: string;
  retryCount: number;
  provider?: string;
  timestamp: Date;
  recoveryHint?: string;
  recoveryState: 'PENDING' | 'RECOVERED' | 'MANUAL_INTERVENTION_REQUIRED';
}

export class DeadLetterQueue {
  private queue: Map<string, DeadLetterRecord> = new Map();

  constructor(private eventBus: IEventBus) {}

  public async push(record: Omit<DeadLetterRecord, 'dlqId' | 'timestamp' | 'recoveryState'>): Promise<string> {
    const dlqId = crypto.randomUUID();
    
    const fullRecord: DeadLetterRecord = {
      ...record,
      dlqId,
      timestamp: new Date(),
      recoveryState: 'PENDING'
    };

    this.queue.set(dlqId, fullRecord);

    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'DeadLetterCreated',
      executionId: record.executionId
    } as any);

    return dlqId;
  }

  public getRecords(): DeadLetterRecord[] {
    return Array.from(this.queue.values());
  }

  public markRecovered(dlqId: string): void {
    const record = this.queue.get(dlqId);
    if (record) {
      record.recoveryState = 'RECOVERED';
    }
  }
}
