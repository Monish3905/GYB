export interface DLQRecord {
  dlqId: string;
  eventId: string;
  originalPayload: string;
  failureReason: string;
  failedAt: Date;
}

export class DLQManager {
  private dlq: Map<string, DLQRecord> = new Map();

  public async moveToDLQ(record: any, reason: string): Promise<void> {
    const dlqId = crypto.randomUUID();
    
    // In reality this writes to Postgres DB DLQ table
    this.dlq.set(dlqId, {
      dlqId,
      eventId: record.event_id,
      originalPayload: record.payload,
      failureReason: reason,
      failedAt: new Date()
    });

    console.log(`[DLQ] Event ${record.event_id} moved to DLQ. Reason: ${reason}`);
  }

  public getDLQRecords(): DLQRecord[] {
    return Array.from(this.dlq.values());
  }

  public async replayDLQMessage(dlqId: string): Promise<void> {
    // Moves back to outbox or directly publishes
  }
}
